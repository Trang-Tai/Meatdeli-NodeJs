'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Address', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      provinceName: {
        type: Sequelize.STRING,
      },
      provinceId: {
        type: Sequelize.STRING,
      },
      districtName: {
        type: Sequelize.STRING
      },
      districtId: {
        type: Sequelize.STRING
      },
      wardName: {
        type: Sequelize.STRING
      },
      wardId: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Address');
  }
};