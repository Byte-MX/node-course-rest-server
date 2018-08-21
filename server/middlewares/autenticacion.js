const jwt = require('jsonwebtoken');

// ==========================
// Verificar Token
//===========================

let verificaToken = (req, res, next) => {
    let token = req.get('token');
    /*
     * Verifico que el token sea válido.
     */
    jwt.verify(token, process.env.SEMILLA_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                //err
                err: {
                    message: 'Token no válido'
                }
            });
        }
        req.usuario = decoded.usuario; // decoded es el payload
        next(); //Nada (dentro de esta función) se ejecuta después de este next();
    });
    /*
        res.json({
            token: token
        });

    
    console.log("Sí pasé por el middleware: " + token);
    
    // Si no llamo el next, todo lo demás NO se ejecuta.
    next();
    */
};

// ==========================
// Verificar Permisos
//===========================
let verificaPermisos = (req, res, next) => {
    let usuario = req.usuario;
    let tipo = usuario.role;
    //verifica que usuario === Admin
    //console.log(tipo);
    if (tipo !== 'ADMIN_ROLE') {
        return res.status(403).json({
            ok: false,
            //err
            err: {
                message: 'El usuario no es un administrador'
            }
        });
    }
    next();

};

// ==========================
// Verificar Token para Imagen
//===========================
let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEMILLA_TOKEN, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });


}

module.exports = {
    verificaToken,
    verificaPermisos,
    verificaTokenImg
};