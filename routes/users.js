const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");

//Define Login Route
router.get("/login", (req, res) => res.render("login"));
//Define Register route
router.get("/register", (req, res) => res.render("register"));

// Post Request from Form to database
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //! Check all the required fields
  if (!name || !email || !password || !password2) {
    //Push errors in empty array
    errors.push({ msg: "Please fill in all the fields" });
  }

  //!Check if passwords match
  if (password !== password2) {
    //Push error in the array
    errors.push({ msg: "Passwords do not match" });
  }

  //!Check password length
  if (password.length < 6) {
    errors.push({ msg: "Passwords should be atleast 8 characters" });
  }

  //! Password should contain at least 1 letter and 1 number
  if (password.search(/[a-z]/i) < 0 || password.search(/[0-9]/) < 0) {
    errors.push({
      msg: "Passwords should contain at least a letter and a digit"
    });
  }
  //? Study REGULAR EXPRESSIONS in JS!!! (https://regex101.com/r/cO8lqs/18)
  //!Password should contain a special character

  //! Render errors to the registration page if any
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    //*Validation Passed
    //*res.send("Registration Succesfull");
    //Find if user already exists in database on success
    User.findOne({ email: email }).then(user => {
      //User exists
      if (user) {
        errors.push({ msg: "This Email is already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        // User does not exists
        //!Create a new user
        const newUser = new User({
          name,
          email,
          password
        });

        // Hash password to store in Database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            // Store hash in your password DB.
            //Catch Error
            if (err) throw err;
            //set password to hashed
            newUser.password = hash;
            //save user

            //* Save the created User and redirect him to login page
            newUser
              .save()
              .then(() => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch(err => console.error(err));
          });
        });
      }
    });
  }
});

// Handle Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

//Handle Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are now logged out");
  res.redirect("/users/login");
});
module.exports = router;
