/**
 * PlanDisplay Component
 * Displays the AI-generated daily plan with formatted content
 */

function PlanDisplay({ plan, city, error }) {
  if (!plan) return null;

  // Parse inline markdown (bold, italic)
  const parseInlineMarkdown = (text) => {
    // Handle **bold** text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Simple markdown-like formatting
  const formatPlan = (text) => {
    // Split by lines and process
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-700 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-bold text-gray-800 mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      
      // Bullet points with * (markdown style)
      if (line.trimStart().startsWith('* ')) {
        const content = line.replace(/^\s*\*\s/, '');
        return (
          <div key={index} className="flex items-start gap-3 my-2 p-3 bg-gray-50 rounded-lg">
            <span className="text-purple-500 mt-0.5">●</span>
            <p className="text-gray-700 flex-1">{parseInlineMarkdown(content)}</p>
          </div>
        );
      }
      
      // Bullet points with - or •
      if (line.trimStart().startsWith('- ') || line.trimStart().startsWith('• ')) {
        const content = line.replace(/^\s*[-•]\s/, '');
        return (
          <div key={index} className="flex items-start gap-3 my-2 p-3 bg-gray-50 rounded-lg">
            <span className="text-purple-500 mt-0.5">●</span>
            <p className="text-gray-700 flex-1">{parseInlineMarkdown(content)}</p>
          </div>
        );
      }
      
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          return (
            <div key={index} className="flex items-start gap-3 my-2 p-3 bg-gray-50 rounded-lg">
              <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {match[1]}
              </span>
              <p className="text-gray-700 flex-1">{parseInlineMarkdown(match[2])}</p>
            </div>
          );
        }
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="text-gray-600 my-2">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-purple-500 card-hover">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Your Day in {city}</h2>
          <p className="text-sm text-gray-500">Here&apos;s what I&apos;d recommend for today!</p>
        </div>
      </div>
      
      {/* Error notice if AI fell back to basic recommendations */}
      {error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Info:</span> {error}
          </p>
        </div>
      )}
      
      {/* Plan Content */}
      <div className="plan-content text-gray-600 leading-relaxed">
        {formatPlan(plan)}
      </div>
      
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <span>🎯</span>
          <span>Personalized based on real-time weather &amp; local news</span>
        </p>
      </div>
    </div>
  );
}

export default PlanDisplay;
