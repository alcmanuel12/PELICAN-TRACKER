import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Bell, Activity, LogOut, LayoutDashboard, MapPin } from 'lucide-react';
import io from 'socket.io-client';
import { ChatPanel } from "../UI/Cards/ChatPanel";
import { api, API_URL } from '../../utils/api';
import { DashboardTab } from './tabs/DashboardTab';
import { AlertsTab } from './tabs/AlertsTab';
import { UsersTab } from './tabs/UsersTab';
import { StopsTab } from './tabs/StopsTab';

export const AdminDashboard = ({ user, onLogout }) => {

    const [activeTab, setActiveTab] = useState('dashboard');
    const [logs, setLogs] = useState([]);
    const [driverCount, setDriverCount] = useState(0);

    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState('info');
    const [isSending, setIsSending] = useState(false);

    const [usersList, setUsersList] = useState([]);
    const [userForm, setUserForm] = useState({ username: '', password: '', name: '', role: 'driver' });
    const [userFormError, setUserFormError] = useState('');
    const [userFormLoading, setUserFormLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);

    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(API_URL, { withCredentials: true });
        socketRef.current.on('driverCountUpdate', (count) => setDriverCount(count));
        socketRef.current.on('adminLog', (newLog) => {
            setLogs((prev) => [newLog, ...prev].slice(0, 100));
        });
        return () => socketRef.current.disconnect();
    }, []);

    const lastStop = logs[0] ? logs[0].event.replace(/^(?:Llegada a|Bus en)\s+/, '') : 'Sin datos';

    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const res = await api.get('/api/admin/users');
            if (!res.ok) throw new Error('Error obteniendo usuarios');
            setUsersList(await res.json());
        } catch (e) {
            setUserFormError('Error cargando usuarios: ' + e.message);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        setUserFormError('');
    }, [activeTab, fetchUsers]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setUserFormLoading(true);
        setUserFormError('');
        try {
            const res = await api.post('/api/admin/users', userForm);
            const data = await res.json();
            if (res.ok) {
                setUserForm({ username: '', password: '', name: '', role: 'driver' });
                fetchUsers();
            } else {
                setUserFormError(data.message || 'Error al crear usuario');
            }
        } catch {
            setUserFormError('Error de conexión');
        } finally {
            setUserFormLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('¿Eliminar este usuario permanentemente?')) return;
        try {
            const res = await api.delete(`/api/admin/users/${id}`);
            if (!res.ok) {
                const data = await res.json();
                setUserFormError(data.message || 'Error al eliminar usuario');
            } else {
                fetchUsers();
            }
        } catch {
            setUserFormError('Error al eliminar usuario');
        }
    };

    const handleResetPassword = async (id, newPassword) => {
        try {
            const res = await api.patch(`/api/admin/users/${id}`, { password: newPassword });
            const data = await res.json();
            if (!res.ok) return { success: false, message: data.message };
            return { success: true };
        } catch {
            return { success: false, message: 'Error de conexión' };
        }
    };

    const handleSendAlert = () => {
        if (!alertMsg.trim()) return;
        setIsSending(true);
        socketRef.current.emit('adminMessage', { msg: alertMsg, type: alertType }, (ack) => {
            if (ack?.success) setAlertMsg('');
            setIsSending(false);
        });
    };

    const handleClearAlert = () => {
        if (confirm("¿Seguro que quieres retirar el aviso de todos los usuarios?")) {
            socketRef.current.emit('adminClearAlert');
        }
    };

    return (
        <div className="h-screen bg-slate-900 text-slate-100 font-sans flex flex-col relative overflow-hidden">

            <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Activity className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Panel de Control</h1>
                        <p className="text-xs text-slate-400">Hola, {user?.name || "Administrador"}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all flex items-center gap-2 border border-red-500/20"
                >
                    <LogOut size={18} /> <span className="hidden sm:inline">Salir</span>
                </button>
            </header>

            <div className="flex border-b border-slate-700 bg-slate-800/50 px-6 gap-6">
                <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18} />} label="Torre de Control" />
                <TabButton active={activeTab === 'alerts'}    onClick={() => setActiveTab('alerts')}    icon={<Bell size={18} />}           label="Avisos" />
                <TabButton active={activeTab === 'users'}     onClick={() => setActiveTab('users')}     icon={<Users size={18} />}          label="Usuarios" />
                <TabButton active={activeTab === 'stops'}     onClick={() => setActiveTab('stops')}     icon={<MapPin size={18} />}         label="Paradas" />
            </div>

            <main className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'dashboard' && (
                    <DashboardTab logs={logs} driverCount={driverCount} lastStop={lastStop} />
                )}
                {activeTab === 'alerts' && (
                    <AlertsTab
                        alertMsg={alertMsg} setAlertMsg={setAlertMsg}
                        alertType={alertType} setAlertType={setAlertType}
                        isSending={isSending}
                        handleSendAlert={handleSendAlert}
                        handleClearAlert={handleClearAlert}
                    />
                )}
                {activeTab === 'users' && (
                    <UsersTab
                        usersList={usersList}
                        usersLoading={usersLoading}
                        userForm={userForm} setUserForm={setUserForm}
                        userFormError={userFormError}
                        userFormLoading={userFormLoading}
                        handleCreateUser={handleCreateUser}
                        handleDeleteUser={handleDeleteUser}
                        handleResetPassword={handleResetPassword}
                    />
                )}
                {activeTab === 'stops' && <StopsTab />}
            </main>

            <ChatPanel userName={user?.name || "Central de Control"} role="admin" />
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors font-medium text-sm ${
            active ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
    >
        {icon} {label}
    </button>
);
