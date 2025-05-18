import { map, tileLayer, Icon, icon, marker, popup, latLng, control } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import CONFIG from '../config';

export default class Map {
  #zoom = 5;
  #map = null;

  static isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  static async getPlaceNameByCoordinate(latitude, longitude) {
    if (latitude == null || longitude == null) {
      return 'Lokasi tidak diketahui';
    }

    try {
      const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`);
      url.searchParams.set('key', CONFIG.MAP_SERVICE_API_KEY);
      url.searchParams.set('language', 'id');
      url.searchParams.set('limit', '1');
      const response = await fetch(url);
      const json = await response.json();

      if (!CONFIG.MAP_SERVICE_API_KEY) {
        console.warn('MAP_SERVICE_API_KEY belum diset!');
      }

      // console.log('API response:', json);
      if (!json.features || json.features.length === 0) {
        console.log('kosong?');
        return `${latitude}, ${longitude}`;
      }

      const place = json.features[0].place_name.split(', ');
      return [place.at(-2), place.at(-1)].map((name) => name).join(', ');
    } catch (error) {
      console.error('getPlaceNameByCoordinate: error:', error);
      return `${latitude}, ${longitude}`;
    }
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject('Geolocation API unsupported');
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  /**
   * Reference of using this static method:
   * https://stackoverflow.com/questions/43431550/how-can-i-invoke-asynchronous-code-within-a-constructor
   * */
  static async build(selector, options = {}) {
    if ('center' in options && options.center) {
      return new Map(selector, options);
    }

    const jakartaCoordinate = [-6.2, 106.816666];

    // Using Geolocation API
    if ('locate' in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();
        const coordinate = [position.coords.latitude, position.coords.longitude];

        return new Map(selector, {
          ...options,
          center: coordinate,
        });
      } catch (error) {
        console.error('build: error:', error);
        console.log('kesini?');
        return new Map(selector, {
          ...options,
          center: jakartaCoordinate,
        });
      }
    }

    console.log('apakah kesini?');
    return new Map(selector, {
      ...options,
      center: jakartaCoordinate,
    });
  }

  constructor(selector, options = {}) {
    this.#zoom = options.zoom ?? this.#zoom;

    const tileOsm = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    const tileSatellite = tileLayer(
      `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${CONFIG.MAP_SERVICE_API_KEY}`,
      {
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
      },
    );

    const tileHybrid = tileLayer(
      `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${CONFIG.MAP_SERVICE_API_KEY}`,
      {
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
      },
    );

    const esriSatelit = tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
      },
    );

    const container = document.querySelector(selector);

    // FIX: Properly remove previous map instance if already initialized
    if (container._leaflet_id != null) {
      const oldMap = container._leaflet_map;

      if (oldMap) {
        oldMap.remove(); // remove the map from the DOM
        console.log('ke oldmap');
      }

      console.log('baru di bawah oldmap');
      container.innerHTML = ''; // optionally clear contents
    }

    this.#map = map(document.querySelector(selector), {
      zoom: this.#zoom,
      scrollWheelZoom: false,
      layers: [tileOsm],
      dragging: true,
      tap: true,
      ...options,
    });

    container._leaflet_map = this.#map;
    // this.#map.touchZoom.enable();
    // this.#map.doubleClickZoom.enable();
    // this.#map.boxZoom.enable();
    // this.#map.keyboard.enable();

    const baseMaps = {
      OpenStreetMap: tileOsm,
      Satellite: tileSatellite,
      Hybrid: tileHybrid,
      EsriSatelit: esriSatelit,
    };

    control.layers(baseMaps).addTo(this.#map);
  }

  changeCamera(coordinate, zoomLevel = null) {
    if (!zoomLevel) {
      this.#map.setView(latLng(coordinate), this.#zoom);
      return;
    }

    this.#map.setView(latLng(coordinate), zoomLevel);
  }

  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    if (typeof markerOptions !== 'object') {
      throw new Error('markerOptions must be an object');
    }

    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });

    if (popupOptions) {
      if (typeof popupOptions !== 'object') {
        throw new Error('popupOptions must be an object');
      }

      if (!('content' in popupOptions)) {
        throw new Error('popupOptions must include `content` property.');
      }

      const newPopup = popup(coordinates, popupOptions);
      newMarker.bindPopup(newPopup);
    }
    newMarker.addTo(this.#map);
    return newMarker;
  }

  addMapEventListener(eventName, callback) {
    this.#map.addEventListener(eventName, callback);
  }

  getGeolocationErrorMessage(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Akses lokasi ditolak. Aktifkan izin lokasi di pengaturan browser.';
      case error.POSITION_UNAVAILABLE:
        return 'Lokasi tidak tersedia. Coba lagi dalam beberapa saat.';
      case error.TIMEOUT:
        return 'Permintaan lokasi terlalu lama. Periksa koneksi internet Anda.';
      case error.UNKNOWN_ERROR:
      default:
        return 'Terjadi kesalahan yang tidak diketahui saat mengambil lokasi.';
    }
  }
}
