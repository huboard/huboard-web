import Ember from 'ember';
import Model from '../model';

var Milestone = Model.extend({
  blacklist: ["board", "repo"],
  order: Ember.computed.alias("data._data.order"),
  apiUrl: function(){
    var full_name = this.get("repo.data.repo.full_name");
    return `/api/${full_name}/milestones/${this.get("data.number")}`;
  }.property("data.number", "repo.data.repo.full_name"),

  //Bulk updates all the milestones in the column using patch
  update: function(column){
    var _self = this;
    var promises = column.get("milestones").invoke("patch", _self);
    return Ember.RSVP.all(promises).then((milestones) => {
      milestones.forEach((m) => {
        column.get("issues").filter((i)=>{
          return i.data.milestone && i.data.milestone.id === m.get('id');
        }).setEach("data.milestone", m.data);
      });
    });
  },
  //If milestone is defined, PUTs the details of the passed in MS
  patch: function(milestone){
    milestone = milestone ? milestone : this;
    var _self = this;
    return Ember.$.ajax( {
      url: `${_self.get("apiUrl")}`,
      data: JSON.stringify({milestone: milestone.serialize(), correlationId: this.get("correlationId") }),
      dataType: 'json',
      type: "PUT",
      contentType: "application/json"}).then(function(response){
        return _self.setProperties({
          title: response.title,
          description: response.description,
          due_on: response.due_on
        });
    });
  },
  moved: function(index){
    var _self = this;
    return Ember.$.ajax({
      url: `${_self.get("apiUrl")}/reorder`,
      type: "POST",
      data: {
        number: _self.get("number"),
        index: index,
        correlationId: _self.get("correlationId")
      },
      success: function(response) {
        Ember.run.once(()=>{
          _self.set("description", response.description);
          _self.set("_data.order", index);
        });
      }
    });
  }
});

export default Milestone;

