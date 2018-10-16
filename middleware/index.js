var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var Cart = require('../models/cart');


var middlewareObj = {};

middlewareObj.checkRestaurantOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Restaurant.findById(req.params.id, function (err, foundRestaurant) {
            if (err) {
                req.flash("error", "Restaurant not found");
                res.redirect("back");
            } else {
                // does user upload the restaurant?
                if (foundRestaurant.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                // does user own the comment?
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();          // return, no need to else{}
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObj.cartNum = function (req, res, next){
    if (req.user) {
        var total = 0;
        Cart.findOne({ owner: req.user._id }, function(err, cart) {
          if (cart) {
            for (var i = 0; i < cart.items.length; i++) {
              total += cart.items[i].quantity;
            }
            res.locals.cart = total;
          } else {
            res.locals.cart = 0;
          }
          next();
        })
      } else {
        next();
      }
}

module.exports = middlewareObj;