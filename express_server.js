var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//Generate random string of length 6
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(0); 
}

function emailLookup(emailAddress,req,res){
  if (emailAddress === ""){
    res.statusCode = 400;
    return 0;
  }
  for (user in users){
    if (users[user].email === emailAddress){
      res.statusCode = 400;
      return 0; //falsy
    }
  }
  return 1; //truthy
}

function findUser(parameter,req){
  for (user in users){
    if (users[user].parameter == req.body.parameter){
      let loginID = users[user].id //ID NOT USER_ID YOU NUMNUT
        return user;
    }
  }
}

//Listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Home Page
app.get("/", (req, res) => {
  return res.send("Hello! This is the Home Page of Tiny App");
});

//Index page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
    id: users.id,
    email: req.body.email
  };
  return res.render("urls_index", templateVars);
});

//Add new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { id: req.cookies["id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], email: req.body["email"]};
  return res.render("urls_new", templateVars);
});

//Added the newly added URL to Index Page
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  return res.redirect(`urls/${shortURL}`);
});

// Delete an existing URL
app.get('/urls/:shortURL/delete', (req,res) => {
  delete urlDatabase[req.params.shortURL];
  return res.redirect('/urls');
});

// Go to the Individual page for a shortURL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { id: req.cookies["id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  return res.render("urls_show", templateVars);
});

//Edit the longURL on an individual page
app.post("/urls/:shortURL", (req,res) => {
  const {shortURL} = req.params;
  urlDatabase[shortURL] = req.body.newlongURL;
  return res.redirect(`/urls/${shortURL}`);
})

//redirect from individual on click
app.get("/u/:shortURL", (req, res) => {
  return res.redirect(urlDatabase[req.params.shortURL]);
});

//Go to log-in page
app.get("/login",(req,res) =>{
  let templateVars = {id: users.id, email:req.body.email};
  return res.render("login",templateVars)
})

//Add login capability
app.post("/login", (req,res) =>{
  if (!emailLookup(req.body.email,req,res)|| req.body.password === ""){
    return res.send(`${res.statusCode}: Email or password are missing`);
  }
  const loginID = findUser(req.body.email,req);
  if (users[loginID] && users[loginID].password === req.body.password){
    console.log(users[loginID].id)
    res.cookie('id', users[loginID].id);//
    return res.render('urls_index',{id: users[loginID].id, email:req.body.email, urls: urlDatabase, errorMessage: "Invalid username and password"});
  } else{
    res.clearCookie('id');
    return res.render('login',{errorMessage:""}); //render instead to have an error message
  }
});

//Add Logout Capability
app.post("/logout", (req,res)=>{
  res.clearCookie('id');
  return res.redirect('/urls')
})

//Add Registration Page
app.get("/register", (req,res)=>{
  let templateVars = {id: users.id, email:req.body.email};
  return res.render('register',templateVars);
})

//Registration handler
app.post("/register", (req,res)=> {
  if (!emailLookup(req.body.email,req,res)){
    return res.send("Email already registered") //stick the error messages in the header
  }
  const id = generateRandomString();
  let newUser = {id:id, email:req.body.email, password:req.body.password};
  res.cookie('id', id);
  users[newUser.id] = newUser;
  return res.render('urls_index',{id: users.id, email:req.body.email,urls: urlDatabase});
})