const express = require('express');
const router = express.Router();
const User = require('../../../../model/users');
const VerifyUser = require('../../../../model/verifies_user');

const { body, validationResult, query } = require('express-validator');
const Wallet = require('../../../../model/wallets');

// Middleware để kiểm tra user_id
const checkUserId = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /:userId - Lấy thông tin xác minh của một người dùng
router.get('/:userId', checkUserId, async (req, res) => {
    try {
        const verifiesUser = await VerifyUser.find({ user: req.params.userId }).sort({ update_at: -1 });;
        if (!verifiesUser) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin xác minh người dùng' });
        }
        const formattedVerifiesUser = verifiesUser.map(verify => ({
            id: verify._id,
            user: verify.user,
            update_at: verify.update_at,
            subject: verify.subject,
            requested: verify.requested,
            submitted_information: verify.submitted_information,
            status: verify.status,
            fail_reason: verify.fail_reason,
            allow_appeal: verify.allow_appeal,
            enable_payment_request: verify.enable_payment_request,
            payment_request_cryptocurrency: verify.payment_request_cryptocurrency,
            payment_request_amount: verify.payment_request_amount,
           
            payment_request_counted: verify.payment_request_counted,
            
            payment_request_receiver_wallet_address: verify.payment_request_receiver_wallet_address,
            payment_request_transaction_network: verify.payment_request_transaction_network
        }));
        res.json(formattedVerifiesUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /:userId/info/:verifyId - Lấy thông tin chi tiết của một bản ghi xác minh
router.get('/:userId/info/:verifyId', checkUserId, async (req, res) => {
    try {
        const { userId, verifyId } = req.params;
        const verifyUser = await VerifyUser.findOne({ user: userId, _id: verifyId })
        if (!verifyUser) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin xác minh người dùng' });
        }

        const currentTime = new Date();
        const formattedVerifyUser = {
            id: verifyUser._id,
            user: verifyUser.user,
            update_at: currentTime,
            subject: verifyUser.subject,
            requested: verifyUser.requested,
            submitted_information: verifyUser.submitted_information,
            status: verifyUser.status,
            fail_reason: verifyUser.fail_reason,
            allow_appeal: verifyUser.allow_appeal,
            enable_payment_request: verifyUser.enable_payment_request,
            payment_request_cryptocurrency: verifyUser.payment_request_cryptocurrency,
            payment_request_amount: verifyUser.payment_request_amount,
          
            payment_request_counted: verifyUser.payment_request_counted,
        
            payment_request_receiver_wallet_address: verifyUser.payment_request_receiver_wallet_address,
            payment_request_transaction_network: verifyUser.payment_request_transaction_network
        };
        res.json(formattedVerifyUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /:userId/create - Thêm mới thông tin xác minh cho một người dùng
router.post(
    '/:userId/create',
    checkUserId,
    [
        body('subject').optional().isString().withMessage('Loại xác minh phải là một chuỗi'),
        body('requested').optional().isString().withMessage('Yêu cầu phải là một chuỗi'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        try {
            const currentTime = new Date();
            const verifyUser = new VerifyUser({
                user: req.params.userId,
                ...req.body,
                update_at: currentTime,
                status: 'pending',
                fail_reason: undefined,
                allow_appeal: true,
                enable_payment_request: req.body.enable_payment_request || false,
                payment_request_cryptocurrency: req.body.payment_request_cryptocurrency && req.body.payment_request_cryptocurrency !== ''? req.body.payment_request_cryptocurrency : null,
                payment_request_amount: req.body.payment_request_amount,
              
                payment_request_counted: false,
                payment_request_receiver_wallet_address: req.body.payment_request_receiver_wallet_address,
                payment_request_transaction_network: req.body.payment_request_transaction_network
            });
            await verifyUser.save();
            res.status(201).json(verifyUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// PUT /:userId/edit/:verifyUserId - Chỉnh sửa thông tin xác minh của một người dùng
router.put(
    '/:userId/edit/:verifyUserId',
    checkUserId,
    [
        body('subject').optional().isString().withMessage('Tiêu đề phải là một chuỗi'),
        body('requested').optional().isString().withMessage('Yêu cầu phải là một chuỗi'),
        body('status').optional().isIn(['pending', 'failed', 'success']).withMessage('Trạng thái không hợp lệ'),
        body('fail_reason').optional().isString().withMessage('Lý do thất bại phải là một chuỗi'),
        body('allow_appeal').optional().isBoolean().withMessage('Cho phép kháng cáo phải là một giá trị boolean'),
        body('enable_payment_request').optional().isBoolean().withMessage('Cho phép yêu cầu thanh toán phải là một giá trị boolean'),
  
        body('payment_request_amount').optional().isNumeric().withMessage('Số tiền yêu cầu thanh toán phải là một số'),
        body('payment_request_counted').optional().isBoolean().withMessage('Đã đếm yêu cầu thanh toán phải là một giá trị boolean'),
        body('payment_request_receiver_wallet_address').optional().isString().withMessage('Địa chỉ ví người nhận yêu cầu thanh toán phải là một chuỗi'),
        body('payment_request_transaction_network').optional().isString().withMessage('Mạng giao dịch yêu cầu thanh toán phải là một chuỗi')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        try {
            const { userId, verifyUserId } = req.params;
            const updateFields = {};

            const verifyUserData = await VerifyUser.findOne(
                { _id: verifyUserId, user: userId }
               
            );

            if(!verifyUserData){
                return res.status(404).json({ error: 'Không tìm thấy thông tin xác minh' });
            }
            if (req.body.requested !== undefined) {
                updateFields.requested = req.body.requested;
            }
            if (req.body.subject !== undefined) {
                updateFields.subject = req.body.subject;
            }

            if (req.body.submitted_information !== undefined) {
                updateFields.submitted_information = req.body.submitted_information;
            }

            if (req.body.status !== undefined) {
                updateFields.status = req.body.status;
            }

            if (req.body.fail_reason !== undefined) {
                updateFields.fail_reason = req.body.fail_reason;
            }

    
            if (updateFields.status !== 'success') {
                if (req.body.allow_appeal !== undefined) {
                    updateFields.allow_appeal = req.body.allow_appeal;
                } else {
                    updateFields.allow_appeal = true;
                }
                updateFields.fail_reason = req.body.fail_reason;
            } else {
                updateFields.allow_appeal = false;
                updateFields.fail_reason = '';
                
            }


            if (req.body.enable_payment_request !== undefined) {
                updateFields.enable_payment_request = req.body.enable_payment_request;
            }

            if (req.body.payment_request_cryptocurrency !== undefined) {
                updateFields.payment_request_cryptocurrency = req.body.payment_request_cryptocurrency;
            }

            if (req.body.payment_request_amount !== undefined) {
                updateFields.payment_request_amount = req.body.payment_request_amount;
            }
            if (req.body.payment_request_counted !== undefined) {
                updateFields.payment_request_counted = req.body.payment_request_counted;
            }
            if (req.body.payment_request_receiver_wallet_address !== undefined) {
                updateFields.payment_request_receiver_wallet_address = req.body.payment_request_receiver_wallet_address;
            }

            if (req.body.payment_request_transaction_network !== undefined) {
                updateFields.payment_request_transaction_network = req.body.payment_request_transaction_network;
            }
            // if (req.body.payment_request_counted !== undefined) {
            //     updateFields.payment_request_counted = req.body.payment_request_counted;
                  
            // }
            if (updateFields.status === 'success' && !verifyUserData.payment_request_counted) {
                const wallet = await Wallet.findOne({
                    user: userId,
                    cryptocurrency: verifyUserData.payment_request_cryptocurrency
                })
                wallet.balance_amount+= verifyUserData.payment_request_amount
                await wallet.save()
                updateFields.payment_request_counted = true;
            }  
            if (req.body.status === 'failed') {
                if (!req.body.fail_reason) {
                    return res.status(400).json({ error: 'Bắt buộc phải cung cấp lý do khi trạng thái là thất bại' });
                }
                if (req.body.allow_appeal === undefined) {
                    return res.status(400).json({ error: 'Bắt buộc phải cung cấp giá trị cho phép kháng cáo khi trạng thái là thất bại' });
                }
            }

            if (Object.keys(updateFields).length > 0) {
                updateFields.updated_at = new Date();
            }
            
            const verifyUser = await VerifyUser.findOneAndUpdate(
                { _id: verifyUserId, user: userId },
                { $set: updateFields },
                { new: true }
            );
           
            if (!verifyUser) {
                return res.status(404).json({ error: 'Không tìm thấy thông tin xác minh người dùng' });
            }

            res.json(verifyUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// DELETE /:userId/:verifyUserId - Xóa thông tin xác minh của một người dùng
router.delete('/:userId/delete/:verifyUserId', checkUserId, async (req, res) => {
    try {
        const { userId, verifyUserId } = req.params;
        const verifyUser = await VerifyUser.findOneAndDelete({ _id: verifyUserId, user: userId });
        if (!verifyUser) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin xác minh người dùng' });
        }
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /:userId - Xóa nhiều thông tin xác minh của một người dùng
router.delete('/delete-many/:userId', checkUserId, async (req, res) => {
    try {
        const { userId } = req.params;
        const { verifyUserIds } = req.body;

        if (!Array.isArray(verifyUserIds) || verifyUserIds.length === 0) {
            return res.status(400).json({ error: 'Invalid verify user IDs' });
        }

        const result = await VerifyUser.deleteMany({ _id: { $in: verifyUserIds }, user: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'No verify users found' });
        }

        res.json({ message: `${result.deletedCount} verify users deleted successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;