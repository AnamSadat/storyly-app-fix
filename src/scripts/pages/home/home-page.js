import * as StoryAPI from '../../data/api';
import { storyMapper } from '../../data/api-mapper';
import {
  generateLoaderAbsoluteTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
  generateStoryItemTemplate,
  generateMapErrorTemplate,
} from '../../templates';
import HomePresenter from './home-presenter';
import Map from '../../utils/map';

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section class="map-container">
        <div class="story-list__map__container">
          <div id="map" class="story-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>
      <section class="container">
        <h1 class="tag-line">Stories</h1>
      </section>
      <section class="container">
        <div class="story-list__container">
          <div id="story-list" class="story-list__item-container"></div>
          <div id="story-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });

    await this.#presenter.initialGallery();
    await this.initialMap();
  }

  populateStoriesList(stories) {
    if (stories.length <= 0) {
      this.populateStoriesEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      if (this.#map) {
        const coordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.title };
        const popupOptions = { content: story.title };
        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(generateStoryItemTemplate(story));
    }, '');

    document.getElementById('story-list').innerHTML = `
      <div class="story-list">${html}</div>
    `;
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
  }

  showLoading() {
    document.getElementById('story-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('story-list-loading-container').innerHTML = '';
  }

  populateStoriesListError(message) {
    document.getElementById('story-list').innerHTML = generateStoriesListErrorTemplate(message);
  }

  populateStoriesEmpty() {
    document.getElementById('story-list').innerHTML = generateStoriesListEmptyTemplate();
  }

  mapError(message) {
    document.getElementById('map').innerHTML = generateMapErrorTemplate(message);
  }
}
