import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from '../../templates';
import BookmarkPresenter from './story-tersimpan-presenter';
import Database from '../../data/database';

export default class BookmarkPage {
  #presenter;

  async render() {
    return `
      <section class="content">
        <h1 class="section-title">Daftar Story Tersimpan</h1>
        <div id="stories-list__container" class="stories-list__container">
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });
    await this.#presenter.initialSavedStory();
  }

  populateBookmarkedReports(message, reports) {
    if (reports.length <= 0) {
      this.populateBookmarkedReportsListEmpty();
      console.log('isemprty?');
      return;
    }

    const html = reports.reduce((accumulator, report) => {
      return accumulator.concat(
        generateStoryItemTemplate({
          ...report,
          placeNameLocation: report.location.placeName,
          reporterName: report.reporter.name,
        }),
      );
    }, '');

    document.getElementById('story-list').innerHTML = `
      <div class="reports-list">${html}</div>
    `;
  }

  populateBookmarkedReportsListEmpty() {
    document.getElementById('reports-list').innerHTML = generateStoriesListEmptyTemplate();
    console.log('empty?');
  }

  populateBookmarkedReportsError(message) {
    document.getElementById('reports-list').innerHTML = generateStoriesListErrorTemplate(message);
  }

  showReportsListLoading() {
    document.getElementById('reports-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideReportsListLoading() {
    document.getElementById('reports-list-loading-container').innerHTML = '';
  }
}
