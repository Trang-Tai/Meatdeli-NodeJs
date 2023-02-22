'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderDetail.belongsTo(models.Order, { foreignKey: 'orderCode', targetKey: 'orderCode' });
      OrderDetail.belongsTo(models.Product, { foreignKey: 'productId', targetKey: 'id' });
    }
  }
  OrderDetail.init({
    orderCode: DataTypes.STRING,
    productId: DataTypes.INTEGER,
    quantityOrdered: DataTypes.SMALLINT,
    priceEach: DataTypes.DECIMAL(10,0),
  }, {
    sequelize,
    modelName: 'OrderDetail',
  });
  return OrderDetail;
};