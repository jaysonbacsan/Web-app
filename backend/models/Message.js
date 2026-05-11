const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sender_id: { type: DataTypes.INTEGER, allowNull: false },
    receiver_id: { type: DataTypes.INTEGER, allowNull: false },
    job_id: { type: DataTypes.INTEGER, allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'messages',
    timestamps: false,
    underscored: true
});

module.exports = Message;