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
      unique: 'email_org_id'
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'email_org_id',
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

export default User

export const createUserModel = async (data) => await User.create(data);
export const findUser = async (condition) => await User.findOne({ where: condition });
export const updateUser = async (data, id) => await User.update(data, { where: { id: id } });
export const deleteUser = async (id) => await User.destroy({ where: { id: id } });
