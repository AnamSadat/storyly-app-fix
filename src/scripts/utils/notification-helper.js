import { convertBase64ToUint8Array } from './index';
import CONFIG from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';
import Swal from 'sweetalert2';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_KEY),
  };
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Sudah berlangganan push notification.');
    return;
  }

  console.log('Mulai berlangganan push notification...');
  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
    const { endpoint, keys } = pushSubscription.toJSON();
    console.log({ endpoint, keys });
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error('subscribe: response:', response);
      //   alert(failureSubscribeMessage);
      Swal.fire({
        title: 'Subscribe Gagal',
        text: 'Langganan push notification gagal diaktifkan. Coba ulangi!',
        icon: 'error',
      });
      console.log('di if errorny');
      // Undo subscribe to push notification
      await pushSubscription.unsubscribe();
      return;
    }

    Swal.fire({
      title: 'Subscribe Berhasil',
      text: 'Langganan push notification berhasil diaktifkan',
      icon: 'success',
    });
  } catch (error) {
    console.error('subscribe: error:', error);
    // alert(failureSubscribeMessage);
    Swal.fire({
      title: 'Subscribe Gagal',
      text: 'Langganan push notification gagal diaktifkan. Coba ulangi!',
      icon: 'error',
    });
    await pushSubscription.unsubscribe();
  }
}

export async function unsubscribe() {
  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      Swal.fire({
        title: 'Unsubscribe Gagal',
        text: 'Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.',
        icon: 'error',
      });
      return;
    }
    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });
    if (!response.ok) {
      Swal.fire({
        title: 'Unsubscribe Gagal',
        text: 'Langganan push notification gagal dinonaktifkan. Coba ulangi!',
        icon: 'error',
      });
      console.error('unsubscribe: response:', response);
      return;
    }
    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      Swal.fire({
        title: 'Unsubscribe Gagal',
        text: 'Langganan push notification gagal dinonaktifkan. Coba ulangi!',
        icon: 'error',
      });
      await subscribePushNotification({ endpoint, keys });
      return;
    }
    Swal.fire({
      title: 'Unsubscribe Berhasil',
      text: 'Langganan push notification berhasil dinonaktifkan.',
      icon: 'success',
    });
  } catch (error) {
    Swal.fire({
      title: 'Unsubscribe Gagal',
      text: 'Langganan push notification gagal dinonaktifkan. Coba ulangi!',
      icon: 'error',
    });
    console.error('unsubscribe: error:', error);
  }
}
