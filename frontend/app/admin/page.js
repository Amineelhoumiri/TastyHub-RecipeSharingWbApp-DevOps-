'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        username: '',
        email: '',
        role: 'user',
        password: ''
    });

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const user = await api.getUserProfile();
                setCurrentUser(user);

                if (user.role !== 'admin') {
                    router.push('/');
                    return;
                }

                fetchUsers();
            } catch (err) {
                console.error('Admin check failed:', err);
                router.push('/login');
            }
        };

        checkAdmin();
    }, [router]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await api.adminDeleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert(err.message || 'Failed to delete user');
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditFormData({
            username: user.username,
            email: user.email,
            role: user.role || 'user',
            password: '' // Don't show current password
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await api.adminUpdateUser(editingUser.id, editFormData);

            setUsers(users.map(u => u.id === editingUser.id ? updatedUser.user : u));
            setEditingUser(null);
            alert('User updated successfully');
        } catch (err) {
            alert(err.message || 'Failed to update user');
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center h-screen">
                    <div className="text-xl text-gray-600">Loading Admin Dashboard...</div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <h2 className="text-lg leading-6 font-medium text-gray-900">User Management</h2>
                        <span className="text-sm text-gray-500">Total Users: {users.length}</span>
                    </div>

                    <div className="border-t border-gray-200 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {user.profilePicture ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={user.profilePicture} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            {user.id !== currentUser?.id && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit User: {editingUser.username}</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                                <input
                                    type="text"
                                    value={editFormData.username}
                                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                                <select
                                    value={editFormData.role}
                                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={editFormData.password}
                                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                    placeholder="********"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
