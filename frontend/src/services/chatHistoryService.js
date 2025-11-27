/**
 * Chat History Service
 * Handles saving and loading chat conversations from Firebase Firestore
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Helper function to add timeout to promises
 */
function withTimeout(promise, ms = 5000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Save a chat conversation to Firestore
 * @param {string} userId - Firebase user UID
 * @param {object} conversation - Chat conversation object
 * @returns {Promise<string|null>} - Document ID if successful, null if failed
 */
export async function saveChatConversation(userId, conversation) {
  if (!userId) {
    console.error('No user ID provided');
    return null;
  }

  console.log('saveChatConversation called with userId:', userId, 'conversation:', conversation);

  try {
    const chatRef = collection(db, 'users', userId, 'chatHistory');
    console.log('Chat collection reference:', chatRef);

    const docRef = await withTimeout(addDoc(chatRef, {
      ...conversation,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));

    console.log('Chat conversation saved to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat conversation:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}

/**
 * Load chat history from Firestore
 * @param {string} userId - Firebase user UID
 * @param {number} limitCount - Maximum number of conversations to load (default: 50)
 * @returns {Promise<Array>} - Array of chat conversations
 */
export async function loadChatHistory(userId, limitCount = 50) {
  if (!userId) {
    console.error('No user ID provided');
    return [];
  }

  console.log('loadChatHistory called with userId:', userId);

  try {
    const chatRef = collection(db, 'users', userId, 'chatHistory');
    console.log('Chat collection reference:', chatRef);
    const q = query(
      chatRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    console.log('Executing query...');
    const querySnapshot = await withTimeout(getDocs(q));
    console.log('Query snapshot received, docs count:', querySnapshot.size);
    const conversations = [];

    querySnapshot.forEach((doc) => {
      console.log('Processing doc:', doc.id, doc.data());
      conversations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`Loaded ${conversations.length} chat conversations from Firestore:`, conversations);
    return conversations;
  } catch (error) {
    console.error('Error loading chat history:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return [];
  }
}

/**
 * Delete a chat conversation from Firestore
 * @param {string} userId - Firebase user UID
 * @param {string} conversationId - ID of the conversation to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteChatConversation(userId, conversationId) {
  if (!userId || !conversationId) {
    console.error('User ID and conversation ID are required');
    return false;
  }

  try {
    const conversationRef = doc(db, 'users', userId, 'chatHistory', conversationId);
    await withTimeout(deleteDoc(conversationRef));

    console.log('Chat conversation deleted from Firestore');
    return true;
  } catch (error) {
    console.error('Error deleting chat conversation:', error);
    return false;
  }
}

/**
 * Update a chat conversation in Firestore (add new messages)
 * @param {string} userId - Firebase user UID
 * @param {string} conversationId - ID of the conversation to update
 * @param {Array} newMessages - New messages to add
 * @returns {Promise<boolean>} - Success status
 */
export async function updateChatConversation(userId, conversationId, newMessages) {
  if (!userId || !conversationId) {
    console.error('User ID and conversation ID are required');
    return false;
  }

  try {
    const conversationRef = doc(db, 'users', userId, 'chatHistory', conversationId);

    // Get current conversation
    const currentDoc = await withTimeout(getDocs(query(collection(db, 'users', userId, 'chatHistory'), where('__name__', '==', conversationId))));
    let currentMessages = [];

    currentDoc.forEach((doc) => {
      currentMessages = doc.data().messages || [];
    });

    // Add new messages
    const updatedMessages = [...currentMessages, ...newMessages];

    await withTimeout(updateDoc(conversationRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp()
    }));

    console.log('Chat conversation updated in Firestore');
    return true;
  } catch (error) {
    console.error('Error updating chat conversation:', error);
    return false;
  }
}