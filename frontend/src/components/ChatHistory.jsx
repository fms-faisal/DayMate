import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../contexts/AuthContext';
import { loadChatHistory, deleteChatConversation } from '../services/chatHistoryService';

/**
 * ChatHistory Component
 * Displays past chat conversations with metadata
 */

function ChatHistory({ currentCity, currentProfile, onLoadConversation }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const loadChatHistoryFromFirebase = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const history = await loadChatHistory(user.uid);
      setChatHistory(history);
    } catch (e) {
      console.error('Failed to load chat history', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load chat history on mount and when user changes
  useEffect(() => {
    if (user) {
      loadChatHistoryFromFirebase();
    } else {
      setChatHistory([]);
      setLoading(false);
    }
  }, [user, loadChatHistoryFromFirebase]);

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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessagePreview = (messages) => {
    if (!messages || messages.length === 0) return 'No messages';
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
    if (lastUserMessage) {
      return lastUserMessage.content.length > 50
        ? lastUserMessage.content.substring(0, 50) + '...'
        : lastUserMessage.content;
    }
    return 'Conversation started';
  };

  const handleLoadConversation = (conversation) => {
    if (onLoadConversation) {
      onLoadConversation(conversation);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!user || !conversationId) return;

    try {
      const success = await deleteChatConversation(user.uid, conversationId);
      if (success) {
        // Remove from local state
        const updatedHistory = chatHistory.filter(chat => chat.id !== conversationId);
        setChatHistory(updatedHistory);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg shadow-blue-500/20">
          <span className="text-2xl">📚</span>
        </div>
        <div>
          <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">Chat History</h3>
          <p className="text-sm text-slate-500">Your previous conversations</p>
        </div>
      </div>

      {chatHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl opacity-50">💬</span>
          </div>
          <p className="text-slate-500">No chat history yet</p>
          <p className="text-sm text-slate-400 mt-1">Start a conversation to see it here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {chatHistory.map((chat, index) => (
            <div
              key={chat.timestamp || index}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleLoadConversation(chat)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-600">
                      {formatDate(chat.timestamp)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTime(chat.timestamp)}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {chat.profile || 'Standard'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📍</span>
                    <span className="font-medium text-slate-800">{chat.city}</span>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2">
                    {getMessagePreview(chat.messages)}
                  </p>

                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
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
      )}

      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <span>💾</span>
          <span>Chat history is saved locally on your device</span>
        </p>
      </div>
    </div>
  );
}

export default ChatHistory;