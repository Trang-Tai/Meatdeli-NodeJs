import orderService from '../services/orderService';

let createPaymentUrl = async (req, res, next) => {
    try {
        var ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        let data = await orderService.createPaymentUrl(req.body, ipAddr);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

let returnPaymentUrl = async (req, res, next) => {
    try {
        let data = await orderService.returnPaymentUrl(req.query);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

let getOrder = async (req, res, next) => {
    try {
        let data = await orderService.getOrder(req.query);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

let updateOrder = async (req, res, next) => {
    try {
        let data = await orderService.updateOrder(req.body);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

let rePaymentUrl = async (req, res, next) => {
    try {
        var ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        let data = await orderService.rePaymentUrl(req.body, ipAddr);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

export default {
    createPaymentUrl,
    returnPaymentUrl,
    getOrder,
    updateOrder,
    rePaymentUrl,
}