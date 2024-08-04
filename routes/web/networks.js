let express = require('express');
let router = express.Router();

router.get('/',async (req,res,next) => {
    try {
        res.render('resources/networks/index',{
            originalUrl: 'networks'
        });
    } catch (error) {
        next(error)
    }
});

module.exports = router;

