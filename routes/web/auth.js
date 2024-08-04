let express = require('express');
const jwt = require("jsonwebtoken");
const Administrator = require("../../model/administrators");
let router = express.Router();
const TOKEN_SECRET = process.env.TOKEN_SECRET
router.get('/',(req,res,next) => {
    return res.redirect('/login');
})
router.get('/login', async (req, res, next) => {
    try {
        // Lấy token từ cookie
        const token = req.cookies.token;

        if (token) {
            try {
                // Giải mã token
                const decoded = jwt.verify(token, TOKEN_SECRET);

                // Tìm administrator dựa trên thông tin từ token
                const administrator = await Administrator.findOne({ _id: decoded.id, email: decoded.email, secretKey: decoded.secretKey });

                if (administrator) {
                    // Nếu người dùng đã đăng nhập, chuyển hướng đến trang dashboard
                    return res.redirect('/dashboard');
                }
            } catch (err) {
                // Nếu token không hợp lệ, xóa token khỏi cookie
                res.clearCookie('token');
            }
        }

        // Nếu người dùng chưa đăng nhập, hiển thị trang đăng nhập (trả về file EJS)
        res.render('resources/login/index');
    } catch (error) {
        next(error);
    }
});
router.get('/logout', async (req, res) => {
    try {
        // Lấy token từ cookie
        const token = req.cookies.token;

        if (!token) {
            return res.redirect('/login');
        }

        // Giải mã token
        const decoded = jwt.verify(token, TOKEN_SECRET);


        const administrator = await Administrator.findOne({ _id: decoded.id, email: decoded.email, secretKey: decoded.secretKey });

        if (!administrator) {
            return res.redirect('/login'); // Chuyển hướng đến trang đăng nhập nếu token không hợp lệ
        }

        // Xóa secretKey của administrator
        administrator.secretKey = null;
        await administrator.save();

        // Xóa token khỏi cookie
        res.clearCookie('token');

        return res.redirect('/login'); // Chuyển hướng đến trang đăng nhập sau khi đăng xuất thành công
    } catch (err) {
        console.error(err);
        return res.redirect('/login'); // Chuyển hướng đến trang đăng nhập nếu có lỗi
    }
});

module.exports = router;

