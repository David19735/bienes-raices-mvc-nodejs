(function(){
    
    const lat = 19.4600628;
    const lng = -99.2361836;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 12);


    let markers=new L.FeatureGroup().addTo(mapa);
    let propiedades=[];
    
    //Filtros
    const filtros={
        categoria:'',
        precio:''
        
    }
    const categoriasSelect=document.querySelector('#categorias');
    const preciosSelect=document.querySelector('#precios');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //Filtrado de categorías y precios

    categoriasSelect.addEventListener('change',(e)=>{
        filtros.categoria=+e.target.value;
         filtrarPropiedades();   
    })

    preciosSelect.addEventListener('change',(e)=>{
        filtros.precio=+e.target.value;
        filtrarPropiedades();
    })


    
    const obtenerPropiedades=async()=>{
        
        try {
            const url='/api/propiedades';
            const respuesta=await fetch(url);
                 propiedades=await respuesta.json();
            mostrarPropieades(propiedades);
             
        } catch (error) {
            console.log(error);
        }

    }

    const mostrarPropieades=(propiedades)=>{

        //Limpiar los markers previos
        markers.clearLayers();

        propiedades.forEach((propiedad)=>{
            //Agregar los pines
            const marker=new L.marker([propiedad?.lat, propiedad?.lng],{
                autoPan:true
            })
            .addTo(mapa)
            .bindPopup(`
                <p class="text-indigo-600 font-bold">${propiedad.categoria.nombre}</p>
                <h1 class="text-xl font-extrabold uppercase my-2">${propiedad?.titulo}</h1>
                <img src="uploads/${propiedad?.imagen}" alt="imagen de la propiedad ${propiedad.titulo}"/>
                <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
                <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase text-white">Ver propiedad</a>
                `)

            markers.addLayer(marker)
        })
         
    }

    const filtrarPropiedades=()=>{
        
        const resultado=propiedades.filter(filtrarCategoria).filter(filtrarPrecio)
        mostrarPropieades(resultado)
       
    }

    const filtrarCategoria=propiedad=>filtros.categoria ? propiedad.categoriaId===filtros.categoria : propiedad
    const filtrarPrecio=propiedad=>filtros.precio ? propiedad.precioId===filtros.precio : propiedad

    obtenerPropiedades();



})()