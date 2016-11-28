import Settings, { attr } from 'huboard-app/models/settings';

var Global = Settings.extend({
  storageKey: 'global',
  expandLabels: attr(false)
});

export default Global;
