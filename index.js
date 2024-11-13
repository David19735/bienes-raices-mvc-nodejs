import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import db from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';

//Crear la App
const app=express();

//Habiliar lectura de datos de fomulario

app.use(express.urlencoded({extended:true}))

//Habilitar cookie-parser
app.use(cookieParser());

//Habiliar el CSRF

app.use(csrf({cookie:true}));

//Conexión a la base de datos

try{
    await db.authenticate();
    db.sync();
    console.log("conexión correcta a la base de datos");

}
catch(error){
    console.log(error);
}

//Habilitar Pug
app.set('view engine','pug');
app.set('views','./views')

//Carpeta pública
app.use(express.static('public'))

//Routing
app.use('/',appRoutes);
app.use('/auth',usuarioRoutes);
app.use('/',propiedadRoutes);
app.use('/api',apiRoutes)





//Definir un puerto y arrancar el proyecto
const port=process.env.PORT || 3000;

app.listen(port,()=>{
    console.log("El servidor está funcionando en el puerto "+port);
});