import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    saveAdditionalInfo(model) {
      this.set("processing", true);
      return Ember.$.ajax({
        url: "/settings/profile/" + model.get("login") + "/additionalInfo",
        type: "PUT",
        data: {
          additional_info: model.get("history.additional_info")
        },
        success: (response) => {
          this.set("processing", false);
          return response;
        },
        error: (response) => {
          this.set("processing", false);
          return response;
        }
      });
    }
  }
});
