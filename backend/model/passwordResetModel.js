import crypto from "crypto";
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import User from './userModel.js';

class PasswordReset extends Model { }

PasswordReset.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    // The JWT itself is never stored — only a hash of it, so a database leak
    // doesn't hand out working reset links.
    token_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'PasswordReset',
    tableName: 'password_reset',
    timestamps: true,
  }
);

PasswordReset.belongsTo(User, { foreignKey: 'user_id' });

export default PasswordReset

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
export const createPasswordReset = async (data) => await PasswordReset.create(data);
export const findPasswordReset = async (condition) => await PasswordReset.findOne({ where: condition });
export const markPasswordResetUsed = async (id) => await PasswordReset.update({ used: true }, { where: { id } });
