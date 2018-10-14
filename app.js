var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    restaurant = require("./models/restaurant"),
    Comment = require("./models/comment"),
    User = require("./models/user")
//seedDB      = require("./seeds")
// require routes
var commentRoutes = require("./routes/comments"),
    restaurantRoutes = require("./routes/restaurants"),
    indexRoutes = require("./routes/index");


// mongoose.connect("mongodb://yada:ftd2009@ds019836.mlab.com:19836/stevensyelp");
mongoose.connect("mongodb://tyq340503:abc123@ds131903.mlab.com:31903/ecommerce",function(err){
    if(err){
        console.log(err);
    }else{
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
    secret: "Some restaurants around Stevens I like",
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
//  节省“/xxx”前缀的写法
app.use("/", indexRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/restaurants/:id", restaurantRoutes);
app.use("/restaurants/:id/comments", commentRoutes);

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


app.listen(3000, function () {
    console.log("The StevensYelp Server Has Started!");
});


