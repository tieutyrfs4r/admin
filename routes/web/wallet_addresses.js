let express = require('express');
let router = express.Router();

router.get('/',async (req,res,next) => {
  try {

    res.render('resources/wallet-addresses/index',{
      originalUrl: 'wallet-addresses'
    });
  } catch (error) {
    next(error)
  }
});

module.exports = router;

