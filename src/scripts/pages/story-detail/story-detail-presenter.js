import { getStoryById } from '../../data/api';
import { storyMapper } from '../../data/api-mapper';

export default class StoryDetailPresenter {
  #storyId;
  #view;

  constructor(storyId, { view }) {
    this.#storyId = storyId;
    this.#view = view;
  }

  async showStoryDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoryDetailMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showStoryDetailLoading();
    try {
      const response = await getStoryById(this.#storyId);
      if (!response.story.lat && !response.story.lon) {
        this.#view.populateStoryDetail(response.story);
        return;
      }
      const story = await storyMapper(response.story);

      this.#view.populateStoryDetail(story);
    } catch (error) {
      console.error(error);
      this.#view.populateStoryDetailError(error.message);
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }
}
