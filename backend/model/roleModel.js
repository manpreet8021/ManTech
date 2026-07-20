import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Organisation from './organisationModel.js';

class Role extends Model { }

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Organisation,
        key: "id",
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'Role', // The name of the model
    tableName: 'role', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

export default Role

export const createRoleModel = async (role) => await Role.create(role);
export const findRole = async (condition) => await Role.findOne({ where: condition });
export const findAllRoles = async (condition) => await Role.findAll({ where: condition, attributes:["id", "name"] });
export const updateRole = async (data, id) => await Role.update(data, { where: { id: id } });
export const deleteRole = async (id) => await Role.destroy({ where: { id: id }});
