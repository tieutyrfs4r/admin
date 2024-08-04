let express = require('express');
let router = express.Router();
const Wallet = require('../../../model/wallets');
const User = require('../../../model/users');
const TransactionHistory = require('../../../model/transaction_histories');

router.get('/',async (req,res) => {
    // trả về số lượng người dùng
    return res.json({
        message: 'Done'
    })
});





module.exports = router;

