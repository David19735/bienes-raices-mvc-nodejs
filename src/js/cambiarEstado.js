
(function(){
   
    const cambiarEstado=document.querySelectorAll('.cambiar-estado');
    const token=document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    

    cambiarEstado.forEach((boton)=>{
        boton.addEventListener('click',cambiarEstadoPropiedad)
    })

    async function cambiarEstadoPropiedad(e){

        const {propiedadId:id}=e.target.dataset;
        const url=`/propiedades/${id}`;
        
        try {
            const respuesta=await fetch(url,{
                method:'PUT',
                headers:{
                    'CSRF-Token':token
                }
            })
    
            const {resultado}=await respuesta.json();
            if(resultado){
                if(e.target.classList.contains('bg-yellow-200')){
                        e.target.classList.add('bg-green-500','text-green-800');
                        e.target.classList.remove('bg-yellow-200','text-yellow-800');
                        e.target.textContent='Publicado';
                }else{
                    e.target.classList.add('bg-yellow-200','text-yellow-800')
                    e.target.classList.remove('bg-green-500','text-green-800');
                   e.target.textContent='No publicado';
                }

            }


        } catch (error) {
            console.log(error);
        }
    }

})()