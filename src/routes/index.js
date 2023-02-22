import userRouter from './userRoute';
import allcodeRouter from './allcodeRoute';
import productRouter from './productRoute';
import orderRouter from './orderRoute';

const routes = (app) => {
    app.use('/user', userRouter);
    app.use('/allcode', allcodeRouter);
    app.use('/product', productRouter);
    app.use('/order', orderRouter);

    // handle default error
    app.use((err, req, res, next) => {
        res.status(500).json({ 
            errCode: -1,
            errMessage: 'error from server',
            err,
        });
    })
}

export default routes;