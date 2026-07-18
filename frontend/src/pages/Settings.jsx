import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function Settings() {
    const [settings, setSettings] = useState({
        theme: 'dark',
        llmModel: 'gemini-1.5-flash',
        temperature: 0.7,
        chunkSize: 1000
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/api/settings');
                setSettings(response.data);
            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await api.put('/api/settings', settings);
            setMessage('Settings saved successfully.');
        } catch (error) {
            setMessage('Failed to save settings.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) return <div className="text-zinc-400 p-8">Loading settings...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8"
        >
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-2">
                    <SettingsIcon className="w-8 h-8 text-blue-400" />
                    Settings
                </h1>
                <p className="text-zinc-400">Manage your LLM preferences and workspace settings.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-8 rounded-2xl space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">LLM Model</label>
                        <select 
                            value={settings.llmModel}
                            onChange={(e) => setSettings({...settings, llmModel: e.target.value})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                        >
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Default)</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            <option value="llama-3-70b-groq">Llama 3 70B (Groq)</option>
                            <option value="mixtral-8x7b-groq">Mixtral 8x7b (Groq)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Theme</label>
                        <select 
                            value={settings.theme}
                            onChange={(e) => setSettings({...settings, theme: e.target.value})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                        >
                            <option value="dark">Dark Mode</option>
                            <option value="light">Light Mode</option>
                            <option value="system">System Preference</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Temperature ({settings.temperature})
                        </label>
                        <input 
                            type="range" 
                            min="0" max="1" step="0.1"
                            value={settings.temperature}
                            onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                            className="w-full accent-blue-500"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Higher values make output more creative.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Chunk Size</label>
                        <input 
                            type="number"
                            value={settings.chunkSize}
                            onChange={(e) => setSettings({...settings, chunkSize: parseInt(e.target.value)})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                    <p className="text-sm text-green-400">{message}</p>
                    <button 
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
