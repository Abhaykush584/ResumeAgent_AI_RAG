import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileCheck, Target, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function DashboardHome() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/api/analysis/dashboard');
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
                // Fallback for demo
                setData({ total_resumes: 0, total_chats: 0, avg_ats_score: 0, latest_resume: null });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        { label: 'Resumes Analyzed', value: data?.total_resumes || '0', icon: FileCheck, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Avg. ATS Score', value: `${data?.avg_ats_score || 0}%`, icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Total Chats', value: data?.total_chats || '0', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-8"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Overview</h1>
                    <p className="text-zinc-400">Welcome to your resume intelligence dashboard.</p>
                </div>
                <Link to="/dashboard/upload" className="bg-white text-zinc-950 px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors">
                    <UploadCloud className="w-5 h-5" />
                    New Analysis
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl flex items-start gap-4"
                    >
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400 mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
                
                {data?.latest_resume ? (
                    <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                                <FileCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-white">{data.latest_resume.filename}</p>
                                <p className="text-sm text-zinc-400">
                                    Uploaded on {new Date(data.latest_resume.uploaded_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-zinc-400">ATS Score</p>
                            <p className="text-lg font-bold text-green-400">{data.latest_resume.ats_score}%</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-zinc-500">No recent activity yet. Upload a resume to get started.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
