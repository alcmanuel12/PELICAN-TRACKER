import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const StopsContext = createContext({ stops: [], checkpoints: [], loading: true, error: null, refreshStops: () => {} });

export const useStops = () => useContext(StopsContext);

export const StopsProvider = ({ children }) => {
    const [stops, setStops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadStops = () => {
        setLoading(true);
        api.get('/api/stops')
            .then(r => r.ok ? r.json() : Promise.reject(new Error('Error cargando paradas')))
            .then(setStops)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadStops(); }, []);

    const checkpoints = stops.filter(s => s.isCheckpoint);

    return (
        <StopsContext.Provider value={{ stops, checkpoints, loading, error, refreshStops: loadStops }}>
            {children}
        </StopsContext.Provider>
    );
};
