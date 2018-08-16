const express = require('express');
let app = express();
const _ = require('underscore');

let { verificaToken } = require('../middlewares/autenticacion');
let Producto = require('../models/producto');

//============================================
// Obtener productos
//============================================
app.get('/productos', verificaToken, (req, res) => {
    // Trae todos los productos
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre') // Ordena por nombre
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre email') // Llena solo los datos solicitados de esa tabla
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Producto.countDocuments({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });
            });
        });
});

//============================================
// Obtener un producto por ID
//============================================
app.get('/productos/:id', verificaToken, (req, res) => {
    // Trae un solo producto
    let id = req.params.id;
    Producto.findById(id)
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID de producto solicitado no existe'
                    }
                });
            }
            res.json({
                ok: true,
                productoDB
            });
        });
});

//============================================
// Buscar productos
//============================================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i'); // i = insensible a mayúsculas y minúsculas

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se encontraron productos.'
                    }
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});

//============================================
// Crear un producto
//============================================
app.post('/productos', verificaToken, (req, res) => {
    // Grabar el usuario
    // Grabar una categoria del listado
    let usuarioId = req.usuario._id;
    let body = req.body;

    let productoAInsertar = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: usuarioId
    });

    productoAInsertar.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //res.json({    // Válido. El curso ahora agrega:
        res.status(201).json({
            ok: true,
            productoDB
        });
    });
});

//============================================
// Actualizar un producto
//============================================
app.put('/productos/:id', verificaToken, (req, res) => {
    // Grabar el usuario
    // Grabar una categoria del listado
    let id = req.params.id;
    let usuarioId = req.usuario._id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);
    body.usuarioId = usuarioId;

    Producto.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID de producto solicitado no existe'
                }
            });
        }
        res.json({
            ok: true,
            productoDB
        });
    });
});

//============================================
// Borrar un producto (lógico) - Cambiar disponible
//============================================
app.delete('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID de producto solicitado no existe'
                }
            });
        }
        res.json({
            ok: true,
            productoBorrado
        });
    });
});
module.exports = app;