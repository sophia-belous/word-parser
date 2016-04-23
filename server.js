var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    multer  = require('multer'),
    crypto = require('crypto')
    path = require('path');

var port = process.env.PORT || 56789;

app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true })); 

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(5, function (err, raw) {
            if (err) return cb(err);

        cb(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});

app.use(multer({    
    storage: storage
}).single('file'));

app.use(methodOverride('X-HTTP-Method-Override')); 
app.use(express.static(__dirname + '/public'));

require('./app/routes')(app);

app.listen(port); 
console.log('Magic happens on port ' + port);

exports = module.exports = app;     