import api from './api';

// Convert base64 VAPID key to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported in this browser');
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('✅ Service Worker registered');
    return reg;
  } catch (err) {
    console.error('❌ Service Worker registration failed:', err);
    return null;
  }
};

export const subscribeToPush = async () => {
  try {
    // Get VAPID public key from server
    const { data } = await api.get('/push/vapid-public-key');
    const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

    const reg = await navigator.serviceWorker.ready;

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('🔕 Push notification permission denied');
      return false;
    }

    // Subscribe
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Send subscription to server
    await api.post('/push/subscribe', subscription);
    console.log('✅ Push notifications enabled');
    return true;
  } catch (err) {
    console.error('❌ Push subscription failed:', err);
    return false;
  }
};

export const unsubscribeFromPush = async () => {
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await api.delete('/push/unsubscribe');
    }
    return true;
  } catch (err) {
    console.error('❌ Unsubscribe failed:', err);
    return false;
  }
};

export const isPushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window;

export const isPushSubscribed = async () => {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
};