import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

// format the current date and time
function getFormattedDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// listen for notifications in realtime
export function subscribeNotifications(recipient, onUpdate) {
  // check if database and recipient are available
  if (!db || !recipient) {
    return () => { };
  }

  try {
    // create notifications query
    const notifsRef = collection(db, 'notifications');
    const q = query(notifsRef, where('recipient', 'in', [recipient, 'all']));

    // listen for realtime changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // get notification data
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      // sort notifications from newest to oldest
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      // send updated notifications to the component
      onUpdate(list);
    }, (error) => {
      // handle realtime notification errors
      console.warn('realtime notifications error:', error);
    });

    return unsubscribe;
  } catch (err) {
    // handle subscription errors
    console.warn('failed to subscribe to notifications:', err);
    return () => { };
  }
}

// send a new notification to firebase
export async function sendNotification({ title, message, recipient, type = 'general' }) {
  // check if database and recipient are available
  if (!db || !recipient) {
    return null;
  }

  try {
    // create notification collection
    const notifsRef = collection(db, 'notifications');

    // add notification to firestore
    const docRef = await addDoc(notifsRef, {
      title,
      message,
      recipient,
      type,
      read: false,
      date: getFormattedDate(),
      createdAt: Date.now()
    });

    // return notification id
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:new-notification', {
        detail: { title, message, recipient, type, date: getFormattedDate(), read: false }
      }));
    }
    return docRef.id;
  } catch (err) {
    // handle notification error
    console.warn('failed to send notification:', err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:new-notification', {
        detail: { title, message, recipient, type, date: getFormattedDate(), read: false }
      }));
    }
    return null;
  }
}

// change notification read status
export async function toggleNotificationRead(id, currentRead) {
  // check if database and id are available
  if (!db || !id) {
    return;
  }

  try {
    // update notification read status
    const notifRef = doc(db, 'notifications', id);
    await updateDoc(notifRef, {
      read: !currentRead
    });
  } catch (err) {
    // handle update error
    console.warn('failed to update notification:', err);
  }
}

// mark all notifications as read
export async function markAllRead(notifications) {
  // check if database and notifications are available
  if (!db || !Array.isArray(notifications)) {
    return;
  }

  try {
    // find unread notifications
    const unread = notifications.filter((n) => !n.read && n.id);

    // update all unread notifications
    const updates = unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true }));
    await Promise.all(updates);
  } catch (err) {
    // handle mark all read error
    console.warn('failed to mark all as read:', err);
  }
}

// delete a notification
export async function deleteNotification(id) {
  // check if database and id are available
  if (!db || !id) {
    return;
  }

  try {
    // delete notification from firestore
    const notifRef = doc(db, 'notifications', id);
    await deleteDoc(notifRef);
  } catch (err) {
    // handle delete error
    console.warn('failed to delete notification:', err);
  }
}
