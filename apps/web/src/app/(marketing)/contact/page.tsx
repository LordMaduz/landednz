'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Book, ExternalLink } from 'lucide-react'

export default function ContactPage() {
  const [copied, setCopied] = useState('')

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="bg-bg min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-display text-h1 text-text-primary mb-4">Contact & Support</h1>
          <p className="text-body text-text-secondary">
            Get help with your LandedNZ settlement journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* General Support */}
          <div className="bg-bg-card rounded-card p-8 border border-border">
            <div className="w-12 h-12 bg-primary-light rounded-button flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-display text-h2 text-text-primary mb-3">General Support</h2>
            <p className="text-body text-text-secondary mb-4">
              Questions about your roadmap, account, or how to use LandedNZ
            </p>
            <button
              onClick={() => copyToClipboard('support@landednz.com', 'support')}
              className="text-primary hover:underline text-body font-medium flex items-center gap-2"
            >
              support@landednz.com
              {copied === 'support' ? (
                <span className="text-success text-small">Copied!</span>
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Feedback */}
          <div className="bg-bg-card rounded-card p-8 border border-border">
            <div className="w-12 h-12 bg-secondary-light rounded-button flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-secondary-hover" />
            </div>
            <h2 className="font-display text-h2 text-text-primary mb-3">Feature Requests & Feedback</h2>
            <p className="text-body text-text-secondary mb-4">
              Ideas for improving LandedNZ or feedback on your experience
            </p>
            <button
              onClick={() => copyToClipboard('feedback@landednz.com', 'feedback')}
              className="text-primary hover:underline text-body font-medium flex items-center gap-2"
            >
              feedback@landednz.com
              {copied === 'feedback' ? (
                <span className="text-success text-small">Copied!</span>
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Official Resources */}
        <div className="bg-warning-light border border-secondary/20 rounded-card p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-secondary rounded-button flex items-center justify-center shrink-0 mt-1">
              <Book className="h-5 w-5 text-text-primary" />
            </div>
            <div>
              <h3 className="font-display text-h3 text-text-primary mb-2">Need Official Immigration Advice?</h3>
              <p className="text-body text-text-primary mb-4">
                LandedNZ provides general settlement guidance. For specific immigration questions,
                visa extensions, or complex legal matters, consult with licensed professionals:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://www.immigration.govt.nz/find-an-adviser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-text-inverse rounded-button text-small font-semibold hover:bg-primary-hover transition-colors"
                >
                  Find a Licensed Adviser
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://www.newzealandnow.govt.nz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-bg border border-border text-text-primary rounded-button text-small font-semibold hover:bg-bg-hover transition-colors"
                >
                  Official NZ Government Resources
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}