import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../contexts/AuthContext';
import { loadChatHistory, deleteChatConversation, saveChatConversation } from '../services/chatHistoryService';

/**
 * ChatHistoryModal Component
 * Modal to display and manage chat history from the homepage
 */

function ChatHistoryModal({ isOpen, onClose }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user } = useContext(AuthContext);

  const loadChatHistoryFromFirebase = useCallback(async () => {
    console.log('loadChatHistoryFromFirebase called, user:', user);
    if (!user) {
      console.log('No user, returning early');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading chat history for user:', user.uid);
      const history = await loadChatHistory(user.uid);
      console.log('Loaded history from Firebase:', history);

      // If no Firebase history, try to migrate from localStorage
      if (history.length === 0) {
        console.log('No Firebase history, checking localStorage...');
        const localHistory = localStorage.getItem('daymate_chat_history');
        if (localHistory) {
          const parsedHistory = JSON.parse(localHistory);
          console.log('Found localStorage history:', parsedHistory);

          // Migrate to Firebase
          for (const chat of parsedHistory) {
            await saveChatConversation(user.uid, {
              timestamp: chat.timestamp,
              city: chat.city,
              profile: chat.profile || 'standard',
              messages: chat.messages,
              weather: chat.weather,
              news: chat.news
            });
          }

          // Reload from Firebase after migration
          const migratedHistory = await loadChatHistory(user.uid);
          console.log('Migrated history:', migratedHistory);
          setChatHistory(migratedHistory);

          // Clear localStorage after successful migration
          localStorage.removeItem('daymate_chat_history');
          console.log('Migration complete, cleared localStorage');
        } else {
          setChatHistory([]);
        }
      } else {
        setChatHistory(history);
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
      setChatHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load chat history when modal opens
  useEffect(() => {
    console.log('ChatHistoryModal useEffect triggered, isOpen:', isOpen, 'user:', user, 'user.uid:', user?.uid);
    if (isOpen && user) {
      loadChatHistoryFromFirebase();
    } else if (isOpen && !user) {
      console.log('Modal opened but no user authenticated');
      setLoading(false);
    }
  }, [isOpen, user, loadChatHistoryFromFirebase]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMessagePreview = (messages) => {
    if (!messages || messages.length === 0) return 'No messages';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content?.substring(0, 100) + (lastMessage.content?.length > 100 ? '...' : '');
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!user || !conversationId) return;

    try {
      const success = await deleteChatConversation(user.uid, conversationId);
      if (success) {
        // Remove from local state
        const updatedHistory = chatHistory.filter(chat => chat.id !== conversationId);
        setChatHistory(updatedHistory);
        // If the deleted conversation was selected, go back to list
        if (selectedConversation && selectedConversation.id === conversationId) {
          setSelectedConversation(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">
                {selectedConversation ? 'Conversation Details' : 'Chat History'}
              </h2>
              <p className="text-sm text-slate-500">
                {selectedConversation ? 'Full conversation messages' : 'Your previous conversations'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedConversation && (
              <button
                onClick={handleBackToList}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Back to list"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {selectedConversation ? (
            /* Detailed Conversation View */
            <div className="space-y-4">
              {/* Conversation Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span className="font-medium">{selectedConversation.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👤</span>
                    <span className="capitalize">{selectedConversation.profile}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{formatDate(selectedConversation.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🕐</span>
                    <span>{formatTime(selectedConversation.timestamp)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <span>💬</span>
                  <span>{selectedConversation.messages?.length || 0} messages</span>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {selectedConversation.messages?.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-700 rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delete Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleDeleteConversation(selectedConversation.id)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Conversation
                </button>
              </div>
            </div>
          ) : (
            /* List View */
            loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : !user ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔐</div>
                <p className="text-slate-500">Sign in required</p>
                <p className="text-sm text-slate-400 mt-1">Please sign in with Google to view your chat history</p>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-slate-500">No chat history yet</p>
                <p className="text-sm text-slate-400 mt-1">Start a conversation to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectConversation(chat)}
                    className="group bg-slate-50 hover:bg-slate-100 rounded-xl p-4 transition-colors cursor-pointer border border-slate-200 hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-slate-600">
                            {formatDate(chat.timestamp)}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-sm text-slate-500">
                            {formatTime(chat.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <span>📍</span>
                            <span className="font-medium">{chat.city}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <span>👤</span>
                            <span className="capitalize">{chat.profile}</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-700 line-clamp-2 mb-2">
                          {getMessagePreview(chat.messages)}
                        </p>

                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <span>💬</span>
                          <span>{chat.messages?.length || 0} messages</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2"
                        title="Delete conversation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHistoryModal;