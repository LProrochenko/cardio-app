'use strict';
const form = document.querySelector('.form');
const inputDistance = document.querySelector('.form__input-distance');
const inputDuration = document.querySelector('.form__input-duration');
const inputSpeed = document.querySelector('.form__input-speed');
const inputClimb = document.querySelector('.form__input-climb');
const inputType = document.querySelector('.form__input-type');

let map, mapEvent;
inputSpeed.closest('.form__group').classList.remove('hidden');
inputClimb.closest('.form__group').classList.add('hidden');
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude, longitude } = position.coords;
      // const { latitude } = position.coords;
      // const { longitude } = position.coords;
      //const coords = [latitude, longitude];
      map = L.map('map').setView([latitude, longitude], 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', function (event) {
        mapEvent = event;
        // const { lat, lng } = mapEvent.latlng;
        form.classList.remove('form-hidden');
        inputDistance.focus();

        //   L.marker([lat, lng])
        //   .addTo(map)
        //   .bindPopup(L.popup({
        //     maxWidth: 200,
        //     minWidth: 100,
        //     className: 'running-popup',
        //     autoClose: false,
        //     closeOnClick: false,
        //   })).setPopupContent('training')
        //   .openPopup();
      });
    },
    function () {
      alert('Failed to retrieve location');
    }
  );
}

document.addEventListener('DOMContentLoaded', function () {
  // Устанавливаем значение по умолчанию
  inputType.value = 'running';

  // Принудительно показываем Speed и скрываем Climb
  inputSpeed.closest('.form__group').classList.remove('hidden');
  inputClimb.closest('.form__group').classList.add('hidden');
});

form.addEventListener('submit', function (event) {
  console.log(event);
  const { lat, lng } = mapEvent.latlng;

  event.preventDefault();
  inputDistance.value =
    inputDuration.value =
    inputSpeed.value =
    inputClimb.value =
      '';
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 200,
        minWidth: 100,
        className: 'running-popup',
        autoClose: false,
        closeOnClick: false,
      })
    )
    .setPopupContent('training')
    .openPopup();
});

inputType.addEventListener('change', function () {
  inputClimb.closest('.form__group').classList.toggle('hidden');
  inputSpeed.closest('.form__group').classList.toggle('hidden');
});
