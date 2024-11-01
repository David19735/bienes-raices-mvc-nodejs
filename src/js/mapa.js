(function() {

    //Usamos logical Or para verificar si dentro de los querySelector existen datos
    
    const lat = document.querySelector('#lat').value || 19.4600628;
    const lng = document.querySelector('#lng').value ||  -99.2361836;
    const mapa = L.map('mapa').setView([lat, lng ], 16);
    let marker;

    //Utilizar provider y geocoder
    const geocodeService=L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //El pin 
    marker=new L.marker([lat,lng],{
        draggable:true,
        autoPan:true
    }).addTo(mapa)

    //Detectar el movimiento del pin
    marker.on('moveend',function(e){
        marker=e.target;
        const posicion=marker.getLatLng();
        mapa.panTo(new L.LatLng(posicion.lat,posicion.lng))
        
        //Obtener información de la calle al soltar el pin
        geocodeService.reverse().latlng(posicion,16).run(function(error,resultado){
        marker.bindPopup(resultado.address.LongLabel)
        console.log(resultado.latlng);

        //Llenar los campos
        document.querySelector('.calle').textContent=resultado?.address?.LongLabel ?? '';  
        document.querySelector('#calle').value=resultado?.address?.LongLabel ?? '';
        document.querySelector('#lat').value=resultado?.latlng?.lat ?? '';
        document.querySelector('#lng').value=resultado?.latlng?.lng ?? '';
            
        })   

    })


})()

