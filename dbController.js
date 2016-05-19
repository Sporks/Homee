'use strict'
const Update = require('./updateModel');


module.exports = {
  getInfo: function(req, res, next){
  let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i];
      // sender = event.sender.id;
      req.sender = event.sender.id;
      var query = Update.where({user: req.sender});
      query.findOne({},{},{ sort: { 'createdAt' : -1 } }, function(err, foundOne){
        if(err){
          console.log("ERROR ERROR     ", err);
        }
        if(foundOne){
          console.log("FOUND FOUND    ", foundOne);
        }
      });
    }
    // console.log(req.sender);
    next();
  }
};
