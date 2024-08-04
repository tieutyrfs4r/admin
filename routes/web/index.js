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
let transactionHistoriesRouter = require('./transaction-histories')
let accountSettingRouter = require('./account-settings')

const { handleInternalServerError, handleNotFound, authMiddleware} = require("./middleware");
// Error handling routes
router.get('/500', handleInternalServerError);
router.get('/404', handleNotFound);

router.use(authRouter)
router.use('/dashboard', authMiddleware, dashboardRouter);
router.use('/cryptocurrencies', authMiddleware, cryptocurrenciesRouter);
router.use('/levels', authMiddleware, levelsRouter);
router.use('/networks', authMiddleware, networksRouter);
router.use('/profile', authMiddleware, profileRouter);
router.use('/wallet-addresses', authMiddleware, walletAddressesRouter);
router.use('/users', authMiddleware, usersRouter);
router.use('/transaction-histories', authMiddleware, transactionHistoriesRouter);
router.use('/account-settings', authMiddleware, accountSettingRouter);


module.exports = router;

