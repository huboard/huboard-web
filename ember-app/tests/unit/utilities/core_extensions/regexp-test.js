import {
  module,
  test
} from "qunit";

var sut;
module("RegExp Extensions", {
  setup: function(){
    sut = new RegExp();
  }
});

//Escape Special characters on a string (like ruby RegExp.replace)
test("replace", (assert) =>{
  var chars = ["+", "-"];
  var string = "+-";

  var result = sut.replace(string);
  var expected = "\\+\\-";

  assert.equal(result, expected);
});
