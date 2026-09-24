import { Sequelize } from "sequelize";

const isTestEnvironment = process.env.NODE_ENV === "test";
const defaultStorage = isTestEnvironment
  ? "./database.test.sqlite"
  : "./database.sqlite";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DB_PATH || defaultStorage,
  logging: false,
  define: {
    underscored: false,
  },
});

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    await import("./models/produto.model");
    await sequelize.sync({ alter: true });
    console.log("Conexão com o banco estabelecida com sucesso.");
  } catch (error) {
    console.error("Não foi possível conectar ao banco de dados:", error);
    throw error;
  }
}
