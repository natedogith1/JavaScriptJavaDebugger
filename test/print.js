/*var b = {
  val: "abc",
  run: function() {
    print(this.val);
  }
}
var a = new (Java.extend(java.lang.Runnable))(b);
a.run()
print(args);
print(b.val);*/
/*print(new java.lang.String("").);
print(typeof "");*/
var runObject = {
  run: function() {
    print("abc");
  }
}
var a = new java.lang.Runnable(runObject);
runObject.run = function(){
  print("def");
}
a.run();
runObject.run();