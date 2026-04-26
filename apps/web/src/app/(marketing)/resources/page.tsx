import { ExternalLink, FileText, Globe, Phone, Mail, MapPin } from 'lucide-react'

export default function ResourcesPage() {
  const resources = [
    {
      category: "Government & Immigration",
      icon: Globe,
      items: [
        {
          name: "Immigration New Zealand",
          description: "Official visa information and applications",
          url: "https://www.immigration.govt.nz/",
          type: "external" as const
        },
        {
          name: "New Zealand Now",
          description: "Official guide to living and working in NZ",
          url: "https://www.newzealandnow.govt.nz/",
          type: "external" as const
        },
        {
          name: "Inland Revenue Department (IRD)",
          description: "Tax numbers, tax codes, and PAYE information",
          url: "https://www.ird.govt.nz/",
          type: "external" as const
        },
        {
          name: "Work and Income",
          description: "Social services and support payments",
          url: "https://www.workandincome.govt.nz/",
          type: "external" as const
        }
      ]
    },
    {
      category: "Banking & Finance",
      icon: FileText,
      items: [
        {
          name: "Reserve Bank of New Zealand",
          description: "Banking regulations and consumer protection",
          url: "https://www.rbnz.govt.nz/",
          type: "external" as const
        },
        {
          name: "Sorted (Financial Guidance)",
          description: "Government financial guidance and budgeting tools",
          url: "https://sorted.org.nz/",
          type: "external" as const
        },
        {
          name: "Banking Ombudsman",
          description: "Help with banking disputes and complaints",
          url: "https://bankomb.org.nz/",
          type: "external" as const
        }
      ]
    },
    {
      category: "Housing & Utilities",
      icon: MapPin,
      items: [
        {
          name: "Tenancy Services",
          description: "Rental rights, bonds, and tenancy disputes",
          url: "https://www.tenancy.govt.nz/",
          type: "external" as const
        },
        {
          name: "Trade Me Property",
          description: "New Zealand's largest property marketplace",
          url: "https://www.trademe.co.nz/property",
          type: "external" as const
        },
        {
          name: "Electricity Authority",
          description: "Compare power companies and switch providers",
          url: "https://www.powerswitch.org.nz/",
          type: "external" as const
        }
      ]
    },
    {
      category: "Health & Emergency",
      icon: Phone,
      items: [
        {
          name: "Health Navigator",
          description: "Find healthcare services and understand the health system",
          url: "https://www.healthnavigator.org.nz/",
          type: "external" as const
        },
        {
          name: "Healthline (Free Health Advice)",
          description: "24/7 free health advice - Call 0800 611 116",
          url: "tel:0800611116",
          type: "phone" as const
        },
        {
          name: "Mental Health Foundation",
          description: "Mental health support and resources",
          url: "https://www.mentalhealth.org.nz/",
          type: "external" as const
        },
        {
          name: "Lifeline (Crisis Support)",
          description: "24/7 crisis support - Call 0800 543 354",
          url: "tel:0800543354",
          type: "phone" as const
        }
      ]
    }
  ]

  return (
    <div className="bg-bg min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-display text-h1 text-text-primary mb-4">Essential Resources</h1>
          <p className="text-body text-text-secondary max-w-2xl mx-auto">
            Official New Zealand government resources and trusted services to help with your settlement journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {resources.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.category} className="bg-bg-card rounded-card p-8 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-light rounded-button flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-h2 text-text-primary">{category.category}</h2>
                </div>

                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.name} className="border-l-3 border-border pl-4">
                      <a
                        href={item.url}
                        target={item.type === 'external' ? '_blank' : undefined}
                        rel={item.type === 'external' ? 'noopener noreferrer' : undefined}
                        className="group block hover:bg-primary-subtle rounded-button p-3 -m-3 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-body font-semibold text-text-primary group-hover:text-primary mb-1 flex items-center gap-2">
                              {item.name}
                              {item.type === 'external' && <ExternalLink className="h-3 w-3" />}
                              {item.type === 'phone' && <Phone className="h-3 w-3" />}
                            </h3>
                            <p className="text-small text-text-secondary">{item.description}</p>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Emergency Information */}
        <div className="mt-12 bg-error-light border border-error/20 rounded-card p-8 text-center">
          <h2 className="font-display text-h2 text-text-primary mb-4">Emergency Numbers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-h1 font-display text-error mb-2">111</div>
              <p className="text-small text-text-primary font-semibold">Police, Fire, Ambulance</p>
            </div>
            <div>
              <div className="text-h1 font-display text-primary mb-2">0800 543 354</div>
              <p className="text-small text-text-primary font-semibold">Lifeline Crisis Support</p>
            </div>
            <div>
              <div className="text-h1 font-display text-secondary-hover mb-2">0800 611 116</div>
              <p className="text-small text-text-primary font-semibold">Healthline (Free Health Advice)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}