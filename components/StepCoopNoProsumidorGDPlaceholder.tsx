
import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import Footer from './Footer';

interface Props {
  onBack: () => void;
}

const StepCoopNoProsumidorGDPlaceholder: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col items-center justify-center py-20 flex-grow animate-fade-in text-center px-6">
        <div className="bg-slate-100 p-6 rounded-full mb-6 text-slate-400">
          <Construction size={64} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cooperativa – No soy prosumidor – Gran Demanda</h2>
        <p className="text-xl text-gray-500 mb-8">Próximamente</p>
        
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default StepCoopNoProsumidorGDPlaceholder;
