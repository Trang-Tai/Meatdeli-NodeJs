'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderCode: {
        type: Sequelize.STRING,
        unique: true,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      orderDate: {
        type: Sequelize.DATE,
      },
      desiredDeliveryDate: {
        type: Sequelize.DATE,
      },
      paymentDate: {
        type: Sequelize.DATE,
      },
      shippedDate: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
      },
      shippingAddressFrom: {
        type: Sequelize.STRING,
      },
      shippingAddressTo: {
        type: Sequelize.STRING,
      },
      shippingFee: {
        type: Sequelize.DECIMAL(10,0),
      },
      paymentMethod: {
        type: Sequelize.STRING,
      },
      note: {
        type: Sequelize.STRING,
      },
      totalCost: {
        type: Sequelize.DECIMAL(10,0),
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
    await queryInterface.dropTable('Orders');
  }
};