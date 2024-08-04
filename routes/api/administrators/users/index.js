const express = require('express');
const router = express.Router();
const User = require('../../../../model/users');
const Level = require('../../../../model/levels');
const Wallet = require('../../../../model/wallets');
const Cryptocurrency = require('../../../../model/cryptocurrencies');
const { body, validationResult,query } = require('express-validator');
const bcrypt = require('bcryptjs')
let verifyRouter = require('./verify-users')
const walletRouter = require('./wallets');
const {sendEmail, generateRandomString,generateRandomNumber} = require("../../../../helpers/common");
const e = require('express');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword, status } = req.query;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 },
      populate: [
        { path: 'level', select: 'level_name stars' },
      ],
    };

    const query = {};
    if (keyword) {
      const searchKeyword = new RegExp(keyword, 'i');
      query.$or = [
        { full_name: searchKeyword },
        { email: searchKeyword },
        { phone_number: searchKeyword },
      ];
    }
    if(status){
      query.status = status;
    }

    const users = await User.paginate(query, options);

    for (const user of users.docs) {
      const wallets = await Wallet.find({ user: user._id }).populate('cryptocurrency', '_id cryptocurrency_name default_deposit_enabled default_exchange_enabled default_withdraw_enabled usdt_exchange_rate img_url api_url');
      user.wallets = wallets.map((wallet) => ({
        id: wallet._id,
        cryptocurrency: {
          id: wallet.cryptocurrency._id,
          cryptocurrency_name: wallet.cryptocurrency.cryptocurrency_name,
          usdt_exchange_rate: wallet.cryptocurrency.usdt_exchange_rate,
          img_url: wallet.cryptocurrency.img_url,
          api_url: wallet.cryptocurrency.api_url,
          default_deposit_enabled: wallet.cryptocurrency.default_deposit_enabled,
          default_exchange_enabled: wallet.cryptocurrency.default_exchange_enabled,
          default_withdraw_enabled: wallet.cryptocurrency.default_withdraw_enabled,
        },
        balance_amount: wallet.balance_amount,
        temporarily_withheld: wallet.temporarily_withheld,
        withdraw_enabled: wallet.withdraw_enabled,
        exchange_enabled: wallet.exchange_enabled,
        withdraw_min_amount: wallet.withdraw_min_amount,
        exchange_min_amount: wallet.exchange_min_amount,
        total_number_deposit: wallet.total_number_deposit,
        total_number_withdraw: wallet.total_number_withdraw,
        deposit_network: wallet.deposit_network,
        deposit_address: wallet.deposit_address,
        deposit_default_address_enabled: wallet.deposit_default_address_enabled,
        total_withdraw: wallet.total_withdraw,
        total_deposit: wallet.total_deposit,

      }));
    }

    const formattedUsers = users.docs.map((user) => ({
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      avatar: user.avatar,
      address: user.address,
      ward: user.ward,
      district: user.district,
      province: user.province,
      created_at: user.created_at,
      status: user.status,
      lock_message: user.lock_message,
      lock_message_limit_time: user.lock_message_limit_time,
      show_notify_message: user.show_notify_message,
      notify_type: user.notify_type,
      notify_message: user.notify_message,
      level: user.level ? {
        id: user.level._id,
        level_name: user.level.level_name,
        stars: user.level.stars,
      }: null,
      phone_number: user.phone_number,
      referral_code: user.referral_code,
      invite_code: user.invite_code,
      wallets: user.wallets,
      vnd_wallet: user.vnd_wallet,
      withdraw_limit_count: user.withdraw_limit_count,
      withdraw_min_amount: user.withdraw_min_amount,
      withdraw_enabled: user.withdraw_enabled,
      exchange_enabled: user.exchange_enabled,
      exchange_min: user.exchange_min,
      exchange_max: user.exchange_max,
      usdt_vnd_exchange_diff_enabled: user.usdt_vnd_exchange_diff_enabled,
      usdt_vnd_exchange_diff: user.usdt_vnd_exchange_diff,
      usdt_vnd_exchange_diff_round: user.usdt_vnd_exchange_diff_round,
      usdt_vnd_exchange_diff_round_value: user.usdt_vnd_exchange_diff_round_value,
      usdt_vnd_exchange_diff_type: user.usdt_vnd_exchange_diff_type,
    }));

    res.json({
      docs: formattedUsers,
      totalDocs: users.totalDocs,
      limit: users.limit,
      page: users.page,
      totalPages: users.totalPages,
      hasNextPage: users.hasNextPage,
      hasPrevPage: users.hasPrevPage,
      nextPage: users.nextPage,
      prevPage: users.prevPage,
      pagingCounter: users.pagingCounter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/info/:userId', async (req, res) => {
  try {

    const {userId} = req.params

    const user = await User.findById(userId).populate('level','_id level_name stars min_score');

    if(!user){
      return res.status(404).json({
        error:"Người dùng không tồn tại"
      })
    }

    const wallets = await Wallet.find({ user: user._id }).populate('cryptocurrency', '_id total_number_deposit default_deposit_enabled default_exchange_enabled default_withdraw_enabled total_number_withdraw cryptocurrency_name usdt_exchange_rate img_url  api_url');
    user.wallets = wallets.map((wallet) => ({
      id: wallet._id,
      cryptocurrency: {
        id: wallet.cryptocurrency._id,
        cryptocurrency_name: wallet.cryptocurrency.cryptocurrency_name,
        usdt_exchange_rate: wallet.cryptocurrency.usdt_exchange_rate,
        img_url: wallet.cryptocurrency.img_url,
        api_url: wallet.cryptocurrency.api_url,
        default_deposit_enabled: wallet.cryptocurrency.default_deposit_enabled,
        default_exchange_enabled: wallet.cryptocurrency.default_exchange_enabled,
        default_withdraw_enabled: wallet.cryptocurrency.default_withdraw_enabled,
      },
      balance_amount: wallet.balance_amount,
      total_deposit: wallet.total_deposit,
      total_withdraw: wallet.total_withdraw,
      total_number_deposit: wallet.total_number_deposit,
      total_number_withdraw: wallet.total_number_withdraw,
      temporarily_withheld: wallet.temporarily_withheld,
      withdraw_enabled: wallet.withdraw_enabled,
      withdraw_min_amount: wallet.withdraw_min_amount,
      deposit_network: wallet.deposit_network,
      deposit_address: wallet.deposit_address,
      deposit_default_address_enabled: wallet.deposit_default_address_enabled,
      exchange_enabled: wallet.exchange_enabled,
      exchange_min_amount: wallet.exchange_min_amount,
      exchange_max_amount: wallet.exchange_max_amount,
    }));

    const formattedUser = {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      decode_password: user.decode_password,
      withdraw_pin: user.withdraw_pin,
      email_verified: user.email_verified,
      avatar: user.avatar,
      address: user.address,
      ward: user.ward,
      district: user.district,
      province: user.province,
      created_at: user.created_at,
      status: user.status,
      show_lock_message: user.show_lock_message,
      lock_message: user.lock_message,
      lock_message_limit_time: user.lock_message_limit_time,
      show_notify_message: user.show_notify_message,
      notify_type: user.notify_type,
      notify_message: user.notify_message,
      withdraw_limit_count: user.withdraw_limit_count,
      withdraw_remaining_count: user.withdraw_remaining_count,
      withdraw_min_amount: user.withdraw_min_amount,
      withdraw_enabled: user.withdraw_enabled,
      exchange_enabled: user.exchange_enabled,
      exchange_remaining_count: user.exchange_remaining_count,
      exchange_limit_count: user.exchange_limit_count,
      exchange_min: user.exchange_min,
      exchange_max: user.exchange_max,
      vnd_wallet: user.vnd_wallet,
      usdt_vnd_exchange_diff_enabled: user.usdt_vnd_exchange_diff_enabled,
      usdt_vnd_exchange_diff: user.usdt_vnd_exchange_diff,
      usdt_vnd_exchange_diff_round: user.usdt_vnd_exchange_diff_round,
      usdt_vnd_exchange_diff_round_value: user.usdt_vnd_exchange_diff_round_value,
      usdt_vnd_exchange_diff_type: user.usdt_vnd_exchange_diff_type,
      level: user.level ? {
        id: user.level._id,
        level_name: user.level.level_name,
        stars: user.level.stars,
      }: null,
      phone_number: user.phone_number,
      referral_code: user.referral_code,
      invite_code: user.invite_code,
      wallets: user.wallets,
    };
    res.json(formattedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
    '/create',
    [
      body('full_name').notEmpty().withMessage('Họ và tên là bắt buộc phải có'),
      body('email').isEmail().withMessage('Email không đúng định dạng'),
      body('password').notEmpty().withMessage('Mật khẩu là bắt buộc phải có')
          .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
      body('phone_number').notEmpty().withMessage('Số điện thoại là bắt buộc phải có'),
      body('referral_code').notEmpty().withMessage('Mã giới thiệu là bắt buộc phải có'),
      body('address').notEmpty().withMessage('Địa chỉ là bắt buộc phải có'),
      body('district').notEmpty().withMessage('Huyện là bắt buộc phải có'),
      body('province').notEmpty().withMessage('Tỉnh thành bắt buộc phải có'),
      body('ward').notEmpty().withMessage('Xã phường bắt buộc phải có')
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      try {
        const { full_name, email, password, avatar, address,ward,district,province,status,level,phone_number,referral_code,invite_code } = req.body;

        // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu hay chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'Email đã tồn tại' });
        }
        const referralUser = await User.findOne({ referral_code });
        if (!referralUser) {
          return res.status(400).json({ error: 'Mã giới thiệu không tồn tại' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
          full_name, email, password: hashedPassword, avatar, address,ward,district,province,status,level : (level && level !== '')? level: null,phone_number,referral_code,invite_code
        });

        const cryptocurrencies = await Cryptocurrency.find()



        await user.save();

        const wallets = []
        for(const crypto of cryptocurrencies) {
          const wallet = new Wallet({
            user: user._id,
            cryptocurrency: crypto._id,
            balance_amount: 0,
            temporarily_withheld: null
          })
          await wallet.save()
          wallets.push({
            id: wallet._id,
            balance_amount: wallet.balance_amount,
            cryptocurrency: {
              id: crypto._id,
              cryptocurrency_name: crypto.cryptocurrency_name,
              usdt_exchange_rate: crypto.usdt_exchange_rate,
              img_url: crypto.img_url,
              api_url: crypto.api_url,
            }
          })
        }



        let levelUser =  null

        if(level && level !== ''){
          levelUser = await Level.findOne({ _id: level});
        }



        const forMatUser = {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          avatar: user.avatar,
          address: user.address,
          ward: user.ward,
          district: user.district,
          province: user.province,
          created_at: user.created_at,
          status: user.status,
          level: levelUser ? {
            id: levelUser._id,
            level_name: levelUser.level_name,
            stars: levelUser.stars
          } : null,
          phone_number: user.phone_number,
          referral_code: user.referral_code,
          invite_code: user.invite_code,
          wallets: wallets,
        }

        res.status(201).json({
          user: forMatUser
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
);


router.put('/edit/:id', [
  
  body('notify_type').optional().isIn(['success', 'warning','danger']).withMessage('Type chỉ có thể là thành công, cảnh báo hoặc nguy hiểm'),
  
], async (req, res) => {
  try {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }
    const userId = req.params.id;
    const userData = {};

    if (req.body.full_name) {
      userData.full_name = req.body.full_name;
    }
    if (req.body.email) {
      userData.email = req.body.email;
    }
    if (req.body.email_verified !== undefined) {
      userData.email_verified = req.body.email_verified;
    }
    if (req.body.avatar) {
      userData.avatar = req.body.avatar;
    }
    if (req.body.address) {
      userData.address = req.body.address;
    }
    if (req.body.ward) {
      userData.ward = req.body.ward;
    }
    if (req.body.district) {
      userData.district = req.body.district;
    }
    if (req.body.province) {
      userData.province = req.body.province;
    }
    
    if (req.body.status) {
      if(req.body.status === 'locked'){
        if(!req.body.lock_message || req.body.lock_message === ''){
          return res.status(400).json({
            error: 'Tin nhắn khóa phải có!'
          })
        }
        if (req.body.show_lock_message !== undefined) {
          userData.show_lock_message = req.body.show_lock_message;
        }else{
          userData.show_lock_message = true
        }
        if(req.body.lock_message_limit_time !== undefined){
          userData.lock_message_limit_time = req.body.lock_message_limit_time
        }else{
          userData.lock_message_limit_time = 5
        }
        userData.lock_message = req.body.lock_message;
      }else{
        userData.show_lock_message = false
        userData.lock_message = '';
        userData.lock_message_limit_time = null
      }
      userData.status = req.body.status;
    }
    if (req.body.level) {
      const level = await Level.findById(req.body.level);
      if (level) {
        userData.level = level._id;
      } else {
        return res.status(404).json({
          message: 'Không tìm thấy cấp độ',
        });
      }
    }
    if (req.body.phone_number) {
      userData.phone_number = req.body.phone_number;
    }
    if (req.body.referral_code) {
      userData.referral_code = req.body.referral_code;
    }
    if (req.body.invite_code) {
      userData.invite_code = req.body.invite_code;
    }
    if (req.body.show_notify_message !== undefined) {
      userData.show_notify_message = req.body.show_notify_message;
      if(req.body.show_notify_message){
        if(!req.body.notify_message || !req.body.notify_type)
          {
            return res.status(400).json({
              error:'Nội dung thông báo và loại thông báo phải có'
            })
          }else{
            userData.notify_message = req.body.notify_message
            userData.notify_type = req.body.notify_type
          }
      }
    }
    if (req.body.withdraw_min_amount !== undefined) {
      userData.withdraw_min_amount = req.body.withdraw_min_amount;
    }
    if (req.body.vnd_wallet !== undefined) {
      userData.vnd_wallet = req.body.vnd_wallet;
    }


    if (req.body.withdraw_enabled !== undefined) {
      userData.withdraw_enabled = req.body.withdraw_enabled;
    }
    if (req.body.withdraw_limit_count !== undefined) {
      userData.withdraw_limit_count = req.body.withdraw_limit_count;
    }
    if (req.body.withdraw_remaining_count !== undefined) {
      userData.withdraw_remaining_count = req.body.withdraw_remaining_count;
    }



    if (req.body.exchange_enabled !== undefined) {
      userData.exchange_enabled = req.body.exchange_enabled;
    }
    if (req.body.exchange_limit_count !== undefined) {
      userData.exchange_limit_count = req.body.exchange_limit_count;
    }
    if (req.body.exchange_min !== undefined) {
      userData.exchange_min = req.body.exchange_min;
    }
    if (req.body.exchange_max !== undefined) {
      userData.exchange_max = req.body.exchange_max;
    }
    if (req.body.exchange_remaining_count !== undefined) {
      userData.exchange_remaining_count = req.body.exchange_remaining_count;
    }



    if (req.body.usdt_vnd_exchange_diff_enabled !== undefined) {
      userData.usdt_vnd_exchange_diff_enabled = req.body.usdt_vnd_exchange_diff_enabled;
    }
    if (req.body.usdt_vnd_exchange_diff !== undefined) {
      userData.usdt_vnd_exchange_diff = req.body.usdt_vnd_exchange_diff;
    }
    if (req.body.usdt_vnd_exchange_diff_type !== undefined) {
  
      userData.usdt_vnd_exchange_diff_type = req.body.usdt_vnd_exchange_diff_type;
      if(req.body.usdt_vnd_exchange_diff_type === 'default'){
      
        if (req.body.usdt_vnd_exchange_diff_round !== undefined) {
          userData.usdt_vnd_exchange_diff_round = req.body.usdt_vnd_exchange_diff_round;
        }else{
          userData.usdt_vnd_exchange_diff_round = 0
        }
      }
    
    }

    const userUpdated = await User.findByIdAndUpdate(userId, userData, { new: true });
    if (!userUpdated) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng!' });
    }

    const user = await User.findById(userUpdated._id).populate('level','_id level_name stars min_score');

    if(!user){
      return res.status(404).json({
        error:"Người dùng không tồn tại"
      })
    }

    const wallets = await Wallet.find({ user: user._id }).populate('cryptocurrency', '_id cryptocurrency_name usdt_exchange_rate img_url  api_url');
    user.wallets = wallets.map((wallet) => ({
      id: wallet._id,
      cryptocurrency: {
        id: wallet.cryptocurrency._id,
        cryptocurrency_name: wallet.cryptocurrency.cryptocurrency_name,
        usdt_exchange_rate: wallet.cryptocurrency.usdt_exchange_rate,
        img_url: wallet.cryptocurrency.img_url,
        api_url: wallet.cryptocurrency.api_url,
      },
      balance_amount: wallet.balance_amount,
      total_deposit: wallet.total_deposit,
      total_withdraw: wallet.total_withdraw,
      temporarily_withheld: wallet.temporarily_withheld,
    }));

    const formattedUser = {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      avatar: user.avatar,
      address: user.address,
      ward: user.ward,
      district: user.district,
      province: user.province,
      created_at: user.created_at,
      status: user.status,
      level: user.level ? {
        id: user.level._id,
        level_name: user.level.level_name,
        stars: user.level.stars,
      }: null,
      phone_number: user.phone_number,
      referral_code: user.referral_code,
      invite_code: user.invite_code,
      wallets: user.wallets,
      show_lock_message: user.show_lock_message,
      lock_message: user.lock_message,
      lock_message_limit_time: user.lock_message_limit_time,
      withdraw_enabled: user.withdraw_enabled,
      withdraw_limit_count: user.withdraw_limit_count,
      withdraw_remaining_count: user.withdraw_remaining_count,
      exchange_enabled: user.exchange_enabled,
      exchange_limit_count: user.exchange_limit_count,
      exchange_min: user.exchange_min,
      exchange_max: user.exchange_max,
      show_notify_message: user.show_notify_message,
      notify_type: user.notify_type,
      notify_message: user.notify_message,
      exchange_remaining_count: user.exchange_remaining_count,
      usdt_vnd_exchange_diff_enabled: user.usdt_vnd_exchange_diff_enabled,
      usdt_vnd_exchange_diff: user.usdt_vnd_exchange_diff,
      usdt_vnd_exchange_diff_round: user.usdt_vnd_exchange_diff_round,
      usdt_vnd_exchange_diff_round_value: user.usdt_vnd_exchange_diff_round_value,
      usdt_vnd_exchange_diff_type: user.usdt_vnd_exchange_diff_type,
    };
    res.json(formattedUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.delete('/delete/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/delete-many', async (req, res) => {
  try {
    const userIds = req.body.ids;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    const result = await User.deleteMany({ _id: { $in: userIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Không người dùng nào được tìm thấy' });
    }

    res.json({ message: `${result.deletedCount} người dùng xóa thành công` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Generate a random verification code

router.post('/send-reset-password-code/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a verification code
    const verificationCode =  generateRandomNumber(6).toUpperCase()

    // Update the user with the verification code and its expiry time
    user.recovery_password_token = verificationCode;
    user.recovery_password_token_expire = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Send the email
    await sendEmail(user.email, 'Đặt lại mật khẩu của bạn', 'clients/email-templates/reset-password', {
      fullName: user.full_name,
      verificationCode: verificationCode
    });

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/send-verification-email/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Tìm người dùng theo userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Tạo mã xác minh email ngẫu nhiên
    const verificationCode = generateRandomString(32).toLowerCase()

    // Cập nhật mã xác minh email cho người dùng
    user.email_verify_code = verificationCode;
    await user.save();

    // Gửi email xác minh
    const verificationLink = `${req.protocol}://${req.get('host')}/clients/verify-email?userId=${userId}&token=${verificationCode}`;
    await sendEmail(
        user.email,
        'Xác minh địa chỉ email của bạn',
        'clients/email-templates/email-verification',
        {
          fullName: user.full_name,
          verificationLink: verificationLink
        }
    );

    res.status(200).json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Error sending verification email:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.use('/verifies',verifyRouter);
router.use('/wallets',walletRouter);

module.exports = router;