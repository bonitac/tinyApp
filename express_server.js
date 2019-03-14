var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
app.use(cookieParser());


var urlDatabase = {
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

//Generate new shortURL
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(0); 
}

// function emailLookup(emailAddress){
//   for (const i = 0; i < emailAddress.length; i++){
//     // if (emailAddress[i] == )
//   }
// }

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
  let templateVars = { urls: urlDatabase,
    user_id: req.cookies["user_id"],
    email: req.body["email"]
  };
  res.render("urls_index", templateVars);
});

//Add new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], email: req.body["email"]};
  res.render("urls_new", templateVars);
});

//Added the newly added URL to Index Page
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

// Delete an existing URL
app.get('/urls/:shortURL/delete', (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Go to the Individual page for a shortURL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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

//Go to log-in page
app.get("/login",(req,res) =>{
  // const user_id = generateRandomString();
  // res.cookie('user_id',user_id);
  let templateVars = {user_id: users.user_id, email:req.body.email};
  res.render("login",templateVars)
})

//Add login capability
app.post("/login", (req,res) =>{
  const user = {user_id:req.cookies.user_id, email:req.body.email, password:req.body.password};
  if (users.user && users.user.password === req.body.password){ //if username exists && users[username] -> false if one is false
    res.cookie('user_id',req.body.userID);
    res.redirect('/urls')
  } else{
    res.clearCookie('user_id');
    res.redirect('/login') //render instead to have an error message
  }
});

//Add Logout Capability
app.post("/logout", (req,res)=>{
  res.clearCookie('user_id');
  res.redirect('/urls')
})

//Add Registration Page
app.get("/register", (req,res)=>{
  let templateVars = {user_id: users.user_id, email:req.body.email};
  res.render('register',templateVars);
})

//Registration handler
app.post("/register", (req,res)=> {
  if (req.body.email === "" || req.body.password === ""){
    res.statusCode = 400
    res.send(`${res.statusCode} Error: Email or Password are empty`);
  // } else if (!emailLookup(newUser.email)){
  //   res.statusCode = 400
  //   res.send(`${res.statusCode}  Error: Invalid Email`);
  }
  for (user in users){
    if (users[user].email === req.body.email){
      res.statusCode = 400;
      res.send(`${res.statusCode}  Error: Email already registered`)
    }
  }  
  
  const user_id = generateRandomString()
  let newUser = {user_id:user_id, email:req.body.email, password:req.body.password};
  res.cookie('user_id', user_id);
  users[newUser.user_id] = newUser;
  res.redirect('/urls');
})