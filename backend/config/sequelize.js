import { Sequelize } from 'sequelize';
import dotenv from 'dotenv'
dotenv.config();

const sequelize = new Sequelize({
  host: 'localhost',         // Database host
  dialect: 'mysql',          // Database type (e.g., mysql, postgres, etc.)
  username: process.env.MYSQLUSER, // Database username loveiosa
  password: process.env.MYSQLPASSWORD, // Database password 0bBwcbfb51
  database: process.env.MYSQLDATABASE, // Database name Loveiosa
  port: 3306,
  logging: console.log,
  dialectOptions: {
    charset: 'utf8mb4',
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
});

export { sequelize };
