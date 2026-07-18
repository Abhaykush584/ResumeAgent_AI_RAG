import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
    const [dragActive, setDragActive] = useState(false);
    const [resume, setResume] = useState(null);
    const [jd, setJd] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const resumeInputRef = useRef(null);
    const jdInputRef = useRef(null);
    const navigate = useNavigate();

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (type === 'resume') setResume(e.dataTransfer.files[0]);
            if (type === 'jd') setJd(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e, type) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            if (type === 'resume') setResume(e.target.files[0]);
            if (type === 'jd') setJd(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!resume || !jd) return;
        setUploading(true);
        
        const formData = new FormData();
        formData.append('resume', resume);
        formData.append('jd', jd);
        // Using a UUID for session_id for now, in a full app we'd create a chat session on the backend
        const sessionId = crypto.randomUUID(); 
        formData.append('session_id', sessionId);

        try {
            // Fake progress animation
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            clearInterval(progressInterval);
            setProgress(100);
            
            setTimeout(() => {
                navigate(`/dashboard?session=${sessionId}`);
            }, 1000);

        } catch (error) {
            console.error('Upload failed', error);
            setUploading(false);
        }
    };

    const FileUploadArea = ({ type, file, setFile, inputRef, title, desc }) => (
        <div 
            className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 bg-zinc-900/30 hover:border-zinc-500 hover:bg-zinc-800/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, type)}
            onClick={() => inputRef.current.click()}
        >
            <input 
                type="file" 
                ref={inputRef}
                className="hidden" 
                onChange={(e) => handleChange(e, type)}
                accept=".pdf,.docx,.txt"
            />
            
            <AnimatePresence mode="wait">
                {file ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 relative">
                            <File className="w-8 h-8" />
                            <button 
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 rounded-full p-1 hover:bg-zinc-700 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-white font-medium text-center">{file.name}</p>
                        <p className="text-zinc-500 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="w-16 h-16 bg-zinc-800 text-zinc-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <p className="text-white font-medium mb-1">{title}</p>
                        <p className="text-zinc-500 text-sm">{desc}</p>
                        <p className="text-zinc-600 text-xs mt-4">PDF, DOCX up to 10MB</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">New Analysis</h1>
                <p className="text-zinc-400">Upload your resume and the job description to start.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <FileUploadArea 
                    type="resume"
                    file={resume}
                    setFile={setResume}
                    inputRef={resumeInputRef}
                    title="Upload Resume"
                    desc="Drag and drop or click to browse"
                />
                
                <FileUploadArea 
                    type="jd"
                    file={jd}
                    setFile={setJd}
                    inputRef={jdInputRef}
                    title="Upload Job Description"
                    desc="Drag and drop or click to browse"
                />
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={handleUpload}
                    disabled={!resume || !jd || uploading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing... {progress}%
                        </>
                    ) : progress === 100 ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Ready
                        </>
                    ) : (
                        'Analyze Now'
                    )}
                </button>
            </div>
            
            {/* Progress bar overlay if uploading */}
            {uploading && (
                <div className="mt-8 bg-zinc-900/50 rounded-full h-2 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                    />
                </div>
            )}
        </motion.div>
    );
}
