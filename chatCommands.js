'use strict'
var dbController = require('./dbController');

var token = "EAASI7Ir9omABAJjzbuKBY53QZB1POlZBfgFDtQrWGjQStusgSDvpELCZCWSl3ZCG6aqsQmZAHjMD4wBM9xoA3e1mj9W3OJoZCj1JhNpt6aaxb72BP0ZCQSG2RRk2t4yucVAQxFpzsKZBduueZBDgm04uHU4JnIZAhnES90RnFatmLniAZDZD";
var request = require('request');

var chat = {};
// chat.sendTextMessage = sendTextMessage;
var questions =  [{"q": "What room can we help you with?",
                        "answers": ["Living Room", "Bedroom", "Office",
                                    "Dining Room", "Outdoor"],
                        "field": "room"},
                  {"q": "How would you describe your style?",
                        "answers": ["Modern", "Traditional", "Industrial",
                                    "Eclectic", "Contemporary"],
                        "field": "style"},
                  {"q": "What is your budget?",
                        "answers": ['$500 and under', '$500 - $1000', '$1000 - $3000',
                                    '$3000 - $5000', 'Over $5000'],
                        "field": "budget"},
                  {"q": "When do you need your furniture by? Please enter a number of weeks",
                        "answers": ["0 - 1 Weeks", "1-2 Weeks", "3-4 Weeks",
                                    "1 Month or more"],
                        "field": "timeLine"},
                  {"q": "Can you send us some pictures of your space?",
                        "field": "image"},
                  {"q": "Do you have any special requests or additional information?",
                        "field": "specialReqs"}
                ];


chat.verify = function(req, res, qAnsd, field){
  //Lowercase user answer for ease of matching and remove spaces
  let ans = req.info.text.toLowerCase();
  let ansArray = [];
  questions[qAnsd-1].answers.forEach(function(val){
    //Put all to lowercase for ease of matching with answers provided by user
    ansArray.push(val.toLowerCase());
  });
  if(ansArray.indexOf(ans) === -1){
    console.log(ansArray, ans)
    chat.sendTextMessage(req.info.sender, "Incorrect response, please choose from the available options");
    chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd-1));
    return false;
  }
  else{
    chat.sendTextMessage(req.info.sender, "Great, that's good to know!");
    chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd));
    //Update the db with the properly capitalized answer
    req.info.db[field] = questions[qAnsd-1].answers[ansArray.indexOf(ans)];
    return true;
  }
};

chat.createQuestion = function(qAnsd){
  return questions[qAnsd].q+"\nOptions are: "+questions[qAnsd].answers.join(", ");
};

chat.askQuestions = function(req, res, next){
  let qAnsd = req.info.db.questsAnsd;
  //Make it easy to dynamically update the field, but only if the first questions been asked
  let field;
  if(qAnsd > 0){
    field = questions[qAnsd-1].field;
  }
  else{
    field = "room";
  }
  switch(qAnsd){
    case 0:
      chat.sendTextMessage(req.info.sender, "Hello and welcome to Homee! "+chat.createQuestion(qAnsd));
      req.info.db.questsAnsd++;
      break;
    //verify answer from last question
    case 1:
    case 2:
      if(chat.verify(req, res, qAnsd, field)){
        req.info.db.questsAnsd++;
      }
      break;
    case 3:
      //See if we can typecast to a number but first remove the $ from the front
      var budget = req.info.text;
      if(budget.charAt(0) === "$"){
        budget.slice(1);
      }
      if(budget*1){
        //Make sure its more than 0
        if(budget <= 500 && budget > 0){
          req.info.db.budget = '$500 and under';
        }
        else if(budget <= 1000 && budget > 500){
          req.info.db.budget = '$500 - $1000';
        }
        else if(budget <= 3000 && budget > 1000){
          req.info.db.budget = '$1000 - $3000';
        }
        else if(budget <= 5000 && budget > 3000){
          req.info.db.budget = '$3000 - $5000';
        }
        else if(budget > 5000){
          req.info.db.budget = 'Over $5000';
        }
        else{
          chat.sendTextMessage(req.info.sender, "That is not a valid number ");
          chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd-1));
          break;
        }
        req.info.db.questsAnsd++;
        chat.sendTextMessage(req.info.sender, "Great, that's good to know!");
        chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd));
      }
      else if(chat.verify(req, res, qAnsd)){
              req.info.db.budget = req.info.text;
              req.info.db.questsAnsd++;
      }
      //if it's not a number run further analysis
      break;
    case 4:
    //Figure out how long
      var timeLine = req.info.text.replace(/(week)|(weeks)/gi, "").replace(/\s/g, "");
      console.log(timeLine)
      //Check if it was a number they entered
      // if(timeLine*1){
      //   if(timeline >= 1)
      //   if(timeline >= 1)
      //   if(timeline >= 1)
      //   if(timeline >= 1)

      // }


  }
  console.log(qAnsd, "questions answered");
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
};

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
