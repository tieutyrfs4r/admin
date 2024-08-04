require('dotenv').config();
const bcrypt = require('bcryptjs');
let express = require('express');
let router = express.Router();
let Administrator = require('../../../model/administrators')
const jwt = require('jsonwebtoken');
const { body,validationResult  } = require('express-validator');
const TOKEN_SECRET = process.env.TOKEN_SECRET
const {generateRandomString} = require('../../../helpers/common')

router.post('/login',
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      try {
        const administrator = await Administrator.findOne({ email });

        if (!administrator) {
          return res.status(404).json({ message: 'Not found' });
        }

        const isMatch = await bcrypt.compare(password, administrator.password);

        if (!isMatch) {
          return res.status(401).json({ message: 'Incorrect password' });
        }

        const newSecretKey = generateRandomString();
        administrator.secretKey = newSecretKey;
        await administrator.save();

        const payload = { id: administrator._id, email: administrator.email, secretKey: newSecretKey };

        const token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: '24h' });


        res.cookie('token', token, {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });

        return res.json({ message: 'Login successful' });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
);

router.post('/logout', async (req, res) => {
    try {
        // Lấy token từ cookie
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, TOKEN_SECRET);


        const administrator = await Administrator.findOne({ _id: decoded.id, email: decoded.email, secretKey: decoded.secretKey });

        if (!administrator) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Xóa secretKey của administrator
        administrator.secretKey = null;
        await administrator.save();

        // Xóa token khỏi cookie
        res.clearCookie('token');

        return res.json({ message: 'Logout successful' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/register',
    body('email').notEmpty().isEmail().custom(value => {
      return Administrator.findOne({ email: value }, '_id').then(administrator => {
        if (administrator) {
          return Promise.reject('Email already exists');
        }
      })
    }),
    body('password').notEmpty().isLength({ min: 6 }),
    body('referral_code').notEmpty().custom(value => {
      return Administrator.findOne({ invite_code: value }, '_id').then(administrator => {
        if (!administrator) {
          return Promise.reject('Invalid referral code');
        }
      })
    }),
    (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });;
      }
      let { administrator_name, email, password, phone_number, referral_code } = req.body
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(password, salt);
      let administrator = new Administrator()
      administrator.administrator_name = administrator_name
      administrator.email = email
      administrator.password = hash
      administrator.referral_code = referral_code
      administrator.save().then(data => {
        return res.json({
          message: 'register done'
        })
      }).catch(err => {
        return res.status(500).json({
          message: err
        })
      })
    }
)

module.exports = router;

