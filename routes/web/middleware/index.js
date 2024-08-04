const jwt = require("jsonwebtoken");
const Administrator = require("../../../model/administrators");
const User = require("../../../model/users");
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const handleInternalServerError = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { page_name: '500' });
}

const handleNotFound = (req, res, next) => {
    try {
        const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(`DIA CHI IP: ${userIP}`);
        const userAgent = req.headers['user-agent'];
        console.log(`TRINH DUYET: ${userAgent}`);
    } catch (e) {
        console.log(e);
    }
    res.status(404).render('404', { page_name: '404 | Not Found' });
}
const authMiddleware = async (req, res, next) => {
    try {
        // Lấy token từ cookie
        const token = req.cookies.token;

        if (!token) {
            return res.redirect('/login');
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
        return res.redirect('/login');
    }
};


module.exports = {
    handleInternalServerError,
    handleNotFound,
    authMiddleware,
}
