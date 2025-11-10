// Отримуємо посилання на модальне вікно та кнопки [cite: 126-133]
const addPlanetModal = document.querySelector('ion-modal');
const closeModalButton = addPlanetModal.querySelector('#close-add-planet-modal');
const confirmAddPlanetButton = addPlanetModal.querySelector('#confirm-add-planet');

// Обробник для кнопки "Закрити" [cite: 139-141]
closeModalButton.addEventListener('click', async () => {
  await addPlanetModal.dismiss();
});

// Обробник для кнопки "Додати" [cite: 170-171]
confirmAddPlanetButton.addEventListener('click', async () => {
  
  // Отримуємо посилання на елементи форми [cite: 178-190]
  const nameInput = addPlanetModal.querySelector('#planetName');
  const imageInput = addPlanetModal.querySelector('#planetImage');
  const descriptionInput = addPlanetModal.querySelector('#planetDescription');
  const temperatureInput = addPlanetModal.querySelector('#planetTemperature');
  const massInput = addPlanetModal.querySelector('#planetMass');
  const atmosphereInput = addPlanetModal.querySelector('#planetAtmosphere');
  const satellitesInput = addPlanetModal.querySelector('#planetSatellites');
  const missionsInput = addPlanetModal.querySelector('#planetMissions');

  // Створюємо об'єкт newPlanet [cite: 196-205]
  const newPlanet = {
    name: nameInput.value.trim(),
    image: imageInput.value.trim(),
    description: descriptionInput.value.trim(),
    details: {
      temperature: temperatureInput.value.trim(),
      mass: massInput.value.trim(),
      atmosphere: atmosphereInput.value.trim(),
      // Розділяємо рядки на масиви по комі [cite: 204-205]
      satellites: satellitesInput.value.split(',').map(s => s.trim()),
      missions: missionsInput.value.split(',').map(m => m.trim())
    }
  };

  // Перевірка обов'язкових полів [cite: 213-215]
  if (!newPlanet.name || !newPlanet.image || !newPlanet.description) {
    alert('Будь ласка, заповніть всі обов\'язкові поля.');
    return;
  }

  // Зберігаємо нову планету в localStorage [cite: 217-220]
  const savedPlanets = JSON.parse(localStorage.getItem('planets') || '[]');
  savedPlanets.push(newPlanet);
  localStorage.setItem('planets', JSON.stringify(savedPlanets));

  // Очищаємо поля форми [cite: 228-236]
  nameInput.value = '';
  imageInput.value = '';
  descriptionInput.value = '';
  temperatureInput.value = '';
  massInput.value = '';
  atmosphereInput.value = '';
  satellitesInput.value = '';
  missionsInput.value = '';

  // Оновлюємо список планет на головній сторінці [cite: 468-472]
  const homePage = document.querySelector('page-home');
  if (homePage) {
    homePage.connectedCallback(); // Викликаємо метод для оновлення
  }
  
  // Закриваємо модальне вікно [cite: 222]
  await addPlanetModal.dismiss();
});