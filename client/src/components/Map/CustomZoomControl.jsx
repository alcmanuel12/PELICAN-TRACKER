import { useMap } from 'react-leaflet';
import { Plus, Minus } from 'lucide-react';

export const CustomZoomControl = () => {
    const map = useMap();

    const preventPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="absolute bottom-14 right-6 flex flex-col bg-blue-500 text-white rounded-2xl shadow-lg overflow-hidden z-[1000]"
            onDoubleClick={preventPropagation}
            onMouseDown={preventPropagation}
        >
            <button
                onClick={() => map.zoomIn()}
                className="p-3 hover:bg-blue-600 active:bg-blue-700 transition-colors border-b border-blue-400/50 flex items-center justify-center"
                title="Acercar"
            >
                <Plus size={24} />
            </button>

            <button
                onClick={() => map.zoomOut()}
                className="p-3 hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center"
                title="Alejar"
            >
                <Minus size={24} />
            </button>
        </div>
    );
};