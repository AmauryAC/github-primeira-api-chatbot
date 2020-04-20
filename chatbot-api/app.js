require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const Client = require('node-rest-client').Client;

const app = express();

const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

const client = new Client();

const assistant = new AssistantV1({
    version: process.env.ASSISTANT_VERSION,
    authenticator: new IamAuthenticator({
        apikey: process.env.ASSISTANT_AUTH_API_KEY
    }),
    url: process.env.ASSISTANT_URL
});

app.post('/conversation', (req, res) => {
    const { text, context = {} } = req.body;

    const params = {
        input: { text },
        workspaceId: process.env.ASSISTANT_WORKSPACE_ID,
        context
    }

    assistant.message(params)
    .then(result => {
        let status = 'Chatbot Ativo';

        if(result.result.context.system.last_branch_node == 'Em outros casos') {
            status = 'Ativar Transbordo';
        }

        let data = {
            result: result.result,
            status: status
        }

        if(status == 'Ativar Transbordo') {
            let URL = process.env.TRANSBORDO_BASE_URL;

            let args = {
                data: data,
                headers: { "Content-Type": "application/json" }
            }

            client.post(URL, args, (data, response) => {
                console.log(data);
            }).on('error', (err) => {
                throw new Error('Algo de errado aconteceu na requisição.');
            });   
        }

        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).json({ message: 'Erro ao processar mensagem.' });
    });
});

app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});