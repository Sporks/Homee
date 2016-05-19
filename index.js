const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const chat = require('./chatCommands.js');
const dbController = require( './dbController' );
const mongoose = require('mongoose');

mongoose.connect( 'mongodb://homee:homee@ds025802.mlab.com:25802/homee-bot' );
const db = mongoose.connection;


//Need to parse body with bodyparser to JSON
var jsonParser = bodyParser.json();

app.use(express.static(path.join(__dirname, './client')));

/******************************************
 **************DB CONNECTION****************
 *******************************************/
db.on( 'error', console.error.bind( console, 'connection error:' ) );
db.once( 'open', function () {
	console.log( "your db is open" );
} );



/******************************************
 **************WEBHOOK STUFF****************
 *******************************************/
app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === 'this_is_my_token') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook/', jsonParser, function(req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    // req.sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      // if (text === 'Generic') {
      //   chat.sendGenericMessage(sender);
      //   continue;
      // }
      chat.sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
      // chat.sendTextMessage(sender, "Text received, echo: "+ req.sender);
    }
  }
  res.sendStatus(200);
});


app.listen(process.env.PORT || 3000, function() {
  console.log('Server is lisening on port 3000');
});
