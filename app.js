class HomePage extends HTMLElement {
  constructor() {
    super();
    this.sortType = 'default';
    this.planets = []; // Тут будемо зберігати дані з сервера [cite: 109]
  }

  // Функція для парсингу маси (бо сервер повертає рядки типу "3.3011 x 10^23 kg")
  parseMass(massString) {
    if (!massString) return 0;
    // Видаляємо 'kg', замінюємо 'x' на 'x' (якщо треба), видаляємо пробіли
    let str = massString.toString().replace(' kg', '').replace(/ /g, '').toLowerCase();
    
    if (str.includes('x10^')) {
      const parts = str.split('x10^');
      return parseFloat(parts[0]) * Math.pow(10, parseInt(parts[1]));
    }
    return parseFloat(str);
  }

  // Метод отримання даних з API [cite: 111-138]
  async fetchPlanetsData() {
    const loader = document.querySelector('ion-loading');
    if (loader) await loader.present(); // Показуємо лоадер

    // Використовуємо проксі allorigins.win, щоб обійти CORS
    const url = 'https://api.allorigins.win/raw?url=https://university-api-alpha.vercel.app/api/planets';
    const options = { method: 'GET' };

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP помилка! Статус: ${response.status}`);
      }

      const data = await response.json();
      console.log('Отримані дані:', data);

      // Перетворюємо дані сервера у наш формат [cite: 146-153]
      this.planets = data.map((planet) => ({
        name: planet.name,
        // Сервер повертає об'єкт зображення, нам потрібен URL
        image: planet.imgSrc ? planet.imgSrc.img : '', 
        description: planet.description,
        // Зберігаємо оригінальні деталі + ID для детальної сторінки
        id: planet.id, 
        details: {
          mass: planet.basicDetails.mass,
          volume: planet.basicDetails.volume,
          // Додамо поля, яких може не бути в списку, але вони потрібні для сумісності
          temperature: 'Див. деталі',
          distance: 'Див. деталі',
          discovery: 'Див. деталі',
          atmosphere: 'Див. деталі',
          satellites: [],
          missions: []
        }
      }));

      // Після завантаження одразу рендеримо
      this.render();

    } catch (error) {
      console.error('Помилка при отриманні даних:', error);
      // Відображаємо помилку користувачу (Завдання самостійної роботи 3) [cite: 206]
      const toast = document.createElement('ion-toast');
      toast.message = `Не вдалося завантажити дані: ${error.message}`;
      toast.duration = 3000;
      toast.color = 'danger';
      document.body.appendChild(toast);
      return toast.present();
    } finally {
      if (loader) await loader.dismiss(); // Ховаємо лоадер [cite: 137]
    }
  }

  connectedCallback() {
    // Завантажуємо дані при старті
    this.fetchPlanetsData();
  }

  render() {
    const savedPlanets = JSON.parse(localStorage.getItem('planets')) || [];
    // Об'єднуємо дані з сервера та локальні
    const allPlanets = this.planets.concat(savedPlanets);

    let displayedPlanets = [...allPlanets];

    // Логіка сортування (з минулої лаби)
    switch (this.sortType) {
      case 'name-az':
        displayedPlanets.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-za':
        displayedPlanets.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'mass':
        displayedPlanets.sort((a, b) => {
          const massA = this.parseMass(a.details && a.details.mass);
          const massB = this.parseMass(b.details && b.details.mass);
          return massA - massB;
        });
        break;
    }

    this.innerHTML = `
      <ion-header>
        <ion-toolbar>
          <ion-title>Планети (API)</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-segment id="sort-segment" value="${this.sortType}">
          <ion-segment-button value="default"><ion-label>Default</ion-label></ion-segment-button>
          <ion-segment-button value="name-az"><ion-label>A-Z</ion-label></ion-segment-button>
          <ion-segment-button value="name-za"><ion-label>Z-A</ion-label></ion-segment-button>
          <ion-segment-button value="mass"><ion-label>Mass</ion-label></ion-segment-button>
        </ion-segment>

        <ion-grid>
          <ion-row>
            ${displayedPlanets.map(planet => `
              <ion-col size="12" size-md="6" size-lg="4">
                <ion-router-link href="/planet/${planet.id || planet.name}">
                  <ion-card>
                    <img src="${planet.image}" style="width: 100%; height: 200px; object-fit: cover;" alt="${planet.name}"/>
                    <ion-card-header>
                      <ion-card-title>${planet.name}</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                      ${planet.description.substring(0, 100)}...
                    </ion-card-content>
                  </ion-card>
                </ion-router-link>
              </ion-col>
            `).join('')}
          </ion-row>
        </ion-grid>
      </ion-content>
    `;

    const sortSegment = this.querySelector('#sort-segment');
    if (sortSegment) {
      sortSegment.addEventListener('ionChange', (event) => {
        this.sortType = event.detail.value;
        this.render(); // Перерисовуємо без повторного запиту до API
      });
    }
  }
}

/*
 * Компонент деталей планети
 * ОНОВЛЕНО: Робить окремий запит для отримання деталей (Завдання самостійної роботи 1) [cite: 194-196]
 */
class PlanetDetailPage extends HTMLElement {
  async connectedCallback() {
    // Отримуємо параметр з URL (це може бути ID або Ім'я)
    const planetParam = decodeURI(window.location.hash.split('/').pop());
    
    // Перевіряємо, чи це локальна планета (з localStorage)
    const savedPlanets = JSON.parse(localStorage.getItem('planets')) || [];
    const localPlanet = savedPlanets.find(p => p.name === planetParam);

    if (localPlanet) {
      this.render(localPlanet);
      return;
    }

    // Якщо це не локальна планета, робимо запит до API за ID
    // Припускаємо, що якщо параметр - число, то це ID
    // Проксі для отримання деталей конкретної планети
    const url = `https://api.allorigins.win/raw?url=https://university-api-alpha.vercel.app/api/planets/${planetParam}`;
    
    const loader = document.querySelector('ion-loading');
    if (loader) await loader.present();

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Планету не знайдено');
      
      const data = await response.json();
      
      // Форматуємо дані однієї планети під наш формат
      const planet = {
        name: data.name,
        image: data.imgSrc ? data.imgSrc.img : '',
        description: data.description,
        details: {
          mass: data.basicDetails.mass,
          volume: data.basicDetails.volume,
          year: data.basicDetails.year, // Нове поле з API
          temperature: 'Дані з API відсутні', // API не завжди віддає температуру
          atmosphere: 'Дані з API відсутні'
        }
      };
      
      this.render(planet);

    } catch (error) {
      this.innerHTML = `<ion-content class="ion-padding"><h2>Помилка: ${error.message}</h2><ion-button href="/">Назад</ion-button></ion-content>`;
    } finally {
      if (loader) await loader.dismiss();
    }
  }

  render(planet) {
    this.innerHTML = `
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button default-href="/"></ion-back-button>
          </ion-buttons>
          <ion-title>${planet.name}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <ion-card>
          <img src="${planet.image}" style="width: 100%; max-height: 300px; object-fit: contain;"/>
          <ion-card-header>
            <ion-card-title>${planet.name}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            ${planet.description}
          </ion-card-content>
        </ion-card>

        <ion-list>
          <ion-list-header>Характеристики</ion-list-header>
          <ion-item>
            <ion-label>Маса</ion-label>
            <ion-note slot="end">${planet.details.mass || 'Н/Д'}</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Об'єм</ion-label>
            <ion-note slot="end">${planet.details.volume || 'Н/Д'}</ion-note>
          </ion-item>
           <ion-item>
            <ion-label>Рік (орбітальний період)</ion-label>
            <ion-note slot="end">${planet.details.year || 'Н/Д'}</ion-note>
          </ion-item>
        </ion-list>
      </ion-content>
    `;
  }
}

customElements.define('page-home', HomePage);
customElements.define('page-planet-detail', PlanetDetailPage);