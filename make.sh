sh compile.sh

rm -rf bin/META-INF
cp -r src/META-INF bin/META-INF

rm debugger.jar
pushd bin
zip -r ../debugger.jar .
popd