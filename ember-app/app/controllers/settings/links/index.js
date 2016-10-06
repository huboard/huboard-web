import Ember from 'ember';
import { debouncedObserver } from 'huboard-app/utilities/observers';

var SettingsLinksIndexController = Ember.Controller.extend({
  links: Ember.inject.controller('settings/links'),
  repoFullName: '',
  isDisabled: true,
  issue_filter: [],
  labels: [],
  labelChooserEnabled: false,
  shouldDisplayWarning: Ember.computed.alias("links.shouldDisplayWarning"),
  shouldDisplayError: false,
  errorMessage: '',
  resetForm: function(){
    this.set("isDisabled", false);
    this.set("shouldDisplayError", false);
    this.set("errorMessage", "");
    this.set("repoFullName", "");
    this.set("contraints", []);
  },
  errorHandler: function(resp){
    this.set("shouldDisplayError", true);
    try {
      var response = JSON.parse(resp.jqXHR.responseText);
      this.set("errorMessage", response.message);
    } catch(err) {
      this.set("errorMessage", "Could Not Link Board: Unspecified Error");
    }
  },
  validation: debouncedObserver(function(){
    this.set("shouldDisplayError", false);
    this.set("isDisabled", true);
    this.set("labels", []);

    if(this.get("repoFullName.length") === 0){ return; }
    this.send("validate");
  }, "repoFullName", 1000),
  actions: {
    submit: function(){
      var _self = this;
      var name = this.get("repoFullName");
      var model = this.get("model.repo");
      this.set("isDisabled", true);

      model.createLink(name, _self.get("issue_filter")).then(()=> {
        _self.resetForm();
      }, (jqXHR)=> _self.errorHandler(jqXHR) );
    },
    validate: function(){
      var _self = this;
      var name = this.get("repoFullName");
      var model = this.get("model.repo");

      model.validateLink(name).then((link)=>{
        _self.set("isDisabled", false);
        _self.set("labels", link.other_labels);
      }, (jqXHR)=> _self.errorHandler(jqXHR) );
    },
  }
});

export default SettingsLinksIndexController;
