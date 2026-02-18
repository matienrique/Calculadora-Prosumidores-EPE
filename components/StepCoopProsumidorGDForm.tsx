
import React, { useState } from 'react';
import { CoopProsumidorGDData, TaxStatus } from '../types';
import { Info, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Footer from './Footer';

interface Props {
  initialData: CoopProsumidorGDData;
  onSubmit: (data: CoopProsumidorGDData) => void;
  onBack: () => void;
}

const StepCoopProsumidorGDForm: React.FC<Props> = ({ initialData, onSubmit, onBack }) => {
  const [formData, setFormData] = useState<CoopProsumidorGDData>(initialData);

  const labelStyle = "block text-base font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-100 to-white/0 p-1.5 pl-3 rounded-l border-l-4 border-slate-500 shadow-sm";

  const handleNumberChange = (field: keyof CoopProsumidorGDData, valueStr: string) => {
    const val = valueStr === '' ? 0 : parseFloat(valueStr);
    setFormData(prev => ({ ...prev, [field]: Math.max(0, val) }));
  };

  const handleTaxChange = (status: TaxStatus) => {
    setFormData(prev => ({ ...prev, taxStatus: status }));
  };

  const getTaxInfo = (status: TaxStatus | '') => {
    if (!status) return null;
    switch (status) {
      case TaxStatus.RESPONSABLE_INSCRIPTO:
        return "IVA aplicable: 27% | Percepción IVA: 3%";
      case TaxStatus.RESPONSABLE_INSCRIPTO_AGENTE:
        return "IVA aplicable: 27%";
      case TaxStatus.EXENTO:
        return "IVA aplicable: 21%";
      default:
        return null;
    }
  };

  const isFormValid = () => {
    return formData.taxStatus !== '' && formData.totalPagar > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) onSubmit(formData);
  };

  return (
    <div className="flex flex-col min-h-full">
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in flex-grow">
        
        {/* 1) CONDICIÓN FISCAL */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200">Condición Fiscal</h3>
          <div className="mb-4">
            <label className={labelStyle}>¿Cuál es tu condición fiscal? <span className="text-red-500">*</span></label>
            <select
              value={formData.taxStatus}
              onChange={(e) => handleTaxChange(e.target.value as TaxStatus)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none font-medium"
              required
            >
              <option value="">Seleccione una opción...</option>
              <option value={TaxStatus.RESPONSABLE_INSCRIPTO}>Responsable inscripto</option>
              <option value={TaxStatus.RESPONSABLE_INSCRIPTO_AGENTE}>Responsable inscripto agente percepción</option>
              <option value={TaxStatus.EXENTO}>Exento</option>
            </select>
          </div>
          {formData.taxStatus && (
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-semibold flex items-center gap-2 animate-fade-in">
              <Info size={16}/>
              {getTaxInfo(formData.taxStatus as TaxStatus)}
            </div>
          )}
        </div>

        {/* 2) DETALLE DE FACTURACIÓN (Vertical List) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200">DETALLE DE FACTURACIÓN</h3>
          <div className="flex flex-col gap-6 max-w-2xl">
            {[
              { id: 'cuotaServicio', label: 'Cuota de servicio' },
              { id: 'cargoCapPico', label: 'Cargo Cap. Suministro horario pico' },
              { id: 'cargoCapFueraPico', label: 'Cargo Cap. Suministro horario fuera de pico' },
              { id: 'cargoCapPotAdquirida', label: 'Cargo Cap. potencia adquirida' },
              { id: 'tarifaPico', label: 'Tarifa eléctrica horario pico' },
              { id: 'tarifaResto', label: 'Tarifa eléctrica horario resto' },
              { id: 'tarifaValle', label: 'Tarifa eléctrica horario valle' },
              { id: 'bonificacionFactorPotencia', label: 'Bonificación por factor de potencia' },
              { id: 'reconCoopEnergiaRecibida', label: 'Reconocimiento Cooperativa Eléctrica a la energía renovable recibida' },
              { id: 'subtotalBasico', label: 'Subtotal Básico' },
              { id: 'subtotalGeneral', label: 'Subtotal General' },
              { id: 'reconGSFEnergiaGenerada', label: 'Reconocimiento GSF a la energía renovable generada a PYMES' }
            ].map(field => (
              <div key={field.id}>
                <label className="block text-xs font-bold text-gray-600 mb-1">{field.label} ($)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={formData[field.id as keyof CoopProsumidorGDData] || ''}
                  onChange={(e) => handleNumberChange(field.id as keyof CoopProsumidorGDData, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 outline-none"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-lg font-extrabold text-slate-800 mb-2">TOTAL A PAGAR ($) <span className="text-red-500">*</span></label>
            <input
              type="number" step="0.01" min="0" required
              value={formData.totalPagar || ''}
              onChange={(e) => handleNumberChange('totalPagar', e.target.value)}
              className="w-full p-4 text-2xl font-bold border border-slate-300 rounded focus:ring-2 focus:ring-slate-500 outline-none text-right shadow-inner"
            />
          </div>
        </div>

        {/* 3, 4, 5) DETALLE DE SU CONSUMO (Energy fields grouping) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200 uppercase tracking-wide">Detalle de su consumo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* ENERGÍA ENTREGADA */}
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-700 mb-4 border-b pb-2 border-slate-200 uppercase">ENERGÍA ENTREGADA (kWh)</h3>
                <div className="space-y-4">
                  {['Pico', 'Resto', 'Valle'].map(h => (
                    <div key={`ent-${h}`}>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{h}</label>
                      <input
                        type="number" step="any" min="0"
                        value={formData[`entregada${h}` as keyof CoopProsumidorGDData] || ''}
                        onChange={(e) => handleNumberChange(`entregada${h}` as keyof CoopProsumidorGDData, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                  ))}
                </div>
             </div>

             {/* GENERACIÓN RENOVABLE */}
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-700 mb-4 border-b pb-2 border-slate-200 uppercase">GENERACIÓN RENOVABLE (kWh)</h3>
                <div className="space-y-4">
                  {['Pico', 'Resto', 'Valle'].map(h => (
                    <div key={`gen-${h}`}>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{h}</label>
                      <input
                        type="number" step="any" min="0"
                        value={formData[`generada${h}` as keyof CoopProsumidorGDData] || ''}
                        onChange={(e) => handleNumberChange(`generada${h}` as keyof CoopProsumidorGDData, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                  ))}
                </div>
             </div>

             {/* ENERGÍA RECIBIDA */}
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-700 mb-4 border-b pb-2 border-slate-200 uppercase">ENERGÍA RECIBIDA (kWh)</h3>
                <div className="space-y-4">
                  {['Pico', 'Resto', 'Valle'].map(h => (
                    <div key={`rec-${h}`}>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{h}</label>
                      <input
                        type="number" step="any" min="0"
                        value={formData[`recibida${h}` as keyof CoopProsumidorGDData] || ''}
                        onChange={(e) => handleNumberChange(`recibida${h}` as keyof CoopProsumidorGDData, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-4 justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`px-8 py-3 rounded-lg font-bold text-white transition-all shadow-md ${
              isFormValid() 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg transform hover:-translate-y-0.5' 
                : 'bg-red-300 cursor-not-allowed'
            }`}
          >
            Calcular
          </button>
        </div>
      </form>
      <Footer />
    </div>
  );
};

export default StepCoopProsumidorGDForm;
