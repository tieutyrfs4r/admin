let express = require('express');
let router = express.Router();
const { body, validationResult } = require('express-validator');
const Administrator = require('../../../model/administrators');
const bcrypt = require('bcryptjs');

router.get('/admin-info', async (req, res) => {
  try {
    const admin = await Administrator.findById(req.administrator._id).select('-password -secretKey');
    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }

    res.json({
      email: admin.email,
      referral_code: admin.referral_code,
      invite_code: admin.invite_code,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.put('/update-admin', [
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('referral_code').optional().notEmpty().withMessage('Referral code is required'),
  body('invite_code').optional().notEmpty().withMessage('Invite code is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, referral_code, invite_code } = req.body;
    const updateFields = {};

    if (email) {
      updateFields.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    if (referral_code) {
      updateFields.referral_code = referral_code;
    }

    if (invite_code) {
      updateFields.invite_code = invite_code;
    }

    const admin = await Administrator.findByIdAndUpdate(req.administrator._id, updateFields, { new: true });
    res.json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;