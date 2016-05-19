'use strict'
var dbController = require('./dbController');

var token = "EAASI7Ir9omABAJjzbuKBY53QZB1POlZBfgFDtQrWGjQStusgSDvpELCZCWSl3ZCG6aqsQmZAHjMD4wBM9xoA3e1mj9W3OJoZCj1JhNpt6aaxb72BP0ZCQSG2RRk2t4yucVAQxFpzsKZBduueZBDgm04uHU4JnIZAhnES90RnFatmLniAZDZD";
var request = require('request');

var chat = {};
// chat.sendTextMessage = sendTextMessage;
var questions ={  "q1": {"q": "Hello and welcome to Homee!  What room can we help you with?",
                        "answers": ["Living Room", "Bedroom", "Office",
                                    "Dining Room", "Outdoor"]},
                  "q2": {"q": "What is your budget?",
                        "answers": ["$500 and under", "­$500 ­- $1000","$1000 - $3000",
                                    "$3000 - $5000","Over $5000"]},
                  "q3": {"q": "When do you need your furniture by?",
                        "answers": ["0 - 1 Weeks", "1-2 Weeks", "3-4 Weeks",
                                    "1 Month or more"]},
                  "q4": {"q": "How would you describe your style?",
                        "answers": ["Modern", "Traditional", "Industrial",
                                    "Eclectic", "Contemporary"]},
                  "q5": {"q": "Can you send us some pictures of your space?"},
                  "q6": {"q": "Do you have any special requests or additional information?"}
                };


chat.questions = function(req, res){

}


chat.askQuestions = function(req, res, next){
  switch(req.info.db.questsAnsd){
    case 0:
       chat.sendTextMessage(req.info.sender, questions.q1.q+"Options are: "+questions.q1.answers.join(", "));
       break;
  }
  // var messageData = {
  //   text: req.info.text
  // };
  //Promisify updating the database
  var p1 = new Promise((resolve, reject)=>{
    //REMEMBER TO RESOLVE PROMISES!
    dbController.updateInfo(req.info, resolve, reject);
    // console.log(resolve, reject);
    });
  p1.then(function(val){
    next();
  }).catch((val)=>{
      console.log("Promise rejected: ", val);
      next();
  });
}

chat.sendTextMessage = function(sender, text) {
  var messageData = {
    text:text
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

module.exports = chat;
