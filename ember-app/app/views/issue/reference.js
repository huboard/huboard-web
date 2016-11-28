import Ember from 'ember';
import emojiParser from "huboard-app/utilities/string/emoji-parser";

var IssueReferenceView = Ember.View.extend({
  classNameBindings: [":issue-reference-info", "isLoaded:hb-loaded:ui-blur"],
  isProcessing: false,
  isLoaded: false,
  commit: null,
  commitUrl: Ember.computed.alias("commit.html_url"),
  message: function(){
    var message = this.get("commit.commit.message") || "",
        newline = message.indexOf('\n');

    if (newline > 0) {
      message = message.substring(0, newline);
    }
    message = message.trim();

    if (!message) { return ""; }

    message = Ember.Handlebars.Utils.escapeExpression(message);
    message = emojiParser.parse(message);
    return message.htmlSafe();
  }.property("commit.commit.message"),
  shortSha: function(){
    if (this.get("commit") === null){
      return "";
    }
    return this.get("commit.sha").substr(0,7);
  }.property("commit.sha"),
  didInsertElement: function(){
    this.set("model", this.get("parentView.model"));
    if (this.get("model.commit_id") === null){
      return this.set("parentView.isVisible", false);
    }

    var self = this;
    var container = this.$().closest(".card-event");
    container.hover(function(){
      if (self.get("commit") === null) {
        self.fetchCommit();
      }
    });
  },
  willDestroyElement: function(){
    var container = this.$().closest(".card-event");
    container.off('hover');
  },
  fetchCommit: function(){
    if(this.get("isProcessing")){
      return;
    }
    this.set("isProcessing", true);
    var self = this;
    var commit = this.get("controller.model");
    this.get("controller").fetchCommit(commit)
      .then(function(commit){
        self.set('isLoaded', true);
        self.set("isProcessing", false);
        self.set("commit", commit);
      }, function(){
        self.set("isProcessing", false);
      });
  }
});

export default IssueReferenceView;
