'use strict';
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const {latitude, longitude} = position.coords;
      // const { latitude } = position.coords;
      // const { longitude } = position.coords;
      //const coords = [latitude, longitude];
      const map = L.map('map').setView([latitude, longitude], 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);



      map.on('click', function (mapEvent) {
        const {lat, lng} = mapEvent.latlng;
        L.marker([lat, lng])
        .addTo(map)
        .bindPopup(L.popup({
          maxWidth: 200,
          minWidth: 100,
          className: 'running-popup',
          autoClose: false,
          closeOnClick: false,
        })).setPopupContent('training')
        .openPopup();
      });
    },
    function () {
      alert('Failed to retrieve location');
    }
  );
}
