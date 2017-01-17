if ( typeof print2Counter === "undefined" )
  print2Counter = 0;
else
  print2Counter++;
function(args) {
  print(print2Counter);
  print(args);
}