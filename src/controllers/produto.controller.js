const produtos = [
    {id: 1, nome: "Notebook", preco: 3500}
];

exports.listar = (req,res) => {
    res.json(produtos);
};

exports.criar = (req,res) => {
    const produto = {id:2, ...req.body};
    produtos.push(produto);
    res.status(201).json(produto);
};