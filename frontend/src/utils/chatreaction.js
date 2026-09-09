import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

// emojis
export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

// toggle reaction
export function toggleReaction(reactions = {}, emoji, userId) {
  const current = { ...(reactions || {}) };
  const userKey = String(userId || 'user').toLowerCase().trim();
  const list = Array.isArray(current[emoji]) ? [...current[emoji]] : [];
  const index = list.indexOf(userKey);

  if (index > -1) {
    list.splice(index, 1);
  } else {
    list.push(userKey);
  }

  if (list.length === 0) {
    delete current[emoji];
  } else {
    current[emoji] = list;
  }

  return current;
}

// save to firestore
export async function saveReactionToFirestore(db, msg, newReactions) {
  if (!db || !msg) return;
  try {
    if (msg.firestoreDocId) {
      const docRef = doc(db, 'chats', msg.firestoreDocId);
      await updateDoc(docRef, { reactions: newReactions });
      return;
    }

    const candidateEmail = (msg.candidateEmail || '').toLowerCase().trim();
    if (candidateEmail && msg.createdAt) {
      const q = query(
        collection(db, 'chats'),
        where('candidateEmail', '==', candidateEmail),
        where('createdAt', '==', msg.createdAt)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        updateDoc(d.ref, { reactions: newReactions }).catch(() => {});
      });
    }
  } catch (err) {
    console.warn('firestore reaction error:', err);
  }
}

// save to backend
export async function saveReactionToBackend(msg, newReactions) {
  if (!msg) return;
  try {
    const msgId = msg._id || msg.id;
    if (msgId && !String(msgId).startsWith('local_')) {
      await fetch(`http://localhost:5000/api/messages/${msgId}/react`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactions: newReactions })
      });
    }
  } catch (err) {
    console.warn('backend reaction error:', err);
  }
}
