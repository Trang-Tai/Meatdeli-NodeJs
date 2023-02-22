'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productCode: {
        type: Sequelize.STRING,
      },
      productName: {
        type: Sequelize.STRING,
      },
      productType: {
        type: Sequelize.STRING,
        references: { model: 'ProductLine', key: 'productTypeCode' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      price: {
        type: Sequelize.DECIMAL(10,0),
      },
      salePrice: {
        type: Sequelize.DECIMAL(10,0),
      },
      quantityInStock: {
        type: Sequelize.SMALLINT,
      },
      descriptionHTML: {
        type: Sequelize.TEXT,
      },
      descriptionMarkdown: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};