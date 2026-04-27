const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    job_id: { type: DataTypes.INTEGER, allowNull: false },
    client_id: { type: DataTypes.INTEGER, allowNull: false },
    worker_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: DataTypes.DECIMAL(10,2),
    payment_method: { type: DataTypes.ENUM('gcash', 'paymaya', 'cash'), defaultValue: 'cash' },
    reference_number: DataTypes.STRING,
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'payments',
    timestamps: false,
    underscored: true
});

module.exports = Payment;