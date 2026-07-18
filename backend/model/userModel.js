import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';

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
      allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'User', // The name of the model
    tableName: 'user', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

export default User