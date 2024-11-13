import {Propiedad,Precio,Categoria} from '../models/index.js'
import {Sequelize} from 'sequelize'

const inicio=async(req,res)=>{

    const [categorias,precios,casas,departamentos,cabañas]=await Promise.all([
        Categoria.findAll({raw:true}),
        Precio.findAll({raw:true}),
        Propiedad.findAll({
            limit:3,
            where:{
                categoriaId:1
            },
            include:[{
                model:Precio,
                as:'precio'
            }
        ],
        order:[['createdAt','DESC']]
        }),
        Propiedad.findAll({
            limit:3,
            where:{
                categoriaId:2
            },
            include:[{
                model:Precio,
                as:'precio'
            }
        ],
        order:[['createdAt','DESC']]
        }),
        Propiedad.findAll({
            limit:3,
            where:{
                categoriaId:5
            },
            include:[{
                model:Precio,
                as:'precio'
            }
        ],
        order:[['createdAt','DESC']]
        })


    ])

   
    res.render('inicio',{
        pagina:'Inicio',
        categorias,
        precios,
        casas,
        departamentos,
        cabañas,
        csrfToken:req.csrfToken()
    })
}

const categoria=async(req,res)=>{
    const {id}=req.params;
    //Comprobar que la categoría existe
    const categoria=await Categoria.findByPk(id);
    

    if(!categoria){
        return res.redirect('/404');
    }

    //Obtener las propiedades de la categoría
    const propiedades=await Propiedad.findAll({
        where:{
            categoriaId:id
        },
        include:[{model:Precio, as:'precio'},{model:Categoria,as:'categoria'}]
    })
    res.render('categoria',{
        pagina:`${categoria.nombre}s en venta`,
        propiedades,
        csrfToken:req.csrfToken()
    })
}

const noEncontrado=(req,res)=>{
    res.render('404',{
        pagina:'No encontrada',
        csrfToken:req.csrfToken()
    })

}

const buscador=async(req,res)=>{

    const {termino}=req.body;

    //Validar que término no esté vacio
    if(!termino?.trim()){
        return res.redirect('back')
    }
    //Consultar las propiedades

    const propiedades=await Propiedad.findAll({
        where:{
            titulo:{
                [Sequelize.Op.like] : '%'+termino+ '%'
            },

        },
        include:[
            {model:Precio, as:'precio'}
        ]
    })
    res.render('busqueda',{
        pagina:'Resultados de la búsqueda',
        propiedades,
        csrfToken:req.csrfToken()
        
    })
}


export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}