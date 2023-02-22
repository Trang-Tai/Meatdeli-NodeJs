import db from '../models/index';
import 'dotenv/config';
import CODE from '../utils/constantCode';
const dateFormat = require('dateformat');
const querystring = require('qs');
const crypto = require("crypto");

function sortObject(obj) {
    var sorted = {};
    var str = [];
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

let createPaymentUrl = (data, ipAddr) => {
    return new Promise(async (resolve, reject) => {
        const t = await db.sequelize.transaction();
        try {
            if (!data.userId || !data.shippingAddressTo) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing customer info',
                })
            }

            if (!data.productArr || data.productArr.length === 0) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing product list',
                })
            }

            // order table
            const orderCode = Math.random().toString(36).slice(-9).toUpperCase();
            await db.Order.create({
                orderCode: orderCode,
                userId: data.userId,
                orderDate: new Date().toLocaleString(),
                desiredDeliveryDate: data.desiredDeliveryDate || null,
                status: data.paymentMethod === 'PAY1' ? 'S1' : 'S0',
                shippingAddressFrom: data.shippingAddressFrom,
                shippingAddressTo: data.shippingAddressTo,
                shippingFee: data.shippingFee,
                paymentMethod: data.paymentMethod,
                note: data.note || '',
                totalCost: data.totalCost,
            }, { transaction: t });

            let productList = data.productArr;
            productList.map((item) => {
                item.orderCode = orderCode;
                return item;
            })

            await db.OrderDetail.bulkCreate(
                // orderCode: orderCode,
                // productId: 
                // quantityOrdered:
                // priceEach: 
                productList
                , { transaction: t });
            await t.commit();

            let redirectUrl = `/finish-order/${orderCode}`;

            // vnpay
            if (data.paymentMethod === 'PAY2') {
                const tmnCode = process.env.vnp_TmnCode;
                const secretKey = process.env.vnp_HashSecret;
                let vnpUrl = process.env.vnp_Url;
                const returnUrl = `${process.env.vnp_ReturnUrl}/${orderCode}`;

                let date = new Date();

                let createDate = dateFormat(date, 'yyyymmddHHmmss');
                // let bankCode = req.body.bankCode || '';

                let vnp_Params = {};
                vnp_Params['vnp_Version'] = '2.1.0';
                vnp_Params['vnp_Command'] = 'pay';
                vnp_Params['vnp_TmnCode'] = tmnCode;
                // vnp_Params['vnp_Merchant'] = ''
                vnp_Params['vnp_Locale'] = 'vn';
                vnp_Params['vnp_CurrCode'] = 'VND';
                vnp_Params['vnp_TxnRef'] = orderCode;
                vnp_Params['vnp_OrderInfo'] = `Thanh toán đơn hàng ${orderCode}`;
                vnp_Params['vnp_OrderType'] = 100000; // xem chi tiết https://sandbox.vnpayment.vn/apis/docs/loai-hang-hoa/
                vnp_Params['vnp_Amount'] = data.totalCost * 100;
                vnp_Params['vnp_ReturnUrl'] = returnUrl;
                vnp_Params['vnp_IpAddr'] = ipAddr;
                vnp_Params['vnp_CreateDate'] = createDate;
                // if (bankCode !== null && bankCode !== '') {
                //     vnp_Params['vnp_BankCode'] = bankCode;
                // }

                vnp_Params = sortObject(vnp_Params);
                console.log(vnp_Params);

                let signData = querystring.stringify(vnp_Params, { encode: false }); console.log(signData);
                let hmac = crypto.createHmac("sha512", secretKey);
                let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
                vnp_Params['vnp_SecureHash'] = signed;
                vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
                console.log(vnpUrl)
                redirectUrl = vnpUrl;
            }
            resolve({
                errCode: 0,
                errMessage: 'succeed',
                redirectUrl: redirectUrl,
            })
            // res.redirect(vnpUrl)
        } catch (error) {
            await t.rollback();
            reject(error);
        }
    })
}

