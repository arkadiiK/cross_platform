/*
 * Компонент головної сторінки (Список планет)
 *
 * ОНОВЛЕНО:
 * - 'connectedCallback' тепер завантажує планети з localStorage.
 * - Додано логіку сортування (Завдання 6).
 * - ВИПРАВЛЕНО: Замінено тернарний оператор '?:' на '&&' у
 * функції сортування, щоб уникнути помилок лінтера ts(1005).
 */
class HomePage extends HTMLElement {
  constructor() {
    super();
    this.sortType = 'default';
  }

  parseMass(massString) {
    if (!massString) return 0;
    let str = massString.toString().replace(' кг', '').replace('×', 'x').trim();
    if (str.includes('x10^')) {
      const parts = str.split('x10^');
      return parseFloat(parts[0]) * Math.pow(10, parseInt(parts[1]));
    }
    return parseFloat(str);
  }

  connectedCallback() {
    const savedPlanets = JSON.parse(localStorage.getItem('planets')) || [];
    const allPlanets = planets.concat(savedPlanets);

    let displayedPlanets = [...allPlanets];

    switch (this.sortType) {
      case 'name-az':
        displayedPlanets.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-za':
        displayedPlanets.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'mass':
        // ======================================================
        // ТУТ БУЛО ВИПРАВЛЕННЯ (для помилки на рядку 29)
        // ======================================================
        displayedPlanets.sort((a, b) => {
          // Використовуємо '&&' замість '?:' для сумісності
          const massA_val = (a.details && a.details.mass) || '0';
          const massB_val = (b.details && b.details.mass) || '0';
          const massA = this.parseMass(massA_val);
          const massB = this.parseMass(massB_val);
          return massA - massB;
        });
        break;
    }

    this.innerHTML = `
      <ion-header>
        <ion-toolbar>
          <ion-title>Планети Сонячної системи</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-segment id="sort-segment" value="${this.sortType}">
          <ion-segment-button value="default">
            <ion-label>За замовч.</ion-label>
          </ion-segment-button>
          <ion-segment-button value="name-az">
            <ion-label>Ім'я (А-Я)</ion-label>
          </ion-segment-button>
          <ion-segment-button value="name-za">
            <ion-label>Ім'я (Я-А)</ion-label>
          </ion-segment-button>
          <ion-segment-button value="mass">
            <ion-label>Маса</ion-label>
          </ion-segment-button>
        </ion-segment>

        <ion-grid>
          <ion-row>
            ${displayedPlanets.map(planet => `
              <ion-col size="12" size-md="6" size-lg="4">
                <ion-router-link href="/planet/${planet.name}">
                  <ion-card>
                    <img src="${planet.image}" style="width: 100%; height: 200px; object-fit: cover;" />
                    <ion-card-header>
                      <ion-card-title>${planet.name}</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                      ${planet.description}
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
        this.connectedCallback();
      });
    }
  }
}

/*
 * Компонент сторінки детальної інформації
 *
 * ОНОВЛЕНО:
 * - Завантажує планети з localStorage.
 * - Знаходить планету за 'planet.name'.
 * - ВИПРАВЛЕНО: Замінено оператор '?.' на '&&' для
 * уникнення помилок лінтера ts(1005).
 */
class PlanetDetailPage extends HTMLElement {
  connectedCallback() {
    const savedPlanets = JSON.parse(localStorage.getItem('planets')) || [];
    const allPlanets = planets.concat(savedPlanets);

    const planetName = decodeURI(window.location.hash.split('/').pop());
    const planet = allPlanets.find(p => p.name === planetName);

    if (!planet) {
      this.innerHTML = `
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button default-href="/"></ion-back-button>
            </ion-buttons>
            <ion-title>Помилка</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <h2>Планету не знайдено</h2>
          <p>Можливо, планету з іменем "${planetName}" не існує.</p>
        </ion-content>
      `;
      return;
    }

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
        <ion-breadcrumbs>
          <ion-breadcrumb href="/">Головна</ion-breadcrumb>
          <ion-breadcrumb>${planet.name}</ion-breadcrumb>
        </ion-breadcrumbs>
        
        <br>

        <div>
          <p>${(planet.details && planet.details.description) || planet.description}</p>

          <h3>Характеристики:</h3>

          <div>
            <ion-chip outline color="primary">
              Температура: ${(planet.details && planet.details.temperature) || 'N/A'}
            </ion-chip>
            <ion-chip outline color="secondary">
              Маса: ${(planet.details && planet.details.mass) || 'N/A'}
            </ion-chip>
            <ion-chip outline color="tertiary">
              Відстань: ${(planet.details && planet.details.distance) || 'N/A'}
            </ion-chip>
            <ion-chip outline color="medium">
              Відкриття: ${(planet.details && planet.details.discovery) || 'N/A'}
            </ion-chip>
          </div>
        </div>

        <br>

        <img 
          src="${planet.image}" 
          style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px;">
        
        <br>
        <br>

        <h3>Додаткова інформація:</h3>
        <ion-accordion-group>
          <ion-accordion value="atmosphere">
            <ion-item slot="header" color="light">
              <ion-label>Хімічний склад атмосфери</ion-label>
            </ion-item>
            <div class="ion-padding" slot="content">
              ${(planet.details && planet.details.atmosphere) || 'Дані відсутні'}
            </div>
          </ion-accordion>
          <ion-accordion value="satellites">
            <ion-item slot="header" color="light">
              <ion-label>Супутники</ion-label>
            </ion-item>
            <div class="ion-padding" slot="content">
              ${(planet.details && planet.details.satellites && Array.isArray(planet.details.satellites)
                  ? planet.details.satellites.join(', ')
                  : (planet.details && planet.details.satellites)) || 'Дані відсутні'}
            </div>
          </ion-accordion>
          <ion-accordion value="missions">
            <ion-item slot="header" color="light">
              <ion-label>Місії та експедиції</ion-label>
            </item>
            <div class="ion-padding" slot="content">
              <ul>
                ${(planet.details && planet.details.missions && Array.isArray(planet.details.missions)
                  ? planet.details.missions.map(mission => `<li>${mission}</li>`).join('')
                  : ((planet.details && planet.details.missions) || '<li>Дані відсутні</li>'))}
              </ul>
            </div>
          </ion-accordion>
        </ion-accordion-group>

      </ion-content>
    `;
  }
}

// Реєструємо наші кастомні елементи
customElements.define('page-home', HomePage);
customElements.define('page-planet-detail', PlanetDetailPage);