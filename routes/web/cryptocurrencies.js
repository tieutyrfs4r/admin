let express = require('express');
let router = express.Router();
const { body, validationResult } = require('express-validator');
const Cryptocurrency = require('../../model/cryptocurrencies');

router.get('/',async (req,res, next) => {
  try {
    res.render('resources/cryptocurrencies/index',
        {
          originalUrl: 'cryptocurrencies'
        }
        );
  } catch (error) {
    next(error)
  }
});

module.exports = router;