let returnPaymentUrl = (query) => {
    return new Promise(async (resolve, reject) => {
        try {
            let vnp_Params = query; console.log(vnp_Params);

            let secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);
            console.log(vnp_Params);

            const secretKey = process.env.vnp_HashSecret;

            let signData = querystring.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

            if (secureHash === signed) {
                //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
                await db.Order.update({
                    status: 'S1',
                    paymentDate: new Date().toLocaleString(),
                }, {
                    where: {
                        orderCode: vnp_Params['vnp_TxnRef'],
                    }
                });

                resolve({
                    errCode: 0,
                    RspVnpCode: '00',
                    errMessage: 'succeed',
                })
            } else {
                resolve({
                    errCode: 0,
                    RspVnpCode: '97',
                    errMessage: 'Fail checksum',
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getOrder = (queryData) => {
    console.log(queryData);
    const { orderCode = '', userId = '', status = '' } = queryData;
    let conditionQuery = {};
    return new Promise(async (resolve, reject) => {
        try {
            let orders = '';
            if (orderCode) conditionQuery.orderCode = orderCode;
            if (userId) conditionQuery['userId'] = userId;
            if (status) conditionQuery.status = status;
            orders = await db.Order.findAll({
                where: { ...conditionQuery },
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
                include: [
                    {
                        model: db.OrderDetail,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt'],
                        },
                        include: {
                            model: db.Product,
                            attributes: {
                                exclude: ['createdAt', 'updatedAt'],
                            },
                            include: {
                                model: db.Image,
                                as: 'productImageData',
                                attributes: {
                                    exclude: ['createdAt', 'updatedAt'],
                                },
                                where: { type: CODE.IMG2, },
                                required: false,
                            },
                        }
                    },
                    {
                        model: db.User,
                        attributes: {
                            exclude: ['password', 'gender', 'role', 'deletedAt', 'createdAt', 'updatedAt'],
                        },
                    },
                ],
                raw: false,
                nest: true,
            });

            resolve({
                errCode: 0,
                errMessage: 'ok',
                orders,
            })
        } catch (error) {
            reject(error);
        }
    })
}

let updateOrder = (data) => { // patch
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.orderCode) {
                return resolve({
                    errCode: 1,
                    errMessage: 'missing input parameters',
                })
            }
            const order = await db.Order.findOne({
                where: {
                    orderCode: data.orderCode,
                }
            })
            if (order) {
                if (data.status) {
                    if (data.status === 'S4') {
                        let date = new Date().toLocaleString();
                        order.shippedDate = date;
                        if (order.paymentMethod === 'PAY1') {
                            order.paymentDate = date;
                        }
                    }
                    order.status = data.status;
                }
                await order.save();
            }
            resolve({
                errCode: 0,
                errMessage: 'Success',
            })
        } catch (error) {
            reject(error);
        }
    })
}

let rePaymentUrl = (data, ipAddr) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.orderCode || !data.paymentMethod) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing orderCode',
                })
            }

            // order table
            const order = await db.Order.findOne({
                where: { orderCode: data.orderCode },
            });

            if (data.paymentMethod === 'PAY1') {
                if (order) {
                    order.paymentMethod = data.paymentMethod;
                    order.status = 'S1';
                    await order.save();
                }
            }

            let redirectUrl = `/finish-order/${order?.orderCode}`;

            // vnpay
            if (data.paymentMethod === 'PAY2') {
                if (order) {
                    const tmnCode = process.env.vnp_TmnCode;
                    const secretKey = process.env.vnp_HashSecret;
                    let vnpUrl = process.env.vnp_Url;
                    const returnUrl = `${process.env.vnp_ReturnUrl}/${order.orderCode}`;

                    let date = new Date();

                    let createDate = dateFormat(date, 'yyyymmddHHmmss');
                    // let bankCode = req.body.bankCode || '';

                    let vnp_Params = {};
                    vnp_Params['vnp_Version'] = '2.1.0';
                    vnp_Params['vnp_Command'] = 'pay';
                    vnp_Params['vnp_TmnCode'] = tmnCode;
                    // vnp_Params['vnp_Merchant'] = ''
                    vnp_Params['vnp_Locale'] = 'vn';
                    vnp_Params['vnp_CurrCode'] = 'VND';
                    vnp_Params['vnp_TxnRef'] = order.orderCode;
                    vnp_Params['vnp_OrderInfo'] = `Thanh toán đơn hàng ${order.orderCode}`;
                    vnp_Params['vnp_OrderType'] = 100000; // xem chi tiết https://sandbox.vnpayment.vn/apis/docs/loai-hang-hoa/
                    vnp_Params['vnp_Amount'] = order.totalCost * 100;
                    vnp_Params['vnp_ReturnUrl'] = returnUrl;
                    vnp_Params['vnp_IpAddr'] = ipAddr;
                    vnp_Params['vnp_CreateDate'] = createDate;
                    // if (bankCode !== null && bankCode !== '') {
                    //     vnp_Params['vnp_BankCode'] = bankCode;
                    // }

                    vnp_Params = sortObject(vnp_Params);

                    let signData = querystring.stringify(vnp_Params, { encode: false }); console.log(signData);
                    let hmac = crypto.createHmac("sha512", secretKey);
                    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
                    vnp_Params['vnp_SecureHash'] = signed;
                    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
                    redirectUrl = vnpUrl;
                }
            }
            resolve({
                errCode: 0,
                errMessage: 'succeed',
                redirectUrl: redirectUrl,
            })
            // res.redirect(vnpUrl)
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    createPaymentUrl,
    returnPaymentUrl,
    getOrder,
    updateOrder,
    rePaymentUrl,
}