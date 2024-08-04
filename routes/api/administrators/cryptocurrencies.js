let express = require('express');
let router = express.Router();
const { body, validationResult } = require('express-validator');
const Cryptocurrency = require('../../../model/cryptocurrencies');
const {removeFilesFromCloudflare, uploadFileAsyncToCloudflare} = require("../../../helpers/common");
const axios = require('axios')
router.get('/',async (req,res) => {
    
    try {
        const { keyword, limit, page,getPrice } = req.query;
        const query = {};
    
        if (keyword) {
          query.cryptocurrency_name = { $regex: keyword, $options: 'i' };
        }
    
        const options = {
          limit: limit ? parseInt(limit, 10) : 10,
          page: page ? parseInt(page, 10) : 1,
        };
    
        const result = await Cryptocurrency.paginate(query, options);
    
      


      if(getPrice){
        const symbols = [...new Set(result.docs.map(cryptocurrency => {
              const symbolRegex = /symbol=(\w+)/;
              const match = cryptocurrency.api_url.match(symbolRegex);
              return match && cryptocurrency.cryptocurrency_name !== 'USDT' ? match[1] : null;
          }).filter(symbol => symbol !== null))];
          const apiUrl = `https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols.map(symbol => `"${symbol}"`).join(',')}]`;
          const response = await axios.get(apiUrl);
          const data = response.data;
          result.docs = result.docs.map(cryptocurrency => {
            if(cryptocurrency.cryptocurrency_name === 'USDT'){
              cryptocurrency.cryptocurrency_current_price = 1
              cryptocurrency.cryptocurrency_change_price = 1
            }else{
              const symbol = symbols.find(symbol => cryptocurrency.api_url.includes(symbol));
              const cryptoData = data.find(item => item.symbol === symbol);
    
              if (cryptoData) {
                  const currentPrice = parseFloat(cryptoData.lastPrice);
                  


                  
                  if (cryptocurrency.usdt_price_diff_type === 'percentage') {
                      adjustedPrice = currentPrice * (1 + cryptocurrency.usdt_price_diff / 100);
                  } else if (cryptocurrency.usdt_price_diff_type === 'value') {
                      adjustedPrice = currentPrice + cryptocurrency.usdt_price_diff;
                  }else if (cryptocurrency.usdt_price_diff_type === 'default') {
                  
                    adjustedPrice = cryptocurrency.usdt_price_diff + cryptocurrency.usdt_price_diff_round_value;
                }
                cryptocurrency.cryptocurrency_current_price = currentPrice.toLocaleString('en-US', {maximumFractionDigits: 8})
                cryptocurrency.cryptocurrency_change_price = adjustedPrice.toLocaleString('en-US', {maximumFractionDigits: 8})
              }
            }
            return cryptocurrency;
        }).filter(result => result !== null);
      }
        result.docs = result.docs.map(it => {
          const {cryptocurrency_name,img_url,usdt_price_diff,usdt_price_diff_type,api_url,default_withdraw_enabled,default_deposit_enabled,default_exchange_enabled,default_use_enabled,usdt_price_diff_round,cryptocurrency_change_price,cryptocurrency_current_price} = it
          return {
            id: it._id,
            cryptocurrency_name,img_url,usdt_price_diff,api_url,usdt_price_diff_type,default_use_enabled,default_deposit_enabled,default_withdraw_enabled,default_exchange_enabled,usdt_price_diff_round,cryptocurrency_change_price,cryptocurrency_current_price
          }
        })
        res.json(result);
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
      }
    
});
router.post('/', [
  body('cryptocurrency_name').notEmpty().withMessage('Tên cryptocurrency là bắt buộc'),
  body('usdt_price_diff_type').isString().withMessage('Loại chênh lệch phải là một chữ'),
  body('usdt_price_diff').isNumeric().withMessage('Tỉ giá USD phải là một số'),

], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { cryptocurrency_name, usdt_price_diff,usdt_price_diff_type,default_deposit_enabled,default_withdraw_enabled,default_exchange_enabled, api_url,img_url,default_use_enabled,usdt_price_diff_round } = req.body;

  try {
    const newCryptocurrency = new Cryptocurrency({
      cryptocurrency_name,
      usdt_price_diff_type,
      usdt_price_diff,
      usdt_price_diff_round,
      img_url,
      api_url,
      default_use_enabled,
      default_withdraw_enabled,default_exchange_enabled,default_deposit_enabled
    });

    // Lưu đối tượng Cryptocurrency vào database
    await newCryptocurrency.save();

    // Trả về kết quả thành công
    res.status(201).json({ message: 'Thêm mới cryptocurrency thành công', cryptocurrency: {
      id: newCryptocurrency._id,
        cryptocurrency_name,
        usdt_price_diff_type,
        usdt_price_diff,
        usdt_price_diff_round,
        img_url,
        default_use_enabled,
        default_withdraw_enabled,default_exchange_enabled,default_deposit_enabled

      } });
  } catch (error) {
    console.error('Lỗi khi thêm mới cryptocurrency:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm mới cryptocurrency' });
  }
});
router.put('/:id', [
  body('cryptocurrency_name').notEmpty().withMessage('Tên cryptocurrency là bắt buộc'),
  body('usdt_price_diff_type').isString().withMessage('Loại chênh lệch phải là một chữ'),
  body('usdt_price_diff').isNumeric().withMessage('Tỉ giá USD phải là một số'),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }
  
      const { id } = req.params;
      const { cryptocurrency_name, usdt_price_diff,usdt_price_diff_type,api_url,default_use_enabled, usdt_price_diff_round, default_deposit_enabled, default_withdraw_enabled,default_exchange_enabled } = req.body;
    
      const cryptocurrency = await Cryptocurrency.findById(id);
      if (!cryptocurrency) {
        return res.status(404).json({ error: 'Cryptocurrency not found' });
      }
  
      cryptocurrency.cryptocurrency_name = cryptocurrency_name || cryptocurrency.cryptocurrency_name;
      cryptocurrency.usdt_price_diff = usdt_price_diff !== undefined ? usdt_price_diff: cryptocurrency.usdt_price_diff;
      cryptocurrency.usdt_price_diff_type = usdt_price_diff_type || cryptocurrency.usdt_price_diff_type;
      cryptocurrency.usdt_price_diff_round = usdt_price_diff_round || cryptocurrency.usdt_price_diff_round;
      cryptocurrency.api_url = api_url || cryptocurrency.api_url;
      cryptocurrency.default_use_enabled = default_use_enabled !== undefined? default_use_enabled : cryptocurrency.default_use_enabled;
      cryptocurrency.default_withdraw_enabled = default_withdraw_enabled !== undefined? default_withdraw_enabled : cryptocurrency.default_withdraw_enabled;
      cryptocurrency.default_deposit_enabled = default_deposit_enabled !== undefined? default_deposit_enabled : cryptocurrency.default_deposit_enabled;
      cryptocurrency.default_exchange_enabled = default_exchange_enabled !== undefined? default_exchange_enabled : cryptocurrency.default_exchange_enabled;

      await cryptocurrency.save();
      const {img_url} = cryptocurrency;
      res.json({
        id: cryptocurrency._id,
        cryptocurrency_name,img_url,usdt_price_diff,api_url,usdt_price_diff_type,default_use_enabled, default_deposit_enabled, default_withdraw_enabled,default_exchange_enabled
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Internal server error' });
    }
})
router.post('/:id/update-image', async (req, res) => {
  try {
    const { id } = req.params;
    const cryptocurrency = await Cryptocurrency.findById(id);
    if (!cryptocurrency) {
      return res.status(404).json({ error: 'Cryptocurrency not found' });
    }

    // Kiểm tra xem có file được gửi lên hay không
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageFile = req.files.image;

    // Xóa ảnh cũ từ S3 (nếu có)
    if (cryptocurrency.img_url) {
      const oldImageKey = cryptocurrency.img_url.replace('/get-file-upload/', '');
      await removeFilesFromCloudflare([oldImageKey]);
    }

    // Upload ảnh mới lên S3
    const uploadResult = await uploadFileAsyncToCloudflare(imageFile);
    const newImageKey = uploadResult.Key;

    // Thêm /get-file-upload/ trước key để làm img_url
    const newImageUrl = `/get-file-upload/${newImageKey}`;

    cryptocurrency.img_url = newImageUrl;
    const updatedCryptocurrency = await cryptocurrency.save();

    res.json({
      img_url: cryptocurrency.img_url
    });
  } catch (error) {
    console.error('Error updating cryptocurrency image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cryptocurrency = await Cryptocurrency.findByIdAndDelete(id);
    if (!cryptocurrency) {
      return res.status(404).json({ error: 'Cryptocurrency not found' });
    }

    res.json({ message: 'Cryptocurrency deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/delete-many', async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await Cryptocurrency.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cryptocurrencies not found' });
    }
    res.json({ message: 'Cryptocurrencies deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

