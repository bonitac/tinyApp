const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}))
const bcrypt = require('bcrypt');

//Global Variables:
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("qwerty", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com",
    password: bcrypt.hashSync("asdf", 10)
  }
}

//Functions

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(0); 
}

function emailLookup(emailAddress,req,res){
  if (emailAddress === ""){
    res.statusCode = 400;
    return 0; //"no email"
  }
  for (user in users){
    if (users[user].email === emailAddress){
      res.statusCode = 400;
      return 1; //duplicate email or found email
    }
  }
  return 2; //email typed in but not found in db
}

function findUser(parameter,req){
  for (user in users){
    if (users[user][parameter] === req.body[parameter]){
        return user;
    }
  }
}

function urlsForUser(id){
  let urls = {};
  for (url in urlDatabase){
    if (urlDatabase[url].userID === id){
      urls[url] = urlDatabase[url].longURL
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
  if (!req.session.user_id){
    return res.redirect('/login');
  }
  return res.redirect('/urls');
});

//Index page
app.get("/urls", (req, res) => {
  if (req.session.id === ""){
    return res.redirect('/login');
  }
  return res.render("urls_index", { url: urlsForUser(req.session.user_id), user: users[req.session.user_id],shortURL: req.params.shortURL});
});

//Add new URL
app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]){
    return res.render("urls_new", {user: users[req.session.user_id], urls: urlsForUser(req.session.user_id)});
  } else {
    return res.redirect("/login")
  } 
});

//Added the newly added URL to Index Page
app.post("/urls", (req, res) => {
  if (req.session.user_id){
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL:req.body.longURL, userID: req.session.user_id};
    return res.render("urls_show",{ url: urlsForUser(req.session.user_id), user: users[req.session.user_id],shortURL: shortURL});
  }
  return res.redirect("/login")
  
});

// Delete an existing URL
app.post('/urls/:shortURL/delete', (req,res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID){
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  } else{
    return res.render('errors',{user:users[req.session.user_id], errorMessage : "Can't delete. Go log in!"}) //render to log in page
  }
});

// Go to the Individual page for a shortURL
app.get("/urls/:shortURL", (req, res) => {
  return res.render("urls_show", { url: urlsForUser(req.session.user_id), user: users[req.session.user_id],shortURL: req.params.shortURL});
});

//Edit the longURL on an individual page
app.post("/urls/:shortURL", (req,res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id){
    urlDatabase[shortURL].longURL = req.body.newlongURL;
    return res.redirect(`/urls/${shortURL}`);
  }
  return res.render('errors', {errorMessage:"Not allowed to edit this URL", user: users[req.session.user_id]})
})

//redirect from individual on click
app.get("/u/:shortURL", (req, res) => {
  return res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//Go to log-in page
app.get("/login",(req,res) =>{
  if(req.session.user_id){
    return res.redirect('/urls')
  }
  return res.render("login",{user:[req.session.user_id] });
})

//Add login capability
app.post("/login", (req,res) => {
  for(let user in users){
    if (users[user].email === req.body.email){
      if (bcrypt.compareSync(req.body.password, users[user].password)){
        req.session.user_id = users[user].id;
        return res.redirect('/urls');
      } else {
        return res.render('errors', {errorMessage: "Incorrect password. Try again", user:""});
      }
    }
  }
  return res.render('errors', {errorMessage: "Email not found.", user:""});
})

// Registration Page
app.get("/register", (req,res)=>{
  if (req.session.user_id){
    return res.render('errors',{errorMessage: "Already logged in", user:'undefined'})
  }
  return res.render('register',{user: 'undefined'});
})

//Registration handler
app.post("/register", (req,res)=> {
  if (emailLookup(req.body.email,req,res)===1){
    return res.render('errors',{user: users[req.session.user_id], errorMessage:"Email already registered"})
  } else if (emailLookup(req.body.email,req,res) === 0 && res.statusCode === 400){
    return res.render('errors', {user: users[req.session.user_id], errorMessage:"Email left blank!"})
  } else if (req.body.password === ""){
    return res.render('errors', {user: users[req.session.user_id], errorMessage:"Password left blank!"})
  }
  const randomID = generateRandomString();
  users[randomID] = {id: randomID, email:req.body.email, password: bcrypt.hashSync(req.body.password,10)}
  req.session.user_id = randomID;
  return res.redirect('/urls');
})

//Logout Capability
app.post("/logout", (req,res)=>{
  req.session = null;
  return res.redirect('/urls');
})