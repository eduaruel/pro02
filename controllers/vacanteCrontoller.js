const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const { nanoid } = require('nanoid');
const path = require('path');
const Usuarios = mongoose.model('Usuarios');


exports.formularioNuevaVacante = (req, res) => {
	res.render('nueva-vacante', {
		nombrePagina: 'Registrar Vacantes',
		tagline: 'completa el formulario y publica tu vacante',
		mostrarImagen4:true,
		boton: false,
		parrafo:false,
		nombrePaginaMostrar:true,
		cerrarSesion:true, 
        nombre: req.user.nombre,
        imagen: req.user.imagen,
	
		
	});
};

//agregar vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
	const vacante = new Vacante(req.body);
	//console.log(req.body);

	// usuario autor de la vacante
	vacante.autor = req.user._id;

	// crear arreglo de skills
	vacante.skills = req.body.skills.split(',');
	//console.log(vacante);

	// nueva Vacante en la parte de almacenamiento de la base de dato
	const nuevaVacante = await vacante.save();
	//console.log(nuevaVacante);

	// redireccinamiento
	res.redirect(`/vacantes/${nuevaVacante.url}`);
};

//mostrar nueva Vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');
   // const usuario = await Vacante.find({autor: req.user._id});
  
    // console.log(vacante);

    // si no hay resultados
    if(!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        boton:false,
		parrafo:false,
		nombrePaginaMostrar:true,
        botonEditar: false
    })
}

//editar Vacante

exports.formEditarVacante = async (req, res, next) => {
	const vacante = await Vacante.findOne({url: req.params.url})

	if(!vacante) return next();

	res.render('editar-vacante',{
		vacante,
		nombrePagina: `Editar-${vacante.titulo}`,
		barra: false,
		boton:false,
		nombrePaginaMostrar:true,
		cerrarSesion:true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
		mostrarImagen3:true
		
	})
}

exports.editarVacante = async (req, res) => {
	const vacanteActualizada = req.body;

	vacanteActualizada.skills = req.body.skills.split(',');

	const vacante = await Vacante.findOneAndUpdate({url:req.params.url}, vacanteActualizada,{
		new:true,
		runValidators:true,
	});

	res.redirect(`/vacantes/${vacante.url}`);

}

//validar y sanitizar los campos de lñas nuevas vacantes

exports.validarVancante = (req, res, next) => {
    // sanitizar los campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    // validar
    req.checkBody('titulo', 'Agrega un Titulo').notEmpty();
    req.checkBody('empresa', 'Agrega una Empresa').notEmpty();
    req.checkBody('ubicacion', 'Agrega una Ubicación').notEmpty();
    req.checkBody('contrato', 'Selecciona un Tipo de Contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos un conocimiento').notEmpty();

    const errores = req.validationErrors();

    if(errores) {
        // Recargar la vista con los errores
        req.flash('error', errores.map(error => error.msg));

        res.render('nueva-vacante', {
            nombrePagina: 'Registrar Vacantes',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre : req.user.nombre,
            mensajes: req.flash(),
			nombrePaginaMostrar:true,
			mostrarImagen4:true
        })
    }else{

		next();

	}

}
exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    try {
        const vacante = await Vacante.findById(id);

        if (!vacante) {
            return res.status(404).send('Vacante no encontrada');
        }

        if (verificarAutor(vacante, req.user)) {
            // Si este es el usuario, se puede eliminar
            await vacante.deleteOne();
            return res.status(200).send('Vacante eliminada correctamente');
        } else {
            // No permitido
            return res.status(403).send('No tienes permiso para eliminar esta vacante');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno del servidor');
    }
};

const verificarAutor = (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) {
        return false;
    }
    return true;
};

// subir archivo en PDF
exports.subirCV = (req,res,next) =>{
        upload(req, res, function (error) {
       if (error){
        // console.log(error);
             if (error instanceof multer.MulterError) {
                // Manejar errores de Multer
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error','El tamaño del archivo es muy grande maximo 100 kb')
                }else{
                    req.flash('error',error.message)
                }
            } else {
                // Manejar otros errores
               req.flash('error', error.message)
            }
            res.redirect('back');
            return;
       }else {
          // Si la carga fue exitosa, continuar con el siguiente middleware
        return next();
       }

        

      
    });
}

const configuracionMulter = {
    limits:{fileSize: 100000},
    
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            const nombreArchivo = `${nanoid()}.${extension}`;
            //console.log(nombreArchivo);
            cb(null, nombreArchivo);
          
        },
    }),
    fileFilter(req,file,cb){
        if(file.mimetype === 'application/pdf'){
            cb(null,true);
        }else{
            cb(new Error('Formato no Válido'),false);
        }
    }
};
const upload = multer(configuracionMulter).single('cv'); //se coloca el name del formulario

//se almacena los candidatos
exports.contactar = async (req, res, next) => {

    const vacante = await Vacante.findOne({ url : req.params.url});

    // sino existe la vacante
    if(!vacante) return next();

    //  si va bien, construir el nuevo objeto
   try {
     const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv : req.file.filename,
        
    }
  
    // almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // mensaje flash y redireccion
    req.flash('correcto', 'La Informacion fue Enviada Correctamente');
    res.redirect('/');
   } catch (error) {
    req.flash('error', 'Faltó subir tu CV');
    res.redirect('/');
   }
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);

    if(vacante.autor != req.user._id.toString()){
        return next();
    } 

    if(!vacante) return next();

    res.render('candidatos', {
        nombrePagina : `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion : true,
        nombre : req.user.nombre,
        imagen : req.user.imagen,
        candidatos : vacante.candidatos,
        nombrePaginaMostrar:true
    })
}
//buscar vacantes
exports.buscarVacantes = async(req,res)=>{
    const vacantes = await Vacante.find({
        $text:{
            $search: req.body.q
        }
    });
    // console.log(vacantes);
    res.render('home',{
        nombrePagina: `Resultados: ${req.body.q}`,
        nombrePaginaMostrar:true,
        mostrarImagen: true,
        barra:true,
        vacantes
    })
}