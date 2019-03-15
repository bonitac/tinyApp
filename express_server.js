var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}))
const bcrypt = require('bcrypt');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("qwer", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

//Generate random string of length 6
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(0); 
}

function emailLookup(emailAddress,req,res){
  if (emailAddress === ""){
    res.statusCode = 400;
    return 0; //console.log("no email")
  }
  for (user in users){
    if (users[user].email === emailAddress){
      res.statusCode = 400;
      return 1; //duplicate email or found email
    }
  }
  return 0; //email typed in but not found
}

function findUser(parameter,req){
  for (user in users){
    if (users[user].parameter == req.session.parameter){
      let loginID = users[user].id //ID NOT USER_ID YOU NUMNUT
        return user;
    }
  }
}

function urlsForUser(id){
  let urls = {};
  for (url in urlDatabase){
    if (urlDatabase[url].userID === id){
      const validURL = urlDatabase[url].longURL;
      urls[url] = validURL
    }
  }
  return urls;
}

//Listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Home Page
app.get("/", (req, res) => {
  if (!req.session){
    return res.redirect('/login');
  }
  console.log(req);
  return res.redirect('/urls');
});

//Index page
app.get("/urls", (req, res) => {
  // console.log(urlDatabase["b6UTxQ"].longURL)
  if (req.session.id === undefined){
    return res.redirect('/login')
  }
  return res.render("urls_index", { urls: urlDatabase, id: users.id, email: req.session.email });
});

//Add new URL
app.get("/urls/new", (req, res) => {
  // console.log(req)
  let templateVars = { id: req.session.user_id,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    email: req.session.email};
  return res.render("urls_new", templateVars);
});

//Added the newly added URL to Index Page
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;
  for (user in users){
    if (users[user].id == req.session.user_id){
      return res.render("urls_show",{shortURL:shortURL, longURL: urlDatabase[shortURL].longURL, email:users[user].email});
    }
  }
});

// Delete an existing URL
app.post('/urls/:shortURL/delete', (req,res) => {
  console.log(urlDatabase[req.params.shortURL].userID)
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID){
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  } else{
    res.send("go log in!") //render to log in page
  }
});

// Go to the Individual page for a shortURL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { id: req.session.user_id, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, email:req.session.user_id.email};
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
  return res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//Go to log-in page
app.get("/login",(req,res) =>{
  // console.log(req)
  let templateVars = {id: users.id, email:req.body.email};
  return res.render("login",templateVars)
})

//Add login capability
app.post("/login", (req,res) =>{
  if (!emailLookup(req.body.email,req,res)|| req.body.password === ""){
    return res.send(`${res.statusCode}: Email or password are missing`);
  }
  const loginID = findUser(req.body.email,req);
  if (users[loginID] && bcrypt.compareSync(req.body.password,users[loginID].password)){
    // console.log(users[loginID].id)
    req.session.user_id =  users[loginID].id;
    return res.render('urls_index',{id: users[loginID].id, email:req.body.email, urls: urlDatabase, errorMessage: "Invalid username and password"});
  } else{
    // return res.render('login',{errorMessage:""}); //render instead to have an error message
    return res.send("failed to log in")
  }
});

//Add Logout Capability
app.post("/logout", (req,res)=>{
  req.session = null;
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
  let newUser = {id:id, email:req.body.email, password:bcrypt.hashSync(req.body.password,10)};
  req.session.user_id = id;
  users[newUser.id] = newUser;
  return res.render('urls_index',{id: users.id, email:req.body.email,urls: urlDatabase});
})