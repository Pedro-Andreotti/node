import Produto, {
  ProdutoAttributes,
  ProdutoInstance,
} from "../models/produto.model";

export interface ProdutoInput {
  nome?: string;
  preco?: number | string | null;
  descricao?: string | null;
}

export async function listar(): Promise<ProdutoInstance[]> {
  return Produto.findAll({
    order: [["id", "ASC"]],
  }) as Promise<ProdutoInstance[]>;
}

export async function buscarPorId(
  id: string | number,
): Promise<ProdutoInstance | null> {
  return Produto.findByPk(id) as Promise<ProdutoInstance | null>;
}

export async function criar(dados: ProdutoInput): Promise<ProdutoInstance> {
  if (!dados || !dados.nome || dados.preco == null) {
    throw new Error("Nome e preço são obrigatórios");
  }

  return Produto.create({
    nome: dados.nome,
    preco: dados.preco,
    descricao: dados.descricao || null,
  }) as Promise<ProdutoInstance>;
}

export async function atualizar(
  id: string | number,
  dados?: ProdutoInput,
): Promise<ProdutoInstance | null> {
  const produto = await buscarPorId(id);

  if (!produto) {
    return null;
  }

  if (dados && dados.nome !== undefined && !dados.nome.trim()) {
    throw new Error("Nome é obrigatório");
  }

  if (dados && dados.preco !== undefined && dados.preco == null) {
    throw new Error("Preço é obrigatório");
  }

  await produto.update({
    nome: dados?.nome ?? produto.nome,
    preco: dados?.preco ?? produto.preco,
    descricao: dados?.descricao ?? produto.descricao,
  });

  return produto as ProdutoInstance;
}

export async function remover(id: string | number): Promise<boolean> {
  const produto = await buscarPorId(id);

  if (!produto) {
    return false;
  }

  await produto.destroy();
  return true;
}
