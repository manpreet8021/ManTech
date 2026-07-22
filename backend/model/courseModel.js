import { DataTypes, Model, Op } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Organisation from './organisationModel.js';
import User from './userModel.js';

class Course extends Model { }

Course.init(
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
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Organisation,
        key: 'id'
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'Course', // The name of the model
    tableName: 'course', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

Course.belongsTo(User, { foreignKey: 'user_id' });
Course.belongsTo(Organisation, { foreignKey: 'org_id' });

export default Course

export const findCourse = async (condition) => await Course.findOne({ where: condition });
export const createCourse = async (data) => await Course.create(data);
export const updateCourse = async (data, id) => await Course.update(data, { where: { id: id, user_id: data.user_id, org_id: data.org_id } });
export const deleteCourse = async (id) => await Course.destroy({ where: { id: id } });

// A course is visible to the teacher who owns it, and to any manager it has
// been explicitly assigned to via course_manager_mapping (see
// courseManagerModel.js). There's no separate "see everything" scope — org-wide
// visibility just falls out of being assigned to every course.
export const findVisibleCourses = async (userId, orgId, assignedCourseIds) => await Course.findAll({
  where: {
    org_id: orgId,
    active: true,
    [Op.or]: [
      { user_id: userId },
      { id: { [Op.in]: assignedCourseIds } },
    ],
  },
});
