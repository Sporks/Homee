const Update = require('./updateModel');


module.exports = {
  getInfo: function(req, res, next){
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
      event = req.body.entry[0].messaging[i];
      // sender = event.sender.id;
      req.sender = event.sender.id;
    }
    console.log(req.sender);
    next();
  }
};
