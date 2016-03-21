ddoc = { _id:'_design/Users', views: {}};

ddoc.views.findById = {
  map: function(doc) {
    if(doc.meta.type === "user") {
      emit(doc.user.id, doc);
    }
  }
}

module.exports = ddoc;
