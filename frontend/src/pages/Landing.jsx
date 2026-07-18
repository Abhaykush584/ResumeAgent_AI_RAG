import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, Zap, Target, Shield, ArrowRight, Code } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden font-sans selection:bg-blue-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/50 backdrop-blur-md border-b border-zinc-800/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        ResumeAgent
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sign In</Link>
                        <Link to="/signup" className="text-sm font-medium bg-white text-zinc-950 px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex flex-col justify-center">
                {/* Aurora Background Elements */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-300 mb-8 backdrop-blur-md"
                    >
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Enterprise Resume Intelligence 2.0
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
                    >
                        Transform your resume with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
                            Context-Aware AI
                        </span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Stop guessing what recruiters want. Upload your resume and job description, and let our Langchain-powered RAG pipeline analyze every detail instantly.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-950 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all group">
                            Start Free Trial
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="https://github.com/Abhaykush584/ResumeAgent_AI_RAG" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-800 text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all">
                            <Code className="w-5 h-5" />
                            View Source
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Dashboard Preview mockup */}
            <section className="px-6 pb-32 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto rounded-2xl md:rounded-[2rem] border border-zinc-800/50 bg-zinc-900/50 p-2 md:p-4 backdrop-blur-xl shadow-2xl overflow-hidden"
                >
                    <div className="rounded-xl md:rounded-3xl border border-zinc-800 overflow-hidden bg-zinc-950 aspect-video relative">
                        {/* Fake Browser Top */}
                        <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        {/* Fake App Content */}
                        <div className="p-8 grid grid-cols-3 gap-6 h-full">
                            <div className="col-span-1 border-r border-zinc-800 space-y-4 pr-6">
                                <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                                <div className="h-12 w-full bg-blue-500/10 border border-blue-500/20 rounded-lg" />
                                <div className="h-12 w-full bg-zinc-800/50 rounded-lg" />
                                <div className="h-12 w-full bg-zinc-800/50 rounded-lg" />
                            </div>
                            <div className="col-span-2 space-y-6">
                                <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-32 bg-zinc-800/50 rounded-xl" />
                                    <div className="h-32 bg-zinc-800/50 rounded-xl" />
                                </div>
                                <div className="h-48 bg-zinc-800/50 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features */}
            <section className="py-32 px-6 bg-zinc-950 border-t border-zinc-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Powered by bleeding-edge AI</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">We left no stone unturned in building the most advanced RAG architecture for resume analysis.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Streaming LLMs', desc: 'Experience zero latency with Server-Sent Events delivering markdown output character-by-character.' },
                            { icon: Target, title: 'ChromaDB Vectors', desc: 'Your resume is chunked, embedded via SentenceTransformers, and stored locally for instant retrieval.' },
                            { icon: Shield, title: 'Enterprise Security', desc: 'Stateless JWT authentication paired with PostgreSQL ensures your career data is isolated and secure.' }
                        ].map((feat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                                    <feat.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-zinc-900 bg-zinc-950 text-center text-zinc-500 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>© 2026 ResumeAgent AI. All rights reserved.</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
