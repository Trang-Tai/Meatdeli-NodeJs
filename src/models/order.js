'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.hasMany(models.OrderDetail, { foreignKey: 'orderCode', sourceKey: 'orderCode' });
      Order.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id' });
    }
  }
  Order.init({
    orderCode: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    orderDate: DataTypes.DATE,
    desiredDeliveryDate: DataTypes.DATE,
    paymentDate: DataTypes.DATE,
    shippedDate: DataTypes.DATE,
    status: DataTypes.STRING,
    shippingAddressFrom: DataTypes.STRING,
    shippingAddressTo: DataTypes.STRING,
    shippingFee: DataTypes.DECIMAL(10,0),
    paymentMethod: DataTypes.STRING,
    note: DataTypes.STRING,
    totalCost: DataTypes.DECIMAL(10,0),
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};