var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('mdmashup:server');
var http = require('http');
var browserify = require('browserify-middleware');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');
const url = require('url');

var backend = new ShareDB();

//get port from ENV
var port = normalizePort(process.env.PORT || '3000');

var routes = {};
routes.index = require('./routes/index');
routes.md  = require('./routes/md');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//set port
app.set('port', port);


//app.use(favicon(path.join(__dirname, 'client/static', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/static', express.static(path.join(__dirname, 'client/static')));
app.use('/', routes.index);
app.use('/', routes.md);

app.use('/js', browserify(__dirname + '/client/javascript'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// create http and Websocket server
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });

var backend = new ShareDB();

wss.on('connection', function connection(ws, req) {
    var stream = new WebSocketJSONStream(ws);
    var connection = backend.connect();
    var doc = connection.get('pads', req.url);
    doc.fetch(function(err) {
        if (err) throw err;
        if (doc.type === null) {
            console.log("Creating new pad "+req.url);
            doc.create('',function () {
                backend.listen(stream);
            });
        } else
            backend.listen(stream);
    });
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}


/**
 * Helper functions */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
