import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Role from './roleModel.js';
import User from './userModel.js';
import RolePermission from './rolePermissionModel.js';
import Permission from './permissionModel.js';

class UserRoleMapping extends Model { }

UserRoleMapping.init(
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'UserRoleMapping', // The name of the model
    tableName: 'user_role_mapping', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

UserRoleMapping.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(UserRoleMapping, { foreignKey: 'role_id' });

UserRoleMapping.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(UserRoleMapping, { foreignKey: 'user_id' });

export default UserRoleMapping

export const createUserRole = async (data) => await UserRoleMapping.create(data);
export const findUserRole = async (condition) => await UserRoleMapping.findOne({ where: condition });
export const updateUserRole = async (data, id) => await UserRoleMapping.update(data, { where: { id: id } });
export const deleteUserRole = async (id) => await UserRoleMapping.destroy({ where: { id: id } });
export const deleteUserRoleByUserId = async (id) => await UserRoleMapping.destroy({ where: { user_id: id } });

export const findAllUser = async (condition) => await User.findAll({
  where: condition,
  attributes: ["id", "name", "email", "active"],
  include: {
    model: UserRoleMapping,
    where: {
      active: true,
    },
    attributes: ["id"],
    required: true,
    include: {
      model: Role,
      where: {
        active: true,
      },
      required: true,
      attributes: ["id", "name"],
    }
  }
});

export const getUserRoleAndPermissions = async (userId) => {
  const mapping = await UserRoleMapping.findOne({
    where: { user_id: userId, active: true },
    include: {
      model: Role,
      include: {
        model: RolePermission,
        where: { active: true },
        required: false,
        include: { model: Permission },
      },
    },
  });

  if (!mapping || !mapping.Role) {
    return { role: null, permissions: [] };
  }

  const permissions = (mapping.Role.RolePermissions || [])
    .filter((rp) => rp.Permission)
    .map((rp) => ({
      resource: rp.Permission.resource,
      action: rp.Permission.action,
    }));

  return { role: mapping.Role.name, permissions };
};
