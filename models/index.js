import Propiedad from './Propiedad.js';
import Categoria from './Categoria.js';
import Precio from './Precio.js';
import Usuario from './Usuario.js';

Propiedad.belongsTo(Precio,{foreignKey:'precioId'})
Propiedad.belongsTo(Categoria,{foreignKey:'categoriaId'})
Propiedad.belongsTo(Usuario,{foreignKey:'usuarioId'})



export{Propiedad,Categoria,Precio,Usuario}
