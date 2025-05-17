import { openDB } from 'idb';

const DATABASE_NAME = 'storyly-app';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-story';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id',
    });
  },
});

const Database = {
  async putReport(report) {
    if (!Object.hasOwn(report, 'id')) {
      throw new Error('`id` is required to save.');
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, report);
  },

  async getReportById(id) {
    if (!id) {
      throw new Error('`id` is required.');
    }
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async getAllStory() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async deleteSavedStory(id) {
    if (!id) {
      console.error('Error: ID tidak boleh kosong.');
      return;
    }

    const db = await dbPromise;
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite'); // Perbaikan di sini
    const store = tx.objectStore(OBJECT_STORE_NAME); // Perbaikan di sini

    try {
      await store.delete(id);
      console.log('Story berhasil dihapus:', id);
    } catch (error) {
      console.error('Gagal menghapus story:', error);
    }

    return tx.done;
  },
};

export default Database;
