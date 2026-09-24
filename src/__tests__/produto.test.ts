import request from "supertest";
import app, { startServer } from "../app";
import { sequelize, connectDatabase } from "../database";
import Produto from "../models/produto.model";

describe("CRUD de produtos", () => {
  beforeAll(async () => {
    await connectDatabase();
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await Produto.destroy({ where: {}, truncate: true });
  });

  test("GET /produtos retorna lista vazia", async () => {
    const response = await request(app).get("/produtos");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("POST /produtos cria um produto", async () => {
    const response = await request(app)
      .post("/produtos")
      .send({ nome: "Notebook", preco: 2999.9, descricao: "Laptop gamer" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      nome: "Notebook",
      preco: 2999.9,
      descricao: "Laptop gamer",
    });
    expect(response.body.id).toBeDefined();
  });

  test("GET /produtos/:id busca um produto existente", async () => {
    const produto: any = await Produto.create({
      nome: "Mouse",
      preco: 89.9,
      descricao: "Sem fio",
    });

    const response = await request(app).get(`/produtos/${produto.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: produto.id,
      nome: "Mouse",
      descricao: "Sem fio",
    });
  });

  test("GET /produtos/:id retorna 404 quando não existe", async () => {
    const response = await request(app).get("/produtos/9999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ mensagem: "Produto não encontrado" });
  });

  test("PUT /produtos/:id atualiza um produto", async () => {
    const produto: any = await Produto.create({
      nome: "Teclado",
      preco: 159.9,
      descricao: "Mecânico",
    });

    const response = await request(app)
      .put(`/produtos/${produto.id}`)
      .send({ nome: "Teclado RGB", preco: 179.9 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: produto.id,
      nome: "Teclado RGB",
      preco: 179.9,
    });
  });

  test("PUT /produtos/:id rejeita nome vazio", async () => {
    const produto: any = await Produto.create({
      nome: "Cabos",
      preco: 15.5,
      descricao: "USB-C",
    });

    const response = await request(app)
      .put(`/produtos/${produto.id}`)
      .send({ nome: "   ", preco: 12.5 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensagem", "Nome é obrigatório");
  });

  test("PUT /produtos/:id rejeita preço nulo", async () => {
    const produto: any = await Produto.create({
      nome: "Fone",
      preco: 60,
      descricao: "Bluetooth",
    });

    const response = await request(app)
      .put(`/produtos/${produto.id}`)
      .send({ nome: "Fone Pro", preco: null });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensagem", "Preço é obrigatório");
  });

  test("PUT /produtos/:id retorna 404 quando não existe", async () => {
    const response = await request(app)
      .put("/produtos/9999")
      .send({ nome: "Produto novo", preco: 10 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ mensagem: "Produto não encontrado" });
  });

  test("DELETE /produtos/:id remove um produto", async () => {
    const produto: any = await Produto.create({
      nome: "Monitor",
      preco: 899.9,
      descricao: "27 polegadas",
    });

    const response = await request(app).delete(`/produtos/${produto.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      mensagem: "Produto removido com sucesso",
    });

    const existente = await Produto.findByPk(produto.id);
    expect(existente).toBeNull();
  });

  test("DELETE /produtos/:id retorna 404 quando não existe", async () => {
    const response = await request(app).delete("/produtos/9999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ mensagem: "Produto não encontrado" });
  });

  test("POST /produtos valida nome e preço obrigatórios", async () => {
    const response = await request(app).post("/produtos").send({ preco: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("mensagem");
  });

  test("controllers retornam erro 500 em exceções internas", async () => {
    const service = await import("../services/produto.service");
    const listarSpy = jest
      .spyOn(service, "listar")
      .mockRejectedValue(new Error("Erro no listar"));
    const req = {} as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await (await import("../controllers/produto.controller")).listar(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro no listar" });

    listarSpy.mockRestore();

    const buscarSpy = jest
      .spyOn(service, "buscarPorId")
      .mockRejectedValue(new Error("Erro no buscar"));

    await (
      await import("../controllers/produto.controller")
    ).buscarPorId({ params: { id: "1" } } as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro no buscar" });

    buscarSpy.mockRestore();

    const removerSpy = jest
      .spyOn(service, "remover")
      .mockRejectedValue(new Error("Erro no remover"));

    await (
      await import("../controllers/produto.controller")
    ).remover({ params: { id: "1" } } as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro no remover" });

    removerSpy.mockRestore();
  });

  test("controllers retornam erro 400 em exceções de criação e atualização", async () => {
    const service = await import("../services/produto.service");
    const criarSpy = jest
      .spyOn(service, "criar")
      .mockRejectedValue(new Error("Erro no criar"));
    const atualizarSpy = jest
      .spyOn(service, "atualizar")
      .mockRejectedValue(new Error("Erro no atualizar"));
    const controller = await import("../controllers/produto.controller");
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await controller.criar({ body: { nome: "X" } } as any, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro no criar" });

    await controller.atualizar(
      { params: { id: "1" }, body: { nome: "Y" } } as any,
      res,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro no atualizar" });

    criarSpy.mockRestore();
    atualizarSpy.mockRestore();

    const listStringSpy = jest
      .spyOn(service, "listar")
      .mockRejectedValue("erro não-Error");
    const buscarStringSpy = jest
      .spyOn(service, "buscarPorId")
      .mockRejectedValue("erro não-Error");
    const removerStringSpy = jest
      .spyOn(service, "remover")
      .mockRejectedValue("erro não-Error");
    const criarStringSpy = jest
      .spyOn(service, "criar")
      .mockRejectedValue("erro não-Error");
    const atualizarStringSpy = jest
      .spyOn(service, "atualizar")
      .mockRejectedValue("erro não-Error");

    await controller.listar({} as any, res);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro interno" });

    await controller.buscarPorId({ params: { id: "1" } } as any, res);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro interno" });

    await controller.remover({ params: { id: "1" } } as any, res);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro interno" });

    await controller.criar({ body: { nome: "X" } } as any, res);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro interno" });

    await controller.atualizar(
      { params: { id: "1" }, body: { nome: "Y" } } as any,
      res,
    );
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro interno" });

    listStringSpy.mockRestore();
    buscarStringSpy.mockRestore();
    removerStringSpy.mockRestore();
    criarStringSpy.mockRestore();
    atualizarStringSpy.mockRestore();
  });

  test("startServer inicia o servidor após conectar ao banco", async () => {
    const connectSpy = jest
      .spyOn(require("../database"), "connectDatabase")
      .mockResolvedValue(undefined);
    const listenSpy = jest
      .spyOn(require("http").Server.prototype, "listen")
      .mockImplementation((..._args: any[]) => ({}) as any);

    await startServer();

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(listenSpy).toHaveBeenCalledWith(3000, expect.any(Function));

    connectSpy.mockRestore();
    listenSpy.mockRestore();
  });

  test("controller normaliza ids vindos em array em req.params", async () => {
    const controller = await import("../controllers/produto.controller");
    const produto = await Produto.create({ nome: "Adaptador", preco: 30 });

    const req = { params: { id: [String(produto.id)] } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await controller.buscarPorId(req, res);
    await controller.atualizar(req, res);
    await controller.remover(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("serviço cobre branches faltantes de criação, busca e remoção", async () => {
    const service = await import("../services/produto.service");

    await expect(service.criar({} as any)).rejects.toThrow(
      "Nome e preço são obrigatórios",
    );
    await expect(service.criar({ nome: "Sem preço" } as any)).rejects.toThrow(
      "Nome e preço são obrigatórios",
    );
    await expect(
      service.criar({ nome: "Sem nome", preco: null } as any),
    ).rejects.toThrow("Nome e preço são obrigatórios");

    await expect(service.buscarPorId(9999)).resolves.toBeNull();

    const produto = await Produto.create({ nome: "Cabo", preco: 22 });
    await expect(
      service.atualizar(9999, { nome: "X", preco: 10 }),
    ).resolves.toBeNull();
    await expect(service.remover(9999)).resolves.toBe(false);

    await expect(
      service.atualizar(produto.id, { nome: "   ", preco: 10 }),
    ).rejects.toThrow("Nome é obrigatório");
    await expect(
      service.atualizar(produto.id, { nome: "Cabo extra", preco: null }),
    ).rejects.toThrow("Preço é obrigatório");
  });
});
