import Camera from '../../utils/camera';
import AddStoryPagePresenter from './add-story-presenter';
import * as StoryAPI from '../../data/api';
import Map from '../../utils/map';
import { generateLoaderAbsoluteTemplate, generateMapErrorTemplate } from '../../templates';
import Swal from 'sweetalert2';
import Screenshot from '../../utils/screenshot';

export default class AddStoryPage {
  #presenter;
  #form;
  #isCameraOpen = false;
  #takenDocumentations = null;
  #camera;
  #map = null;
  #isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  #screenshot;

  async render() {
    return `  
      <section>
        <div class="new-story__header">
          <div class="container">
            <h1 class="new-story__header__title">Buat Cerita Baru</h1>
            <p class="new-story__header__description">
              Silakan lengkapi formulir di bawah untuk membuat ceita baru.<br>
              Bagikan cerita harian anda disini.
            </p>
            <div class="shortcuts-container">
            <br>
              <div class="shortcuts-buttons">
                <button id="focus-description" class="shortcut-btn" title="Fokus ke deskripsi (Ctrl+1) - Tekan Ctrl+, untuk semua shortcut">
                  <i class="fas fa-align-left"></i> <span>Deskripsi</span>
                </button>
                <button id="focus-location" class="shortcut-btn" title="Fokus ke peta (Ctrl+2) - Tekan Ctrl+, untuk semua shortcut">
                  <i class="fas fa-map-marker-alt"></i> <span>Peta</span>
                </button>
                <button id="take-quick-screenshot" class="shortcut-btn" title="Ambil screenshot cepat (Ctrl+3) - Tekan Ctrl+, untuk semua shortcut">
                  <i class="fas fa-camera"></i> <span>Screenshot</span>
                </button>
                ${
                  this.#isMobile
                    ? `
                <button id="open-mobile-camera" class="shortcut-btn" title="Buka kamera mobile">
                  <i class="fas fa-mobile-alt"></i> <span>Kamera</span>
                </button>`
                    : ''
                }
                <button id="show-help" class="shortcut-btn" title="Tampilkan semua shortcut (Ctrl+,)">
                  <i class="fas fa-question-circle"></i> <span>Bantuan Shortcut</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section class="container">
        <div class="new-form__container">
          <form id="new-form" class="new-form">
            <div class="form-control">
              <label for="description-input" class="new-form__description__title">Deskripsi</label>

              <div class="new-form__description__container">
                <textarea
                  id="description-input"
                  name="description"
                  placeholder="Masukkan deskripsi"
                ></textarea>
              </div>
            </div>
            <div class="form-control">
              <label for="documentations-input" class="new-form__documentations__title">Media</label>
              <div class="new-form__documentations__container">
                <div class="new-form__documentations__buttons">
                  <button id="documentations-input-button" class="btn btn-ghost" type="button"><i class="fas fa-folder-open"></i>Browse</button>
                  <input
                    id="documentations-input"
                    class="new-form__documentations__input"
                    name="documentations"
                    type="file"
                    accept="image/*"
                    multiple
                    aria-multiline="true"
                    aria-describedby="documentations-more-info"
                  >
                  <button id="open-documentations-camera-button" class="btn btn-ghost" type="button">
                    <i class="fas fa-camera"></i>Buka Kamera
                  </button>
                  <button id="take-screenshot-button" class="btn btn-ghost" type="button">
                    <i class='fas fa-images'></i> Screenshot
                  </button>
                </div>
                <div id="camera-container" class="new-form__camera__container camera-mobile">
                <video id="camera-video" class="new-form__camera__video">
                  Video stream not available.
                </video>

                  <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>
 
                <div class="new-form__camera__tools">
                  <select id="camera-select"></select>
                  <div class="new-form__camera__tools_buttons">
                    <button id="camera-take-button" class="btn" type="button">
                      Ambil Gambar
                    </button>
                  </div>
                </div>
                </div>
                <ul id="documentations-taken-list" class="new-form__documentations__outputs"></ul>
              </div>
            </div>
            <div class="form-control">
              <div class="new-form__location__title">Lokasi</div>

              <div class="new-form__location__container">
                <div class="new-form__location__map__container">
                  <div id="map" class="new-form__location__map"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <input type="number" name="latitude" value="-6.175389" disabled>
                  <input type="number" name="longitude" value="106.827139" disabled>
                </div>
              </div>
            </div>
            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn " id="btn-buat" type="submit">Buat Story</button>
              </span>
              <a class="btn btn-ghost" href="#/">Batal</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPagePresenter({
      view: this,
      model: StoryAPI,
    });
    this.#screenshot = new Screenshot({
      loadingElement: document.getElementById('screenshot-loading'),
      scale: 2,
    });

    this.#takenDocumentations = null;
    this.#setupScreenshotButton();
    this.#presenter.showNewFormMap();
    this.#setupForm();
    this.#setupMobileFeatures();
    this.#setupShortcuts();
  }

  #setupCamera() {
    if (this.#camera) {
      return;
    }
    this.#camera = new Camera({
      video: document.getElementById('camera-video'),
      cameraSelect: document.getElementById('camera-select'),
      canvas: document.getElementById('camera-canvas'),
    });

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();
    });
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
      locate: true,
    });

    const centerCoordinate = this.#map.getCenter();

    this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);
    const draggableMarker = this.#map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: 'true' },
    );

    draggableMarker.addEventListener('move', (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this.#map.addMapEventListener('click', (event) => {
      draggableMarker.setLatLng(event.latlng);
      this.#updateLatLngInput(event.latlng.lat, event.latlng.lng);
      event.sourceTarget.flyTo(event.latlng);
    });
  }

  #setupForm() {
    this.#form = document.getElementById('new-form');
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!this.#takenDocumentations) {
        Swal.fire({
          title: 'Dokumentasi Kosong!',
          text: 'Silakan tambahkan minimal 1 foto sebagai dokumentasi sebelum mengirim.',
          icon: 'warning',
        });
        return;
      }

      const data = {
        description: this.#form.elements.namedItem('description').value,
        photo: this.#takenDocumentations.blob,
        latitude: this.#form.elements.namedItem('latitude').value,
        longitude: this.#form.elements.namedItem('longitude').value,
      };
      console.log(data);

      await this.#presenter.postNewStory(data);
    });

    document.getElementById('documentations-input').addEventListener('change', async (event) => {
      const insertingPicturesPromises = Object.values(event.target.files).map(async (file) => {
        return await this.#addTakenPicture(file);
      });
      await Promise.all(insertingPicturesPromises);

      await this.#populateTakenPictures();
    });

    document.getElementById('documentations-input-button').addEventListener('click', () => {
      this.#form.elements.namedItem('documentations-input').click();
    });

    const cameraContainer = document.getElementById('camera-container');
    document
      .getElementById('open-documentations-camera-button')
      .addEventListener('click', async (event) => {
        cameraContainer.classList.toggle('open');

        this.#isCameraOpen = cameraContainer.classList.contains('open');
        if (this.#isCameraOpen) {
          event.currentTarget.innerHTML = '<i class="fas fa-times-circle"></i>Tutup Kamera';

          this.#setupCamera();
          this.#camera.launch();

          return;
        }

        event.currentTarget.innerHTML = '<i class="fas fa-camera"></i>Buka Kamera';
        this.#camera.stop();
      });
  }

  #setupShortcuts() {
    document
      .getElementById('focus-description')
      .addEventListener('click', () => document.getElementById('description-input').focus());
    document
      .getElementById('focus-location')
      .addEventListener('click', () =>
        document.getElementById('map').scrollIntoView({ behavior: 'smooth' }),
      );
    document
      .getElementById('take-quick-screenshot')
      .addEventListener('click', () => this.#takeScreenshot());
    document.getElementById('show-help').addEventListener('click', () => this.#showShortcutHelp());

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        this.#showShortcutHelp();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        document.getElementById('description-input').focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        this.#takeScreenshot();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        document.getElementById('new-form').dispatchEvent(new Event('submit'));
      }
    });
  }

  #showShortcutHelp() {
    const shortcuts = [
      { keys: 'Ctrl + ,', description: 'Menampilkan daftar semua shortcut yang tersedia' },
      { keys: 'Ctrl + 1', description: 'Fokus ke input deskripsi cerita' },
      { keys: 'Ctrl + 2', description: 'Scroll ke peta lokasi' },
      { keys: 'Ctrl + 3', description: 'Ambil screenshot cepat' },
      { keys: 'Ctrl + S', description: 'Submit form' },
    ];

    let helpHTML = `
      <div class="shortcut-help-overlay">
        <div class="shortcut-help-container">
          <h2>Daftar Shortcut</h2>
          <ul class="shortcut-list">
    `;

    shortcuts.forEach((shortcut) => {
      helpHTML += `
        <li>
          <span class="shortcut-keys">${shortcut.keys}</span>
          <span class="shortcut-desc">${shortcut.description}</span>
        </li>
      `;
    });

    helpHTML += `
          </ul>
          <button class="btn close-shortcut-help">Tutup</button>
        </div>
      </div>
    `;

    const existingHelp = document.querySelector('.shortcut-help-overlay');
    if (existingHelp) {
      existingHelp.remove();
      return;
    }

    document.body.insertAdjacentHTML('beforeend', helpHTML);
    document.querySelector('.close-shortcut-help').addEventListener('click', () => {
      document.querySelector('.shortcut-help-overlay').remove();
    });
  }

  async #addTakenPicture(image) {
    if (!image) {
      console.warn('⚠️ No image provided!');
      return;
    }

    let blob = image;

    if (image instanceof String) {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    const newDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
    this.#takenDocumentations = newDocumentation;
  }

  async #populateTakenPictures() {
    let html = '';

    if (this.#takenDocumentations) {
      const imageUrl = URL.createObjectURL(this.#takenDocumentations.blob);
      html = `
      <li class="new-form__documentations__outputs-item">
        <button type="button" id="delete-photo" class="new-form__documentations__outputs-item__delete-btn">
          <img src="${imageUrl}" alt="Dokumentasi">
        </button>
      </li>
    `;
    }

    document.getElementById('documentations-taken-list').innerHTML = html;

    const deleteButton = document.getElementById('delete-photo');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        this.#takenDocumentations = null;
        document.getElementById('documentations-input').value = '';
        this.#populateTakenPictures();
      });
    }
  }

  #scrollDocumentationList(direction) {
    const list = document.getElementById('documentations-taken-list');
    if (list) list.scrollBy({ left: 200 * direction, behavior: 'smooth' });
  }

  #setupMobileFeatures() {
    if (!this.#isMobile) return;

    document
      .getElementById('open-mobile-camera')
      .addEventListener('click', () =>
        document.getElementById('open-documentations-camera-button').click(),
      );

    const docsList = document.getElementById('documentations-taken-list');
    if (docsList) {
      let touchStartX = 0;
      docsList.addEventListener(
        'touchstart',
        (e) => (touchStartX = e.changedTouches[0].screenX),
        false,
      );
      docsList.addEventListener(
        'touchend',
        (e) => {
          const touchEndX = e.changedTouches[0].screenX;
          if (Math.abs(touchEndX - touchStartX) > 50) {
            this.#scrollDocumentationList(touchEndX < touchStartX ? 1 : -1);
          }
        },
        false,
      );
    }
  }

  #setupScreenshotButton() {
    document
      .getElementById('take-screenshot-button')
      .addEventListener('click', () => this.#takeScreenshot());
  }

  async #takeScreenshot() {
    try {
      if (this.#isMobile) {
        document.getElementById('open-documentations-camera-button').click();
        return;
      }

      const canvas = await this.#screenshot.take(document.getElementById('new-form'));
      canvas.toBlob(async (blob) => {
        if (blob) {
          await this.#addTakenPicture(blob);
          await this.#populateTakenPictures();
        }
      }, 'image/webp');
    } catch (error) {
      // console.error('Screenshot error:', error);
      Swal.fire({
        title: 'Gagal screenshot',
        text: 'Coba beberapa saat lagi',
        icon: 'error',
      });
    }
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem('latitude').value = latitude;
    this.#form.elements.namedItem('longitude').value = longitude;
  }

  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();
    Swal.fire({
      title: 'Story Dibuat',
      text: 'Klik OK untuk kembali ke halaman utama',
      icon: 'success',
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect setelah klik tombol OK
        window.location.href = '/';
      }
    });
  }

  storeFailed(message) {
    Swal.fire({
      title: 'Error!',
      text: 'Deskripsi tidak boleh kosong, silahkan untuk mengisi deskripsi ulang',
      icon: 'error',
    });
  }

  clearForm() {
    this.#form.reset();
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Buat Story
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit">Buat Story</button>
    `;
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  mapError(message) {
    document.getElementById('map').innerHTML = generateMapErrorTemplate(message);
  }
}
