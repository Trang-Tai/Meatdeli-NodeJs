import db from '../models/index';
import 'dotenv/config';

let getKeyMap = (type) => {
    return new Promise(async (resolve, reject) => {
        try {
            const listType = await db.Allcode.findAll({
                where: {
                    type: type,
                },
                attributes: ['keyMap', 'value'],
                raw: true,
            })
            resolve({
                errCode: 0,
                errMessage: 'success',
                listType, 
            })
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    getKeyMap
}