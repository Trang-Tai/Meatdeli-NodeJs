'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Address.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id' })
    }
  }
  Address.init({
    provinceName: DataTypes.STRING,
    provinceId: DataTypes.STRING,
    districtName: DataTypes.STRING,
    districtId: DataTypes.STRING,
    wardName: DataTypes.STRING,
    wardId: DataTypes.STRING,
    address: DataTypes.STRING,
    userId: DataTypes.INTEGER,
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Address',
  });
  return Address;
};