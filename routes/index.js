var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware");
var Category = require('../models/category');
var Restaurant = require("../models/restaurant");
var Product = require('../models/product');
var Cart = require('../models/cart');

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
            // console.log(products);
            if (err) return next(err);
            res.render('main/category', {
                products: products
            });
        });
});

router.get('/product/:id', function (req, res, next) {
    Product.findById({ _id: req.params.id }, function (err, product) {
        // console.log(product);
        if (err) return next(err);
        res.render('main/product', {
            product: product
        });
    });
});

router.post('/payment', function (req, res, next) {
    var stripeToken = req.body.stripeToken;
    var currentCharges = Math.round(req.body.stripeMoney * 100);
    stripe.customers.create({
        source: stripeToken,
    }).then(function (customer) {
        return stripe.charges.create({
            amount: currentCharges,
            currency: 'usd',
            customer: customer.id
        });
    }).then(function (charge) {
        async.waterfall([
            function (callback) {
                Cart.findOne({ owner: req.user._id }, function (err, cart) {
                    callback(err, cart);
                });
            },
            function (cart, callback) {
                User.findOne({ _id: req.user._id }, function (err, user) {
                    if (user) {
                        for (var i = 0; i < cart.items.length; i++) {
                            user.history.push({
                                item: cart.items[i].item,
                                paid: cart.items[i].price
                            });
                        }

                        user.save(function (err, user) {
                            if (err) return next(err);
                            callback(err, user);
                        });
                    }
                });
            },
            function (user) {
                Cart.update({ owner: user._id }, { $set: { items: [], total: 0 } }, function (err, updated) {
                    if (updated) {
                        res.redirect('/profile');
                    }
                });
            }
        ], function (err, data) {
            console.log('11');
            if (err) {
                next(err);
            }
            res.json({ message: data });
        });
    })
});

module.exports = router;

