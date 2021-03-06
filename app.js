var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    middlewares = require('./middleware'),
    restaurant = require("./models/restaurant"),
    secret = require('./config/secret'),
    Comment = require("./models/comment"),
    Category = require('./models/category'),
    User = require("./models/user");
//seedDB      = require("./seeds")
// require routes
var commentRoutes = require("./routes/comments"),
    restaurantRoutes = require("./routes/restaurants"),
    apiRoutes = require('./api/api'),
    indexRoutes = require("./routes/index");


// mongoose.connect("mongodb://yada:ftd2009@ds019836.mlab.com:19836/stevensyelp");
mongoose.connect(secret.database, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("connect success");
    }
})
//mongoose.connect("mongodb://localhost/stevens_yelp");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//seedDB();
// seed the database


//  passport configuration
app.use(require("express-session")({
    secret: secret.secretKey,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//  在每个routes里都可以调用 currentUser, error, success
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");       //
    res.locals.success = req.flash("success");   //
    next();
});
app.use(middlewares.cartNum);
app.use(function (req, res, next) {
    Category.find({}, function (err, categories) {
        if (err) return next(err);
        res.locals.categories = categories;
        next();
    });
});
//  节省“/xxx”前缀的写法
app.use("/", indexRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/restaurants/:id", restaurantRoutes);
app.use("/restaurants/:id/comments", commentRoutes);
app.use('/api', apiRoutes, (err, data) => {
    console.log("222");
});

app.use(function (req, res) {
    // var url = req.originalUrl;
    // if (url != "/register" && url != "/" && url != "/login") {
    var err = new Error('not found');
    err.status = 404;
    res.render("./error/404");
    // }
    console.log("error");
    //next();
});


app.listen(secret.port, function () {
    console.log("The StevensYelp Server Has Started!");
});


