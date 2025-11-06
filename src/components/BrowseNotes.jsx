import React, { useState } from 'react';
import { BookOpen, Search, Download } from 'lucide-react';

const BrowseNotes = ({ notes = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Notes</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Explore study materials</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {searchTerm ? 'No notes match your search' : 'No notes available yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note._id || note.id}
              className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-2">
                  {note.title}
                </h3>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full whitespace-nowrap ml-2">
                  {note.subject}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                by {note.author || 'Anonymous'}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {note.downloads || 0} downloads
                </span>
                {note.fileUrl ? (
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Download
                    <Download className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-slate-400 text-sm">No file available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseNotes;