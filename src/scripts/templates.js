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
    <li><a id="login-button" href="#/login"><button class="btn-ghost">Login</button></a></li>
    <li><a id="register-button" href="#/register"><button class="btn">Register</button></a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li><a href="#/savedstory" class="nav-link tersimpan">Tersimpan</a></li>
    <li><a href="#/about" class="nav-link">About</a></li>
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="new-report-button" href="#/new"><button class="btn-ghost btn-ghost-mobile">Buat Cerita<i class="fas fa-plus"></i></button></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><button class="btn">Logout <i class="fas fa-sign-out-alt"></i></button></a></li>
  `;
}

export function generateMainNavigationListTemplate() {
  return `
  <li><a id="cerita-button" class="story-button" href="#/savedstor">Story Save</a></li>
  <li><a id="story-list-button" class="story-list-button" href="#/">About</a></li>
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
  if (lat === null) {
    lat = 'Tidak Diketahui';
  }
  if (lon === null) {
    lon = 'Tidak Diketahui';
  }
  return `
    <div id="${id}" class="story-item">
      <a href="#/story/${id}" class="card">
        <img src="${photoUrl}" alt="Story by ${name}" class="story-item__image"/>
        <div class="story-item__content">
          <h3 class="story-item__name">${name}</h3>
          <p class="story-item__description">${description}</p>
          <div class="story-item__meta">
            <span class="story-item__date">${new Date(createdAt).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</span>
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
  if (lat === null) {
    lat = 'Tidak Diketahui';
  }
  if (lon === null) {
    lon = 'Tidak Diketahui';
  }
  return `
    <div class="story-detail">
    <img src="${photoUrl}" alt="Story by ${name}" class="story-detail__image">
    <div class="story-detail__header">
        <div class="label-name">
          <h2 class="story-detail__title">${name}</h2>
          <p class="story-detail__date">${new Date(createdAt).toLocaleString()}</p>
        </div>
        <div class="report-detail__actions__buttons">
          <div id="save-actions-container"></div>
          
        </div>
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
      <div id="title-map" class="story-detail__body__map__container">
        <h2 class="story-detail__map__title">Lokasi</h2>
        <div class="story-detail__map__container">
          <div id="map" class="story-detail__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </div>
    </div>
  `;
}

export function generateMapErrorTemplate(message) {
  message = 'Coba segarkan halaman atau periksa koneksi Anda dan izin akses.';
  return `
    <div id="id-map-error" class="map-error">
      <i class='fas fa-exclamation-circle'></i>
      <h3>Gagal Memuat Peta</h3>
      <p>${message}</p>
      <p><a href="#" id="request-location">Izinkan Akses Lokasi</a></p>
    </div>
  `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button scribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button scribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateSaveReportButtonTemplate() {
  return `
    <button id="story-detail-save" class="btn btn-transparent btn-transparent-save">
      Simpan Story <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function generateRemoveReportButtonTemplate() {
  return `
    <button id="story-detail-remove" class="btn btn-transparent btn-transparent-remove">
      Batal Simpan <i class="fas fa-bookmark"></i>
    </button>
  `;
}
