'use client';

import useSWR from 'swr';
import { PanelHeader } from './PanelHeader';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Article {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  timeAgo: string;
  description?: string;
  tags?: string[];
  severity?: string | null;
}

interface NewsPanelProps {
  category: 'forex' | 'fixed-income' | 'commodities' | 'crypto';
  title: string;
  maxArticles?: number;
  accentColor?: string;
}

const API_MAP: Record<string, string> = {
  forex: '/api/finance/news/forex',
  'fixed-income': '/api/finance/news/fixed-income',
  commodities: '/api/finance/news/commodities',
  crypto: '/api/finance/news/crypto',
};

export default function NewsPanel({ category, title, maxArticles = 5, accentColor = 'cyan' }: NewsPanelProps) {
  const { data, isLoading } = useSWR<{ articles: Article[]; count: number }>(
    API_MAP[category],
    fetcher,
    { refreshInterval: 60000 }
  );

  const articles = data?.articles ?? [];
  const count = data?.count ?? articles.length;

  return (
    <div className="border-b border-white/5">
      <PanelHeader title={title} live={true} count={count} accentColor={accentColor} />

      <div className="divide-y divide-white/[0.04]">
        {isLoading && !data ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-3 py-2 animate-pulse">
              <div className="h-3 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-2 bg-white/5 rounded w-1/3" />
            </div>
          ))
        ) : articles.length === 0 ? (
          <div className="px-3 py-3 text-[10px] text-gray-600 font-mono">No articles available</div>
        ) : (
          articles.slice(0, maxArticles).map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 hover:bg-white/[0.03] transition-colors cursor-pointer group"
            >
              {/* Tags row */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex gap-1 mb-1 flex-wrap">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-mono px-1 py-0.5 bg-gray-800 text-gray-500 rounded uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                  {article.severity === 'ALERT' && (
                    <span className="text-[9px] font-mono px-1 py-0.5 bg-red-900/50 text-red-400 border border-red-800/40 rounded uppercase tracking-wide">
                      ALERT
                    </span>
                  )}
                </div>
              )}

              {/* Headline */}
              <p className="text-[12px] text-gray-200 leading-[1.4] group-hover:text-white transition-colors line-clamp-2">
                {article.title}
              </p>

              {/* Source + time */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-cyan-600 font-mono truncate max-w-[80px]">{article.source}</span>
                <span className="text-[10px] text-gray-600 font-mono">
                  · {article.timeAgo || (article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '')}
                </span>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Show more link */}
      {count > maxArticles && (
        <div className="px-3 py-1.5 text-[10px] text-gray-600 font-mono hover:text-gray-400 cursor-pointer border-t border-white/5">
          +{count - maxArticles} more articles
        </div>
      )}
    </div>
  );
}
