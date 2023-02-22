'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Image.belongsTo(models.User, { foreignKey: 'keyImage', targetKey: 'id', as: 'userImageData' });
      Image.belongsTo(models.Product, { foreignKey: 'keyImage', targetKey: 'id', as: 'productImageData' });
    }
  }
  Image.init({
    type: DataTypes.STRING,
    image: DataTypes.STRING,
    cloudinaryId: DataTypes.STRING,
    keyImage: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};