sh compile.sh

if [ -e bin/META-IN ]
then
    rm -rf bin/META-INF
    cp -r src/META-INF bin/META-INF
fi

if [ -e debugger.jar ]
then
    rm debugger.jar
fi
#pushd bin
cd bin
zip -r ../debugger.jar .
#popd
