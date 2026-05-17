import React from 'react';
import { ArrowLeft, AlertTriangle, Download } from 'lucide-react';

interface ReportViewProps {
  data: any;
  onClose: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ data, onClose }) => {
  const { report, amber_flags, metrics, patient_id, exercise_type, timestamp } = data;
  const hasFlags = amber_flags && amber_flags.length > 0;
  
  const formattedDate = new Date(timestamp || Date.now()).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex justify-center font-inter print:bg-white print:p-0">
      
      {/* Document Container (A4 style) */}
      <div className="max-w-3xl w-full bg-white shadow-md border border-slate-200 p-8 md:p-12 print:shadow-none print:border-none print:p-0">
        
        {/* Controls (Hidden during printing) */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Download size={18} />
            Télécharger (PDF)
          </button>
        </div>

        {/* Report Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <h1 className="font-outfit text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">Rapport Clinique</h1>
          <h2 className="text-xl font-medium text-slate-500">Haraka.ai Edge-Rehabilitation</h2>
          
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 uppercase tracking-wider font-bold text-xs mb-1">Patient ID</p>
              <p className="font-semibold text-slate-900">{patient_id}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider font-bold text-xs mb-1">Date de Session</p>
              <p className="font-semibold text-slate-900">{formattedDate}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider font-bold text-xs mb-1">Exercice</p>
              <p className="font-semibold text-slate-900">{exercise_type}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider font-bold text-xs mb-1">Données Biométriques</p>
              <p className="font-semibold text-slate-900">Répétitions: {metrics?.reps || 0} • Angle Max: {metrics?.max_angle || 0}°</p>
            </div>
          </div>
        </div>

        {/* AI Report Body */}
        <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed mb-10">
          <div dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br/>') }} />
        </div>

        {/* Amber Flags Section */}
        {hasFlags && (
          <div className="mt-8 border-t-2 border-orange-200 pt-6">
            <h3 className="font-outfit text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Vérification IA (Amber Flags)
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Les affirmations suivantes générées par le modèle LLM n'ont pas pu être vérifiées dans les données brutes (hallucinations possibles).
            </p>
            
            <ul className="space-y-4">
              {amber_flags.map((flag: any, idx: number) => (
                <li key={idx} className="bg-orange-50 p-4 border-l-4 border-orange-400 rounded-r-lg">
                  <p className="font-medium text-slate-800 text-sm mb-1">"{flag.sentence}"</p>
                  <p className="text-xs text-orange-600 font-bold uppercase">Raison : {flag.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>Généré automatiquement par Haraka.ai Edge-To-Cloud Pipeline.</p>
          <p>Conforme CNDP 09-08 (Zero-Recording Policy).</p>
        </div>

      </div>
    </div>
  );
};

export default ReportView;
