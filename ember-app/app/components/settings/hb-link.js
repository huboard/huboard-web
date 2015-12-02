import Ember from 'ember';
import Board from 'app/models/new/board';

var HbLinkComponent = Ember.Component.extend({
  tagName: 'li',
  classNameBindings: ["isLinked:hb-state-link:hb-state-unlink"],
  classNames: ["hb-widget-link"],
  isLinked: function(){
    return this.get("parent.board.columns.length") === this.get("link.board.columns.length");
  }.property("parent.board.columns.[]", 'link.board', "link.board.columns.[]"),
  isDisabled: false,
  issueFilters: function(){
    var issue_filter = this.get("link.data.issue_filter");
    return this.get("link.data.other_labels").filter((l) => {
      return issue_filter.any((filter) => {
        return filter === l.name;
      });
    });
  }.property("link.data.issue_filter", "link.data.other_labels"),
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
        success: function(response) {
          component.get('link').load().then((repo) => {
            component.set('isDisabled', false);
            if(repo.get('isLoaded') && !repo.get('loadFailed')){
              var board = Board.create({ repo: repo})
              repo.set('board', board);
            }
          })
        }
      })
    }
  }
});

export default HbLinkComponent;
