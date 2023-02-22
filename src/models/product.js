'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.ProductLine, { foreignKey: 'productType', targetKey: 'productTypeCode' });
      Product.hasMany(models.Image, { foreignKey: 'keyImage', as: 'productImageData' });
      Product.hasMany(models.OrderDetail, { foreignKey: 'productId' });
    }
  }
  Product.init({
    productCode: DataTypes.STRING,
    productName: DataTypes.STRING,
    price: DataTypes.DECIMAL(10,0),
    salePrice: DataTypes.DECIMAL(10,0),
    productType: DataTypes.STRING,
    quantityInStock: DataTypes.SMALLINT,
    descriptionHTML: DataTypes.TEXT,
    descriptionMarkdown: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};