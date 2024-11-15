import {check,validationResult } from "express-validator";
import bcrypt from 'bcrypt';
import Usuario from "../models/Usuario.js"
import { generarId,generarJwt } from "../helpers/tokens.js";
import {emailRegistro,emailOlvidePassword} from '../helpers/emails.js';


const formularioLogin=(req,res)=>{

    res.render('auth/login',{
        pagina:'Iniciar Sesión',
        csrfToken:req.csrfToken()
    })

}



const autenticar=async(req,res)=>{
    
    //Validación
    await check('email').isEmail().withMessage('El correo es obligatorio').run(req);
    await check('password').notEmpty().withMessage('La contraseña es obligatoria').run(req);

    let resultado=validationResult(req);

    if(!resultado.isEmpty()){
        return  res.render('auth/login',{
            pagina:'Iniciar Sesión',
            csrfToken:req.csrfToken(),
            errores:resultado.array()
        })
    }
    //Comprobar si el usuario existe

    const {email,password}=req.body;

    const usuario=await Usuario.findOne({where:{email}});
    if(!usuario){
        return res.render('auth/login',{
            pagina:'Iniciar Sesión',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El usuario que estás ingresando no se encuentra registrado'}]
        })
    }

    //Comprobar si el usuario está confirmado
    if(!usuario.confirmado){
        return res.render('auth/login',{
            pagina:'Iniciar Sesión',
            csrfToken:req.csrfToken(),
            errores:[{msg:'Tu cuenta no ha sido confirmada'}]
        })
    }
   
    //Revisar el passsword
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            pagina:'Iniciar Sesión',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El password es incorrecto'}]
        })
    }
    //Autenticar al usuario
    
    const token=generarJwt({id:usuario.id,nombre:usuario.nombre});
     
    //Almacenar token en un cookie

    return res.cookie('_token',token,{
        httpOnly:true,
        secure:true,
        sameSite:true
    }).redirect('/mis-propiedades');

    
}

const cerrarSesion=(req,res)=>{
    
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

//Función que renderiza el formulario
const formularioRegistro=(req,res)=>{

    res.render('auth/registro',{
        pagina:'Crear Cuenta',
        csrfToken:req.csrfToken()
    })
}

//Función que genera datos en el formulario usando la petición POST
const registrar=async(req,res)=>{
    //Validación
    await check('nombre').notEmpty().withMessage('El campo Nombre no puede estar vacío').run(req)
    await check('email').isEmail().withMessage('El Email es incorrecto').run(req)
    await check('password').isLength({min:6}).withMessage('La contraseña debe contener al menos 6 carácteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Las contraseñas no coinciden').run(req)


    let resultado=validationResult(req);

    //Verificar que el usuario esté vacío
    if(!resultado.isEmpty()){

        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            errores:resultado.array(),
            csrfToken:req.csrfToken(),
            usuario:{
                nombre:req.body.nombre,
                email:req.body.email
            }
        })

    }
    //Extraer los datos
    const {nombre,email,password}=await req.body;

    //Verificar que el usuario no esté duplicado
    const existeUsuario=await Usuario.findOne({where:{
        email
    }});

    if(existeUsuario){
        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El usuario ya está registrado'}],
            usuario:{
                nombre:req.body.nombre,
                email:req.body.email
            }
        })
    }

       
        const usuario=await Usuario.create({
            nombre,
            email,
            password,
            token:generarId()
        });

        //Envía email de confirmación
        emailRegistro({
            nombre:usuario.nombre,
            email:usuario.email,
            token:usuario.token
        });



        res.render('templates/mensaje',{
            pagina:'Cuenta creada correctamente',
            mensaje:'Hemos enviado un email de confirmación presiona en el enlace'
        })

}

//Función que comprueba una cuenta

const confirmar=async(req,res)=>{

    const {token}=req.params;

    const usuario=await Usuario.findOne({
        where:{
            token
        } 
    })

    if(!usuario){

        return res.render('auth/confirmar-cuenta',{
            pagina:'Error al confirmar tu cuenta',
            mensaje:'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error:true
        })
    }

    //Confirmar la cuenta
    usuario.token=null;
    usuario.confirmado=true;
    usuario.save();
    
        res.render('auth/confirmar-cuenta',{
        pagina:'Cuenta confirmada',
        mensaje:'La cuenta se confirmó correctamente'    
    })

}

const formularioOlvidePassword=(req,res)=>{

    res.render('auth/olvide-password',{
        pagina:'Recuperar Contraseña',
        csrfToken:req.csrfToken()
        
    })
}

const resetPassword=async(req,res)=>{

    await check('email').isEmail().withMessage('Email incorrecto').run(req);
    let resultado=validationResult(req);

    if(!resultado.isEmpty()){
        return res.render('auth/olvide-password',{
            pagina:'Recuperar Contraseña',
            csrfToken:req.csrfToken(),
            errores:resultado.array()

        })
    }   

    //Buscar al usuario

    const email=req.body.email;
    const usuario=await Usuario.findOne({
        where:{
            email
        }
    })

    if(!usuario){
        return res.render('auth/olvide-password',{
            pagina:'Recuperar Contraseña',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El email proporcionado no se encuentra registrado'}]

        })
    }
    //Generar un token y enviar el email

    usuario.token=generarId();
    await usuario.save();

    //Enviar un email 

    emailOlvidePassword({
        nombre:usuario.nombre,
        email:usuario.email,
        token:usuario.token
    })
    //Renderizar un mensaje
    res.render('templates/mensaje',{
        pagina:'Restablece tu contraseña',
        mensaje:'Hemos enviado un email con las instrucciones'
    })

}   

    const comprobarToken=async(req,res)=>{

        const {token}=req.params;
        const usuario=await Usuario.findOne({where:{token}});

        if(!usuario){
           
            return res.render('auth/confirmar-cuenta',{
                pagina:'Restablece tu password',
                mensaje:'Hubo un error al validar tu información, intenta de nuevo',
                error:true
            })
        }
        //Mostrar Formulario para modificar el password
        res.render('auth/resetPassword',{
            pagina:'Restablece tu contraseña',
            csrfToken:req.csrfToken()
        })

    }

    const nuevoPassword=async(req,res)=>{

        //Validar el password
        await check('password').isLength({min:6}).withMessage('La contraseña debe contener al menos 6 carácteres').run(req);
        let resultado=validationResult(req);
        
        if(!resultado.isEmpty()){
            
            return res.render('auth/resetPassword',{
                pagina:'Restablece tu contraseña',
                errores:resultado.array(),
                csrfToken:req.csrfToken()
            })
        }
        
        const {token}=req.params;
        const {password}=req.body;
        //Identificar quién hace el cambio
        const usuario=await Usuario.findOne({where:{token}});

        //Hashear el password
            const salt=await bcrypt.genSalt(10);
            usuario.password=await bcrypt.hash(password,salt);
            usuario.token=null;
            await usuario.save();

            //Renderizar una vista
            res.render('auth/confirmar-cuenta',{
                pagina:'Contraseña restablecida',
                mensaje:'La contraseña se ha guardado y restablecido correctamente'
            })
    }

export {formularioLogin,
        formularioRegistro,
        formularioOlvidePassword,
        registrar,
        confirmar,
        resetPassword,
        comprobarToken,
        nuevoPassword,
        autenticar,
        cerrarSesion
        };