import productLineService from '../services/productLineService';

let upsertProductLine = async (req, res, next) => {
    try {
        let data = await productLineService.upsertProductLine(req.body);
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

let getProductLine = async (req, res, next) => {
    try {
        let data = await productLineService.getProductLine();
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

let deleteProductLine = async (req, res, next) => {
    try {
        let data = await productLineService.deleteProductLine(req.body);
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

export default {
    upsertProductLine,
    getProductLine,
    deleteProductLine,
}