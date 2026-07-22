import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import User from './userModel.js';

class ManagerTeacherMapping extends Model { }

ManagerTeacherMapping.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'manager_teacher',
      references: {
        model: User,
        key: 'id'
      }
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'manager_teacher',
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
    modelName: 'ManagerTeacherMapping',
    tableName: 'manager_teacher_mapping',
    timestamps: true,
  }
);

// Self-referencing FK to User twice on the same model — needs distinct aliases
// so Sequelize doesn't collide the two associations.
ManagerTeacherMapping.belongsTo(User, { foreignKey: 'manager_id', as: 'Manager' });
ManagerTeacherMapping.belongsTo(User, { foreignKey: 'teacher_id', as: 'Teacher' });

export default ManagerTeacherMapping

export const createManagerTeacherMapping = async (data) => await ManagerTeacherMapping.create(data);
export const deleteManagerTeacherMapping = async (managerId, teacherId) => await ManagerTeacherMapping.destroy({ where: { manager_id: managerId, teacher_id: teacherId } });
export const deleteManagerTeacherMappingByTeacherId = async (teacherId) => await ManagerTeacherMapping.destroy({ where: { teacher_id: teacherId } });

// Who a given teacher's eligible managers are — used to populate the
// "assign to manager" picker when creating/editing one of their courses.
export const getManagersForTeacher = async (teacherId) => await ManagerTeacherMapping.findAll({
  where: { teacher_id: teacherId, active: true },
  include: { model: User, as: 'Manager', attributes: ['id', 'name', 'email'] },
});

// One query for a whole user list instead of N+1 — used by getAllUser to
// prefill each row's current manager. Single-manager UI for now: if a
// teacher somehow has more than one active mapping, the first wins.
export const getManagerMapForTeachers = async (teacherIds) => {
  if (!teacherIds.length) return {}

  const rows = await ManagerTeacherMapping.findAll({
    where: { teacher_id: teacherIds, active: true },
  })

  const map = {}
  for (const row of rows) {
    if (!(row.teacher_id in map)) map[row.teacher_id] = row.manager_id
  }
  return map
}
