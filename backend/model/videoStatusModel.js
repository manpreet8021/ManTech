import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Video from './videoModel.js';

class VideoStatus extends Model {}

VideoStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    step: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    video_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: Video,
        key: "id",
      },
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'VideoStatus', // The name of the model
    tableName: 'video_status', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

VideoStatus.belongsTo(Video, { foreignKey: 'video_id' });
Video.hasOne(VideoStatus, { foreignKey: 'video_id' });

export default VideoStatus