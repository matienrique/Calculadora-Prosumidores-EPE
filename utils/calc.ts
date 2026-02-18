
import { CalculationResult, ProsumidorData, NoProsumidorData, NoProsumidorCategory, ProsumidorGDData, TaxStatus, Band } from '../types';

const CONSTANTS = {
  [NoProsumidorCategory.RESIDENCIAL]: { autoconsumo: 0.40, reconUnit: 109.91, gsfUnit: 20.93 },
  [NoProsumidorCategory.COMERCIAL]: { autoconsumo: 0.75, reconUnit: 98.43, gsfUnit: 34.93 },
  [NoProsumidorCategory.INDUSTRIAL]: { autoconsumo: 0.90, reconUnit: 98.43, gsfUnit: 34.93 },
  [NoProsumidorCategory.GRAN_DEMANDA]: { autoconsumo: 0.80, reconUnit: 98.43, gsfUnit: 34.93 },
};

const safeDiv = (num: number, den: number): number => {
  if (den === 0 || isNaN(den)) return 0;
  return num / den;
};

export const calculateProsumidor = (data: ProsumidorData): CalculationResult => {
  const { eg, ee, er, serviceQuota, bands, reconEPE, cap, ley12692, reconGSF, taxStatus, totalBill } = data;

  let ivaCorrespondiente = 0.21;
  let percepcion = 0;
  
  if (taxStatus === TaxStatus.RESPONSABLE_INSCRIPTO) {
    ivaCorrespondiente = 0.27;
  } else if (taxStatus === TaxStatus.CONSUMIDOR_FINAL) {
    ivaCorrespondiente = 0.21;
  } else if (taxStatus === TaxStatus.MONOTRIBUTO) {
    ivaCorrespondiente = 0.27;
  } else if (taxStatus === TaxStatus.SUJETO_NO_CATEGORIZADO) {
    ivaCorrespondiente = 0.27;
    percepcion = 0.135;
  } else if (taxStatus === TaxStatus.EXENTO) {
    ivaCorrespondiente = 0.21;
  }

  const lastBand = bands[bands.length - 1];
  const prevBands = bands.slice(0, bands.length - 1);
  const sumPrevEnergy = prevBands.reduce((sum, b) => sum + b.energy, 0);
  const consumoUltimaBanda = (eg + ee - er) - sumPrevEnergy;

  const sumPrevAmount = prevBands.reduce((sum, b) => sum + b.amount, 0);
  const lastBandPriceRatio = safeDiv(lastBand.amount, lastBand.energy);
  const subtotalSinProsumidores = serviceQuota + sumPrevAmount + (lastBandPriceRatio * consumoUltimaBanda);

  const sumAllBandsAmount = bands.reduce((sum, b) => sum + b.amount, 0);
  const subtotalConProsumidores = serviceQuota + sumAllBandsAmount;

  const importeConPros = totalBill;
  let importeSinPros = 0;
  if (taxStatus === TaxStatus.SUJETO_NO_CATEGORIZADO) {
    const baseImponibleSinProsumidores = subtotalSinProsumidores;
    const Impuesto_percepcion = ((baseImponibleSinProsumidores + cap) * (1 + ivaCorrespondiente)) * percepcion;
    const impuestosSinPros = (baseImponibleSinProsumidores * (ivaCorrespondiente + 0.06 + 0.015)) + (cap * (1 + ivaCorrespondiente)) + ley12692 + Impuesto_percepcion;
    importeSinPros = baseImponibleSinProsumidores + impuestosSinPros;
  } else {
    const calculatedTaxA = (ivaCorrespondiente + 0.06 + 0.015) * subtotalSinProsumidores;
    const calculatedTaxB = cap * (1 + ivaCorrespondiente);
    importeSinPros = subtotalSinProsumidores + calculatedTaxA + calculatedTaxB + ley12692;
  }

  const ahorroConsumo = subtotalSinProsumidores - subtotalConProsumidores;
  const baseTaxCon = subtotalConProsumidores - reconEPE;
  let finalImpuestosConPros = 0;
  if (taxStatus === TaxStatus.SUJETO_NO_CATEGORIZADO) {
      const baseImp = subtotalConProsumidores - reconEPE;
      const ImpPer = ((baseImp + cap) * (1 + ivaCorrespondiente)) * percepcion;
      finalImpuestosConPros = (baseImp * (ivaCorrespondiente + 0.015 + 0.06)) + (cap * (1 + ivaCorrespondiente)) + ley12692 + ImpPer;
  } else {
      finalImpuestosConPros = (baseTaxCon * (ivaCorrespondiente + 0.06 + 0.015)) + (cap * (1 + ivaCorrespondiente)) + ley12692;
  }

  const ahorroImpuestos = (importeSinPros - subtotalSinProsumidores) - finalImpuestosConPros;
  const savingsRecon = reconEPE + reconGSF;
  const ahorroTotal = importeSinPros - importeConPros;
  const ahorroTotalPercent = safeDiv(ahorroTotal, importeSinPros) * 100;
  const autoconsumo = eg - er;
  const autoconsumoPercent = safeDiv(autoconsumo, eg) * 100;
  const injectionPercent = 100 - (isNaN(autoconsumoPercent) ? 0 : autoconsumoPercent);
  const co2 = 0.041 * autoconsumo;
  const arboles = Math.round(safeDiv(co2, (20 / 6)));

  return {
    type: 'STANDARD',
    billWithProsumers: importeConPros,
    billWithoutProsumers: importeSinPros,
    totalSavings: ahorroTotal,
    totalSavingsPercent: ahorroTotalPercent,
    savingsConsumption: ahorroConsumo,
    savingsTax: ahorroImpuestos,
    savingsRecon: savingsRecon,
    autoconsumoKwh: autoconsumo,
    autoconsumoPercent,
    injectionPercent,
    co2Avoided: co2,
    treesEquivalent: arboles,
    details: {
      "Condición Fiscal": taxStatus || "No seleccionada",
      "IVA": `${(ivaCorrespondiente * 100).toFixed(1)}%`,
      subtotalSinProsumidores,
      subtotalConProsumidores,
      consumoUltimaBanda,
      "Energía Generada Total": eg,
    }
  };
};

