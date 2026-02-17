'use client';

import { Bookmark } from '@/types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
}

export default function BookmarkList({ bookmarks, onDelete }: BookmarkListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No bookmarks yet
        </h3>
        <p className="mt-2 text-gray-500">
          Add your first bookmark above to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Your Bookmarks ({bookmarks.length})
        </h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {bookmarks.map((bookmark) => (
          <li
            key={bookmark.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 min-w-0">
                <div className="flex-shrink-0">
                  {getFaviconUrl(bookmark.url) ? (
                    <img
                      src={getFaviconUrl(bookmark.url)!}
                      alt=""
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                  >
                    {bookmark.title}
                  </a>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-blue-500 truncate block"
                  >
                    {bookmark.url}
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-4 ml-4">
                <span className="text-xs text-gray-400 hidden sm:block">
                  {formatDate(bookmark.created_at)}
                </span>
                <button
                  onClick={() => onDelete(bookmark.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50"
                  title="Delete bookmark"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
