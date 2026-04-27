const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('client', 'worker', 'admin'), defaultValue: 'client' },
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    business_name: DataTypes.STRING,
    profile_image: { type: DataTypes.STRING, allowNull: true }, // ADD THIS LINE
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verification_status: { type: DataTypes.ENUM('pending', 'verified', 'rejected', 'none'), defaultValue: 'none' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    rating: { type: DataTypes.DECIMAL(3,2), defaultValue: 0 },
    total_ratings: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = User;