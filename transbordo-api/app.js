require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const app = express();

const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

app.post('/transbordo', (req, res) => {
    let data = req.body;

    let options = {
        auth: {
            api_key: process.env.SENDGRID_API_KEY
        }
    }

    let client = nodemailer.createTransport(sgTransport(options));

    let email = {
        from: process.env.EMAIL_SENDER,
        to: process.env.EMAIL_RECEIVER,
        subject: 'Dúvida do Cliente',
        text: `Conversa ${ data.result.context.conversation_id }`,
        html: `O robô não conseguiu responder a pergunta: <br/><strong>${ data.result.input.text }</strong>`
    }

    client.sendMail(email, (err, info) => {
        if(err) {
            res.status(500).json({ message: 'Erro no envio do e-mail.' });
        } else {
            res.status(200).json({ message: 'Mensagem enviada!!!' });
        }
    });
});

app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});