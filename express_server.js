var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


var urlDatabase2 = [
  {short: "b2xVn2", long:"http://www.lighthouselabs.ca"},
  {short: "9sm5xK", long: "http://www.google.com"}
];

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
  let templateVars = { urls: urlDatabase2 };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  //   res.send("Ok");         // Respond with 'Ok' (we will replace this)
  // console.log(req);
  let newLong = req.body;
  let templateVars = { longURL: newLong.longURL};
  res.render("urls_new",templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(0); 
}
