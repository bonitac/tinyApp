var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
app.use(cookieParser());
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

// console.log(bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)); // returns true
// console.log(bcrypt.compareSync("pink-donkey-minotaur", hashedPassword)); // returns false

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
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
    console.log("no email")
    return 0;
  }
  for (user in users){
    if (users[user].email === emailAddress){
      res.statusCode = 400;
      return 1; //duplicate email or found email
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
  return res.send("Hello! This is the Home Page of Tiny App");
});

//Index page
app.get("/urls", (req, res) => {
  // console.log(urlDatabase["b6UTxQ"].longURL)
  let templateVars = { urls: urlDatabase,
    id: users.id,
    email: req.body.email
  };
  return res.render("urls_index", templateVars);
});

//Add new URL
app.get("/urls/new", (req, res) => {
  // console.log(req)
  let templateVars = { id: req.cookies["id"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    email: req.body["email"]};
  return res.render("urls_new", templateVars);
});

//Added the newly added URL to Index Page
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.cookies.id;
  // console.log(urlDatabase[shortURL]);
  for (user in users){
    if (users[user].id == req.cookies.id){
      let thisEmail = users[user].email;
      return res.render("urls_show",{shortURL:shortURL, longURL: urlDatabase[shortURL].longURL, email:thisEmail});
    }
  }
});

// Delete an existing URL
app.post('/urls/:shortURL/delete', (req,res) => {
  // console.log(urlDatabase[req.params.shortURL].userID)
  // console.log("cookie",req.cookies.id)
  if (req.cookies.id === urlDatabase[req.params.shortURL].userID){
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  } else{
    res.send("go log in!") //render to log in page
  }
});

// Go to the Individual page for a shortURL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { id: req.cookies["id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, email:req.cookies.id.email};
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
    res.cookie('id', users[loginID].id);
    return res.render('urls_index',{id: users[loginID].id, email:req.body.email, urls: urlDatabase, errorMessage: "Invalid username and password"});
  } else{
    // return res.render('login',{errorMessage:""}); //render instead to have an error message
    return res.send("failed to log in")
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
  let newUser = {id:id, email:req.body.email, password:bcrypt.hashSync(req.body.password,10)};
  console.log(newUser.password)
  res.cookie('id', id);
  users[newUser.id] = newUser;
  return res.render('urls_index',{id: users.id, email:req.body.email,urls: urlDatabase});
})