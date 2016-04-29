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

function storage(name, dataKey, defaults) {
  var store = getStore(name);
  return Ember.Object.extend({
    init: function (){
      this._super.apply(this, arguments);
      this.set('store', store);
      this.set('name', name);
      this.set("data", this.loadData()[this.get('dataKey')] || {});
    },
    data: {},
    loadData: function () {
      var storage = this.get('store').getItem(`${name}:${this.get("storageKey")}`);
      return storage ? JSON.parse(storage) : {};
    },
    storageKey: Ember.computed.alias("repo.repo.full_name"),
    dataKey: dataKey,
    changed: 0,
    saveKey: function(key, value) {
      this.set("data." + key, value);
      this.saveData();
    },
    saveData: function() {

      var data = this.loadData();

      data[this.get('dataKey')] = this.get("data");

      this.get('store').setItem(`${name}:${this.get("storageKey")}`, JSON.stringify(data));
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
      return !this.get('store').fake;
    }.property("")
  }, defaults || {});
}

var Settings = storage('localStorage', 'settings', {
    metaEnterEnabled: attr(true),
    enterEnabled: attr(false),
    showColumnCounts: attr(false),
});
var Session = storage('sessionStorage', 'session');

export { Settings, Session };
