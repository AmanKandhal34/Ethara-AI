import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import projectAPI from '../api/project.api';
import folderAPI from '../api/folder.api';
import ProjectCard from '../features/projects/components/ProjectCard';

const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
});

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState('');
    const [notice, setNotice] = useState({ type: '', message: '' });
    const [filters, setFilters] = useState({ search: '', folderId: '', status: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, pages: 1 });
    const [formData, setFormData] = useState({ name: '', description: '', folderId: '', thumbnail: '' });

    useEffect(() => {
        fetchProjects();
        fetchFolders();
    }, []);

    useEffect(() => {
        fetchProjects(1);
    }, [filters.search, filters.folderId, filters.status]);

    const fetchFolders = async () => {
        try {
            const response = await folderAPI.getFolders();
            setFolders(response.data?.data || []);
        } catch {
            setNotice({ type: 'error', message: 'Failed to load folders.' });
        }
    };

    const fetchProjects = async (page = pagination.page) => {
        try {
            setLoading(true);
            const response = await projectAPI.getProjects({
                page,
                limit: pagination.limit,
                search: filters.search || undefined,
                folderId: filters.folderId || undefined,
                status: filters.status || undefined,
            });
            setProjects(response.data?.data || []);
            setPagination(response.data?.pagination || { page, limit: pagination.limit, total: 0, pages: 1 });
        } catch {
            setNotice({ type: 'error', message: 'Failed to load projects.' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', folderId: '', thumbnail: '' });
        setEditingProjectId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setNotice({ type: 'error', message: 'Project name is required.' });
            return;
        }

        try {
            setSaving(true);
            if (editingProjectId) {
                await projectAPI.updateProject(editingProjectId, formData);
            } else {
                await projectAPI.createProject(formData);
            }
            setNotice({ type: 'success', message: editingProjectId ? 'Project updated successfully.' : 'Project created successfully.' });
            resetForm();
            setShowForm(false);
            await fetchProjects();
        } catch (error) {
            setNotice({ type: 'error', message: error.response?.data?.message || 'Failed to save project.' });
        } finally {
            setSaving(false);
        }
    };

    const handleEditProject = (project) => {
        setEditingProjectId(project.id);
        setFormData({
            name: project.name || '',
            description: project.description || '',
            folderId: project.folderId || '',
            thumbnail: project.thumbnail || '',
        });
        setShowForm(true);
    };

    const handleDeleteProject = async () => {
        try {
            await projectAPI.deleteProject(confirmDeleteId);
            setConfirmDeleteId('');
            setNotice({ type: 'success', message: 'Project deleted successfully.' });
            await fetchProjects();
        } catch (error) {
            setNotice({ type: 'error', message: error.response?.data?.message || 'Failed to delete project.' });
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-4 md:p-8">
            <ConfirmModal
                open={Boolean(confirmDeleteId)}
                title="Delete project"
                message="This will delete the project and its tasks. This action cannot be undone."
                onCancel={() => setConfirmDeleteId('')}
                onConfirm={handleDeleteProject}
            />

            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-4xl font-bold text-gray-800">Projects</h1>
                <button
                    type="button"
                    onClick={() => {
                        resetForm();
                        setShowForm((prev) => !prev);
                    }}
                    title={showForm ? 'Cancel project form' : 'Create a new project'}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : 'New Project'}
                </button>
            </div>

            <Alert type={notice.type} message={notice.message} onClose={() => setNotice({ type: '', message: '' })} />

            <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg bg-white p-4 shadow-md md:grid-cols-3">
                <input type="search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search projects" title="Search projects" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                <select value={filters.folderId} onChange={(e) => setFilters({ ...filters, folderId: e.target.value })} title="Filter by folder" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">All folders</option>
                    {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} title="Filter by status" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Project Name</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" rows="4" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">Folder</label>
                            <select value={formData.folderId} onChange={(e) => setFormData({ ...formData, folderId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                                <option value="">No folder</option>
                                {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                            </select>
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">Upload Thumbnail</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > MAX_THUMBNAIL_BYTES) {
                                        setNotice({ type: 'error', message: 'Thumbnail is too large. Please upload an image up to 2MB.' });
                                        setFormData((prev) => ({ ...prev, thumbnail: '' }));
                                        e.target.value = '';
                                        return;
                                    }
                                    const dataUrl = await fileToDataUrl(file);
                                    setFormData((prev) => ({ ...prev, thumbnail: dataUrl }));
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            {formData.thumbnail && <p className="text-xs text-gray-500 mt-2">Thumbnail uploaded</p>}
                        </div>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
                            {saving ? 'Saving...' : editingProjectId ? 'Update Project' : 'Create Project'}
                        </button>
                    </form>
                </div>
            )}

            {projects.length === 0 ? (
                <EmptyState message="No projects match your filters." icon="P" />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} onEdit={handleEditProject} onDelete={setConfirmDeleteId} />
                        ))}
                    </div>
                    <Pagination pagination={pagination} onPageChange={fetchProjects} />
                </>
            )}
        </div>
    );
}
