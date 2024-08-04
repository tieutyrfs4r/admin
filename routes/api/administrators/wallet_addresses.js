const express = require('express');
const router = express.Router();
const WalletAddress = require('../../../model/wallet_addresses');
const Network = require('../../../model/networks');
const { query, body, validationResult } = require('express-validator');

// Lấy danh sách địa chỉ ví (có phân trang)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 10000 }).toInt(),
  query('sort_by').optional().isIn(['cryptocurrency', 'address', 'network']),
  query('sort_order').optional().isIn(['-1', '1']).toInt(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'cryptocurrency', select: '_id cryptocurrency_name img_url' },
        { path: 'network', select: '_id name short_name' },
      ],
    };

    const query = {};
    if (keyword) {
      const searchKeyword = new RegExp(keyword, 'i');
      query.$or = [
        { address: searchKeyword },
        { 'network.name': searchKeyword },
        { 'network.short_name': searchKeyword },
        { 'cryptocurrency.cryptocurrency_name': searchKeyword },
      ];
    }

    const walletAddresses = await WalletAddress.paginate(query, options);

    const formattedWalletAddresses = walletAddresses.docs.map((walletAddress) => ({
      id: walletAddress._id,
      address: walletAddress.address,
      description: walletAddress.description,
      use_enabled: walletAddress.use_enabled,
      cryptocurrency: walletAddress.cryptocurrency ? {
        id: walletAddress.cryptocurrency._id,
        cryptocurrency_name: walletAddress.cryptocurrency.cryptocurrency_name,
        img_url: walletAddress.cryptocurrency.img_url,
      } : null,
      network: walletAddress.network ? {
        id: walletAddress.network._id,
        name: walletAddress.network.name,
        short_name: walletAddress.network.short_name,
      } : null,
    }));

    res.json({
      docs: formattedWalletAddresses,
      totalDocs: walletAddresses.totalDocs,
      limit: walletAddresses.limit,
      page: walletAddresses.page,
      totalPages: walletAddresses.totalPages,
      hasNextPage: walletAddresses.hasNextPage,
      hasPrevPage: walletAddresses.hasPrevPage,
      nextPage: walletAddresses.nextPage,
      prevPage: walletAddresses.prevPage,
      pagingCounter: walletAddresses.pagingCounter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lấy một địa chỉ ví cụ thể
router.get('/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const walletAddress = await WalletAddress.findById(id)
      .populate('cryptocurrency', '_id cryptocurrency_name img_url')
      .populate('network', '_id name short_name');
    if (!walletAddress) {
      return res.status(404).json({ error: 'Wallet address not found' });
    }
    const formattedWalletAddress = {
      id: walletAddress._id,
      address: walletAddress.address,
      description: walletAddress.description,
      use_enabled: walletAddress.use_enabled,
      cryptocurrency: walletAddress.cryptocurrency ? {
        id: walletAddress.cryptocurrency._id,
        cryptocurrency_name: walletAddress.cryptocurrency.cryptocurrency_name,
        img_url: walletAddress.cryptocurrency.img_url,
      } : null,
      network: walletAddress.network ? {
        id: walletAddress.network._id,
        name: walletAddress.network.name,
        short_name: walletAddress.network.short_name,
      } : null,
    };
    res.json(formattedWalletAddress);
  } catch (error) {
    console.error('Error retrieving wallet address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Thêm một địa chỉ ví mới
router.post(
  '/',
  [
    body('cryptocurrency').notEmpty().withMessage('Loại tiền điện tử là bắt buộc'),
    body('address').notEmpty().withMessage('Địa chỉ ví là bắt buộc'),
    body('network').notEmpty().withMessage('Mạng lưới là bắt buộc').isMongoId().withMessage('Mạng lưới không hợp lệ'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { cryptocurrency, address, network, description, use_enabled } = req.body;
      const existingNetwork = await Network.findById(network);
      console.log(existingNetwork)
      if (!existingNetwork) {
        return res.status(400).json({ error: 'Mạng lưới không tồn tại' });
      }
      const walletAddress = new WalletAddress({
        cryptocurrency,
        address,
        use_enabled,
        network,
        description,
      });
      await walletAddress.save();

      const populatedWalletAddress = await WalletAddress.findById(walletAddress._id)
        .populate('cryptocurrency', '_id cryptocurrency_name img_url')
        .populate('network', '_id name short_name');

      const formattedWalletAddress = {
        id: populatedWalletAddress._id,
        cryptocurrency: {
          id: populatedWalletAddress.cryptocurrency._id,
          cryptocurrency_name: populatedWalletAddress.cryptocurrency.cryptocurrency_name,
          img_url: populatedWalletAddress.cryptocurrency.img_url,
        },
        address: populatedWalletAddress.address,
        use_enabled: populatedWalletAddress.use_enabled,
        network: {
          id: populatedWalletAddress.network._id,
          name: populatedWalletAddress.network.name,
          short_name: populatedWalletAddress.network.short_name,
        },
        description: populatedWalletAddress.description,
      };

      res.status(201).json(formattedWalletAddress);
    } catch (error) {
      console.error('Lỗi khi tạo địa chỉ ví:', error);
      res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
  }
);

// Cập nhật một địa chỉ ví
router.put(
  '/:id',
  [
    body('cryptocurrency').notEmpty().withMessage('Loại tiền điện tử là bắt buộc'),
    body('address').notEmpty().withMessage('Địa chỉ ví là bắt buộc'),
    body('network').notEmpty().withMessage('Mạng lưới là bắt buộc').isMongoId().withMessage('Mạng lưới không hợp lệ'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { cryptocurrency, address, network, description, use_enabled } = req.body;
      const existingNetwork = await Network.findById(network);
      if (!existingNetwork) {
        return res.status(400).json({ error: 'Mạng lưới không tồn tại' });
      }
      const walletAddress = await WalletAddress.findByIdAndUpdate(
        id,
        { cryptocurrency, address, network, description, use_enabled },
        { new: true }
      )
        .populate('cryptocurrency', '_id cryptocurrency_name img_url')
        .populate('network', '_id name short_name');

      if (!walletAddress) {
        return res.status(404).json({ error: 'Không tìm thấy địa chỉ ví' });
      }

      const formattedWalletAddress = {
        id: walletAddress._id,
        cryptocurrency: {
          id: walletAddress.cryptocurrency._id,
          cryptocurrency_name: walletAddress.cryptocurrency.cryptocurrency_name,
          img_url: walletAddress.cryptocurrency.img_url,
        },
        address: walletAddress.address,
        network: {
          id: walletAddress.network._id,
          name: walletAddress.network.name,
          short_name: walletAddress.network.short_name,
        },
        description: walletAddress.description,
        use_enabled: walletAddress.use_enabled,
      };

      res.json(formattedWalletAddress);
    } catch (error) {
      console.error('Lỗi khi cập nhật địa chỉ ví:', error);
      res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
  }
);

// Xóa một địa chỉ ví
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const walletAddress = await WalletAddress.findByIdAndDelete(id);
    if (!walletAddress) {
      return res.status(404).json({ error: 'Wallet address not found' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting wallet address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Xóa nhiều địa chỉ ví
router.delete('/delete-many', async (req, res) => {
  try {
    const { ids } = req.body;
    await WalletAddress.deleteMany({ _id: { $in: ids } });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting multiple wallet addresses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;