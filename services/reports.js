import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const REPORTS_COLLECTION = 'reports';

export const REPORT_REASONS = [
  { id: 'spam', label: 'Spam ou publicité', icon: 'ban-outline' },
  { id: 'harassment', label: 'Harcèlement ou intimidation', icon: 'alert-circle-outline' },
  { id: 'hate', label: 'Contenu haineux ou discriminatoire', icon: 'hand-left-outline' },
  { id: 'violence', label: 'Violence ou menace', icon: 'warning-outline' },
  { id: 'impersonation', label: "Usurpation d'identité", icon: 'person-remove-outline' },
  { id: 'sexual', label: 'Contenu sexuel inapproprié', icon: 'eye-off-outline' },
  { id: 'other', label: 'Autre', icon: 'ellipsis-horizontal-circle-outline' },
];

export const submitReport = async ({
  reporterId,
  reportedUserId,
  messageId = null,
  chatId = null,
  reason,
}) => {
  if (!reporterId || !reportedUserId || !reason) {
    throw new Error('Données de signalement incomplètes.');
  }
  await addDoc(collection(db, REPORTS_COLLECTION), {
    reporterId,
    reportedUserId,
    messageId,
    chatId,
    reason,
    status: 'pending',
    createdAt: serverTimestamp(),
    createdAtMs: Date.now(),
  });
};
