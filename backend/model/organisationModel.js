import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';

class Organisation extends Model { }

Organisation.init(
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
    url: {
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
    modelName: 'Organisation', // The name of the model
    tableName: 'organisation', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

export default Organisation