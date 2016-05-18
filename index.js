var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');



app.use(express.static(path.join(__dirname, './client')));

app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'this_is_my_token') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
})

app.listen(process.env.PORT || 3000, function(){
  console.log('Server is lisening on port 3000');
});
