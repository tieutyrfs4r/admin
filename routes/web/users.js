let express = require('express');
let router = express.Router();

router.get('/',async (req,res,next) => {
    try {

        res.render('resources/users/index',{
            originalUrl: 'users'
        });
    } catch (error) {
        next(error)
    }
});
router.get('/:userId',async (req,res,next) => {
    try {
        res.render('resources/user/index',{
            userId: req.params.userId,
            originalUrl: 'users'
        });
    } catch (error) {
        next(error)
    }
});
module.exports = router;

