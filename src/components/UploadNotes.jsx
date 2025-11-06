import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';

const UploadNotes = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('subject', subject);

      await axios.post('http://localhost:5001/api/notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Notes uploaded successfully!');
      setFile(null);
      setTitle('');
      setSubject('');
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload notes');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
          <Upload className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Notes</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Share your study materials</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Note Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
            placeholder="e.g., Chapter 5: Thermodynamics"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Subject
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
          >
            <option value="">Select subject</option>
            <option value="mathematics">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="computer-science">Computer Science</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Upload File
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl transition-all text-slate-600 dark:text-slate-400"
            accept=".pdf,.doc,.docx,.txt"
          />
          {file && (
            <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
              Selected: {file.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || !file || !title}
          className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all"
        >
          {uploading ? 'Uploading...' : 'Upload Notes'}
        </button>
      </form>
    </div>
  );
};

export default UploadNotes;