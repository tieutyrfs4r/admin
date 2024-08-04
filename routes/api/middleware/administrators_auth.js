const { default: mongoose } = require('mongoose');
const Administrator = require('../../../model/administrators')
const jwt = require('jsonwebtoken');
const TOKEN_SECRET = process.env.TOKEN_SECRET
const administratorAuthenticateToken = async (req, res, next) => {
    try {
        // Lấy token từ cookie
        const token = req.cookies.token;

        if (!token) {
            return res.sendStatus(403);
        }


        const decoded = jwt.verify(token, TOKEN_SECRET);


        // const administrator = await Administrator.findOne({ _id: decoded.id, email: decoded.email, secretKey: decoded.secretKey });

        const administrator = await Administrator.findOne({ _id: decoded.id, email: decoded.email });

        if (!administrator) {
            return res.redirect('/login');
        }

        req.administrator = administrator;

        next();
    } catch (err) {
        console.error(err);
        return res.sendStatus(403);
    }
};

module.exports = {
  administratorAuthenticateToken
}
