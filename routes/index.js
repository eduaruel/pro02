const Express = require('express');
const router = Express.Router();
const homeController = require('../controllers/homeController.js');
const vacantesController = require('../controllers/vacanteCrontoller.js');
const usuariosController = require('../controllers/usuariosController.js');
const authController = require('../controllers/authController.js');
module.exports = () => {
	  router.get('/', homeController.mostrarTrabajos);

    // Crear Vacantes
    router.get('/vacantes/nueva',
    authController.verificarUsuario,
    vacantesController.formularioNuevaVacante );

    router.post('/vacantes/nueva',
    authController.verificarUsuario,
    vacantesController.validarVancante,
    vacantesController.agregarVacante );

    // Mostrar Vacante (singular)
    router.get('/vacantes/:url',vacantesController.mostrarVacante );

    // Editar Vacante
    router.get('/vacantes/editar/:url',
    authController.verificarUsuario,
    vacantesController.formEditarVacante);

    router.post('/vacantes/editar/:url',
    authController.verificarUsuario,
    usuariosController.validarEdicionVacante,
    vacantesController.editarVacante);

    //Eliminar las Vacantes
    router.delete('/vacantes/eliminar/:id',
    vacantesController.eliminarVacante,
    );

    //Crear cuentas 
    router.get('/crear-cuenta',usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
    usuariosController.validarRegistro,
    usuariosController.crearUsuarios
    );

    //Autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    
    //Autenticar Administrador
    router.get('/iniciar-administrador', usuariosController.formIniciarSesionAdmin);
    router.post('/iniciar-administrador', authController.autenticarUsuarioAdmin);

    //cerrar sesion
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    //recuper password con email
    router.get('/reestablecer-password', authController.restablecerContrasena);
    router.post('/reestablecer-password', authController.enviarToken);

    //recuper password (almacenada en mongo)
     router.get('/reestablecer-password/:token', authController.restablecerContrasenaDB);
     router.post('/reestablecer-password/:token', authController.guardaPassword);


    //panel
    router.get('/administracion',
    authController.verificarUsuario,
    authController.panel);

    //panel Admin
    router.get('/admin',
    authController.verificarUsuarioAdmin,
    authController.panelAdmin);

    //editar perfil
    router.get('/editar-perfil', 
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    )
    // mensajes de candidatos
    router.post('/vacantes/:url',
        vacantesController.subirCV,
        vacantesController.contactar
    )

    //candidatos-vacantes
    router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacantesController.mostrarCandidatos
    )

    //buscador de vacantes
    router.post('/buscador',vacantesController.buscarVacantes)

    //sessión premium
    router.get('/premium',usuariosController.premium)

    
	return router;
    
};
