let express = require('express');
let router = express.Router();
const Wallet = require('../../model/wallets');
const User = require('../../model/users');
const TransactionHistory = require('../../model/transaction_histories');

router.get('/',async (req,res,next) => {
    try {

        res.render('resources/transaction-histories/index',{
            originalUrl: 'transaction-histories'
        });
    } catch (error) {
        next(error)
    }
});


module.exports = router;

