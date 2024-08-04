let express = require('express');
let router = express.Router();
const { body, validationResult } = require('express-validator');
const NetWork = require('../../../model/networks');
// Create a new networkư

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Tên mạng lưới không được để trống'),
    body('short_name').notEmpty().withMessage('Tên viết tắt không được để trống'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, short_name, description } = req.body;
      const network = new NetWork({ name, short_name, description });
      await network.save();
      const responseNetwork = network.toObject();
      responseNetwork.id = responseNetwork._id;
      delete responseNetwork._id;
      delete responseNetwork.__v;
      res.status(201).json(responseNetwork);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lỗi server' });
    }
  }
);

// Get all networks with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      transform: (doc) => {
        const network = doc.toObject();
        network.id = network._id;
        delete network._id;
        delete network.__v;
        return network;
      },
    };
    const networks = await NetWork.paginate({}, options);
    const networksData = networks.docs.map(item => {
      return{
        id: item._id,
        name: item.name,
        short_name: item.short_name,
        description: item.description
      }
    })
    res.json({
      networks: networksData,
      totalPages: networks.totalPages,
      currentPage: networks.page,
      totalItems: networks.totalDocs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const network = await NetWork.findById(req.params.id);
    if (!network) {
      return res.status(404).json({ error: 'Không tìm thấy mạng lưới' });
    }
    const responseNetwork = network.toObject();
    responseNetwork.id = responseNetwork._id;
    delete responseNetwork._id;
    delete responseNetwork.__v;
    res.json(responseNetwork);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});


router.put(
  '/:id',
  [
    body('name').notEmpty().withMessage('Tên mạng lưới không được để trống'),
    body('short_name').notEmpty().withMessage('Tên viết tắt không được để trống'),
  
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, short_name, description } = req.body;
      const network = await NetWork.findByIdAndUpdate(
        req.params.id,
        { name, short_name, description },
        { new: true, runValidators: true }
      );
      if (!network) {
        return res.status(404).json({ error: 'Không tìm thấy mạng lưới' });
      }
      const responseNetwork = network.toObject();
      responseNetwork.id = responseNetwork._id;
      delete responseNetwork._id;
      delete responseNetwork.__v;
      res.json(responseNetwork);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lỗi server' });
    }
  }
);

// Delete a network by ID
router.delete('/:id', async (req, res) => {
  try {
    const network = await NetWork.findByIdAndRemove(req.params.id);
    if (!network) {
      return res.status(404).json({ error: 'Không tìm thấy mạng lưới' });
    }
    res.json({ message: 'Xóa mạng lưới thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Delete multiple networks by IDs
router.post('/delete-many', async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await NetWork.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Đã xóa ${result.deletedCount} mạng lưới thành công` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;