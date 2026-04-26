'use client'

import { useState } from 'react'

export function LandingPricing() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <section className="py-20 px-6 bg-bg-card">
      <div className="max-w-[880px] mx-auto">
        <p className="text-caption text-primary text-center mb-3">
          BETA ACCESS
        </p>
        <h2 className="font-display text-h2 text-text-primary text-center mb-8">
          All premium features are free during beta.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Free */}
          <div
            onMouseEnter={() => setHoveredCard('free')}
            onMouseLeave={() => setHoveredCard(null)}
            className="bg-bg rounded-card p-8 border border-border hover:-translate-y-1 transition-transform duration-300 cursor-default"
          >
            <span className="text-caption text-text-tertiary block mb-2">
              Free plan
            </span>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-h1 text-text-primary">
                $0
              </span>
            </div>
            <p className="text-small text-text-secondary mb-6">
              Your first 2 weeks covered
            </p>
            <div className="flex flex-col gap-4">
              {['Personalised roadmap', 'Progress tracking', 'Government source links'].map(
                (item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-success"
                      />
                    </svg>
                    <span className="text-body text-text-primary">
                      {item}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Beta Access */}
          <div
            onMouseEnter={() => setHoveredCard('premium')}
            onMouseLeave={() => setHoveredCard(null)}
            className="bg-bg-card rounded-card p-8 border-2 border-secondary relative overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-default"
          >
            {/* Beta badge */}
            <div className="absolute top-4 right-4 bg-secondary text-text-primary text-caption px-3 py-1 rounded-full font-medium">
              Beta Access
            </div>
            <span className="text-caption text-secondary block mb-2">
              All Features
            </span>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-h1 text-text-primary">
                Free
              </span>
              <span className="text-small text-text-tertiary">during beta</span>
            </div>
            <p className="text-small text-text-secondary mb-6">
              Full 8-week settlement roadmap
            </p>
            <div className="flex flex-col gap-4">
              {[
                'Everything in Free',
                'Complete Phase 3 roadmap',
                'AI settlement advisor',
                'Smart deadline reminders',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    />
                  </svg>
                  <span className="text-body text-text-primary">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Beta notice */}
        <div className="bg-secondary-light border border-secondary/20 rounded-button p-4 px-6 text-center">
          <p className="text-body text-text-primary font-medium">
            <span className="text-secondary font-semibold">You're getting beta access!</span>{' '}
            All premium features are free while we perfect the platform. When we launch billing, beta users get 50% off for life.
          </p>
        </div>
      </div>
    </section>
  )
}