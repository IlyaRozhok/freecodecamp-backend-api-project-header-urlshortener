require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");
const urlParser = require("url");
dns.lookup("example.com", (err, address, family) => {
  if (err) {
    console.log("❌ Invalid domain");
  } else {
    console.log("✅ Valid domain:", address);
  }
});
// Basic Configuration
const port = process.env.PORT || 3000;
let urlDatabase = {};
let counter = 1;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  if (!/^https?:\/\//i.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  let hostname;
  try {
    hostname = urlParser.parse(originalUrl).hostname;
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(hostname, (err) => {
    if (err) return res.json({ error: "invalid url" });

    const short = counter++;
    urlDatabase[short] = originalUrl;

    res.json({ original_url: originalUrl, short_url: short });
  });
});

app.get("/api/shorturl/:short", (req, res) => {
  const originalUrl = urlDatabase[req.params.short];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: "No short URL found" });
  }
});