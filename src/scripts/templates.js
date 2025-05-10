export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="login-button" href="#/login"><button class="btn-ghost">Login</button></a></li>
    <li><a id="register-button" href="#/register"><button class="btn">Register</button></a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="new-report-button" href="#/new"><button class="btn-ghost btn-ghost-mobile">Buat Cerita<i class="fas fa-plus"></i></button></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><button class="btn"><i class="fas fa-sign-out-alt"></i> Logout</button></a></li>
  `;
}

export function generateMainNavigationListTemplate() {
  return `
    <li><a id="story-list-button" class="story-list-button" href="#/">Daftar Laporan</a></li>
    <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark">Laporan Tersimpan</a></li>
  `;
}

export function generateStoryItemTemplate({
  createdAt,
  description,
  id,
  lat,
  lon,
  name,
  photoUrl,
  placeName,
}) {
  return `
    <div id="${id}" class="story-item">
      <a href="#/story/${id}" class="card">
        <img src="${photoUrl}" alt="Story by ${name}" class="story-item__image"/>
        <div class="story-item__content">
          <h3 class="story-item__name">${name}</h3>
          <p class="story-item__description">${description}</p>
          <div class="story-item__meta">
            <span class="story-item__date">${new Date(createdAt).toLocaleDateString()}</span>
            <span class="story-item__location">📍 ${
              placeName ? placeName : 'Tidak diketahui'
            }</span>
          </div>
          <div class="story-item__location">
            <i class="fas fa-map"></i> &nbsp;${lat},&nbsp; ${lon}
          </div>
          <div class="story-item__more-info">
            <div class="story-item__author">
              Dibagikan oleh: ${name}
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
    <div id="story-list-error" class="story-list__error">
      <h2>Terjadi kesalahan pengambilan cerita</h2>
      <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

export function generateStoriesListEmptyTemplate() {
  return `
    <div id="story-list-empty" class="story-list__empty">
      <h2>Tidak ada cerita yang tersedia</h2>
      <p>Saat ini, tidak ada cerita yang bisa ditampilkan.</p>
    </div>
  `;
}

export function generateStoryDetailTemplate({
  createdAt,
  description,
  id,
  lat,
  lon,
  placeName,
  name,
  photoUrl,
  space = '&nbsp;&nbsp;&nbsp;',
}) {
  return `
    <div class="story-detail">
      <div class="story-detail__header">
        <img src="${photoUrl}" alt="Story by ${name}" class="story-detail__image">
        <h2 class="story-detail__title">${name}</h2>
        <p class="story-detail__date">${new Date(createdAt).toLocaleString()}</p>
      </div>
      <div class="story-detail__content">
        <p class="story-detail__description">${description}</p>
        <div class="story-detail__meta">
          <p><i class='fas fa-id-card-alt'></i><strong>${space} ID:</strong> ${id}</p>
          <p><i class='fas fa-map-marker-alt'></i><strong>${space}&nbsp;&nbsp;Location:</strong> ${
    placeName ? placeName : 'Tidak Diketahui'
  }</p>
          <p><i class="fas fa-map"></i><strong>${space}Latitude:</strong> ${lat}</p>
          <p><i class="fas fa-map"></i><strong>${space}Longitude:</strong> ${lon}</p>
          <p>
          </p>
        </div>
      </div>
      <div class="story-detail__body__map__container">
        <h2 class="story-detail__map__title">Lokasi</h2>
        <div class="story-detail__map__container">
          <div id="map" class="story-detail__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </div>
    </div>
  `;
}
