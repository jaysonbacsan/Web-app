const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reporter_id: { type: DataTypes.INTEGER, allowNull: false },
    reported_id: { type: DataTypes.INTEGER, allowNull: false },
    reason: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: { type: DataTypes.ENUM('pending', 'resolved', 'dismissed'), defaultValue: 'pending' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    resolved_at: DataTypes.DATE,
    resolved_by: DataTypes.INTEGER
}, {
    tableName: 'reports',
    timestamps: false,
    underscored: true
});

module.exports = Report;