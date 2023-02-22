import productService from '../services/productService';

let upsertProduct = async (req, res, next) => {
    try {
        let data = await productService.upsertProduct(req.body);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json({
            ...data,
        });
    } catch (error) {
        next(error);
    }
}

let getProduct = async (req, res, next) => {
    try {
        let data = await productService.getProduct(req.query);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

let deleteProduct = async (req, res, next) => {
    try {
        let data = await productService.deleteProduct(req.body);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

export default {
    upsertProduct,
    getProduct,
    deleteProduct,
}