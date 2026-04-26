'use client'

import { useState } from 'react'
import { AlertTriangle, X, Briefcase, Users, FileText, Home, Compass, Building, Building2, Mountain, MapPin, User, Heart, Monitor, Stethoscope, GraduationCap, Calculator, Wrench, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { VisaType, City, FamilySituation, Occupation } from '@landednz/types'

interface UpdateProfileModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (profile: UpdateProfileData) => void
  currentProfile: {
    visaType: VisaType
    city: City
    familySituation: FamilySituation
    occupation: Occupation
  }
  isUpdating?: boolean
}

export interface UpdateProfileData {
  visaType: VisaType
  city: City
  familySituation: FamilySituation
  occupation: Occupation
  arrivalDate: string
}

const visaOptions = [
  { value: 'AEWV' as VisaType, label: 'Accredited Employer Work Visa', icon: Briefcase },
  { value: 'PARTNER_OF_STUDENT' as VisaType, label: 'Partner of a Student or Worker', icon: Users },
  { value: 'GREEN_LIST_WORK' as VisaType, label: 'Green List Work Visa', icon: FileText },
  { value: 'GREEN_LIST_RESIDENCE' as VisaType, label: 'Green List - Straight to Residence', icon: Home },
  { value: 'OTHER' as VisaType, label: 'Other or not sure yet', icon: Compass },
]

const cityOptions = [
  { value: 'AUCKLAND' as City, label: 'Auckland', icon: Building },
  { value: 'WELLINGTON' as City, label: 'Wellington', icon: Building2 },
  { value: 'CHRISTCHURCH' as City, label: 'Christchurch', icon: Mountain },
  { value: 'OTHER' as City, label: 'Somewhere else', icon: MapPin },
]

const familyOptions = [
  { value: 'SOLO' as FamilySituation, label: 'Arriving alone', icon: User },
  { value: 'COUPLE_DUAL_WORK' as FamilySituation, label: 'Couple - Both with work visas', icon: Users },
  { value: 'COUPLE_CONSTRAINED' as FamilySituation, label: 'Couple - One on a partner visa', icon: Heart },
  { value: 'FAMILY_WITH_CHILDREN' as FamilySituation, label: 'Family with children', icon: Home },
]

const occupationOptions = [
  { value: 'TECHNOLOGY' as Occupation, label: 'Technology / Engineering', icon: Monitor },
  { value: 'HEALTHCARE' as Occupation, label: 'Healthcare', icon: Stethoscope },
  { value: 'EDUCATION' as Occupation, label: 'Education', icon: GraduationCap },
  { value: 'FINANCE' as Occupation, label: 'Finance / Accounting', icon: Calculator },
  { value: 'TRADES' as Occupation, label: 'Trades', icon: Wrench },
  { value: 'OTHER_PROFESSIONAL' as Occupation, label: 'Other professional', icon: Briefcase },
  { value: 'SEEKING_WORK' as Occupation, label: 'Still looking for work', icon: Search },
]

export function UpdateProfileModal({ open, onClose, onConfirm, currentProfile, isUpdating = false }: UpdateProfileModalProps) {
  const [selectedProfile, setSelectedProfile] = useState(currentProfile)
  const [confirmationText, setConfirmationText] = useState('')

  const isValid = confirmationText === 'UPDATE MY PROFILE'

  if (!open) return null

  const handleConfirm = () => {
    if (!isValid) return

    onConfirm({
      ...selectedProfile,
      // Use current date as arrival date since we're updating existing profile
      arrivalDate: new Date().toISOString().split('T')[0]
    })
  }

  return (
    <div className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card rounded-card shadow-modal w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-h2 text-text-primary">Update Your Profile</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary rounded-button transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start gap-4 bg-warning-light border border-warning/20 rounded-button p-4">
            <AlertTriangle className="h-6 w-6 text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-text-primary mb-2">This will regenerate your entire roadmap</h3>
              <p className="text-small text-text-secondary">
                Your task completion progress will be preserved, but all task priorities and recommendations
                will update based on your new information.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Selection */}
        <div className="p-6 space-y-8">
          {/* Visa Type */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3">What brings you to New Zealand?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visaOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedProfile(prev => ({ ...prev, visaType: option.value }))}
                    className={`flex items-center gap-3 p-3 rounded-button border-2 transition-colors text-left ${
                      selectedProfile.visaType === option.value
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-small font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* City */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3">Which city are you arriving in?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cityOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedProfile(prev => ({ ...prev, city: option.value }))}
                    className={`flex items-center gap-3 p-3 rounded-button border-2 transition-colors text-left ${
                      selectedProfile.city === option.value
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-small font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Family Situation */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3">Who are you settling in with?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {familyOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedProfile(prev => ({ ...prev, familySituation: option.value }))}
                    className={`flex items-center gap-3 p-3 rounded-button border-2 transition-colors text-left ${
                      selectedProfile.familySituation === option.value
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-small font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Occupation */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3">What's your professional background?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {occupationOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedProfile(prev => ({ ...prev, occupation: option.value }))}
                    className={`flex items-center gap-3 p-3 rounded-button border-2 transition-colors text-left ${
                      selectedProfile.occupation === option.value
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-small font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="bg-warning-light border border-warning/20 rounded-button p-4">
            <h4 className="font-semibold text-text-primary mb-2">Type "UPDATE MY PROFILE" to confirm:</h4>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type confirmation text"
              className="w-full p-3 border border-border rounded-button text-small"
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || isUpdating}
            className="flex-1"
          >
            {isUpdating ? 'Updating Profile...' : 'Update Profile'}
          </Button>
        </div>
      </div>
    </div>
  )
}