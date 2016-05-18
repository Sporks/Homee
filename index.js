var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');



app.use(express.static(path.join(__dirname, './client')));

/******************************************
 *******************************************
 *******************************************
 **************WEBHOOK STUFF****************
 *******************************************
 *******************************************
 *******************************************/
app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === 'this_is_my_token') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook/', function(req, res) {
  console.log(req);
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      // Handle a text message from this sender
      console.log(text);
    }
  }
  res.sendStatus(200);
});


app.listen(process.env.PORT || 3000, function() {
  console.log('Server is lisening on port 3000');
});
