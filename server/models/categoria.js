const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la categoría es necesario.'],
        unique: true
    },
    descripcion: {
        type: String,
        required: false
    },
    idUsuario: {
        type: Schema.Types.ObjectId,
        required: [true, 'La categoría debe incluir el id del usuario que la creó'],
        ref: 'Usuario'
    }
});

categoriaSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe de ser único' });
module.exports = mongoose.model('Categoria', categoriaSchema);