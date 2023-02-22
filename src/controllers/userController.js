import userService from '../services/userService';

let ok = (req, res, next) => {
    return res.status(200).json('ok');
}

let registerUser = async (req, res, next) => {
    try {
        const data = await userService.createUser(req.body);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (err) {
        next(err);
    }
}

let loginUser = async (req, res, next) => {
    try {
        let data = await userService.loginUser(req.body, req.body?.isAdmin);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        // Send refreshToken to cookie
        res.cookie("refreshToken", data.refreshToken, {
            httpOnly: true, // ngăn chặn việc thay đổi cookie qua document.cookie thông qua JavaScript
            secure: false, // if true, browser only send cookie via https pages, not http
            signed: true,
            sameSite: "strict",
            maxAge: 1000*60*60*24*365,
        });
        let dataCopy = { ...data };
        delete dataCopy.refreshToken;
        return res.status(200).json(dataCopy);
    } catch (err) {
        next(err);
    }
}

let getUser = async (req, res, next) => {
    try {
        let data = await userService.getUser(req.query);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

let reqRefreshToken = async (req, res, next) => {
    try {
        let data = await userService.reqRefreshToken(req.signedCookies.refreshToken);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        // Send refreshToken to cookie
        res.cookie("refreshToken", data.refreshToken, {
            httpOnly: true, // ngăn chặn việc thay đổi cookie qua document.cookie thông qua JavaScript
            secure: false, // if true, browser only send cookie via https pages, not http
            signed: true,
            sameSite: "strict",
            maxAge: 1000*60*60*24*365,
        });
        let dataCopy = { ...data };
        delete dataCopy.refreshToken;
        return res.status(200).json(dataCopy);
    } catch (error) {
        next(error);
    }
}

let logoutUser = async (req, res, next) => {
    try {
        // await userService.logoutUser(req.signedCookies.refreshToken);
        res.clearCookie('refreshToken');
        return res.status(200).json({
            errCode: 0,
            errMessage: 'success',
        });
    } catch (error) {
        next(error);
    }
}

let reqDecodeToken = async (req, res, next) => {
    return res.status(200).json({
        errCode: 0,
        errMessage: 'success',
        userInfo: req.user,
    });
}

let upsertUser = async (req, res, next) => { // same as register user
    try {
        let data = await userService.upsertUser(req.body);
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

let deleteUser = async (req, res, next) => {
    try {
        let data = await userService.deleteUser(req.body);
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

let restoreUser = async (req, res, next) => {
    try {
        let data = await userService.restoreUser(req.body);
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

let deletePermanentUser = async (req, res, next) => {
    try {
        let data = await userService.deletePermanentUser(req.body);
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

let resetPassword = async (req, res, next) => {
    try {
        let data = await userService.resetPassword(req.body);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

let changePassword = async (req, res, next) => {
    try {
        let data = await userService.changePassword(req.body);
        if (data.errCode !== 0) {
            return res.status(400).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

export default {
    ok,
    registerUser,
    loginUser,
    getUser,
    reqRefreshToken,
    logoutUser,
    reqDecodeToken,
    upsertUser,
    deleteUser,
    restoreUser,
    deletePermanentUser,
    resetPassword,
    changePassword,
}