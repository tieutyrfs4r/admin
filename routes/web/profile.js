let express = require('express');
let router = express.Router();

router.get('/',async (req,res,next) => {
    try {
        res.render('resources/profile/index',{
            originalUrl: 'profile'
        });
    } catch (error) {
        next(error)
    }
});

module.exports = router;

