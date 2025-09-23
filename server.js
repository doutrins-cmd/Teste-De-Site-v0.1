const express = require('express');
const Datastore = require('nedb');
const app = express();

const port = 8080;

// Configurar o servidor para servir arquivos estáticos da sua pasta
app.use(express.static(__dirname + '/in-front')); 
app.use(express.json());

// Criar o banco de dados
const database = new Datastore('stock.db');
database.loadDatabase();

// Dados iniciais (serão inseridos se o banco de dados estiver vazio)
const defaultStockItems = [
    { name: 'Peças de Reposição', quantity: 25, minQuantity: 30, imageUrl: 'caldeira_mini.jpg' },
    { name: 'Válvulas de Segurança', quantity: 80, minQuantity: 10, imageUrl: 'valvula_mini.jpg' },
    { name: 'Manômetros de Pressão', quantity: 15, minQuantity: 20, imageUrl: 'manometro.jpg' },
    { name: 'Anel de Vedação', quantity: 50, minQuantity: 5, imageUrl: 'anel_vedacao.jpg' }
];

// Inserir dados iniciais se o banco de dados estiver vazio
database.find({}, (err, docs) => {
  if (docs.length === 0) {
    database.insert(defaultStockItems, (err, newDocs) => {
      console.log('Dados iniciais inseridos:', newDocs);
    });
  } else {
    console.log('Banco de dados já contém dados.');
  }
});

// Rota para obter todos os itens do estoque
app.get('/api/stock', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        response.json(data);
    });
});

// Rota para atualizar um item do estoque
app.post('/api/update', (request, response) => {
    const data = request.body;
    const _id = data._id;
    delete data._id; // _id não deve ser atualizado
    database.update({ _id: _id }, { $set: data }, {}, (err, numReplaced) => {
        if (err) {
            response.end();
            return;
        }
        response.json({ message: 'Item atualizado com sucesso!' });
    });
});

// Rota para excluir um item do estoque
app.post('/api/delete', (request, response) => {
    const _id = request.body._id;
    database.remove({ _id: _id }, {}, (err, numRemoved) => {
        if (err) {
            response.end();
            return;
        }
        response.json({ message: 'Item excluído com sucesso!' });
    });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});