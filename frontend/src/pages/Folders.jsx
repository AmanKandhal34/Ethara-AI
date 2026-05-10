import { useEffect, useState } from 'react';
import folderAPI from '../api/folder.api';
import projectAPI from '../api/project.api';
import taskAPI from '../api/task.api';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';

export default function Folders() {
    const [folders, setFolders] = useState([]);
    const [activeFolder, setActiveFolder] = useState(null);
    const [folderContents, setFolderContents] = useState({ projects: [], tasks: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [draggedItem, setDraggedItem] = useState(null);
    const [notice, setNotice] = useState({ type: '', message: '' });
    const [confirmDeleteId, setConfirmDeleteId] = useState('');

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const response = await folderAPI.getFolders();
            setFolders(response.data.data || []);
            if (!activeFolder && response.data.data?.length) {
                loadFolder(response.data.data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch folders:', error);
            setNotice({ type: 'error', message: 'Failed to load folders.' });
        } finally {
            setLoading(false);
        }
    };

    const loadFolder = async (folderId) => {
        try {
            setActiveFolder(folderId);
            const response = await folderAPI.getFolderContents(folderId);
            setFolderContents({
                projects: response.data.data.projects || [],
                tasks: response.data.data.tasks || [],
            });
        } catch (error) {
            console.error('Failed to load folder:', error);
        }
    };

    const refreshActiveFolder = async (folderId = activeFolder) => {
        if (folderId) {
            await loadFolder(folderId);
        }
        await fetchFolders();
    };

    const handleDragStart = (type, id) => {
        setDraggedItem({ type, id });
    };

    const handleDropOnFolder = async (folderId) => {
        if (!draggedItem) return;

        try {
            if (draggedItem.type === 'project') {
                await projectAPI.updateProject(draggedItem.id, { folderId });
            }

            if (draggedItem.type === 'task') {
                await taskAPI.updateTask(draggedItem.id, { folderId });
            }

            await refreshActiveFolder(folderId);
        } catch (error) {
            console.error('Failed to move item:', error);
        } finally {
            setDraggedItem(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingFolderId) {
                await folderAPI.updateFolder(editingFolderId, formData);
            } else {
                await folderAPI.createFolder(formData);
            }
            setFormData({ name: '', description: '' });
            setShowForm(false);
            setEditingFolderId(null);
            await fetchFolders();
            setNotice({ type: 'success', message: editingFolderId ? 'Folder updated successfully.' : 'Folder created successfully.' });
        } catch (error) {
            console.error('Failed to save folder:', error);
            setNotice({ type: 'error', message: error.response?.data?.message || 'Failed to save folder.' });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (folder) => {
        setEditingFolderId(folder.id);
        setFormData({ name: folder.name, description: folder.description || '' });
        setShowForm(true);
    };

    const handleDelete = async () => {
        try {
            await folderAPI.deleteFolder(confirmDeleteId);
            if (activeFolder === confirmDeleteId) {
                setActiveFolder(null);
                setFolderContents({ projects: [], tasks: [] });
            }
            setConfirmDeleteId('');
            setNotice({ type: 'success', message: 'Folder deleted successfully.' });
            await fetchFolders();
        } catch (error) {
            console.error('Failed to delete folder:', error);
            setNotice({ type: 'error', message: error.response?.data?.message || 'Failed to delete folder.' });
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-8 space-y-8">
            <ConfirmModal
                open={Boolean(confirmDeleteId)}
                title="Delete folder"
                message="Projects and tasks in this folder will be kept, but moved out of the folder."
                onCancel={() => setConfirmDeleteId('')}
                onConfirm={handleDelete}
            />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Folders</h1>
                    <p className="text-gray-600 mt-2">Create, edit, and delete folders for projects and tasks.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingFolderId(null);
                        setFormData({ name: '', description: '' });
                        setShowForm((prev) => !prev);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : 'New Folder'}
                </button>
            </div>
            <Alert type={notice.type} message={notice.message} onClose={() => setNotice({ type: '', message: '' })} />

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Folder Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                rows="4"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : editingFolderId ? 'Update Folder' : 'Create Folder'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    {folders.length === 0 ? (
                        <EmptyState message="No folders yet. Create one to start organizing." icon="📁" />
                    ) : (
                        folders.map((folder) => (
                            <div
                                key={folder.id}
                                className={`bg-white rounded-lg shadow-md p-4 border ${activeFolder === folder.id ? 'border-blue-600' : 'border-transparent'} ${draggedItem ? 'ring-2 ring-dashed ring-blue-300' : ''}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDropOnFolder(folder.id)}
                            >
                                <button className="w-full text-left" onClick={() => loadFolder(folder.id)}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{folder.name}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{folder.description || 'No description'}</p>
                                            <p className="text-xs text-gray-500 mt-3">
                                                {folder.projectCount || 0} projects · {folder.taskCount || 0} tasks
                                            </p>
                                        </div>
                                    </div>
                                </button>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleEdit(folder)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                                    <button onClick={() => setConfirmDeleteId(folder.id)} title={`Delete folder ${folder.name}`} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Folder Contents</h2>
                        {!activeFolder ? (
                            <EmptyState message="Select a folder to see projects and tasks." icon="📂" />
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Projects</h3>
                                    {folderContents.projects.length === 0 ? (
                                        <p className="text-gray-500">No projects in this folder.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {folderContents.projects.map((project) => (
                                                <li
                                                    key={project.id}
                                                    className="p-3 bg-gray-50 rounded cursor-move"
                                                    draggable
                                                    onDragStart={() => handleDragStart('project', project.id)}
                                                >
                                                    <div className="font-medium">{project.name}</div>
                                                    <div className="text-xs text-gray-500">Drag to another folder</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Tasks</h3>
                                    {folderContents.tasks.length === 0 ? (
                                        <p className="text-gray-500">No tasks in this folder.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {folderContents.tasks.map((task) => (
                                                <li
                                                    key={task.id}
                                                    className="p-3 bg-gray-50 rounded cursor-move"
                                                    draggable
                                                    onDragStart={() => handleDragStart('task', task.id)}
                                                >
                                                    <div className="font-medium">{task.title}</div>
                                                    <div className="text-xs text-gray-500">Drag to another folder</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
