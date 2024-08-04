let express = require('express');
let router = express.Router();
const Administrator = require('../../model/administrators');
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator');

router.get('/',async (req,res) => {
  
    try {
        const administratorId = req.administrator._id;
       
        const administrator = await Administrator.findById(administratorId).select('_id email');
        
        res.json({
          _id: administrator._id,
          email: administrator.email,
        });
      } catch (err) {
        console.log(err)
        res.status(500).json({ message: err });
      }
});

router.put('/password',
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại phải có'),
  body('newPassword').isEmail().withMessage('Mật khẩu mới phải có'),
  async (req, res) => {
  try {
    const id = req.administrator._id;
    const { currentPassword, newPassword } = req.body;

    // Tìm người dùng trong cơ sở dữ liệu
    const administrator = await Administrator.findById(id);

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, administrator.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect',code: 'incorrectCurrentPassword' });
    }

    // Mã hóa mật khẩu mới
    let salt = bcrypt.genSaltSync(10);
    let hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Cập nhật mật khẩu mới cho người dùng
    administrator.password = hashedPassword;
    await administrator.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/info', [
  body('email').isEmail().withMessage('Invalid email address'),
], async (req, res) => {
  try {
    const id = req.administrator._id;
    const { administrator_name, email, phone } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });;
    }


    const administrator = await Administrator.findById(id);

    if (!administrator) {
      return res.status(404).json({ message: 'Administrator not found' });
    }


    const existingAdministrator = await Administrator.findOne({ email });

    if (existingAdministrator && existingAdministrator._id.toString() !== id) {
      return res.status(400).json({ message: 'Email already exists',code: 'email' });
    }


   
    administrator.email = email;
    

    await administrator.save();

    return res.json({ message: 'Administrator information updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;

