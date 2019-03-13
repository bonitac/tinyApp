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

//Generate new shortURL
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(0); 
}

//Listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Home Page
app.get("/", (req, res) => {
  res.send("Hello! This is the Home Page of Tiny App");
});

//Index page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Add new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_new", templateVars);
});

//Added the newly added URL to Index Page
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  let templateVars = { longURL: urlDatabase[shortURL], shortURL:shortURL};
  res.redirect(`urls/${shortURL}`);
});

// Delete an existing URL
app.get('/urls/:shortURL/delete', (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Go to the Individual page for a shortURL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//Edit the longURL on an individual page
app.post("/urls/:shortURL", (req,res) => {
  const {shortURL} = req.params;
  urlDatabase[shortURL] = req.body.newlongURL;
  res.redirect(`/urls/${shortURL}`);
})

//redirect from individual on click
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

