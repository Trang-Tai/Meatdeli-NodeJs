import db from '../models/index';
import { Op } from 'sequelize';
import CODE from '../utils/constantCode';
import 'dotenv/config';
import uploadCloudinaryOptions from '../utils/uploadCloudinary';
import emailServices from './sendEmail';
const jwt = require('jsonwebtoken');
// const client = require('../config/connectRedis');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let checkUserEmailIsExists = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await db.User.findOne({
                where: {
                    email: email,
                },
                raw: true,
            })
            if (user) {
                resolve({
                    isExists: true,
                    user,
                })
            } else {
                resolve({
                    isExists: false,
                    user,
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let checkPassword = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            // check email is or is not exist
            const { isExists, user } = await checkUserEmailIsExists(email);
            if (!isExists) {
                return resolve({
                    isPasswordValid: false,
                    errCode: 2,
                    errMessage: 'Email is not exist in the system',
                    user,
                })
            }
            // compare password
            const isPasswordTrue = await bcrypt.compare(password, user.password);
            if (!isPasswordTrue) {
                return resolve({
                    isPasswordValid: false,
                    errCode: 3,
                    errMessage: 'Wrong password',
                    user,
                })
            }
            // if password correct
            resolve({
                isPasswordValid: true,
                user,
            })
        } catch (error) {
            reject(error);
        }
    })
}

let createUser = (userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userData.email || !userData.password) {
                return resolve({
                    errCode: 1,
                    errMessage: 'missing input parameters',
                })
            }
            const { isExists } = await checkUserEmailIsExists(userData.email);
            if (isExists) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Email has existed in the system'
                })
            }
            const passwordHash = await bcrypt.hash(userData.password, saltRounds);
            await db.User.build({
                email: userData.email,
                firstName: userData?.firstName,
                lastName: userData?.lastName,
                password: passwordHash,
                phone: userData?.phone,
                gender: userData?.gender || 'G3',
                role: userData.role || 'R3',
            }).save();
            resolve({
                errCode: 0,
                errMessage: 'Success',
            })
        } catch (error) {
            reject(error);
        }
    })
}

let createToken = (payload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn: '3h' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_KEY, { expiresIn: '365d' });
    // push refresh token to redis
    // client.set(payload.email, refreshToken, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
    //     if (err) {
    //         return reject(err);
    //     }
    // });
    return ({
        accessToken,
        refreshToken,
    })
}

