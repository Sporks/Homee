'use strict'
const Update = require('./updateModel');


module.exports = {
  getInfo: function(req, res, next){
    //Initialize req.info to store data
    console.log("OK");
    let messaging_events = req.body.entry[0].messaging;
    req.info = {};
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i];
      req.info.sender = event.sender.id;
      // req.sender = event.sender.id;
      if (event.message && event.message.text) {
        req.info.text = event.message.text;
        var query = Update.where({user: req.info.sender, archived: false});
        //Search for document we saved to continue asking questions;
        query.findOne(function(err, foundOne){
          if(err){
            console.log("ERROR ERROR     ", err);
          }
          //IF we can't find the document, add it to the database and continue
          if(!foundOne){
            let created = Date.now();
            let update = new Update({ user: req.info.sender,
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
                        console.log (`${req.info.sender} - date:${created} has been added to the database.`);
                    }
            }).then(function(update){
              //Add to header for use with questions
              req.info.db = update;
              next();
            });
          }
          //If we find it, add it to the header for use with questions
          else if(foundOne){
            console.log("SUP found");
            req.info.db = foundOne;
            next();
          }
        });
      }
/*************************************************
*****IF NO TEXT IS RECIEVED, GET OUT OF LOOP******
**************************************************/
      else{
        res.end();
      }
    }
  },

  updateInfo: function(info, resolve, reject){
    var query = Update.where({user: info.sender, archived: false});
    var newInfo = info.db.toObject();
    query.findOneAndUpdate( newInfo, function(err, newInfo){
      if(err) {
        console.log(err);
        reject("DB Error"+err);
      }
      else{
        console.log("NewInfo ");
        resolve("Resolved");
      }
    });
  }
};
