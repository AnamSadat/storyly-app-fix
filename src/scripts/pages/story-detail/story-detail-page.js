import { parseActivePathname } from '../../routes/url-parser';
import StoryDetailPresenter from './story-detail-presenter';
import {
  generateLoaderAbsoluteTemplate,
  generateStoriesListErrorTemplate,
  generateStoryDetailTemplate,
} from '../../templates';
import Map from '../../utils/map';

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
    });

    this.#presenter.showStoryDetail();
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
  }

  populateStoryDetailError(error) {
    document.getElementById('story-detail').innerHTML = generateStoriesListErrorTemplate(error);
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

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
    });
  }
}
