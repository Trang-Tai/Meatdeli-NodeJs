'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductLine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductLine.hasMany(models.Product, { foreignKey: 'productType' });
    }
  }
  ProductLine.init({
    productTypeCode: DataTypes.STRING,
    productTypeName: DataTypes.STRING,
    subType: DataTypes.STRING,
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'ProductLine',
  });
  return ProductLine;
};