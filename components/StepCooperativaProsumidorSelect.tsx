
import React from 'react';
import { UserType } from '../types';
import { Home, Store, Factory, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import Footer from './Footer';

interface Props {
  onSelect: (type: UserType) => void;
  onBack: () => void;
}

const StepCooperativaProsumidorSelect: React.FC<Props> = ({ onSelect, onBack }) => {
  const options = [
    { type: UserType.COOPERATIVA_PROSUMIDOR_RESIDENCIAL, label: 'Usuario Residencial', icon: <Home className="w-6 h-6" /> },
    { type: UserType.COOPERATIVA_PROSUMIDOR_COMERCIAL, label: 'Usuario Comercial', icon: <Store className="w-6 h-6" /> },
    { type: UserType.COOPERATIVA_PROSUMIDOR_INDUSTRIAL, label: 'Usuario Industrial', icon: <Factory className="w-6 h-6" /> },
    { type: UserType.COOPERATIVA_PROSUMIDOR_GD, label: 'Usuario Gran Demanda', icon: <Zap className="w-6 h-6" /> },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col items-center py-10 flex-grow animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Cooperativa – Soy prosumidor</h2>
        
        <div className="w-full max-w-2xl px-4 space-y-4">
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              className="flex items-center justify-between w-full px-6 py-5 bg-white border-2 border-gray-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors text-slate-600">
                  {opt.icon}
                </div>
                <span className="text-lg font-bold text-gray-800">{opt.label}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-slate-500 transform group-hover:translate-x-1 transition-all" />
            </button>
          ))}
          
          <div className="pt-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 font-medium hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={18} />
              Volver
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StepCooperativaProsumidorSelect;
