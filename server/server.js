const express = require('express');
const app = express();

app.get('/', function(req, res) {
    //res.send('Hello World!')      // Respuesta HTML
    res.json('Hello, World!') // Respuesta JSON
});

app.listen(3000, () => {
    console.log('Escuchando puerto: ' + 3000);
});