import Ember from 'ember';

export function attr(defaultValue) {
  return Ember.computed('data', {
    get: function(key){
      return this.get("data." + key) === undefined ? defaultValue : this.get("data." + key);
    },
    set: function(key, value){
      this.saveKey(key, value);
      return value;
    }
  });
}
var Settings = Ember.Object.extend({
  init: function (){
    this._super.apply(this, arguments);
    this.set("data", this.loadData()[this.get('dataKey')] || {});
  },
  metaEnterEnabled: attr(true),
  enterEnabled: attr(false),
  showColumnCounts: attr(false),
  data: {},
  loadData: function () {
    var storage = localStorage.getItem("localStorage:" + this.get("storageKey"));
    return storage ? JSON.parse(storage) : {};
  },
  storageKey: Ember.computed.alias("repo.repo.full_name"),
  dataKey: 'settings',
  changed: 0,
  saveKey: function(key, value) {
    this.set("data." + key, value);
    this.saveData();
  },
  saveData: function() {

    var localStorageData = this.loadData();

    localStorageData[this.get('dataKey')] = this.get("data");

    localStorage.setItem("localStorage:" + this.get("storageKey"), JSON.stringify(localStorageData));
    this.incrementProperty('changed');
  },
  setUnknownProperty: function(key, value) {
    Ember.defineProperty(this, key, attr(false));
    this.set(key, value);
  },
  unknownProperty: function(key) {
    return this.get("data." + key);
  },
  available: function(){
    try {
      return 'localStorage' in window &&
        window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }.property("")
});

export default Settings;
