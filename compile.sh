echo -sourcepath src -d bin > javac-args.ignore
find src -name *.java >> javac-args.ignore
mkdir -p bin
javac @javac-args.ignore
