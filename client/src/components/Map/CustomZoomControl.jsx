import { useMap } from 'react-leaflet';
import { Plus, Minus } from 'lucide-react';

export const CustomZoomControl = () => {
    const map = useMap();

    const preventPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="absolute bottom-14 right-6 flex flex-col gap-1 bg-white/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden z-[1000]"
            onDoubleClick={preventPropagation}
            onMouseDown={preventPropagation}
        >
            <button
                onClick={() => map.zoomIn()}
                className="p-3 hover:bg-white border-b border-gray-200 text-slate-600 active:bg-gray-200 transition-colors"
                title="Acercar"
            >
                <Plus size={24} />
            </button>

            <button
                onClick={() => map.zoomOut()}
                className="p-3 hover:bg-white text-slate-600 active:bg-gray-200 transition-colors"
                title="Alejar"
            >
                <Minus size={24} />
            </button>
        </div>
    );
};