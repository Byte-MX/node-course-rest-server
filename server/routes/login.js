const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos' // Usuario
                }
            });
        }
        // Obtiene la contraseña recibida, la encripta y verifica que haga match con la de la base.
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos' // Contraseña
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEMILLA_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token //ES6: puedo quitar el ': token', pues son iguales.
        });
    });
});


// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);
    console.log(userid);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}


app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token) // Esto devuelve una promesa
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            // Error al obtener el usuario de la base de datos.
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            // Encontró un usuario.
            if (usuarioDB.google === false) {
                // El usuario está tratando de autenticarse por Google,
                // pero ya existe en nuestro sistema.
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de autenticarse por medio del sistema'
                    }
                });
            } else {
                // El usuario se registró autenticándose con Google, 
                // por lo que le renovamos su token (de nuestra aplicación).
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEMILLA_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            // El usuario no existe en nuestra base de datos...
            // Crearlo:
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':O'; // Dice Fernando que no hay problema porque si el
            // usuario intenta entrar con password ':O', el bcrypt
            // lo transformará en un hash y no coincidirá; la única
            // manera sería que el bcrypt transformara algo y saliera 
            // como resultado este string (¿imposible?)

            // Guarda el usuario nuevo
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEMILLA_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
    /*    
    res.json({
        //token
        usuario: googleUser
    });
    */
});

module.exports = app;