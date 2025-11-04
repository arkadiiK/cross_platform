/*
 * Компонент головної сторінки (Список планет)
 */
class HomePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <ion-grid>
        <ion-row>
          ${this.generatePlanetCards()}
        </ion-row>
      </ion-grid>
    `;
  }

  generatePlanetCards() {
    let html = '';
    for (const planet of planets) {
      html += `
        <ion-col size="12" size-md="6" size-lg="4">
          <ion-router-link href="/planet/${planet.id}">
            <ion-card>
              <img src="${planet.image}" style="width: 100%; object-fit: cover;" />
              <ion-card-header>
                <ion-card-title>${planet.name}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                ${planet.description}
              </ion-card-content>
            </ion-card>
          </ion-router-link>
        </ion-col>
      `;
    }
    return html;
  }
}

/*
 * Компонент сторінки детальної інформації (Виправлення 8: Заміна ion-img на <img>)
 */
class PlanetDetailPage extends HTMLElement {
  connectedCallback() {
    const planetId = window.location.pathname.split('/').pop();
    const planet = planets.find(p => p.id === planetId);

    if (!planet) {
      this.innerHTML = `<h2>Планету не знайдено</h2>`;
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
          <p>${planet.details.description || planet.description}</p>

          <h3>Характеристики:</h3>

          <div>
            <ion-chip outline color="primary">
              Температура: ${planet.details.temperature}
            </ion-chip>
            <ion-chip outline color="secondary">
              Маса: ${planet.details.mass}
            </ion-chip>
            <ion-chip outline color="tertiary">
              Відстань: ${planet.details.distance}
            </ion-chip>
            <ion-chip outline color="medium">
              Відкриття: ${planet.details.discovery}
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
              ${planet.details.atmosphere}
            </div>
          </ion-accordion>
          <ion-accordion value="satellites">
            <ion-item slot="header" color="light">
              <ion-label>Супутники</ion-label>
            </ion-item>
            <div class="ion-padding" slot="content">
              ${planet.details.satellites}
            </div>
          </ion-accordion>
          <ion-accordion value="missions">
            <ion-item slot="header" color="light">
              <ion-label>Місії та експедиції</ion-label>
            </item>
            <div class="ion-padding" slot="content">
              <ul>
                ${planet.details.missions.slice(0, 3).map(mission => `<li>${mission}</li>`).join('')}
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