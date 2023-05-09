if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}


// Importing Libraies that we installed using npm
const express = require("express")
const app = express()
const cors = require('cors')
const mongoose = require("mongoose")
app.use(express.json())
const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

const mongoUrl = "mongodb+srv://JENNY:mochiking5@cluster0.5khe17p.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
})
.then(() => {
    console.log("Connected to database")
})
.catch((e) => console.log(e));

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )

app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))
app.use(flash())
app.use(cors())
app.use(session({
    secret: 'monkey',
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))

// Configuring the register post functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create a new user instance using the User model
      const user = new User({
        name,
        email,
        password: hashedPassword,
      })
      
      // Save user to database
      await user.save();

      console.log(users); // Display newly registered in the console
      res.send({status: "Ok"})
    } catch (e) {
      console.log(e);
      res.redirect("/register");
    }
  });  

require("./userDetails")
const User = mongoose.model("UserInfo");

// Routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})
// End Routes

// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/login')
//   })

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

app.listen(5500)
