var path = require('path'),
    config = require('./config.json'),
    fs = require('fs'),
    http = require('http'),
    httpPost = require('http-post');

module.exports = function (app, io) {
    var validChunk = 0,
        invalidChunk = 0,
        nextWorkerIndex = 0,

        workersQueue = [];


    function sendToNextFreeWorker(words, nread) {
        var serviceAddress = workersQueue.shift();
        console.log(workersQueue)
        sendToWorker(serviceAddress, words, nread);
        workersQueue.push(serviceAddress);
    }

    function sendToNextWorker(words, nread) {
        var serviceAddress = config[nextWorkerIndex++ % config.length];
        sendToWorker(serviceAddress, words, nread);
        workersQueue.push(serviceAddress);
    }

    function sendToWorker(address, words, nread) {

        console.log(address.port);
        var options = {
            hostname: address.hostname,
            port: address.port,
            path: '/api/validation/word',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        httpPost(options, { words: words }, function (resData) {
            var responseChuncks = "";

            resData.setEncoding('utf8');
            resData.on('data', function (chunk) {
                responseChuncks += chunk;
            });
            resData.on('end', function () {
                var chunkArr = JSON.parse(responseChuncks);
                var wordChunks = chunkArr;
                for (var i = 0; i < wordChunks.length; i++) {
                    (function (i) {
                        var wordData = wordChunks[i];
                        wordData.status ? validChunk++ : invalidChunk++;
                    })(i);
                }

                var vWords = wordChunks
                    .filter((obj) => obj.status == 1)
                    .map((obj) => obj.word)
                    .join(' ');

                var invWords = wordChunks
                    .filter((obj) => obj.status == 0)
                    .map((obj) => obj.word)
                    .join(' ');

                fs.appendFile('./results/invalidWords.txt', invWords + ' ', function (err) {
                    if (err) res.json(err);

                    fs.appendFile('./results/validWords.txt', vWords + ' ', function (err) {
                        if (err) res.json(err);
                    });
                });
                io.sockets.emit('chunks', { validWords: validChunk, invalidWords: invalidChunk, progress: nread })
            })
        })
    }

    io.sockets.on('connection', function (socket) {
        console.log("connected");
        socket.on("something", function (data) {
            console.log("client sent data: " + data);
        });
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    app.get('/api/workers', function (req, res) {
        res.json(config);
    });

    app.post('/api/validation/file', function (req, res) {
        var fileName = req.body.fileName,
            initialRequestsCount = config.length,
            isClosed = false;

        var CHUNK_SIZE = 0.08 * 1024 * 1024,
            buffer = new Buffer(CHUNK_SIZE),
            filePath = './public/uploads/' + fileName;

        fs.open(filePath, 'r', function (err, fd) {
            if (err) throw err;

            function readNextChunk() {
                fs.read(fd, buffer, 0, CHUNK_SIZE, null, function (err, nread) {
                    if (err) throw err;

                    if (nread === 0) {
                        console.log('done');
                        if (!isClosed) {
                            isClosed = true;
                            fs.close(fd, function (err) {
                                if (err) throw err;
                            });
                        }
                        return;

                    }

                    var data;
                    if (nread < CHUNK_SIZE)
                        data = buffer.slice(0, nread).toString('utf8');
                    else
                        data = buffer.toString('utf8');

                    var words = data.split(' ');

                    if (initialRequestsCount) {
                        initialRequestsCount--;
                        sendToNextWorker(words, nread);

                        readNextChunk();
                    } else {
                        sendToNextFreeWorker(words, nread);
                    }
                    if (workersQueue.length) {
                        readNextChunk();
                    }
                });
            }
            readNextChunk();
        });
        res.send("ok");
    })

    app.post('/api/validation/words', function (req, res) {
        console.log(req.body.wordString)
        var words = req.body.wordString.split(' ').filter(function (word) { return word.length != 0 }),
            startIndex = 0,
            initialRequestsCount = config.length,
            wordsCount = words.length,
            wordsLength = words.length,
            splicedWords,
            nread = 20;
        io.sockets.emit('wordlength', {wordsLength: wordsLength})

        function checkNextWords() {

            if (initialRequestsCount) {
                initialRequestsCount--;
                sendToNextWorker(splicedWords, nread);
                if (initialRequestsCount) {
                    getNextWords();
                }
            } else {
                sendToNextFreeWorker(splicedWords, nread);
            }
            if (workersQueue.length) {
                getNextWords();
            }
        }

        function getNextWords() {
            if (!wordsCount) {
                return;
            }

            if (wordsCount < nread) {
                nread = wordsCount;
                splicedWords = words.splice(startIndex, wordsCount);
                wordsCount = 0;
            } else {
                splicedWords = words.splice(startIndex, nread);
                wordsCount -= nread;
            }
            checkNextWords();
        }
        getNextWords();
        res.send('ok')
    });

    app.delete('/api/words', function (req, res) {
        fs.truncate('./results/invalidWords.txt', 0);
        fs.truncate('./results/validWords.txt', 0);

        res.json({ status: 'delete' });
    });

    app.post('/api/uploads', function (req, res) {
        res.status(200).json({ fileName: req.file.filename, fileSize: req.file.size });
    });

    app.get('*', function (req, res) {
        res.sendFile('index.html', { root: path.join(__dirname, '../public/views/') });
    });
};