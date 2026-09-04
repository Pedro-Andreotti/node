const express = require("express");

const app = express();

const produtos = [
  { id: 1, nome: "Notebook", preco: 3500 },
  { id: 2, nome: "Mouse", preco: 120 },
];

app.use(express.json());

app.get("/produtos", (req, res) => {
  res.status(200).json(produtos);
});

app.listen(3000, "0.0.0.0", () => {
  console.log("API rodando na porta 3000");
});
