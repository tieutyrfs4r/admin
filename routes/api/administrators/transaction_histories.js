const express = require('express');
const router = express.Router();
const { query, body, validationResult } = require('express-validator');
const TransactionHistory = require('../../../model/transaction_histories');
const User = require('../../../model/users');
const Wallet = require('../../../model/wallets');


router.get(
    '/',
    [
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('user').optional().isMongoId(),
      query('transaction_types').optional().isArray(),
      query('transaction_types.*').optional().isIn(['deposit', 'withdraw', 'sell', 'buy', 'exchange', 'withdraw-vnd']),
      query('transaction_status').optional().isArray(),
      query('transaction_status.*').optional().isIn(['pending', 'success', 'failed','cancelled']),
      query('cryptocurrency').optional().isMongoId(),
      query('receiver_wallet_address').optional().isString(),
      query('transaction_network').optional().isString(),
      query('sort_by').optional().isIn(['created_at', 'transaction_status','cryptocurrency','transaction_type','transaction_amount']),
      query('sort_order').optional().isIn(['-1', '1']).toInt(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
    
          return res.status(400).json({ error: errors.array()[0].msg });
      }

      try {
        const { page = 1, limit = 10, user, transaction_types,transaction_status, cryptocurrency, receiver_wallet_address, transaction_network, sort_by = 'created_at', sort_order = -1 } = req.query;

        const query = {};
        if (user) {
          query.user = user;
        }
        if (transaction_types) {
          query.transaction_type = { $in: transaction_types };
        }
        if (transaction_status && transaction_status.length > 0) {
            query.transaction_status = { $in: transaction_status };
        }
        if (cryptocurrency) {
          query.cryptocurrency = cryptocurrency;
        }
        if (receiver_wallet_address) {
          query.receiver_wallet_address = receiver_wallet_address;
        }
        if (transaction_network) {
          query.transaction_network = transaction_network;
        }

        const sort = {};
        sort[sort_by] = sort_order;

        const options = {
          page,
          limit,
          sort,
            populate: [
                { path: 'user', select: 'full_name email avatar' },
                { path: 'cryptocurrency', select: 'cryptocurrency_name img_url' },
            ],
        };

          const transactions = await TransactionHistory.paginate(query, options);

          const transformedTransactions = transactions.docs.map((transaction) => {
              const transformedTransaction = transaction.toObject();
              transformedTransaction.id = transformedTransaction._id;
              delete transformedTransaction._id;
              delete transformedTransaction.__v;

              if (transformedTransaction.user) {
                  transformedTransaction.user.id = transformedTransaction.user._id;
                  delete transformedTransaction.user._id;
                  delete transformedTransaction.user.__v;
              }

              if (transformedTransaction.cryptocurrency) {
                  transformedTransaction.cryptocurrency.id = transformedTransaction.cryptocurrency._id;
                  delete transformedTransaction.cryptocurrency._id;
                  delete transformedTransaction.cryptocurrency.__v;
              }

              return transformedTransaction;
          });

          res.json({
              ...transactions,
              docs: transformedTransactions,
          });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
);
router.get(
    '/info/:transactionId',    async (req, res) => {


      try {

          const { transactionId } = req.params;
          const transaction = await TransactionHistory.findById(transactionId).populate('user','_id full_name avatar').populate('cryptocurrency', '_id cryptocurrency_name usdt_exchange_rate img_url  api_url');

          if (!transaction) {
              return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
          }

          const transformedTransaction = transaction.toObject();




          transformedTransaction.id = transformedTransaction._id;
          delete transformedTransaction._id;
          delete transformedTransaction.__v;

          if (transformedTransaction.user) {
              transformedTransaction.user.id = transformedTransaction.user._id;
              delete transformedTransaction.user._id;
              delete transformedTransaction.user.__v;
          }

          if (transformedTransaction.cryptocurrency) {
              transformedTransaction.cryptocurrency.id = transformedTransaction.cryptocurrency._id;
              delete transformedTransaction.cryptocurrency._id;
              delete transformedTransaction.cryptocurrency.__v;
          }
          res.json(transformedTransaction);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
);


router.put(
    '/edit/:id',
    [
        body('cryptocurrency').optional().isMongoId(),
        body('receiver_wallet_address').optional().isString(),
        body('transaction_network').optional().isString(),
        body('local_bank_info.account_number').optional().isString(),
        body('local_bank_info.account_name').optional().isString(),
        body('local_bank_info.bank_name').optional().isString(),
        body('local_bank_info.branch_name').optional().isString(),
        body('transaction_amount').optional().isNumeric(),
        body('balance_before_transaction').optional().isNumeric(),
        body('balance_after_transaction').optional().isNumeric(),
        body('transaction_status').optional().isIn(['pending', 'success', 'failed']),
        body('created_at').optional().isISO8601(),
        body('updated_at').optional().isISO8601(),
        body('failure_reason').optional().isString(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        try {
            const transactionId = req.params.id;
            const updateFields = {};
            const transactionHistory = await TransactionHistory.findById(transactionId);
            if (!transactionHistory) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            if (req.body.cryptocurrency) {
                updateFields.cryptocurrency = req.body.cryptocurrency;
            }
            if (req.body.receiver_wallet_address) {
                updateFields.receiver_wallet_address = req.body.receiver_wallet_address;
            }
            if (req.body.transaction_network) {
                updateFields.transaction_network = req.body.transaction_network;
            }
            if (req.body.local_bank_info) {
                updateFields.local_bank_info = req.body.local_bank_info;
            }
            if (req.body.transaction_amount) {
                updateFields.transaction_amount = req.body.transaction_amount;
            }
            if (req.body.balance_before_transaction) {
                updateFields.balance_before_transaction = req.body.balance_before_transaction;
            }
            if (req.body.balance_after_transaction) {
                updateFields.balance_after_transaction = req.body.balance_after_transaction;
            }
            if (req.body.transaction_status) {
                updateFields.transaction_status = req.body.transaction_status;
                if (req.body.transaction_status === 'success' && !transactionHistory.counted) {
                    if (transactionHistory.transaction_type === 'deposit') {
                        const wallet = await Wallet.findOne({user: transactionHistory.user, cryptocurrency: transactionHistory.cryptocurrency})
                        updateFields.balance_before_transaction = wallet.balance_amount

                        wallet.balance_amount += transactionHistory.transaction_amount

                        wallet.total_deposit += transactionHistory.transaction_amount
                        wallet.total_number_deposit += 1
                        console.log(wallet.total_number_deposit)
                        await wallet.save()
                        updateFields.balance_after_transaction = wallet.balance_amount

                    } else if (transactionHistory.transaction_type === 'sell') {
                        const totalAmount = transactionHistory.transaction_amount * transactionHistory.transaction_rate;
                        await User.findByIdAndUpdate(
                            transactionHistory.user,
                            { $inc: { vnd_wallet: totalAmount } }
                        );
                    }else if (transactionHistory.transaction_type === 'withdraw') {
                        const wallet = await Wallet.findOne({user: transactionHistory.user, cryptocurrency: transactionHistory.cryptocurrency})
                        wallet.total_withdraw += transactionHistory.transaction_amount
                        wallet.total_number_withdraw += 1
                        await wallet.save()
                    }
                    updateFields.counted = true;
                }else if ((req.body.transaction_status === 'failed' || req.body.transaction_status === 'canceled') && !transactionHistory.counted) {
                    if (transactionHistory.transaction_type === 'sell') {
                        await Wallet.findOneAndUpdate(
                            { user: transactionHistory.user, cryptocurrency: transactionHistory.cryptocurrency },
                            { $inc: { balance_amount: transactionHistory.transaction_amount} }
                        );
                    } else if (transactionHistory.transaction_type === 'withdraw-vnd') {
                        await User.findByIdAndUpdate(
                            transactionHistory.user,
                            { $inc: { vnd_wallet: transactionHistory.transaction_amount } }
                        );
                    }else if (transactionHistory.transaction_type === 'withdraw') {
                        await Wallet.findOneAndUpdate(
                            { user: transactionHistory.user, cryptocurrency: transactionHistory.cryptocurrency },
                            { $inc: { balance_amount: transactionHistory.transaction_amount } }
                        );
                    }
                    updateFields.balance_after_transaction =  transactionHistory.balance_before_transaction
                    updateFields.counted = true;
                }
            }
            if (req.body.created_at) {
                updateFields.created_at = req.body.created_at;
                if (!req.body.updated_at) {
                    updateFields.updated_at = Date.now();
                }
            }
            if (req.body.updated_at) {
                updateFields.updated_at = req.body.updated_at;
            }
            if (req.body.failure_reason) {
                updateFields.failure_reason = req.body.failure_reason;
            }
            await TransactionHistory.findByIdAndUpdate(transactionId, updateFields, { new: true });
            const transactionData = await TransactionHistory.findById(transactionId).populate('cryptocurrency')

           const transformedTransaction = transactionData.toObject();
            transformedTransaction.id = transformedTransaction._id;
            delete transformedTransaction._id;
            delete transformedTransaction.__v;

            if (transformedTransaction.cryptocurrency) {
                transformedTransaction.cryptocurrency.id = transformedTransaction.cryptocurrency._id;
                delete transformedTransaction.cryptocurrency._id;
                delete transformedTransaction.cryptocurrency.__v;
            }


            res.json(transformedTransaction);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

router.delete('/delete/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await TransactionHistory.findByIdAndDelete(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post(
    '/delete-many',
    [
      body('transactionIds').isArray().notEmpty(),
      body('transactionIds.*').isMongoId(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ error: errors.array()[0].msg });
      }

      try {
        const { transactionIds } = req.body;
        const result = await TransactionHistory.deleteMany({ _id: { $in: transactionIds } });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'No transactions found' });
        }
        res.json({ message: `${result.deletedCount} transactions deleted successfully` });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
);

module.exports = router;