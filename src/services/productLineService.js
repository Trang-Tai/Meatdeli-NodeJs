import db from '../models/index';
import 'dotenv/config';

let upsertProductLine = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.productTypeCode) {
                return resolve({
                    errCode: 1,
                    errMessage: 'missing input parameters',
                })
            }
            const [productLine, isCreated] = await db.ProductLine.findOrCreate({
                where: { productTypeCode: data.productTypeCode },
                raw: false,
                defaults: {
                    productTypeName: data.productTypeName,
                    subType: data?.subType || null,
                }
            });
            if (!isCreated) {
                await productLine.update({
                    productTypeName: data.productTypeName,
                    subType: data?.subType || null,
                })
            }
            resolve({
                errCode: 0,
                errMessage: 'success',
            })
        } catch (error) {
            reject(error);
        }
    })
}

let getProductLine = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const productLines = await db.ProductLine.findAll({
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
            });
            resolve({
                errCode: 0,
                errMessage: 'success',
                data: productLines,
            })
        } catch (error) {
            reject(error);
        }
    })
}

let deleteProductLine = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.productTypeCode) {
                return resolve({
                    errCode: 1,
                    errMessage: 'missing input parameters',
                })
            }
            await db.ProductLine.destroy({
                where: { productTypeCode: data.productTypeCode },
            });
            resolve({
                errCode: 0,
                errMessage: 'success',
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    upsertProductLine,
    getProductLine,
    deleteProductLine,
}