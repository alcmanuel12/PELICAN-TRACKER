// client/src/components/UI/GlassCard.jsx

export const GlassCard = ({ children, title, className = "" }) => {
  return (
    <div className={`bg-blue-50/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-4 min-w-[240px] animate-fade-in ${className}`}>
      {/* Si le pasamos un título, lo muestra en mayúsculas arriba */}
      {title && (
        <h3 className="text-center text-slate-700 font-bold uppercase tracking-widest text-sm mb-3 border-b border-white/30 pb-2">
          {title}
        </h3>
      )}
      
      {/* Aquí va el contenido (la lista de paradas, los botones, etc.) */}
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
};