import Ember from 'ember';

var BoardSyncingService = Ember.Service.extend({

  //Sync Notifier
  flashMessages: Ember.inject.service(),
  syncFlashNotifier: function(){
    if(this.get('syncInProgress')){
      this.get('flashMessages').add(this.messageData());
    } else {
      var flash = this.get('flashMessages.queue').find((flash)=>{
        return flash.identifier === 'sync-message';
      });
      if(!flash){ return; }
      Ember.set(flash.progress, 'status', false);
    }
  }.observes('syncInProgress'),
  messageData: function(){
    return {
      message: 'syncing your board, please wait...',
      sticky: true,
      type: 'progress',
      identifier: 'sync-message',
      progress: {
        status: true,
        callback: function(){
          setTimeout(()=>{
            this.set('message', 'sync complete!');
            this.get('flash')._setTimer('timer', 'destroyMessage', 2000);
          }, 1000);
        }
      }
    };
  },

  //Issue Syncing
  syncIssues: function(board, opts){
    if(this.get('syncInProgress') || !board){ return; }

    var _self = this;
    _self.set('syncInProgress', true);

    board.fetchIssues(opts).then((issues)=>{
      _self.issueSuccess(board, issues);
      _self.set('syncInProgress', false);
    }, ()=>{
      _self.issueFail();
      _self.set('syncInProgress', false);
    });
  },
  issueSuccess: function(board, issues){
    if(!issues.length){ return; }
    Ember.run.once(()=>{
      board.get('issues').forEach((issue)=>{
        issues.forEach((i)=>{
          if(i.id === issue.get('id')){
            Ember.set(issue, 'data', i);
          }
        });
      });
    });
  },
  issueFail: function(){
    var flash = this.get('flashMessages.queue').find((flash)=>{
      return flash.identifier === 'sync-message';
    });
    if(!flash){ return; }
    flash.progress.callback = function(){
      setTimeout(()=>{
        this.set('flash.type', 'warning');
        this.set('message', 'unable to sync your board, try refreshing');
        this.set('flash.sticky', true);
      }, 1000);
    };
  }
});

export default BoardSyncingService;
