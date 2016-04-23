var path = require('path'),
    config = require('./config.json')
    fs = require('fs');

module.exports = function(app) {    
    
    app.get('/api/workers', function(req, res) {
        res.json(config);
	});
    
    app.post('/api/words', function(req, res) {
        var data = req.body.data;
        var fileName = data.status == 0 ? 'invalidWords.txt' : 'validWords.txt';
        console.log(data.word);
        fs.appendFile('./results/' + fileName, data.word + ' ', function (err) {
            if (err) {
                res.json(err);
            }
            res.json({ status : 'success'});
        });
        
    });
    
    app.get('*', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public/views/')});
    });
};