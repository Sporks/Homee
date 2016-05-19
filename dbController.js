'use strict'
const Update = require('./updateModel');


module.exports = {
  getInfo: function(req, res, next){
  let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i];

      //Save information in header for use with middleware.
      req.info.sender = event.sender.id;
      if (event.message && event.message.text) {
        req.info.text = event.message.text;
      }
      var query = Update.where({user: req.info.sender, archived: false});
      //Search for document we saved to continue asking questions;
      query.findOne({},{},{ sort: { 'createdAt' : -1 } }, function(err, foundOne){
        if(err){
          console.log("ERROR ERROR     ", err);
        }
        //IF we can't find the document, add it to the database and continue
        if(!foundOne){
          let created = Date.now();
          let update = new Update({ user: req.sender,
                                    createdAt: created,
                                    questsAnsd: 0,
                                    archived: false
                                  });
          //Save the document to the database
          update.save( function(err, update){
                  if(err) {
                      console.error(err);
                  }
                  else {
                      console.log (`${req.sender} - date:${created} has been added to the database.`);
                  }
          }).then(function(update){
            //Add to header for use with questions
            req.info.db = update;
            next();

          });
        }
        //If we find it, add it to the header for use with questions
        else if(foundOne){
          console.log("SUP found", foundOne);
          req.info.db = foundOne;
          next();
        }
      });
    }
  },
  updateInfo: function(req, res){
    var query = Update.where({user: req.info.sender, archived: false});
    query.findOneAndUpdate( req.info.db, function(err, newInfo){
      if(err) console.log(err);
      else{
        console.log("NewInfo ", newInfo);
      }
    });
  }
};
