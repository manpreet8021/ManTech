import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Course from './courseModel.js';
import User from './userModel.js';

class CourseManagerMapping extends Model { }

CourseManagerMapping.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'course_manager',
      references: {
        model: Course,
        key: 'id'
      }
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'course_manager',
      references: {
        model: User,
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
    sequelize,
    modelName: 'CourseManagerMapping',
    tableName: 'course_manager_mapping',
    timestamps: true,
  }
);

CourseManagerMapping.belongsTo(Course, { foreignKey: 'course_id' });
CourseManagerMapping.belongsTo(User, { foreignKey: 'manager_id' });

export default CourseManagerMapping

export const createCourseManagerMapping = async (data) => await CourseManagerMapping.create(data);
export const deleteCourseManagerMappingByCourse = async (courseId) => await CourseManagerMapping.destroy({ where: { course_id: courseId } });

// The course ids a given manager has been explicitly assigned to — the
// authorization check behind "manager can see the assigned course of that teacher".
export const getCourseIdsForManager = async (managerId) => {
  const rows = await CourseManagerMapping.findAll({
    where: { manager_id: managerId, active: true },
    attributes: ['course_id'],
  });
  return rows.map((r) => r.course_id);
};

export const getManagersForCourse = async (courseId) => {
  const rows = await CourseManagerMapping.findAll({
    where: { course_id: courseId, active: true },
    include: { model: User, attributes: ['id', 'name', 'email'] },
  })
  return rows.map((row) => ({ id: row.User.id, name: row.User.name, email: row.User.email }))
}

// One query for a whole course list instead of N+1 — used by getAllCourse so
// the list view can show assigned managers too, not just single-course reads.
export const getManagersMapForCourses = async (courseIds) => {
  if (!courseIds.length) return {}

  const rows = await CourseManagerMapping.findAll({
    where: { course_id: courseIds, active: true },
    include: { model: User, attributes: ['id', 'name', 'email'] },
  })

  const map = {}
  for (const row of rows) {
    if (!map[row.course_id]) map[row.course_id] = []
    map[row.course_id].push({ id: row.User.id, name: row.User.name, email: row.User.email })
  }
  return map
}
