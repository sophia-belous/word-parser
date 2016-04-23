var path = require('path');

module.exports = function(app) {    
    
    app.post('/api/uploads', function(req, res) {
        console.log(req.file.path);
	});
    
    app.get('*', function(req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public/views/')});
    });
};