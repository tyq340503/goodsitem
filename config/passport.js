var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

// serialize and deserialize
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});