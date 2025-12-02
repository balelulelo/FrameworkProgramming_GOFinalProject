import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: '', email: '' });
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'password'
    const [loading, setLoading] = useState(false);

    // Fetch Data User
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');

            try {
                const res = await axios.get('http://localhost:8080/protected/profile', {
                    headers: { Authorization: token }
                });
                setUser(res.data.user);
            } catch (err) {
                if(err.response?.status === 401) handleLogout();
            }
        };
        fetchProfile();
    }, [navigate]);

    // Handle Logout
    const handleLogout = () => {
        localStorage.removeItem('token'); // delete token
        navigate('/login'); // login
    };

    // Update informations
    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            await axios.put('http://localhost:8080/protected/profile', 
                { username: user.username, email: user.email }, 
                { headers: { Authorization: token } }
            );
            alert('Succecssfully updated profile!');
        } catch (err) {
            alert('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    // change pssword
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            await axios.put('http://localhost:8080/protected/change-password', passwords, {
                headers: { Authorization: token }
            });
            alert('Password berhasil diubah! Silakan login ulang.');
            handleLogout();
        } catch (err) {
            alert(err.response?.data?.error || 'Gagal mengubah password.');
        } finally {
            setLoading(false);
            setPasswords({ old_password: '', new_password: '' });
        }
    };

    // Style Components
    const inputStyle = "w-full bg-[#333] text-white p-3 rounded border border-transparent focus:border-[#1DB954] outline-none transition";
    const labelStyle = "block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide";
    const tabStyle = (isActive) => `pb-2 px-4 text-sm font-bold border-b-2 transition-colors ${isActive ? 'border-[#1DB954] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`;

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans">
            
            <div className="bg-[#121212] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-[#333]">
                
                {/* Header Profile */}
                <div className="p-8 bg-gradient-to-b from-[#1e1e1e] to-[#121212] text-center border-b border-[#333]">
                    <div className="w-24 h-24 mx-auto bg-[#282828] rounded-full flex items-center justify-center mb-4 shadow-xl">
                         <i className="fas fa-user text-4xl text-[#1DB954]"></i>
                    </div>
                    <h1 className="text-2xl font-space font-bold">{user.username}</h1>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-8 mt-4 border-b border-[#333] px-8">
                    <button onClick={() => setActiveTab('info')} className={tabStyle(activeTab === 'info')}>Edit Profile</button>
                    <button onClick={() => setActiveTab('password')} className={tabStyle(activeTab === 'password')}>Change Password</button>
                </div>

                {/* Forms */}
                <div className="p-8">
                    {activeTab === 'info' ? (
                        <form onSubmit={handleUpdateInfo} className="space-y-4 animate-fade-in">
                            <div>
                                <label className={labelStyle}>Username</label>
                                <input value={user.username} onChange={(e) => setUser({...user, username: e.target.value})} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Email</label>
                                <input value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} className={inputStyle} />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-full hover:scale-105 transition mt-4">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-4 animate-fade-in">
                             <div>
                                <label className={labelStyle}>Old Password</label>
                                <input type="password" value={passwords.old_password} onChange={(e) => setPasswords({...passwords, old_password: e.target.value})} className={inputStyle} required />
                            </div>
                            <div>
                                <label className={labelStyle}>New Password</label>
                                <input type="password" value={passwords.new_password} onChange={(e) => setPasswords({...passwords, new_password: e.target.value})} className={inputStyle} required />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-[#1DB954] text-black font-bold py-3 rounded-full hover:scale-105 transition mt-4">
                                {loading ? 'Processing...' : 'Change Password'}
                            </button>
                        </form>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-[#333] flex justify-between items-center">
                        <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-white transition">
                            <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
                        </button>
                        
                        <button onClick={handleLogout} className="text-sm text-red-500 font-bold hover:text-red-400 transition border border-red-500/30 px-4 py-2 rounded-full hover:bg-red-500/10">
                            LOGOUT <i className="fas fa-sign-out-alt ml-2"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;