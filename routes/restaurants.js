var express = require("express");
var router = express.Router();
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middleware = require("../middleware");
//var postfile = require("../middleware/postfile");
var NodeGeocoder = require('node-geocoder');
var formidable = require('formidable');
var sys = require('util');

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);
// app.use("/restaurants",restaurantRoutes);

// INDEX -show all restaurants
router.get("/", function (req, res) {
    // get all restaurants from DB
    //console.log(req.body);
    Restaurant.find({}, function (err, allRestaurants) {
        if (err) {
            var err = new Error('not found');
            err.status = 404;
            res.render("./error/404");
        } else {
            console.log(allRestaurants);
            res.render("restaurants/index", { restaurants: allRestaurants});
        }
    })
})

router.post("/search", function (req, res) {
    // get all restaurants from DB
    console.log(req.body);
    var reg = new RegExp(req.body.searchcontent, 'i'); 
    // new RegExp('^' + req.body.searchcontent, 'i')
    Restaurant.find({name: {$regex: reg}}, 'name image description', function (err, fitRestaurants) {
        if (err) {
            console.log(err);
        } else {
            console.log(fitRestaurants);
            res.render("restaurants/search", { restaurants: fitRestaurants});
        }
    })
    Restaurant.where()
})

router.get("/search", function (req, res) {
    Restaurant.find({}, function (err, fitRestaurants) {
        if (err) {
            console.log(err);
        } else {
            console.log(fitRestaurants.sort());
            res.render("restaurants/search", { restaurants: fitRestaurants});
        }
    })
})

//CREATE - add new restaurant to DB
router.post("/", middleware.isLoggedIn, function (req, res) {
    console.log(req.route);
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    if (!name.length) {
        req.flash('error', 'name should not be empty');
        return res.redirect('back');
    }
    if (!image.length) {
        req.flash('error', 'image should not be empty');
        return res.redirect('back');
    }
    var item = { name: name, image: image, description: desc, author: author }
    // Create a new restaurant and save to DB
    console.log(item);
    if(!req.body.location){
        Restaurant.create(item, function (err, newlyCreated) {
            if (err) {
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/restaurants");
            }
        });
    }else{
        req.body.location = req.body.location.replace(/, USA/,"");
        geocoder.geocode(req.body.location, function (err, data) {
            if (err || !data.length) {
                req.flash('error', 'Invalid address');
                return res.redirect('back');
            }
            //var newRestaurant = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
            var item = { name: name, image: image, description: desc, author: author }
            // Create a new restaurant and save to DB
            console.log(item);
            Restaurant.create(item, function (err, newlyCreated) {
                if (err) {
                    console.log(err);
                } else {
                    //redirect back to campgrounds page
                    console.log(newlyCreated);
                    res.redirect("/restaurants");
                }
            });
        });
    }
   
    //uploadRequest(req,res);
});

// function uploadRequest( request,response )
// {
//   var form = new formidable.IncomingForm();
//   form.parse( request, function ( err, fields, files ) {
//     response.end( sys.inspect(
//       {
//         fields : fields,
//         files : files
//       }) );
//   });
// }

//NEW - show form to create new restaurant
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("restaurants/new");
})

router.post("/new", middleware.isLoggedIn, function (req, res) {
    Restaurant.findById(req.params.id, function(err, restaurant){
        if(err){
            console.log(err);
            res.redirect("/restaurants");
        } else {
         Comment.create(req.body.comment, function(err, comment){
            if(err){
                req.flash("error", "Something went wrong");
                console.log(err);
            } else {
                //add username and id to comment
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                //save comment
                comment.save();
                restaurant.comments.push(comment);
                restaurant.save();
                req.flash("success", "Successfully added comment");
                res.redirect('/restaurants/' + restaurant._id);
            }
         });
        }
    });
})

//SHOW - shows more info about one restaurant
router.get("/:id", function (req, res) {
    //find the restaurant with given ID
    Restaurant.findById(req.params.id).populate("comments").exec(function (err, foundRestaurant) {
        if (err) {
            console.log(err);
        } else {
            //console.log(foundRestaurant);
            res.render("restaurants/show", { restaurant: foundRestaurant });
        }
    })
});

// EDIT - 
router.get("/:id/edit", middleware.checkRestaurantOwnership, function (req, res) {
    Restaurant.findById(req.params.id, function (err, foundRestaurant) {
        if (err) {
            console.log(err);
        } else {
            res.render("restaurants/edit", { restaurant: foundRestaurant })
        }
    })
})
// UPDATE  ROUTE
router.put("/:id", middleware.checkRestaurantOwnership, function (req, res) {
    if(!req.body.location){
        var newData = { name: req.body.restaurant.name, image: req.body.restaurant.image, description: req.body.restaurant.description};
        Restaurant.findByIdAndUpdate(req.params.id, newData, function (err, restaurant) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success", "Successfully Updated!");
                res.redirect("/restaurants/" + restaurant._id);
            }
        });
    }else{
        req.body.location = req.body.location.replace(/, USA/,"");
        geocoder.geocode(req.body.location, function (err, data) {
            if (err || !data.length) {
                req.flash('error', 'Invalid address');
                return res.redirect('back');
            }
            var lat = data[0].latitude;
            var lng = data[0].longitude;
            var location = data[0].formattedAddress;
            var newData = { name: req.body.restaurant.name, image: req.body.restaurant.image, description: req.body.restaurant.description, location: location, lat: lat, lng: lng };
            Restaurant.findByIdAndUpdate(req.params.id, newData, function (err, restaurant) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    req.flash("success", "Successfully Updated!");
                    res.redirect("/restaurants/" + restaurant._id);
                }
            });
        });
    } 
});
// DELETE
router.delete("/:id", middleware.checkRestaurantOwnership, function (req, res) {
    Restaurant.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/restaurants");
        }
    })
})

//this is for error message

module.exports = router;