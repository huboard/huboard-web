import Ember from 'ember';

var CardLabelsVisitor = Ember.Object.create({
  visit: function(card){
    if(card.get('isFiltered')){ return }
    var labels = card.get('cardLabels');
    labels = this.checkForFilteredLabels(card, labels);

    card.set('visibleLabels', labels);
  },


  //If the labels match any label filters, display those labels instead
  checkForFilteredLabels: function(card, labels){
    var labelFilters = card.get("filters.labelFilters").filter((filter)=>{
      return filter.mode > 0
    });
    if(labelFilters.length){
      return labels.filter((label) => {
        return labelFilters.isAny("name", label.name);
      });
    }
    return labels;
  },

  //Compact the amount of visible labels to prevent overflow on the card
  compactVisibleLabels: function(card, labels){
    var maxCharCount = this.maxCharCount(card);
    var count = 0;
    return labels.filter((label)=>{
      count += label.name.length;
      return count < maxCharCount;
    });
  },
  maxCharCount: function(card){
    var width = card.$().width();
    return width / (this.fontSize - 1);
  },
  fontSize: 12
});

export default CardLabelsVisitor;
