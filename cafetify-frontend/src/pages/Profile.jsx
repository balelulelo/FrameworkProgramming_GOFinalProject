import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState({ username: '', email: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://localhost:8080/protected/profile', {
                    headers: { Authorization: token }
                });
                setUser(res.data.user);
            } catch (err) {
                console.error(err);
                // Jika token expired
                if(err.response?.status === 401) navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.put('http://localhost:8080/protected/profile', user, {
                headers: { Authorization: token }
            });
            alert('Profil berhasil diperbarui!');
        } catch (err) {
            alert('Gagal update profil.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
            <div className="w-full max-w-md bg-[#181818] p-8 rounded-xl border border-[#333]">
                <h1 className="text-3xl font-bold mb-6 text-[#1DB954]">Edit Profil</h1>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Username</label>
                        <input 
                            type="text" 
                            value={user.username} 
                            onChange={(e) => setUser({...user, username: e.target.value})}
                            className="w-full bg-[#333] p-3 rounded text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1">Email</label>
                        <input 
                            type="email" 
                            value={user.email} 
                            onChange={(e) => setUser({...user, email: e.target.value})}
                            className="w-full bg-[#333] p-3 rounded text-white"
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#1DB954] hover:bg-green-400 text-black font-bold py-3 rounded-full mt-4 transition">
                        Simpan Perubahan
                    </button>
                    <button type="button" onClick={() => navigate('/')} className="w-full text-gray-400 mt-2 hover:text-white">
                        Kembali ke Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;