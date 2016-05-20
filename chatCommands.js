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
                        "answers": ["0 - 1 Weeks", "1 - 2 Weeks", "3 - 4 Weeks",
                                    "1 Month or more"],
                        "field": "timeLine"},
                  {"q": "Can you send us some pictures of your space?",
                        "field": "image"},
                  {"q": "Do you have any special requests or additional information?",
                        "field": "specialReqs"}
                ];


chat.verify = function(req, res, qAnsd, field){
  //Lowercase user answer for ease of matching and remove spaces
  let ans = req.info.text.toLowerCase().replace(/\s/gi, "");
  let ansArray = [];
  questions[qAnsd-1].answers.forEach(function(val){
    //Put all to lowercase for ease of matching with answers provided by user and remove spaces
    ansArray.push(val.toLowerCase().replace(/\s/gi, ""));
  });
  if(ansArray.indexOf(ans) === -1){
    chat.sendTextMessage(req.info.sender, "Incorrect response, please choose from the available options");
    chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd-1));
    return false;
  }
  else{
    //Promisify to always get text in the same order
    let promise = new Promise(function(resolve, reject){
      chat.sendTextMessage(req.info.sender, "Great, that's good to know!");
      resolve("Resolve");
    });
    promise.then((val)=>chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd)));
    //Update the db with the properly capitalized answer
    req.info.db[field] = questions[qAnsd-1].answers[ansArray.indexOf(ans)];
    return true;
  }
};

chat.createQuestion = function(qAnsd){
  console.log(questions[qAnsd].q)
  if(questions[qAnsd].answers)
    return questions[qAnsd].q+"\nOptions are: "+questions[qAnsd].answers.join(", ");
  else {
    return questions[qAnsd].q;
  }
};

chat.askQuestions = function(req, res, next){
  let qAnsd = req.info.db.questsAnsd;
  //Make it easy to dynamically update the field, but only if the first questions been asked
  let field;
  if(qAnsd > 0 && qAnsd < 7){
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
          //Promisify to always get text in the same order
          let promise = new Promise(function(resolve, reject){
            chat.sendTextMessage(req.info.sender, "That is an invalid number");
            resolve("Resolve");
          });
          promise.then((val)=>chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd-1)));
          break;
        }
        req.info.db.questsAnsd++;
        //Promisify to always get text in the same order
        let promise = new Promise(function(resolve, reject){
          chat.sendTextMessage(req.info.sender, "Great, that's good to know!");
          resolve("Resolve");
        });
        promise.then((val)=>chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd)));
      }
      else if(chat.verify(req, res, qAnsd, field)){
              req.info.db.questsAnsd++;
      }
      //if it's not a number run further analysis
      break;
    case 4:
    //Figure out how long
      var timeLine = req.info.text.replace(/weeks|week/gi, "").replace(/\s/g, "");
      //If it has month in the string, we can assume it's 1 month or more
      if(timeLine.match(/months|month/gi)){
        console.log("Months");
        req.info.db.timeLine = '1 Month or more';
        //Promisify to always get text in the same order
        let promise = new Promise(function(resolve, reject){
          chat.sendTextMessage(req.info.sender, "Great, that's good to know!");
          resolve("Resolve");
        });
        promise.then((val)=>chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd)));
        break;
      }
      //Check if it was a number they entered
      else if(timeLine*1){
        console.log("ok ");
        if(timeLine < 1 && timeLine >= 0)
          req.info.db.timeLine = '0 - 1 Weeks';
        else if(timeLine <= 2 && timeLine >= 1)
          req.info.db.timeLine = '1 - 2 Weeks';
        else if(timeLine <= 4 && timeLine > 2)
          req.info.db.timeLine = '2 - 4 Weeks';
        else if(timeLine > 4)
          req.info.db.timeLine = '1 Month or more';
        else{
          let promise = new Promise(function(resolve, reject){
            chat.sendTextMessage(req.info.sender, "That is not a valid number of weeks");
            resolve("Resolve");
          });
          promise.then((val)=>chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd-1)));
          break;
        }
        req.info.db.questsAnsd++;
        //Promisify to always get text in the same order
        let promise = new Promise(function(resolve, reject){
          chat.sendTextMessage(req.info.sender, "Great, that's good to know!");
          resolve("Resolve");
        });
        promise.then((val)=>chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd)));
      }
      //if none of the above check to see that they put a range in that matches
      else if(chat.verify(req, res, qAnsd, field)){
        req.info.db.questsAnsd++;
      }
      break;
    case 5:
    //Make sure they upload a proper picture
      if(!req.info.attachments){
        // console.log(req.info.attachments.type, req.info.attachments);
        chat.sendTextMessage(req.info.sender, "Please upload a valid image");
        break;
      }
      if(req.info.attachments[0].type === 'image'){
        req.info.db.image = req.info.attachments[0].payload.url;
        chat.sendTextMessage(req.info.sender, "Great! Thanks for the picture");
        chat.sendTextMessage(req.info.sender, chat.createQuestion(qAnsd));
        req.info.db.questsAnsd++;
      }
      else{
        console.log(req.info.attachments[0].type, req.info.attachments[0]);
        chat.sendTextMessage(req.info.sender, "Please upload a valid image");
        break;
      }
      break;
    case 6:
      req.info.db.specialReqs = req.info.text;
      chat.sendTextMessage(req.info.sender, "Thank you very much!  We have archived your responses to view in the future.\n If you would like to view your responses please type 'yes' or visit https://homeebot.herokuapp.com/"+req.info.sender);
      req.info.db.questsAnsd++;
      req.info.db.archived = true;
      break;
    case 7:
      console.log(req.info.text);
      chat.sendTextMessage(req.info.sender, "Thank you very much!  We have archived your responses to view in the future.\n If you would like to view your responses please type 'yes'");
      if(req.info.text.toLowerCase() === "yes"){
        chat.sendStructuredMessage(req);
        next();
      }
      else{
        next();
      }
  }
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

//Add a way for the user to review their responses using the generic message template
chat.sendStructuredMessage = function(req) {
  var messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Your responses",
          "subtitle": "Room: "+req.info.db.room,
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  }
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
