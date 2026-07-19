import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';

class Permission extends Model {}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'resource_action'
    },
    action: {
      type: DataTypes.ENUM('read', 'write'),
      allowNull: false,
      unique: 'resource_action'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'Permission', // The name of the model
    tableName: 'permission', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

export default Permission

export const createPermissionModel = async (data) => await Permission.create(data);
export const findPermission = async (condition) => await Permission.findOne({ where: condition });
export const findAllPermissions = async (condition) => await Permission.findAll({ where: condition });
export const updatePermission = async (data, id) => await Permission.update(data, { where: { id: id } });
export const deletePermission = async (id) => await Permission.destroy({ where: { id: id }});
