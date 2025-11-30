import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ type }) => { // type: 'login' atau 'register'
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // make sure the endpoint matches our golang endpoint
        const endpoint = type === 'login' ? 'http://localhost:8080/login' : 'http://localhost:8080/register';
        
        try {
            const response = await axios.post(endpoint, formData);
            
            if (type === 'login') {
                // Simpan token ke LocalStorage
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    navigate('/'); // Redirect ke Dashboard
                }
            } else {
                alert('Registrasi Berhasil! Silakan Login.');
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Terjadi kesalahan. Cek koneksi server.');
        } finally {
            setLoading(false);
        }
    };

    const isLogin = type === 'login';

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans text-white">
            
            {/* Header / Logo */}
            <div className="mb-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
                    <i className="fas fa-mug-hot text-3xl text-black"></i>
                </div>
                <h1 className="text-4xl font-space font-bold tracking-tight">Cafetify</h1>
            </div>

            {/* Card Form */}
            <div className="bg-[#121212] w-full max-w-md p-8 rounded-xl border border-[#333] shadow-2xl relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1DB954] to-blue-500"></div>

                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isLogin ? 'Login ke Akun' : 'Daftar Akun Baru'}
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-[#b3b3b3] mb-1 uppercase">Username</label>
                            <input 
                                name="username" 
                                type="text"
                                placeholder="Nama kamu"
                                onChange={handleChange} 
                                className="w-full bg-[#333] border border-transparent focus:border-[#1DB954] text-white p-3 rounded outline-none transition"
                                required 
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-[#b3b3b3] mb-1 uppercase">Email</label>
                        <input 
                            name="email" 
                            type="email"
                            placeholder="nama@email.com"
                            onChange={handleChange} 
                            className="w-full bg-[#333] border border-transparent focus:border-[#1DB954] text-white p-3 rounded outline-none transition"
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#b3b3b3] mb-1 uppercase">Password</label>
                        <input 
                            name="password" 
                            type="password"
                            placeholder="Rahasia..."
                            onChange={handleChange} 
                            className="w-full bg-[#333] border border-transparent focus:border-[#1DB954] text-white p-3 rounded outline-none transition"
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 rounded-full uppercase tracking-widest text-xs transition transform hover:scale-105 mt-6 shadow-lg"
                    >
                        {loading ? 'Memproses...' : (isLogin ? 'MASUK' : 'DAFTAR')}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-[#333] text-center">
                    <p className="text-[#b3b3b3] text-sm">
                        {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
                        <a 
                            href={isLogin ? "/register" : "/login"} 
                            className="text-white font-bold ml-1 hover:underline hover:text-[#1DB954]"
                        >
                            {isLogin ? "Daftar di sini" : "Login di sini"}
                        </a>
                    </p>
                </div>
            </div>
            
            <p className="mt-8 text-xs text-[#555]">© Framework Programming IUP Final Project</p>
        </div>
    );
};

export default AuthPage;