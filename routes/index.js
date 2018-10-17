var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware");
var Category = require('../models/category');
var Restaurant = require("../models/restaurant");

router.use(function (req, res, next) {
    var url = req.originalUrl;
    // if (url != "/register" && url != "/" && url != "/login") {
    //     var err = new Error('not found');
    //     err.status = 404;
    //     res.render("./error/404");
    // }
    console.log(url);
    next();
});

//landing route
router.get("/", function (req, res) {
    res.render("landing");
});

// show register for
router.get("/register", function (req, res) {
    res.render("register");
})

router.get("/info/:username", middleware.isLoggedIn, function (req, res) {

    res.render("personal/info");
})

router.get("/personal/:id", middleware.isLoggedIn, function (req, res) {
    //console.log(req.params);
    // Restaurant.find({'author.id':req.params.id},function (err, allRestaurants) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         //console.log(allRestaurants);
    //         res.render("personal", { restaurants: allRestaurants});
    //     }
    // })
    Restaurant.find({ 'author.id': req.params.id }).populate("comments").exec(function (err, allRestaurants) {
        if (err) {
            console.log(err);
        } else {
            console.log(allRestaurants);
            res.render("personal", { restaurants: allRestaurants });
        }
    })
})

// sign up POST
router.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username, email: req.body.email });
    //
    if (req.body.password === req.body.repassword) {
        User.register(newUser, req.body.password, function (err, user) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("/register");
            }
            passport.authenticate("local")(req, res, function () {      //local is one kind of strategy
                req.flash("success", "Welcome to StevensYelp, " + user.username);
                res.redirect("/restaurants");
            })
        })

    } else {
        req.flash("error", "two password is not equal");
        res.redirect("/register");
    }
})

// Log in
router.get("/login", function (req, res) {
    // console.log(req.currentUser);
    // console.log(req.user)
    if (req.user) return res.redirect('/');
    res.render("login");
})

// log in POST |middleware
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/restaurants",
        failureRedirect: "/login",
        failureFlash: true
    }), function (req, res) {

    });

//logout route
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/restaurants");
});

//error
// router.use(function(req, res, next){
//     var url = req.originalUrl;
//     if (url != "/register" && url != "/" && url != "/login") {
//         var err = new Error('not found');
//         err.status = 404;
//         res.render("./error/404");
//     }
//     console.log("error");
//     next();
//  });


router.get('/add-category', function (req, res, next) {
    res.render('personal/add-category', { message: req.flash('success') });
});


router.post('/add-category', function (req, res, next) {
    var category = new Category();
    category.name = req.body.name;

    category.save(function (err) {
        if (err) return next(err);
        req.flash('success', 'Successfully added a category');
        return res.redirect('/add-category');
    });
})

router.get('/products/:id', function (req, res, next) {
    Product
        .find({ category: req.params.id })
        .populate('category')
        .exec(function (err, products) {
            if (err) return next(err);
            res.render('main/category', {
                products: products
            });
        });
});

router.get('/product/:id', function (req, res, next) {
    Product.findById({ _id: req.params.id }, function (err, product) {
        if (err) return next(err);
        res.render('main/product', {
            product: product
        });
    });
});



module.exports = router;

