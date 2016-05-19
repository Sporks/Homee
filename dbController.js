'use strict'
const Update = require('./updateModel');


module.exports = {
  getInfo: function(req, res, next){
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
      event = req.body.entry[0].messaging[i];
      // sender = event.sender.id;
      req.sender = event.sender.id;
      let query = Update.where({user: req.sender});
      query.findOne({},{},{ sort: { 'createdAt' : -1 } }, function(err, foundOne){
        if(err){
          console.log(err);
        }
        if(foundOne){
          console.log(foundOne);
        }
      });
    }
    console.log(req.sender);
    next();
  }
};
