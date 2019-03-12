var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set('view engine', 'ejs');

// var urlDatabase = [
//   {short: "b2xVn2", long:"http://www.lighthouselabs.ca"},
//   {short: "9sm5xK", long: "http://www.google.com"}
// ];

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

app.get("/urls/:shortURL", (req, res) => {
  // console.log(req);
  // console.log(urlDatabase[req.params.shortURL])
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});