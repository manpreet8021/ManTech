import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Course from './courseModel.js';

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
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Course,
        key: 'id'
      }
    },
    // Optional supplementary lecture notes uploaded alongside the video —
    // not used by the AI pipeline, just served back to students.
    pdf_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Set by the FastAPI download scheduler once it fetches the audio; stays
    // NULL until then so `get_next_video_without_audio` can find new work.
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

Video.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(Video, { foreignKey: 'course_id' });

export default Video

export const createVideoModel = async (data) => await Video.create(data);
export const findAllVideosForCourse = async (courseId) => await Video.findAll({
  where: { course_id: courseId },
  order: [['id', 'ASC']],
});
