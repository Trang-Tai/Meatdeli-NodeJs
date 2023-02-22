const { Sequelize } = require('sequelize');
import 'dotenv/config';
const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// ở đây chúng ta dùng sequelize cli để kết nối db nên ko cần phải cài đặt kết nối thủ công
// cài đặt để test kết nối postgres
export default connectDB;