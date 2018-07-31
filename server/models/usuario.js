const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        index: true,
        required: [true, 'El correo es necesario'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        hide: true
    },
    img: { // No es obligatoria
        type: String,
        required: false
    },
    role: { // default: 'USER_ROLE'
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: { // boolean
        type: Boolean,
        default: true
    },
    google: { // boolean
        type: Boolean,
        default: false
    }

});

/*
 * "Sobrecarga" del método toJSON para que no despliegue la contraseña.
 */
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
};

usuarioSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe de ser único' });
module.exports = mongoose.model('Usuario', usuarioSchema);