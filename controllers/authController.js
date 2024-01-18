const passport = require('passport');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion', 
    failureFlash: true,
    badRequestMessage : 'Ambos campos son obligatorios',
});
exports.autenticarUsuarioAdmin = passport.authenticate('local', {
    successRedirect : '/admin',
    failureRedirect : '/iniciar-administrador', 
    failureFlash: true,
    badRequestMessage : 'Ambos campos son obligatorios',
});

//revision cuando el usuario se autentica
exports.verificarUsuario = (req, res, next) => {
    //revisar usuario
    if(req.isAuthenticated()) {
        return next(); // estan autenticados
}

    //redireccionar
    res.redirect('/iniciar-sesion')
}

exports.verificarUsuarioAdmin = async (req, res, next) => {
    try {
        const admin = await Usuarios.findById(req.user._id);

        // Revisar usuario
        if (req.isAuthenticated() && admin && admin._id.toString() === '65a4af0ecc5f625ba7b745f9') {
            return next(); // Están autenticados
        }

        // Redireccionar
        req.flash('error', 'No eres el Administador')
         res.redirect('/iniciar-administrador');
    } catch (error) {
        console.error(error);
        
        res.redirect('/iniciar-administrador');
    }
};


exports.panel = async (req, res) => {
    //se realiza una consulta al usuario
    const vacantes = await Vacante.find({autor: req.user._id});

    // console.log(vacantes);
    
    res.render('administracion',{
        nombrePagina: 'Panel Administrativo',
        tagLine: 'Crea y Administra tus Vacantes',
        nombrePaginaMostrar:true,
        nuevaTagLine:true,
        cerrarSesion:true,
        nombre: req.user.nombre,
        mostrarImagen2:true,
        imagen: req.user.imagen,
        vacantes
        
    });
};
exports.panelAdmin = async (req, res) => {
    //se realiza una consulta al usuario
    const vacantes = await Vacante.find({autor: req.user._id});

    // console.log(vacantes);
    
    res.render('admin',{
        nombrePagina: 'administrador',
        tagLine: 'Administra',
        nombrePaginaMostrar:true,
        nuevaTagLine:true,
        cerrarSesion:true,
        nombre: req.user.nombre,
        mostrarImagen2:true,
        imagen: req.user.imagen,
        vacantes
        
    });
};

exports.cerrarSesion = (req, res, next) => {
    req.logout(function(err){
        if(err) {
            return next(err);
        }
        req.flash('correcto','Sesion Cerrada')
        return res.redirect('/iniciar-sesion')
    });
 
    
}

exports.restablecerContrasena = (req, res) => {
    res.render('reestablecer-password',{
        nombrePagina: 'Restablecer el Password',
        tagLine: 'Restablece tu Contraseña para inciar sesión',
        nombrePaginaMostrar: true,
        nuevaTagLine:true,
    });
}

//generar toke a la base de dato de mongoDB
exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });

    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }

    // el usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    // console.log(resetUrl);

    await enviarEmail.enviar({
        usuario,
        subject : 'Password reset',
        resetUrl,
        archivo: 'reset'
    });

    req.flash('correcto', 'Revisa tu email para más información');
    res.redirect('/iniciar-sesion');

}
//validad si el token valido
exports.restablecerContrasenaDB = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now() 
        }
    });

    if(!usuario){
        req.flash('error','La recuperacion ya no es valido intente nuevamente')
        return res.redirect('reestablecer-password')
    }
    res.render('nuevo-password',{
        nombrePagina: 'Nueva Contraseña',
        nombrePaginaMostrar:true

    })
};

//Guardando nueva contraseña en la BD
exports.guardaPassword = async (req,res) => {
     const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now() 
        }
    });

    //cuando el token es invalido
     if(!usuario){
        req.flash('error','La recuperacion ya no es valido intente nuevamente')
        return res.redirect('reestablecer-password')
    }

    // limpiar los valores
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    // agregar y eliminar valores del objeto
    await usuario.save();

    req.flash('correcto','Contraseña modificada Correctamente');
    res.redirect('/iniciar-sesion');

}