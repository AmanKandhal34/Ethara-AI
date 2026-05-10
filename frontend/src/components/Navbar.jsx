import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Tooltip from './Tooltip';

export default function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <Tooltip text="Open menu">
                            <button
                                type="button"
                                onClick={onMenuClick}
                                className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200 md:hidden"
                            >
                                Menu
                            </button>
                        </Tooltip>
                        <h1 className="text-2xl font-bold text-blue-600">Ethara AI</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">{user?.name}</span>
                        <Tooltip text="Logout">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </nav>
    );
}
