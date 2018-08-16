const express = require('express');
let app = express();
const _ = require('underscore');

let { verificaToken, verificaPermisos } = require('../middlewares/autenticacion');
let Categoria = require('../models/categoria');


//============================================
// Mostrar todas las categorías
//============================================
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({}, 'nombre descripcion')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Categoria.countDocuments({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            });
        });
});

//============================================
// Mostrar categoría por ID
//============================================
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID de categoría solicitado no existe'
                }
            });
        }
        res.json({
            ok: true,
            categoriaDB
        });
    });
});

//============================================
// Crear nueva categoría
//============================================
app.post('/categoria', verificaToken, (req, res) => {
    // Regresa la nueva categoría
    let usuarioId = req.usuario._id;
    let body = req.body;

    let categoriaAInsertar = new Categoria({
        nombre: body.nombre,
        descripcion: body.descripcion,
        idUsuario: usuarioId
    });

    categoriaAInsertar.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoriaDB
        });
    });
});

//============================================
// Actualizar categoría por ID
//============================================
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let usuarioId = req.usuario._id;
    let body = _.pick(req.body, ['nombre', 'descripcion']);
    body.usuarioId = usuarioId;

    Categoria.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID de categoría solicitado no existe'
                }
            });
        }
        res.json({
            ok: true,
            categoriaDB
        });
    });
});

//============================================
// Borrar categoría por ID
//============================================
app.delete('/categoria/:id', [verificaToken, verificaPermisos], (req, res) => {
    // Solo un administrador puede borrar categorías
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID de categoría solicitado no existe'
                }
            });
        }
        res.json({
            ok: true,
            categoriaBorrada
        });
    });
});
module.exports = app;