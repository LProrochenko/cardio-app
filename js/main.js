'use strict';
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const loader = document.getElementById('map-loader');
const btnReset = document.querySelector('.reset');
const btnDeleteWorkout = document.querySelector('.delete-workout');
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
    this.pace = (this.duration / this.distance).toFixed(2);
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
    this.velocity = (this.distance / (this.duration / 60)).toFixed(2);
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    document.addEventListener('DOMContentLoaded', this._setDefaultFormState);
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleClimbField);
    containerWorkouts.addEventListener('click', this._moveToWorkout.bind(this));
    this._getLocalStorageData();
    btnReset.addEventListener('click', this.reset);
    containerWorkouts.addEventListener('click', this._deleteWorkout.bind(this));
  }
  _getLocalStorageData() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach( workout => -this._displayWorkoutOnSidebar(workout));
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
    }).addTo(this.#map).on('load', this._stopSpiner.bind(this));
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(workout => this._displayWorkout(workout));
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('form-hidden');
    inputDistance.focus();
  }
  _hideForm() {
    form.classList.add('form-hidden');
    inputDistance.value =
      inputDuration.value =
      inputSpeed.value =
      inputClimb.value =
        '';
  }

  _newWorkout(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    const areNumbers = (...numbers) =>
      numbers.every(num => Number.isFinite(num));
    const areNumbersPositive = (...numbers) => numbers.every(num => num > 0);

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    if (type === 'running') {
      const speed = +inputSpeed.value;
      if (
        !areNumbers(distance, duration, speed) ||
        !areNumbersPositive(distance, duration, speed)
      )
        return alert('Invalid input. Please enter a positive number.');
      workout = new Running([lat, lng], distance, duration, speed);
    }
    if (type === 'cycling') {
      const climb = +inputClimb.value;
      if (
        !areNumbers(distance, duration, climb) ||
        !areNumbersPositive(distance, duration)
      )
        return alert('Invalid input. Please enter a positive number.');
      workout = new Cycling([lat, lng], distance, duration, climb);
    }
    this.#workouts.push(workout);

    this._displayWorkout(workout);
    this._displayWorkoutOnSidebar(workout);
    this._hideForm();
    this._addWorkoutsToLocalStorage();
  }
  _addWorkoutsToLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _setDefaultFormState() {
    inputType.value = 'running';
    inputSpeed.closest('.form__group').classList.remove('hidden');
    inputClimb.closest('.form__group').classList.add('hidden');
  }
  _stopSpiner() {
    if (loader) loader.style.display = 'none';
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
      .setPopupContent(
        `${workout.type === 'running' ? '🏃' : '🚵‍♂️'} ${workout.type}      ${
          workout.date
        }`
      )
      .openPopup();
  }
  _displayWorkoutOnSidebar(workout) {
    let html = `
    <ul>
      <li class="workout workout-${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.type} ${workout.date}</h2>
        <button class="delete-workout">×</button>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃' : '🚵'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`;
    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">📏⏱</span>
          <span class="workout__value">${workout.pace}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">👟⏱</span>
          <span class="workout__value">${workout.speed}</span>
          <span class="workout__unit">step/min</span>
        </div>
      </li>
    </ul>`;
    }
    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">📏⏱</span>
          <span class="workout__value">${workout.velocity}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🏔</span>
          <span class="workout__value">${workout.climb}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
    </ul>`;
    }
    form.insertAdjacentHTML('afterend', html);
    btnReset.classList.remove('hidden');
  }
  _moveToWorkout(e) {
    if (!this.#map) return;
    const workoutElement = e.target.closest('.workout');
    if (!workoutElement) return;
    const workout = this.#workouts.find(
      item => item.id === workoutElement.dataset.id
    );
    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: true,
      },
    });
  }
  _deleteWorkout(e) {
    if (!e.target.classList.contains('delete-workout')) return;
     console.log(e);
     const workoutElement = e.target.closest('.workout');
    if (!workoutElement) return;
    this.#workouts = this.#workouts.filter(workout => workout.id !== workoutElement.dataset.id);
    this._addWorkoutsToLocalStorage();
    workoutElement.remove();
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
