'use strict'

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

app.post('/webhook/', jsonParser, dbController.getInfo, chat.askQuestions, function(req, res) {
  res.sendStatus(200);
  console.log("DONE ");
});

app.get('*', jsonParser, dbController.returnInfo, function(req, res){
	res.send(req.userData);
	
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Server is lisening on port 3000');
});
