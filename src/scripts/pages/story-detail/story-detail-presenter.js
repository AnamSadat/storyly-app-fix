import { getStoryById } from '../../data/api';
import { storyMapper } from '../../data/api-mapper';

export default class StoryDetailPresenter {
  #storyId;
  #view;
  #apiModel;
  #dbModel;

  constructor(storyId, { view, apiModel, dbModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async showStoryDetailMap() {
    this.#view.showMapLoading();

    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoryDetailMap: error:', error);
      Swal.fire({
        title: 'Gagal Memuat Peta!',
        text: 'Terjadi kesalahan saat memuat peta. Silakan coba lagi.',
        icon: 'error',
      });
      await this.#view.mapError(error.message);
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

  async notifyMe() {
    try {
      const response = await this.#apiModel.sendReportToMeViaNotification(this.#storyId);
      if (!response.ok) {
        console.error('notifyMe: response:', response);
        return;
      }
      console.log('notifyMe:', response.message);
    } catch (error) {
      console.error('notifyMe: error:', error);
    }
  }

  async saveReport() {
    try {
      const report = await this.#apiModel.getStoryById(this.#storyId);
      console.log('Isi report dari API model:', report); // Tambahkan ini
      const story = report.story;
      if (!story || Object.keys(story).length === 0) {
        throw new Error('Data laporan tidak tersedia atau rusak');
      }

      await this.#dbModel.putReport(story);
      this.#view.saveToBookmarkSuccessfully('Success to save to bookmark');
    } catch (error) {
      console.error('saveReport: error:', error);
      console.log('savereport?');
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    const isSaved = await this.#isStorySaved();

    if (isSaved) {
      this.#view.renderRemoveButton();
    } else {
      this.#view.renderSaveButton();
    }
  }

  async #isStorySaved() {
    return !!(await this.#dbModel.getReportById(this.#storyId));
  }
}
