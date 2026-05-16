import { CheckCircle } from 'lucide-react'

export default function HardwareHealthBadge() {
  return (
    <div className="flex items-center gap-2 bg-emerald-600 text-slate-50 px-4 py-3 rounded-lg font-medium">
      <CheckCircle size={20} className="flex-shrink-0" />
      <div>
        <p className="font-outfit font-bold">Hardware Health</p>
        <p className="text-sm text-emerald-50">Camera & Lighting: Optimal</p>
      </div>
    </div>
  )
}
