import {Dropzone} from 'dropzone';


const token=document.querySelector('meta[name="csrf-token"]').content;


Dropzone.options.imagen={
    dictDefaultMessage:'Sube las fotos de tu propiedad',
    acceptedFiles:'.png,.jpg,.jpeg',
    maxFilesize:5,
    maxFiles:1,
    parallelUploads:1,
    autoProcessQueue:false, //subida de datos automatica, para activarlo debe estar en true
    addRemoveLinks:true,
    dictRemoveFile:'Borrar Archivo',
    dictMaxFilesExceeded:'El límite es 1 archivo',
    headers:{
        'CSRF-Token':token
    },
    paramName:'imagen',
    init:function(){
        const dropzone=this;
        const btnPublicar=document.querySelector('#publicar');

        btnPublicar.addEventListener('click',function(){
            dropzone.processQueue()
        })
        dropzone.on('queuecomplete',function(file,mensaje){
            if(dropzone.getActiveFiles().length==0){
                window.location.href='/mis-propiedades'
            }
        })
    }
}