const Produto =
    require("../models/produto.model");

function listar() {
  return produtos;  
}

function buscarPorId(id){
    return produtos.find(p => p.id === Number(id));
}

function criar(dados){
        const produto = new Produto({
            id: produtos.length + 1,
            nome: dados.nome,
            preco: dados.preco
        });

    produtos.push(produto);
    return produto;
}

module.exports = {listar, buscarPorId, criar};