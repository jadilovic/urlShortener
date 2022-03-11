require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser');
var dns = require('dns');
let url = '';
let shortUrl = 0;
let objList = {};
let count = 1;
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const urlSchema = new mongoose.Schema(
	{
		fullUrl: { type: String, required: true, unique: true },
	},
	{ timestamps: true }
);

urlSchema.plugin(AutoIncrement, { inc_field: 'urlNumber' });

const URL = mongoose.model('URL', urlSchema);

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

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

	const createUrlObject = async (urlValue) => {
		try {
			const urlObject = await URL.create({ fullUrl: urlValue });
			console.log(urlObject);
			res.json({
				original_url: urlObject.fullUrl,
				short_url: urlObject.urlNumber,
			});
		} catch (error) {
			res.json({ error: 'url already exists' });
		}
	};

	if (isValidURL(req.body.url)) {
		createUrlObject(req.body.url);
	} else {
		res.json({ error: 'invalid url' });
	}
});

// GET
app.get('/api/shorturl/:short_url', function (req, res) {
	console.log(req.params.short_url);
	const shortUrl = req.params.short_url;

	if (isNaN(shortUrl) || Number(shortUrl) < 1) {
		res.json({ error: 'invalid url' });
	}

	const findUrlObject = async (shortUrlValue) => {
		const urlObject = await URL.findOne({ urlNumber: Number(shortUrlValue) });
		console.log(urlObject);
		if (urlObject) {
			res
				.writeHead(301, {
					Location: urlObject.fullUrl,
				})
				.end();
		} else {
			res.json({ error: 'invalid url' });
		}
	};

	findUrlObject(shortUrl);
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
