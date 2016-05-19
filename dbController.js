'use strict'
const Update = require('./updateModel');


module.exports = {
  getInfo: function(req, res, next){
  let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i];
      req.sender = event.sender.id;
      var query = Update.where({user: req.sender});
      query.findOne({},{},{ sort: { 'createdAt' : -1 } }, function(err, foundOne){
        if(err){
          console.log("ERROR ERROR     ", err);
          next();
        }
        if(!foundOne){
          console.log("NOT FOUND    ", foundOne);
          let created = Date.now();
          let update = new Update({ user: req.sender,
                                    createdAt: created,
                                    questsAnsd: 0,
                                    archived: false
                                  });
          update.save( function(err, update){
                  if(err) {
                      console.error(err);
                  }
                  else {
                      console.log (`${req.sender} - date:${created} has been added to the database.`);
                  }
          }).then(function(update){
            console.log(update);
            req.update = update;
            next();
            
          });
        }
        else if(foundOne){
          console.log("SUP found");
          next();
        }
      });
    }
    // console.log(req.sender);
    // next();
  }
};