let loginUser = (dataInput, isAdmin = false) => {
    return new Promise(async (resolve, reject) => {
        try {
            // check input parameter
            if (!dataInput.email || !dataInput.password) {
                return resolve({
                    errCode: 1,
                    errMessage: 'missing input parameters',
                })
            }
            // // check email is or is not exist
            // const { isExists, user } = await checkUserEmailIsExists(dataInput.email);
            // if (!isExists) {
            //     return resolve({
            //         errCode: 2,
            //         errMessage: 'Email is not exist in the system'
            //     })
            // }
            // // compare password
            // const isPasswordTrue = await bcrypt.compare(dataInput.password, user.password);
            // if (!isPasswordTrue) {
            //     return resolve({
            //         errCode: 3,
            //         errMessage: 'Wrong password'
            //     })
            // }
            const { user, isPasswordValid, ...props } = await checkPassword(dataInput.email, dataInput.password);
            
            if(!isPasswordValid) {
                return resolve({
                    errCode: props.errCode,
                    errMessage: props.errMessage,
                })
            }
            // check if user is admin or is not
            if (isAdmin) {
                if (user.role !== 'R1' && user.role !== 'R2') {
                    return resolve({
                        errCode: 4,
                        errMessage: 'This user is not admin',
                    })
                }
            }
            // generate token
            if (user && isPasswordValid) {
                // delete password in user before send:
                delete user.password;
                const payload = {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    gender: user.gender,
                    role: user.role,
                    isLogin: true,
                }
                const { accessToken, refreshToken } = createToken(payload);
                resolve({
                    errCode: 0,
                    errMessage: 'success',
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getUser = (queryData) => {
    console.log(queryData);
    const { email = '', id = '', paranoid = 'true' } = queryData;
    const enabledParanoid = paranoid === 'true' || paranoid === '';
    let conditionQuery = {};
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (email) conditionQuery.email = email;
            if (id) conditionQuery['id'] = id;
            if (!enabledParanoid) conditionQuery['deletedAt'] = { [Op.not]: null, };
            users = await db.User.findAll({
                where: { ...conditionQuery },
                paranoid: enabledParanoid,
                attributes: {
                    exclude: ['password', 'deletedAt', 'createdAt', 'updatedAt'],
                },
                include: [
                    {
                        model: db.Image,
                        as: 'userImageData',
                        attributes: ['image', 'cloudinaryId', 'keyImage', 'type'],
                        where: { type: 'IMG1', },
                        required: false,
                    },
                    {
                        model: db.Address,
                        attributes: {
                            exclude: ['id', 'createdAt', 'updatedAt'],
                        },
                        required: false,
                    },
                    {
                        model: db.Allcode,
                        as: 'genderData',
                        attributes: ['value', 'keyMap'],
                    },
                    {
                        model: db.Allcode,
                        as: 'roleData',
                        attributes: ['value', 'keyMap'],
                    },
                ],
                raw: false,
                nest: true,
            });
            // if (!email && !id) {
            //     users = await db.User.findAll({
            //         where: { deletedAt: { [Op.not]: null, }},
            //         paranoid: paranoid,
            //         attributes: {
            //             exclude: ['password'],
            //         }
            //     });
            // } else if(email) {
            //     users = await db.User.findOne({
            //         where: { email: email, deletedAt: { [Op.not]: null, } },
            //         paranoid: paranoid,
            //         attributes: {
            //             exclude: ['password']
            //         }
            //     })
            // } else if(id) {
            //     users = await db.User.findOne({
            //         where: { id: id, deletedAt: { [Op.not]: null, } },
            //         paranoid: paranoid,
            //         attributes: {
            //             exclude: ['password']
            //         }
            //     })
            // }
            resolve({
                errCode: 0,
                errMessage: 'ok',
                users,
            })
        } catch (error) {
            reject(error);
        }
    })
}

let reqRefreshToken = (inpRefreshToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inpRefreshToken) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing parameters, You are not authenticated',
                })
            }
            // verify token
            jwt.verify(inpRefreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
                if (err) {
                    return resolve({
                        errCode: 2,
                        errMessage: 'Invalid refresh token',
                    })
                }
                // check if valided token equal or not equal token that is saved at redis
                // client.get(user.email, (err, reply) => {
                // if (err) {
                //     return reject(err);
                // }
                // console.log('inp: ', inpRefreshToken, 'reply redis: ', reply);
                // if (inpRefreshToken !== reply) {
                // return resolve({
                //     errCode: 3,
                //     errMessage: 'token is not same'
                // })
                // } else {
                // delete key in redis
                // client.del(user.email, function (err, response) {
                //     if (response == 1) {
                //         console.log("Deleted Successfully!")
                //     } else {
                //         console.log("Cannot delete")
                //         return reject(err);
                //     }
                // })
                if (user?.password) delete user.password;
                const payload = {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    gender: user.gender,
                    role: user.role,
                    isLogin: true,
                }
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = createToken(payload);
                resolve({
                    errCode: 0,
                    errMessage: 'success',
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                })
                // }
                // })
            })
        } catch (error) {
            reject(error);
        }
    })
}

let logoutUser = (token = '') => {
    jwt.verify(token, process.env.JWT_REFRESH_KEY, (err, user) => {
        if (user) {
            // client.del(user.email, function (err, response) {
            //     if (response == 1) {
            //         console.log("Deleted Successfully!")
            //     } else {
            //         console.log("Cannot delete")
            //     }
            // })
        }
    })
}

