import { useState } from 'react'
import TriageInbox from '../components/doctor/TriageInbox'
import PatientReport from '../components/doctor/PatientReport'

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

export default function DoctorDashboardView() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(MOCK_PATIENTS[0])
  const [selectedTab, setSelectedTab] = useState<'json' | 'reasoning' | 'report'>('report')

  return (
    <div className="h-[calc(100vh-80px)] flex bg-slate-50">
      {/* Left Sidebar - Triage Inbox */}
      <div className="w-80 border-r border-slate-200 overflow-y-auto">
        <TriageInbox patients={MOCK_PATIENTS} selectedPatient={selectedPatient} onSelectPatient={setSelectedPatient} />
      </div>

      {/* Main Content - Patient Report */}
      <div className="flex-1 overflow-y-auto">
        {selectedPatient && <PatientReport patient={selectedPatient} selectedTab={selectedTab} onTabChange={setSelectedTab} />}
      </div>
    </div>
  )
}
