import Ember from 'ember';

var BoardSyncingService = Ember.Service.extend({

  //Sync Notifier
  flashMessages: Ember.inject.service(),
  syncFlashNotifier: function(){
    if(this.get('syncInProgress')){
      this.get('flashMessages').add(this.messageData);
    } else {
      var message = this.messageData.message;
      var flash = this.get('flashMessages.queue').find((flash)=>{
        return flash.message === message;
      });
      Ember.set(flash.progress, 'status', false);
    }
  }.observes('syncInProgress'),
  messageData: {
    message: 'syncing your board, please wait...',
    sticky: true,
    type: 'info',
    progress: {
      status: true,
      callback: function(){
        this.set('message', 'sync complete!');
        this.get('flash')._setTimer('timer', 'destroyMessage', 3000);
      }
    }
  },

  //Issue Syncing
  syncIssues: function(board, opts){
    var _self = this;
    _self.set('syncInProgress', true);

    board.fetchIssues(opts).then((issues)=>{
      _self.issueSuccess(board, issues);
      _self.set('syncInProgress', false);
    }, (error)=>{
      _self.issueFail();
      _self.set('syncInProgress', false);
    });
  },
  issueSuccess: function(board, issues){
    Ember.run.once(()=>{
      board.get('issues').forEach((issue)=>{
        issues.forEach((i)=>{
          if(i.id === issue.id){
            Ember.set(issue, 'data', i.data);
          };
        });
      });
    });
  },
  issueFail: function(error){
  
  }
});

export default BoardSyncingService;