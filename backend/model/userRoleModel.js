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

// Users can hold more than one active role (e.g. Teacher + Manager), so this
// has to look across ALL of a user's active roles, not just one — a single
// findOne here would silently ignore permissions granted only via a second role.
export const getUserRoleAndPermissions = async (userId) => {
  const mappings = await UserRoleMapping.findAll({
    where: { user_id: userId, active: true },
    include: {
      model: Role,
      where: { active: true },
      required: true,
      include: {
        model: RolePermission,
        where: { active: true },
        required: false,
        include: { model: Permission },
      },
    },
  });

  if (!mappings.length) {
    return { role: null, permissions: [] };
  }

  const permissionMap = new Map()
  for (const mapping of mappings) {
    for (const rp of mapping.Role.RolePermissions || []) {
      if (!rp.Permission) continue
      const key = `${rp.Permission.resource}:${rp.Permission.action}`
      if (!permissionMap.has(key)) {
        permissionMap.set(key, { resource: rp.Permission.resource, action: rp.Permission.action })
      }
    }
  }

  return {
    role: mappings.map((m) => m.Role.name).join(', '),
    permissions: Array.from(permissionMap.values()),
  };
};

// Users who hold a role with this name (case-insensitive) within the org —
// used to populate the "assign a manager" pickers, since Manager is just a
// role like any other, not a separate flag on User.
export const findUsersByRoleName = async (orgId, roleName) => await User.findAll({
  where: { org_id: orgId, active: true },
  attributes: ["id", "name", "email"],
  include: {
    model: UserRoleMapping,
    where: { active: true },
    required: true,
    attributes: [],
    include: {
      model: Role,
      where: { active: true, name: roleName },
      required: true,
      attributes: [],
    },
  },
});
