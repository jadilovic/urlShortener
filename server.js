require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser');
var dns = require('dns');
let url = '';
let shortUrl = 0;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
	res.json({ greeting: 'hello API' });
});

// POST
app.post('/api/shorturl', function (req, res) {
	console.log(req.body.url);
	function isValidURL(string) {
		var res = string.match(
			/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
		);
		return res !== null;
	}
	if (isValidURL(req.body.url)) {
		url = req.body.url;
		shortUrl = 1;
		res.json({ original_url: url, short_url: shortUrl });
	} else {
		url = '';
		shortUrl = 0;
		res.json({ error: 'invalid url' });
	}
});

// GET
app.get('/api/shorturl/:short_url', function (req, res) {
	console.log(req.params.short_url);
	if (req.params.short_url === '' + shortUrl) {
		res
			.writeHead(301, {
				Location: url,
			})
			.end();
	} else {
		res.json({ error: 'invalid url' });
	}
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
