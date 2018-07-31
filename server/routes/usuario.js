const express = require('express');
const app = express();

app.get('/usuario', function(req, res) {
    //res.send('Hello World!')      // Respuesta HTML
    res.json('get Usuario') // Respuesta JSON
});
app.post('/usuario', function(req, res) {
    let body = req.body;
    //res.send('Hello World!')      // Respuesta HTML
    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
    } else {
        res.json({
            persona: body
        }); // Respuesta JSON
    }
});
app.put('/usuario/:id', function(req, res) {
    //res.send('Hello World!')      // Respuesta HTML
    let id = req.params.id;

    res.json({
        id
    }); // Respuesta JSON

});
app.delete('/usuario', function(req, res) {
    //res.send('Hello World!')      // Respuesta HTML
    res.json('delete Usuario') // Respuesta JSON
});

module.exports = app;