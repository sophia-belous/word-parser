var path = require('path'),
    config = require('./config.json')
    fs = require('fs');

module.exports = function(app) {    
    
    app.get('/api/workers', function(req, res) {
        res.json(config);
	});
    
    app.post('/api/words', function(req, res) {
        var vWords = req.body.data.words
                                    .filter((obj) => obj.status == 1)
                                    .map((obj) => obj.word)
                                    .join(' ');
        
        var invWords = req.body.data.words
                                    .filter((obj) => obj.status == 0)
                                    .map((obj) => obj.word)
                                    .join(' ');
        
        fs.appendFile('./results/invalidWords.txt', invWords + ' ', function (err) {
            if (err) res.json(err); 
            
            fs.appendFile('./results/validWords.txt', vWords + ' ', function (err) {
                if (err) res.json(err); 
            
                res.json({ status : 'success'});       
            });
        });
    });
    
    app.delete('/api/words', function(req, res) {
        fs.truncate('./results/invalidWords.txt', 0);
        fs.truncate('./results/validWords.txt', 0);
        
        res.json({status: 'delete'});
    });
    
    app.get('*', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public/views/')});
    });
};