import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { api } from '../../../utils/api';
import { useStops } from '../../../context/StopsContext';

const EMPTY_FORM = { nombre: '', lat: '', lng: '', isCheckpoint: false };

export const StopsTab = () => {
    const { stops, loading, refreshStops } = useStops();

    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    const [deleteError, setDeleteError] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        const lat = parseFloat(form.lat);
        const lng = parseFloat(form.lng);
        if (isNaN(lat) || isNaN(lng)) { setFormError('Coordenadas inválidas'); return; }
        setFormLoading(true);
        setFormError('');
        try {
            const res = await api.post('/api/admin/stops', {
                nombre: form.nombre,
                coords: [lat, lng],
                isCheckpoint: form.isCheckpoint
            });
            const data = await res.json();
            if (res.ok) { setForm(EMPTY_FORM); refreshStops(); }
            else setFormError(data.message || 'Error al crear parada');
        } catch {
            setFormError('Error de conexión');
        } finally {
            setFormLoading(false);
        }
    };

    const openEdit = (stop) => {
        setEditId(stop.id);
        setEditForm({ nombre: stop.nombre, lat: stop.coords[0], lng: stop.coords[1], isCheckpoint: stop.isCheckpoint });
        setEditError('');
    };

    const cancelEdit = () => { setEditId(null); setEditError(''); };

    const handleEdit = async (id) => {
        const lat = parseFloat(editForm.lat);
        const lng = parseFloat(editForm.lng);
        if (isNaN(lat) || isNaN(lng)) { setEditError('Coordenadas inválidas'); return; }
        setEditLoading(true);
        setEditError('');
        try {
            const res = await api.patch(`/api/admin/stops/${id}`, {
                nombre: editForm.nombre,
                coords: [lat, lng],
                isCheckpoint: editForm.isCheckpoint
            });
            const data = await res.json();
            if (res.ok) { cancelEdit(); refreshStops(); }
            else setEditError(data.message || 'Error al actualizar');
        } catch {
            setEditError('Error de conexión');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        if (!confirm(`¿Eliminar la parada "${nombre}" permanentemente?`)) return;
        setDeleteError('');
        try {
            const res = await api.delete(`/api/admin/stops/${id}`);
            if (!res.ok) {
                const data = await res.json();
                setDeleteError(data.message || 'Error al eliminar la parada');
            } else {
                refreshStops();
            }
        } catch {
            setDeleteError('Error de conexión al eliminar');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
                <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-200">
                    <Plus size={20} className="text-blue-400" /> Nueva Parada
                </h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Nombre de la parada"
                        value={form.nombre}
                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                        required
                        className="bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <label className="flex items-center gap-3 bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={form.isCheckpoint}
                            onChange={e => setForm(f => ({ ...f, isCheckpoint: e.target.checked }))}
                            className="w-4 h-4 accent-purple-500"
                        />
                        <span className="text-slate-300 text-sm">Es punto de control (checkpoint)</span>
                    </label>
                    <input
                        type="number"
                        step="any"
                        placeholder="Latitud (ej: 38.3452)"
                        value={form.lat}
                        onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                        required
                        className="bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                        type="number"
                        step="any"
                        placeholder="Longitud (ej: -0.4812)"
                        value={form.lng}
                        onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                        required
                        className="bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    {formError && (
                        <p className="sm:col-span-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
                            {formError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={formLoading}
                        className="sm:col-span-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                        {formLoading ? 'Creando...' : <><Plus size={18} /> Crear Parada</>}
                    </button>
                </form>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
                <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-200">
                        <MapPin size={20} className="text-blue-400" /> Paradas Registradas
                    </h2>
                    <span className="text-xs text-slate-500">{stops.length} paradas</span>
                </div>
                {deleteError && (
                    <p className="mx-5 mt-3 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
                        {deleteError}
                    </p>
                )}

                <div className="divide-y divide-slate-700/50 max-h-[520px] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader2 size={24} className="animate-spin text-blue-400" />
                        </div>
                    ) : stops.length === 0 ? (
                        <p className="p-6 text-center text-slate-500">No hay paradas registradas.</p>
                    ) : (
                        stops.map(stop => (
                            <div key={stop.id}>
                                {editId === stop.id ? (
                                    <div className="p-4 bg-slate-900/40 space-y-3">
                                        <p className="text-xs text-slate-400 font-medium">Editando parada #{stop.id}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={editForm.nombre}
                                                onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                                                placeholder="Nombre"
                                                className="bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <label className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.isCheckpoint}
                                                    onChange={e => setEditForm(f => ({ ...f, isCheckpoint: e.target.checked }))}
                                                    className="w-4 h-4 accent-purple-500"
                                                />
                                                <span className="text-slate-300 text-xs">Checkpoint</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={editForm.lat}
                                                onChange={e => setEditForm(f => ({ ...f, lat: e.target.value }))}
                                                placeholder="Latitud"
                                                className="bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <input
                                                type="number"
                                                step="any"
                                                value={editForm.lng}
                                                onChange={e => setEditForm(f => ({ ...f, lng: e.target.value }))}
                                                placeholder="Longitud"
                                                className="bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        {editError && <p className="text-red-400 text-xs">{editError}</p>}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(stop.id)}
                                                disabled={editLoading}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg disabled:opacity-50 transition-colors"
                                            >
                                                <Check size={14} /> Guardar
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
                                            >
                                                <X size={14} /> Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${stop.isCheckpoint ? 'bg-purple-600/20 text-purple-400' : 'bg-blue-600/20 text-blue-400'}`}>
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{stop.nombre}</p>
                                                <p className="text-xs text-slate-400">
                                                    #{stop.id} · {stop.coords[0].toFixed(5)}, {stop.coords[1].toFixed(5)}
                                                    {stop.isCheckpoint && <span className="ml-2 text-purple-400 font-medium">· checkpoint</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openEdit(stop)}
                                                className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
                                                title="Editar parada"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(stop.id, stop.nombre)}
                                                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                                                title="Eliminar parada"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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
