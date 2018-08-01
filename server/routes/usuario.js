const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken, verificaPermisos } = require('../middlewares/autenticacion');
const app = express();

//app.get('/usuario', function(req, res) {
app.get('/usuario', verificaToken, (req, res) => { //Aquí solo indico que ese middleware (verificaToken) se va a disparar al llamarse el get.
    /*
        return res.json({
            usuario: req.usuario,
            nombre: req.usuario.nombre,
            email: req.usuario.email
        });

    */
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    // {estado: true}
    Usuario.find({ estado: true }, 'nombre email role google img')
        .skip(desde) // Salta los primeros "desde" (1, 2, 5, etc.) y muestra a partir de ahí...
        .limit(limite) // ...los siguientes 10 solamente
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.countDocuments({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios: usuarios, //Recuerda que a partir de versión 6 ya solo necesitas poner usuarios (si se llaman igual)
                    cuantos: conteo
                });
            });
        })
});
app.post('/usuario', [verificaToken, verificaPermisos], function(req, res) {
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
app.put('/usuario/:id', [verificaToken, verificaPermisos], function(req, res) {
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
app.delete('/usuario/:id', [verificaToken, verificaPermisos], function(req, res) {

    let id = req.params.id;

    //console.log(id);
    Usuario.findByIdAndUpdate(id, { estado: false }, {
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
        //console.log(usuarioDB);
        if (!usuarioDB) { // Es lo mismo que lo comentado arriba
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        }); // Respuesta JSON
    });
});

module.exports = app;