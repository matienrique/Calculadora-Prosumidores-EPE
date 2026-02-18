
import React, { useState, useEffect } from 'react';
import { CoopNoProsumidorData, CoopUserCategory, TaxStatus, Band } from '../types';
import { Plus, Trash2, Info, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Footer from './Footer';

interface Props {
  initialData: CoopNoProsumidorData;
  onSubmit: (data: CoopNoProsumidorData) => void;
  onBack: () => void;
}

const StepCoopNoProsumidorForm: React.FC<Props> = ({ initialData, onSubmit, onBack }) => {
  const [formData, setFormData] = useState<CoopNoProsumidorData>(initialData);
  const [showFixedCharges, setShowFixedCharges] = useState(true);

  // Constants
  const AUTOCONSUMO_MAP = {
    [CoopUserCategory.RESIDENCIAL]: 0.40,
    [CoopUserCategory.COMERCIAL]: 0.75,
    [CoopUserCategory.INDUSTRIAL]: 0.90,
  };

  // Styles
  const labelStyle = "block text-base font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-100 to-white/0 p-1.5 pl-3 rounded-l border-l-4 border-slate-500 shadow-sm";

  // Handlers
  const handleCategoryChange = (cat: CoopUserCategory) => {
    setFormData(prev => ({
      ...prev,
      userCategory: cat,
      autoconsumoEstimado: AUTOCONSUMO_MAP[cat]
    }));
  };

  const handleNumberChange = (field: keyof CoopNoProsumidorData, valueStr: string) => {
    const val = valueStr === '' ? 0 : parseFloat(valueStr);
    setFormData(prev => ({ ...prev, [field]: Math.max(0, val) }));
  };

  const handleContractedPowerModeChange = (knows: boolean) => {
    setFormData(prev => ({ ...prev, knowsContractedPower: knows }));
  };

  const handleHistoryModeChange = (knows: boolean) => {
    setFormData(prev => ({ ...prev, knowsAverageConsumption: knows }));
  };

  const handleTableChange = (index: number, valStr: string) => {
    const val = valStr === '' ? 0 : parseFloat(valStr);
    const newTable = [...formData.monthlyConsumptionTable];
    newTable[index] = Math.max(0, val);
    setFormData(prev => ({ ...prev, monthlyConsumptionTable: newTable }));
  };

  // Fixed Charges
  const addFixedCharge = () => setFormData(prev => ({ ...prev, cargosFijos: [...prev.cargosFijos, 0] }));
  const removeFixedCharge = (i: number) => {
    const next = [...formData.cargosFijos];
    next.splice(i, 1);
    setFormData(prev => ({ ...prev, cargosFijos: next }));
  };
  const updateFixedCharge = (i: number, v: string) => {
    const next = [...formData.cargosFijos];
    next[i] = v === '' ? 0 : parseFloat(v);
    setFormData(prev => ({ ...prev, cargosFijos: next }));
  };

  // Bands
  const addBand = () => {
    setFormData(prev => ({ 
      ...prev, 
      bands: [...prev.bands, { id: crypto.randomUUID(), name: `Banda`, energy: 0, amount: 0 }] 
    }));
  };
  const removeBand = (i: number) => {
    const next = [...formData.bands];
    next.splice(i, 1);
    setFormData(prev => ({ ...prev, bands: next }));
  };
  const updateBand = (i: number, field: keyof Band, val: number) => {
    const next = [...formData.bands];
    next[i] = { ...next[i], [field]: Math.max(0, val) };
    setFormData(prev => ({ ...prev, bands: next }));
  };

  // Validation
  const isFormValid = () => {
    return (
      formData.userCategory !== '' &&
      formData.taxStatus !== '' &&
      formData.totalPagar > 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) onSubmit(formData);
  };

  const getTaxInfo = (status: TaxStatus | '') => {
    if (!status) return null;
    switch (status) {
      case TaxStatus.RESPONSABLE_INSCRIPTO: return "IVA aplicable: 27% | Percepción: 0%";
      case TaxStatus.CONSUMIDOR_FINAL: return "IVA aplicable: 21% | Percepción: 0%";
      case TaxStatus.MONOTRIBUTO: return "IVA aplicable: 27% | Percepción: 0%";
      case TaxStatus.SUJETO_NO_CATEGORIZADO: return "IVA aplicable: 27% | Percepción: 13,5%";
      case TaxStatus.EXENTO: return "IVA aplicable: 21% | Percepción: 0%";
      default: return "";
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in flex-grow">
        
        {/* 1) SELECTOR TIPO USUARIO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200">Tipo de Usuario</h3>
          <div className="mb-4">
            <label className={labelStyle}>Tipo de usuario <span className="text-red-500">*</span></label>
            <select
              value={formData.userCategory}
              onChange={(e) => handleCategoryChange(e.target.value as CoopUserCategory)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none font-medium"
            >
              <option value="">Seleccione...</option>
              {/* Cast Object.values to string[] to resolve the unknown key/node error */}
              {(Object.values(CoopUserCategory) as string[]).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {formData.userCategory && (
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-semibold flex items-center gap-2">
              <Info size={16}/>
              Autoconsumo estimado: {formData.autoconsumoEstimado * 100}%
            </div>
          )}
        </div>

        {/* 2) HISTORIA CONSUMO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200">Historia de Consumo de Energía</h3>
          
          {/* 2.0 Potencia Contratada */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">¿Conoce su potencia contratada?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.knowsContractedPower === true} 
                  onChange={() => handleContractedPowerModeChange(true)}
                  className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                />
                <span>Sí</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.knowsContractedPower === false} 
                  onChange={() => handleContractedPowerModeChange(false)}
                  className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {formData.knowsContractedPower && (
            <div className="mb-6">
              <label className={labelStyle}>Potencia contratada [kW]</label>
              <input
                type="number" min="0" step="any"
                value={formData.contractedPower || ''}
                onChange={(e) => handleNumberChange('contractedPower', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
              />
            </div>
          )}

          {/* 
             2.1 Consumo Promedio / Tabla
             Logic: Show only if Knows Contracted Power is FALSE (or undefined).
             If YES, we hide this part.
          */}
          {formData.knowsContractedPower === false && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">¿Conoce su consumo mensual promedio?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={formData.knowsAverageConsumption} 
                      onChange={() => handleHistoryModeChange(true)}
                      className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                    />
                    <span>Si</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={!formData.knowsAverageConsumption} 
                      onChange={() => handleHistoryModeChange(false)}
                      className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {formData.knowsAverageConsumption ? (
                <div className="mb-6">
                  <label className={labelStyle}>Consumo promedio [kWh]</label>
                  <input
                    type="number" min="0" step="any"
                    value={formData.averageConsumption || ''}
                    onChange={(e) => handleNumberChange('averageConsumption', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full text-sm text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-2 border border-slate-200">Mes</th>
                        <th className="p-2 border border-slate-200">Consumo [kWh]</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.monthlyConsumptionTable.map((val, idx) => (
                        <tr key={idx}>
                          <td className="p-2 border border-slate-200 font-medium">{idx + 1}</td>
                          <td className="p-2 border border-slate-200">
                            <input
                              type="number" min="0"
                              value={val || ''}
                              onChange={(e) => handleTableChange(idx, e.target.value)}
                              className="w-full text-center outline-none bg-transparent"
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* 
             MOVED FIELD: Consumo total real (renamed)
             Shows in History section.
          */}
          <div>
            <label className={labelStyle}>Consumo de energía del presente mes [kWh]</label>
            <input
              type="number" step="any"
              value={formData.consumoTotalReal || ''}
              onChange={(e) => handleNumberChange('consumoTotalReal', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
            />
            {/* Show disclaimer only if NOT knowsContractedPower, or consistent with previous logic? 
                Instruction 1.2 implies if Power=Yes, table is hidden, consumption field shown.
                Instruction 1.3 implies if Power=No, regular flow.
                The field is shown in both cases.
                "Ocultar también cualquier recordatorio adicional... en caso potencia contratada = Sí"
            */}
            {!formData.knowsContractedPower && (
              <p className="text-xs text-gray-500 mt-1 italic">
                Este valor corresponde al consumo total registrado por su medidor y puede encontrarse en el detalle de consumo de su factura.
              </p>
            )}
          </div>

        </div>

        {/* 3) DETALLE FACTURA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 border-slate-200">Detalle de su Factura</h3>

          {/* 3.1 Fiscal */}
          <div className="mb-6">
            <label className={labelStyle}>¿Cuál es su situación fiscal? <span className="text-red-500">*</span></label>
            <select
              value={formData.taxStatus}
              onChange={(e) => setFormData(prev => ({ ...prev, taxStatus: e.target.value as TaxStatus }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
            >
              <option value="">Seleccione...</option>
              {Object.values(TaxStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {formData.taxStatus && (
              <p className="mt-2 text-sm text-slate-600 font-semibold bg-slate-50 p-2 rounded">
                {getTaxInfo(formData.taxStatus)}
              </p>
            )}
          </div>

          {/* 3.2 Cargos Fijos */}
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
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Cargo fijo #{idx + 1} ($)</label>
                      <input
                        type="number" step="0.01"
                        value={val || ''}
                        onChange={(e) => updateFixedCharge(idx, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 outline-none"
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
                  className="text-xs flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-2 rounded hover:bg-slate-200 transition-colors mt-2"
                >
                  <Plus size={14} /> Agregar cargo fijo
                </button>
              </div>
            )}
          </div>

          {/* 3.3 Bandas */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-bold text-slate-800">Bandas de energía</h4>
              <button
                type="button"
                onClick={addBand}
                className="text-xs flex items-center gap-1 bg-slate-50 text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
              >
                <Plus size={14} /> Agregar Banda
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              {formData.bands.map((band, index) => (
                <div key={band.id} className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-100">
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
            
            {/* Disclaimer for Bands */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-800 rounded-r">
              En tu factura, la energía de la última banda suele figurar explícitamente. Si no la tenés, podés estimarla como la diferencia entre el consumo de energía del presente mes y la energía de la penúltima banda.
            </div>
          </div>

          {/* Campos Adicionales */}
          <div className="space-y-4">
            <div>
              <label className={labelStyle}>Subtotal Energía Eléctrica ($)</label>
              <input
                type="number" step="0.01"
                value={formData.subtotalEnergiaElectrica || ''}
                onChange={(e) => handleNumberChange('subtotalEnergiaElectrica', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
              />
            </div>
            <div>
              <label className={labelStyle}>Subtotal Impuestos/Gravámenes Energía Eléctrica ($)</label>
              <input
                type="number" step="0.01"
                value={formData.subtotalImpuestos || ''}
                onChange={(e) => handleNumberChange('subtotalImpuestos', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
              />
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
               <label className="block text-lg font-extrabold text-slate-800 mb-2">
                 TOTAL A PAGAR ($) <span className="text-red-500">*</span>
               </label>
               <input
                 type="number" step="0.01" required
                 value={formData.totalPagar || ''}
                 onChange={(e) => handleNumberChange('totalPagar', e.target.value)}
                 className="w-full p-3 text-xl font-bold border border-slate-300 rounded focus:ring-2 focus:ring-slate-500 outline-none text-right"
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

export default StepCoopNoProsumidorForm;
