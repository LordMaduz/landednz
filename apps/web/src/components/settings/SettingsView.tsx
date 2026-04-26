'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Star, Bell, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRoadmapStore } from '@/lib/stores/roadmapStore'
import { useChatStore } from '@/lib/stores/chatStore'
import { updateOnboardingProfile, type UserProfile } from '@/lib/api'
import { toast } from 'sonner'
import { SectionCard } from './SectionCard'
import { FieldRow } from './FieldRow'
import { Toggle } from './Toggle'
import { RadioOption } from './RadioOption'
import { DeleteModal } from './DeleteModal'
import { UpdateProfileModal, type UpdateProfileData } from './UpdateProfileModal'
import { Button } from '@/components/ui/Button'

interface SettingsViewProps {
  initialEmailRemindersOn?: boolean
  initialDeleteModalOpen?: boolean
}

export function SettingsView({
  initialEmailRemindersOn = true,
  initialDeleteModalOpen = false
}: SettingsViewProps) {
  const router = useRouter()
  const [emailReminders, setEmailReminders] = useState(initialEmailRemindersOn)
  const [reminderFreq, setReminderFreq] = useState<'deadlines' | 'weekly'>('deadlines')
  const [showDeleteModal, setShowDeleteModal] = useState(initialDeleteModalOpen)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Fetch user profile from Supabase session
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUserProfile({
            id: session.user.id,
            email: session.user.email || 'No email',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            provider: session.user.app_metadata?.provider || 'unknown'
          })
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleSignOut = async () => {
    // Reset stores before sign out to clear user data
    useRoadmapStore.getState().reset()
    useChatStore.getState().reset()

    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleUpdateProfile = async (profileData: UpdateProfileData) => {
    setIsUpdatingProfile(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please sign in to update your profile')
        setShowUpdateModal(false)
        router.push('/auth/signin')
        return
      }

      const result = await updateOnboardingProfile(
        {
          visaType: profileData.visaType,
          city: profileData.city,
          familySituation: profileData.familySituation,
          occupation: profileData.occupation,
          arrivalDate: profileData.arrivalDate
        },
        session.access_token
      )

      if (result.success) {
        setShowUpdateModal(false)
        toast.success('Profile updated successfully! Your roadmap has been regenerated.')

        // Clear roadmap store to force refresh
        useRoadmapStore.getState().reset()

        // Refresh the page to reload roadmap data
        router.refresh()
      } else {
        toast.error(result.message || 'Failed to update profile')
      }

    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="font-display text-h1 text-text-primary mb-8">Settings</h1>

      {/* Profile Section */}
      <SectionCard icon={User} title="Profile">
        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : userProfile ? (
          <>
            <FieldRow
              label="Name"
              value={userProfile.name || 'Not set'}
              editable={false}
            />
            <FieldRow
              label="Email"
              value={userProfile.email}
              editable={false}
            />

            <div className="mt-6">
              <div className="bg-bg-subtle rounded-card p-4 border border-border">
                <h4 className="text-small font-semibold text-text-primary mb-2">Settlement Profile</h4>
                <p className="text-caption text-text-secondary mb-4">
                  Your settlement profile contains your visa type, city, family situation, and occupation.
                  This information is used to personalize your roadmap.
                </p>

                <Button
                  variant="outline"
                  onClick={() => setShowUpdateModal(true)}
                  className="w-full"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? 'Updating...' : 'View & Update Settlement Profile'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary">Failed to load profile data</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}
      </SectionCard>

      {/* Beta Access Section */}
      <SectionCard icon={Star} title="Beta Access">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-small text-text-primary">Beta User</span>
            <span className="text-caption bg-secondary-light text-secondary px-2 py-0.5 rounded-badge">
              All features unlocked
            </span>
          </div>
          <div className="w-3 h-3 bg-success rounded-full" title="Active"></div>
        </div>

        <div className="bg-secondary-light rounded-card p-4 mt-4 border border-secondary/15">
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-secondary mt-0.5 flex-shrink-0" aria-hidden="true">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-text-primary text-small font-medium mb-1">Thank you for being a beta user!</p>
              <p className="text-text-secondary text-caption leading-relaxed">
                You have access to all premium features while we're in beta.
                When we launch billing, you'll get 50% off as a thank you for helping us improve.
              </p>
              <p className="text-text-tertiary text-caption mt-2">
                We'll give you 30 days notice before introducing any billing.
              </p>
            </div>
          </div>
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
          onClick={handleSignOut}
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

      <UpdateProfileModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={handleUpdateProfile}
        currentProfile={{
          visaType: 'AEWV', // Default selection - user will update with their actual info
          city: 'AUCKLAND',
          familySituation: 'SOLO',
          occupation: 'OTHER_PROFESSIONAL'
        }}
        isUpdating={isUpdatingProfile}
      />
    </div>
  )
}