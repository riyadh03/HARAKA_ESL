import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

interface Patient {
  id: string
  name: string
  status: 'critical' | 'review' | 'clean'
  painScore?: number
  redFlags?: string[]
}

interface TriageInboxProps {
  patients: Patient[]
  selectedPatient: Patient | null
  onSelectPatient: (patient: Patient) => void
}

export default function TriageInbox({ patients, selectedPatient, onSelectPatient }: TriageInboxProps) {
  const critical = patients.filter((p) => p.status === 'critical')
  const review = patients.filter((p) => p.status === 'review')
  const clean = patients.filter((p) => p.status === 'clean')

  const handleValidateAll = () => {
    alert('All clean protocols validated and approved!')
  }

  const renderPatientCard = (patient: Patient) => (
    <motion.button
      key={patient.id}
      onClick={() => onSelectPatient(patient)}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
        selectedPatient?.id === patient.id
          ? 'border-emerald-600 bg-emerald-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-2 mb-1">
        <div className="mt-0.5">
          {patient.status === 'critical' && <AlertTriangle size={16} className="text-red-600" />}
          {patient.status === 'review' && <AlertCircle size={16} className="text-amber-500" />}
          {patient.status === 'clean' && <CheckCircle size={16} className="text-emerald-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate text-sm">{patient.name}</p>
          {patient.painScore !== undefined && (
            <p className="text-xs text-slate-600">Pain: {patient.painScore}/5</p>
          )}
        </div>
      </div>
      {patient.redFlags && patient.redFlags.length > 0 && (
        <div className="ml-6 text-xs text-red-600 font-medium">
          {patient.redFlags.slice(0, 1).map((flag, i) => (
            <p key={i}>{flag}</p>
          ))}
          {patient.redFlags.length > 1 && <p>+{patient.redFlags.length - 1} more</p>}
        </div>
      )}
    </motion.button>
  )

  return (
    <div className="bg-white flex flex-col h-full">
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
        <h2 className="font-outfit font-bold text-slate-900">Priority Triage</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Critical */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <h3 className="font-outfit font-bold text-slate-900 text-sm">
              Critical ({critical.length})
            </h3>
          </div>
          <div className="space-y-2">
            {critical.length > 0
              ? critical.map(renderPatientCard)
              : <p className="text-xs text-slate-500 italic">No critical cases</p>}
          </div>
        </div>

        {/* Review */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <h3 className="font-outfit font-bold text-slate-900 text-sm">
              Review ({review.length})
            </h3>
          </div>
          <div className="space-y-2">
            {review.length > 0
              ? review.map(renderPatientCard)
              : <p className="text-xs text-slate-500 italic">No pending reviews</p>}
          </div>
        </div>

        {/* Clean */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <h3 className="font-outfit font-bold text-slate-900 text-sm">
              Conformes ({clean.length})
            </h3>
          </div>
          <div className="space-y-2">
            {clean.length > 0
              ? clean.map(renderPatientCard)
              : <p className="text-xs text-slate-500 italic">No clean cases</p>}
          </div>
        </div>
      </div>

      {clean.length > 0 && (
        <div className="sticky bottom-0 p-4 border-t border-slate-200 bg-white shadow-lg">
          <motion.button
            onClick={handleValidateAll}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg text-sm"
          >
            1-Tap Validate All
          </motion.button>
        </div>
      )}
    </div>
  )
}
