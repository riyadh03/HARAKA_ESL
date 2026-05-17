import type { FC } from 'react'

export interface EmojiPainScaleProps {
  painScore: number
  onPainScoreChange: (score: number) => void
}

declare const EmojiPainScale: FC<EmojiPainScaleProps>
export default EmojiPainScale
