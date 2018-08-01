require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const colors = require('colors/safe')
const app = express();
const bodyParser = require('body-parser');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Configuración global de rutas. Index me traerá todas.
app.use(require('./routes/index'));



mongoose.connect(process.env.URLDB, { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;

    console.log('Base de datos ' + colors.green('ONLINE'));
});
app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ' + process.env.PORT);
});