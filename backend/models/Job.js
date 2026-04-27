const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Job = sequelize.define('Job', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    client_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    category: DataTypes.STRING,
    budget: DataTypes.DECIMAL(10,2),
    location_lat: DataTypes.DECIMAL(10,8),
    location_lng: DataTypes.DECIMAL(11,8),
    location_address: DataTypes.TEXT,
    status: { type: DataTypes.ENUM('open', 'taken', 'completed', 'cancelled'), defaultValue: 'open' },
    worker_id: DataTypes.INTEGER
}, {
    tableName: 'jobs',
    timestamps: true,
    underscored: true
});

// Add this association
Job.belongsTo(User, { as: 'client', foreignKey: 'client_id' });
Job.belongsTo(User, { as: 'worker', foreignKey: 'worker_id' });

module.exports = Job;