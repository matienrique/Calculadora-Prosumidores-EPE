
import React, { useState } from 'react';
import { CoopNoProsumidorGDData, TaxStatus } from '../types';
import { Info, AlertCircle, ArrowLeft } from 'lucide-react';
import Footer from './Footer';

interface Props {
  initialData: CoopNoProsumidorGDData;
  onSubmit: (data: CoopNoProsumidorGDData) => void;
  onBack: () => void;
}

const StepCoopNoProsumidorGDForm: React.FC<Props> = ({ initialData, onSubmit, onBack }) => {
  const [formData, setFormData] = useState<CoopNoProsumidorGDData>(initialData);

  const labelStyle = "block text-base font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-100 to-white/0 p-1.5 pl-3 rounded-l border-l-4 border-slate-500 shadow-sm";

  const handleNumberChange = (field: keyof CoopNoProsumidorGDData, valueStr: string) => {
    const val = valueStr === '' ? 0 : parseFloat(valueStr);
    setFormData(prev => ({ ...prev, [field]: Math.max(0, val) }));
  };

  const handleTaxChange = (status: string) => {
    setFormData(prev => ({ ...prev, taxStatus: status }));
  };

  const getTaxInfo = (status: string) => {
    if (!status) return null;
    switch (status) {
      case 'Responsable inscripto':
        return "IVA aplicable: 27% | Percepción IVA: 3% | Autoconsumo: 35%";
      case 'Responsable inscripto agente percepcion':
        return "IVA aplicable: 27% | Autoconsumo: 35%";
      case 'Exento':
        return "IVA aplicable: 21% | Autoconsumo: 35%";
      default:
        return null;
    }
  };

  const isFormValid = () => {
    return formData.taxStatus !== '' && formData.totalInput > 0;
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200 uppercase tracking-wider">Condición Fiscal</h3>
          <div className="mb-4">
            <label className={labelStyle}>¿Cuál es tu condición fiscal? <span className="text-red-500">*</span></label>
            <select
              value={formData.taxStatus}
              onChange={(e) => handleTaxChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none font-medium"
              required
            >
              <option value="">Seleccione una opción...</option>
              <option value="Responsable inscripto">Responsable inscripto</option>
              <option value="Responsable inscripto agente percepcion">Responsable inscripto agente percepcion</option>
              <option value="Exento">Exento</option>
            </select>
          </div>
          {formData.taxStatus && (
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-semibold flex items-center gap-2 animate-fade-in">
              <Info size={16}/>
              {getTaxInfo(formData.taxStatus)}
            </div>
          )}
        </div>

        {/* 2) DETALLE DE SU FACTURACIÓN */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200 uppercase tracking-wider">Detalle de su facturación</h3>
          <div className="flex flex-col gap-6 max-w-2xl">
            {[
              { id: 'potenciaPV', label: 'Potencia de la instalación fotovoltaica (kW)' },
              { id: 'cargoComercial', label: 'Cargo Comercial (Importe $)' },
              { id: 'cargoCapSumPico', label: 'Cargo Cap. Suministro horario pico (Importe $)' },
              { id: 'cargoCapSumFueraPico', label: 'Cargo Cap. Suministro horario fuera de pico (Importe $)' },
              { id: 'cargoCapPotAdquirida', label: 'Cargo Cap. potencia adquirida (Importe $)' },
              { id: 'tarifaPico', label: 'Tarifa eléctrica horario pico (Importe $)' },
              { id: 'tarifaRestoSin', label: 'Tarifa eléctrica horario resto, sin (Importe $)' },
              { id: 'precioUnitarioResto', label: 'Precio unitario resto (Importe $/kWh)' },
              { id: 'tarifaValle', label: 'Tarifa eléctrica horario valle (Importe $)' },
              { id: 'recargoFactorPotencia', label: 'Recargo por factor de potencia (Importe $)' },
              { id: 'capInput', label: 'Cuota de Alumbrado Público C.A.P (Importe $)' },
              { id: 'subtotalGeneralInput', label: 'Subtotal General (Importe $)' }
            ].map(field => (
              <div key={field.id}>
                <label className="block text-xs font-bold text-gray-600 mb-1">{field.label}</label>
                <input
                  type="number" step="0.01" min="0"
                  value={formData[field.id as keyof CoopNoProsumidorGDData] || ''}
                  onChange={(e) => handleNumberChange(field.id as keyof CoopNoProsumidorGDData, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 outline-none"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-lg font-extrabold text-slate-800 mb-2">TOTAL (Importe $) <span className="text-red-500">*</span></label>
            <input
              type="number" step="0.01" min="0" required
              value={formData.totalInput || ''}
              onChange={(e) => handleNumberChange('totalInput', e.target.value)}
              className="w-full p-4 text-2xl font-bold border border-slate-300 rounded focus:ring-2 focus:ring-slate-500 outline-none text-right shadow-inner"
            />
          </div>
        </div>

        {/* 3) DETALLE DE SU CONSUMO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200 uppercase tracking-wider uppercase tracking-wide">Detalle de su consumo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Consumo Horario pico (kWh)</label>
                <input
                  type="number" step="any" min="0"
                  value={formData.consumoPico || ''}
                  onChange={(e) => handleNumberChange('consumoPico', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Consumo Horario resto (kWh)</label>
                <input
                  type="number" step="any" min="0"
                  value={formData.consumoResto || ''}
                  onChange={(e) => handleNumberChange('consumoResto', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Consumo Horario valle (kWh)</label>
                <input
                  type="number" step="any" min="0"
                  value={formData.consumoValle || ''}
                  onChange={(e) => handleNumberChange('consumoValle', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500"
                />
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

export default StepCoopNoProsumidorGDForm;
