import { getAllStories } from '../../data/api';
import { storyMapper } from '../../data/api-mapper';

export default class HomePresenter {
  #view;
  #model;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async initialGallery() {
    this.#view.showLoading();
    try {
      const response = await getAllStories();
      const story = await Promise.all(
        response.listStory.map(async (story) => {
          if (story.lat && story.lon) {
            return await storyMapper(story);
          }
          return story;
        }),
      );

      console.log(story);
      this.#view.populateStoriesList(story);
    } catch (error) {
      console.error('initialGallery: error:', error);
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
