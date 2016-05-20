'use strict'
var dbController = require('./dbController');

var token = "EAASI7Ir9omABAJjzbuKBY53QZB1POlZBfgFDtQrWGjQStusgSDvpELCZCWSl3ZCG6aqsQmZAHjMD4wBM9xoA3e1mj9W3OJoZCj1JhNpt6aaxb72BP0ZCQSG2RRk2t4yucVAQxFpzsKZBduueZBDgm04uHU4JnIZAhnES90RnFatmLniAZDZD";
var request = require('request');

var chat = {};
// chat.sendTextMessage = sendTextMessage;
var questions =  [{"q": "What room can we help you with?",
                        "answers": ["Living Room", "Bedroom", "Office",
                                    "Dining Room", "Outdoor"]},
                  {"q": "What is your budget?",
                        "answers": ["$500 and under", "­$500 ­- $1000", "$1000 - $3000",
                                    "$3000 - $5000", "Over $5000"]},
                  {"q": "When do you need your furniture by?",
                        "answers": ["0 - 1 Weeks", "1-2 Weeks", "3-4 Weeks",
                                    "1 Month or more"]},
                  {"q": "How would you describe your style?",
                        "answers": ["Modern", "Traditional", "Industrial",
                                    "Eclectic", "Contemporary"]},
                  {"q": "Can you send us some pictures of your space?"},
                  {"q": "Do you have any special requests or additional information?"}
                ];


chat.verify = function(req, res, qAnsd){
  //Lowercase user answer for ease of matching
  let ans = req.info.text.toLowerCase();
  let ansArray = [];
  questions[qAnsd].answers.forEach(function(val){
    //Put all to lowercase for ease of matching with answers provided by user
    ansArray.push(val.toLowerCase());
  });
  if(ansArray.indexOf(ans) === -1){
    chat.sendTextMessage(req.info.sender, "Incorrect response, please choose from the available options");
    chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd-1));
    return false;
  }
  else{
    chat.sendTextMessage(req.info.sender, "Great, that's good to know!");
    chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd));
    return true;
  }
};

chat.createQuestion = function(qAnsd){
  return questions[qAnsd].q+"\nOptions are: "+questions[qAnsd].answers.join(", ");
};

chat.askQuestions = function(req, res, next){
  let qAnsd = req.info.db.questsAnsd;
  switch(qAnsd){
    case 0:
      chat.sendTextMessage(req.info.sender, "Hello and welcome to Homee! "+chat.createQuestion(qAnsd));
      req.info.db.questsAnsd++;
      break;
    case 1:
      if(chat.verify(req, res, qAnsd-1)){
        req.info.db.room = req.info.text;
        req.info.db.questsAnsd++;
      }
      break;

  }
  console.log(qAnsd, "questions answered")
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
    console.log("Finishing");
    res.end();
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
