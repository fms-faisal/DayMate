/**
 * NewsFeed Component
 * Displays local news articles in a clean list format
 */

function NewsFeed({ news, error }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show error/empty state
  if (!news || news.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📰</span>
          <h2 className="text-xl font-bold text-gray-800">Local Headlines</h2>
        </div>
        
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Note:</span> {error}
            </p>
          </div>
        )}
        
        <p className="text-gray-500 text-sm">
          No news articles available at the moment. Your daily plan will still include helpful recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg card-hover">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📰</span>
        <h2 className="text-xl font-bold text-gray-800">Local Headlines</h2>
      </div>
      
      {/* Error notice if present but we still have fallback news */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4">
          <p className="text-xs text-yellow-700">{error}</p>
        </div>
      )}
      
      {/* News List */}
      <ul className="space-y-4">
        {news.map((article, index) => (
          <li 
            key={index}
            className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
          >
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <h3 className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors line-clamp-2">
                {article.title}
              </h3>
              {article.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {article.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <span className="font-medium text-blue-500">{article.source}</span>
                {article.published_at && (
                  <>
                    <span>•</span>
                    <span>{formatDate(article.published_at)}</span>
                  </>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NewsFeed;
