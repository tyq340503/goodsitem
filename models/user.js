var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var validator = require('validator');
var crypto = require('crypto');
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required!'],
        trim: true,
        validate: {
            validator(email) {
                return validator.isEmail(email)
            },
            message: '{value} is not a valid email'
        },
    },
    profile: {
        name: { type: String, default: '' },
        picture: { type: String, default: '' }
    },
    history: [{
        paid: { type: Number, default: 0 },
        item: { type: Schema.Types.ObjectId, ref: 'Product' }
    }]
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.gravatar = function (size) {
    if (!this.size) size = 200;
    if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);