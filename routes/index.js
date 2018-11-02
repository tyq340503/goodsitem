var express = require("express");
var router = express.Router();
var passport = require("passport");
var passportConf = require("../config/passport");
var User = require("../models/user");
var middleware = require("../middleware");
var Category = require('../models/category');
var Restaurant = require("../models/restaurant");
var Product = require('../models/product');
var Cart = require('../models/cart');
var async = require('async');
var stripe = require('stripe')('sk_test_SGDazZx02g66TCWvhN3NKBLb');

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
    async.waterfall([
        function (callback) {
            Restaurant.find({ 'author.id': req.params.id }, function (err, allRestaurants) {
                if (err) {
                    console.log(err);
                }
                else if (allRestaurants.length == 0) {
                    return next();
                }
                else {
                    // res.render("personal", { restaurants: allRestaurants  });
                    callback(err, allRestaurants);
                }
            })
        },
        function (allRestaurants) {
            User.find({ _id: req.params.id })
                .populate("author")
                .populate("history")
                .exec(function (err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(data);
                        res.render("personal", { user: data, restaurants: allRestaurants });
                    }
                })
        }
    ], function (err) {
        console.log('personal');
        if (err) {
            next(err);
        }
        // res.json({ message: data });
    })
})

// sign up POST
router.post("/register", function (req, res, next) {
    console.log(req.body);
    async.waterfall([
        function (callback) {
            var newUser = new User({
                username: req.body.username,
                email: req.body.email,
            });
            // var newUser = new User();
            // newUser.username = req.body.username,
            // newUser.email = req.body.email;
            newUser.profile.picture = newUser.gravatar();
            //
            if (req.body.password === req.body.repassword) {
                User.register(newUser, req.body.password, function (err, user) {
                    if (err) {
                        req.flash("error", err.message);
                        res.redirect("/register");
                    }
                    return callback(err, newUser);

                })

            } else {
                req.flash("error", "two password is not equal");
                res.redirect("/register");
            }
        },
        function (user) {
            var cart = new Cart();
            cart.owner = user._id;
            // console.log(user);
            cart.save(function (err) {
                if (err) return next(err);
                req.logIn(user, function (err) {
                    if (err) return next(err);
                    // res.redirect('/profile');
                    return passport.authenticate("local")(req, res, function () {      //local is one kind of strategy
                        req.flash("success", "Welcome to StevensYelp, " + user.username);
                        res.redirect("/restaurants");
                    })
                    // res.redirect('/restaurants');
                });
            });
        }
    ], function (err, data) {
        console.log('register');
        if (err) {
            next(err);
        }
        res.json({ message: data });
    })
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
        if (err) {
            // console.log('err');
            return next(err);
        }
        // wrong id will in here
        if (product == null) {
            return next();
        }
        // console.log('err2');
        res.render('main/product', {
            product: product
        });
    }).catch((err) => {
        // console.log(err);
        // err in here
        return next(err);
    })
});

router.post('/product/:product_id', function (req, res, next) {
    if (!req.user) {
        // req.flash("success", "Logged you out!");
        localStorage.setItem("goods", {
            item: req.body.product_id,
            price: parseFloat(req.body.priceValue),
            quantity: parseInt(req.body.quantity)
        })
        return res.redirect('/cart');
        // return next();
        // return res.redirect('/login');
    } else {
        Cart.findOne({ owner: req.user._id }, function (err, cart) {
            cart.items.push({
                item: req.body.product_id,
                price: parseFloat(req.body.priceValue),
                quantity: parseInt(req.body.quantity)
            });

            cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

            cart.save(function (err) {
                if (err) return next(err);
                return res.redirect('/cart');
            });
        });
    }
});

router.get('/cart', function (req, res, next) {
    // console.log(req.user);
    // console.log(req.currentUser);
    if (!req.user) {
        // req.flash("success", "Logged you out!");
        res.render('main/cart', {
            foundCart: foundCart,
            // message: req.flash('remove')
        })
        // return next();
        // return res.redirect('/login');
    } else {
        Cart
            .findOne({ owner: req.user._id })
            .populate('items.item')
            .exec(function (err, foundCart) {
                if (err) return next(err);
                res.render('main/cart', {
                    foundCart: foundCart,
                    message: req.flash('remove')
                });
            }).then(function (err) {
                console.log(err);
            });
    }
});

router.post('/remove', function (req, res, next) {
    Cart.findOne({ owner: req.user._id }, function (err, foundCart) {
        foundCart.items.pull(String(req.body.item));

        foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
        foundCart.save(function (err, found) {
            if (err) return next(err);
            req.flash('remove', 'Successfully removed');
            res.redirect('/cart');
        });
    });
});


router.post('/payment', middleware.isLoggedIn, function (req, res, next) {
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

router.get('/profile', passportConf.isAuthenticated, function (req, res, next) {
    User
        .findOne({ _id: req.user._id })
        .populate('history.item')
        .exec(function (err, foundUser) {
            if (err) return next(err);

            res.render('accounts/profile', { user: foundUser });
        });
});

module.exports = router;

