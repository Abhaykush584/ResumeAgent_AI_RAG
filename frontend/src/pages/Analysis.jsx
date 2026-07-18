import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, AlertCircle, BarChart2 } from 'lucide-react';

import api from '../api/axios';
import { Link, useSearchParams } from 'react-router-dom';

export default function Analysis() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session');
    
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAnalysis = async () => {
            if (!sessionId) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/api/analysis/session/${sessionId}`);
                if (response.data.has_analysis) {
                    setData(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch analysis:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-zinc-500">Loading analysis...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <p className="text-zinc-400 text-lg">No analysis found. Upload a resume first.</p>
                <Link to="/dashboard/upload" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                    Upload Resume
                </Link>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-8 pb-10"
        >
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-2">
                        <BarChart2 className="w-8 h-8 text-blue-400" />
                        Resume Analysis
                    </h1>
                    <p className="text-zinc-400">Detailed breakdown of your most recent upload.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score Card */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-8 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-2xl" />
                    <p className="text-zinc-400 font-medium mb-4">Overall Score</p>
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" className="stroke-zinc-800" strokeWidth="12" fill="none" />
                            <circle 
                                cx="80" cy="80" r="70" 
                                className="stroke-blue-500 transition-all duration-1000 ease-out" 
                                strokeWidth="12" fill="none" 
                                strokeDasharray="439.8" 
                                strokeDashoffset={439.8 - (439.8 * data.overall_score) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white">
                            {data.overall_score}
                        </div>
                    </div>
                    <p className="text-sm text-zinc-500 text-center px-4">Based on job description alignment, structure, and keyword density.</p>
                </div>

                <div className="space-y-6">
                    {/* ATS Info */}
                    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-white">ATS Pass Probability</h3>
                            <span className="text-2xl font-bold text-green-400">{data.ats_score}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                            <div className="bg-green-400 h-2 rounded-full" style={{ width: `${data.ats_score}%` }} />
                        </div>
                    </div>

                    {/* Skills Breakdown */}
                    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
                        <h3 className="text-lg font-medium text-white mb-4">Keyword Match</h3>
                        
                        <div className="mb-4">
                            <p className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" /> Found Skills
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {(data.skills_found || []).map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-md">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-400" /> Missing Skills
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {(data.missing_skills || []).map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-md">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-400" /> Key Strengths
                    </h3>
                    <ul className="space-y-3">
                        {(data.strengths || []).map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                                <span className="text-blue-400 mt-0.5">•</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-400" /> Areas to Improve
                    </h3>
                    <ul className="space-y-3">
                        {(data.weaknesses || []).map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                                <span className="text-orange-400 mt-0.5">•</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
}
