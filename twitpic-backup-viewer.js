var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var jade = require('jade');
var less = require('less-middleware');
var params = require('express-params');

var fs = require('fs');
var path = require('path');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morgan('combined'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(less(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// enable extensive parameter parsings
params.extend(app);

app.param('id', /^\w+$/);
app.param('picturefile', /^(\w+)\.(jpg|jpeg|png)$/)

app.get('/', function (req, res, next) {
	res.render('index', {});
});

app.get('/:id', function (req, res, next) {
	var id = req.params.id;
	var jsonFile = __dirname + '/data' + path.join('/', id + '.json');

	fs.readFile(jsonFile, function (error, data) {
		if (error) {
			var error = new Error('Not found');
			error.status = 404;
			return next(error);
		}

		try {
			var info = JSON.parse(data);
			var file = path.join('/', id + '.' + info.type).slice(1);

			res.render('picture', {
				id: req.params.id,
				file: file,
				info: info
			});
		} catch (error) {
			return next(new Error('Error while loading ' + id + '. Please report this to me sorry...'));
		}
	});
});

app.get('/:picturefile', function (req, res, next) {
	var filename = req.params.picturefile[0];
	var extension = req.params.picturefile[2];
	var dataFile = __dirname + '/data' + path.join('/', filename);

	fs.readFile(dataFile, function (error, data) {
		if (error) {
			var error = new Error('Not found');
			error.status = 404;
			return next(error);
		}

		// set content-type
		if (extension === 'jpg' || extension === 'jpeg') res.set('Content-Type', 'image/jpeg');
		else if (extension === 'png') res.set('Content-Type', 'image/png');
		else res.set('Content-Type', 'application/octet-stream');

		res.send(data);
	});
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: err
	});
});

var server = app.listen(10723, function() {
	console.log('Express server listening on port ' + server.address().port);
});
