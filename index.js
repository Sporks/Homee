var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');







app.use(express.static(path.join(__dirname, './client')));


app.listen(process.env.PORT || 3000, function(){
  console.log('Server is lisening on port 3000');
});