export const calculateProsumidorGD = (data: ProsumidorGDData): CalculationResult => {
  const { capGD, leyGD, reconGSF_GD, taxStatus, cargoComercial, cargoCapSumPico, cargoCapSumFPico, cargoPotenciaPico, eaConsPico, eaConsResto, eaConsValle, recargoBonifFP, totalPagar, entPico, entResto, entValle, recPico, recResto, recValle, genPico, genResto, genValle, subtotalGeneral, subtotalConsumoEnergia } = data;

  let ivaCorrespondiente = 0.27;
  let percepcionCorrespondiente = 0.03;
  
  if (taxStatus === TaxStatus.RESPONSABLE_INSCRIPTO) {
    ivaCorrespondiente = 0.27;
    percepcionCorrespondiente = 0.03;
  } else if (taxStatus === TaxStatus.RESPONSABLE_INSCRIPTO_AGENTE) {
    ivaCorrespondiente = 0.27;
    percepcionCorrespondiente = 0.0;
  } else if (taxStatus === TaxStatus.EXENTO) {
    ivaCorrespondiente = 0.21;
    percepcionCorrespondiente = 0.0;
  }

  const energiaPicoSinPros = entPico - recPico + genPico;
  const energiaRestoSinPros = entResto - recResto + genResto;
  const energiaValleSinPros = entValle - recValle + genValle;
  const energiaNetaPico = entPico - recPico;
  const energiaNetaResto = entResto - recResto;
  const energiaNetaValle = entValle - recValle;
  const precioUnitarioPico = safeDiv(eaConsPico, energiaNetaPico);
  const precioUnitarioResto = safeDiv(eaConsResto, energiaNetaResto);
  const precioUnitarioValle = safeDiv(eaConsValle, energiaNetaValle);
  const eaConsPicoSinPros = precioUnitarioPico * energiaPicoSinPros;
  const eaConsRestoSinPros = precioUnitarioResto * energiaRestoSinPros;
  const eaConsValleSinPros = precioUnitarioValle * energiaValleSinPros;
  const eaConsTotalSinPros = (cargoComercial + cargoCapSumPico + cargoCapSumFPico + cargoPotenciaPico) + eaConsPicoSinPros + eaConsRestoSinPros + eaConsValleSinPros;
  const subtotalConsumoEnergiaSinPros = eaConsTotalSinPros - recargoBonifFP; 
  const totalImpuestosSinPros = (subtotalConsumoEnergiaSinPros * (ivaCorrespondiente + 0.06 + 0.015 + percepcionCorrespondiente)) + leyGD + (capGD * (1 + ivaCorrespondiente));
  const subtotalGeneralSinPros = subtotalConsumoEnergiaSinPros + totalImpuestosSinPros;
  const totalPagarSinPros = subtotalGeneralSinPros - reconGSF_GD; 

  const taxesPaidUser = subtotalGeneral - subtotalConsumoEnergia;
  const savingsTax = totalImpuestosSinPros - taxesPaidUser;
  const savingsConsumption = subtotalConsumoEnergiaSinPros - subtotalConsumoEnergia;
  const savingsRecon = reconGSF_GD; 
  const termCO2 = (genResto - recResto) + (genValle - recValle) + (genPico - recPico);
  const co2 = 0.041 * termCO2;
  const arboles = Math.round(safeDiv(co2, (10 / 6)));
  const totalSavings = totalPagarSinPros - totalPagar;
  const totalSavingsPercent = safeDiv(totalSavings, totalPagarSinPros) * 100;
  const autoconsumoKwh = termCO2; 
  const totalGen = genPico + genResto + genValle;
  const autoconsumoPercent = safeDiv(autoconsumoKwh, totalGen) * 100;
  const injectionPercent = 100 - (isNaN(autoconsumoPercent) ? 0 : autoconsumoPercent);

  return {
    type: 'GD', 
    billWithProsumers: totalPagar,
    billWithoutProsumers: totalPagarSinPros,
    totalSavings: totalSavings,
    totalSavingsPercent: totalSavingsPercent,
    savingsConsumption: savingsConsumption,
    savingsTax: savingsTax,
    savingsRecon: savingsRecon,
    autoconsumoKwh: autoconsumoKwh,
    autoconsumoPercent: autoconsumoPercent,
    injectionPercent: injectionPercent,
    co2Avoided: co2,
    treesEquivalent: arboles,
    details: {
      "IVA Correspondiente": `${(ivaCorrespondiente * 100).toFixed(1)}%`,
      "Percepción Correspondiente": `${(percepcionCorrespondiente * 100).toFixed(1)}%`,
      "Energía Pico (Sin Prosumidores)": energiaPicoSinPros,
      "Energía Resto (Sin Prosumidores)": energiaRestoSinPros,
      "Energía Valle (Sin Prosumidores)": energiaValleSinPros,
      "Energía Activa Total (Sin Prosumidores)": eaConsTotalSinPros,
      "Total Impuestos (Sin Prosumidores)": totalImpuestosSinPros,
      "Total a Pagar (Sin Prosumidores)": totalPagarSinPros,
      "Energía Generada Total": totalGen,
    }
  };
};

