const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { redeemvouchers } = require('./truewallet.js');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

// 🔐 Middleware ตรวจสอบ API Key
app.use((req, res, next) => {
  const token = req.headers['x-api-key'];
  if (!token || token !== process.env.API_KEY) {
    return res.status(403).json({ status: 'FAIL', reason: 'Invalid API key' });
  }
  next();
});

app.post('/redeem', async (req, res) => {
    const { code } = req.body;

    // validate & clean
    const match = code.match(/[?&]v=([a-zA-Z0-9]+)/);
    const cleanedCode = match ? match[1] : code;

    try {
        const result = await redeemvouchers(cleanedCode);
        if (result.status === 'SUCCESS') {
            return res.json({
                status: 'SUCCESS',
                amount: result.amount,
                message: `เติมพ้อยต์สำเร็จ`
            });
        } else {
            return res.json(result);
        }
    } catch (err) {
        return res.status(500).json({
            status: 'FAIL',
            reason: err.message || 'ไม่ทราบสาเหตุ'
        });
    }
});

app.listen(3000, () => {
    console.log('✅ Redeem API started on port 3000');
});
