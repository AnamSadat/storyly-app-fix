import { storyMapper } from '../../data/api-mapper';
import Database from '../../data/database';
import Swal from 'sweetalert2';

export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialSavedStory() {
    this.data = await Database.getAllStory();
    const bookmarkContainer = document.getElementById('stories-list__container');
    if (this.data.length === 0) {
      bookmarkContainer.innerHTML =
        '<p class="empty-message">Tidak ada Story Collection tersimpan.</p>';
      return;
    }

    if (this.data === 1) {
      bookmarkContainer.style = 'gridTemplateColumns: repeat(1, 1fr);';
    }

    bookmarkContainer.innerHTML = this.data.map(this.renderBookmarkItem).join('');
    bookmarkContainer.addEventListener('click', async (event) => {
      if (event.target.classList.contains('delete-btn')) {
        const id = event.target.dataset.id;
        await Database.deleteSavedStory(id);
        this.initialSavedStory();
        console.log('terhapus');
        Swal.fire({
          title: 'Berhasil Hapus',
          text: `Done`,
          icon: 'success',
        });
      }
    });
  }

  renderBookmarkItem(story) {
    return `
      <div id="${story.id}" class="story-item card-list">
        <a href="#/story/${story.id}" class="card">
        <img class="story-item__image" src="${story.photoUrl}" alt="${story.name}" />
        <div class="story-item__content">
          <h3 class="story-item__title">${story.name}</h3>
          <p class="story-item__desc">${story.description}</p>
          <p class="story-item__coords">📍 Latitude: ${story.lat}, Longitude: ${story.lon}</p>
          </div>
          </a>
          <button class="delete-btn btn btn-ghost" data-id="${story.id}">Hapus</button>
     </div>
    `;
  }
}
// <div class="story-item">
//   <h3>${story.name}</h3>
//   <p>${story.description}</p>
//   <p>Latitude: ${story.lat}</p>
//   <p>Longitude: ${story.lon}</p>
//   <img src="${story.photoUrl}" alt="${story.name}" />
//   <button class="delete-btn" data-id="${story.id}">Hapus</button>
// </div>
