import emojiParser from "huboard-app/utilities/string/emoji-parser";

import {
  module,
  test
} from "qunit";

var sut;
module("emojiParser", {
  setup: function(){
    window.EMOJIS = EMOJIS;
    sut = emojiParser;
    sut.height = 16;
  }
});

var EMOJIS = {
  "huboard": "https://huboardemoji.com",
  "github": "https://githubemoji.com",
  100: "https://100emoji.com",
  "+1": "https://thumbsup.com"
};


test("Parses emoji into img tags", (assert) =>{
  var template = sut._template;
  var huboard = template.call(sut, EMOJIS["huboard"]);
  var github = template.call(sut, EMOJIS["github"]);
  var hundred = template.call(sut, EMOJIS[100]);
  var thumbs = template.call(sut, EMOJIS["+1"]);

  var target = "HuBoard is :huboard::100:, Github is :github: :100::+1:";
  var part1 = `HuBoard is ${huboard}${hundred}, `;
  var part2 = `Github is ${github} ${hundred}${thumbs}`;

  var result = sut.parse(target);
  assert.equal(result, (part1 + part2));
});

test("Emoji height is adjustable", (assert) =>{
  var target = ":huboard:";
  var expected = "<img style='height:10px;' src='https://huboardemoji.com'></img>";

  var result = sut.parse(target, 10);
  assert.equal(result, expected);
});

test("Returns the original string if nothing matches", (assert) =>{
  var target = "No Emojis here!";

  var result = sut.parse(target);
  assert.equal(result, target);
});

test("Does nothing with unsupported matches", (assert) =>{
  var target = "This is a :fake: emoji";

  var result = sut.parse(target);
  assert.equal(result, target);
});
