import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Dialog } from '@capacitor/dialog';

export class GalleryPage extends HTMLElement {
    constructor() {
        super();
        this.images = [];
        this.STORAGE_KEY = 'saved_images';
    }

    async connectedCallback() {
        this.render();
        await this.loadSavedImages();
        
        const btn = this.querySelector('#take-photo-btn');
        if (btn) {
            btn.addEventListener('click', () => this.selectImage());
        }
    }

    async loadSavedImages() {
        const { value } = await Preferences.get({ key: this.STORAGE_KEY });
        this.images = value ? JSON.parse(value) : [];
        this.updateGallery();
    }

    async saveImages() {
        await Preferences.set({
            key: this.STORAGE_KEY,
            value: JSON.stringify(this.images),
        });
    }

    async selectImage() {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Prompt 
            });

            this.images.push(image);
            await this.saveImages();
            this.updateGallery();

        } catch (error) {
            if (error.message !== 'User cancelled photos app') {
                await Dialog.alert({
                    title: 'Помилка',
                    message: `Не вдалося отримати фото: ${error.message}`,
                });
            }
        }
    }

    updateGallery() {
        const gallery = this.querySelector('#image-gallery');
        if (!gallery) return;
        
        gallery.innerHTML = ''; 

        this.images.forEach((image) => {
            const col = document.createElement('ion-col');
            col.size = '6'; 
            col.sizeMd = '4'; 
            
            const img = document.createElement('ion-img');
            img.src = image.webPath;
            img.style.height = '150px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            
            col.appendChild(img);
            gallery.appendChild(col);
        });
    }

    render() {
        this.innerHTML = `
        <ion-header>
            <ion-toolbar color="primary">
                <ion-buttons slot="start">
                    <ion-back-button default-href="/"></ion-back-button>
                </ion-buttons>
                <ion-title>Фотогалерея</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            
            <ion-grid>
                <ion-row id="image-gallery"></ion-row>
            </ion-grid>

            <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button id="take-photo-btn">
                    <ion-icon name="camera"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>
        `;
    }
}

customElements.define('page-gallery', GalleryPage);