export const calculateNoProsumidor = (data: NoProsumidorData): CalculationResult => {
  if (data.category === NoProsumidorCategory.GRAN_DEMANDA) {
    const gd = data.gdData;
    if (!gd) throw new Error("GD Data missing");
    const generacionPromedio = (gd.contractedPower * 1629.1) / 12;
    const lastRow = gd.consumptionTable[5] || { pico: 0, resto: 0, valle: 0 };
    const consumoTotalRealPico = lastRow.pico;
    const consumoTotalRealResto = lastRow.resto;
    const consumoTotalRealValle = lastRow.valle;
    const consumoTotalReal = consumoTotalRealPico + consumoTotalRealResto + consumoTotalRealValle;
    const energiaGeneradaPico = Math.ceil(generacionPromedio) * 0.08;
    const energiaGeneradaResto = Math.ceil(generacionPromedio) * 0.92;
    const energiaGeneradaValle = Math.ceil(generacionPromedio) * 0.0;
    const autoconsumoEstimado = 0.80;
    const energiaRecibidaParaPico = Math.ceil(energiaGeneradaPico * (1 - autoconsumoEstimado));
    const energiaRecibidaParaResto = Math.ceil(energiaGeneradaResto * (1 - autoconsumoEstimado));
    const energiaRecibidaParaValle = Math.ceil(energiaGeneradaValle * (1 - autoconsumoEstimado));
    const energiaRecibidaTotal = energiaRecibidaParaPico + energiaRecibidaParaResto + energiaRecibidaParaValle;
    let energiaEntregadaPico = consumoTotalRealPico + energiaRecibidaParaPico - energiaGeneradaPico;
    let energiaEntregadaResto = consumoTotalRealResto + energiaRecibidaParaResto - energiaGeneradaResto;
    let energiaEntregadaValle = consumoTotalRealValle + energiaRecibidaParaValle - energiaGeneradaValle;
    if (energiaEntregadaPico < 0) { energiaEntregadaResto += Math.abs(energiaEntregadaPico); energiaEntregadaPico = 0; }
    if (energiaEntregadaValle < 0) { energiaEntregadaResto += Math.abs(energiaEntregadaValle); energiaEntregadaValle = 0; }
    if (energiaEntregadaResto < 0) { energiaEntregadaResto = 0; }
    const eaConsPicoCPGD = energiaEntregadaPico * gd.eaConsPicoPrice;
    const eaConsRestoCPGD = energiaEntregadaResto * gd.eaConsRestoPrice;
    const eaConsValleCPGD = energiaEntregadaValle * gd.eaConsVallePrice;
    const sumCargosFijos = gd.cargoComercial + gd.cargoCapSumPico + gd.cargoCapSumFPico + gd.cargoPotAdqPico;
    const subtotalConsumoEnergiaCPGD = (eaConsPicoCPGD + eaConsRestoCPGD + eaConsValleCPGD) + sumCargosFijos - gd.energiaReactivaAmount;
    const reconEPESF_CPGD = energiaRecibidaTotal * gd.eaConsRestoPrice;
    const baseImpuestosCPGD = subtotalConsumoEnergiaCPGD - reconEPESF_CPGD;
    let ivaRate = 0.27; let percepcionRate = 0.03;
    if (gd.taxStatus === 'Responsable Inscripto') { ivaRate = 0.27; percepcionRate = 0.03; }
    else if (gd.taxStatus === 'Responsable Inscripto Agente Percepción') { ivaRate = 0.27; percepcionRate = 0.0; }
    else if (gd.taxStatus === 'Exento') { ivaRate = 0.21; percepcionRate = 0.0; }
    const totalImpuestosCPGD = (ivaRate + 0.06 + 0.015 + percepcionRate) * baseImpuestosCPGD + (gd.cap * (1 + ivaRate + percepcionRate)) + gd.ley12692;
    const reconGSF = (energiaGeneradaResto + energiaGeneradaPico + energiaGeneradaValle) * 34.93;
    const totalPagarCPGD = baseImpuestosCPGD + totalImpuestosCPGD - reconGSF;
    const ahorroReconEPE = reconEPESF_CPGD;
    const ahorroReconGSF = reconGSF;
    const ahorroAutoconsumo = gd.subtotalEnergiaAmount - subtotalConsumoEnergiaCPGD; 
    const ahorroImpuestos = (gd.totalToPay - gd.subtotalEnergiaAmount) - totalImpuestosCPGD;
    const ahorroTotal = ahorroReconEPE + ahorroReconGSF + ahorroAutoconsumo + ahorroImpuestos;
    const co2 = 0.041 * ((energiaGeneradaResto - energiaRecibidaParaResto) + (energiaGeneradaValle - energiaRecibidaParaValle) + (energiaGeneradaPico - energiaRecibidaParaPico));
    return {
      type: 'GD',
      billWithProsumers: totalPagarCPGD,
      billWithoutProsumers: gd.totalToPay,
      totalSavings: ahorroTotal,
      totalSavingsPercent: safeDiv(ahorroTotal, gd.totalToPay) * 100,
      savingsConsumption: ahorroAutoconsumo,
      savingsTax: ahorroImpuestos,
      savingsRecon: ahorroReconEPE + ahorroReconGSF,
      autoconsumoKwh: 0,
      co2Avoided: co2,
      treesEquivalent: Math.round(co2 / (10/6)),
      details: { "Generación promedio": generacionPromedio, "SUBTOTAL CONSUMO CPGD": subtotalConsumoEnergiaCPGD, "TOTAL IMPUESTOS CPGD": totalImpuestosCPGD, "TOTAL A PAGAR CPGD": totalPagarCPGD, "Energía Generada Total": generacionPromedio }
    };
  }

  const { category, consumptionHistory, totalConsumption, serviceQuota, bands, cap, ley12692, taxStatus, totalBill } = data;
  const config = CONSTANTS[category];
  const AUTO_CONST = config.autoconsumo;
  const RECON_UNIT = config.reconUnit;
  const GSF_UNIT = config.gsfUnit;

  let IVA_correspondiente = 0.21;
  let Percepcion_correspondiente = 0;
  switch (taxStatus) {
    case TaxStatus.RESPONSABLE_INSCRIPTO: IVA_correspondiente = 0.27; break;
    case TaxStatus.CONSUMIDOR_FINAL: IVA_correspondiente = 0.21; break;
    case TaxStatus.MONOTRIBUTO: IVA_correspondiente = 0.27; break;
    case TaxStatus.SUJETO_NO_CATEGORIZADO: IVA_correspondiente = 0.27; Percepcion_correspondiente = 0.135; break;
    case TaxStatus.EXENTO: IVA_correspondiente = 0.21; break;
  }

  const subtotalBasicoSinPros = bands.reduce((sum, b) => sum + b.amount, 0) + serviceQuota;
  const importeFacturaSinPros = totalBill;
  const impuestosSinPros = importeFacturaSinPros - subtotalBasicoSinPros;
  const sumHistory = consumptionHistory.reduce((a, b) => a + b, 0);
  const estimacionPotenciaMax = sumHistory / 1629;
  const generacionPromedio = estimacionPotenciaMax * (1629 / 6);
  const energiaGenerada = Math.ceil(generacionPromedio);
  const energiaRecibida = energiaGenerada * (1 - AUTO_CONST);
  const autoconsumo2 = energiaGenerada - energiaRecibida;

  let precioUnitario = 0; let iteraciones = 0; let energiasUtilizadas = 0;
  const reversedBands = [...bands].reverse();
  let found = false; let currentAccEnergy = 0;
  for (let i = 0; i < reversedBands.length; i++) {
    currentAccEnergy += reversedBands[i].energy;
    if ((currentAccEnergy - autoconsumo2) > 0) { precioUnitario = safeDiv(reversedBands[i].amount, reversedBands[i].energy); iteraciones = i + 1; energiasUtilizadas = currentAccEnergy; found = true; break; }
  }
  if (!found && reversedBands.length > 0) { precioUnitario = safeDiv(reversedBands[0].amount, reversedBands[0].energy); iteraciones = reversedBands.length; energiasUtilizadas = reversedBands[0].energy; }

  const energiaUltimaBandaConPros = energiasUtilizadas - autoconsumo2;
  const limitIndex = Math.max(0, (bands.length - iteraciones + 1) - 1);
  const subtotalBasicoConProsumidores = serviceQuota + bands.slice(0, limitIndex).reduce((sum, b) => sum + b.amount, 0) + (precioUnitario * energiaUltimaBandaConPros);
  const reconocimientoEPE = RECON_UNIT * energiaRecibida;
  const baseImponible = subtotalBasicoConProsumidores - reconocimientoEPE;
  const impuestosConPros = (baseImponible * (IVA_correspondiente + 0.06 + 0.015)) + (cap * (1 + IVA_correspondiente)) + ley12692;
  const reconocimientoGSF = GSF_UNIT * energiaRecibida;
  const facturaConPros = (baseImponible + impuestosConPros - reconocimientoGSF) * (1 + Percepcion_correspondiente);
  const ahorroTotal = importeFacturaSinPros - facturaConPros;
  const co2 = energiaGenerada * 0.041;

  return {
    type: 'NO_PROSUMIDOR',
    billWithProsumers: facturaConPros,
    billWithoutProsumers: importeFacturaSinPros,
    totalSavings: ahorroTotal,
    totalSavingsPercent: safeDiv(ahorroTotal, importeFacturaSinPros) * 100,
    savingsConsumption: subtotalBasicoSinPros - subtotalBasicoConProsumidores,
    savingsTax: impuestosSinPros - impuestosConPros,
    savingsRecon: reconocimientoEPE + reconocimientoGSF,
    autoconsumoKwh: autoconsumo2,
    co2Avoided: co2,
    treesEquivalent: Math.round(co2 / (10/12)),
    details: { "Energía Generada": energiaGenerada, "Subtotal con Pros": subtotalBasicoConProsumidores, "Impuestos con Pros": impuestosConPros, "Energía Generada Total": energiaGenerada }
  };
};
