import { sequelize } from "./sequelize.js";
import Video from "../model/videoModel.js";
import VideoStatus from "../model/videoStatusModel.js";
import Transcribe from "../model/transcribeModel.js";
import Quiz from "../model/quizModel.js";
import Organisation from "../model/organisationModel.js";
import User from "../model/userModel.js";
import Role from "../model/roleModel.js";
import Permission from "../model/permissionModel.js";
import RolePermission from "../model/rolePermissionModel.js";
import UserRoleMapping from "../model/userRoleModel.js";

const connectDb = async () => {
  await sequelize
    .authenticate()
    .then(() => console.log("Connection has been established successfully."))
    .catch((error) =>
      console.error("Unable to connect to the database:", error)
    );

  try {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await sequelize.sync();
    console.log("Database & tables created!");
  } catch (error) {
    console.error("Error syncing database:", error);
  } finally {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  }
};

export { connectDb };
