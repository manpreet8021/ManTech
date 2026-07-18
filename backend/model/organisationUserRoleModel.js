import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/sequelize.js';
import Organisation from './organisationModel.js';
import Role from './roleModel.js';
import User from './userModel.js';

class OrganisationUserRoleMapping extends Model { }

OrganisationUserRoleMapping.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Organisation,
        key: "id",
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: User,
            key: 'id'
        }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue:true
    }
  },
  {
    sequelize, // The database connection instance
    modelName: 'OrganisationUserRoleMapping', // The name of the model
    tableName: 'organisation_user_role_mapping', // The name of the table in MySQL
    timestamps: true, // Whether to add timestamps (createdAt, updatedAt)
  }
);

OrganisationUserRoleMapping.belongsTo(Organisation, { foreignKey: 'org_id' });
Organisation.hasMany(OrganisationUserRoleMapping, { foreignKey: 'org_id' });

OrganisationUserRoleMapping.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(OrganisationUserRoleMapping, { foreignKey: 'role_id' });

OrganisationUserRoleMapping.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(OrganisationUserRoleMapping, { foreignKey: 'user_id' });

export default OrganisationUserRoleMapping
