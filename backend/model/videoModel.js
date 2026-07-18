import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';

class Video extends Model {}

Video.init(
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
    audio_path: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'Video', // The name of the model
    tableName: 'video', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

export default Video