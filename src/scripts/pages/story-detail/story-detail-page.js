import { parseActivePathname } from '../../routes/url-parser';
import StoryDetailPresenter from './story-detail-presenter';
import {
  generateLoaderAbsoluteTemplate,
  generateStoriesListErrorTemplate,
  generateStoryDetailTemplate,
  generateSaveReportButtonTemplate,
} from '../../templates';
import Map from '../../utils/map';
import * as StorylyAppApi from '../../data/api';
import Database from '../../data/database';
import Swal from 'sweetalert2';

export default class StoryDetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="story-detail__container">
          <div id="story-detail" class="story-detail"></div>
          <div id="story-detail-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: StorylyAppApi,
      dbModel: Database,
    });

    this.#presenter.showStoryDetail();
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
    });
  }

  async populateStoryDetail(story) {
    document.getElementById('story-detail').innerHTML = generateStoryDetailTemplate(story);

    if (story.placeName) {
      document.querySelector('.story-detail__body__map__container').style.display = 'block';
      await this.#presenter.showStoryDetailMap();

      if (this.#map) {
        const storyCoordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.placeName };
        const popupOptions = { content: story.description };

        this.#map.changeCamera(storyCoordinate);
        this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
      }
    }

    this.#presenter.showSaveButton();
  }

  populateStoryDetailError(error) {
    document.getElementById('story-detail').innerHTML = generateStoriesListErrorTemplate(error);
  }

  addNotifyMeEventListener() {
    document.getElementById('story-detail-notify-me').addEventListener('click', () => {
      console.log('addeven');
      this.#presenter.notifyMe();
    });
  }

  renderSaveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateSaveReportButtonTemplate();

    document.getElementById('story-detail-save').addEventListener('click', async () => {
      event.preventDefault();
      await this.#presenter.saveReport();
      await this.#presenter.showSaveButton();
      console.log('simpan');
    });
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }
  saveToBookmarkFailed(message) {
    Swal.fire({
      title: 'Gagal Simpan',
      text: `${message}`,
      icon: 'error',
    });
  }

  renderRemoveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateRemoveReportButtonTemplate();

    document.getElementById('story-detail-remove').addEventListener('click', async () => {
      alert('Fitur simpan laporan akan segera hadir!');
    });
  }

  showStoryDetailLoading() {
    document.getElementById('story-detail-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideStoryDetailLoading() {
    document.getElementById('story-detail-loading-container').innerHTML = '';
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }
}
