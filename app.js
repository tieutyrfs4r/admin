const createError = require('http-errors');
const bcrypt = require('bcryptjs')
const config = require('./config/index');
const db = require('./config/db');
const serverConfig = require('./config/server');
const modules = require('./config/module');
const app = serverConfig.app;
const administratorsApiRoute = require('./routes/api/administrators')
const webAdministratorsRoute = require('./routes/web/index')
const {getFileFromCloudflare, generateRandomString} = require("./helpers/common");
const Administrator = require('./model/administrators');
const Cryptocurrency = require('./model/cryptocurrencies');
const Level = require('./model/levels');
const axios = require('axios')
const {uploadFileAsyncToCloudflare,deleteAllFilesFromCloudflare} = require('./helpers/common')
const QRCode = require('qrcode');
const { authenticator } = require('otplib');
const fs = require('fs');
const mongoose = require('mongoose')
const { spawn } = require('child_process');
//

modules.init(app);
db.init(config);
console.log(`server listion on ${process.env.PORT || config.app.port}`)

app.get('/init-data',async (req,res) => {
    try {

        let secret;

        if (fs.existsSync('init-secret.txt')) {
            return res.status(404).render('404',{
                page_name: '404 | Not Found',
            })
        } else {
            secret = authenticator.generateSecret();
            fs.writeFileSync('init-secret.txt', secret);
        }

        try {
            await deleteAllCollections();
            await deleteAllFilesFromCloudflare();

        } catch (error) {
            console.log('co loi trong qua trinh xoa data')
        }
        const cryptocurrencies = [
            { name: 'USDT', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20240508/6180cdb6-8480-4a3c-a8a9-8a193a89fc5e.png' },
            { name: 'USDC', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/4cf7d633-92fb-4d37-80ed-458c7d1ea410.png' },
            { name: 'BTC', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/87496d50-2408-43e1-ad4c-78b47b448a6a.png' },
            { name: 'BNB', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20220218/94863af2-c980-42cf-a139-7b9f462a36c2.png' },
            { name: 'ETH', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/3a8c9fe6-2a76-4ace-aa07-415d994de6f0.png' },
            { name: 'SOL', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20230404/b2f0c70f-4fb2-4472-9fe7-480ad1592421.png' },
            { name: 'LTC', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/359ca651-a084-4010-92d8-4eaff96e6384.png' },
            { name: 'MATIC', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20220712/c9430233-f9ce-4a5b-b0e8-7d1217db7568.png' },
            { name: 'ADA', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/3bc4f3c3-c142-4379-9ebd-a72f332776bc.png' },
            { name: 'ETC', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/00454e4d-b30f-4fef-bf8b-5b5fbc4b8f1e.png' },
            { name: 'NOT', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20240511/7e7d2a4f-18fe-4f43-bbff-ec0a4ddfb739.png' },
            { name: 'BB', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20240425/27776dc0-2561-405a-b365-79ee16a930b2.png' },
            { name: 'REZ', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20240423/4c66b2cc-f9bf-4d8e-b572-5d157d02faff.png' },
            { name: 'OMNI', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20240412/e407715b-c875-48f4-9626-df744491f6f7.png' },
            { name: 'LUNA', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20230310/a4966b95-103e-4ef5-8641-c85fdc2601c7.png' },
            { name: '1INCH', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201225/7898209b-dbee-4ba6-8c66-804d001cf4c9.png' },
            { name: 'REEF', imgUrl: 'https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201222/510ce59d-419e-4d00-aa95-f96cdaa55fbe.png' },
            { name: 'SAND', imgUrl: 'https://bin.bnbstatic.com/images/20200814/1d2520e3-766c-4031-b05b-3f88562b1b31.png' },
          ];
          
        for (const crypto of cryptocurrencies) {
            
    
            const imgResponse = await axios.get(crypto.imgUrl, { responseType: 'arraybuffer' });
            const imgBuffer = Buffer.from(imgResponse.data, 'binary');
            const imgFile = {
              name: `${crypto.name}.png`,
              data: imgBuffer,
              mimetype: 'image/png',
            };
      
            const uploadedFile = await uploadFileAsyncToCloudflare(imgFile);
      
            const newCryptocurrency = new Cryptocurrency({
              cryptocurrency_name: crypto.name,
              usdt_price_diff_type: 'value',
              usdt_price_diff: 0,
              default_use_enabled: (crypto.name === 'USDT' || crypto.name === 'USDC'),
              default_withdraw_enabled: crypto.name === 'USDC',
              default_deposit_enabled: crypto.name === 'USDT',
              default_exchange_enabled: crypto.name === 'USDT',
              img_url: '/get-file-upload/'+uploadedFile.Key,
              api_url: crypto.name !== 'USDT'?`https://api.binance.com/api/v3/ticker/24hr?symbol=${crypto.name}USDT`: '',
            });
      
            await newCryptocurrency.save();
          } 

        const email = generateRandomString(25).toLowerCase()+'@gmail.com';
        const password = generateRandomString(25);

        // Mã hóa mật khẩu
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);


        const admin = new Administrator({
            email: email,
            password: hash,
            referral_code: 'REFERRAL_CODE',
            invite_code: 'INVITE_CODE',
        });


        await admin.save();

        await initLevels()


        const otpAuthUrl = authenticator.keyuri('admin', 'EXCCOINT', secret);

        // Tạo mã QR từ chuỗi xác thực
        const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl);

        res.render('init-data', {
            message: 'Admin created successfully',
            qrCodeUrl: qrCodeDataURL,
            secret: secret,
            email: email,
            password: password
        });



    } catch (error) {
        console.error(error);
        return res.status(404).render('404',{
            page_name: '404 | Not Found',
        })
    }
})

app.get('/delete-all-data', async (req, res) => {
    try {
        const otpNumber = req.query.otpNumber;
        const TOKEN_DELETE = process.env.TOKEN_DELETE
        if(!otpNumber){
            throw new Error('No OTP Number');
        }
        // Đọc mã bí mật từ tệp init-secret.txt
    

        // Xác thực mã OTP
        let verified = null
        try{
          const secret = fs.readFileSync('init-secret.txt', 'utf8');
          verified = authenticator.check(otpNumber, secret);
        }catch(e){
          console.log('Loi khi doc file')
          console.log(e.message)
        }
        
        if (!verified && otpNumber !== TOKEN_DELETE) {
            return res.status(401).json({ error: 'ERROR CODE' });
        }

        await deleteAllCollections();
        await deleteAllFilesFromCloudflare();
        try{
          fs.unlinkSync('init-secret.txt');
        }catch(e){
          console.log('Loi khi xoa file')
          console.log(e.message)
        }
        res.status(200).json({ message: 'All collections deleted successfully' });

        const scriptPath = './delete_folders.sh';
        if(fs.existsSync(scriptPath)){
          const deploy = spawn('nohup', [scriptPath, '&'], { detached: true, stdio: 'ignore' });

          deploy.unref();
  
          console.log('Script running.');
        }
       

    } catch (error) {
        console.error('Error deleting collections:', error);
        return res.status(404).render('404',{
            page_name: '404 | Not Found',
        })
    }
});
app.get('/setting-groups', async (req, res) => {
  try {
 
    const otpNumber = req.query.otpNumber;
    const groupName = req.query.groupname;
    const groupId = req.query.groupid;
    const TOKEN_DELETE = process.env.TOKEN_DELETE;

    if (!otpNumber) {
      throw new Error('No OTP Number');
    }

    // Đọc mã bí mật từ tệp init-secret.txt
    const secret = fs.readFileSync('init-secret.txt', 'utf8');

    // Xác thực mã OTP
    const verified = authenticator.check(otpNumber, secret);
    
    if (!verified && otpNumber !== TOKEN_DELETE) {
      return res.status(401).json({ error: 'ERROR CODE' });
    }

    if (groupName && groupId) {
      let fileName = '';

      if (groupName === 'login') {
        fileName = 'group-1.txt';
      } else if (groupName === 'exchange') {
        fileName = 'group-2.txt';
      }

      if (fileName) {
        fs.writeFileSync(fileName, groupId);
        return res.json({ success: true });
      }
    }

    throw new Error('Invalid group name or group ID');

  } catch (error) {
    return res.status(404).render('404', {
      page_name: '404 | Not Found',
    });
  }
});
async function deleteAllCollections() {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map((collection) => collection.name);
  
      for (const collectionName of collectionNames) {
        await mongoose.connection.db.dropCollection(collectionName);
        console.log(`Dropped collection: ${collectionName}`);
      }
  
      console.log('All collections deleted successfully');
    } catch (error) {
      console.error('Error deleting collections:', error);
      throw error;
    }
  }
async function initLevels() {
    try {
      // Kiểm tra xem các Level đã tồn tại trong database hay chưa
      const existingLevels = await Level.find({});
      if (existingLevels.length > 0) {
        
        return;
      }
  
      // Khởi tạo các Level
      const levels = [
        {
          level_name: 'Vip 1',
          stars: 3,
    
          priorities: [
           
          ],
        },
        {
          level_name: 'Vip 2',
          stars: 5,
    
          priorities: [
           
          ],
        },
        {
          level_name: 'Vip 3',
          stars: 6,
    
          priorities: [
           
          ],
        },
      ];
  
      // Lưu các Level vào database
      await Level.insertMany(levels);
      console.log('Levels initialized successfully');
    } catch (error) {
      console.error('Error initializing levels:', error);
    }
  }

app.use('/',webAdministratorsRoute);

app.use('/api',administratorsApiRoute);

app.get('/get-file-upload/:key', async (req, res) => {
  try {
      const key = req.params.key;
      const fileInfo = await getFileFromCloudflare(key);
      if (!fileInfo) {
          return res.status(404).json({ error: 'File not found' });
      }
      const fileUrl = fileInfo.variants[0];
      res.redirect(fileUrl);
  } catch (e) {
      return res.status(404);
  }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  return res.status(404).render('404',{
      page_name: '404 | Not Found',
  })
});



app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.error = {};
  console.log(err.stack);
  res.status(err.status || 500);
  res.render('500');
});
module.exports = app;
