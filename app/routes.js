var path = require('path'),
    config = require('./config.json')
    fs = require('fs');

module.exports = function(app) {    
    
    app.get('/api/workers', function(req, res) {
        res.json(config);
	});
    
    app.post('/api/words', function(req, res) {
        var data = req.body.data;
        console.log(data.words);
        for( var i = 0; i < data.words.length; i++) {
            (function(i) {
                var fileName = data.words[i].status == 0 ? 'invalidWords.txt' : 'validWords.txt';
                fs.appendFile('./results/' + fileName, data.words[i].word + ' ', function (err) {
                    if (err) {
                        res.json(err);
                    }
                    if (i === data.words.length - 1) {
                        res.json({ status : 'success'});       
                    }
                });
                
            })(i);
            
        }
    });
    
    app.get('*', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public/views/')});
    });
};