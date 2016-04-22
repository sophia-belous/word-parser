var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

var port = process.env.PORT || 56789;

app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(methodOverride('X-HTTP-Method-Override')); 
app.use(express.static(__dirname + '/public'));

require('./app/routes')(app);

app.listen(port); 
console.log('Magic happens on port ' + port);

exports = module.exports = app;     