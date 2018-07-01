(function(){
	var minecraftData = {};

	var debugUtils = shell.loadLib("debugUtils");
	
	var URL = Java.type("java.net.URL");
	var InputStreamReader = Java.type("java.io.InputStreamReader");
	var StringBuilder = Java.type("java.lang.StringBuilder");
	var charArray = Java.type("char[]");
	var ZipInputStream = Java.type("java.util.zip.ZipInputStream");
	var byteArray = Java.type("byte[]");
	var javaString = Java.type("java.lang.String");
	
	var versionCache = null;

	minecraftData.updateVersionsCache = function() {
		var versionURL = new URL("http://export.mcpbot.bspk.rs/versions.json");
		var versionConnection = versionURL.openConnection();
		var reader = new InputStreamReader(versionConnection.getInputStream());
		var charBuffer = new charArray(1024);
		var builder = new StringBuilder();
		var charsRead;
		while ( (charsRead = reader.read(charBuffer)) >= 0 ) {
			builder.append(charBuffer, 0, charsRead);
		}
		reader.close();

		versionCache = JSON.parse(builder.toString());
	}

	minecraftData.getVersions = function() {
		if ( versionCache == null ) {
			minecraftData.updateVersionsCache();
		}
		return versionCache;
	}

	var infosCache = {};

	// based on https://github.com/bspkrs/MCPMappingViewer/
	minecraftData.updateInfosCache = function(minecraftVersion) {
		var versionURL = new URL("http://export.mcpbot.bspk.rs/versions.json");
		var versionConnection = versionURL.openConnection();
		var reader = new InputStreamReader(versionConnection.getInputStream());
		var charBuffer = new charArray(1024);
		var builder = new StringBuilder();
		var charsRead;
		while ( (charsRead = reader.read(charBuffer)) >= 0 ) {
			builder.append(charBuffer, 0, charsRead);
		}
		reader.close();
		
		var channel = "stable";

		var versions = minecraftData.getVersions()[minecraftVersion][channel].slice().sort()
		var version = versions[versions.length-1];
		
		var mappingURL = new URL("http://export.mcpbot.bspk.rs/mcp_" + channel + "/" + version + "-" + minecraftVersion + "/mcp_" + channel + "-" + version + "-" + minecraftVersion + ".zip");
		var mappingConnection = mappingURL.openConnection();
		var mappingZipStream = new ZipInputStream(mappingConnection.getInputStream());
		
		var zipEntry;
		var result = {
			forward: {}, // contains srg -> entry
			backward: {}, // contains name -> entry
			params: {}, // contains srg method parameter -> entry
		}
		while ( (zipEntry = mappingZipStream.getNextEntry()) != null ) {
			if ( ! zipEntry.getName().endsWith(".csv") ) {
				continue;
			}
			var byteBuffer = new byteArray(1024);
			var stringBuilder = new StringBuilder();
			var pos = 0;
			while ( pos < zipEntry.getSize() ) {
					var countRead = mappingZipStream.read(byteBuffer);
					stringBuilder.append(new javaString(byteBuffer, 0, countRead));
					pos += countRead;
			}
			var str = stringBuilder.toString();
			var strChars = str.split("");
			var lines = [[]];
			var curSegment = "";
			var inQuoted = false;
			for ( var i = 0; i < str.length; i++ ) {
				if ( strChars[i] == '"' ) {
					if ( curSegment.length <= 0 ) {
						inQuoted = true;
					} else if ( i+1 < strChars.length && strChars[i+1] == '"' ) {
						curSegment += '"';
						i++;
					} else {
							inQuoted = false;
					}
				} else if ( strChars[i] == "," && ! inQuoted ) {
					lines[lines.length-1].push(curSegment);
					curSegment = "";
				} else if ( strChars[i] == "\r" && i+1 < strChars.length && strChars[i+1] == "\n" && !inQuoted ) {
					lines[lines.length-1].push(curSegment);
					curSegment = "";
					lines.push([]);
					i++;
				} else {
					curSegment += strChars[i];
				}
			}
			for ( var i = 1; i < lines.length; i++ ) { // first line is header
				var line = lines[i];
				var entry = {};
				for ( var j = 0; j < lines[0].length; j++ ) {
					entry[lines[0][j]] = line[j];
				}
				if ( zipEntry.getName() == "fields.csv" || zipEntry.getName() == "methods.csv" ) {
					result.forward[entry.searge] = entry;
					if ( ! (entry.name in result.backward) ) {
						result.backward[entry.name] = [];
					}
					result.backward[entry.name].push(entry);
				} else if ( zipEntry.getName() == "params.csv" ) {
					if ( ! (entry.param in result.params) ) {
						result.params[entry.param] = entry;
					}
				}
			}
		}
		mappingZipStream.close();
		infosCache[minecraftVersions] = result;
	}

	minecraftData.getInfos = function(minecraftVersion) {
		if ( !(minecraftVersion in infosCache) ) {
			minecraftdata.updateInfosCache(minecraftVersion);
		}
		return infosCache[minecraftVersion];
	}

	return minecraftData;
});