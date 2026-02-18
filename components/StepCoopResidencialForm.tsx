
import React, { useState } from 'react';
import { CoopResidencialData, Band } from '../types';
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import Footer from './Footer';

interface Props {
  initialData: CoopResidencialData;
  onSubmit: (data: CoopResidencialData) => void;
  onBack: () => void;
}

const StepCoopResidencialForm: React.FC<Props> = ({ initialData, onSubmit, onBack }) => {
  const [formData, setFormData] = useState<CoopResidencialData>(initialData);
  const [showFixedCharges, setShowFixedCharges] = useState(true);

  // Estilos consistentes con la interfaz de cooperativa
  const labelStyle = "block text-base font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-100 to-white/0 p-1.5 pl-3 rounded-l border-l-4 border-slate-500 shadow-sm";

  // Handlers genéricos
  const handleNumberChange = (field: keyof CoopResidencialData, valueStr: string) => {
    const val = valueStr === '' ? 0 : parseFloat(valueStr);
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handlePositiveNumberChange = (field: keyof CoopResidencialData, valueStr: string) => {
    const val = valueStr === '' ? 0 : parseFloat(valueStr);
    setFormData(prev => ({ ...prev, [field]: Math.max(0, val) }));
  };

  // Cargos Fijos dinámicos
  const addFixedCharge = () => {
    setFormData(prev => ({ ...prev, cargosFijos: [...prev.cargosFijos, 0] }));
  };

  const removeFixedCharge = (index: number) => {
    const next = [...formData.cargosFijos];
    next.splice(index, 1);
    setFormData(prev => ({ ...prev, cargosFijos: next }));
  };

  const updateFixedCharge = (index: number, valStr: string) => {
    const val = valStr === '' ? 0 : parseFloat(valStr);
    const next = [...formData.cargosFijos];
    next[index] = val;
    setFormData(prev => ({ ...prev, cargosFijos: next }));
  };

  // Bandas dinámicas
  const addBand = () => {
    const newBand: Band = { id: crypto.randomUUID(), name: `Banda`, energy: 0, amount: 0 };
    setFormData(prev => ({ ...prev, bands: [...prev.bands, newBand] }));
  };

  const removeBand = (index: number) => {
    const next = [...formData.bands];
    next.splice(index, 1);
    setFormData(prev => ({ ...prev, bands: next }));
  };

  const updateBand = (index: number, field: keyof Band, value: number) => {
    const next = [...formData.bands];
    next[index] = { ...next[index], [field]: Math.max(0, value) };
    setFormData(prev => ({ ...prev, bands: next }));
  };

  const isFormValid = () => {
    return formData.totalPagar > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in flex-grow">
        
        {/* A.1 DETALLE DE SU CONSUMO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200">DETALLE DE SU CONSUMO</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>Energía Generada (X) [kWh]</label>
              <input
                type="number" min="0" step="any"
                value={formData.energiaGenerada || ''}
                onChange={(e) => handlePositiveNumberChange('energiaGenerada', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelStyle}>Energía Inyectada (I) [kWh]</label>
              <input
                type="number" min="0" step="any"
                value={formData.energiaInyectada || ''}
                onChange={(e) => handlePositiveNumberChange('energiaInyectada', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelStyle}>Energía Entregada (C) [kWh]</label>
              <input
                type="number" min="0" step="any"
                value={formData.energiaEntregada || ''}
                onChange={(e) => handlePositiveNumberChange('energiaEntregada', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* A.2 DETALLE DE SU FACTURA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200">DETALLE DE SU FACTURA</h3>
          
          {/* A.2.1 Cargos fijos desplegable */}
          <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
            <button 
              type="button"
              onClick={() => setShowFixedCharges(!showFixedCharges)}
              className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span className="font-bold text-slate-700">Cargos fijos</span>
              {showFixedCharges ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {showFixedCharges && (
              <div className="p-4 space-y-3 bg-white">
                {formData.cargosFijos.map((val, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-grow">
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Cargo fijo {idx + 1} ($)</label>
                      <input
                        type="number" step="0.01"
                        value={val || ''}
                        onChange={(e) => updateFixedCharge(idx, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    {idx > 0 && (
                      <button type="button" onClick={() => removeFixedCharge(idx)} className="mt-5 p-2 text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFixedCharge}
                  className="text-xs flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-2 rounded hover:bg-slate-200 transition-colors mt-2 font-bold"
                >
                  <Plus size={14} /> Agregar cargo fijo
                </button>
              </div>
            )}
          </div>

          {/* A.2.2 Reconocimiento */}
          <div className="mb-6">
            <label className={labelStyle}>Reconocimiento por beneficio ambiental ($)</label>
            <input
              type="number" min="0" step="0.01"
              value={formData.reconocimientoAmbiental || ''}
              onChange={(e) => handlePositiveNumberChange('reconocimientoAmbiental', e.target.value)}
              className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
              placeholder="0.00"
            />
          </div>

          {/* A.2.3 Bandas de energía */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-bold text-slate-800">Bandas de energía</h4>
              <button
                type="button"
                onClick={addBand}
                className="text-xs flex items-center gap-1 bg-slate-50 text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors font-bold"
              >
                <Plus size={14} /> Agregar Banda
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.bands.map((band, index) => (
                <div key={band.id} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex-1">
                    <label className="text-sm font-bold text-slate-700 mb-1 block">Banda #{index + 1}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number" placeholder="Energía (kWh)" min="0" step="any"
                          value={band.energy || ''}
                          onChange={(e) => updateBand(index, 'energy', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 outline-none"
                        />
                        <span className="text-[10px] text-gray-400">kWh</span>
                      </div>
                      <div>
                        <input
                          type="number" placeholder="Importe ($)" min="0" step="0.01"
                          value={band.amount || ''}
                          onChange={(e) => updateBand(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 outline-none"
                        />
                        <span className="text-[10px] text-gray-400">$ ARS</span>
                      </div>
                    </div>
                  </div>
                  {index > 0 && (
                    <button type="button" onClick={() => removeBand(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totales Factura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className={labelStyle}>Subtotal Energía Eléctrica ($)</label>
               <input
                 type="number" step="0.01"
                 value={formData.subtotalEnergia || ''}
                 onChange={(e) => handleNumberChange('subtotalEnergia', e.target.value)}
                 className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
                 placeholder="0.00"
               />
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-inner">
               <label className="block text-lg font-extrabold text-slate-800 mb-2">
                 TOTAL A PAGAR ($) <span className="text-red-500">*</span>
               </label>
               <input
                 type="number" step="0.01" required
                 value={formData.totalPagar || ''}
                 onChange={(e) => handleNumberChange('totalPagar', e.target.value)}
                 className="w-full p-3 text-xl font-bold border border-slate-300 rounded focus:ring-2 focus:ring-slate-500 outline-none text-right shadow-sm"
                 placeholder="0.00"
               />
               {!isFormValid() && (
                 <div className="mt-2 text-red-600 font-bold text-xs flex items-center gap-1">
                   <AlertCircle size={14}/> Campo obligatorio para continuar
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* A.3 IMPUESTOS/GRAVÁMENES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200">IMPUESTOS/GRAVÁMENES</h3>
          <div>
            <label className={labelStyle}>Subtotal Impuestos/Gravámenes Energía Eléctrica ($)</label>
            <input
              type="number" step="0.01"
              value={formData.subtotalImpuestos || ''}
              onChange={(e) => handleNumberChange('subtotalImpuestos', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Botones Navegación */}
        <div className="flex flex-col-reverse md:flex-row gap-4 justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors shadow-sm"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`px-8 py-3 rounded-lg font-bold text-white transition-all shadow-md ${
              isFormValid() 
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 hover:shadow-lg transform hover:-translate-y-0.5' 
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            Calcular Ahorro
          </button>
        </div>
      </form>
      <Footer />
    </div>
  );
};

export default StepCoopResidencialForm;
