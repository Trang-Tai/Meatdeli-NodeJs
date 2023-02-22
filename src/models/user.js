'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Image, { foreignKey: 'keyImage', as: 'userImageData' });
      User.hasOne(models.Address, { foreignKey: 'userId' });
      User.belongsTo(models.Allcode, { foreignKey: 'gender', targetKey: 'keyMap', as: 'genderData' });
      User.belongsTo(models.Allcode, { foreignKey: 'role', targetKey: 'keyMap', as: 'roleData' });
      User.hasMany(models.Order, { foreignKey: 'userId' });
    }
  }
  User.init({
    email: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    gender: DataTypes.STRING,
    role: DataTypes.STRING,
  }, {
    sequelize,
    paranoid: true,
    modelName: 'User',
  });
  return User;
};