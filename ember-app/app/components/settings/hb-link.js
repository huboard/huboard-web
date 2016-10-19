import Ember from 'ember';
import Board from 'huboard-app/models/new/board';

var HbLinkComponent = Ember.Component.extend({
  tagName: 'li',
  classNameBindings: ["isLinked:hb-state-link:hb-state-unlink"],
  classNames: ["hb-widget-link"],
  isLinked: function(){
    return this.get("parent.board.columns.length") === this.get("link.board.columns.length");
  }.property("parent.board.columns.[]", 'link.board', "link.board.columns.[]"),
  copyDisabled: function(){
    return !this.get("isLinked") && this.get('link.board') != null;
  }.property("link.board", "isLinked"),
  buttonDisabled: function(){
    return this.get("isDisabled") || this.get("copyDisabled");
  }.property("isDisabled", "copyDisabled"),
  isDisabled: false,
  issueFiltersLabels: function(){
    var issue_filter = this.get("link.data.issue_filter");
    return this.get("link.data.other_labels").filter((l) => {
      return issue_filter ? issue_filter.any((filter) => {
        return filter === l.name;
      }) : false;
    });
  }.property("link.data.issue_filter", "link.data.other_labels"),
  issueFilters: function(){
    return this.get("issueFiltersLabels").map((link)=> {
      return link.name;
    });
  }.property("issueFiltersLabels.[]"),
  labelsChanged: function(){
    if(_.isEqual(this.get("link.data.issue_filter"), this.get("issueFilters"))){
      return;
    }

    this.set("link.data.issue_filter", this.get("issueFilters"));
    var repo = this.get("link.board.repo");

    var _self = this;
    this.set("isProcessing", true);
    repo.parent.updateLink(this.get("link")).then(()=> {
      _self.set("isProcessing", false);
    });
  },
  didInsertElement: function(){
    var _self = this;
    this.$(".hb-selector-component").on("selectorClosed", ()=>{
      _self.labelsChanged();
    });
  },
  actions: {
    remove: function(link) {
      var rawLink = this.get('settings.data.links').find((x) => {
        return Ember.get(x,'repo.full_name') === Ember.get(link, 'data.repo.full_name');
      });
      this.get("settings.data.links").removeObject(rawLink);
      Ember.$.ajax({
        url: "/api/"+ this.get('settings.data.repo.full_name') + "/links",
        data: {
          link: link.get('repo.color.name')
        },
        type: 'DELETE',

      });
    },
    copy: function(){

      var component = this,
        apiUrl = "/api/" + this.get("link.data.repo.full_name") + "/columns";

      component.set('isDisabled', true);

      Ember.$.ajax({
        url: apiUrl,
        dataType: 'json',
        contentType: 'application/json',
        type: 'PUT',
        data: JSON.stringify({
          columns: this.get("labels").mapBy('data')
        }),
        success: function() {
          component.get('link').load().then((repo) => {
            component.set('isDisabled', false);
            if(repo.get('isLoaded') && !repo.get('loadFailed')){
              var board = Board.create({ repo: repo});
              repo.set('board', board);
            }
          });
        }
      });
    },
  }
});

export default HbLinkComponent;
