import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database";

export interface ProdutoAttributes {
  id: number;
  nome: string;
  preco: number | string;
  descricao?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProdutoCreationAttributes = Optional<
  ProdutoAttributes,
  "id" | "descricao" | "createdAt" | "updatedAt"
>;

export interface ProdutoInstance
  extends
    Model<ProdutoAttributes, ProdutoCreationAttributes>,
    ProdutoAttributes {}

const Produto = sequelize.define<ProdutoInstance>(
  "Produto",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "produtos",
    timestamps: true,
  },
);

export default Produto;
