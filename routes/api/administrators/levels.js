let express = require('express');
let router = express.Router();
const { body, validationResult } = require('express-validator');
const Level = require('../../../model/levels');

router.get('/', async (req, res) => {
  try {
    const { keyword, limit, page } = req.query;
    const query = {};

    if (keyword) {
      query.level_name = { $regex: keyword, $options: 'i' };
    }

    const options = {
      limit: limit ? parseInt(limit, 10) : 10,
      page: page ? parseInt(page, 10) : 1,
    };

    const result = await Level.paginate(query, options);
    result.docs = result.docs.map(it => {
      const { level_name, stars, min_score,  priorities, referral_enabled } = it;
      return {
        id: it._id,
        level_name, stars, min_score,  priorities, referral_enabled
      };
    });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', [
  body('level_name').notEmpty().withMessage('Tên level là bắt buộc'),
  body('stars').isNumeric().withMessage('Stars phải là một số'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { level_name, stars, priorities, referral_enabled } = req.body;

  try {
    const newLevel = new Level({
      level_name,
      stars,
      referral_enabled,
      priorities
    });

    await newLevel.save();

    res.status(201).json({ message: 'Thêm mới level thành công', level: {
      id: newLevel._id,
      level_name: newLevel.level_name,
      priorities: newLevel.priorities,
      stars: newLevel.stars,
      referral_enabled: newLevel.referral_enabled,
    } });
  } catch (error) {
    console.error('Lỗi khi thêm mới level:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm mới level' });
  }
});

router.put('/:id', [
  body('level_name').notEmpty().withMessage('Tên level là bắt buộc'),
  body('stars').isNumeric().withMessage('Stars phải là một số'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { level_name, stars, priorities,referral_enabled } = req.body;

    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    
    level.level_name = level_name || level.level_name;
    level.stars = stars || level.stars;
    level.referral_enabled = referral_enabled !== undefined ? referral_enabled : level.referral_enabled;
    level.priorities = priorities || level.priorities;

    const updatedLevel = await level.save();

    res.json({
      id: updatedLevel._id,
      priorities: updatedLevel.priorities,
      stars: updatedLevel.stars,
      referral_enabled: updatedLevel.referral_enabled,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const level = await Level.findByIdAndDelete(id);
    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    res.json({ message: 'Level deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/delete-many', async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await Level.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Levels not found' });
    }
    res.json({ message: 'Levels deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;