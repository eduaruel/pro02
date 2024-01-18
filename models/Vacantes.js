const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const nanoid = mongoose.plugin(require('mongoose-nanoid'), {
	length: (size = 10),
	alphabets: 'abcdefghijklmnopqrstuvwxyz1234567890',
});

const vacantesSchema =  new mongoose.Schema({
    titulo: {
        type: String, 
        required: 'El nombre de la vacante es obligatorio',
        trim : true
    }, 
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoria'
    },
    salario: {
        type: String,
        default: 0,
        trim: true,
    },
    contrato: {
        type: String,
        trim: true,
    },
    descripcion: {
        type: String,
        trim: true,
    },
    url : {
        type: String,
        lowercase:true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv : String
    }], 
    autor:{
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es Obligatorio'
    }
  
});
vacantesSchema.pre('save', function(next) {

    // crear la url
    const url = slug(this.titulo);
    this.url =`${url}-${nanoid.ObjectId.index}`;

    next();
})

//crear indice
vacantesSchema.index({titulo: 'text'});

module.exports = mongoose.model('Vacante', vacantesSchema);



// const nanoid = mongoose.plugin(require('mongoose-nanoid'), {
// 	length: (size = 10),
// 	alphabets: 'abcdefghijklmnopqrstuvwxyz1234567890',
// });

// this.url = `${url}-${nanoid.ObjectId.index} `;