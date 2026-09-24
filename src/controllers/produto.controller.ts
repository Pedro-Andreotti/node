import { Request, Response } from "express";
import * as service from "../services/produto.service";

const getRouteId = (req: Request): string | number => {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
};

export const listar = async (req: Request, res: Response): Promise<void> => {
  try {
    const produtos = await service.listar();
    res.status(200).json(produtos);
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro interno";
    res.status(500).json({ mensagem });
  }
};

export const buscarPorId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const produto = await service.buscarPorId(getRouteId(req));

    if (!produto) {
      res.status(404).json({ mensagem: "Produto não encontrado" });
      return;
    }

    res.status(200).json(produto);
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro interno";
    res.status(500).json({ mensagem });
  }
};

export const criar = async (req: Request, res: Response): Promise<void> => {
  try {
    const produto = await service.criar(req.body);
    res.status(201).json(produto);
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro interno";
    res.status(400).json({ mensagem });
  }
};

export const atualizar = async (req: Request, res: Response): Promise<void> => {
  try {
    const produto = await service.atualizar(getRouteId(req), req.body);

    if (!produto) {
      res.status(404).json({ mensagem: "Produto não encontrado" });
      return;
    }

    res.status(200).json(produto);
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro interno";
    res.status(400).json({ mensagem });
  }
};

export const remover = async (req: Request, res: Response): Promise<void> => {
  try {
    const removido = await service.remover(getRouteId(req));

    if (!removido) {
      res.status(404).json({ mensagem: "Produto não encontrado" });
      return;
    }

    res.status(200).json({ mensagem: "Produto removido com sucesso" });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro interno";
    res.status(500).json({ mensagem });
  }
};
