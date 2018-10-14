var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: { type: String, unique: true, lowercase: true}
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User",UserSchema);