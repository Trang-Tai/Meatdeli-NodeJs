import db from '../models/index';
import 'dotenv/config';
import uploadCloudinaryOptions from '../utils/uploadCloudinary';
import { FOLDER } from '../utils/constant';
import CODE from '../utils/constantCode';

let upsertProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.productName || !data.price ||
                !data.productCode) {
                return resolve({
                    errCode: 1,
                    errMessage: 'missing input parameters',
                })
            }
            // upsert product table
            const [product, isCreated] = await db.Product.findOrCreate({
                where: { productCode: data.productCode },
                raw: false,
                defaults: {
                    productName: data.productName,
                    productType: data.productType || null,
                    price: data.price,
                    salePrice: data?.salePrice || null,
                    quantityInStock: data.quantityInStock,
                    descriptionHTML: data?.descriptionHTML || null,
                    descriptionMarkdown: data?.descriptionMarkdown || null,
                }
            });
            if (!isCreated) {
                await product.update({
                    productName: data.productName,
                    productType: data.productType || null,
                    price: data.price,
                    salePrice: data?.salePrice || null,
                    quantityInStock: data.quantityInStock,
                    descriptionHTML: data?.descriptionHTML || null,
                    descriptionMarkdown: data?.descriptionMarkdown || null,
                })
            }
            // upsert image table
            if(data.avatar && data.avatar.length > 0) {
                let result = await uploadCloudinaryOptions.uploadMultipleFile(data.avatar, FOLDER.PRODUCT);
                if (result) {
                    let imgArr = result.map((item, index) => {
                        return {
                            type: CODE.IMG2,
                            image: item.secure_url,
                            cloudinaryId: item.public_id,
                            keyImage: product.id
                        }
                    })
                    console.log(imgArr);
                    await db.Image.bulkCreate(imgArr);
                }
            }
            if(data.deleteArrImage && data.deleteArrImage.length > 0) {
                let arrId = data.deleteArrImage.map(item => item.id);
                let arrCloudinaryId = data.deleteArrImage.map(item => item.cloudinaryId);
                await uploadCloudinaryOptions.removeMultipleFile(arrCloudinaryId);
                await db.Image.destroy({
                    where: { id: arrId },
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

let getProduct = (queryData) => {
    console.log(queryData);
    const { productCode = '', id = '', productType = '', isSubType = '' } = queryData;
    let conditionQuery = {};
    return new Promise(async (resolve, reject) => {
        try {
            let products = '';
            if (productCode) conditionQuery.productCode = productCode;
            if (id) conditionQuery['id'] = id;
            if (productType) {
                if(isSubType === '' || isSubType === 'true') {
                    let subTypeList = await db.ProductLine.findAll({
                        where: { subType: productType, },
                        raw: true,
                        attributes: ['productTypeCode'],
                    })
                    subTypeList = subTypeList.map((item, index) => {
                        return item.productTypeCode;
                    })
                    conditionQuery['productType'] = [...subTypeList, productType];
                } else {
                    conditionQuery['productType'] = productType;
                }
            }
            products = await db.Product.findAll({
                where: { ...conditionQuery },
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
                include: [
                    {
                        model: db.ProductLine,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt'],
                        },
                    },
                    {
                        model: db.Image,
                        as: 'productImageData',
                        attributes: {
                            exclude: ['createdAt', 'updatedAt'],
                        },
                        where: { type: CODE.IMG2, },
                        required: false,
                    },
                ],
                raw: false,
                nest: true,
            });
            resolve({
                errCode: 0,
                errMessage: 'ok',
                products,
            })
        } catch (error) {
            reject(error);
        }
    })
}

let deleteProduct = (data) => {
    let { arrId = [] } = data;
    return new Promise(async (resolve, reject) => {
        try {
            if (!arrId || arrId.length <= 0) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing parameters',
                })
            }
            let arrImage = await db.Image.findAll({
                where: {
                    type: CODE.IMG2,
                    keyImage: arrId,
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                raw: false,
            })
            let arrCloudId = arrImage.map((item) => item.cloudinaryId);
            await uploadCloudinaryOptions.removeMultipleFile(arrCloudId);
            await db.Image.destroy({
                where: {
                    type: CODE.IMG2,
                    keyImage: arrId,
                }
            });
            await db.Product.destroy({
                where: { id: arrId }
            })
            
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
    upsertProduct,
    getProduct,
    deleteProduct,
}