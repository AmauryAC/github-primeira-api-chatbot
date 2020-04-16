const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const app = express();

const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const assistant = new AssistantV1({
    version: '2020-04-15',
    authenticator: new IamAuthenticator({
        apikey: 'JaicNmeSz3Mf8278iH1VTOWkgJ-0vmYpnBn-POke4ndP'
    }),
    url: 'https://api.eu-gb.assistant.watson.cloud.ibm.com/instances/abb65167-1926-4bdd-bbb4-a23431794b37'
});

app.post('/conversation/', (req, res) => {
    const { text, context = {} } = req.body;

    const params = {
        input: { text },
        workspaceId: '7db5a453-4c75-497e-a7c1-4fb89d7feafd',
        context
    }

    assistant.message(params)
    .then(result => {
        res.status(200).json(result.result);
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});