const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobApplication = sequelize.define('JobApplication', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    job_id: { type: DataTypes.INTEGER, allowNull: false },
    worker_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'), defaultValue: 'pending' },
    worker_location_lat: { type: DataTypes.DECIMAL(10,8), allowNull: true },
    worker_location_lng: { type: DataTypes.DECIMAL(11,8), allowNull: true },
    worker_distance_km: { type: DataTypes.DECIMAL(8,2), allowNull: true },
    applied_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    reviewed_at: { type: DataTypes.DATE, allowNull: true },
    hired: { type: DataTypes.BOOLEAN, defaultValue: false },
    hired_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'job_applications',
    timestamps: false,
    underscored: true
});

module.exports = JobApplication;