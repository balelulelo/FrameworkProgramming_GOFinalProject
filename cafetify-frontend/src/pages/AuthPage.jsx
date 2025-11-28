// src/pages/AuthPage.jsx (Contoh, bisa dipisah jadi Login.jsx dan Register.jsx)

import React, { useState } from 'react';

const AuthPage = ({ type }) => { // type: 'login' atau 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // Hanya untuk Register

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Ganti dengan URL endpoint Golang Anda
        const endpoint = type === 'login' ? 'http://localhost:8080/login' : 'http://localhost:8080/register';
        
        const body = type === 'login' 
            ? { email, password } 
            : { email, password, username };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            
            if (response.ok) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }

                alert(`${type === 'login' ? 'Login' : 'Registrasi'} Berhasil!`);

                window.location.href = '/';

            } else {
                alert(`Gagal: ${data.error}`);
            }
        } catch (error) {
            console.error("Error saat submit:", error);
            alert("Terjadi kesalahan jaringan.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="bg-neutral-900 p-8 rounded-xl shadow-2xl w-full max-w-md">
                
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    {type === 'login' ? 'Masuk' : 'Daftar Akun Baru'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {type === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:ring-green-500 focus:border-green-500"
                                placeholder="Masukkan username Anda"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:ring-green-500 focus:border-green-500"
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:ring-green-500 focus:border-green-500"
                            placeholder="Minimal 8 karakter"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 mt-6 rounded-full transition duration-300"
                    >
                        {type === 'login' ? 'MASUK' : 'DAFTAR'}
                    </button>
                </form>

                <p className="text-sm text-neutral-400 mt-4 text-center">
                    {type === 'login' ? (
                        <a href="/register" className="text-green-400 hover:underline">Belum punya akun? Daftar</a>
                    ) : (
                        <a href="/login" className="text-green-400 hover:underline">Sudah punya akun? Masuk</a>
                    )}
                </p>
            </div>
        </div>
    );
};

export default AuthPage;