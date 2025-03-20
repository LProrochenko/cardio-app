'use strict';
const form = document.querySelector('.form');
const inputDistance = document.querySelector('.form__input-distance');
const inputDuration = document.querySelector('.form__input-duration');
const inputSpeed = document.querySelector('.form__input-speed');
const inputClimb = document.querySelector('.form__input-climb');
const inputType = document.querySelector('.form__input-type');

class Workout {
  date = new Intl.DateTimeFormat(navigator.language).format(new Date());
  id = crypto.randomUUID().replace(/-/g, '');

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, speed) {
    super(coords, distance, duration);
    this.speed = speed;
    this.calculatePace();
  }

  calculatePace() {
    this.pace = this.duration / this.distance;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, climb) {
    super(coords, distance, duration);
    this.climb = climb;
    this.calculateSpeed();
  }

  calculateSpeed() {
    this.speed = this.distance / this.duration / 60;
  }
}


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
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    const areNumbers = (...numbers) => numbers.every(num => Number.isFinite(num));
    const areNumbersPositive = (...numbers) => numbers.every(num => num >0);

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDistance.value;
    if ( type === 'running') {
      const speed = +inputSpeed.value;
      if ( !areNumbers (distance, duration, speed) || !areNumbersPositive(distance, duration, speed)) return alert ('Invalid input. Please enter a positive number.');
      workout = new Running([lat, lng], distance, duration, speed);
    }
    if ( type === 'cycling') {
      const climb = +inputClimb.value;
      if ( !areNumbers (distance, duration, climb) || !areNumbersPositive(distance, duration)) return alert ('Invalid input. Please enter a positive number.');
      workout = new Cycling ([lat, lng], distance, duration, climb);
    }
    this._displayWorkout(workout);

    inputDistance.value =
    inputDuration.value =
    inputSpeed.value =
    inputClimb.value =
    '';
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
  _displayWorkout(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          className: `${workout.type}-popup`,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent('training')
      .openPopup();
  }
}

const app = new App();
