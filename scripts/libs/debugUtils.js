(function(){
  debugUtils={};

  var instrumentation = inst;
  
  //because sometimes we need to recurse downwards
  debugUtils.findClass=function(name){
    var clazz=instrumentation.getAllLoadedClasses();
    for(i in clazz){
      if(clazz[i].getName()==name){
        return clazz[i]
      }
    }
  }

  debugUtils.arrayIterator=function(arr){
    this.arr=arr
    this.index=0
    this.hasNext=function(){
      return this.index<this.arr.length;
    }
    this.next=function(){
      return arr[this.index++];
    }
  }

  debugUtils.enumerationIterator=function(en){
    this.hasNext=en.hasMoreElements;
    this.next=en.nextElement
  }

  debugUtils.testForMethod=function(clazz,name){
    try{
      if(clazz.getMethod(name)){
        return true;
      }
    }catch(e){
      if ( e instanceof java.lang.NoSuchMethodException )
        return false;
      else
        throw e;
    }
  }

  //easy selection and iteration
  debugUtils.findInside=function(inside, checkFunction){
    if(!inside) return;
      var it;
      if(Array.isArray(inside)) {
          it=new debugUtils.arrayIterator(inside);
      } else {
          //var clazz=debugUtils.findClass(inside.getClass().getName());
          var clazz=inside.getClass();
          if(debugUtils.testForMethod(clazz,"hasNext")){
              it=inside;
          }else if(debugUtils.testForMethod(clazz,"hasMoreElements")){
              it=new debugUtils.enumerationIterator(inside);
          }else if(debugUtils.testForMethod(clazz,"iterator")){
              it=inside.iterator();
          }else if(inside.length){
              it=new debugUtils.arrayIterator(inside);
          }else{
              return;
          }
      }
    var ret;
    while(it.hasNext()){
      ret=checkFunction(it.next());
      if(ret) return ret;
    }
  }

  //because JavaAdapter doesn't accept Java classes
  /*debugUtils.toNativeJavaClass=function(clazz){
    return new Packages.org.mozilla.javascript.NativeJavaClass(Packages.org.mozilla.javascript.tools.shell.Main.getGlobal(),clazz);
  }*/

  debugUtils.optimal=function(list, valuesFunction){
      var optimals = [];
      debugUtils.findInside(list,function(item){
          var val = valuesFunction(item);
          var shouldAddFinal = true
          for(var i = 0; i < optimals.length; i++) {
              var shouldKeep = false;
              var isEqual = true;
              var shouldAdd = false;
              for(var j = 1; j < val.length; j++) {
                  isEqual &= optimals[i][j] == val[j];
                  shouldKeep |= optimals[i][j] > val[j];
                  shouldAdd |= val[j] > optimals[i][j];
              }
              if(!shouldKeep && !isEqual) {
                  optimals.splice(i,1);
                  i--;
              }
              shouldAddFinal &= shouldAdd | isEqual;
          }
          if(shouldAddFinal) {
              optimals[optimals.length] = val;
          }
      })
      return optimals
  }
  
  return debugUtils;
})();