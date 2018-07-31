const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const app = express();

app.get('/usuario', function(req, res) {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({})
        .skip(desde) // Salta los primeros "desde" (1, 2, 5, etc.) y muestra a partir de ahí...
        .limit(limite) // ...los siguientes 10 solamente
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.countDocuments({}, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios: usuarios, //Recuerda que a partir de versión 6 ya solo necesitas poner usuarios (si se llaman igual)
                    cuantos: conteo
                });
            });
        })
});
app.post('/usuario', function(req, res) {
    let body = req.body;
    //res.send('Hello World!')      // Respuesta HTML

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });
});
app.put('/usuario/:id', function(req, res) {
    //res.send('Hello World!')      // Respuesta HTML
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //console.log(id);
    Usuario.findByIdAndUpdate(id, body, {
        // http://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate
        // Para regresar el nuevo documento en vez del original
        new: true,
        //Ejecuta las validaciones antes de actualizar
        runValidators: true,
        context: 'query'
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        console.log(usuarioDB);
        res.json({
            ok: true,
            usuario: usuarioDB
        }); // Respuesta JSON
    });


});
app.delete('/usuario', function(req, res) {
    //res.send('Hello World!')      // Respuesta HTML
    res.json('delete Usuario') // Respuesta JSON
});

module.exports = app;