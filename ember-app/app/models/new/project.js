import Ember from 'ember';
import Model from '../model';
import ProjectColumn from './project-column';

var Project = Model.extend({
  columns: Ember.computed('data.columns', {
    get: function(){
      var project = this;
      return this.get('data.columns').map((c) =>{
        return ProjectColumn.create({ data: c, project: this })
      });
    }
  })
});

export default Project;
