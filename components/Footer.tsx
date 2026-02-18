import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-white border-t border-gray-200 py-8 no-print">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-600">
        
        <div className="space-y-3">
          <h4 className="font-bold text-gray-800 uppercase tracking-wider mb-2">Contacto</h4>
          
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p>Francisco Miguens 260. Torre 2. Piso 4.</p>
              <p>Ciudad de Santa Fe</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:text-right">
          <div className="flex items-center gap-3 md:justify-end">
            <Phone className="w-5 h-5 text-gray-400" />
            <p>Cel: (0341) 472-1556 <span className="text-gray-400">|</span> Interno 45790</p>
          </div>
          
          <div className="flex items-center gap-3 md:justify-end">
            <Mail className="w-5 h-5 text-gray-400" />
            <a href="mailto:secretariaenergia@santafe.gov.ar" className="text-violet-600 hover:underline">
              secretariaenergia@santafe.gov.ar
            </a>
          </div>
        </div>

      </div>
      <div className="text-center mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Gobierno de Santa Fe
      </div>
    </footer>
  );
};

export default Footer;