import express from 'express';
import { admin,crear,guardar,agregarImagen,almacenarImagen } from "../controllers/propiedadController.js";
import protegerRuta from '../middleware/protegerRuta.js';
import {body} from 'express-validator';
import upload from '../middleware/subirImagen.js';

const router=express.Router();


router.get('/mis-propiedades',protegerRuta,admin);
router.get('/propiedades/crear',protegerRuta,crear);
router.post('/propiedades/crear',protegerRuta,

        body('titulo').notEmpty().withMessage('El título del anuncio es obligatorio'),
        body('descripcion').notEmpty().withMessage('La descripción no puede estar vacía').isLength({max:250}),
        body('categoria').isNumeric().withMessage('Selecciona una categoría'),
        body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
        body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
        body('estacionamiento').isNumeric().withMessage('Selecciona un número de estacionamientos'),
        body('wc').isNumeric().withMessage('Selecciona el número de baños'),
        body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),

    guardar);

router.get('/propiedades/agregar-imagen/:id',protegerRuta,agregarImagen)
router.post('/propiedades/agregar-imagen/:id',
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen

)

export default router;