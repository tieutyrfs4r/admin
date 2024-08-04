let express = require('express');
let router = express.Router();
let authRouter = require('./auth')
let dashboardRouter = require('./dashboard')
let cryptocurrenciesRouter = require('./cryptocurrencies')
let levelsRouter = require('./levels')
let networksRouter = require('./networks')
let profileRouter = require('./profile')
let walletAddressesRouter = require('./wallet_addresses')
let usersRouter = require('./users')
let transactionHistoriesRouter = require('./transaction_histories')
let accountSettingRouter = require('./account-settings')
const { administratorAuthenticateToken }= require('../middleware/administrators_auth')
router.use(authRouter)
router.use('/dashboard',administratorAuthenticateToken,dashboardRouter);
router.use('/cryptocurrencies',administratorAuthenticateToken,cryptocurrenciesRouter);
router.use('/levels',administratorAuthenticateToken,levelsRouter);
router.use('/networks',administratorAuthenticateToken,networksRouter);
router.use('/profile',administratorAuthenticateToken,profileRouter);
router.use('/wallet-addresses',administratorAuthenticateToken,walletAddressesRouter);
router.use('/users',administratorAuthenticateToken,usersRouter);
router.use('/transaction-histories',administratorAuthenticateToken,transactionHistoriesRouter);
router.use('/account-settings',administratorAuthenticateToken,accountSettingRouter);


module.exports = router;

