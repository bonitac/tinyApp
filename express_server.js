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
    if (users[user].parameter == req.session.parameter){
      // let loginID = users[user].id //ID NOT USER_ID YOU NUMNUT - wait do i need this line at all
        return user;
    }
  }
}

function urlsForUser(id){ //seems to work by itself
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
  if (!req.session.user_id){
    return res.redirect('/login');
  }
  return res.redirect('/urls');
});

// console.log(urlsForUser("userRandomID"));

//Index page
app.get("/urls", (req, res) => {
  if (req.session.id === undefined){
    return res.redirect('/login');
  } //i think urls for user here needs to  be used better
  console.log(urlsForUser(req.session.user_id))
  const urls = urlsForUser(req.session.user_id)
  return res.render("urls_index", { urls: urls, user: users[req.session.user_id]});
  //shortURL:req.params.id, longURL:urlDatabase[req.params.id], 
});

//Add new URL
app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]){
    const urls = urlsForUser(req.session.user_id);
    const shortURL = req.params.shortURL;

    urlDatabase[shortURL].longURL = req.body.newlongURL;

    return res.render("urls_new", {user: users[req.session.user_id], urls: urlsForUser(req.session.user_id), longURL: req.body.longURL,});
  } else {
    return res.redirect("/login")
  } 
});

//Added the newly added URL to Index Page
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {longURL:req.body.longURL, userID: userID};
  const user = findUser(userID,req);
  return res.render("urls_show",{urls: urlDatabase[shortURL], user:users[req.session.user_id], shortURL: shortURL});
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
  let templateVars = { user: users[req.session.user_id],shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  return res.render("urls_show", templateVars);
});

//Edit the longURL on an individual page
app.post("/urls/:shortURL", (req,res) => {
  const shortURL = req.params.shortURL;
  console.log(req.session.user_id)
  if (urlDatabase[shortURL].userID === req.session.user_id){
    urlDatabase[shortURL].longURL = req.body.newlongURL;
    return res.redirect(`/urls/${shortURL}`);
  }
  return res.send("not able to edit")
})

//redirect from individual on click
app.get("/u/:shortURL", (req, res) => {
  return res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//Go to log-in page
app.get("/login",(req,res) =>{
  if(req.session.user_id){
    return res.render("urls_index", {user: users[req.session.user_id], urls:urlsForUser(urlDatabase)});
  }
  return res.render("login",{user:[req.session.user_id], id: users.id, email:req.session.email});
})

//Add login capability
app.post("/login", (req,res) =>{
  if (emailLookup(req.body.email,req,res)===0|| req.session.password === ""){
    return res.send(`${res.statusCode}: Email or password are missing`);
  }
  const loginID = findUser(req.body.email,req);
  if (users[loginID] && bcrypt.compareSync(req.body.password,users[loginID].password)){
    // console.log(users[loginID].id)
    req.session.user_id =  users[loginID].id; //generate cookie
    //loggedasemail = users[currentuser]['id']
    return res.render('urls_index',{user:users[req.session.user_id], id: users[loginID].id, email:req.body.email, urls: urlDatabase, errorMessage: "Invalid username and password"});
  } else if (!bcrypt.compareSync(req.body.password, users[loginID].password)){
    return res.render('errors',{user:[req.session.user_id], errorMessage: "Incorrect Password"}); //render instead to have an error message
    // return res.send("failed to log in")
  }
});

//Logout Capability
app.post("/logout", (req,res)=>{
  req.session = null;
  return res.redirect('/urls')
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
  }
  const randomID = generateRandomString();
  users[randomID] = {id: randomID, email:req.body.email, password: bcrypt.hashSync(req.body.password,10)}
  req.session.user_id = randomID;
  console.log(users)
  return res.render('urls_index',{user: users[req.session.user_id], urls: urlsForUser(urlDatabase)});
})