var router = require('express').Router();
var async = require('async');
var faker = require('faker');
var Category = require('../models/category');
var Product = require('../models/product');

router.post('/search', function (req, res, next) {
  console.log(req.body.search_term);
  Product.search({
    query_string: { query: req.body.search_term }
  }, function (err, results) {
    if (err) return next(err);
    res.json(results);
  });
});

router.get('/:name', function (req, res, next) {
  async.waterfall([
    function (callback) {
      Category.findOne({ name: req.params.name }, function (err, category) {
        if (err) return next(err);
        callback(null, category);
      });
    },

    function (category, callback) {
      for (var i = 0; i < 30; i++) {
        var product = new Product();
        try {
          product.category = category._id;
          product.name = faker.commerce.productName();
          product.price = faker.commerce.price();
          product.image = faker.image.image();
          product.save();
        } catch (err) {
          callback(err, null);
        }
      }
    },


  ], function (err, data) {
    console.log('11');
    if (err) {
      next(err);
    }
    res.json({ message: data });
  });
});

module.exports = router;