let upsertUser = (userData) => { // put
    return new Promise(async (resolve, reject) => {
        try {
            if (!userData.email || (!userData.password && !userData?.isUpdate)) {
                return resolve({
                    errCode: 1,
                    errMessage: 'missing input parameters',
                })
            }
            const passwordHash = await bcrypt.hash(userData.password, saltRounds);
            // upsert user table
            const [user, isCreated] = await db.User.findOrCreate({
                where: { email: userData.email },
                raw: false,
                defaults: {
                    firstName: userData?.firstName,
                    lastName: userData?.lastName,
                    password: passwordHash,
                    phone: userData?.phone,
                    gender: userData?.gender || 'G3',
                    role: userData.role || 'R3',
                }
            });
            if (!isCreated) {
                let obj = {};
                if(userData.password) obj['password'] = passwordHash;
                await user.update({
                    firstName: userData?.firstName,
                    lastName: userData?.lastName,
                    // password: passwordHash,
                    ...obj,
                    phone: userData?.phone,
                    gender: userData?.gender || 'G3',
                    role: userData.role || 'R3',
                })
            }
            // upsert image table
            if (userData.avatar) {
                let result = await uploadCloudinaryOptions.uploadSingleFile(userData.avatar);
                console.log(result)
                if (result.public_id || result.secure_url) {
                    const [image, isImageCreated] = await db.Image.findOrCreate({
                        where: { type: CODE.IMG1, keyImage: user.id },
                        raw: false,
                        defaults: {
                            image: result.secure_url,
                            cloudinaryId: result.public_id,
                        }
                    });
                    if (!isImageCreated) {
                        await uploadCloudinaryOptions.removeFile(image.cloudinaryId);
                        await image.update({
                            image: result.secure_url,
                            cloudinaryId: result.public_id,
                        })
                    }
                }
            }
            // upsert adddress table
            if (userData.provinceId && userData.districtId && userData.wardId && userData.address) {
                console.log(userData)
                const [address, isAddressCreated] = await db.Address.findOrCreate({
                    where: { userId: user.id },
                    raw: false,
                    defaults: {
                        provinceName: userData.provinceName,
                        provinceId: userData.provinceId,
                        districtName: userData.districtName,
                        districtId: userData.districtId,
                        wardName: userData.wardName,
                        wardId: userData.wardId,
                        address: userData.address,
                    }
                });
                if (!isAddressCreated) {
                    await address.update({
                        provinceName: userData.provinceName,
                        provinceId: userData.provinceId,
                        districtName: userData.districtName,
                        districtId: userData.districtId,
                        wardName: userData.wardName,
                        wardId: userData.wardId,
                        address: userData.address,
                    })
                }
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

let deleteUser = (data) => {
    let arrUsers = data?.listUsers;
    let arruserIds = [];
    if(arrUsers && arrUsers.length > 0) arruserIds = arrUsers.map((item, index) => {
        return item.id;
    })
    return new Promise(async (resolve, reject) => {
        try {
            await db.User.destroy({
                where: { id: arruserIds },
            })
            resolve({
                errCode: 0,
                errMessage: 'succeed',
            });
        } catch (error) {
            reject(error);
        }
    })
}

let restoreUser = (data) => {
    let arrUsers = data?.listUsers;
    let arruserIds = [];
    if(arrUsers && arrUsers.length > 0) arruserIds = arrUsers.map((item, index) => {
        return item.id;
    })
    return new Promise(async (resolve, reject) => {
        try {
            await db.User.restore({
                where: { id: arruserIds },
            })
            resolve({
                errCode: 0,
                errMessage: 'succeed',
            });
        } catch (error) {
            reject(error);
        }
    })
}

let deletePermanentUser = (data) => {
    let arrUsers = data?.listUsers;
    let arruserIds = [];
    if(arrUsers && arrUsers.length > 0) arruserIds = arrUsers.map((item, index) => {
        return item.id;
    })
    return new Promise(async (resolve, reject) => {
        try {
            await db.User.destroy({
                where: { id: arruserIds },
                force: true,
            })
            let cloudIds = await db.Image.findAll({
                where: { 
                    keyImage: arruserIds,
                    type: 'IMG1',
                },
                attributes: ['cloudinaryId'],
            })
            await uploadCloudinaryOptions.removeMultipleFile(cloudIds);
            await db.Image.destroy({
                where: {
                    keyImage: arruserIds,
                    type: 'IMG1',
                }
            })
            await db.Address.destroy({
                where: {
                    userId: arruserIds,
                }
            })
            resolve({
                errCode: 0,
                errMessage: 'succeed',
            });
        } catch (error) {
            reject(error);
        }
    })
}

let resetPassword = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.receiverEmail) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing email',
                })
            }
            const { isExists, user } = await checkUserEmailIsExists(data.receiverEmail);
            if(!isExists) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Email is not existed in the system'
                })
            }
            const randomPassword = Math.random().toString(36).slice(-8);
            const result = await upsertUser({ email: data.receiverEmail, password: randomPassword, role: user.role });
            emailServices.sendEmail({ receiverEmail: data.receiverEmail, newPassword: randomPassword });
            resolve({
                errCode: 0,
                errMessage: 'succeed',
            })
        } catch (error) {
            reject(error);
        }
    })
}

let changePassword = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!data.email || !data.oldPassword || !data.newPassword) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing input parameters',
                })
            }
            const { user, isPasswordValid, ...props } = await checkPassword(data.email, data.oldPassword);
            if(!isPasswordValid) {
                return resolve({
                    errCode: props.errCode,
                    errMessage: props.errMessage,
                })
            }
            const obj = {
                ...user,
                password: data.newPassword,
            }
            await upsertUser(obj);
            resolve({
                errCode: 0,
                errMessage: 'succeed',
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    checkUserEmailIsExists,
    createUser,
    loginUser,
    getUser,
    reqRefreshToken,
    logoutUser,
    upsertUser,
    deleteUser,
    restoreUser,
    deletePermanentUser,
    resetPassword,
    changePassword,
}