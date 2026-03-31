'use client'

import { useState } from 'react'
import { LogOut, User, Star,Bell, Shield } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { FieldRow } from './FieldRow'
import { Toggle } from './Toggle'
import { RadioOption } from './RadioOption'
import { DeleteModal } from './DeleteModal'
import { Button } from '@/components/ui/Button'
import { MOCK_PROFILE, MOCK_ONBOARDING_ANSWERS } from '@/mocks/settings'

interface SettingsViewProps {
  initialEmailRemindersOn?: boolean
  initialDeleteModalOpen?: boolean
}

export function SettingsView({
  initialEmailRemindersOn = true,
  initialDeleteModalOpen = false
}: SettingsViewProps) {
  const [emailReminders, setEmailReminders] = useState(initialEmailRemindersOn)
  const [reminderFreq, setReminderFreq] = useState<'deadlines' | 'weekly'>('deadlines')
  const [showDeleteModal, setShowDeleteModal] = useState(initialDeleteModalOpen)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="font-display text-h1 text-text-primary mb-8">Settings</h1>

      {/* Profile Section */}
      <SectionCard icon={User} title="Profile">
        <FieldRow
          label="Name"
          value={MOCK_PROFILE.name}
          editable
          onEdit={() => {}}
        />
        <FieldRow
          label="Email"
          value={MOCK_PROFILE.email}
        />

        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            {MOCK_ONBOARDING_ANSWERS.map((answer, index) => (
              <FieldRow
                key={index}
                label={answer.label}
                value={answer.value}
                editable
                onEdit={() => {}}
              />
            ))}
          </div>
          <p className="text-caption italic text-text-tertiary mt-4">
            Changing your answers will update your roadmap to match.
          </p>
        </div>
      </SectionCard>

      {/* Subscription Section */}
      <SectionCard icon={Star} title="Subscription">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-small text-text-primary">Free</span>
            <span className="text-caption bg-secondary-light text-secondary px-2 py-0.5 rounded-badge">
              Phase 1 & 2 only
            </span>
          </div>
        </div>

        <div className="bg-subscription-gradient rounded-card p-4 mt-4 flex items-center justify-between">
          <div>
            <p className="text-white text-small font-medium">Unlock your full roadmap</p>
            <p className="text-white/70 text-caption mt-0.5">Get all tasks + priority guidance</p>
          </div>
          <button className="bg-secondary text-text-primary text-small font-medium px-4 py-2 rounded-button hover:bg-secondary/90 transition-colors">
            Upgrade
          </button>
        </div>
      </SectionCard>

      {/* Notifications Section */}
      <SectionCard icon={Bell} title="Notifications">
        <Toggle
          checked={emailReminders}
          onChange={setEmailReminders}
          label="Email reminders"
          description="Get notified about upcoming deadlines"
          id="email-reminders"
        />

        {emailReminders && (
          <div className="mt-4 space-y-2">
            <div className="text-small font-medium text-text-secondary uppercase tracking-wide mb-2">
              Reminder frequency
            </div>
            <RadioOption
              value="deadlines"
              label="Before deadlines only"
              checked={reminderFreq === 'deadlines'}
              onChange={(value) => setReminderFreq(value as 'deadlines' | 'weekly')}
            />
            <RadioOption
              value="weekly"
              label="Weekly progress summary"
              checked={reminderFreq === 'weekly'}
              onChange={(value) => setReminderFreq(value as 'deadlines' | 'weekly')}
            />
            <p className="text-caption italic text-text-tertiary mt-2">
              We send at most 2 emails per week.
            </p>
          </div>
        )}
      </SectionCard>

      {/* Account Section */}
      <SectionCard icon={Shield} title="Account">
        <Button
          variant="outline"
          onClick={() => {}}
          className="w-full flex items-center gap-2"
        >
          <LogOut size={16} />
          Sign out
        </Button>

        <hr className="border-border my-4" />

        <button
          className="text-caption text-text-tertiary hover:text-error transition-colors"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete account
        </button>
      </SectionCard>

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => setShowDeleteModal(false)}
      />
    </div>
  )
}