import {validationResult} from 'express-validator'
import {Precio,Categoria,Propiedad} from '../models/index.js'
import { unlink } from 'node:fs/promises'
import { promises } from 'node:dns';


const admin=async(req,res)=>{


    //Leer Query String
    const {pagina:paginaActual}=req.query;

    //Creando la expresión regular que lee únicamente números
    const expresion=/^[1-9]$/;

    if(!expresion.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1');
    }

    try {
            
        const {id}=req.usuario;

        //Límites y Offset para el paginador
        const limit=7;
        const offset=((paginaActual*limit)-limit);



    const [propiedades,total]=await Promise.all([
        
         Propiedad.findAll({
            limit,
            offset,
            where:{
                usuarioId:id
            },
            include:[
                {model:Categoria, as:'categoria'},
                {model:Precio, as:'precio'}
            ]
        }),
        Propiedad.count({
            where:{
                usuarioId:id
            }
        })


    ])

    
   
    res.render('propiedades/admin',{
        pagina:'Mis propiedades',
        propiedades,
        csrfToken:req.csrfToken(),
        paginas:Math.ceil(total/limit),
        paginaActual:Number(paginaActual),
        total,
        offset,
        limit
    });




    } catch (error) {
        console.log(error);
    }


}

//Formulario para crear una nueva propiedad
const crear=async(req,res)=>{

    //Consultar modelo de precio y categorías
    const [categorias,precios]=await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);


        res.render('propiedades/crear',{
        pagina:'Crear propiedad',
        csrfToken:req.csrfToken(),
        categorias,
        precios
    });
}


const guardar=async(req,res)=>{
    //Validación o resultado

    const [categorias,precios]=await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);

    let resultado=validationResult(req);
    if(!resultado.isEmpty()){
        return res.render('propiedades/crear',{
            pagina:'Crear propiedad',
            csrfToken:req.csrfToken(),
            categorias,
            precios,
            errores:resultado.array(),
            datos:req.body
        });
    }
    //Crear un registro
    const {titulo,descripcion,habitaciones,estacionamiento,wc,calle,lat,lng,precio:precioId,categoria:categoriaId}=req.body;


    const {id:usuarioId}=req.usuario;

    try {
        const propiedadGuardada=await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen:''
        })

        const {id}=propiedadGuardada;
        res.redirect(`/propiedades/agregar-imagen/${id}`);
        
    } catch (error) {
        console.log(error);   
    }
}

const agregarImagen=async(req,res)=>{

    const {id}=req.params;
    
    //Validar que el id de la propiedad exista
    const propiedad=await Propiedad.findByPk(id);
    

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad no esté publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertenece xa quien visita la página
    if(req.usuario.id.toString()!==propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }


    res.render('propiedades/agregar-imagen',{
        pagina:`Agregar Foto(s): "${propiedad.titulo}"`,
        propiedad,
        csrfToken:req.csrfToken()
    })
    
}

const almacenarImagen=async(req,res,next)=>{

const {id}=req.params;
    
    //Validar que el id de la propiedad exista
    const propiedad=await Propiedad.findByPk(id);
    

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad no esté publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades')
    }

    //Validar que la propiedad pertenece xa quien visita la página
    if(req.usuario.id.toString()!==propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }

    try {   
        //Almacenar la imágen y publicar la propiedad
        propiedad.imagen=req.file.filename;
        propiedad.publicado=1;

        await propiedad.save();
        
        next();

        
    } catch (error) {
        console.log(error);
    }
}


const editar=async(req,res)=>{

    const {id}=req.params;

    //Validar que la propiedad existe

    const propiedad=await Propiedad.findByPk(id);

    if(!propiedad){

        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la url es quien está editando

    if(propiedad.usuarioId.toString()!==req.usuario.id.toString()){

        return res.redirect('mis-propiedades')
    }

 //Consultar modelo de precio y categorías
    const [categorias,precios]=await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);


        res.render('propiedades/editar',{
        pagina:`Editar propiedad: ${propiedad.titulo}`,
        csrfToken:req.csrfToken(),
        categorias,
        precios,
        propiedad,
        datos:propiedad
    });

}

const guardarCambios=async(req,res)=>{

    //Verificar la validación
    let resultado=validationResult(req);
    
    const [categorias,precios]=await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);

    if(!resultado.isEmpty()){
        return res.render('propiedades/editar',{
            pagina:`Editar propiedad`,
            csrfToken:req.csrfToken(),
            categorias,
            precios,
            errores:resultado.array(),
            datos:req.body
        });
    }

    const {id}=req.params;

    //Validar que la propiedad existe

    const propiedad=await Propiedad.findByPk(id);

    if(!propiedad){

        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la url es quien está editando

    if(propiedad.usuarioId.toString()!==req.usuario.id.toString()){

        return res.redirect('mis-propiedades')
    }

  //Reescribir el objeto y actualizarlo

  try {

    const {titulo,descripcion,habitaciones,estacionamiento,wc,calle,lat,lng,precio:precioId,categoria:categoriaId}=req.body;

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        });

        await propiedad.save();
        res.redirect('/mis-propiedades')

  } catch (error) {
    console.log(error);
  }

}

const eliminar=async(req,res)=>{
    
    const {id}=req.params;

    //Validar que la propiedad existe

    const propiedad=await Propiedad.findByPk(id);

    if(!propiedad){

        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la url es quien está editando

    if(propiedad.usuarioId.toString()!==req.usuario.id.toString()){

        return res.redirect('mis-propiedades')
    }

    //eliminar la imágen asociada
    await unlink(`public/uploads/${propiedad.imagen}`)

    //Eliminar la propiedad
    await propiedad.destroy();
    return res.redirect('/mis-propiedades');


}

//Muestra una propiedad

const mostrarPropiedad=async(req,res)=>{

    const {id}=req.params;

    const propiedad=await Propiedad.findByPk(id,{
        include:[
            {model:Precio, as:'precio'},
            {model:Categoria, as:'categoria'}
        ]
    });
    
    if(!propiedad){
        return res.redirect('/404')
    }

    res.render('propiedades/mostrar',{
        propiedad,
        pagina:propiedad.titulo,
        csrfToken:req.csrfToken()
    })

}

export{
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad,
}