import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

let storageInstance = null;

// storage
function getChatStorage() {
  if (!storageInstance) {
    try {
      storageInstance = getStorage();
    } catch (e) {}
  }
  return storageInstance;
}

// file size
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// check image
export function isImageFile(type, url) {
  if (type && type.startsWith('image/')) return true;
  if (url && (url.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url))) return true;
  return false;
}

// read file
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// upload file
export async function uploadChatFile(file, options = {}) {
  if (!file) return null;

  const fileName = file.name || 'file';
  const fileType = file.type || 'application/octet-stream';
  const fileSize = file.size || 0;
  const createdAt = Date.now();
  const folder = options.folder || 'general';

  let fileUrl = '';

  // upload to firebase
  try {
    const storage = getChatStorage();
    if (storage) {
      const storageRef = ref(storage, `chat_files/${folder}/${createdAt}_${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(snapshot.ref);
    }
  } catch (err) {
    console.warn('firebase storage upload fallback:', err);
  }

  // fallback url
  if (!fileUrl) {
    try {
      fileUrl = await readFileAsDataUrl(file);
    } catch (e) {
      console.warn('failed to read file:', e);
    }
  }

  const fileData = {
    url: fileUrl,
    name: fileName,
    type: fileType,
    size: fileSize,
    createdAt
  };

  // save file record
  if (db && options.chatId) {
    try {
      const filesRef = collection(db, 'chat_files');
      await addDoc(filesRef, {
        ...fileData,
        chatId: options.chatId,
        senderRole: options.senderRole || 'user',
        candidateEmail: options.candidateEmail || ''
      });
    } catch (e) {}
  }

  return fileData;
}

// download file
export function downloadChatFile(url, fileName) {
  if (!url) return;

  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'attachment';
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    window.open(url, '_blank');
  }
}

// open file
export function openFilePreview(url, fileName) {
  if (!url) return;
  if (url.startsWith('data:')) {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(
        `<html><head><title>${fileName || 'preview'}</title><style>body{margin:0;background:#0b0f19;display:flex;align-items:center;justify-content:center;height:100vh;}img{max-width:95vw;max-height:95vh;object-fit:contain;box-shadow:0 10px 30px rgba(0,0,0,0.5);border-radius:8px;}</style></head><body><img src="${url}" alt="${fileName || 'preview'}" /></body></html>`
      );
      win.document.close();
    }
  } else {
    window.open(url, '_blank');
  }
}

// get files
export function extractFilesFromMessages(messages) {
  if (!Array.isArray(messages)) return [];

  const files = [];
  messages.forEach((msg) => {
    if (msg.file && msg.file.url) {
      files.push({
        id: msg.id || `${msg.createdAt}_${msg.file.name}`,
        url: msg.file.url,
        name: msg.file.name || 'attachment',
        type: msg.file.type || '',
        size: msg.file.size || 0,
        senderRole: msg.senderRole,
        senderName: msg.senderName,
        time: msg.time || msg.date || '',
        createdAt: msg.createdAt || 0
      });
    }
  });

  return files.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
