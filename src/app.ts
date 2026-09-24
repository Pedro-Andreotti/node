import express from "express";
import produtoRoutes from "./routes/produto.routes";
import { connectDatabase } from "./database";

const app = express();

app.use(express.json());
app.use("/produtos", produtoRoutes);

export const startServer = async (): Promise<void> => {
  const port = Number(process.env.PORT || 3000);
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
};

if (require.main === module) {
  startServer();
}

export default app;
