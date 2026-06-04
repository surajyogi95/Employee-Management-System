// server/models/index.js
const { sequelize } = require('../config/db');
const Admin = require('./Admin');
const Employee = require('./Employee');

// Here you could define relationships if they existed, e.g. Admin.hasMany(Employee)
// But for this EMS, they are independent tables.

module.exports = {
  sequelize,
  Admin,
  Employee
};
