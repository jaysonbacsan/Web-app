const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const VerificationDocument = sequelize.define('VerificationDocument', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    valid_id_path: DataTypes.STRING,
    resume_path: DataTypes.STRING,
    business_permit_path: DataTypes.STRING,
    nbi_clearance_path: DataTypes.STRING,
    skills: DataTypes.TEXT,
    experience_years: DataTypes.INTEGER,
    hourly_rate: DataTypes.DECIMAL(10,2),
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
    rejection_reason: DataTypes.TEXT,
    submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    reviewed_at: DataTypes.DATE,
    reviewed_by: DataTypes.INTEGER
}, {
    tableName: 'verification_documents',
    timestamps: false,
    underscored: true
});

// Add this association
VerificationDocument.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

module.exports = VerificationDocument;