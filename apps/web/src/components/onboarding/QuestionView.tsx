import { cn } from '@/lib/utils/cn'
import { OptionCard } from './OptionCard'

interface QuestionOption {
  value: string
  label: string
  desc?: string
  icon: React.ComponentType<{ className?: string }>
}

interface QuestionViewProps {
  question: string
  subtitle: string
  options: QuestionOption[]
  selectedValue?: string
  onSelect: (value: string) => void
  animState: 'entering' | 'stable' | 'exiting'
}

export function QuestionView({
  question,
  subtitle,
  options,
  selectedValue,
  onSelect,
  animState,
}: QuestionViewProps) {
  const isCompact = options.length > 5

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center px-6 pt-20 pb-10',
        animState === 'entering' && 'animate-[fadeInUp_0.5s_ease-out_forwards]',
        animState === 'exiting' && 'animate-[fadeOutUp_0.35s_ease-in_forwards]'
      )}
    >
      <div className="max-w-onboarding-question w-full">
        {/* Question */}
        <h2 className="font-display text-h1 text-text-primary mb-2">
          {question}
        </h2>
        <p className="text-body text-text-tertiary mb-8 leading-relaxed">
          {subtitle}
        </p>

        {/* Options */}
        <div className={cn('flex flex-col', isCompact ? 'gap-2' : 'gap-2.5')}>
          {options.map((option, i) => (
            <OptionCard
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.desc}
              icon={option.icon}
              isSelected={selectedValue === option.value}
              isCompact={isCompact}
              onClick={onSelect}
              delay={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}