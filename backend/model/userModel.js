import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Organisation from './organisationModel.js';

class User extends Model { }

User.init(
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
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Organisation,
        key: 'id',
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'User', // The name of the model
    tableName: 'user', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

User.belongsTo(Organisation, { foreignKey: 'org_id' });
Organisation.hasMany(User, { foreignKey: 'org_id' });

// Uniqueness of (email, org_id) is enforced in the DB, but only among active
// users — soft-deleted (active=false) rows must not permanently block that
// email from being reused in the same org. MySQL has no partial unique index,
// so this is done via a generated `active_email` column (email when active,
// NULL otherwise — NULLs don't collide in a unique index) with a unique index
// on (active_email, org_id). That column/index lives only in the DB — see the
// one-off migration that created it — and is deliberately not declared as a
// Sequelize attribute here, since the app should never read or write it directly.

export default User

export const createUserModel = async (data) => await User.create(data);
export const findUser = async (condition) => await User.findOne({ where: condition });
export const updateUserModel = async (data, id) => await User.update(data, { where: { id: id, org_id: data.org_id } });
export const deleteUser = async (id) => await User.destroy({ where: { id: id } });

// No org constraint on purpose: this backs password-reset, which runs before
// the caller has any session — a verified, signed reset token (tied to this
// exact user id) is the authorization proof here, not an org-scoped session.
export const setUserPassword = async (id, hashedPassword) => await User.update({ password: hashedPassword }, { where: { id } });
