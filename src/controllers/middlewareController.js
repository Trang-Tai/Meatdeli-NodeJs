const jwt = require("jsonwebtoken");
import userServices from '../services/userService';
import 'dotenv/config';

let verifyToken = (req, res, next) => {
    let token = req.headers.token;
    if (token) {
        const accessToken = token.split(' ')[1];
        try {
            let decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);
            if (decoded) {
                userServices.checkUserEmailIsExists(decoded.email).then(({ isExists }) => {
                    if(isExists) {
                        req.user = decoded;
                        next();
                    } else {
                        return res.status(403).json({
                            errCode: 4,
                            errMessage: 'User has been blocked',
                        })
                    }
                }).catch((err) => {
                    console.log(error);
                    return err;
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(403).json({
                errCode: 2,
                errMessage: 'Token is not valid',
            })
        }
    } else {
        return res.status(401).json({
            errCode: 1,
            errMessage: 'Missing token',
        })
    }
}

let verifyTokenAndAdminAuthor = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.role === 'R1' || req.user.role === 'R2') {
            next();
        } else {
            return res.status(403).json({
                errCode: 3,
                errMessage: 'You are not allowed to perform this action',
            })
        }
    });
}

module.exports = {
    verifyToken,
    verifyTokenAndAdminAuthor,
}