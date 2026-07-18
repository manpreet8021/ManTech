import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Video from './videoModel.js';

class Transcribe extends Model { }

Transcribe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    transcription: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    chunks: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    translation: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    translation_progress: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    summary_chunk_progress: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    summary: {
      type: DataTypes.TEXT('long'),
      allowNull: true
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
    modelName: 'Transcribe', // The name of the model
    tableName: 'transcribe', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

Transcribe.belongsTo(Video, { foreignKey: 'video_id' });
Video.hasOne(Transcribe, { foreignKey: 'video_id' });

export default Transcribe