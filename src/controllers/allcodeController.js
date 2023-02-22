import allcodeService from '../services/allcodeService';

let getKeyMap = async (req, res, next) => {
    try {
        const data = await allcodeService.getKeyMap(req.query.type);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getKeyMap,
}