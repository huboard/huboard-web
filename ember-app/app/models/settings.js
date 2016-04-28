import Ember from 'ember';

function attr(defaultValue) {
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
function getStore(name){
    try {
      if (name in window && typeof window[name] === 'object') {
        return window[name];
      }
    } catch (e) {
    }

    return  {
      fake: true,
      getItem() {},
      setItem() {}
    };
}

var name = 'localStorage';
var store = getStore(name);
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
    var storage = store.getItem(`${name}:${this.get("storageKey")}`);
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

    var data = this.loadData();

    data[this.get('dataKey')] = this.get("data");

    store.setItem(`${name}:${this.get("storageKey")}`, JSON.stringify(data));
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
    return !store.fake;
  }.property("")
});

export default Settings;
