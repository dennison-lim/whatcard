import React, { useState, useEffect, useCallback } from 'react';
import type { AppUser } from '../types';
import api from '../services/api';

interface LoginScreenProps {
  onSelectUser: (userId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSelectUser }) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const user = await api.createUser(newName.trim());
      setNewName('');
      onSelectUser(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  }, [newName, creating, onSelectUser]);

  const handleDelete = useCallback(async (userId: string, userName: string) => {
    if (!window.confirm(`Delete "${userName}" and all their data? This cannot be undone.`)) return;
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="w-full max-w-sm space-y-10">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-9 h-9">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">WhatCard</h1>
          <p className="text-sm text-neutral-500 font-medium">Choose a profile to get started</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl px-5 py-3 text-center">
            {error}
          </div>
        )}

        {/* User List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-neutral-500 mt-4 font-bold uppercase tracking-widest">Loading users...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.length > 0 ? users.map(user => (
              <div
                key={user.id}
                className="group flex items-center justify-between bg-neutral-900 border border-white/5 rounded-2xl p-5 hover:bg-neutral-800 transition-colors cursor-pointer"
                onClick={() => onSelectUser(user.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center text-lg font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">{user.name}</div>
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(user.id, user.name); }}
                  className="p-2.5 text-neutral-600 hover:text-red-400 bg-white/5 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete user"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )) : (
              <p className="text-xs text-neutral-600 text-center py-8 italic">No users yet. Create one below.</p>
            )}
          </div>
        )}

        {/* Create User */}
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Your name"
            className="flex-1 bg-neutral-900 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder-neutral-600 outline-none focus:border-blue-500 transition-colors"
            maxLength={30}
          />
          <button
            type="submit"
            disabled={!newName.trim() || creating}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black px-6 py-4 rounded-2xl transition-colors shadow-lg shadow-blue-500/20"
          >
            {creating ? '...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
