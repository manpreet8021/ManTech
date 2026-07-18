import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Video from './videoModel.js';

class Quiz extends Model { }

Quiz.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Video,
        key: "id",
      },
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'Quiz', // The name of the model
    tableName: 'quiz', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

Quiz.belongsTo(Video, { foreignKey: 'video_id' });
Video.hasMany(Quiz, { foreignKey: 'video_id' });

export default Quiz