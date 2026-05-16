import { useState } from 'react'
import TriageInbox from '../components/doctor/TriageInbox'
import PatientReport from '../components/doctor/PatientReport'
import { ArrowLeft } from 'lucide-react'

interface Patient {
  id: string
  name: string
  status: 'critical' | 'review' | 'clean'
  painScore?: number
  redFlags?: string[]
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Aammi Lahcen',
    status: 'critical',
    painScore: 4,
    redFlags: ['Abnormal gait', 'Joint instability'],
  },
  {
    id: '2',
    name: 'Hassan Markib',
    status: 'review',
    painScore: 2,
  },
  { id: '3', name: 'Fatima Aziz', status: 'clean' },
  { id: '4', name: 'Mohamed Said', status: 'clean' },
  { id: '5', name: 'Zahra Nassir', status: 'clean' },
]

interface DoctorDashboardProps {
  onBack?: () => void
}

export default function DoctorDashboardView({ onBack }: DoctorDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(MOCK_PATIENTS[0])

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-inter">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center gap-4 flex-shrink-0 z-10">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
        )}
        <h1 className="font-outfit text-2xl font-bold text-slate-900">Dashboard Médecin (Edge-to-Cloud)</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Triage Inbox */}
        <div className="w-80 border-r border-slate-200 overflow-y-auto bg-white flex-shrink-0">
          <TriageInbox patients={MOCK_PATIENTS} selectedPatient={selectedPatient} onSelectPatient={setSelectedPatient} />
        </div>

        {/* Main Content - Patient Report */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          {selectedPatient ? (
            <PatientReport patient={selectedPatient} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Sélectionnez un patient pour voir le rapport
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
