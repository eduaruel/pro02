const mongoose = require('mongoose');
require('./config/db');

// const punycode = require('punycode');
const Express = require('express');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const path = require('path');
const router = require('./routes');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');
const expressSanitizer = require('express-sanitizer');


require('dotenv').config({path: 'variables.env'});
const app = Express();


//habilitar bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//validar campos
app.use(expressValidator());
app.use(expressSanitizer());

//hablitar handlebar como view
app.engine('handlebars',
	exphbs.engine({
		handlebars: allowInsecurePrototypeAccess(handlebars),
		defaultLayout: 'layout',
		helpers: require('./helpers/handlebars'),
		 extname: 'handlebars',
		partialsDir:['views/componentes']
	}),
);
app.set('view engine', 'handlebars');

app.use(Express.static(path.join(__dirname, '/public')));


app.use(cookieParser());
app.use(
	session({
		secret: process.env.SECRETO,
		key: process.env.KEY,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({mongoUrl: process.env.DATABASE}),
	}),
);
//inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//ALERTAS

app.use(flash());

//crear middleware

app.use((req, res, next)=>{
	res.locals.mensajes = req.flash();
	next();
})

app.use('/', router());

// 404 pagina no existente
app.use((req, res, next) => {
    next(createError(404, 'Información No Encontrado'));
})

// Administración de los errores
app.use((error, req, res, next) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error',{
		nombrePagina: 'Error, Intente nuevamente',
		nombrePaginaMostrar: true
	});
});

app.listen(process.env.PUERTO, console.log('Servidor Arriba'));

