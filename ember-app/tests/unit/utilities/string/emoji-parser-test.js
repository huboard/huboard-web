import emojiParser from "app/utilities/string/emoji-parser";

import {
  module,
  test
} from "qunit";

var sut;
module("emojiParser", {
  setup: function(){
    window.EMOJIS = EMOJIS;
    sut = emojiParser;
  }
});

var EMOJIS = {
  "huboard": "https://huboardemoji.com",
  "github": "https://githubemoji.com",
  100: "https://100emoji.com"
};


test("Parses emoji into img tags", (assert) =>{
  var template = sut._template;
  var huboard = template(EMOJIS["huboard"]);
  var github = template(EMOJIS["github"]);
  var hundred = template(EMOJIS[100]);

  var target = "HuBoard is :huboard::100:, Github is :github: :100:"
  var part1 = `HuBoard is ${huboard}${hundred}, `;
  var part2 = `Github is ${github} ${hundred}`;

  var result = sut.parse(target);
  assert.equal(result, (part1 + part2));
});
