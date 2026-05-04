import { useState } from 'react';
import { UserPlus, ShieldCheck, KeyRound, User, Trash2, Users, Check, X } from 'lucide-react';

export const UsersTab = ({ usersList, userForm, setUserForm, userFormError, userFormLoading, handleCreateUser, handleDeleteUser, handleResetPassword }) => {
    const [expandedPwdId, setExpandedPwdId] = useState(null);
    const [newPwd, setNewPwd] = useState('');
    const [pwdError, setPwdError] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);

    const openPwdForm = (id) => {
        setExpandedPwdId(id);
        setNewPwd('');
        setPwdError('');
    };

    const closePwdForm = () => {
        setExpandedPwdId(null);
        setNewPwd('');
        setPwdError('');
    };

    const submitPwd = async (id) => {
        if (newPwd.length < 8) { setPwdError('Mínimo 8 caracteres'); return; }
        setPwdLoading(true);
        const result = await handleResetPassword(id, newPwd);
        setPwdLoading(false);
        if (result.success) { closePwdForm(); }
        else { setPwdError(result.message); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-200">
                    <UserPlus size={20} className="text-blue-400" /> Nuevo Usuario
                </h2>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            value={userForm.name}
                            onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                            required
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-9 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Nombre de usuario"
                            value={userForm.username}
                            onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))}
                            required
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-9 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <KeyRound size={16} className="absolute left-3 top-3.5 text-slate-400" />
                        <input
                            type="password"
                            placeholder="Contraseña (mín. 8 caracteres)"
                            value={userForm.password}
                            onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                            required
                            minLength={8}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-9 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <ShieldCheck size={16} className="absolute left-3 top-3.5 text-slate-400" />
                        <select
                            value={userForm.role}
                            onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-9 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                            <option value="driver">Conductor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    {userFormError && (
                        <p className="sm:col-span-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
                            {userFormError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={userFormLoading}
                        className="sm:col-span-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                        {userFormLoading ? 'Creando...' : <><UserPlus size={18} /> Crear Usuario</>}
                    </button>
                </form>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
                <div className="p-5 border-b border-slate-700">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-200">
                        <Users size={20} className="text-blue-400" /> Usuarios Registrados
                    </h2>
                </div>
                <div className="divide-y divide-slate-700/50 max-h-[480px] overflow-y-auto">
                    {usersList.length === 0 ? (
                        <p className="p-6 text-center text-slate-500">Cargando...</p>
                    ) : (
                        usersList.map(u => (
                            <div key={u._id}>
                                <div className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${u.role === 'admin' ? 'bg-purple-600/20 text-purple-400' : 'bg-blue-600/20 text-blue-400'}`}>
                                            {u.role === 'admin' ? <ShieldCheck size={20} /> : <User size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{u.name}</p>
                                            <p className="text-xs text-slate-400">
                                                @{u.username} · <span className={u.role === 'admin' ? 'text-purple-400' : 'text-blue-400'}>
                                                    {u.role === 'admin' ? 'Administrador' : 'Conductor'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => expandedPwdId === u._id ? closePwdForm() : openPwdForm(u._id)}
                                            className="p-2 rounded-lg text-slate-500 hover:text-yellow-400 hover:bg-yellow-900/20 transition-colors"
                                            title="Cambiar contraseña"
                                        >
                                            <KeyRound size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u._id)}
                                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                                            title="Eliminar usuario"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {expandedPwdId === u._id && (
                                    <div className="px-4 pb-4 bg-slate-900/40 border-t border-slate-700/50">
                                        <p className="text-xs text-slate-400 pt-3 pb-2">Nueva contraseña para <strong className="text-white">{u.name}</strong></p>
                                        <div className="flex gap-2">
                                            <input
                                                type="password"
                                                value={newPwd}
                                                onChange={e => { setNewPwd(e.target.value); setPwdError(''); }}
                                                placeholder="Mínimo 8 caracteres"
                                                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={() => submitPwd(u._id)}
                                                disabled={pwdLoading}
                                                className="p-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg disabled:opacity-50 transition-colors"
                                                title="Confirmar"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={closePwdForm}
                                                className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                                                title="Cancelar"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        {pwdError && (
                                            <p className="text-red-400 text-xs mt-2">{pwdError}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
