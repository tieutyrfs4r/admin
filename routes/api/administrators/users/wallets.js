const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Wallet = require('../../../../model/wallets');
const User = require('../../../../model/users');
const Cryptocurrency = require('../../../../model/cryptocurrencies');



// Middleware để kiểm tra user_id
const checkUserId = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.body.user_id;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.userId = userId;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /:userId - Lấy danh sách ví của người dùng
router.get('/user/:userId', checkUserId, async (req, res) => {
    try {
        const wallets = await Wallet.find({ user: req.userId })
            .populate('cryptocurrency', '_id cryptocurrency_name usdt_exchange_rate img_url api_url');

        const modifiedWallets = wallets.map(wallet => {
            const modifiedWallet = wallet.toObject();
            modifiedWallet.id = modifiedWallet._id;
            delete modifiedWallet._id;
            delete modifiedWallet.__v;
            if (modifiedWallet.cryptocurrency) {
                modifiedWallet.cryptocurrency.id = modifiedWallet.cryptocurrency._id;
                delete modifiedWallet.cryptocurrency._id;
                delete modifiedWallet.cryptocurrency.__v;
            }
            return modifiedWallet;
        });

        res.json(modifiedWallets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /wallets - Thêm mới một ví
router.post(
    '/user/:userId/create',
    checkUserId,
    [
        body('cryptocurrency').notEmpty().withMessage('Loại tiền điện tử bắt buộc phải có'),
        body('balance_amount').optional().isNumeric().withMessage('Số tiền phải là một số'),
        body('total_deposit').optional().isNumeric().withMessage('Tổng nạp phải là một số'),
        body('total_withdraw').optional().isNumeric().withMessage('Tổng rút phải là một số'),
        body('total_number_deposit').optional().isNumeric().withMessage('Tổng lần nạp phải là một số'),
        body('total_number_withdraw').optional().isNumeric().withMessage('Tổng lần rút phải là một số'),
        body('temporarily_withheld.amount').optional().isNumeric().withMessage('Số tiền bị tạm giữ pha là một số'),
        body('temporarily_withheld.reason').optional().isString().withMessage('Lý do phải là dạng chữ'),
        body('temporarily_withheld.start_date_withheld').optional().isISO8601().withMessage('Ngày bắt đầu phải là ngày tháng'),
        body('temporarily_withheld.end_date_withheld').optional().isISO8601().withMessage('Ngày kết thúc phải là ngày tháng'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });;
        }

        try {
            const { cryptocurrency } = req.body;

            // Kiểm tra xem cryptocurrency có tồn tại không
            const existingCryptocurrency = await Cryptocurrency.findById(cryptocurrency);
            if (!existingCryptocurrency) {
                return res.status(404).json({ error: 'Cryptocurrency not found' });
            }
            const dataUpdate = {
                ...req.body
            }
            
            const existWallet = await Wallet.findOne({
                user:req.userId,
                cryptocurrency: cryptocurrency
            })
            if(existWallet){
                return res.status(400).json({ error: 'Ví này đã tồn tại, không thể tạo thêm' });
            }
            if(dataUpdate.temporarily_withheld && dataUpdate.temporarily_withheld.amount === 0){
                dataUpdate.temporarily_withheld.start_date_withheld = null
                dataUpdate.temporarily_withheld.end_date_withheld = null
                dataUpdate.temporarily_withheld.reason = null
            }
            const wallet = new Wallet({
                user: req.userId,
                ...dataUpdate,
            });
            await wallet.save();

            const walletData = await Wallet.findById(wallet._id).populate('cryptocurrency','cryptocurrency_name usdt_exchange_rate img_url _id')

            const response = {
                temporarily_withheld: {
                    amount: walletData.temporarily_withheld.amount || 0,
                    reason: walletData.temporarily_withheld.reason || null,
                    start_date_withheld: walletData.temporarily_withheld.start_date_withheld || null,
                    end_date_withheld: walletData.temporarily_withheld.end_date_withheld || null
                },
                user: walletData.user.toString(),
                cryptocurrency: {
                    cryptocurrency_name: walletData.cryptocurrency.cryptocurrency_name,
                    usdt_exchange_rate: walletData.cryptocurrency.usdt_exchange_rate,
                    img_url: walletData.cryptocurrency.img_url,
                    id: walletData.cryptocurrency._id.toString()
                },
                balance_amount: walletData.balance_amount,
                total_deposit: walletData.total_deposit,
                total_withdraw: walletData.total_withdraw,
                total_number_deposit: walletData.total_number_deposit,
                total_number_withdraw: walletData.total_number_withdraw,
                withdraw_enabled: walletData.withdraw_enabled,
                withdraw_min_amount: walletData.withdraw_min_amount,
                exchange_min_amount: walletData.exchange_min_amount,
                exchange_max_amount: walletData.exchange_max_amount,
                deposit_network: walletData.deposit_network,
                deposit_address: walletData.deposit_address,
                deposit_default_address_enabled: walletData.deposit_default_address_enabled,
                id: walletData._id.toString()
            };

            res.status(201).json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// PUT /:id - Sửa một ví
router.put(
    '/user/:userId/edit/:id',
    checkUserId,
    [
        body('balance_amount').optional().isNumeric().withMessage('Số tiền phải là một số'),
        body('total_deposit').optional().isNumeric().withMessage('Tổng nạp phải là một số'),
        body('total_withdraw').optional().isNumeric().withMessage('Tổng rút phải là một số'),
        body('withdraw_min_amount').optional().isNumeric().withMessage('Số tiền giới hạn rút phải là một số'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
    
        try {
            const walletId = req.params.id;
            const updateFields = {};

            if (req.body.cryptocurrency) {
                updateFields.cryptocurrency = req.body.cryptocurrency;
            }

            if (req.body.balance_amount !== undefined) {
                updateFields.balance_amount = req.body.balance_amount;
            }
            if (req.body.total_deposit !== undefined) {
                updateFields.total_deposit = req.body.total_deposit;
            }
            if (req.body.total_withdraw !== undefined) {
                updateFields.total_withdraw = req.body.total_withdraw;
            }

            if (req.body.total_number_deposit !== undefined) {
                updateFields.total_number_deposit = req.body.total_number_deposit;
            }
            if (req.body.total_number_withdraw !== undefined) {
                updateFields.total_number_withdraw = req.body.total_number_withdraw;
            }
            if (req.body.withdraw_enabled !== undefined) {
                updateFields.withdraw_enabled = req.body.withdraw_enabled;
            }
            if (req.body.exchange_enabled !== undefined) {
                updateFields.exchange_enabled = req.body.exchange_enabled;
            }
            if (req.body.withdraw_min_amount !== undefined) {
                updateFields.withdraw_min_amount = req.body.withdraw_min_amount;
            }
            if (req.body.exchange_min_amount !== undefined) {
                updateFields.exchange_min_amount = req.body.exchange_min_amount;
            }
            if (req.body.deposit_default_address_enabled !== undefined) {
                updateFields.deposit_default_address_enabled = req.body.deposit_default_address_enabled;
                if(!req.body.deposit_default_address_enabled){
                    updateFields.deposit_network = null
                    updateFields.deposit_address = null
                }else{
                    updateFields.deposit_network = req.body.deposit_network
                    updateFields.deposit_address = req.body.deposit_address
                }
            }

            if (req.body.exchange_max_amount !== undefined) {
                updateFields.exchange_max_amount = req.body.exchange_max_amount;
            }
            if (req.body.temporarily_withheld) {
                if (req.body.temporarily_withheld.amount !== undefined && req.body.temporarily_withheld.amount !== 0) {
                    updateFields['temporarily_withheld.amount'] = req.body.temporarily_withheld.amount;
                    if (req.body.temporarily_withheld.reason !== undefined) {
                        updateFields['temporarily_withheld.reason'] = req.body.temporarily_withheld.reason;
                    }

                    if (req.body.temporarily_withheld.start_date_withheld !== undefined) {
                        updateFields['temporarily_withheld.start_date_withheld'] = req.body.temporarily_withheld.start_date_withheld;
                    }

                    if (req.body.temporarily_withheld.end_date_withheld !== undefined) {
                        updateFields['temporarily_withheld.end_date_withheld'] = req.body.temporarily_withheld.end_date_withheld;
                    }
                }else{
                    updateFields['temporarily_withheld.amount'] = null;
                    updateFields['temporarily_withheld.start_date_withheld'] = null;
                    updateFields['temporarily_withheld.end_date_withheld'] = null;
                    updateFields['temporarily_withheld.reason'] = null;
                }
            }

            if (Object.keys(updateFields).length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }
            const wallet = await Wallet.findOneAndUpdate(
                { _id: walletId, user: req.userId },
                { $set: updateFields },
                { new: true }
            ).populate('cryptocurrency', 'cryptocurrency_name usdt_exchange_rate img_url ');

            if (!wallet) {
                return res.status(404).json({ error: 'Wallet not found' });
            }

            const response = {
                temporarily_withheld: {
                    amount: wallet.temporarily_withheld.amount || 0,
                    reason: wallet.temporarily_withheld.reason || null,
                    start_date_withheld: wallet.temporarily_withheld.start_date_withheld || null,
                    end_date_withheld: wallet.temporarily_withheld.end_date_withheld || null
                },
                user: wallet.user.toString(),
                cryptocurrency: {
                    cryptocurrency_name: wallet.cryptocurrency.cryptocurrency_name,
                    usdt_exchange_rate: wallet.cryptocurrency.usdt_exchange_rate,
                    img_url: wallet.cryptocurrency.img_url,
                    id: wallet.cryptocurrency._id.toString()
                },
                balance_amount: wallet.balance_amount,
                total_deposit: wallet.total_deposit,
                total_withdraw: wallet.total_withdraw,
                total_number_deposit: wallet.total_number_deposit,
                total_number_withdraw: wallet.total_number_withdraw,
                withdraw_enabled: wallet.withdraw_enabled,
                withdraw_min_amount: wallet.withdraw_min_amount,
                exchange_min_amount: wallet.exchange_min_amount,
                exchange_max_amount: wallet.exchange_max_amount,
                deposit_network: wallet.deposit_network,
                deposit_address: wallet.deposit_address,
                deposit_default_address_enabled: wallet.deposit_default_address_enabled,
                id: wallet._id.toString()
            };

            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// DELETE /:id - Xóa một ví
router.delete('/user/:userId/delete/:id', checkUserId, async (req, res) => {
    try {
        const wallet = await Wallet.findOneAndDelete({ _id: req.params.id, user: req.params.userId });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /wallets - Xóa nhiều ví
router.delete('/user/:userId/delete-many', checkUserId, async (req, res) => {
    try {
        const { walletIds } = req.body;
        if (!Array.isArray(walletIds) || walletIds.length === 0) {
            return res.status(400).json({ error: 'Invalid wallet IDs' });
        }
        const result = await Wallet.deleteMany({ _id: { $in: walletIds }, user: req.userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'No wallets found' });
        }
        res.json({ message: `${result.deletedCount} wallets deleted successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;