/**
 * Firestore Service
 * Handles saving and loading user preferences from Firebase Firestore
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
 * Save user preferences to Firestore
 * @param {string} userId - Firebase user UID
 * @param {object} preferences - User preferences object
 * @returns {Promise<boolean>} - Success status
 */
export async function saveUserPreferences(userId, preferences) {
  if (!userId) {
    console.error('No user ID provided');
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    
    await withTimeout(setDoc(userRef, {
      preferences: {
        ...preferences,
        updatedAt: serverTimestamp()
      },
      lastActive: serverTimestamp()
    }, { merge: true }));

    console.log('Preferences saved to Firestore');
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
}

/**
 * Load user preferences from Firestore
 * @param {string} userId - Firebase user UID
 * @returns {Promise<object|null>} - User preferences or null
 */
export async function loadUserPreferences(userId) {
  if (!userId) {
    console.error('No user ID provided');
    return null;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await withTimeout(getDoc(userRef));

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Preferences loaded from Firestore');
      return data.preferences || null;
    } else {
      console.log('No preferences found in Firestore');
      return null;
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
    return null;
  }
}

/**
 * Update specific preference fields
 * @param {string} userId - Firebase user UID
 * @param {object} updates - Partial preferences to update
 * @returns {Promise<boolean>} - Success status
 */
export async function updateUserPreferences(userId, updates) {
  if (!userId) {
    console.error('No user ID provided');
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    
    // Build the update object with dot notation for nested fields
    const updateData = {};
    Object.keys(updates).forEach(key => {
      updateData[`preferences.${key}`] = updates[key];
    });
    updateData['preferences.updatedAt'] = serverTimestamp();
    updateData['lastActive'] = serverTimestamp();

    await updateDoc(userRef, updateData);
    console.log('Preferences updated in Firestore');
    return true;
  } catch (error) {
    // If document doesn't exist, create it
    if (error.code === 'not-found') {
      return saveUserPreferences(userId, updates);
    }
    console.error('Error updating preferences:', error);
    return false;
  }
}

/**
 * Save user's last searched city
 * @param {string} userId - Firebase user UID
 * @param {string} city - City name
 * @returns {Promise<boolean>} - Success status
 */
export async function saveLastCity(userId, city) {
  if (!userId || !city) return false;

  try {
    const userRef = doc(db, 'users', userId);
    await withTimeout(setDoc(userRef, {
      lastCity: city,
      lastActive: serverTimestamp()
    }, { merge: true }));
    return true;
  } catch (error) {
    console.error('Error saving last city:', error);
    return false;
  }
}

/**
 * Get user's last searched city
 * @param {string} userId - Firebase user UID
 * @returns {Promise<string|null>} - City name or null
 */
export async function getLastCity(userId) {
  if (!userId) return null;

  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await withTimeout(getDoc(userRef));

    if (docSnap.exists()) {
      return docSnap.data().lastCity || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting last city:', error);
    return null;
  }
}
