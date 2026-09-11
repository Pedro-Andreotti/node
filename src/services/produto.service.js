const Produto = require("../models/produto.model");

const produtos = [
    new Produto ({id: 1, nome: "Notebook", preco: 3000}),
    new Produto ({id: 2, nome: "Mouse", preco: 90})
]

function listar() {
    produtos.forEach(p => {
        console.log(`${p.nome} (R$${p.preco}) - em promoção? ${p.estaEmPromocao()}`);
    });
    return produtos;
}

function buscarPorId(id) {
    return produtos.find(p => p.id === Number(id));
}

function criar(dados) {
    if (!dados.nome || dados.preco == null) {
        throw new Error("Nome e preço são obrigatórios");
    }

    const produto = new Produto({
        id: produtos.length + 1,
        nome: dados.nome,
        preco: dados.preco
    });

    produtos.push(produto);
    return produto;
}

module.exports = {
    listar,
    buscarPorId,
    criar
};