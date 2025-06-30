const fetch = require('axios');
const tls = require("tls");
const env = require('dotenv');
env.config();

tls.DEFAULT_MIN_VERSION = "TLSv1.3";

module.exports = {
    redeemvouchers: async function (voucher_code) {
        //voucher_code = voucher_code.replace('https://gift.truemoney.com/campaign/?v=','');
        
        if (!/^[a-z0-9]*$/i.test(voucher_code)) {
            return {
                status: 'FAIL',
                reason: 'Voucher only allows English alphabets or numbers.'
            };
        }

        if (voucher_code.length <= 0) {
            return {
                status: 'FAIL',
                reason: 'Voucher code cannot be empty.'
            };
        }

        const phone_number = process.env.PHONE_NUMBER || '';

        const data = {
            mobile: phone_number,
            voucher_hash: voucher_code
        };

        try {
            const response = await fetch.post(
                `https://gift.truemoney.com/campaign/vouchers/${voucher_code}/redeem`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
                        'Accept': '*/*',
                        'Origin': 'https://gift.truemoney.com',
                        'Referer': 'https://gift.truemoney.com/'
                    }
                }
            );


            const resjson = response?.data;

            if (resjson?.status?.code === 'SUCCESS') {
                return {
                    status: 'SUCCESS',
                    amount: parseInt(resjson.data.voucher.redeemed_amount_baht)
                };
            } else {
                return {
                    status: 'FAIL',
                    reason: resjson?.status?.message || 'Unknown failure reason from API.'
                };
            }

        } catch (err) {
            // Handle network or unexpected errors
            return {
                status: 'FAIL',
                reason: err?.response?.data?.status?.message || err.message || 'Unexpected error occurred.'
            };
        }
    }
};
