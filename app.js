//jshint esversion:6

const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt=require("bcrypt");
const saltRounds=10;
const app = express();
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");



app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(session({
    secret:"My Secret",
    resave:false,
    saveUninitialized:false
    
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/AccountDB");

const accSchema = new mongoose.Schema({
    email: String,
    password: String
});

accSchema.plugin(passportLocalMongoose);

const Accounts = mongoose.model("Accounts", accSchema);


passport.use(Accounts.createStrategy());

// // use static serialize and deserialize of model for passport session support
// passport.serializeUser(Accounts.serializeUser());
// passport.deserializeUser(Accounts.deserializeUser());


passport.serializeUser(function(Accounts, done) {
    done(null, Accounts);
  });
  
  passport.deserializeUser(function(Accounts, done) {
    done(null, Accounts);
  });


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets",(req,res)=>{
if(req.isAuthenticated()){
    res.render("secrets");
}else{
    res.redirect("/login");
}
});

app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        console.log(err);
    });
    res.redirect("/");
});

app.post("/register", (req, res) => {
    Accounts.register({username:req.body.username},req.body.password,(err,user)=>{
       if(err){
        console.log(err);
        res.redirect("/register");
       }else{
        passport.authenticate("local")(req,res,()=>{
            res.redirect("/secrets");
        })
       }
    });
});

app.post("/login", (req, res) => {
    const account = new Accounts({
                    email: req.body.username,
                    password: req.body.password
                });

        req.login(account,(err)=>{
            if(err){
                console.log(err);
                res.redirect("/register");
               }else{
                passport.authenticate("local")(req,res,()=>{
                    res.redirect("/secrets");
                });
            };
        });
    
});


app.listen(3000, (req, res) => {
        console.log("Running...");
    });











    
// using secrity of bcrypt

// app.post("/register", (req, res) => {

//     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//         const account = new Accounts({
//             email: req.body.username,
//             password: hash
//         });
//         account.save().then(() => {
//             res.render("secrets");
//         }).catch((e) => {
//             res.send(e);
//         });
//     });


   
// });

// app.post("/login", (req, res) => {

//     Accounts.findOne({email:req.body.username}).then((user)=>{


//         bcrypt.compare(req.body.password, user.password, function(err, result) {
//             if(result===true){
//                 res.render("secrets");
//             }else{
//                 res.send("Password Incorrect");
//             }
//         });

   
//     }).catch(()=>{
//         res.send("User not found");
//     });
// });

