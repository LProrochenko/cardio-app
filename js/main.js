'use strict';
const form = document.querySelector('.form');
const inputDistance = document.querySelector('.form__input-distance');
const inputDuration = document.querySelector('.form__input-duration');
const inputSpeed = document.querySelector('.form__input-speed');
const inputClimb = document.querySelector('.form__input-climb');
const inputType = document.querySelector('.form__input-type');

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
    document.addEventListener('DOMContentLoaded', this._setDefaultFormState);
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleClimbField);
  }

  _getPosition(e) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Failed to retrieve location');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    console.log(latitude, longitude);

    this.#map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('form-hidden');
    inputDistance.focus();
  }

  _newWorkout(e) {
    const { lat, lng } = this.#mapEvent.latlng;

    e.preventDefault();
    inputDistance.value =
      inputDuration.value =
      inputSpeed.value =
      inputClimb.value =
        '';
    L.marker([lat, lng])
      .addTo(this.#map)
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
  }

  _setDefaultFormState() {
    inputType.value = 'running';
    inputSpeed.closest('.form__group').classList.remove('hidden');
    inputClimb.closest('.form__group').classList.add('hidden');
  }

  _toggleClimbField() {
    inputClimb.closest('.form__group').classList.toggle('hidden');
    inputSpeed.closest('.form__group').classList.toggle('hidden');
  }
}

const app = new App();
