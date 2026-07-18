import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Role from './roleModel.js';
import Permission from './permissionModel.js';

class RolePermission extends Model { }

RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Permission,
        key: "id",
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue:true
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'RolePermission', // The name of the model
    tableName: 'role_permission', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

RolePermission.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(RolePermission, { foreignKey: 'role_id' });

RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });
Permission.hasMany(RolePermission, { foreignKey: 'permission_id' });

export default RolePermission