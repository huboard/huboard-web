import Ember from 'ember';

var MilestonesView = Ember.View.extend({
  classNameBindings: ["dragging:board-dragging:board-not-dragging"],
  dragging: false,
  setupDragging: function(){
    var that = this;
    this.$(".board").sortable({
      handle: 'h3',
      placeholder: "milestone-placeholder",
      axis: "x",
      items: ".milestone:gt(0)",
      delay: 75,
      over: function () {
        that.set("isHovering", true);
      },
      out: function () {
        that.set("isHovering", false);
      },
      start: function(){
        that.set('dragging', true);
      },
      stop: function() {
        that.set('dragging', false);
      },
      update: function (ev, ui) {

        var findViewData = function (element){
          return that.get("controller.registeredColumns").find(function(el){
            return el.$().is(element);
          });
        };

        var elements = Ember.$(".milestone:not(.no-milestone)", that.$()),
        index = elements.index(ui.item);

        if(index === -1) { return; }

        var first = index === 0,
        last = index === elements.size() - 1,
        currentElement = Ember.$(ui.item),
        currentData = findViewData(currentElement),
        beforeElement = elements.get(index ? index - 1 : index),
        beforeData = findViewData(beforeElement),
        afterElement = elements.get(elements.size() - 1 > index ? index + 1 : index),
        afterData = findViewData(afterElement),
        before = beforeData.get("model.milestone._data.order") || beforeData.get("model.milestone.number"),
        after = afterData.get("model.milestone._data.order") || afterData.get("model.milestone.number");

        var milestone = currentData.get("model.milestone");
        if(first && last) {
          milestone.moved(milestone.get("number"));
          return;
        }
        
        if(first) {
          milestone.moved((after || 1)/2);
          // dragged it to the top

        } else if (last) {
          // dragged to the bottom
          milestone.moved((before + 1));

        }  else {
          milestone.moved((((after + before) || 1)/2));
        }
      }
    });

  }.on("didInsertElement"),
});

export default MilestonesView;
