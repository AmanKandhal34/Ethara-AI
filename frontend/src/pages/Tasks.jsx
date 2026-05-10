import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import projectAPI from '../api/project.api';
import taskAPI from '../api/task.api';
import folderAPI from '../api/folder.api';
import TaskCard from '../features/tasks/components/TaskCard';

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
});

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [folders, setFolders] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskStatus, setEditingTaskStatus] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState('');
    const [notice, setNotice] = useState({ type: '', message: '' });
    const [filters, setFilters] = useState({ search: '', projectId: '', folderId: '', status: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, pages: 1 });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        projectId: '',
        folderId: '',
        status: 'pending',
        attachments: [],
    });

    useEffect(() => {
        fetchTasks();
        fetchFolders();
        fetchProjects();
    }, []);

    useEffect(() => {
        fetchTasks(1);
    }, [filters.search, filters.projectId, filters.folderId, filters.status]);

    const fetchFolders = async () => {
        try {
            const response = await folderAPI.getFolders();
            setFolders(response.data?.data || []);
        } catch {
            setNotice({ type: 'error', message: 'Failed to load folders.' });
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await projectAPI.getProjects({ limit: 100 });
            setProjects(response.data?.data || []);
        } catch {
            setNotice({ type: 'error', message: 'Failed to load projects.' });
        }
    };

    const fetchTasks = async (page = pagination.page) => {
        try {
            setLoading(true);
            const response = await taskAPI.getTasks({
                page,
                limit: pagination.limit,
                search: filters.search || undefined,
                projectId: filters.projectId || undefined,
                folderId: filters.folderId || undefined,
                status: filters.status || undefined,
            });
            setTasks(response.data?.data || []);
            setPagination(response.data?.pagination || { page, limit: pagination.limit, total: 0, pages: 1 });
        } catch {
            setNotice({ type: 'error', message: 'Failed to load tasks.' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingTaskId(null);
        setEditingTaskStatus('');
        setFormData({ title: '', description: '', dueDate: '', projectId: '', folderId: '', status: 'pending', attachments: [] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setNotice({ type: 'error', message: 'Task title is required.' });
            return;
        }
        if (!formData.projectId) {
            setNotice({ type: 'error', message: 'Please select a project.' });
            return;
        }

        try {
            setSaving(true);
            if (editingTaskId) {
                const { status, ...taskData } = formData;
                await taskAPI.updateTask(editingTaskId, taskData);
                if (status !== editingTaskStatus) {
                    await taskAPI.updateTaskStatus(editingTaskId, status);
                }
            } else {
                await taskAPI.createTask(formData);
            }
            setNotice({ type: 'success', message: editingTaskId ? 'Task updated successfully.' : 'Task created successfully.' });
            resetForm();
            setShowForm(false);
            await fetchTasks();
        } catch (error) {
            setNotice({ type: 'error', message: error.response?.data?.message || 'Failed to save task.' });
        } finally {
            setSaving(false);
        }
    };

    const handleEditTask = (task) => {
        setEditingTaskId(task.id);
        setEditingTaskStatus(task.status || 'pending');
        setFormData({
            title: task.title || '',
            description: task.description || '',
            dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : '',
            projectId: task.projectId || task.project || '',
            folderId: task.folderId || '',
            status: task.status || 'pending',
            attachments: task.attachments || [],
        });
        setShowForm(true);
    };

    const handleDeleteTask = async () => {
        try {
            await taskAPI.deleteTask(confirmDeleteId);
            setConfirmDeleteId('');
            setNotice({ type: 'success', message: 'Task deleted successfully.' });
            await fetchTasks();
        } catch (error) {
            setNotice({ type: 'error', message: error.response?.data?.message || 'Failed to delete task.' });
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-4 md:p-8">
            <ConfirmModal
                open={Boolean(confirmDeleteId)}
                title="Delete task"
                message="This will permanently delete the task and its uploads."
                onCancel={() => setConfirmDeleteId('')}
                onConfirm={handleDeleteTask}
            />

            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-4xl font-bold text-gray-800">Tasks</h1>
                <button
                    type="button"
                    onClick={() => {
                        resetForm();
                        setShowForm((prev) => !prev);
                    }}
                    title={showForm ? 'Cancel task form' : 'Create a new task'}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : 'New Task'}
                </button>
            </div>

            <Alert type={notice.type} message={notice.message} onClose={() => setNotice({ type: '', message: '' })} />

            <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg bg-white p-4 shadow-md md:grid-cols-4">
                <input type="search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search tasks" title="Search tasks" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                <select value={filters.projectId} onChange={(e) => setFilters({ ...filters, projectId: e.target.value })} title="Filter by project" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">All projects</option>
                    {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
                <select value={filters.folderId} onChange={(e) => setFilters({ ...filters, folderId: e.target.value })} title="Filter by folder" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">All folders</option>
                    {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} title="Filter by status" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                </select>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Title</label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" rows="4" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Project</label>
                            <select value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" required>
                                <option value="">Select a project</option>
                                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Due Date</label>
                            <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Folder</label>
                            <select value={formData.folderId} onChange={(e) => setFormData({ ...formData, folderId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                                <option value="">No folder</option>
                                {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Upload Attachments</label>
                            <input type="file" multiple onChange={async (e) => {
                                const files = Array.from(e.target.files || []);
                                const dataUrls = await Promise.all(files.map(fileToDataUrl));
                                setFormData((prev) => ({ ...prev, attachments: dataUrls }));
                            }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                            {formData.attachments.length > 0 && <p className="text-xs text-gray-500 mt-2">{formData.attachments.length} file(s) uploaded</p>}
                        </div>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
                            {saving ? 'Saving...' : editingTaskId ? 'Update Task' : 'Create Task'}
                        </button>
                    </form>
                </div>
            )}

            {tasks.length === 0 ? (
                <EmptyState message="No tasks match your filters." icon="T" />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} onEdit={() => handleEditTask(task)} onDelete={setConfirmDeleteId} />
                        ))}
                    </div>
                    <Pagination pagination={pagination} onPageChange={fetchTasks} />
                </>
            )}
        </div>
    );
}
