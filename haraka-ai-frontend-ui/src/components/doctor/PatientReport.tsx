import { useState } from 'react'
import { Download, Edit2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface Patient {
  id: string
  name: string
  status: 'critical' | 'review' | 'clean'
  painScore?: number
  redFlags?: string[]
}

interface PatientReportProps {
  patient: Patient
  selectedTab: 'json' | 'reasoning' | 'report'
  onTabChange: (tab: 'json' | 'reasoning' | 'report') => void
}

const MOCK_JSON = {
  session_id: 'SES-2024-0518-001',
  patient_name: 'Aammi Lahcen',
  timestamp: '2024-05-18T14:32:00Z',
  exercise_type: 'Knee Flexion',
  total_reps: 15,
  completed_reps: 8,
  joint_angles: [45, 47, 46, 48, 50, 49, 51, 52],
  pain_score: 4,
  form_quality: 0.78,
  notes: 'Slight deviation in form detected at reps 5-7',
}

const MOCK_REASONING = `The AI model analyzed the patient's movement data and identified several factors contributing to the current assessment:

1. **Pain Levels**: The patient reported a pain score of 4/5, indicating moderate to severe pain during the exercise session.
2. **Form Quality**: 78% form adherence suggests the patient is struggling with proper alignment, particularly in the later repetitions.
3. **Joint Stability**: Minor instability detected in knee extension, which correlates with increased pain reports.
4. **Recovery Status**: Based on historical data, this represents a 15% decrease in performance compared to last session.

**Recommendation**: Continue current protocol with form correction focus. Consider reducing intensity by 20% if pain persists.`

const MOCK_REPORT = `**Patient: Aammi Lahcen | Session: SES-2024-0518-001**

The rehabilitation session conducted on May 18, 2024, shows moderate progress with some concerns requiring attention. The patient completed 8 of 15 repetitions of knee flexion exercises with a form quality score of 78%, indicating room for improvement in biomechanical alignment.

The patient reported pain levels of 4/5 during the session, which aligns with observed form degradation in later repetitions. **An AI-generated insight flagged potential joint instability that was not directly measured by sensors, requiring specialist validation.** This represents a potential case where the AI model extrapolated beyond the raw data, and manual assessment is recommended.

Overall recovery trajectory remains positive with expected completion of full protocol within 2-3 sessions if current intensity is maintained and form corrections are implemented.`

export default function PatientReport({
  patient,
  selectedTab,
  onTabChange,
}: PatientReportProps) {
  const [protocol, setProtocol] = useState('Continue current protocol')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-outfit text-4xl font-bold text-slate-900 mb-2">{patient.name}</h1>
        <p className="text-slate-600">Session ID: SES-2024-0518-001 · Last Updated: 2024-05-18 14:32</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200">
        {[
          { id: 'json', label: 'Session JSON' },
          { id: 'reasoning', label: 'LLM Reasoning' },
          { id: 'report', label: 'Specialist Report' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              selectedTab === tab.id
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={selectedTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {selectedTab === 'json' && (
          <div className="bg-slate-900 text-slate-50 p-6 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{JSON.stringify(MOCK_JSON, null, 2)}</pre>
          </div>
        )}

        {selectedTab === 'reasoning' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 text-slate-900 whitespace-pre-wrap leading-relaxed">
            {MOCK_REASONING}
          </div>
        )}

        {selectedTab === 'report' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-slate-900 leading-relaxed mb-6">
              {MOCK_REPORT.split('\n').map((line, idx) => {
                const isHighlighted = line.includes('AI-generated insight')
                return (
                  <p
                    key={idx}
                    className={`mb-2 ${
                      isHighlighted ? 'bg-amber-400 text-slate-900 px-3 py-1 rounded-md font-medium' : ''
                    }`}
                  >
                    {line}
                  </p>
                )
              })}
            </div>

            {/* Actions */}
            <div className="space-y-4 border-t border-slate-200 pt-6 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 py-3 rounded-lg font-medium hover:bg-slate-200 transition-all shadow-sm hover:shadow-md"
              >
                <Download size={18} />
                Download PDF
              </motion.button>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Edit2 size={16} className="inline mr-2" />
                  Modify Protocol
                </label>
                <textarea
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none h-24 transition-all"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
              >
                Save Changes
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
