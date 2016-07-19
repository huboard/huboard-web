import Ember from 'ember';

var HbMarkdownComposerComponent = Ember.Component.extend({
  classNames: ["markdown-composer"],
  classNameBindings: ["uploading:hb-state-uploading", "uploadsEnabled"],
  acceptedTypes: {
    "image/png": true,
    "image/gif": true,
    "image/jpeg": true,
    "image/svg" : true,
    "image/svg+xml": true
  },
  uploadsEnabled: Ember.computed("repo", {
    get: function(){
      switch(HUBOARD_ENV.FEATURES.IMAGE_STORE){
        case "aws":
          return HUBOARD_ENV.FEATURES.IMAGE_UPLOADS;
        case "github":
          return this.get('repo.isCollaborator');
        default:
          return HUBOARD_ENV.FEATURES.IMAGE_UPLOADS;
      }
    }
  }),
  files: [],
  uploadFile: function(file){
    var component = this,
    holder = this.$();

    if(file.size > HUBOARD_ENV.FEATURES.IMAGE_MAX_SIZE) {
      alert("Yowza, that file is too big");
      return;
    }

    this.set('uploading', true);

    var uploadRequestUrl = `/api/${this.get('repo.data.repo.full_name')}/uploads/signature`;

    Ember.$.post(uploadRequestUrl)
    .then(function(response){
      response = response.uploader;
      var fd = new FormData();
      fd.append('utf8', '✓');
      fd.append('key', response.key);
      fd.append('acl', response.acl);
      fd.append('Content-Type', file.type);
      fd.append('AWSAccessKeyId', response.aws_access_key_id);
      fd.append('policy', response.policy);
      fd.append('signature', response.signature);
      fd.append('success_action_status', "201");
      fd.append('file', file);

      var request = new XMLHttpRequest();
      request.addEventListener('readystatechange', function(){
        if(request.readyState === 4) {

          var $xml = Ember.$(request.responseXML),
          location = $xml.find("Location").text(),
          key = $xml.find("Key").text();

          var imgMarkdown = "\n![" + key + "]("+ location + ")\n";
          component.set("markdown", (component.get("markdown") || "") + imgMarkdown);
          holder.find("textarea").focus().val(holder.find("textarea").val());
          component.set('uploading', false);
        }
      });

      request.open('POST', response.upload_url, true);
      request.send(fd);
    });
  },
  wireUp: function(){
    if(!this.get("uploadsEnabled")) {
      return;
    }
    var component = this;
    this.$("input[type='file']").on("change.huboard", function(){
      if(this.files != null && this.files.length) {
        _.each(this.files,function(file) {
          if(component.get("acceptedTypes")[file.type] === true) {
            component.uploadFile(file);
          }
        });
      }
    });

    this.$().on('paste', function(ev){
      if(ev.originalEvent.clipboardData.items.length) {
        _.each(ev.originalEvent.clipboardData.items, function(item) {
          if(component.get("acceptedTypes")[item.type] === true) {
            component.uploadFile(item.getAsFile());
          }
        });
      }
    });
  }.on('didInsertElement'),
  tearDown: function(){
    if(!this.get("uploadsEnabled")) {
      return;
    }
    this.$("input[type='file']").off("change.huboard");
    this.$().off('paste');
  }.on('willDestroyElement'),
  drop: function(ev) {
    if(!this.get("uploadsEnabled")) {
      return;
    }
    if(ev.stopPropagation) {
      ev.stopPropagation();
    }
    ev.preventDefault();
    if(ev.dataTransfer.files.length){
      var component = this;

      _.each(ev.dataTransfer.files,function(file) {
        if(component.get("acceptedTypes")[file.type] === true) {
          component.uploadFile(file);
        }
      });
    }
  }
});

export default HbMarkdownComposerComponent;
