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
      <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 rounded-xl">
            <span className="text-2xl">📰</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Local Headlines</h2>
        </div>
        
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-700">
              <span className="font-bold">Note:</span> {error}
            </p>
          </div>
        )}
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl opacity-50">📭</span>
          </div>
          <p className="text-slate-500">
            No news articles available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 rounded-xl">
          <span className="text-2xl">📰</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Local Headlines</h2>
          <p className="text-sm text-slate-500">Latest updates from the area</p>
        </div>
      </div>
      
      {/* Error notice */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-amber-700">{error}</p>
        </div>
      )}
      
      {/* News List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar -mr-2">
        <ul className="space-y-4">
          {news.map((article, index) => (
            <li key={index}>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
              >
                <h3 className="text-slate-800 font-semibold group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug">
                  {article.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                    {article.source}
                  </span>
                  {article.published_at && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{formatDate(article.published_at)}</span>
                    </>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default NewsFeed;
