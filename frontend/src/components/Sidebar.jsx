import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import folderAPI from '../api/folder.api';

export default function Sidebar({ open = false, onClose }) {
    const location = useLocation();
    const [folders, setFolders] = useState([]);
    const [deletingFolderId, setDeletingFolderId] = useState('');

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'D' },
        { path: '/folders', label: 'Folders', icon: 'F' },
        { path: '/projects', label: 'Projects', icon: 'P' },
        { path: '/tasks', label: 'Tasks', icon: 'T' },
        { path: '/profile', label: 'Profile', icon: 'U' },
    ];

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            const response = await folderAPI.getFolders();
            setFolders(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch sidebar folders:', error);
        }
    };

    const handleDeleteFolder = async (folderId) => {
        try {
            setDeletingFolderId(folderId);
            await folderAPI.deleteFolder(folderId);
            await fetchFolders();
        } catch (error) {
            console.error('Failed to delete sidebar folder:', error);
        } finally {
            setDeletingFolderId('');
        }
    };

    const content = (
        <aside className="w-64 bg-gray-900 text-white h-screen shadow-lg overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Menu</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        title="Close menu"
                        className="rounded bg-gray-800 px-2 py-1 text-sm hover:bg-gray-700 md:hidden"
                    >
                        Close
                    </button>
                </div>
            </div>
            <nav className="mt-8">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        title={`Open ${item.label}`}
                        className={`block px-6 py-3 transition ${location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                    >
                        <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs font-bold">
                            {item.icon}
                        </span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="mt-6 px-4 pb-6">
                <div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Folders
                </div>
                {folders.length === 0 ? (
                    <p className="px-2 py-2 text-sm text-gray-400">No folders</p>
                ) : (
                    <div className="space-y-1">
                        {folders.map((folder) => (
                            <div key={folder.id} className="flex items-center justify-between gap-2 rounded px-2 py-2 hover:bg-gray-800" title={folder.name}>
                                <Link to="/folders" onClick={onClose} className="min-w-0 flex-1 truncate text-sm" title={`Open folder ${folder.name}`}>
                                    {folder.name}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteFolder(folder.id)}
                                    disabled={deletingFolderId === folder.id}
                                    title={`Delete folder ${folder.name}`}
                                    className="shrink-0 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {deletingFolderId === folder.id ? '...' : 'Delete'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );

    return (
        <>
            <div className="hidden md:block">{content}</div>
            {open && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <button type="button" aria-label="Close menu overlay" onClick={onClose} className="absolute inset-0 bg-black/50" />
                    <div className="relative">{content}</div>
                </div>
            )}
        </>
    );
}
