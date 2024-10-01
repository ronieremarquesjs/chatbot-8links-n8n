const express = require('express');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

// Configure o body-parser para analisar dados de formulários
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define a rota raiz que redireciona para a página chatbot.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatbot.html'));
});

// Define a pasta 'public' como pasta de arquivos estáticos
app.use(express.static('public'));

// Define a rota para lidar com as mensagens enviadas pelo usuário
app.post('/send-message', async (req, res) => {
    const message = req.body.message;

    if (message && message.trim() !== "") {
        try {
            // Envie a mensagem para o webhook do n8n
            const responseFromN8n = await axios.post('https://n8n.smarthat.com.br/webhook/7eb8125d-8d86-4c33-9d54-32825341eb96', {
                message: message
            });

            // Verifique se o webhook retornou uma resposta bem-sucedida
            if (responseFromN8n.data && responseFromN8n.status === 200) {
                // Supondo que o campo 'response' contenha a resposta da IA
                const responseMessage = responseFromN8n.data.content;
                
                // Responda diretamente ao usuário com a mensagem da IA
                res.status(200).json({ message: responseMessage });
            } else {
                res.status(400).json({ error: 'Erro na resposta do webhook' });
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem para o webhook:', error);
            res.status(500).json({ error: 'Erro ao enviar mensagem' });
        }
    } else {
        res.status(400).json({ error: 'Mensagem não pode estar vazia' });
    }
});

// Inicie o servidor na porta 8080
app.listen(8080, () => {
    console.log('Servidor rodando na porta 8080');
});
