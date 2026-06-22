import { db } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface TransactionDoc {
  id: string;
  userId: string;
  amountIn: number;
  amountOut: number;
  currencyIn: string;
  currencyOut: string;
  method: 'mpesa' | 'airtel';
  status: 'AWAITING_PAYMENT' | 'PAYMENT_UNDER_REVIEW' | 'PAYMENT_CONFIRMED' | 'COMPLETED' | 'REJECTED' | 'ERROR';
  timestamp: number; // UTC ms
  recipientAddress: string;
}

export async function createTransaction(tx: TransactionDoc) {
  const docRef = doc(db, 'transactions', tx.id);
  await setDoc(docRef, tx);
}

export async function getUserTransactions(userId: string): Promise<TransactionDoc[]> {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const list: TransactionDoc[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as TransactionDoc);
    });
    // Sort locally by timestamp descending
    return list.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
}

export async function getTransactionById(txId: string): Promise<TransactionDoc | null> {
  try {
    const docRef = doc(db, 'transactions', txId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as TransactionDoc;
    }
    return null;
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    return null;
  }
}
