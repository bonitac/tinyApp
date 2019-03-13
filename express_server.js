var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello! This is the Home Page of Tiny App");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let newLong = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = newLong;
  console.log(urlDatabase)
  let templateVars = { longURL: newLong, shortURL:shortURL};
  // res.render("urls_new",templateVars)
  // let redirectURL = ''
  res.redirect(`urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
  // res.redirect(templateVars.longURL);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  console.log("long?",urlDatabase[req.params.shortURL])
  res.redirect(urlDatabase[req.params.shortURL]);
});

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(0); 
}