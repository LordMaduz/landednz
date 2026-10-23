# LandedNZ Knowledge Base
## Skilled Migrant Settlement Guide — Auckland, New Zealand
**Document version:** 1.0
**Created:** 2026-03-03
**Verified by:** Ruchira
**Total tasks:** 21
**Coverage:** Pre-arrival through Month 6 settlement

---

## HOW TO USE THIS DOCUMENT

### For AI systems (RAG pipeline)
This document is structured for chunk-based retrieval. Each task entry (T01–T21) is a self-contained chunk. The document header (this section) should be loaded as persistent system context on every query. Task chunks are retrieved based on query relevance.

**Retrieval rules:**
- Always load CHUNK_00 (this header) as system context
- Retrieve 1–3 task chunks per query based on embedding similarity
- Each task chunk is fully self-contained — no cross-chunk dependencies required for coherent response
- Use PERSONA fields to route responses based on known user persona
- Use NUMBER_TYPES field (not prose) to determine caveat requirements before presenting any figure
- Surface PROFESSIONAL_ADVICE_NOTE whenever professional_advice_required = true
- Surface WATCH_OUTS proactively when user reaches a task for the first time

**Number type caveat rules:**
| Type | Label | AI behaviour |
|------|-------|-------------|
| A | Statutory | State as confirmed fact. Cite legislation. |
| B | Administrative | Add caveat: "confirm current rate at [source URL] as this is reviewed periodically." |
| C | Market | Add caveat: "check current rates with [provider/market] as these vary." |

---

### For human readers (developers and collaborators)
Tasks are ordered chronologically by when a migrant should complete them — pre-arrival through Month 6. Each task entry follows an identical schema. Refer to Section 2.2 of the schema design document for full field definitions.

**Quick reference — task phases:**
- T01–T05: Pre-arrival (do before leaving home country)
- T06–T07: Arrival day (Day 1)
- T08–T14: Week 1 through Month 1
- T15–T21: Month 2 through Month 6 (some overlap with earlier phases)

---

## PERSONA DEFINITIONS

### persona_constrained_couple
**Names:** Priya (principal) and Karthik (partner)
**Visa:** Priya — Accredited Employer Work Visa (AEWV). Karthik — Partner of a Worker (Work Visa)
**Origin:** Priya from India (via Singapore, currently working at DBS Bank). Karthik from Sri Lanka.
**Employment:** Priya — Senior Software Engineer, NZ employer TBD. Karthik — Master of AI student, University of Auckland.
**Income:** Single income household during study period
**Settlement context:** Arriving Auckland June 2026. No prior NZ experience. Two countries of origin (India + Sri Lanka). Student + worker dynamic. Cost-conscious.

### persona_solo_aewv
**Profile:** Single skilled migrant on Accredited Employer Work Visa
**Origin:** India or similar non-exempt country (for driving licence, qualification assessment purposes)
**Employment:** Skilled professional, NZ employer confirmed
**Settlement context:** Arriving Auckland alone. No prior NZ experience. Standard AEWV settlement pathway.

---

## PHASE MAP

| Phase | Tasks | Timing |
|-------|-------|--------|
| Pre-Arrival | T01–T05 | 1–3 months before departure |
| Arrival | T06–T07 | Day 1 |
| Week 1 | T08–T14 | Days 1–30 |
| Month 1–2 | T15–T17 | Weeks 4–8 |
| Month 2–6 | T18–T21 | Ongoing |

---

## NUMBER TYPE TAXONOMY

| Type | Label | Definition | AI caveat rule |
|------|-------|------------|----------------|
| A | Statutory | Set by legislation. Cannot be changed without Act of Parliament. | State as fact. Cite Act. |
| B | Administrative | Set by government agency or authority. Reviewed periodically. | State with "confirm current [fee/rate/process] at [URL]." |
| C | Market | Set by commercial providers. Varies between providers and over time. | State as guidance. Direct user to check with provider. |

---

## GLOSSARY OF KEY NZ TERMS

| Term | Definition |
|------|------------|
| ACC | Accident Compensation Corporation. NZ's no-fault accident insurance scheme covering everyone in NZ. |
| AEWV | Accredited Employer Work Visa. Primary skilled migrant work visa pathway. |
| IRD | Inland Revenue Department. NZ's tax authority. |
| IRD number | NZ tax identification number. Equivalent to India's PAN card. |
| IR330 | Tax code declaration form submitted to employer. |
| KiwiSaver | NZ's voluntary (auto-enrolled) workplace retirement savings scheme. |
| PAYE | Pay As You Earn. NZ's system of deducting income tax at source from salary. |
| PHO | Primary Health Organisation. Network of GPs. Enrolment gives subsidised GP rates. |
| NHI | National Health Index number. NZ's health system identifier. |
| NZQA | New Zealand Qualifications Authority. Assesses overseas qualifications. |
| NZQCF | New Zealand Qualifications and Credentials Framework. Levels 1–10. |
| IQA | International Qualification Assessment. NZQA's service for assessing overseas qualifications. |
| Tenancy Tribunal | Disputes body for landlord-tenant matters under Residential Tenancies Act. |
| Bond | Rental security deposit. Maximum 4 weeks rent. Held by Tenancy Services, not landlord. |
| Healthy Homes Standards | Mandatory minimum standards for heating, insulation, ventilation in NZ rentals. |
| Earners' levy | ACC levy deducted via PAYE from all employees. Funds non-work injury cover. |
| Transitional resident | New NZ tax resident in first 4 years. Exempt from tax on most foreign passive income. |
| CCR | Comprehensive Credit Reporting. NZ system that reports both positive and negative credit history. |
| WoF | Warrant of Fitness. NZ vehicle roadworthiness certificate. |
| NZTA | NZ Transport Agency (Waka Kotahi). Administers driving licences and road rules. |
| RTA | Residential Tenancies Act 1986. Primary legislation governing NZ rental relationships. |
| NRE/NRO | Non-Resident External / Non-Resident Ordinary bank accounts. Indian banking classification for non-residents. |
| FEMA | Foreign Exchange Management Act 1999. Indian legislation governing foreign exchange transactions. |

---

*End of document header. Task entries follow.*

---
---
---


---
TASK_ID: T01
TASK_NAME: Auckland Suburb Research
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if Auckland's major employment zones, public transport network, or rental price landscape shifts significantly. Check annually or after major Auckland Council transport announcements.
---

METADATA:
  phase: Pre-Arrival
  timing: 4–6 weeks before departure. Do before booking temporary accommodation (T02).
  time_required: 2–3 hours
  priority_score: 90
  task_type: Free
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
Auckland is New Zealand's largest city and geographically sprawling — the distance from the southern suburbs to the North Shore can mean a 60–90 minute commute each way during peak hours. Choosing the right suburb before arrival determines commute time, daily quality of life, proximity to the South Asian community, and rental cost. This research task should be completed before booking temporary accommodation so your first base is in the right zone. For skilled migrants heading to tech or finance roles, the inner suburbs, CBD-fringe, and North Shore are typically the strongest starting zones.

---

WHAT_AND_WHY:
Auckland sits on a narrow isthmus between two harbours, which means its road network has natural pinch points — particularly the Auckland Harbour Bridge connecting the North Shore to the CBD, and the city centre motorway network. Peak hour traffic (7–9am and 4–6:30pm) on these corridors can turn a 15km drive into a 45–60 minute commute.

Unlike Singapore or Mumbai, Auckland has limited public transport outside the main rail corridors and a few busway routes. Most residents depend on cars for suburb-to-suburb trips. The public transport network is strongest along: the South City Line (Papakura to Britomart), the East West Line (Swanson to Britomart), the Eastern Line (Manukau/Onehunga to Britomart), and the Northern Busway (Albany to Britomart via the North Shore). Note: Train line names changed in 2026 with City Rail Link opening.

For migrants arriving without a car, proximity to a rail station or the Northern Busway significantly improves mobility during the first weeks. For migrants with a car, commute research by Google Maps in peak hour mode is essential before committing to a suburb.

Rental costs in Auckland vary enormously by suburb — from $550–$650/week for a 2-bedroom in South Auckland to $750–$1,100/week for the same in inner suburbs or the North Shore. The cost difference is real but so is the time cost of a long daily commute.

Auckland also has significant South Asian communities concentrated in specific zones — Howick/Botany (East), Papatoetoe/Manurewa (South), Henderson/Massey (West), and parts of the North Shore (Albany). These areas have Indian and Sri Lankan grocery stores, restaurants, temples, and community networks that ease the cultural transition.

---

HOW_TO:
**Step 1 — Identify your two anchor points**
Before researching suburbs, pin your two most important daily destinations:
- Priya's future employer location (or likely zone — CBD, North Shore tech hub, South Auckland)
- University of Auckland campus (Grafton / City — for Karthik, if applicable)
Note these on Google Maps before doing any suburb research.

**Step 2 — Test commute times in peak hour**
Open Google Maps. Set departure time to a weekday at 8:00am. Test the commute from candidate suburbs to both anchor points. Test return journey at 5:00pm. Note total daily commute time. A 25-minute off-peak commute can become 55 minutes in peak hour on Auckland's motorways.

**Step 3 — Check public transport options**
Visit at.govt.nz (Auckland Transport journey planner). For each candidate suburb, check:
- Is there a train station or busway stop within walking distance?
- How frequent are services (every 10 min vs every 30 min makes a large difference)?
- What is the total journey time to your anchor points by PT?

**Step 4 — Check rental prices**
Visit trademe.co.nz/property/rent. Filter by suburb. Search for 2-bedroom apartments or houses. Note the weekly rent range. This gives a realistic current market view — not last year's data. Remember: weekly rent is the NZ standard (not monthly).

**Step 5 — Research community and amenities**
For each shortlisted suburb, search: "[suburb name] Indian grocery Auckland" and "[suburb name] Sri Lankan community Auckland." This gives a sense of cultural infrastructure. Key South Asian grocery concentrations: Botany (East), Papatoetoe (South), Westgate/Henderson (West), Albany (North Shore).

**Step 6 — Shortlist 2–3 suburbs**
Based on commute time, PT access, rental cost, and community amenity, shortlist 2–3 suburbs. These become the target zones when booking temporary accommodation (T02) and when searching for a permanent rental.

---

KEY_FACTS:
- Auckland peak hour traffic (7–9am, 4–6:30pm) can double or triple off-peak commute times on motorway corridors [Type C — market/infrastructure conditions]
- University of Auckland main campus is in Grafton / city centre — central suburbs minimise Karthik's commute [Type C — geographic fact]
- Auckland weekly rents for 2-bedroom properties range approximately $550–$1,100/week depending on suburb [Type C — market, check trademe.co.nz for current rates]
- Auckland's public transport is strongest along rail lines (South City, East West, Eastern) and the Northern Busway [Type C — infrastructure, check at.govt.nz] — line names updated 2026 with City Rail Link opening
- South Asian community concentrations: Botany/Howick (East), Papatoetoe/Manurewa (South), Henderson/Massey (West), Albany (North Shore) [Type C — community, verify via local community groups]
- Google Maps peak hour simulation (set future departure time) is the most reliable free tool for Auckland commute research [Type C — advisory]

---

NUMBER_TYPES:
  - figure: "$550–$1,100/week for 2-bedroom rental depending on suburb"
    type: C
    type_label: Market
    source: trademe.co.nz/property/rent (current listings)
    caveat: "State as guidance only. Direct user to check current listings on trademe.co.nz for accurate current rental prices by suburb."
    last_confirmed: 2026-03-03

  - figure: "60–90 minute peak hour commute from outer suburbs to CBD"
    type: C
    type_label: Market
    source: Google Maps peak hour simulation
    caveat: "State as guidance. Advise user to test their specific route using Google Maps with a future weekday 8am departure time."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya and Karthik have two anchor points: Priya's future employer (likely CBD, North Shore tech corridor, or Newmarket) and the University of Auckland (Grafton/City campus). The optimal suburb balances commute for both. Central Auckland suburbs (Mt Eden, Sandringham, Epsom, Newmarket fringe) put both within 20–30 minutes of their respective destinations and have reasonable public transport. North Shore (Takapuna, Milford, Albany) works well if Priya's employer is North Shore-based — but adds bridge/tunnel bottleneck for Karthik's daily university commute.

  As a cost-conscious single-income household, the rental price difference between inner and outer suburbs is significant. A $150/week savings in South Auckland versus $200/month in transport costs + 2 hours/day in commute time may not represent a real saving. Model the full cost (rent + transport + time) not just rent.

  Sri Lankan community is concentrated in South Auckland (Papatoetoe, Manurewa) and parts of West Auckland. Indian community spans multiple zones. If cultural community proximity is important to Karthik in particular, South Auckland or Botany/East are strongest — but check commute implications carefully.

---

PERSONA_SOLO_AEWV:
  Research commute from candidate suburbs to your confirmed employer location. If employer is CBD-based, inner suburbs (Newmarket, Mt Eden, Grey Lynn, Parnell) or North Shore (if you don't mind the bridge commute) give best access. If employer is North Shore-based (Albany, Takapuna), living North Shore avoids the bridge bottleneck entirely. For a solo migrant, proximity to Indian/Sri Lankan grocery and community is a quality-of-life factor — East Auckland (Botany/Howick) and South Auckland (Papatoetoe) have the strongest concentrations.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T02
      task_name: Temporary Accommodation Booking
      relationship: "Complete T01 before T02. Suburb research determines which zone to book temporary accommodation in. Booking temporary accommodation in the wrong zone wastes time and money repositioning."
    - task_id: T11
      task_name: Rental Agreement and Bond
      relationship: "Suburb shortlist from T01 guides permanent rental search in T11. Knowing which 2–3 suburbs to target makes property searching much faster on arrival."
  inline_references:
    - "trademe.co.nz referenced in HOW_TO Step 4 for current rental prices"
    - "at.govt.nz referenced in HOW_TO Step 3 for PT journey planning"
    - "University of Auckland campus location referenced in WHAT_AND_WHY and PERSONA fields"

---

WATCH_OUTS:
  - Do not judge Auckland suburbs by name recognition alone. Howick and Botany sound unfamiliar but are safe, well-serviced East Auckland suburbs with excellent Indian community infrastructure. Conversely, some central-sounding suburbs have poor PT access.
  - Auckland rental listings show weekly rent, not monthly. A $700/week property costs approximately $3,033/month. Do not confuse with Singapore or Indian monthly rental norms.
  - The Auckland Harbour Bridge is a single choke point. North Shore to CBD commutes are excellent off-peak but can be 40–60 minutes in peak hour. Test this specifically if considering North Shore.
  - Do not rely on Uber or rideshare as a daily commute solution in Auckland — it is significantly more expensive than Singapore or Mumbai and not sustainable as a primary transport mode.
  - Auckland suburb boundaries are not always obvious to outsiders. "Auckland City" is not a specific suburb — it refers to the wider council area. When researching, use specific suburb names (Mt Eden, Takapuna, Papatoetoe etc).

---

SOURCES:
  - title: "Auckland Transport Journey Planner"
    url: "https://at.govt.nz/bus-train-ferry/journey-planner/"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Official Auckland Transport journey planner. Use for PT route and frequency research."

  - title: "TradeMe Property — Rental listings"
    url: "https://www.trademe.co.nz/a/property/residential/rent"
    tier: 3
    tier_label: Commercial
    last_accessed: 2026-03-03
    notes: "Primary NZ property rental marketplace. Best source for current rental prices by suburb. Not government-affiliated but authoritative for market data."

  - title: "Auckland Council — Suburbs and localities"
    url: "https://www.aucklandcouncil.govt.nz"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Reference for Auckland geography and council boundaries."


---
TASK_ID: T02
TASK_NAME: Temporary Accommodation Booking
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if Auckland short-term accommodation market changes significantly or if University of Auckland changes its transitional accommodation offering for new students. Check annually.
---

METADATA:
  phase: Pre-Arrival
  timing: Book 4–6 weeks before departure. Do after suburb research (T01).
  time_required: 1–2 hours (research and booking)
  priority_score: 88
  task_type: Free
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
Most skilled migrants cannot safely commit to a long-term Auckland rental from overseas — the market moves fast, properties must ideally be viewed in person, and picking the wrong suburb sight unseen is a costly mistake. Booking 2–4 weeks of temporary accommodation before arrival gives you a safe landing pad, time to attend property viewings, understand Auckland's suburbs in person, and make a considered permanent rental decision. Your temporary accommodation address is also required for your bank account (T07) and IRD application (T08) on arrival, so it must be confirmed before you land.

---

WHAT_AND_WHY:
Auckland's rental market is competitive, particularly for well-located 2-bedroom properties in inner suburbs. Properties listed on TradeMe typically receive multiple applications within days of listing. Attempting to secure a permanent rental from overseas — without a local bank account, NZ rental history, or the ability to view the property — puts migrants at a significant disadvantage versus local applicants.

The recommended approach is to arrive with 2–4 weeks of temporary accommodation already booked, use that window to attend viewings in person, present a strong rental application (with NZ bank account reference, employer letter, and visa documentation), and sign a lease once you have seen the property and verified it meets Healthy Homes Standards.

Your temporary accommodation address serves a practical administrative purpose beyond just housing: it is the NZ address required on your IRD application (T08), your bank account opening (T07), and your SIM card registration (T06). All of these Day 1 tasks require a NZ address. A confirmed booking — not just a plan to stay somewhere — satisfies this requirement.

---

HOW_TO:
**Step 1 — Confirm your target suburb zone from T01**
Temporary accommodation should be in or near your shortlisted permanent rental zone. Staying in the CBD for temporary accommodation is practical even if your long-term plan is a suburban rental — CBD gives easy access to bank branches, IRD, and the main business district for your first week of admin tasks.

**Step 2 — Choose accommodation type**
Options in order of suitability for a 2–4 week stay:

- **Serviced apartments (best):** Kitchen, laundry, weekly rates. Quest Serviced Apartments, Adina Apartment Hotels, and Barclay Suites in Auckland CBD are established options. Weekly rates approximately $700–$1,200/week for a 1-bedroom. Book direct for best rates.
- **Airbnb weekly rentals:** Good value for 2+ weeks. Filter for "entire place" with kitchen. Set weekly view for pricing. CBD, Newmarket, Parnell, and Mt Eden have good supply.
- **University of Auckland transitional accommodation:** UoA offers short-term accommodation for new students in some periods. Contact UoA Accommodation Office (accom@auckland.ac.nz) before departure — options not always publicly advertised.
- **Community homestay:** Indian and Sri Lankan community networks (Facebook groups: "Indians in Auckland NZ", "Sri Lankans in New Zealand") sometimes offer homestay accommodation. Cheaper and culturally familiar. Less reliable to book in advance.

**Step 3 — Confirm key requirements before booking**
Before confirming any booking, verify:
- Full kitchen access (not just microwave) — important for South Asian cooking
- Laundry access (in-unit or in-building)
- Address clearly documented on booking confirmation — this is your official NZ address for Day 1 admin
- Walking distance to or easy PT to CBD (for bank branch access in first week)
- Flexible check-out or extension option in case rental search takes longer than expected

**Step 4 — Book and save confirmation documentation**
Save your booking confirmation as a PDF. This document is your proof of NZ address for:
- Bank account opening (T07) — ANZ, BNZ, Westpac accept hotel/serviced apartment bookings. ASB does not accept temporary/hostel addresses.
- IRD number application (T08)
- SIM card (T06 — no address required but useful to have)

**Step 5 — Note check-in logistics for arrival day**
Confirm: airport transfer options, check-in time (especially for late evening flights), key collection process. Auckland Airport (AKL) is in Mangere, South Auckland — approximately 25–35 minutes from CBD by car off-peak, longer in traffic. AirportLink bus and Super Shuttle are standard airport transfer options.

---

KEY_FACTS:
- A confirmed temporary accommodation address is required for bank account opening and IRD application on Day 1 [Type B — bank and IRD administrative requirements]
- ASB Bank does not accept hostel or temporary accommodation addresses for account opening — use ANZ, BNZ, or Westpac if opening account before securing permanent rental [Type B — bank administrative policy]
- Auckland CBD serviced apartments typically cost $700–$1,200/week for 1-bedroom [Type C — market, verify at booking time]
- University of Auckland has transitional accommodation for new students — contact UoA Accommodation Office before arrival [Type B — UoA administrative, availability varies]
- Auckland Airport to CBD is approximately 25–35 minutes by car off-peak, longer in peak hour [Type C — market/traffic conditions]
- Book with a flexible cancellation or extension option — rental searches in Auckland can take 2–4 weeks for good properties [Type C — advisory]

---

NUMBER_TYPES:
  - figure: "$700–$1,200/week for CBD serviced apartment 1-bedroom"
    type: C
    type_label: Market
    source: Quest, Adina, Barclay Suites booking sites; Airbnb
    caveat: "State as guidance. Direct user to check current rates directly with providers as accommodation pricing varies seasonally and by availability."
    last_confirmed: 2026-03-03

  - figure: "25–35 minutes Auckland Airport to CBD"
    type: C
    type_label: Market
    source: Google Maps off-peak estimate
    caveat: "State as guidance. Actual time depends on traffic — advise user to check Google Maps for their specific arrival time."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya and Karthik need a 1-bedroom or studio serviced apartment for 2–4 weeks. A fully-equipped kitchen is important — cooking at home during the temporary stay significantly reduces daily costs versus eating out in Auckland (restaurant meals $20–40/person). Book in the CBD or Newmarket fringe: this gives Karthik easy access to University of Auckland campus for orientation tasks and Priya easy access to bank branches and CBD employers for networking/job search.

  Karthik should contact the University of Auckland Accommodation Office (accom@auckland.ac.nz) before departure. UoA sometimes has transitional rooms available for new postgraduate students arriving mid-year. If available, this could reduce temporary accommodation costs significantly and place Karthik close to campus from Day 1.

  The booking confirmation document must clearly show both Priya's and Karthik's names if possible — both will need a NZ address for their respective bank account openings and IRD applications.

---

PERSONA_SOLO_AEWV:
  Book a studio or 1-bedroom serviced apartment in the CBD for 2–3 weeks. Prioritise kitchen access for cost management. Confirm the booking address is clearly documented — you will use it for your bank account opening and IRD application in the first 48 hours. If your employer has an Auckland office, consider staying within 20 minutes of it so you can attend any in-person onboarding without adding logistics complexity in your first week.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T01
      task_name: Auckland Suburb Research
      relationship: "Complete T01 before T02. Suburb research determines the right zone for temporary accommodation. T02 is the booking execution of T01's research output."
    - task_id: T06
      task_name: NZ SIM Card
      relationship: "Having a NZ address from T02 booking confirmation is helpful (though not required) for SIM registration on arrival."
    - task_id: T07
      task_name: Open NZ Bank Account In Person
      relationship: "T02 booking confirmation is the proof of NZ address required at bank account opening. ANZ, BNZ, Westpac accept this. ASB does not accept temporary addresses."
    - task_id: T08
      task_name: IRD Number Application
      relationship: "T02 address is used as NZ address in the IRD online application."
  inline_references:
    - "ASB address restriction referenced in KEY_FACTS and PERSONA fields"
    - "UoA Accommodation Office referenced in HOW_TO and PERSONA_CONSTRAINED_COUPLE"

---

WATCH_OUTS:
  - Do not book non-refundable temporary accommodation before confirming your flight dates are fixed — NZ visa processing timelines can shift.
  - Airbnb "entire place" is significantly better than a shared house for a couple arriving in a new country. The privacy and kitchen access are worth the small premium for a 2–4 week stay.
  - ASB Bank will reject a hostel or Airbnb address for bank account opening. If you plan to open with ASB, book a named serviced apartment hotel (Quest, Adina) that clearly appears as a business address on the booking confirmation.
  - Auckland rental applications typically require a NZ bank account reference. Opening your bank account early in week 1 enables you to include it in rental applications by week 2.
  - Do not extend temporary accommodation indefinitely — this is expensive. Set yourself a 4-week maximum deadline to secure a permanent rental, even if it means taking a good-enough option rather than a perfect one.

---

SOURCES:
  - title: "University of Auckland Accommodation Office"
    url: "https://www.auckland.ac.nz/en/on-campus/accommodation.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Contact point for UoA transitional accommodation. Email: accom@auckland.ac.nz"

  - title: "Auckland Transport — Getting to Auckland from the airport"
    url: "https://at.govt.nz/bus-train-ferry/bus-services/airport-services"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "AirportLink bus and other airport PT options."

  - title: "Airbnb Auckland"
    url: "https://www.airbnb.co.nz"
    tier: 3
    tier_label: Commercial
    last_accessed: 2026-03-03
    notes: "Best platform for furnished short-term rentals in Auckland. Use weekly view for accurate pricing."


---
TASK_ID: T03
TASK_NAME: Overseas Bank Account — Final Preparation
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if Indian FEMA rules change, if major NZ or Indian banks change their international transfer processes, or if NRI account reclassification requirements change. Check annually.
---

METADATA:
  phase: Pre-Arrival
  timing: 1–2 months before departure
  time_required: 1–2 hours
  priority_score: 82
  task_type: Free
  professional_advice_required: true
  professional_advice_note: "NRI/FEMA compliance (India): Once Priya becomes an NZ tax resident, her Indian resident bank accounts should technically be reclassified to NRE/NRO accounts under FEMA 1999. This is a legal obligation under Indian law. LandedNZ cannot advise on this — users should consult a CA or FEMA-authorised advisor before or shortly after departure. Ignoring this is technically a FEMA violation even if widely unpractised."

---

SUMMARY:
Before leaving your home country, take steps to ensure your existing bank accounts remain accessible, properly configured, and ready to receive international transfers from New Zealand. This includes activating international wire transfer capability, noting SWIFT and account details for sending remittances later, reviewing term deposit maturity dates, checking KYC renewal requirements, and understanding the NRI account reclassification obligation under Indian law (FEMA). These steps take 1–2 hours but prevent frustrating banking complications after you've moved.

---

WHAT_AND_WHY:
Once you move to New Zealand, your relationship with your home country bank changes in several ways. You are no longer physically present to visit a branch. Account correspondence may go to an old address. KYC renewal notices may not reach you. International transfer capability may be restricted if not activated before departure. And under Indian law (FEMA 1999), your status changes from Resident Indian to Non-Resident Indian (NRI) once you spend 182 days or more outside India in a financial year — which triggers a requirement to reclassify resident savings accounts to NRE or NRO accounts.

Taking 1–2 hours to prepare your overseas bank accounts before departure prevents a cascade of problems: locked accounts, failed remittances, missed KYC renewals, and potential regulatory exposure. It also ensures you have the SWIFT codes, account numbers, and beneficiary details ready when you set up international transfers from NZ (Task T15).

---

HOW_TO:
**Step 1 — Activate international wire transfer capability**
Visit your home country bank branch (or check online banking) to confirm that international outward remittances are enabled on your account. Some Indian and Sri Lankan banks require a branch visit or prior activation to enable SWIFT transfers. Test with a small transfer if unsure.

**Step 2 — Note your SWIFT/account details**
Write down (and store securely):
- Bank name, branch, SWIFT code
- Account number and IFSC code (India) or equivalent
- Your full name as it appears on the account (must match exactly for incoming transfers)
You will need these when setting up Wise or Remitly to send money home from NZ (T15).

**Step 3 — Review term deposits and fixed deposits**
Check maturity dates of any FDs or term deposits. If a deposit matures while you are in NZ, auto-renewal will usually occur — but reinvestment instructions, TDS certificates, and interest declarations may require action. Avoid locking new deposits in the 3 months before departure if maturity would fall in your first NZ months.

**Step 4 — Update contact details and address**
Update your home bank account contact email to one you will actively use in NZ. Set up email statements if not already active. If your home address is changing, update the registered address or set up a trusted family member as correspondence recipient.

**Step 5 — Check KYC renewal requirements (India)**
Many Indian banks require periodic KYC renewal. Ask your bank when your KYC is next due. If it falls within 12 months of departure, complete it before leaving. Aadhaar-based CKYC is available remotely for some banks — confirm with your bank whether in-person attendance would be required for renewal.

**Step 6 — Understand NRI reclassification (India — Priya)**
Under FEMA 1999, once Priya's NRI status is established (approximately when she has spent 182 days outside India in a financial year), her resident savings accounts should be reclassified to NRE (Non-Resident External) or NRO (Non-Resident Ordinary) accounts. NRE accounts allow free repatriation to NZ; NRO accounts are for Indian-sourced income. This reclassification should be initiated with her Indian bank. This is a professional advice area — see the professional advice note above.

**Step 7 — Singapore accounts (DBS and others)**
DBS Singapore accounts remain fully accessible from NZ via online banking. Confirm this before departure. SGD accounts can serve as an intermediary bridge for currency conversion if needed. No reclassification requirement for Singapore accounts on NZ residency.

---

KEY_FACTS:
- International wire transfer (SWIFT) capability must be activated before departure — some Indian and Sri Lankan banks require branch visit to enable [Type B — bank administrative policy]
- Under FEMA 1999, Indian resident bank accounts must be reclassified to NRE/NRO once NRI status is established (approximately 182 days outside India in a financial year) [Type A — FEMA 1999, Section 6]
- NRI status in India triggers at 182 days outside India in a financial year (April–March) [Type A — Income Tax Act 1961, Section 6]
- SWIFT code and account details from home country bank are required when setting up NZ-to-home remittances via Wise or Remitly (T15) [Type C — advisory]
- DBS Singapore accounts remain accessible via online banking from NZ — no reclassification required [Type B — DBS administrative, confirm with DBS before departure]

---

NUMBER_TYPES:
  - figure: "182 days outside India triggers NRI status"
    type: A
    type_label: Statutory
    source: Income Tax Act 1961, Section 6; FEMA 1999
    caveat: "State as confirmed fact. This is the legislated threshold. Note: the financial year in India runs April–March."
    last_confirmed: 2026-03-03

  - figure: "NRE/NRO account reclassification obligation under FEMA"
    type: A
    type_label: Statutory
    source: FEMA 1999, Section 6; RBI Master Direction on NRI deposits
    caveat: "State as confirmed fact but always surface professional advice note: 'This is a legal requirement under Indian law. Consult a CA or FEMA-authorised advisor for your specific situation.'"
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya (India/Singapore): Two sets of accounts to prepare. For her Indian accounts: activate international transfers, note SWIFT/IFSC details, check KYC renewal, begin planning NRE/NRO reclassification with a CA. For her DBS Singapore accounts: confirm international transfer access from NZ is available online, note SGD account details. Her DBS relationship may allow preferential FX rates for SGD-NZD transfers — worth checking with DBS International Banking team.

  Karthik (Sri Lanka): Activate international transfer capability on Sri Lankan bank accounts. Note SWIFT codes and account numbers. Check with his Sri Lankan bank whether any KYC or account changes are required for non-resident status. Sri Lanka does not have the same FEMA-equivalent strict reclassification regime as India, but some banks require notification of overseas relocation. Confirm with his specific bank.

  As a single-income household, maintaining reliable remittance access is financially important — these preparation steps directly enable Task T15 (remittances setup) to work smoothly after arrival.

---

PERSONA_SOLO_AEWV:
  Activate international transfer capability on your home country accounts before departure. Note SWIFT codes, account numbers, and beneficiary details — you will need these for Wise setup in Task T15. If from India, note the FEMA NRI reclassification obligation and seek CA advice before or shortly after departure. Check KYC renewal dates. This task takes 1–2 hours at a branch or via online banking and prevents banking access problems after you move.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T15
      task_name: Set Up International Remittances
      relationship: "T03 prepares home country accounts for receiving transfers. T15 sets up the NZ-to-home transfer mechanism. The SWIFT codes and account details collected in T03 are used directly in T15."
    - task_id: T05
      task_name: Home Country Tax — Final Year Considerations
      relationship: "NRI status determination (T03) and departure year tax filing (T05) are closely linked for Indian migrants. Both require understanding the 182-day rule and financial year boundaries."
  inline_references:
    - "Task T15 referenced in HOW_TO Step 2 and PERSONA fields"
    - "FEMA 1999 and NRI status referenced in WHAT_AND_WHY and HOW_TO"

---

WATCH_OUTS:
  - Do not close your home country bank accounts on departure. You will need them to receive remittances, manage existing assets, and maintain financial presence in your home country.
  - The NRE/NRO reclassification requirement under FEMA is widely ignored by NRI migrants but is a real legal obligation. Non-compliance is technically a FEMA violation. Seek CA advice — this is not a bureaucratic technicality.
  - Some Indian banks freeze accounts on detecting overseas IP address login if not pre-notified. Test international online banking access from a VPN set to an overseas server before departing India.
  - Term deposits in India auto-renew on maturity — but the renewal confirmation and TDS certificate may require your physical presence or advance authorisation. Plan for this before departure.
  - Do not assume your home bank's mobile app works in NZ — some Indian bank apps geo-restrict functionality. Test before departure and register for net banking if not already active.

---

SOURCES:
  - title: "FEMA 1999 — Ministry of Finance India"
    url: "https://www.rbi.org.in/Scripts/BS_FemaNotifications.aspx"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Reserve Bank of India notifications on FEMA. Reference for NRE/NRO account obligations."

  - title: "RBI Master Direction — Non-Resident Ordinary Rupee (NRO) Account"
    url: "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10272"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Definitive RBI guidance on NRO account requirements for NRIs."

  - title: "Income Tax Act 1961 — Section 6 (Residential Status)"
    url: "https://incometaxindia.gov.in/Documents/residential-status.htm"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Statutory basis for 182-day NRI trigger."


---
TASK_ID: T04
TASK_NAME: Moving and Transit Insurance
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if major NZ contents insurance providers change their migrant offerings or if international removals insurance market changes significantly. Check annually.
---

METADATA:
  phase: Pre-Arrival
  timing: 1–2 weeks before departure
  time_required: 30–60 minutes (research and purchase)
  priority_score: 72
  task_type: Free
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
Moving to New Zealand involves two distinct insurance gaps: transit risk (your belongings in transit and your health during the journey) and arrival risk (your belongings in your NZ rental before NZ contents insurance is arranged). This task addresses both. It takes 30–60 minutes and costs relatively little compared to the replacement value of electronics, laptops, and personal valuables. NZ's ACC covers accident injuries on NZ soil but provides no coverage in transit — travel insurance for the journey itself is essential.

---

WHAT_AND_WHY:
New Zealand's ACC scheme covers accident injuries for everyone on NZ soil from the moment they arrive, but it provides no coverage during the international flight, in transit airports, or in your home country. If you are injured between leaving home and landing in Auckland, only your own travel insurance covers you.

For belongings, standard airline baggage insurance ($20–30 USD per kg) almost never covers the actual replacement cost of electronics, cameras, or valuables at current market prices. A separate transit insurance policy covering replacement cost is worth having if you are carrying expensive equipment.

If you are shipping household goods via an international removals company, the company's standard liability coverage is typically minimal — often replacement value minus significant depreciation. Specialist marine/removals transit insurance is available from insurers like NZI, Vero, or specialist brokers and covers full replacement cost.

Once in your NZ rental, a NZ contents insurance policy covers your belongings — but there is a gap between arrival and the day you arrange contents insurance. This overlap period (typically your first 1–4 weeks in temporary accommodation) is worth being aware of.

---

HOW_TO:
**Step 1 — Assess what you are bringing**
Make a rough inventory of high-value items: laptop, phone, camera, hard drives, jewellery, musical instruments. Assign rough replacement cost values. This determines whether additional transit insurance is worth purchasing.

**Step 2 — Check existing insurance coverage**
Check your current home country travel insurance or contents insurance policy. Key questions:
- Does it cover one-way relocation trips or only return/holiday travel? (Many policies exclude permanent relocation)
- Does it cover valuables in checked luggage?
- What is the per-item and total claim limit?
If your existing policy covers you adequately, no additional purchase needed.

**Step 3 — Purchase travel insurance for the journey if needed**
If not adequately covered, purchase a single-trip travel insurance policy covering:
- Medical evacuation and emergency treatment in transit
- Baggage loss and delay
- Trip cancellation (if flights are refundable-ticket)
Note: ensure the policy covers one-way international relocation, not just holiday travel. Check policy wording carefully — "permanent emigration" is sometimes excluded.

**Step 4 — Arrange international removals insurance if shipping goods**
If you are shipping household goods via a removals company (not carrying everything as luggage), arrange specialist removals transit insurance separately from the removals company's standard liability. The removals company's own insurance is usually inadequate for full replacement cost. Options: your home country insurer, specialist marine cargo insurers, or the removals company's premium insurance upgrade.

**Step 5 — Note NZ contents insurance gap**
ACC covers injuries. But your belongings in temporary accommodation are not covered by the landlord's building insurance. If you arrive with $5,000+ in electronics, consider whether you need a short-term contents policy from Day 1. Most NZ contents insurers (AA Insurance, Tower, AMI) allow monthly policies — you can start one before your first rental lease is signed.

**Step 6 — Arrange NZ contents insurance once in rental**
Once you have a permanent NZ rental address (Task T11), arrange NZ contents insurance immediately. This is separate from transit insurance and covers your belongings on an ongoing basis. Landlord has building insurance — that does not cover tenant belongings.

---

KEY_FACTS:
- ACC covers accident injuries on NZ soil from Day 1 but provides no coverage during international transit [Type A — Accident Compensation Act 2001]
- Airline standard baggage liability (approximately $20–30 USD/kg) almost never covers full replacement cost of electronics [Type C — market, varies by airline and ticket class]
- Many travel insurance policies exclude "permanent emigration" — check policy wording before purchasing [Type C — market, varies by insurer]
- NZ landlord building insurance does not cover tenant's personal belongings — contents insurance is the tenant's responsibility [Type B — standard NZ insurance practice]
- NZ contents insurance available monthly from AA Insurance, Tower, AMI, and other providers [Type C — market, verify current offerings and prices]

---

NUMBER_TYPES:
  - figure: "$20–30 USD per kg standard airline baggage liability"
    type: C
    type_label: Market
    source: Airline conditions of carriage (varies by carrier)
    caveat: "State as guidance. Actual airline liability varies by carrier and ticket class. User should check their specific airline's conditions of carriage."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  As a cost-conscious household, Priya and Karthik should focus transit insurance on genuinely high-value items: laptops, phones, hard drives. If carrying professional equipment or significant jewellery, document it and ensure the policy per-item limit covers it. If they are shipping household goods from India or Singapore, international removals insurance is more important than for carry-on only movers. The NZ contents insurance gap during temporary accommodation is short (2–4 weeks) and the risk may be acceptable if they are not carrying high-value items beyond electronics.

---

PERSONA_SOLO_AEWV:
  Check your existing travel insurance covers one-way relocation trips. If not, purchase a single-trip policy covering medical, baggage, and valuables. If carrying a laptop and professional equipment (e.g. gaming peripherals, audio equipment, instruments), ensure per-item limits are adequate. Arrange NZ contents insurance the day you sign your permanent rental agreement.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T11
      task_name: Rental Agreement and Bond
      relationship: "Arrange NZ contents insurance immediately when rental agreement is signed (T11). Do not leave a gap between taking possession of the rental and having contents insurance in place."
    - task_id: T13
      task_name: ACC Overview
      relationship: "ACC covers accident injuries on NZ soil. T04 covers the transit gap before ACC applies and the illness/contents gaps ACC does not cover."
  inline_references:
    - "ACC referenced in WHAT_AND_WHY and KEY_FACTS"
    - "NZ contents insurance providers referenced in HOW_TO Step 6"

---

WATCH_OUTS:
  - "Permanent emigration" is sometimes excluded in travel insurance policies designed for holiday travel. Read the exclusions section, not just the coverage summary.
  - Do not rely on credit card travel insurance as your only coverage for a relocation trip — credit card policies typically cover return trips and have low baggage limits.
  - The removals company's standard liability for shipped goods is rarely adequate for electronics. Laptops declared at $1,500 replacement cost may only receive $300 under basic removals liability after depreciation.
  - NZ landlord insurance covers the building structure only. Tenants who assume they are covered under the landlord's policy are making a common and expensive mistake.

---

SOURCES:
  - title: "AA Insurance — Contents Insurance NZ"
    url: "https://www.aainsurance.co.nz/home-contents-insurance"
    tier: 3
    tier_label: Commercial
    last_accessed: 2026-03-03
    notes: "One of NZ's main retail contents insurers. Reference for NZ contents insurance options on arrival."

  - title: "Consumer NZ — Travel insurance guide"
    url: "https://www.consumer.org.nz/articles/travel-insurance"
    tier: 2
    tier_label: Government-Affiliated / Reputable
    last_accessed: 2026-03-03
    notes: "Consumer NZ is NZ's independent consumer advocacy organisation. Reliable guidance on insurance product selection."


---
TASK_ID: T05
TASK_NAME: Home Country Tax — Final Year Considerations
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if India-NZ or Sri Lanka-NZ Double Tax Agreement terms change, if Indian ITR filing deadlines shift, or if FEMA NRI rules are amended. Check annually before Indian tax filing season (July).
---

METADATA:
  phase: Pre-Arrival
  timing: 2–3 months before departure. Some actions (CA appointment, FD review) need lead time.
  time_required: 1–2 hours (review and document gathering)
  priority_score: 70
  task_type: Free
  professional_advice_required: true
  professional_advice_note: "Indian departure year tax filing, NRI status determination, and FEMA compliance are complex and fact-specific. LandedNZ provides general orientation only. Users should consult a CA (Chartered Accountant) in India before departure for their specific situation — particularly if they have property income, investments, or significant assets in India. Sri Lankan users should similarly consult a local tax advisor regarding departure year filing obligations."

---

SUMMARY:
The tax year of your departure from your home country requires specific actions — filing a final resident tax return, collecting income documents, understanding when your NRI status is established, and knowing which Double Tax Agreement protections apply between your home country and New Zealand. This task is an orientation guide, not a filing instruction — the specifics depend on your individual circumstances and require a qualified CA or tax advisor. Taking 1–2 hours to understand the landscape before departure prevents costly surprises during your first NZ tax year.

---

WHAT_AND_WHY:
When you move to New Zealand, you do not simply stop being a taxpayer in your home country on the day you leave. Tax obligations in your home country continue for the financial year of departure, and in some cases beyond. At the same time, New Zealand begins taxing your worldwide income once you become a New Zealand tax resident (generally after 183 days in NZ in a 12-month period, or from the date you establish an enduring place of abode in NZ).

The risk without preparation is double taxation — being taxed on the same income in both countries simultaneously — or inadvertent non-compliance in your home country by not filing a departure year return.

New Zealand has Double Tax Agreements (DTAs) with both India and Sri Lanka, which provide mechanisms to prevent or reduce double taxation. However, these DTAs require proactive steps (filing returns, claiming treaty relief) — they do not apply automatically.

New Zealand also offers a transitional resident tax exemption to new tax residents: a 4-year window during which most foreign passive income (rental income, interest, dividends from overseas assets) is exempt from NZ tax. This is a genuine and significant benefit for migrants with overseas assets. It begins once you have been in NZ for 183 days and have not been a NZ tax resident in the prior 10 years.

---

HOW_TO:
**Step 1 — Identify your departure year tax obligations (India)**
India's financial year runs April to March. If Priya departs in June 2026, her last full resident Indian financial year is FY2025-26 (April 2025 – March 2026). She must file her FY2025-26 ITR (Income Tax Return) by 31 July 2026 (standard deadline) — this filing will be done from NZ. The FY2026-27 return will be filed as an NRI.

**Step 2 — Collect income documentation before departure**
Before leaving, collect:
- Form 16 from DBS Bank Singapore (employer TDS certificate for FY2025-26)
- Form 26AS (tax credit statement) — download from incometax.gov.in
- Bank interest statements for all Indian accounts
- Any rental income documentation if applicable
- Investment statements (mutual funds, shares) for capital gains calculation

**Step 3 — Note when NRI status is established (India)**
Priya's NRI status is established when she has spent 182 days or more outside India in the financial year. Departing June 2026, she becomes NRI for FY2026-27 (April 2026 – March 2027) if she does not return to India for extended periods in that year. From FY2026-27, her Indian income (rent, interest, capital gains on Indian assets) is taxed in India at NRI rates, and her NZ employment income is not taxable in India.

**Step 4 — Sri Lanka departure year (Karthik)**
Sri Lanka's tax year runs April to March (same as India). Karthik should collect his Sri Lankan employment income documentation before departure and file his final Sri Lankan resident tax return for FY2025-26 by the Sri Lanka Inland Revenue's deadline. Karthik should confirm whether he has any Sri Lankan income sources that continue after departure (rental, interest) and understand the DTA protection available.

**Step 5 — Understand the NZ transitional resident exemption**
Both Priya and Karthik will qualify for the NZ transitional resident tax exemption assuming they have not been NZ tax residents in the prior 10 years. This exemption covers most foreign passive income (overseas rental income, overseas bank interest, overseas dividends) for approximately 4 years after establishing NZ tax residency (from the 183-day mark). This means:
- Priya's Indian bank interest income: exempt from NZ tax until approximately mid-2030
- Any Indian rental income: exempt from NZ tax for the same period
- After the exemption window closes, worldwide income must be declared in NZ

**Step 6 — Book a CA appointment before departure if applicable**
If either Priya or Karthik has: property in India or Sri Lanka, significant investment portfolios, business income, or ongoing Indian/Sri Lankan income streams — book a CA appointment before departure to plan the transition. This is particularly important for FEMA compliance (Task T03) and tax treaty position.

---

KEY_FACTS:
- India-NZ Double Tax Agreement is in force — prevents double taxation of income earned in one country by a resident of the other [Type A — India-NZ DTA, in force since 1986]
- Sri Lanka-NZ Double Tax Agreement is in force [Type A — Sri Lanka-NZ DTA]
- NZ transitional resident tax exemption covers most foreign passive income for approximately 4 years from establishing NZ tax residency [Type A — Income Tax Act 2007, Section CW 27]
- NZ tax residency generally established after 183 days in NZ in any 12-month period [Type A — Income Tax Act 2007, Section YD 1]
- Indian ITR standard filing deadline is 31 July following the end of the financial year [Type B — Income Tax Act 1961, subject to annual government announcements]
- India financial year: April 1 to March 31 [Type A — Income Tax Act 1961]
- NZ financial year: April 1 to March 31 (same as India) [Type A — Tax Administration Act 1994]

---

NUMBER_TYPES:
  - figure: "183 days in NZ establishes NZ tax residency"
    type: A
    type_label: Statutory
    source: Income Tax Act 2007, Section YD 1
    caveat: "State as confirmed fact. Note this is one of two tests — the 'permanent place of abode' test can also establish residency earlier."
    last_confirmed: 2026-03-03

  - figure: "4-year transitional resident exemption on foreign passive income"
    type: A
    type_label: Statutory
    source: Income Tax Act 2007, Section CW 27
    caveat: "State as confirmed fact. Caveat: exemption applies to passive income only (interest, dividends, rent) not employment income. Priya's NZ salary is taxable in NZ from Day 1."
    last_confirmed: 2026-03-03

  - figure: "182 days outside India triggers NRI status"
    type: A
    type_label: Statutory
    source: Income Tax Act 1961, Section 6
    caveat: "State as confirmed fact. Financial year April–March. Note this is the tax residency test — FEMA uses a slightly different definition for account reclassification."
    last_confirmed: 2026-03-03

  - figure: "31 July — Indian ITR standard filing deadline"
    type: B
    type_label: Administrative
    source: Income Tax Act 1961; annual CBDT notification
    caveat: "State with caveat: 'The standard Indian ITR deadline is 31 July following the financial year end, but this is sometimes extended by CBDT announcement. Confirm the current year deadline at incometax.gov.in.'"
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya (India/Singapore departing June 2026): Her last full resident Indian FY is FY2025-26. She should collect Form 16 from DBS Singapore, Form 26AS, and bank statements before departure. Her FY2025-26 ITR is due July 2026 — she can file from NZ using a CA or online portal. If she has Indian mutual fund investments or property, she should understand the capital gains and rental income treatment under NRI status before leaving. The transitional resident exemption means her Indian bank interest and any Indian rental income is exempt from NZ tax for approximately 4 years — a genuine financial benefit worth knowing about.

  Karthik (Sri Lanka): Collect Sri Lankan employment income documentation before departure. File departure year Sri Lankan tax return per Sri Lanka Inland Revenue deadlines. If Karthik has Sri Lankan assets generating income (unlikely as a student, but possible), understand the DTA protection available. The NZ transitional resident exemption applies to him as well.

  Both should note: their NZ employment/student income is taxable in NZ from their first day of NZ tax residency. The transitional resident exemption only covers foreign passive income — not NZ-sourced income.

---

PERSONA_SOLO_AEWV:
  Collect your home country tax documents (equivalent of Form 16, tax credit statement, bank interest statements) before departure. Understand when your NRI or non-resident status is established under your home country's rules. File your home country departure year tax return — this can typically be done from NZ via online portals or with a local CA's help. Take advantage of the NZ transitional resident exemption if you have overseas passive income — this exemption is valuable and automatic for new NZ tax residents with no prior NZ residency in the last 10 years.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T03
      task_name: Overseas Bank Account — Final Preparation
      relationship: "T03 and T05 are closely linked for Indian migrants — NRI status (T05) triggers bank account reclassification obligations (T03). Both tasks should be considered together and with CA advice."
    - task_id: T09
      task_name: Tax Code Declaration (IR330)
      relationship: "NZ tax residency established on arrival leads directly to IR330 obligations. T05 establishes prior home country tax context; T09 covers the NZ tax setup from first pay day."
  inline_references:
    - "Transitional resident exemption referenced in WHAT_AND_WHY and HOW_TO"
    - "India-NZ and Sri Lanka-NZ DTAs referenced in WHAT_AND_WHY"
    - "Task T03 cross-referenced in HOW_TO Step 6 for FEMA context"

---

WATCH_OUTS:
  - The NZ transitional resident exemption is automatic — you do not need to apply for it. But it only applies to passive income (interest, dividends, rent) not employment income. Your NZ salary is fully taxable in NZ from Day 1.
  - The exemption window is approximately 4 years — once it closes, you must declare worldwide income to IRD including any overseas rental income, interest, or dividends. Missing this transition is a common migrant tax error.
  - India and NZ have the same financial year (April to March). This makes the tax year boundary easier to track than for migrants from countries with calendar-year tax systems.
  - Filing an Indian ITR as a non-resident from overseas is possible online at incometax.gov.in but complex if you have capital gains, multiple income sources, or property. Use a CA for the first NRI return.
  - Do not assume you stop being an Indian taxpayer the day you leave. Indian-sourced income (rent on Indian property, Indian bank interest, dividends from Indian companies) remains taxable in India at NRI withholding rates regardless of where you live.

---

SOURCES:
  - title: "IRD — Transitional residents tax exemption"
    url: "https://www.ird.govt.nz/roles/nz-tax-residents/exemption"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Primary IRD source for the 4-year transitional resident exemption. Confirm scope of exemption and eligibility criteria here."

  - title: "Income Tax Act 2007 — Section CW 27 (transitional resident exemption)"
    url: "https://www.legislation.govt.nz/act/public/2007/0097/latest/DLM1512300.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Statutory basis for transitional resident exemption."

  - title: "India-New Zealand Double Tax Agreement"
    url: "https://incometaxindia.gov.in/Charts%20%20Tables/Residence-in-India-for-the-purpose-of-Income-Tax-Act.htm"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Indian Income Tax authority listing of active DTAs including NZ."

  - title: "IRD — Tax residency in New Zealand"
    url: "https://www.ird.govt.nz/international-tax/individuals/tax-residency-status-for-individuals"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "IRD guidance on the 183-day and permanent place of abode tests for NZ tax residency."


---
TASK_ID: T06
TASK_NAME: NZ SIM Card
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if major NZ carriers change their prepay plan pricing or if new carriers enter the market. Check annually — mobile plan pricing changes frequently.
---

METADATA:
  phase: Arrival
  timing: Day 1 — at Auckland Airport or first opportunity after landing
  time_required: 15–30 minutes
  priority_score: 98
  task_type: Free
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
Getting a New Zealand SIM card is the very first task on arrival — before leaving the airport if possible. A local NZ number is required for bank account opening (banks call to verify), for employer contact, for any NZ government online services that require SMS verification, and for day-to-day communication. New Zealand has three main mobile networks (Spark, One NZ, 2degrees) and several budget MVNOs. No ID is required to purchase a SIM. eSIM is available from all three main carriers. Monthly prepay plans are better value than tourist packs for anyone staying longer than a few weeks.

---

WHAT_AND_WHY:
New Zealand's mobile network coverage is strong in urban areas. All three main carriers (Spark, One NZ formerly Vodafone, and 2degrees) provide 98%+ population coverage in Auckland. Differences become apparent in rural areas and on highways between cities — Spark and One NZ have stronger rural networks, while 2degrees is strongest in urban centres and generally the most affordable.

A local NZ mobile number is not optional for settlement tasks — it is required. Banks will call or SMS a local number to verify your identity during account opening. IRD uses SMS for myIR account verification. Employers expect a local contact number. Google and Apple accounts require SMS verification when logging in from a new country.

No ID or proof of address is required to purchase a SIM card in New Zealand. eSIM is available from Spark, One NZ, and 2degrees — useful if you want to activate a NZ number before your physical SIM arrives or if your phone supports dual SIM (keeping your home country SIM active while using a NZ number).

---

HOW_TO:
**Step 1 — Decide carrier before landing (optional but helpful)**
If you prefer to activate immediately at the airport:
- Spark and One NZ have kiosks in Auckland Airport arrivals hall. Prices may be slightly higher than CBD stores.
- Duty-free zone (before customs): some duty-free shops carry SIM cards at lower prices.
- Plan to purchase at a carrier store in the CBD on Day 1 if you prefer to compare plans in store.

**Step 2 — Choose carrier and plan type**
For settlers (not tourists), monthly prepay is significantly better value than tourist SIM packs:

- **2degrees:** Cheapest monthly prepay plans. $8–$30/month options. Strong urban coverage. Recommended for cost-conscious Auckland-based users who won't travel rurally frequently.
- **Spark:** Best rural coverage. $19–$49/month prepay. Useful if planning road trips or travel outside Auckland.
- **One NZ (formerly Vodafone):** Strong all-around coverage. $19–$45/month prepay.
- **Skinny Mobile (on Spark network):** Budget MVNO. Available at Countdown/Woolworths, New World, Pak'nSave. $28/month for solid data plan. Online account management only.

**Step 3 — Purchase SIM**
No ID required. Pay cash or card. Physical SIM: $2–$5. eSIM: activate online via carrier website — requires email and a credit/debit card. If eSIM, you can activate before landing by purchasing online.

**Step 4 — Activate and top up**
Follow the activation instructions on the SIM packaging or carrier website. Add credit or activate a monthly plan. Most carriers have an app for account management. Set up auto-renew if available to avoid your plan lapsing.

**Step 5 — Share new NZ number immediately**
Update your employer with your NZ number. Provide to bank when opening account (T07). Provide to IRD application (T08). Update WhatsApp and other messaging apps to your new NZ number — or use dual SIM to keep both numbers active.

---

KEY_FACTS:
- No ID required to purchase a NZ SIM card [Type B — carrier administrative policy]
- eSIM available from Spark, One NZ, and 2degrees [Type B — carrier administrative, confirm eSIM compatibility with your phone model]
- 2degrees and Skinny Mobile offer the lowest-cost monthly prepay plans (from $8–$28/month) [Type C — market, check current plans at carrier websites]
- Monthly prepay plans are better value than tourist SIM packs for stays longer than 3–4 weeks [Type C — advisory]
- A NZ mobile number is required for bank account SMS verification and myIR account setup [Type B — bank and IRD administrative requirements]
- Spark has the strongest rural/South Island coverage; 2degrees is strongest value in Auckland urban areas [Type C — market, network coverage conditions subject to change]

---

NUMBER_TYPES:
  - figure: "Monthly prepay plans from $8–$49/month depending on carrier and plan"
    type: C
    type_label: Market
    source: 2degrees, Spark, One NZ carrier websites
    caveat: "State as guidance. Direct user to check current plans at 2degrees.co.nz, spark.co.nz, or one.nz as mobile plan pricing changes frequently."
    last_confirmed: 2026-03-03

  - figure: "$2–$5 for physical SIM card"
    type: C
    type_label: Market
    source: Carrier retail stores and supermarkets
    caveat: "State as guidance. Prices may vary by purchase location."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Both Priya and Karthik need individual NZ SIM cards on Day 1. They cannot share a number — both need separate numbers for their own bank account verifications and IRD applications. As a cost-conscious household, 2degrees or Skinny Mobile are the recommended starting carriers — lowest monthly cost for Auckland-based urban use. If either plans to travel outside Auckland frequently, consider Spark for its superior rural coverage. Skinny Mobile SIMs are available at supermarkets including Pak'nSave — convenient once they've done a first grocery run.

---

PERSONA_SOLO_AEWV:
  Purchase at Auckland Airport arrivals on Day 1 if you want immediate connectivity. 2degrees is the best value for Auckland-based solo migrants. If your employer is based outside Auckland or you plan rural travel, choose Spark. eSIM is the most convenient option if your phone supports it — activate before landing so you have a NZ number the moment you touch down.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T07
      task_name: Open NZ Bank Account In Person
      relationship: "NZ mobile number required for bank account SMS verification. Get SIM before visiting bank branch."
    - task_id: T08
      task_name: IRD Number Application
      relationship: "NZ contact number used in IRD application. Get SIM before applying."
  inline_references:
    - "Skinny Mobile (Spark MVNO) referenced as budget alternative in HOW_TO and KEY_FACTS"
    - "eSIM pre-arrival activation mentioned in HOW_TO"

---

WATCH_OUTS:
  - Do not buy an airport tourist SIM pack if you are staying more than 3–4 weeks. They are priced for short-stay tourists and are poor value for settlers. Go to a carrier store in the CBD on Day 1 instead.
  - Confirm your phone is SIM unlocked before departure. Phones bought on contract in India or Singapore may be network-locked and unable to use a NZ SIM. Unlock at your carrier before departing.
  - eSIM compatibility varies by phone model and carrier. Confirm your specific handset supports eSIM before relying on it.
  - If you keep your home country SIM active in a dual-SIM setup, international roaming charges on that SIM can be high. Put the home SIM in airplane mode or data-off as soon as your NZ SIM is active.

---

SOURCES:
  - title: "2degrees — Prepay plans"
    url: "https://www.2degrees.nz/plans/prepay"
    tier: 3
    tier_label: Commercial
    last_accessed: 2026-03-03
    notes: "Current 2degrees prepay plan pricing. Check for latest plans before recommending specific costs."

  - title: "Spark NZ — Prepay plans"
    url: "https://www.spark.co.nz/shop/mobile/prepay/"
    tier: 3
    tier_label: Commercial
    last_accessed: 2026-03-03
    notes: "Current Spark prepay plan pricing."

  - title: "One NZ — Prepay plans"
    url: "https://www.one.nz/mobile/prepay/"
    tier: 3
    tier_label: Commercial
    last_accessed: 2026-03-03
    notes: "Current One NZ (formerly Vodafone) prepay plan pricing."

  - title: "Skinny Mobile"
    url: "https://www.skinny.co.nz"
    tier: 3
    tier_label: Commercial
    last_accessed: 2026-03-03
    notes: "Budget MVNO on Spark network. Available at Countdown/Woolworths, New World, Pak'nSave supermarkets."


---
TASK_ID: T07
TASK_NAME: Open NZ Bank Account In Person
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if major NZ banks change their migrant account opening requirements, address proof policies, or fee structures. Check annually or after any bank policy announcements.
---

METADATA:
  phase: Arrival
  timing: Day 1–3 after arrival. Must be done in person at a bank branch.
  time_required: 45–90 minutes in branch. Debit card arrives 3–5 business days later.
  priority_score: 95
  task_type: Free
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
Opening a New Zealand bank account is one of the most critical Day 1–3 tasks. A NZ bank account is required for your employer to pay your salary, for IRD correspondence, for KiwiSaver contributions, and for daily expenses. Most NZ banks allow individual accounts to be opened the same day at a branch with your passport, visa documentation, and a NZ address. You will leave the branch with an account number but wait 3–5 days for your debit card. For couples, each person must open their own individual account — joint accounts are a separate task (T21) completed later once settled.

---

WHAT_AND_WHY:
New Zealand's banking system is dominated by five major banks: ANZ, ASB, BNZ, Westpac, and Kiwibank. All five offer everyday transaction accounts with no monthly fees (under standard conditions). As a new migrant on an AEWV, you are eligible to open an account at any of these banks — your visa status and overseas identity documents are sufficient.

Opening a NZ bank account on Day 1–3 serves multiple settlement functions: your employer needs a NZ account number to pay salary; IRD requires a bank account for tax refunds; KiwiSaver contributions are linked to your tax file and need a bank account context; and daily spending (groceries, transport, accommodation top-ups) requires a debit card rather than relying on overseas cards with foreign transaction fees.

Some banks — particularly ANZ and BNZ — allow you to begin the application process online before arriving in NZ (up to 90 days before). This gives you an account number immediately but provides deposit-only access until you verify your identity in person at a branch. This pre-arrival option is useful for receiving funds from overseas before arrival, but the branch visit is still required to activate full access.

---

HOW_TO:
**Step 1 — Choose your bank**
Key differences for new migrants:

| Bank | Monthly fee | Debit card | Migrant notes |
|------|-------------|-----------|---------------|
| ANZ | $0 | Free | Largest branch network. Pre-arrival application available. Most flexible on address proof. |
| ASB | $0 (paperless) | $5/6 months | Good migrant banking. Does NOT accept hostel/temporary addresses. Requires more permanent address. |
| BNZ | $0 | Free | No appointment needed for identity verification. Online application then branch visit. |
| Westpac | $0 | Free (first year) | Good migrant banking. Pre-arrival application available up to 180 days before. |
| Kiwibank | $0 | $10 one-off | NZ-owned. Requires work visa of more than 1 year — AEWV qualifies. |

**Recommendation for Day 1–3:** ANZ or BNZ. Most flexible on temporary accommodation addresses. Largest branch networks.

**Step 2 — Gather documents before going to the branch**
Bring:
- Passport (original — not a copy)
- Visa documentation (eVisa letter printed, or passport showing visa stamp)
- Proof of NZ address (hotel/serviced apartment booking confirmation — accepted by ANZ, BNZ, Westpac but NOT ASB)
- IRD number if already received (not mandatory but speeds the process)
- NZ mobile number (from T06)

**Step 3 — Visit the branch**
Walk in — no appointment needed at most ANZ and BNZ branches for individual account opening. Tell the teller you are a new migrant opening a first account. The process typically takes 45–90 minutes. You will:
- Complete an application form (in branch or on a tablet)
- Have your identity and visa verified
- Provide your NZ address
- Choose account type (everyday transaction account — standard for new migrants)
- Leave with your account number and BSB (bank branch) number

**Step 4 — Note your account number immediately**
Format: XX-XXXX-XXXXXXX-XX (bank code — branch — account — suffix)
You will need this for:
- IRD application (T08)
- KiwiSaver election (T10)
- Employer payroll setup
- Wise/Remitly account setup (T15)

**Step 5 — Set up online banking**
Before leaving the branch or same day: register for online banking using your NZ mobile number and email. Download the bank's app. Enable notifications for transactions.

**Step 6 — Wait for debit card (3–5 business days)**
Your debit card is mailed to your NZ address. You can use your account number for bank transfers immediately. For card payments, use Apple Pay or Google Pay linked to your new account — available as soon as you set up online banking, before the physical card arrives.

---

KEY_FACTS:
- Individual NZ bank accounts have no monthly fee at ANZ, ASB (paperless), BNZ, Westpac, and Kiwibank [Type C — market, confirm current fee schedule with your chosen bank]
- ASB does not accept hostel or temporary/Airbnb addresses for account opening [Type B — ASB administrative policy]
- Kiwibank requires work visa of more than 1 year — AEWV (typically 2–5 years) qualifies [Type B — Kiwibank administrative policy]
- Pre-arrival account opening available at ANZ (90 days before) and Westpac (180 days before) — deposit only until branch identity verification [Type B — bank administrative policy]
- Debit card delivery takes 3–5 business days — Apple Pay/Google Pay available immediately via online banking [Type B — bank administrative]
- No credit history required to open a transaction account — a debit (not credit) card is issued [Type B — bank administrative]
- Credit card applications require NZ credit history (3–6 months minimum) — do not apply for credit card at account opening [Type C — advisory]

---

NUMBER_TYPES:
  - figure: "$0 monthly fee (standard conditions)"
    type: C
    type_label: Market
    source: ANZ, ASB, BNZ, Westpac, Kiwibank websites
    caveat: "State as guidance. Confirm current fee schedule with your chosen bank — fee structures can change. Some accounts have conditions (e.g. ASB requires paperless statements for zero fee)."
    last_confirmed: 2026-03-03

  - figure: "3–5 business days for debit card delivery"
    type: B
    type_label: Administrative
    source: ANZ, BNZ, ASB bank websites
    caveat: "State with caveat: 'Typically 3–5 business days — confirm timeline with your bank at account opening.'"
    last_confirmed: 2026-03-03

  - figure: "90 days pre-arrival (ANZ) / 180 days pre-arrival (Westpac)"
    type: B
    type_label: Administrative
    source: ANZ and Westpac migrant banking pages
    caveat: "State with caveat: 'Confirm current pre-arrival application window with your chosen bank before applying — these windows are subject to change.'"
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Both Priya and Karthik must open separate individual accounts. They cannot share one account for salary receipt — Priya's employer pays into her account, and Karthik will need his own account for any income, student allowances, or part-time work. Recommend ANZ for both: largest branch network, most flexible on temporary accommodation address proof, and allows pre-arrival application if either wants to get an account number before landing.

  ASB should be avoided on Day 1 if they are using a serviced apartment or Airbnb booking as their address proof — ASB rejects temporary addresses. If either prefers ASB for other reasons, wait until they have a permanent rental address (T11) and then switch or open an additional account.

  As a single-income household, Priya's account is the priority — her employer needs her account number for payroll setup. Karthik's account opening can follow within the first week.

---

PERSONA_SOLO_AEWV:
  Visit an ANZ or BNZ branch on Day 1 or Day 2. Bring passport, eVisa letter, and your serviced apartment/hotel booking confirmation as address proof. No appointment needed. Account number in 45–90 minutes. Provide account number to employer HR immediately so payroll is set up before your first pay day. Set up Apple Pay or Google Pay on the same day — you can use your account for contactless payments immediately without waiting for the physical debit card.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T06
      task_name: NZ SIM Card
      relationship: "NZ mobile number required for bank account SMS verification and online banking setup. Get SIM (T06) before visiting bank branch."
    - task_id: T08
      task_name: IRD Number Application
      relationship: "Bank account number can be included in the IRD application to speed processing. Recommended to open bank account before applying for IRD number."
    - task_id: T09
      task_name: Tax Code Declaration (IR330)
      relationship: "Employer needs bank account number alongside IR330 for payroll setup. Both T07 and T09 must be completed before first pay day."
    - task_id: T10
      task_name: KiwiSaver Election
      relationship: "KiwiSaver contributions are linked to IRD and bank account context. Bank account should be open before KiwiSaver election is processed."
    - task_id: T21
      task_name: Joint Bank Account
      relationship: "T07 is individual account opening. T21 is joint account — completed later (Month 2–4) once both parties are settled and have individual accounts established."
  inline_references:
    - "ASB address restriction referenced in HOW_TO and KEY_FACTS"
    - "Kiwibank visa requirement referenced in HOW_TO comparison table"
    - "Apple Pay / Google Pay referenced in HOW_TO Step 6"

---

WATCH_OUTS:
  - Do not apply for a credit card at account opening. NZ banks require 3–6 months of NZ credit history and income verification for credit card approval. Applying too early results in a hard credit enquiry and likely rejection — both of which can slightly harm your emerging NZ credit file (Task T18).
  - ASB's address restriction catches many migrants off guard. If you are in an Airbnb or hostel, go to ANZ or BNZ first.
  - Your NZ bank account number format (XX-XXXX-XXXXXXX-XX) is different from Indian or Singaporean account formats. When providing to your employer, give the full number in the NZ format — do not abbreviate.
  - Internet banking typically requires SMS verification when setting up from a new device. This is why having your NZ SIM active before going to the bank (T06 before T07) matters — the bank will SMS your NZ number during setup.
  - Opening bank accounts at multiple banks simultaneously is unnecessary and creates administrative complexity. Open one account, use it for 3–6 months, then add accounts if needed.

---

SOURCES:
  - title: "ANZ — New to New Zealand banking"
    url: "https://www.anz.co.nz/personal/bank-accounts/new-to-new-zealand/"
    tier: 3
    tier_label: Commercial
    last_accessed: 2026-03-03
    notes: "ANZ migrant banking page. Check for current requirements and pre-arrival application process."

  - title: "BNZ — Open a bank account"
    url: "https://www.bnz.co.nz/personal-banking/bank-accounts"
    tier: 3
    tier_label: Commercial
    last_accessed: 2026-03-03
    notes: "BNZ account opening process and requirements."

  - title: "ASB — Bank accounts"
    url: "https://www.asb.co.nz/bank-accounts/"
    tier: 3
    tier_label: Commercial
    last_accessed: 2026-03-03
    notes: "ASB account information. Note address restriction for temporary accommodation."

  - title: "MoneyHub NZ — Best bank accounts for new migrants"
    url: "https://www.moneyhub.co.nz/new-to-nz-bank-account.html"
    tier: 2
    tier_label: Government-Affiliated / Reputable
    last_accessed: 2026-03-03
    notes: "Independent NZ personal finance comparison — reliable for fee comparisons and migrant-specific guidance."


---
TASK_ID: T08
TASK_NAME: IRD Number Application
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if IRD changes the online application process, accepted identity documents, or processing times. Check annually or after any IRD system announcement.
---

METADATA:
  phase: Week 1
  timing: Apply on Day 1 or as soon as possible after arrival. Must have IRD number before first pay day.
  time_required: 20–30 minutes (online application)
  priority_score: 98
  task_type: Free
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
An IRD number is New Zealand's tax identification number — the equivalent of a PAN card in India or a TIN in Singapore. Every person who earns income, opens a bank account, or enrolls in KiwiSaver in New Zealand needs one. Without an IRD number, your employer must deduct tax at the no-declaration rate of 45% — the highest possible rate. Apply online at ird.govt.nz within your first week of arrival. Processing takes 1–2 business days for most applicants.

---

WHAT_AND_WHY:
New Zealand's tax system is administered by Inland Revenue (IRD). Every individual who earns income in New Zealand is assigned a unique IRD number — an 8 or 9 digit identifier used across all tax, KiwiSaver, and government benefit interactions for life.

For skilled migrants arriving on an Accredited Employer Work Visa (AEWV), the IRD number is the foundational tax document. It must be provided to your employer before your first pay day so they can deduct the correct amount of PAYE (Pay As You Earn) tax. If you do not provide an IRD number in time, your employer is legally required to deduct tax at the no-declaration rate of 45% — regardless of your actual tax bracket. This money is not lost (it is credited to your account and reconciled at year end), but it significantly reduces your take-home pay until resolved.

The IRD number is also required when enrolling in KiwiSaver (T10), completing your tax code declaration (T09), opening certain bank accounts, and applying for government services. It persists for life — even if you leave New Zealand and return years later, your original IRD number remains valid.

New migrants are eligible to apply online immediately upon arrival, provided they have a valid New Zealand visa. The application is straightforward and takes 20–30 minutes. Most applicants receive their IRD number within 1–2 business days.

---

HOW_TO:
**Step 1 — Gather your documents before starting**
You will need:
- Your passport (the one with your New Zealand visa)
- Your New Zealand visa details (visa type, expiry date — visible in your passport or on your eVisa letter)
- A New Zealand address (your temporary accommodation address is acceptable — hotel, Airbnb, or serviced apartment booking confirmation)
- Your New Zealand bank account number if already opened (recommended — see T07 — but not mandatory)
- An email address you check regularly (IRD correspondence will be sent here)

**Step 2 — Go to ird.govt.nz and navigate to IRD number application**
URL: https://www.ird.govt.nz/managing-my-tax/ird-numbers/ird-numbers-for-individuals
Select "Apply for an IRD number" → "New to New Zealand."

**Step 3 — Complete the online application**
The form asks for:
- Personal details (name, date of birth, country of birth, nationality)
- Contact details (NZ address, email, phone)
- Visa information (visa type, expiry date)
- Tax residency details (country of tax residency — most new arrivals: India, Sri Lanka, or Singapore)
- Bank account number if available

**Step 4 — Submit and wait**
After submission, IRD processes the application. For applicants with a valid NZ work visa and complete information, processing typically takes 1–2 business days. IRD will email your IRD number to the address provided.

**Step 5 — Record your IRD number securely**
Store it in your phone notes (password-protected), a secure document folder, and share with partner if applicable. You will use this number repeatedly — for your employer, KiwiSaver, bank, and any future IRD correspondence.

**Step 6 — Provide IRD number to employer immediately**
As soon as you receive your IRD number, provide it to your employer's HR or payroll team along with your completed IR330 tax code declaration form (T09). Do this before your first pay day to avoid the 45% no-declaration tax rate.

**If your application is delayed beyond 5 business days:**
Contact IRD: Phone 0800 227 774 (individuals line, Mon–Fri 8am–8pm, Sat 9am–1pm). Note your application reference number from the confirmation email.

---

KEY_FACTS:
- Every person earning income or opening a bank account in New Zealand needs an IRD number [Type A — Tax Administration Act 1994]
- Without an IRD number provided to employer, PAYE tax is deducted at 45% no-declaration rate [Type A — Income Tax Act 2007]
- Apply online at ird.govt.nz — no branch visit required for most work visa holders [Type B — IRD administrative process]
- Processing time is typically 1–2 business days for complete applications [Type B — IRD administrative, subject to demand]
- An IRD number is assigned once and persists for life — it does not expire or need renewal [Type A — Tax Administration Act 1994]
- Temporary accommodation address (hotel, Airbnb) is acceptable as NZ address on the application [Type B — IRD administrative policy]
- Bank account number is helpful but not mandatory to include in the IRD application [Type B — IRD administrative]
- IRD number is required for KiwiSaver enrollment, tax code declaration, and most government interactions [Type A — KiwiSaver Act 2006, Tax Administration Act 1994]

---

NUMBER_TYPES:
  - figure: "45% no-declaration tax rate"
    type: A
    type_label: Statutory
    source: Income Tax Act 2007, Schedule 2
    caveat: "State as confirmed fact. This is the legislated rate applied when no IRD number and tax code are provided to employer."
    last_confirmed: 2026-03-03

  - figure: "1–2 business days processing time"
    type: B
    type_label: Administrative
    source: IRD ird.govt.nz processing guidance
    caveat: "State with recency caveat: 'IRD typically processes applications within 1–2 business days for complete applications — this may vary during high-demand periods.'"
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya (AEWV holder, software engineer starting NZ employment): This task is high priority — she must have her IRD number before her first NZ pay day or her employer will deduct tax at 45%. Apply on Day 1 or Day 2 of arrival. Her Singapore address is her prior tax residency address; her NZ temporary accommodation address is acceptable as her NZ address on the form. If she has already opened her bank account (T07), include the account number in the application. Once received, provide to employer HR immediately alongside IR330 (T09).

  Karthik (partner work visa holder, University of Auckland student): Karthik also needs an IRD number — required when he opens his NZ bank account and if he takes any part-time work. His application process is identical to Priya's. His visa type is Partner of a Worker (Work Visa). Apply at the same time as Priya. Note: Karthik's IRD number is his own — he cannot use Priya's.

  Both should list their home country (India for Priya, Sri Lanka for Karthik) as prior tax residency on the form. This is straightforward and does not trigger any double taxation at application stage.

---

PERSONA_SOLO_AEWV:
  Apply on Day 1 or Day 2 of arrival — this is the single most time-sensitive administrative task for any new worker. Your NZ temporary accommodation address is acceptable. If you have opened your bank account already (T07), include the account number to speed processing. Provide the IRD number to your employer immediately on receipt, alongside your IR330 (T09). If your employer needs your IRD number before you receive it, inform them in writing that the application is in progress — most NZ employers are familiar with this situation for new migrants.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T07
      task_name: Open NZ Bank Account In Person
      relationship: "Recommended to open bank account before IRD application so bank account number can be included in the IRD form. Bank account is not mandatory for IRD application but speeds the process."
    - task_id: T09
      task_name: Tax Code Declaration (IR330)
      relationship: "IRD number must be obtained before completing IR330. IR330 is submitted to employer alongside IRD number before first pay day. Complete T08 then T09 in sequence."
    - task_id: T10
      task_name: KiwiSaver Election
      relationship: "IRD number is required for KiwiSaver enrollment. Complete T08 before T10."
  inline_references:
    - "Task T07 referenced in HOW_TO Step 1 and PERSONA fields"
    - "Task T09 referenced in HOW_TO Step 6 and PERSONA fields"
    - "Task T10 referenced in WHAT_AND_WHY and KEY_FACTS"

---

WATCH_OUTS:
  - Do not wait until your first pay day to apply — by then it is too late to avoid the 45% no-declaration rate on that pay. Apply on Day 1.
  - Your overseas tax number (PAN card, TIN, NRIC) is NOT valid in New Zealand. You need a New Zealand IRD number.
  - The IRD number is different from your visa number, passport number, and NHI health number — these are all separate identifiers.
  - If you previously lived in New Zealand, you may already have an IRD number. Do not apply for a new one — contact IRD to retrieve your existing number. Applying twice can create complications.
  - The 45% no-declaration rate is not a penalty — it is a withholding mechanism. Excess tax is credited and refunded at year-end assessment, but it harms your cash flow. Avoid by applying early.
  - Some employers ask for your IRD number before your start date. If so, apply as soon as you arrive and relay the number immediately.

---

SOURCES:
  - title: "IRD numbers for individuals — Inland Revenue"
    url: "https://www.ird.govt.nz/managing-my-tax/ird-numbers/ird-numbers-for-individuals"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Primary source for application process and requirements."

  - title: "Tax Administration Act 1994 — New Zealand Legislation"
    url: "https://www.legislation.govt.nz/act/public/1994/0166/latest/DLM348342.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Statutory basis for IRD number requirement."

  - title: "Income Tax Act 2007 — Schedule 2 (PAYE rates)"
    url: "https://www.legislation.govt.nz/act/public/2007/0097/latest/DLM1522997.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Statutory basis for 45% no-declaration rate."

  - title: "New to New Zealand — IRD guidance"
    url: "https://www.ird.govt.nz/international-tax/individuals/tax-for-new-zealand-tax-residents"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "IRD's own guidance for new migrants — confirms process and document requirements."


---
TASK_ID: T09
TASK_NAME: Tax Code Declaration (IR330)
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if IRD changes tax brackets, tax code rules, or the IR330 form itself. Check annually at start of NZ tax year (1 April) or after any Budget announcement.
---

METADATA:
  phase: Week 1
  timing: Complete immediately after receiving IRD number (T08). Must be submitted to employer before first pay day.
  time_required: 15–20 minutes
  priority_score: 97
  task_type: Free
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
The IR330 is a one-page tax code declaration form that tells your employer which PAYE tax rate to deduct from your salary. Without it, your employer must deduct tax at the highest rate (45%). For most skilled migrants on a single NZ income, the correct tax code is "M" — the standard employee code. Download the IR330 from ird.govt.nz, complete it with your IRD number and correct tax code, and submit to your employer's HR or payroll team before your first pay day.

---

WHAT_AND_WHY:
New Zealand uses a Pay As You Earn (PAYE) system — your employer deducts income tax from each pay and remits it directly to IRD on your behalf. At the end of the tax year (31 March), IRD reconciles your actual tax position. If too much was deducted, you receive a refund; if too little, you pay the shortfall.

The IR330 is the declaration form you submit to your employer to activate the correct PAYE rate. It captures your IRD number and your selected tax code. The tax code tells your employer which rate schedule to apply to your earnings.

For most skilled migrants starting their first NZ job, the correct tax code is "M" — the standard code for an employee whose income from this job is their main (or only) source of income. Using the wrong tax code results in either over-deduction (reducing your take-home pay unnecessarily) or under-deduction (resulting in a tax bill at year end).

NZ tax brackets as of 2026:
- $0–$14,000: 10.5%
- $14,001–$48,000: 17.5%
- $48,001–$70,000: 30%
- $70,001–$180,000: 33%
- Over $180,000: 39%

These are marginal rates — each rate applies only to the income within that bracket, not your total income. The tax code "M" instructs your employer to apply these rates progressively across each pay period.

Understanding your tax code prevents surprises. A common migrant mistake is selecting the wrong code or failing to submit the IR330 at all — resulting in months of over-deduction before the error is caught.

---

HOW_TO:
**Step 1 — Obtain your IRD number first**
You cannot complete the IR330 without your IRD number. Complete T08 first and wait for your IRD number to be issued (typically 1–2 business days).

**Step 2 — Download the IR330 form**
URL: https://www.ird.govt.nz/forms-guides/number/forms-300-399/ir330-tax-code-declaration
Download the PDF. The form is one page.

**Step 3 — Determine your correct tax code**
For most skilled migrants in their first NZ job, the answer is straightforward:

- **"M"** — Your main (or only) income source. Use this if this is your only job in New Zealand.
- **"M SL"** — Use this only if you have a New Zealand student loan (most new migrants do not).
- **"SB", "S", "SH", "ST"** — Secondary income codes. Use only if you have a second job or additional income source in NZ.
- **"SB SL", "S SL" etc** — Secondary income with student loan. Not applicable to most new migrants.
- **"WT"** — Schedular payments (contract/freelance). Not applicable to AEWV salaried employees.

**Most AEWV skilled migrants select "M". If in doubt, use "M".**

**Step 4 — Complete the IR330 form**
Fill in:
- Your full legal name (as per passport)
- Your IRD number (8 or 9 digits)
- Your date of birth
- Your tax code selection (circle or tick "M" for main income)
- Sign and date

**Step 5 — Submit to employer**
Hand the completed IR330 to your employer's HR or payroll team. Do this before your first pay day. Most NZ employers have a standard onboarding packet that includes the IR330 — if your employer provides one, complete that copy rather than downloading your own (same form, same result).

**Step 6 — Confirm payslip deductions**
On your first payslip, verify that the tax code shown matches "M" and that deductions look reasonable relative to your salary and the NZ tax brackets. If anything looks wrong, contact HR and IRD promptly.

---

KEY_FACTS:
- Without a completed IR330, employer must deduct tax at 45% no-declaration rate [Type A — Income Tax Act 2007]
- Tax code "M" is the correct code for most AEWV skilled migrants with a single NZ income [Type A — IRD IR330 form instructions]
- NZ tax year runs 1 April to 31 March — not calendar year [Type A — Income Tax Act 2007]
- NZ uses progressive marginal rates: 10.5% / 17.5% / 30% / 33% / 39% [Type A — Income Tax Act 2007, Schedule 1, Part A]
- The IR330 is submitted to your employer — not to IRD directly [Type B — IRD administrative process]
- If you change jobs, you must complete a new IR330 for the new employer [Type B — IRD administrative]
- The IR330 form is free to download from ird.govt.nz [Type B — IRD administrative]
- New migrants are not automatically enrolled in any NZ government tax offset — the IR330 is the only required initial tax action [Type B — IRD administrative]

---

NUMBER_TYPES:
  - figure: "45% no-declaration rate"
    type: A
    type_label: Statutory
    source: Income Tax Act 2007, Schedule 2
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "10.5% / 17.5% / 30% / 33% / 39% tax brackets"
    type: A
    type_label: Statutory
    source: Income Tax Act 2007, Schedule 1, Part A
    caveat: "State as confirmed fact. Note: Tax rates are set by legislation and can be changed by Budget. Confirm current brackets at ird.govt.nz if significant time has passed since last verification."
    last_confirmed: 2026-03-03

  - figure: "$0–$14,000 / $14,001–$48,000 / $48,001–$70,000 / $70,001–$180,000 / Over $180,000 bracket thresholds"
    type: A
    type_label: Statutory
    source: Income Tax Act 2007, Schedule 1, Part A
    caveat: "State as confirmed fact. Thresholds are legislated and stable unless changed by Budget."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya (AEWV holder, software engineer): This task is sequential with T08 — apply for IRD number first, then complete IR330 immediately on receipt. Priya's tax code is "M" — her NZ employment income is her sole NZ income source. She should complete and submit IR330 to her employer's HR team on or before her first day of employment. If she receives her IRD number before her start date, she can prepare the IR330 in advance and hand it in on Day 1. Do not delay — missing the first pay day means 45% withholding on that payment.

  Karthik (partner work visa, UoA student): Karthik may take part-time or casual work in NZ — his partner work visa permits unrestricted work. If he takes employment, he also needs to complete an IR330. His tax code will be "M" if it is his only income, or a secondary code (SB/S/SH/ST) if Priya has already established him as a dependant and he earns secondary income. For his initial NZ job, "M" is almost certainly correct. Note: Karthik's UoA scholarship or stipend (if any) may also have separate tax treatment — confirm with UoA finance office.

---

PERSONA_SOLO_AEWV:
  Complete T08 (IRD number) first — you cannot fill in the IR330 without it. Once you have your IRD number, download the IR330, select tax code "M" (for a single NZ employment income), and submit to your employer before your first pay day. This is a 15-minute administrative task that protects your take-home pay. Keep a copy of your completed IR330 for your own records. If you take a second job later, you will need to complete a separate IR330 for that employer with a secondary tax code.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T08
      task_name: IRD Number Application
      relationship: "IRD number must be obtained before IR330 can be completed. Complete T08 first. T08 and T09 are submitted to employer together."
    - task_id: T10
      task_name: KiwiSaver Election
      relationship: "IR330 and KiwiSaver election (KS2 form) are typically part of the same employer onboarding packet. Complete both in the same sitting."
  inline_references:
    - "T08 referenced throughout — sequential dependency"
    - "T10 referenced in PERSONA fields and HOW_TO Step 5"

---

WATCH_OUTS:
  - The most common mistake is simply not submitting the IR330 before the first pay day. Add it to your Day 1 employer checklist alongside your employment agreement, bank account details, and emergency contacts.
  - Tax code "M" is not a flat 10.5% rate — it triggers the full progressive marginal rate schedule. Your effective tax rate will be higher than 10.5% if your income exceeds $14,000 per year (which it will for most skilled migrants).
  - New Zealand has no tax-free threshold in the way some countries do — tax applies from dollar one of income.
  - Do not use a secondary tax code (SB, S, SH, ST) for your main job. Secondary codes apply only to secondary income sources. Using SB on your main income means 10.5% flat rate — which will result in a tax bill at year end.
  - If your visa allows work but you are technically self-employed or contracting, the relevant code is "WT" (schedular payments) — not "M." Confirm with your employer whether you are an employee or contractor before selecting a code.
  - The NZ tax year ends 31 March. If you arrive mid-year, you will file a partial-year return for your first NZ tax year. IRD handles this automatically for PAYE employees — no manual calculation needed.

---

SOURCES:
  - title: "IR330 Tax code declaration — Inland Revenue"
    url: "https://www.ird.govt.nz/forms-guides/number/forms-300-399/ir330-tax-code-declaration"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Primary source — downloadable form and instructions."

  - title: "Tax codes for individuals — Inland Revenue"
    url: "https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-codes-for-individuals"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "IRD guide to selecting the correct tax code."

  - title: "Income Tax Act 2007 — Schedule 1 (Tax rates)"
    url: "https://www.legislation.govt.nz/act/public/2007/0097/latest/DLM1523176.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Statutory source for NZ income tax rates and brackets."


---
TASK_ID: T10
TASK_NAME: KiwiSaver Election
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if contribution rates, government contribution amounts, or eligibility rules change. Check after each Budget announcement. Review if KiwiSaver Act is amended.
---

METADATA:
  phase: Week 1
  timing: Complete alongside IR330 (T09) before first pay day. Employer auto-enrols you if you do not act — opting in proactively lets you choose your provider and contribution rate.
  time_required: 30–45 minutes (including provider research)
  priority_score: 90
  task_type: Free (employer contributions are additional income)
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
KiwiSaver is New Zealand's voluntary workplace retirement savings scheme. As an AEWV worker, your employer will auto-enrol you when you start work — but acting proactively lets you choose your own fund provider and contribution rate before the default kicks in. Minimum employee contribution is 3% of gross salary; employer must contribute at least 3% on top. The government also contributes up to $521.43 per year if you contribute a minimum amount. For migrants planning to stay in NZ long-term, KiwiSaver is a valuable benefit. For those planning to leave, contributions can be withdrawn on permanent departure from NZ.

---

WHAT_AND_WHY:
KiwiSaver is a defined contribution retirement savings scheme established under the KiwiSaver Act 2006. It is not a pension — it is a personal savings account that holds contributions from you, your employer, and the government, invested in funds managed by your chosen provider.

**Key mechanics for skilled migrants:**

Employee contributions: 3%, 4%, 6%, 8%, or 10% of gross salary — your choice. The default if you do not specify is 3.5% (increased from 3% effective April 1, 2026).

Employer contributions: Your employer must contribute a minimum of 3% of your gross salary — this is on top of your salary, not deducted from it. It is effectively a 3% salary top-up that you receive only if you are in KiwiSaver.

Government member tax credit: If you are a NZ tax resident and contribute at least $1,042.86 per year (roughly $20/week), the government adds up to $521.43 per year to your account. This is free money that requires no action beyond maintaining your contributions.

Fund types: KiwiSaver providers offer funds ranging from defensive (low risk, low return, mostly bonds) to aggressive (high risk, higher long-term return, mostly equities). For workers in their 30s-40s with a long investment horizon, growth or aggressive funds are typically more appropriate than conservative funds — but this is a personal financial decision.

**For migrants specifically:** KiwiSaver is not locked in permanently. If you leave New Zealand permanently and are no longer a NZ tax resident, you can apply to withdraw your entire KiwiSaver balance (including employer contributions and government credits). This makes it genuinely worthwhile even for migrants uncertain about long-term NZ residency.

Auto-enrolment: If you take no action, your employer will auto-enrol you in KiwiSaver when you start work. You will be placed in your employer's default fund. You then have 56 days to opt out if you decide you do not want to participate. If you act proactively (choose your own provider and submit a KS2 form), you control the fund choice from day one.

---

HOW_TO:
**Step 1 — Decide whether to join KiwiSaver**
For most AEWV skilled migrants, joining KiwiSaver is financially advantageous due to the mandatory employer contribution (3% salary top-up) and government member tax credit (up to $521.43/year). The main reason not to join is if you are certain you will leave NZ within 1–2 years and the administrative friction of withdrawal outweighs the benefit — but even then, the employer 3% contribution is worth capturing.

**Step 2 — Choose a KiwiSaver provider**
Major providers include: Simplicity (low fees, nonprofit, recommended for cost-conscious investors), Milford, Fisher Funds, ANZ KiwiSaver, ASB KiwiSaver, Booster, Generate, SuperLife, InvestNow. Comparison tool: sorted.org.nz/kiwisaver (government-operated, fee comparison).

Key criteria when choosing:
- Management fees (look for under 0.5% for passive/index funds, under 1.0% for actively managed)
- Fund type (growth or aggressive for long-term investors aged 30–50)
- Provider stability and track record

If you do not choose, you will be assigned to your employer's default provider.

**Step 3 — Choose your contribution rate**
Options: 3%, 4%, 6%, 8%, 10% of gross salary. 3% is the minimum; 3.5% is the default (increased from 3% effective April 1, 2026). Your employer's 3% is on top of whichever rate you choose.

**Step 4 — Complete the KS2 form (if choosing your own provider)**
Download the KS2 form: https://www.ird.govt.nz/forms-guides/number/forms-100-199/ks2-kiwisaver-deduction-notice
Fill in your IRD number, chosen contribution rate, and chosen provider. Submit to your employer's payroll team alongside your IR330 (T09).

**Step 5 — Register directly with your chosen provider**
Most KiwiSaver providers allow you to register online before your employer enrolment is processed. Visit your chosen provider's website and open an account. You will need your IRD number, NZ bank account, and passport details.

**Step 6 — Confirm enrolment**
After your first pay, check your payslip confirms KiwiSaver deductions at your selected rate. You can view your KiwiSaver balance and contributions via myIR (ird.govt.nz/myIR) once your IRD account is active.

---

KEY_FACTS:
- KiwiSaver employer contribution minimum is 3% of gross salary — on top of your salary, not deducted from it [Type A — KiwiSaver Act 2006, Section 101B]
- Employee contribution options: 3%, 4%, 6%, 8%, or 10% of gross salary [Type A — KiwiSaver Act 2006]
- Government member tax credit: up to $521.43 per year for eligible members contributing minimum $1,042.86/year [Type A — KiwiSaver Act 2006, Section 220]
- Auto-enrolment window: employees have 56 days to opt out of KiwiSaver after starting new employment [Type A — KiwiSaver Act 2006, Section 17]
- Migrants can withdraw full KiwiSaver balance on permanent departure from NZ [Type A — KiwiSaver Act 2006, Section 213]
- KiwiSaver contributions are invested in funds — balance fluctuates with fund performance [Type B — provider-specific]
- Management fees vary by provider: typically 0.3%–1.5% per year of balance [Type C — market rate, check sorted.org.nz]
- Government comparison tool available at sorted.org.nz/kiwisaver [Type B — Commission for Financial Capability]

---

NUMBER_TYPES:
  - figure: "3% minimum employer contribution"
    type: A
    type_label: Statutory
    source: KiwiSaver Act 2006, Section 101B
    caveat: "State as confirmed fact. Legislated minimum — employer cannot contribute less."
    last_confirmed: 2026-03-03

  - figure: "$521.43 government member tax credit per year"
    type: A
    type_label: Statutory
    source: KiwiSaver Act 2006, Section 220
    caveat: "State as confirmed fact. Subject to Budget changes — confirm at ird.govt.nz if significant time has passed."
    last_confirmed: 2026-03-03

  - figure: "$1,042.86 minimum annual contribution to receive full government credit"
    type: A
    type_label: Statutory
    source: KiwiSaver Act 2006, Section 220
    caveat: "State as confirmed fact. Linked to government credit amount — changes if credit amount changes."
    last_confirmed: 2026-03-03

  - figure: "56-day opt-out window"
    type: A
    type_label: Statutory
    source: KiwiSaver Act 2006, Section 17
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "0.3%–1.5% management fees per year"
    type: C
    type_label: Market Rate
    source: sorted.org.nz KiwiSaver fund comparison
    caveat: "Check current fees at sorted.org.nz as these vary by provider and fund type."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya (AEWV holder, salaried software engineer): Joining KiwiSaver is strongly recommended. The employer 3% contribution is a guaranteed 3% salary top-up she would otherwise forgo. At a NZ software engineering salary of $90,000–$130,000, the employer contribution alone adds $2,700–$3,900 per year to her retirement savings — plus the government credit of up to $521.43. Recommended provider: Simplicity Growth Fund (low fees at ~0.31% p.a., growth-oriented, nonprofit). Contribution rate: start at 3% to preserve cash flow during the settlement period; increase later as finances stabilise. Submit KS2 form alongside IR330 (T09) before first pay day.

  Karthik (partner work visa, UoA student): If Karthik takes part-time or casual employment, he is also eligible for KiwiSaver and his employer must contribute 3%. However, if his NZ income is low (e.g. part-time tutoring or casual work), the government member tax credit requires contributing ~$20/week ($1,042.86/year) — this may be a meaningful amount on a student income. His decision should weigh the employer contribution benefit against cash flow constraints during study. If he is not employed in NZ, he cannot be enrolled in KiwiSaver through an employer — but he can make voluntary contributions to an existing account once enrolled.

---

PERSONA_SOLO_AEWV:
  Join KiwiSaver — the employer 3% is free money you cannot access any other way. Choose Simplicity Growth Fund or a similar low-fee growth fund if you are under 50. Set contribution rate to 3% initially to protect cash flow during settlement; you can increase later via myIR. Complete the KS2 form and submit it alongside your IR330 before your first pay day. If you leave NZ permanently in the future, your full balance (including employer contributions and government credits accumulated) can be withdrawn — so even short-to-medium-term migrants benefit.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T08
      task_name: IRD Number Application
      relationship: "IRD number required for KiwiSaver enrollment. Complete T08 first."
    - task_id: T09
      task_name: Tax Code Declaration (IR330)
      relationship: "KS2 form submitted alongside IR330 to employer in the same onboarding packet. Complete T09 and T10 together."
    - task_id: T21
      task_name: KiwiSaver Confirmation and Fund Review
      relationship: "T21 is a 3-month review of KiwiSaver provider, fund type, and contribution rate once settled in NZ. T10 is the initial setup."
  inline_references:
    - "T08 referenced in HOW_TO Step 4 and KEY_FACTS"
    - "T09 referenced in HOW_TO Step 4 and PERSONA fields"
    - "T21 referenced in WHAT_AND_WHY and KEY_FACTS"

---

WATCH_OUTS:
  - If you take no action, you will be auto-enrolled in your employer's default fund, which may be a conservative fund inappropriate for your age and investment horizon. Act proactively to choose your fund type.
  - The 56-day opt-out window is firm. If you decide KiwiSaver is not right for you (rare for AEWV workers), opt out within 56 days of starting employment via your myIR account or via IRD directly. After 56 days, opting out requires a contributions holiday application.
  - Employer contributions are subject to Employer Superannuation Contribution Tax (ESCT) — your employer deducts this tax from their contribution before it reaches your account. This is normal and does not affect your contribution rate.
  - KiwiSaver funds are not bank deposits — your balance can go down as well as up. This is normal for investment funds. Do not select a conservative/defensive fund solely out of fear of loss if your investment horizon is long.
  - Contributions are locked until age 65 or first home purchase (with conditions), except for permanent emigration withdrawal and financial hardship applications. Plan cash flow accordingly.
  - Do not confuse KiwiSaver with NZ Superannuation (NZ Super) — NZ Super is a government pension paid from age 65, separate from KiwiSaver, and available to long-term NZ residents regardless of KiwiSaver participation.

---

SOURCES:
  - title: "KiwiSaver — Inland Revenue overview"
    url: "https://www.ird.govt.nz/kiwisaver"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Primary IRD source for KiwiSaver rules, contribution rates, and government credits."

  - title: "KiwiSaver Act 2006 — New Zealand Legislation"
    url: "https://www.legislation.govt.nz/act/public/2006/0040/latest/DLM378372.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Statutory source — employer contributions, opt-out rules, emigration withdrawal."

  - title: "KS2 KiwiSaver deduction notice — Inland Revenue"
    url: "https://www.ird.govt.nz/forms-guides/number/forms-100-199/ks2-kiwisaver-deduction-notice"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Downloadable KS2 form."

  - title: "KiwiSaver fund comparison — Sorted (Commission for Financial Capability)"
    url: "https://www.sorted.org.nz/tools/kiwisaver-fund-finder"
    tier: 2
    tier_label: Government-backed independent
    last_accessed: 2026-03-03
    notes: "Government-funded independent comparison tool. Use for fee and fund type comparison across all providers."

  - title: "Simplicity KiwiSaver — provider website"
    url: "https://www.simplicity.kiwi/kiwisaver"
    tier: 3
    tier_label: Provider/Commercial
    last_accessed: 2026-03-03
    notes: "Referenced as low-fee provider recommendation. Fees and fund details subject to change — verify at provider site."


---
TASK_ID: T11
TASK_NAME: Rental Agreement and Bond
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if Residential Tenancies Act is amended, bond lodgement rules change, or Tenancy Services updates processes. Check annually or after any housing law announcement.
---

METADATA:
  phase: Month 1
  timing: After arriving and viewing properties in person (typically 1–3 weeks after arrival). Do not sign a rental agreement before arriving — always view in person first.
  time_required: 2–4 hours (viewings + agreement review + bond lodgement)
  priority_score: 88
  task_type: Paid (bond + rent in advance)
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
Signing a rental agreement in New Zealand is governed by the Residential Tenancies Act 1986. Key protections: bond is capped at 4 weeks rent and must be lodged with Tenancy Services (not held by landlord), landlords cannot charge letting fees, and tenants have strong rights around repairs and entry notice. Before signing, verify the bond amount, check the property condition report, and confirm the agreement is a standard fixed-term or periodic tenancy under the RTA. Bond is lodged online via the Tenancy Services bond lodgement portal and is refunded at end of tenancy minus any legitimate deductions.

---

WHAT_AND_WHY:
The New Zealand rental market is regulated under the Residential Tenancies Act 1986 (RTA). Understanding the RTA is essential for migrants because NZ rental practices differ significantly from India, Sri Lanka, and Singapore — and knowing your rights protects you from unlawful landlord demands.

**Key NZ rental framework elements:**

Tenancy types: Fixed-term tenancies (set end date — e.g. 12 months) and periodic tenancies (no fixed end date, continues until notice given). Fixed-term provides more security; periodic gives more flexibility to leave.

Bond: A security deposit paid at the start of tenancy. Capped at a maximum of 4 weeks rent [Type A — RTA Section 18]. The bond does NOT go to the landlord — it must be lodged with Tenancy Services within 23 working days [Type A — RTA Section 22]. At end of tenancy, the bond is refunded minus any legitimate deductions (damage beyond fair wear and tear, unpaid rent).

No letting fees: It is illegal for landlords or property managers to charge tenants a letting fee (admin fee for processing the application) [Type A — RTA Section 13B, amended 2018].

Rent in advance: Landlords can require up to 2 weeks rent in advance [Type A — RTA Section 20]. This is standard and legitimate.

Rent increases: Landlords can only increase rent once every 12 months and must give 60 days notice [Type A — RTA Section 24, amended 2020].

Entry rights: Landlords must give 24 hours notice for inspections (maximum 4 times per year) and 48 hours notice for other entry [Type A — RTA Section 48].

Property condition report: Landlord must provide a signed condition report before or at the start of tenancy [Type A — RTA Section 16B]. You have 5 working days to return it with your own notes. Mark every existing defect — this protects your bond at checkout.

Healthy homes standards: Landlords must comply with NZ healthy homes standards covering heating, insulation, ventilation, moisture, and draught stopping [Type A — Healthy Homes Standards 2019].

---

HOW_TO:
**Step 1 — Search for properties**
Use trademe.co.nz/property (primary NZ rental listing site) and realestate.co.nz. Filter by suburb, bedroom count, and budget. Set up email alerts for new listings. Auckland rental market moves quickly — respond to listings within hours and schedule viewings immediately.

**Step 2 — View properties in person**
Never sign a rental agreement for a property you have not personally inspected. Common Auckland rental issues: dampness/mould (especially in older villas), single-glazed windows (cold in winter), poor insulation, street parking only. Check heating (heat pump is preferred), water pressure, and mobile signal inside the property.

**Step 3 — Submit a rental application**
Applications typically require: photo ID (passport), proof of income (employment offer letter or payslips), NZ bank account details, previous landlord references (overseas references acceptable for new migrants), and personal references. Some property managers use tenancy application platforms (Tapi, Palace, Renti).

**Step 4 — Review the tenancy agreement before signing**
Check: rent amount, bond amount (must not exceed 4 weeks rent), tenancy type (fixed or periodic), start date, names of all tenants, no letting fee charged, break clause terms (for fixed-term). Do not sign under time pressure — you are entitled to read the full agreement.

**Step 5 — Complete the property condition report**
Photograph every room at the start of tenancy. Note every mark, stain, scratch, and defect on the condition report. Email your completed condition report to the property manager with photos attached. Keep all copies.

**Step 6 — Pay bond and rent in advance**
Bond: maximum 4 weeks rent. Rent in advance: maximum 2 weeks. Pay by bank transfer (never cash without receipt). Keep payment confirmation records.

**Step 7 — Confirm bond lodgement**
Within 23 working days of paying your bond, your landlord or property manager must lodge it with Tenancy Services. You will receive a bond lodgement receipt from Tenancy Services. If you do not receive this within 4 weeks, contact Tenancy Services: 0800 836 262. Check bond status at: https://www.tenancy.govt.nz/bonds/check-bond-status

**Step 8 — Set up utilities and contents insurance**
At move-in, arrange:
- Electricity: Contact provider (Genesis, Contact, Mercury, Flick, or similar) to transfer account to your name. Compare at powerswitch.org.nz.
- Internet: Spark, One NZ, 2degrees, Voyager — compare plans at broadbandcompare.co.nz.
- Contents insurance: Arranged before or on move-in day (see T04). Landlord's insurance does NOT cover your belongings.

---

KEY_FACTS:
- Bond is capped at 4 weeks rent maximum [Type A — RTA Section 18]
- Bond must be lodged with Tenancy Services (not held by landlord) within 23 working days [Type A — RTA Section 22]
- Letting fees are illegal — landlords and property managers cannot charge tenants for processing applications [Type A — RTA Section 13B]
- Rent in advance capped at 2 weeks [Type A — RTA Section 20]
- Rent can only be increased once every 12 months with 60 days notice [Type A — RTA Section 24]
- Landlord must provide signed property condition report before tenancy starts [Type A — RTA Section 16B]
- Inspection notice: 24 hours for routine inspections, 48 hours for other entry [Type A — RTA Section 48]
- Average Auckland 2BR rent: $550–$1,100/week depending on suburb [Type C — trademe.co.nz market rate]
- Contents insurance is not provided by landlord's building insurance — tenant must arrange separately [Type B — general insurance principle, confirmed by RTA and insurance industry]

---

NUMBER_TYPES:
  - figure: "4 weeks bond maximum"
    type: A
    type_label: Statutory
    source: Residential Tenancies Act 1986, Section 18
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "23 working days for bond lodgement"
    type: A
    type_label: Statutory
    source: Residential Tenancies Act 1986, Section 22
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "2 weeks rent in advance maximum"
    type: A
    type_label: Statutory
    source: Residential Tenancies Act 1986, Section 20
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "60 days notice for rent increase"
    type: A
    type_label: Statutory
    source: Residential Tenancies Act 1986, Section 24
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "$550–$1,100/week for 2BR Auckland rental"
    type: C
    type_label: Market Rate
    source: trademe.co.nz rental listings
    caveat: "Check current rental prices at trademe.co.nz as these vary significantly by suburb and market conditions."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya and Karthik should sign a joint tenancy agreement — both names on the lease. This provides both with full tenant rights and avoids one partner being an undocumented occupant. Budget: $650–$850/week for a 2BR in inner Auckland suburbs (Newmarket, Mt Eden, Parnell, Grey Lynn) that balances Priya's CBD commute with Karthik's UoA Grafton campus proximity. Bond upfront cost: at $700/week rent, bond = $2,800 + 2 weeks advance = $1,400 = $4,200 upfront cash requirement at lease signing. Have this available from day of viewing — Auckland rentals often require same-day or next-day commitment.

  Overseas references: Many Auckland property managers accept overseas employer references and professional character references for new migrants — explain the situation honestly in the application covering letter. Priya's DBS Singapore employment history and Karthik's professional background strengthen the application. Offer a direct rental payment reference (bank statement showing regular rent payments in Singapore) if available.

  Community rental groups: Check Facebook groups "Auckland Flatmates and Rentals", "Indians in Auckland", "Sri Lankans in Auckland" for informal listings and community vouching — this can help secure a rental when competing without NZ rental history.

---

PERSONA_SOLO_AEWV:
  As a solo migrant, consider a 1BR apartment or a room in a flatshare for the first 3–6 months — lower upfront cost and more flexibility while establishing NZ credit history and understanding suburbs. Flatshares are common in Auckland and advertised on trademe.co.nz and Facebook groups. If joining a flatshare, ensure your name is on the tenancy agreement (or at minimum a written room rental agreement) — verbal arrangements offer limited protection. Bond for a room in a flatshare is typically $500–$1,200 [Type C]. Transition to a 1BR apartment once settled.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T02
      task_name: Temporary Accommodation Booking
      relationship: "T02 is the pre-arrival temp accommodation that provides the NZ address needed for bank account and IRD. T11 is the permanent rental signed after arriving and viewing properties. Do not skip T02 — arriving without temp accommodation forces rushed permanent rental decisions."
    - task_id: T04
      task_name: Moving and Transit Insurance
      relationship: "T04 covers arranging contents insurance — action this on move-in day for permanent rental."
    - task_id: T12
      task_name: Tenancy Rights and Dispute Resolution
      relationship: "T12 covers your rights as a tenant under the RTA in detail — read alongside T11."
  inline_references:
    - "T02 referenced in WHAT_AND_WHY and PERSONA fields"
    - "T04 referenced in HOW_TO Step 8"
    - "T12 referenced in KEY_FACTS and WATCH_OUTS"

---

WATCH_OUTS:
  - Never pay a bond in cash without an immediate written receipt. Always pay by bank transfer to a documented account.
  - If your landlord does not lodge the bond within 4 weeks, follow up in writing and contact Tenancy Services. Unlodged bonds are a red flag.
  - Do not sign a rental agreement with a letting fee included — this is illegal under the RTA and you should refuse or report to Tenancy Services.
  - The property condition report is your primary bond protection document. A vague or incomplete report at move-in is used by landlords to claim damage at move-out. Document everything with photos before moving any furniture in.
  - Auckland rental scams exist — especially on Facebook Marketplace. Legitimate landlords do not ask for bond before a signed agreement, do not communicate only by WhatsApp, and do not claim to be overseas. Use trademe.co.nz and licensed property managers where possible.
  - As a new migrant, you may feel pressure to accept poor-condition properties because of lack of NZ rental history. You have full rights under the RTA from day one of your tenancy — visa status does not affect tenancy rights.

---

SOURCES:
  - title: "Residential Tenancies Act 1986 — New Zealand Legislation"
    url: "https://www.legislation.govt.nz/act/public/1986/0120/latest/DLM94278.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Primary statute governing all residential tenancies in NZ."

  - title: "Tenancy Services — bonds"
    url: "https://www.tenancy.govt.nz/bonds"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Official guide to bond lodgement, checking bond status, and bond refund process."

  - title: "Tenancy Services — starting a tenancy"
    url: "https://www.tenancy.govt.nz/starting-a-tenancy"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Comprehensive official guide to condition reports, tenancy agreements, and new tenant obligations."

  - title: "trademe.co.nz — rental listings"
    url: "https://www.trademe.co.nz/a/property/residential/rent"
    tier: 3
    tier_label: Market/Commercial
    last_accessed: 2026-03-03
    notes: "Primary NZ rental listing site — used for price benchmarking and property search."

  - title: "Powerswitch — electricity comparison"
    url: "https://www.powerswitch.org.nz"
    tier: 2
    tier_label: Government-backed independent
    last_accessed: 2026-03-03
    notes: "Consumer NZ electricity price comparison tool — government-supported."


---
TASK_ID: T12
TASK_NAME: GP Registration and Primary Healthcare
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if Ministry of Health changes Community Services Card eligibility, GP enrolment subsidies, or primary care funding. Check annually or after health policy announcements.
---

METADATA:
  phase: Month 1
  timing: Register with a GP within first 2–4 weeks of arrival. Do not wait until you are sick — enrolled patients receive subsidised rates and priority appointments.
  time_required: 30–60 minutes (registration process; ongoing relationship)
  priority_score: 85
  task_type: Paid (enrolment and consultations — subsidised rates for eligible migrants)
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
New Zealand's primary healthcare system is organised around General Practitioners (GPs) — your first point of contact for all non-emergency medical care. Registering as an enrolled patient at a GP practice entitles you to subsidised consultation fees. Most AEWV workers qualify for subsidised rates (typically $20–$60 per consultation) rather than the full unsubsidised rate ($80–$150+). Register early, before you need care. NZ does not have a walk-in GP system like Singapore's polyclinics — enrolled patients receive appointments; unregistered patients are seen as "casual" at higher cost.

---

WHAT_AND_WHY:
New Zealand's health system is a mixed public/private model. Hospital and specialist care is largely publicly funded through District Health Boards (now Health New Zealand | Te Whatu Ora). Primary care (GP visits, prescriptions, preventive care) is partially subsidised by the government but requires co-payments from patients.

**Enrolment vs casual GP visits:**
When you register as an enrolled patient at a GP practice, the practice receives government funding (a capitation payment) for your care. In return, enrolled patients pay lower subsidised consultation fees. Casual (non-enrolled) patients pay the full unsubsidised rate. The difference is significant: enrolled rates of $20–$60 versus casual rates of $80–$150+ per visit.

**Eligibility for subsidies:**
AEWV holders are eligible for primary health care subsidies if their visa allows them to be in NZ for 2 or more years, OR if they are a refugee, protected person, or domestic violence victim. Most skilled migrant AEWV holders on 2-3 year visas qualify. Confirm with the GP practice at registration.

**Community Services Card (CSC):**
A CSC further reduces GP co-payments and prescription costs for lower-income households. Eligibility is income-tested. Skilled migrants on higher salaries are unlikely to qualify initially — but worth checking at Work and Income NZ (winz.govt.nz) if household income is modest.

**Prescription costs:**
Most prescribed medications cost $5.00 per item [Type A — Pharmaceutical Schedule] for eligible patients (with CSC, some medications are free). Without subsidy, pharmacy costs are higher. Always ask the pharmacist about subsidised options.

**After-hours care:**
For urgent care outside GP hours, use an Accident and Urgent Medical Clinic (not hospital ED) — these treat non-life-threatening urgent conditions at lower cost and shorter wait times than hospital emergency departments.

---

HOW_TO:
**Step 1 — Find a GP practice accepting new enrolments near your home or workplace**
Use the Health New Zealand GP finder: https://www.healthpoint.co.nz
Filter by location and check "accepting new patients." GP practices in central Auckland can have waitlists — start searching early. Some South Auckland practices have shorter waitlists and are accessible by PT.

**Step 2 — Contact the practice to confirm enrolment availability**
Call or email the practice. Confirm they are accepting new patients and ask what documents are needed for enrolment. Some practices have online enrolment forms.

**Step 3 — Prepare enrolment documents**
Typically required:
- Passport
- Visa details (type and expiry)
- NZ address
- NZ mobile number
- NHI (National Health Index) number if you have one from a previous NZ visit — if not, one will be assigned at registration
- Previous health history summary (optional but helpful — especially for any chronic conditions, medications, or allergies)

**Step 4 — Complete enrolment**
In person or online depending on the practice. You may be asked to complete a health questionnaire. Bring all medications you currently take and a list of any known allergies.

**Step 5 — Understand the fee structure**
Ask the practice what your enrolled consultation fee will be. Most practices charge $20–$60 for enrolled adults [Type B — practice-specific, varies by funding zone and practice]. If significantly higher, compare with other nearby practices. Some GP practices bulk-bill (zero co-payment) for eligible patients — these are less common but exist.

**Step 6 — Book an initial consultation within the first month**
Even if you are well, a new patient consultation helps establish your health record, discuss any medications, review vaccinations, and understand the NZ health system. It is also the opportunity to arrange any prescription renewals you need.

**Step 7 — Obtain a NHI number**
Your NHI (National Health Index) number is your NZ health identifier — used across all health services including hospitals, specialists, and labs. It is assigned automatically when you first interact with the NZ health system (GP, ED, or lab). Record it and keep it with your important documents.

---

KEY_FACTS:
- AEWV holders with 2+ year visas are eligible for subsidised GP rates [Type A — Health (Subsidised Primary Health Care) Notice 2011]
- Most prescribed medications cost $5.00 per item for eligible patients [Type A — Pharmaceutical Schedule, Ministry of Health]
- NHI (National Health Index) number is NZ's health identifier — assigned at first health interaction [Type B — Health New Zealand administrative]
- Enrolled GP consultation rates: typically $20–$60 per visit [Type B — practice-specific, subject to individual practice pricing]
- Unsubsidised (casual) GP rates: typically $80–$150+ per visit [Type B/C — varies by practice]
- After-hours urgent care clinics are an alternative to hospital ED for non-life-threatening conditions [Type B — Health New Zealand guidance]
- Community Services Card reduces GP and prescription costs for low-income households — income-tested eligibility [Type A — Health (Subsidised Primary Health Care) Notice, income thresholds reviewed annually]
- Dental care is NOT covered by the NZ public health system for adults — budget separately for dental [Type B — Ministry of Health policy]

---

NUMBER_TYPES:
  - figure: "$5.00 per prescription item"
    type: A
    type_label: Statutory
    source: Pharmaceutical Schedule, Ministry of Health
    caveat: "State as confirmed fact for eligible patients. Confirm current co-payment at health.govt.nz as Pharmaceutical Schedule is reviewed regularly."
    last_confirmed: 2026-03-03

  - figure: "$20–$60 enrolled GP consultation"
    type: B
    type_label: Administrative
    source: Health New Zealand practice funding data
    caveat: "Confirm current consultation fee with your specific GP practice at enrolment as fees vary by practice and funding zone."
    last_confirmed: 2026-03-03

  - figure: "$80–$150+ unsubsidised casual GP consultation"
    type: C
    type_label: Market Rate
    source: Auckland GP practice survey
    caveat: "Check current rates with specific practices as these vary."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Both Priya and Karthik need to register with GPs — they can enrol at the same practice or separately depending on proximity to home and work. Priority: register within first 2 weeks of moving into permanent accommodation (T11). Confirm that the practice accepts patients on work visas — virtually all do, but confirm AEWV eligibility for subsidised rates at registration.

  Priya: If she has any ongoing medications or conditions from Singapore, bring documentation (prescription history, specialist letters) to the initial consultation. NZ doctors will need to assess and may require a NZ prescription before continuing medications — arrange this promptly to avoid gaps.

  Karthik: UoA has a student health service (University Health and Counselling) at the Grafton campus — this is a subsidised GP service available to enrolled students. Karthik should register with UoA Health Services as his primary GP: it offers very competitive rates for students and is on campus. URL: https://www.auckland.ac.nz/en/students/student-support/health-counselling-chaplaincy.html

  Dental: New Zealand provides limited public dental care for adults. Budget $150–$350 for a private dental check-up and clean [Type C]. If either has outstanding dental work, complete it in Singapore before departure — NZ private dental costs are high.

---

PERSONA_SOLO_AEWV:
  Register with a GP near your home or workplace within your first 2 weeks at permanent accommodation. Use healthpoint.co.nz to find practices accepting new patients. Confirm your AEWV qualifies you for subsidised rates (it almost certainly does on a 2+ year visa). The $20–$60 enrolled rate is worth the registration step — casual rates at $80–$150+ are significantly higher for the same service. Arrange prescription renewals for any ongoing medications at your first consultation. Note your NHI number once assigned — you will need it for any specialist referrals, hospital visits, or lab tests.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T11
      task_name: Rental Agreement and Bond
      relationship: "GP registration requires a permanent NZ address — complete T11 (permanent rental) before registering with a local GP near your home."
    - task_id: T13
      task_name: ACC Overview
      relationship: "ACC (Accident Compensation Corporation) covers accident-related injuries — complementary to GP care. GP is your first contact for both illness and accident follow-up. Read T13 alongside T12."
  inline_references:
    - "T11 referenced in HOW_TO and PERSONA fields"
    - "T13 referenced in WHAT_AND_WHY and WATCH_OUTS"

---

WATCH_OUTS:
  - Do not assume NZ operates like Singapore's polyclinic system. You cannot walk into any GP and be seen as an enrolled patient. Enrolment is required for subsidised rates.
  - Dental care is entirely private for adults in NZ. Do not expect public dental treatment. Budget for this separately.
  - Mental health support through GPs is available — GPs can refer to free or subsidised counselling under the government's Primary Mental Health scheme. Do not hesitate to raise mental health concerns at your GP consultation — this is normalised in NZ healthcare.
  - If you need urgent care outside GP hours, go to an Accident and Urgent Medical Clinic (e.g. Shorecare, White Cross, After Hours Medical) — not a hospital ED unless it is a genuine emergency. Hospital EDs have very long wait times for non-emergency presentations.
  - Your GP visit is confidential. Visa status does not affect your right to medical care and will not be reported to Immigration NZ.
  - New migrants sometimes delay GP registration until they are ill, then face higher casual rates and longer waits. Register proactively.

---

SOURCES:
  - title: "Healthpoint — find a GP"
    url: "https://www.healthpoint.co.nz/general-practice"
    tier: 2
    tier_label: Government-backed independent
    last_accessed: 2026-03-03
    notes: "Primary tool for finding GP practices accepting new patients by location."

  - title: "Health (Subsidised Primary Health Care) Notice 2011 — Ministry of Health"
    url: "https://www.health.govt.nz/our-work/primary-health-care/about-primary-health-organisations"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Statutory basis for GP subsidy eligibility including work visa holders."

  - title: "Pharmaceutical Schedule — Ministry of Health"
    url: "https://www.pharmac.govt.nz/medicines/pharmaceutical-schedule"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Source for $5 prescription co-payment and subsidised medication list."

  - title: "University of Auckland — Health and Counselling"
    url: "https://www.auckland.ac.nz/en/students/student-support/health-counselling-chaplaincy.html"
    tier: 2
    tier_label: Educational Institution
    last_accessed: 2026-03-03
    notes: "UoA student health service — relevant for Karthik persona."

  - title: "Community Services Card — Work and Income NZ"
    url: "https://www.workandincome.govt.nz/products/a-z-benefits/community-services-card.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Eligibility and application for Community Services Card."


---
TASK_ID: T13
TASK_NAME: ACC Overview
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if ACC levy rates change, coverage scope changes, or if ACC Act is amended. Check after each Budget announcement or ACC annual review.
---

METADATA:
  phase: Month 1
  timing: Awareness task — no action required. Understand ACC before you need it. Levies are automatically deducted from salary.
  time_required: 20 minutes (reading and awareness)
  priority_score: 70
  task_type: Informational (levies automatically deducted — no enrolment needed)
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
ACC (Accident Compensation Corporation) is New Zealand's universal no-fault accident insurance scheme. It covers all people in New Zealand — residents, migrants, and visitors — for the cost of treatment and rehabilitation for accidents and injuries. In exchange, New Zealanders and workers cannot sue for personal injury damages in most circumstances. ACC is funded through levies paid by earners, employers, and vehicle owners. As an AEWV worker, you are automatically covered from day one — your employer deducts your ACC earner levy from your salary. No registration or action is required.

---

WHAT_AND_WHY:
ACC is one of New Zealand's most distinctive social policy features — and one that new migrants frequently misunderstand or are unaware of.

**What ACC covers:**
ACC covers treatment, rehabilitation, and compensation for injuries and accidents. This includes: workplace accidents, sports injuries, road accidents, falls at home, and medical misadventures. It covers doctor visits, hospital treatment, surgery, physiotherapy, and other rehabilitation directly related to the accident. It can also cover weekly compensation (approximately 80% of pre-injury earnings) if you cannot work due to an accident-related injury.

**What ACC does NOT cover:**
ACC does not cover illness, disease, or gradual deterioration. It covers sudden physical injury caused by an identifiable accident. For example: a broken leg from a fall = ACC covered. Diabetes treatment = not ACC covered (use health insurance or GP subsidies). A work-related stress condition = generally not ACC covered (unless there is a specific identifiable workplace incident).

**The no-fault trade-off:**
Because ACC provides universal accident cover, NZ law prevents most personal injury lawsuits. You cannot sue a driver who injures you in a car accident (ACC covers your treatment instead). This is different from India, Sri Lanka, and Singapore where personal injury litigation is possible.

**Levies:**
ACC is funded through three levies:
1. Earner levy: deducted from your salary by your employer — approximately 1.45% of earnings up to a maximum [Type B — ACC levy schedule, reviewed annually]
2. Employer levy: paid by your employer — varies by industry risk classification [Type B — ACC levy schedule]
3. Motor vehicle levy: included in vehicle registration fees [Type B — NZTA/ACC]

As an employee, your earner levy is automatically deducted — you do not need to do anything. It appears on your payslip as "ACC earner levy."

**How to make an ACC claim:**
If you are injured in an accident, inform your GP or treating healthcare provider. They submit the ACC claim on your behalf. You do not contact ACC directly for initial treatment claims — your healthcare provider does. For follow-up, check claim status at: https://www.acc.co.nz/

---

HOW_TO:
**This is an awareness task — no enrolment or registration required.**

Step 1 — Confirm you understand what ACC covers vs. does not cover (see WHAT_AND_WHY above).

Step 2 — Note that your ACC earner levy will appear on your payslips automatically — this is normal and expected.

Step 3 — If you are injured in an accident:
- Seek treatment immediately (GP, urgent care clinic, or hospital ED)
- Tell your treating provider you want to make an ACC claim
- Your provider registers the claim
- ACC will contact you about your claim status

Step 4 — Consider private health insurance to cover what ACC does not: illness, elective procedures, specialists, and dental. ACC gap is significant for migrants who do not have a GP relationship yet and may face high casual health costs for illness.

Step 5 — If you own a vehicle in NZ, your motor vehicle ACC levy is included in your annual vehicle registration — no separate action needed.

---

KEY_FACTS:
- ACC covers all people physically present in NZ — including tourists, migrants, and visa holders — for accident-related injuries from day one [Type A — Accident Compensation Act 2001, Section 18]
- ACC does NOT cover illness, disease, or gradual conditions — only accident-related injuries [Type A — Accident Compensation Act 2001]
- ACC weekly compensation for work-incapacity is approximately 80% of pre-injury earnings up to the maximum liable earnings [Type A — Accident Compensation Act 2001, Section 103]
- ACC earner levy is automatically deducted from salary — no enrolment needed [Type B — ACC administrative]
- ACC earner levy rate: approximately 1.45% of earnings (subject to annual review) [Type B — ACC levy schedule, reviewed annually]
- Claims are lodged by your healthcare provider, not directly by you in most cases [Type B — ACC administrative process]
- Maximum earner levy applies to earnings up to a legislated cap [Type A — Accident Compensation Act 2001, Section 168]
- Private health insurance is recommended to cover illness, specialists, and elective treatment not covered by ACC [Type C — market]

---

NUMBER_TYPES:
  - figure: "80% of pre-injury earnings (weekly compensation)"
    type: A
    type_label: Statutory
    source: Accident Compensation Act 2001, Section 103
    caveat: "State as confirmed fact. Subject to maximum liable earnings cap — confirm current cap at acc.co.nz."
    last_confirmed: 2026-03-03

  - figure: "1.45% earner levy rate"
    type: B
    type_label: Administrative
    source: ACC levy schedule (reviewed annually)
    caveat: "Add caveat: 'Confirm current earner levy rate at acc.co.nz as this is reviewed annually.'"
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya and Karthik are both covered by ACC from the moment they arrive in New Zealand — no action required. Priya's earner levy will be deducted from her salary automatically. Karthik's levy will be deducted if he takes paid employment.

  Key consideration: Neither Priya nor Karthik has NZ private health insurance at arrival. ACC covers accidents but not illness. In the gap period before GP enrolment (T12) and before any private health insurance is arranged, illness costs are at casual GP rates ($80–$150+). Priority: complete T12 (GP registration) promptly to access subsidised rates for illness. Consider a private health insurance policy (Southern Cross, nib, AIA are major NZ providers [Type C]) within the first month — particularly relevant given Priya's employment and ability to fund premiums.

---

PERSONA_SOLO_AEWV:
  You are covered by ACC for accidents from day one — no action needed. Your earner levy appears on your payslip and is not optional. The key takeaway for solo migrants: ACC closes the accident gap but not the illness gap. Register with a GP (T12) early and consider private health insurance for illness, specialists, and dental. Southern Cross Health Insurance is the largest NZ provider and worth comparing [Type C — check southerncross.co.nz].

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T12
      task_name: GP Registration and Primary Healthcare
      relationship: "GP is your first contact for both illness (not ACC covered) and accident treatment initiation (ACC covered). Read T12 and T13 together."
    - task_id: T04
      task_name: Moving and Transit Insurance
      relationship: "T04 covers transit insurance — ACC does not apply outside NZ territory. Ensure transit coverage is in place before departure."
  inline_references:
    - "T12 referenced throughout"
    - "T04 referenced in WHAT_AND_WHY context"

---

WATCH_OUTS:
  - ACC is not a substitute for health insurance. Illness, cancer, heart disease, and elective procedures are not covered by ACC — and NZ public hospital wait times for elective procedures can be very long. Private health insurance fills this gap.
  - If you have a pre-existing condition that worsens due to an accident, ACC covers the accident-related component only — not the underlying pre-existing condition. Claims can be complex in these cases.
  - Do not try to claim ACC for illness or gradual onset conditions — the claim will be declined and delays your treatment. Use your GP for illness.
  - ACC claims lodged by your healthcare provider are generally straightforward for clear accident injuries. If your claim is declined, you have the right to appeal — contact ACC for the dispute resolution process.
  - Some migrants from systems with comprehensive government health insurance (e.g. Singapore's MediShield Life, India's CGHS) are surprised by the gap in NZ. NZ's public health system is strong for serious conditions and hospital care, but primary care and specialist access requires planning and cost management.

---

SOURCES:
  - title: "Accident Compensation Act 2001 — New Zealand Legislation"
    url: "https://www.legislation.govt.nz/act/public/2001/0049/latest/DLM99494.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Primary statute — coverage scope, weekly compensation, and levy framework."

  - title: "ACC — what we cover"
    url: "https://www.acc.co.nz/im-injured/what-we-cover"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "ACC official guidance on covered and excluded conditions."

  - title: "ACC levies — earner levy rates"
    url: "https://www.acc.co.nz/im-a-business/levies/earner-levies"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Current earner levy rates — reviewed annually."

  - title: "Southern Cross Health Insurance — NZ"
    url: "https://www.southerncross.co.nz"
    tier: 3
    tier_label: Provider/Commercial
    last_accessed: 2026-03-03
    notes: "Referenced as major NZ private health insurer — verify current plans and premiums directly."


---
TASK_ID: T14
TASK_NAME: Tenancy Rights and Dispute Resolution
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if Residential Tenancies Act is amended, Tenancy Tribunal processes change, or notice period rules are updated. Check annually or after any housing law reform announcement.
---

METADATA:
  phase: Month 1
  timing: Awareness task — read within first month of signing rental agreement (T11). Act if issues arise.
  time_required: 30 minutes (reading and awareness)
  priority_score: 72
  task_type: Informational (free dispute resolution available through Tenancy Services)
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
New Zealand tenants have strong statutory rights under the Residential Tenancies Act 1986. Key protections: landlords cannot enter without notice, cannot increase rent more than once every 12 months, cannot retaliate against tenants who assert their rights, and must maintain the property in a reasonable state of repair. Disputes are resolved through Tenancy Services mediation (free) or the Tenancy Tribunal (low-cost adjudication). New migrants are often unaware of these rights and accept unlawful landlord behaviour — this task equips you to assert your rights confidently.

---

WHAT_AND_WHY:
In India, Sri Lanka, and Singapore, tenant protections exist but are frequently weaker in practice, less enforced, and culturally less normalised to assert. In New Zealand, the Residential Tenancies Act 1986 provides strong, enforceable statutory rights — and landlords (or property managers) who violate these rights face financial penalties.

Understanding your rights serves two purposes: protection when things go wrong, and confidence when interacting with landlords and property managers who may assume migrant tenants will not challenge unlawful demands.

**Your key rights as a tenant:**

Right to quiet enjoyment: Your landlord cannot repeatedly call you, show up uninvited, or harass you. You have the right to live in the property without interference.

Notice requirements for entry: 24 hours notice for routine inspections (maximum 4 times per year), 48 hours for other entry, immediate access only in genuine emergencies [Type A — RTA Section 48].

Repairs and maintenance: Your landlord must maintain the property in a reasonable state of repair. Report maintenance issues in writing (email or through the property manager's system). Keep records of all communications. If repairs are not done within a reasonable time, you can apply to the Tenancy Tribunal for a work order or rent reduction.

Rent increases: Only once every 12 months, with 60 days written notice, and rent cannot be increased within 12 months of the tenancy start [Type A — RTA Section 24].

Ending a tenancy:
- Periodic tenancy: Tenant can end with 28 days written notice. Landlord can end with 63 days notice (no reason required) or 42 days notice if selling the property [Type A — RTA Sections 51, 53, amended 2021].
- Fixed-term tenancy: Cannot be ended early by either party except by mutual agreement or serious breach, unless the fixed-term agreement includes a break clause.

Unlawful rent increases or excessive bond: You can dispute these through Tenancy Services.

**Dispute resolution pathway:**
1. Raise issue with landlord/property manager in writing first — keep records.
2. If unresolved, contact Tenancy Services mediation (free): 0800 836 262 or online at tenancy.govt.nz.
3. If mediation fails, apply to the Tenancy Tribunal (hearing fee $28 [Type B — Tenancy Services, subject to revision]).
4. Tenancy Tribunal is a quasi-judicial body that can order rent repayment, compensation, repairs, and penalties against landlords.

---

HOW_TO:
**This is primarily an awareness task. Actions are triggered only if issues arise.**

**Ongoing best practice:**
1. Always communicate with your landlord or property manager in writing (email or messaging app with read receipts). Verbal agreements are hard to enforce.
2. Keep all tenancy documents: signed agreement, condition report, payment receipts, maintenance requests, and responses.
3. Report maintenance issues in writing as soon as they arise — do not wait. A written record establishes when the landlord was notified.

**If you receive an unlawful demand:**
- Landlord requests bond above 4 weeks rent → politely decline in writing, cite RTA Section 18.
- Landlord charges a letting fee → do not pay; letting fees are illegal under RTA Section 13B.
- Landlord attempts to enter without notice → advise in writing that 24/48 hours notice is required under RTA Section 48.
- Landlord attempts a rent increase within 12 months or without 60 days notice → decline in writing, cite RTA Section 24.

**If a dispute arises:**
1. Document everything — dates, communications, photos if relevant.
2. Contact Tenancy Services mediation: tenancy.govt.nz or 0800 836 262.
3. A mediator will contact both parties and attempt to resolve the dispute. Mediation is free and confidential.
4. If mediation fails, apply to the Tenancy Tribunal online at tenancy.govt.nz/disputes/apply-to-tribunal. Hearing fee: $28 [Type B].
5. Tribunal hearings are held in person (or by AVL). Both parties present their case. Decisions are legally binding.

**At end of tenancy:**
1. Give correct written notice (28 days for periodic tenancy).
2. Clean property thoroughly and repair any damage caused by you (not fair wear and tear).
3. Attend a checkout inspection with the property manager.
4. If bond deductions are disputed, do not agree to deductions you consider unfair — apply to Tenancy Services for bond adjudication instead.

---

KEY_FACTS:
- Landlord entry requires 24 hours notice for inspections and 48 hours for other entry [Type A — RTA Section 48]
- Inspections limited to 4 per year maximum [Type A — RTA Section 48]
- Rent increases: maximum once every 12 months with 60 days notice [Type A — RTA Section 24]
- Tenant notice to end periodic tenancy: 28 days [Type A — RTA Section 51]
- Landlord notice to end periodic tenancy: 63 days (no reason) or 42 days (property sale) [Type A — RTA Section 53]
- Tenancy Services mediation is free [Type B — Tenancy Services administrative]
- Tenancy Tribunal application fee: $28 [Type B — Tenancy Services, subject to revision]
- Retaliatory notice (landlord evicting tenant for asserting rights) is unlawful [Type A — RTA Section 54A]
- Healthy homes standards must be met by all rental properties [Type A — Healthy Homes Standards 2019]

---

NUMBER_TYPES:
  - figure: "24 hours notice for inspections"
    type: A
    type_label: Statutory
    source: Residential Tenancies Act 1986, Section 48
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "48 hours notice for other entry"
    type: A
    type_label: Statutory
    source: Residential Tenancies Act 1986, Section 48
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "28 days tenant notice / 63 days landlord notice"
    type: A
    type_label: Statutory
    source: Residential Tenancies Act 1986, Sections 51, 53
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "$28 Tenancy Tribunal fee"
    type: B
    type_label: Administrative
    source: Tenancy Services fee schedule
    caveat: "Confirm current fee at tenancy.govt.nz as administrative fees are subject to revision."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya and Karthik as joint tenants have identical rights under the RTA — both are full tenants, not one primary and one secondary. If a dispute arises with a landlord, either or both can engage with Tenancy Services. Communication with the landlord should be from a single point (typically one email address) for clarity — but both names should appear on any formal written notices.

  Common scenarios for new migrants in Auckland: landlord requesting more than 4 weeks bond (unlawful — decline citing RTA Section 18), landlord refusing to lodge bond with Tenancy Services (unlawful — escalate to Tenancy Services), landlord attempting to increase rent within 12 months of tenancy start (unlawful — decline in writing citing RTA Section 24), property manager entering without notice (unlawful — document and advise in writing).

  Language note: All tenant rights apply regardless of nationality or visa status. Migrant status does not reduce your rights. If a property manager implies otherwise, they are incorrect and potentially acting unlawfully.

---

PERSONA_SOLO_AEWV:
  As a sole tenant, asserting your rights may feel more daunting without a partner to share the process. Key confidence point: Tenancy Services mediators are neutral and the process is free. You do not need a lawyer. Document everything in writing, use Tenancy Services mediation as your first step, and know that the law is strongly on your side as a residential tenant in NZ.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T11
      task_name: Rental Agreement and Bond
      relationship: "T11 covers signing the rental agreement and bond — T14 covers your ongoing rights and remedies once the tenancy is established. Read T11 first, then T14."
    - task_id: T17
      task_name: NZ Driving Licence Conversion
      relationship: "No direct relationship — included for completeness of cross-reference schema."
  inline_references:
    - "T11 referenced throughout as the foundation task for this awareness task"
    - "Tenancy Services and Tenancy Tribunal both referenced in HOW_TO"

---

WATCH_OUTS:
  - Do not accept verbal assurances from landlords or property managers — everything must be in writing for Tenancy Tribunal purposes.
  - Some Auckland property managers are large agencies with dedicated legal teams. Do not be intimidated — the Tenancy Tribunal process is designed to be accessible to tenants without legal representation.
  - If you receive a 63-day notice to vacate without explanation, this is lawful (periodic tenancy) — but if it follows you asserting a right (e.g. requesting repairs), it may constitute retaliatory notice, which is unlawful under RTA Section 54A. Document the timeline carefully.
  - Subletting (renting your place to others) requires written landlord consent unless your tenancy agreement explicitly permits it. Unauthorised subletting is a breach of tenancy and grounds for termination.
  - Moving out without giving proper written notice forfeits your right to the bond refund for the notice period and may result in a Tribunal order for additional rent.
  - Healthy homes compliance: if your rental property is clearly non-compliant (e.g. no heating in living areas, inadequate insulation), you can report to Tenancy Services. Landlords face significant penalties for non-compliance.

---

SOURCES:
  - title: "Residential Tenancies Act 1986 — New Zealand Legislation"
    url: "https://www.legislation.govt.nz/act/public/1986/0120/latest/DLM94278.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Full RTA — all sections referenced in this task."

  - title: "Tenancy Services — tenant rights and responsibilities"
    url: "https://www.tenancy.govt.nz/tenants-rights-and-responsibilities"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Official Tenancy Services guide to tenant rights."

  - title: "Tenancy Tribunal — applying to the Tribunal"
    url: "https://www.tenancy.govt.nz/disputes/apply-to-tribunal"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Application process, fees, and hearing information for Tenancy Tribunal."

  - title: "Healthy Homes Standards — Tenancy Services"
    url: "https://www.tenancy.govt.nz/healthy-homes"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Full healthy homes compliance requirements for rental properties."


---
TASK_ID: T15
TASK_NAME: International Remittances Setup
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if major remittance providers change fees or exchange rates significantly, or if NZ or India/Sri Lanka introduce new foreign exchange controls. Check annually.
---

METADATA:
  phase: Month 1–2
  timing: Set up within first 4–6 weeks after opening NZ bank account (T07). First remittance typically needed once NZ salary payments begin.
  time_required: 1–2 hours (account setup and first transfer)
  priority_score: 75
  task_type: Paid (transfer fees and exchange rate margin)
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
Once you are earning in NZ dollars, you will likely need to send money to family in India or Sri Lanka, service home-country loans, or maintain overseas accounts. NZ bank wire transfers are expensive and slow — specialist remittance services (Wise, Instarem, Western Union, or bank-to-bank SWIFT) are faster and significantly cheaper. Set up your preferred remittance method within the first month, verify it works with a small test transfer, and understand the NZ tax residency obligations around reporting foreign income and assets.

---

WHAT_AND_WHY:
International remittances from New Zealand are legal and straightforward — NZ has no foreign exchange controls or limits on outbound transfers for residents. However, the method you use significantly affects the cost and speed of the transfer.

**NZ bank international wire (SWIFT):** All major NZ banks (ANZ, ASB, BNZ, Westpac) offer international wire transfers. Fees: $15–$30 per transfer [Type B — bank-specific], plus exchange rate margin of 2–4% above mid-market rate [Type C]. Slow (2–5 business days). Not recommended for regular remittances due to cost.

**Wise (formerly TransferWise):** Market-leading exchange rate (mid-market rate with transparent fee), fee typically 0.4–1.5% of transfer amount [Type C — check wise.com for current rates]. Transfers to Indian bank accounts: 1–2 business days. Transfers to Sri Lankan accounts: 2–3 business days. Requires identity verification (passport + proof of address). Recommended for most transfers.

**Instarem:** Similar to Wise, NZ-based fintech, competitive for India and Southeast Asia corridors. Earns nPoints rewards. Check instarem.com for current rates vs Wise.

**Western Union / MoneyGram:** Higher fees than Wise/Instarem but offers cash pickup options useful for recipients without bank accounts. Not recommended for regular bank-to-bank transfers.

**Bank-to-bank (DBS Singapore → India/Sri Lanka):** If Priya maintains DBS Singapore accounts, DBS offers competitive remittance rates for SGD → INR transfers with lower fees than NZ bank SWIFT. Useful while she still has SGD income or savings.

**NZ reporting obligations:**
There are no mandatory reporting requirements for individual outbound remittances below any threshold in NZ — NZ does not operate a FEMA-equivalent regime for outbound transfers. However:
- Your NZ tax residency means worldwide income must be declared to IRD after the 4-year transitional resident exemption expires (see T05).
- Large or unusual transfers may attract bank anti-money laundering (AML) queries — be prepared to explain the purpose of transfers if asked.

**India FEMA obligations (Priya):**
Once Priya is NRI-classified (182 days outside India in a financial year), inward remittances to her NRE account are repatriable tax-free in India. Inward remittances to her NRO account may be subject to TDS and have repatriation limits. This is the home-country side of the transaction — the NZ side has no restrictions.

---

HOW_TO:
**Step 1 — Decide your primary remittance method**
For most AEWV migrants remitting to India or Sri Lanka: Wise is the default recommendation for best exchange rate and transparency. Compare Wise vs Instarem at time of transfer for best rate.

**Step 2 — Set up a Wise account**
URL: https://wise.com
Register with email. Complete identity verification: upload passport and NZ address proof (bank statement or utility bill). Verification typically takes 1–2 business days for NZ residents.

**Step 3 — Add your NZ bank account as the sending account**
Link your NZ bank account (ANZ or other) to Wise. This is used to fund transfers.

**Step 4 — Add your recipient's bank account details**
For India: recipient's full name (as per bank records), bank name, account number, IFSC code.
For Sri Lanka: recipient's full name, bank name, account number, SWIFT code, branch address.
Note: The recipient name in Wise must exactly match the name on the bank account. Mismatches cause transfer delays or returns.

**Step 5 — Make a small test transfer first**
Send NZD 50–100 on your first transfer to confirm the full process works end-to-end. Verify receipt at the other end, confirm exchange rate received, and note transfer time.

**Step 6 — Set up recurring or scheduled transfers if needed**
Wise allows scheduled regular transfers (e.g. monthly on a specific date). Useful if you have fixed monthly obligations (loan EMI, parental support).

**Step 7 — Keep records of all remittances**
Export transfer history from Wise/Instarem annually. Useful for tax documentation and for demonstrating source of funds to Indian/Sri Lankan banks if queried.

---

KEY_FACTS:
- NZ has no foreign exchange controls or limits on outbound personal remittances [Type A — Reserve Bank of New Zealand Act, no capital controls]
- NZ bank international wire fees: $15–$30 per transfer plus 2–4% exchange rate margin [Type B/C — varies by bank]
- Wise typical fee: 0.4–1.5% of transfer amount, mid-market exchange rate [Type C — check wise.com as rates change]
- Wise identity verification required for NZ residents — passport and address proof [Type B — Wise KYC requirements]
- Large transfers may trigger AML queries from NZ banks — have documentation of source of funds ready [Type B — NZ Anti-Money Laundering and Countering Financing of Terrorism Act 2009]
- NRE account remittances to India are tax-free and fully repatriable for NRI-classified individuals [Type A — FEMA 1999, India]
- No mandatory NZ reporting requirement for individual outbound remittances below a filing threshold [Type A — IRD/RBNZ guidance]

---

NUMBER_TYPES:
  - figure: "$15–$30 NZ bank wire fee per transfer"
    type: B
    type_label: Administrative
    source: ANZ, ASB, BNZ, Westpac published fee schedules
    caveat: "Confirm current fee at your bank's international transfers page as fees are reviewed periodically."
    last_confirmed: 2026-03-03

  - figure: "0.4–1.5% Wise transfer fee"
    type: C
    type_label: Market Rate
    source: wise.com pricing page
    caveat: "Check current Wise fee at wise.com at time of transfer — rates vary by corridor and amount."
    last_confirmed: 2026-03-03

  - figure: "2–4% NZ bank exchange rate margin"
    type: C
    type_label: Market Rate
    source: NZ bank FX rate comparison
    caveat: "Exchange rate margins vary by bank and change daily — compare at time of transfer."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya (India remittances): Set up Wise for NZD → INR transfers to family accounts. Ensure recipient accounts are NRE accounts (repatriable, tax-free in India) rather than savings accounts once her NRI status is established. If remitting to service an Indian home loan, confirm with the bank that the IFSC code on record is current — some banks update IFSC codes during branch reorganisations. Priya may also continue to use DBS Singapore for SGD → INR transfers while her Singapore savings are being repatriated — DBS Remit offers competitive India rates.

  Karthik (Sri Lanka remittances): Wise supports NZD → LKR (Sri Lankan rupee) transfers. Sri Lankan SWIFT codes and branch addresses are required for recipient details. Note: Sri Lanka introduced foreign exchange regulations following the 2022 economic crisis — confirm with the receiving bank in Sri Lanka that inward remittances are processing normally at time of transfer. Check current status at cbsl.gov.lk (Central Bank of Sri Lanka).

---

PERSONA_SOLO_AEWV:
  Set up Wise within your first month — it takes 1–2 days to verify and is useful to have ready before you need it. Your first remittance will likely coincide with your first NZ salary payment. Compare Wise and Instarem for your specific corridor (NZD → INR or NZD → LKR) before each major transfer — rates vary and the difference on large transfers is meaningful. Keep a simple spreadsheet of transfer dates, amounts, and exchange rates received — useful for year-end financial tracking.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T03
      task_name: Overseas Bank Account Final Prep
      relationship: "T03 covers preparation of home-country accounts before departure — including IFSC codes, SWIFT details, and NRE/NRO reclassification. T15 is the live remittance setup after arrival. T03 should be completed before T15 for smooth execution."
    - task_id: T07
      task_name: Open NZ Bank Account In Person
      relationship: "NZ bank account (T07) is required before setting up outbound remittances. T07 before T15."
    - task_id: T05
      task_name: Home Country Tax Final Year
      relationship: "T05 covers NRI status and FEMA obligations — relevant to how inward remittances are treated in India. Cross-read with T15 for FEMA context."
  inline_references:
    - "T03 referenced in WHAT_AND_WHY (FEMA/NRE context)"
    - "T07 referenced in HOW_TO Step 3"
    - "T05 referenced in WHAT_AND_WHY"

---

WATCH_OUTS:
  - Do not use your NZ bank's international wire for regular remittances — the combined fee and exchange rate margin makes it 3–5x more expensive than Wise for the same transfer.
  - Recipient name on Wise must match exactly the account holder name at the destination bank. Use the full legal name as registered with the bank, not a shortened or nickname version.
  - Sri Lanka's foreign exchange situation has been volatile since 2022 — verify remittance processing is normal before large transfers. Central Bank of Sri Lanka guidance: cbsl.gov.lk.
  - NZ banks may flag large or unusual outbound transfers and request documentation of source of funds. This is standard AML compliance — not an accusation. Have a brief explanation ready (e.g. "monthly family support," "home loan repayment").
  - If you are remitting to service an overseas mortgage or investment property, keep records as this may have NZ tax implications once your transitional resident exemption expires (4 years from NZ tax residency).

---

SOURCES:
  - title: "Wise — international money transfers"
    url: "https://wise.com/nz"
    tier: 3
    tier_label: Provider/Commercial
    last_accessed: 2026-03-03
    notes: "Primary recommended remittance provider — verify current fees and rates at time of transfer."

  - title: "Instarem — NZ remittances"
    url: "https://www.instarem.com/en-nz"
    tier: 3
    tier_label: Provider/Commercial
    last_accessed: 2026-03-03
    notes: "Alternative remittance provider — compare with Wise for best rate on specific corridors."

  - title: "Reserve Bank of New Zealand — no capital controls"
    url: "https://www.rbnz.govt.nz/statistics/series/exchange-and-interest-rates"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Confirms NZ has no outbound remittance restrictions for individuals."

  - title: "Central Bank of Sri Lanka — foreign exchange"
    url: "https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates"
    tier: 1
    tier_label: Primary Government (foreign)
    last_accessed: 2026-03-03
    notes: "Monitor for Sri Lanka inward remittance processing status."


---
TASK_ID: T16
TASK_NAME: NZ Driving Licence Conversion
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if NZTA changes overseas licence conversion rules, accepted countries, or fee schedule. Check annually or after any NZTA policy announcement.
---

METADATA:
  phase: Month 1–3
  timing: You can drive on your overseas licence for up to 12 months from entry date. Convert within the first 3 months to avoid deadline pressure and to access full NZ driving privileges.
  time_required: 1–2 hours (NZTA office visit)
  priority_score: 65
  task_type: Paid
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
Holders of valid overseas driving licences can drive in New Zealand for up to 12 months from their date of entry. After 12 months, you must hold a NZ licence to drive legally. Conversion from Indian or Sri Lankan licences requires an in-person visit to a NZTA-approved agent (AA, VTNZ, or Licence Direct), an eye test, a knowledge test (road rules), and payment of conversion fees. Singapore licence holders have a more streamlined process. Convert within the first 3 months — the knowledge test preparation is straightforward and early conversion removes the 12-month deadline as a concern.

---

WHAT_AND_WHY:
New Zealand road rules and road conditions differ from India, Sri Lanka, and Singapore in several important ways: driving is on the left (same as India, Sri Lanka, Singapore — no adjustment needed), open roads are fast (100 km/h), and NZ has a high road toll relative to population. Understanding NZ road rules before converting is important both for the knowledge test and for safe driving.

**Conversion rules by licence country:**

India and Sri Lanka: Not on the direct exchange list — full conversion process required: eye test + knowledge test + fees. No practical (road) test required for conversion — knowledge test only. This is a meaningful advantage over obtaining a new licence from scratch.

Singapore: Singapore is on NZTA's "recognised overseas licence" list — Singapore licence holders may convert without a knowledge test. Eye test and fees still apply. Confirm current list status at nzta.govt.nz as the list is reviewed periodically.

**Post-conversion licence type:**
After conversion, you receive a NZ full licence (equivalent to your overseas full licence class). The licence allows driving in NZ without restriction. International Driving Permit (IDP) from your home country is not required if you have your original overseas licence — but an IDP can be a useful additional document for rental car companies.

**Car insurance note:**
If you plan to drive a car in NZ (rental or owned), note that NZ does not have compulsory third-party injury insurance for vehicles — ACC covers personal injury from accidents. Property damage and third-party liability are covered by optional vehicle insurance. Always arrange comprehensive vehicle insurance before driving a privately owned vehicle.

---

HOW_TO:
**Step 1 — Confirm your overseas licence is current and valid**
Ensure your Indian, Sri Lankan, or Singapore licence is not expired. If it expires within 6 months, renew it before conversion if possible — a valid overseas licence is required at the conversion appointment.

**Step 2 — Study for the NZ road rules knowledge test (India/Sri Lanka licence holders)**
The knowledge test covers NZ road rules, signs, and give-way rules. Study guide available free at nzta.govt.nz: https://www.nzta.govt.nz/driver-licences/getting-a-licence/new-to-new-zealand/overseas-licence-holders
Key NZ-specific rules: give-way rules at intersections (recently updated), open road speed 100 km/h, urban speed 50 km/h (or lower where signed), cell phone prohibition while driving, seatbelt requirements for all passengers.
Practice tests available at: https://www.aa.co.nz/vehicles/driving/learner-driver/practice-theory-tests

**Step 3 — Book an appointment at a NZTA-approved agent**
Options: AA (Automobile Association), VTNZ, Licence Direct. Check availability at: https://www.nzta.govt.nz/driver-licences/testing-and-licensing-agents
Bring: current overseas licence (original), passport, proof of NZ address (rental agreement, bank statement), IRD number, payment.

**Step 4 — Complete eye test at appointment**
A basic vision test is conducted at the licensing agent. Standard vision requirements: 6/12 corrected or uncorrected, adequate field of vision. Wear glasses or contact lenses if you use them for driving.

**Step 5 — Sit the knowledge test (India/Sri Lanka licence holders)**
Multiple-choice test on a computer terminal. 35 questions — must pass with 32/35 correct (32 correct or more). Test takes approximately 30 minutes. If you fail, you can resit after a waiting period.

**Step 6 — Pay conversion fees and receive your NZ licence**
Current conversion fee: approximately $52.10 [Type B — NZTA fee schedule, subject to revision]. Your NZ licence is mailed to your registered address within 5–10 working days [Type B — NZTA processing time].

---

KEY_FACTS:
- Overseas licence holders can drive legally in NZ for up to 12 months from entry date [Type A — Land Transport Act 1998, Section 18]
- After 12 months, a NZ licence is required to drive legally [Type A — Land Transport Act 1998]
- Indian and Sri Lankan licence holders must pass a knowledge test (no practical road test required for conversion) [Type B — NZTA administrative policy]
- Singapore licence holders may convert without a knowledge test (on NZTA recognised list) [Type B — NZTA policy, confirm current list]
- Knowledge test: 35 questions, 32 correct required to pass [Type B — NZTA test standard]
- Conversion fee: approximately $52.10 [Type B — NZTA fee schedule, confirm at nzta.govt.nz]
- Open road speed limit: 100 km/h [Type A — Land Transport Rule: Speed Limits 2022]
- Urban speed limit: 50 km/h unless otherwise signed [Type A — Land Transport Rule: Speed Limits 2022]

---

NUMBER_TYPES:
  - figure: "12 months to drive on overseas licence from entry"
    type: A
    type_label: Statutory
    source: Land Transport Act 1998, Section 18
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "32/35 knowledge test pass mark"
    type: B
    type_label: Administrative
    source: NZTA knowledge test standard
    caveat: "Confirm current pass mark at nzta.govt.nz as test standards are subject to administrative review."
    last_confirmed: 2026-03-03

  - figure: "$52.10 conversion fee"
    type: B
    type_label: Administrative
    source: NZTA fee schedule
    caveat: "Confirm current fee at nzta.govt.nz as fees are subject to periodic revision."
    last_confirmed: 2026-03-03

  - figure: "100 km/h open road speed limit"
    type: A
    type_label: Statutory
    source: Land Transport Rule: Speed Limits 2022
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Both Priya and Karthik should convert their licences within 3 months of arrival. Priya's Indian licence requires eye test + knowledge test. Karthik's Sri Lankan licence: same process. They can book AA appointments on the same day to complete together. If either plans to drive or rent a car in the first 12 months before conversion, their overseas licence is sufficient with their passport — rental companies typically require overseas licence + passport + IDP.

  Car ownership in Auckland: Given Auckland's limited public transport to some areas, owning or leasing a car may become relevant within 3–6 months. A NZ licence is required for a NZ-registered vehicle purchase. If either intends to buy a car early, prioritise the licence conversion.

---

PERSONA_SOLO_AEWV:
  Convert within 3 months — book the AA appointment, spend 2–3 hours on practice tests beforehand, and complete the conversion in a single visit. The knowledge test is straightforward for drivers familiar with left-hand traffic. The 12-month window sounds generous but passes quickly when settlement tasks are competing for attention. An early conversion removes the deadline and gives you full NZ driving privileges for car hire and any future vehicle purchase.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T01
      task_name: Auckland Suburb Research
      relationship: "Suburb choice affects car dependency — inner Auckland suburbs have better PT, reducing urgency of car ownership and licence conversion. Outer suburbs may require a car sooner."
    - task_id: T11
      task_name: Rental Agreement and Bond
      relationship: "Permanent address (T11) required for NZTA licence registration and mailing."
  inline_references:
    - "T01 referenced for suburb/car dependency context"
    - "T11 referenced for address requirement"

---

WATCH_OUTS:
  - The 12-month clock starts from your date of entry into NZ — not from when you start driving. If you arrived in June 2026, your overseas licence expires for driving purposes in June 2027.
  - Driving on an expired overseas licence (after 12 months) is an infringement offence. Do not let the deadline pass.
  - NZ road give-way rules were updated in 2012 and differ from older NZ driving knowledge — if you learned NZ rules from pre-2012 materials, review the current give-way rules carefully.
  - If your overseas licence is in a language other than English, you may need a certified translation or IDP. Indian and Sri Lankan licences are issued in English — no translation required. Confirm at nzta.govt.nz if uncertain.
  - Car rental companies may have their own age and licence requirements beyond NZTA minimums — check with the rental company before booking.

---

SOURCES:
  - title: "Overseas licence holders — NZTA"
    url: "https://www.nzta.govt.nz/driver-licences/getting-a-licence/new-to-new-zealand/overseas-licence-holders"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Primary NZTA guide for overseas licence conversion — country-specific rules and process."

  - title: "Land Transport Act 1998 — New Zealand Legislation"
    url: "https://www.legislation.govt.nz/act/public/1998/0110/latest/DLM433613.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Statutory basis for overseas licence validity period."

  - title: "AA practice theory tests"
    url: "https://www.aa.co.nz/vehicles/driving/learner-driver/practice-theory-tests"
    tier: 2
    tier_label: Industry/Recognised
    last_accessed: 2026-03-03
    notes: "Free practice tests for NZ road rules knowledge test."

  - title: "NZTA testing and licensing agents"
    url: "https://www.nzta.govt.nz/driver-licences/testing-and-licensing-agents"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Find AA, VTNZ, or Licence Direct appointment locations."


---
TASK_ID: T17
TASK_NAME: NZQA Qualification Recognition
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if NZQA changes the International Qualifications Assessment process or fee schedule. Check annually or if applying for NZ residency (where formal NZQA assessment is often required).
---

METADATA:
  phase: Month 1–3
  timing: Apply within first 3 months if your occupation requires formal recognition, or if you intend to apply for NZ residency. Not required for all AEWV workers — assess need based on occupation and future plans.
  time_required: 2–4 hours (application preparation); 10 weeks (increased from 25-40 working days due to high demand) (NZQA processing)
  priority_score: 60
  task_type: Paid
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
NZQA (New Zealand Qualifications Authority) assesses overseas qualifications and determines their equivalence on the New Zealand Qualifications Framework (NZQF). A formal NZQA assessment is required for NZ residency applications (Skilled Migrant Category) and for some licensed occupations (teaching, engineering, nursing). For AEWV workers in IT or corporate roles, a formal NZQA assessment is not always required — but having one is advantageous for future residency applications and for providing evidence of qualification equivalence to employers. Assessment fee: $755 for an International Qualification Assessment (IQA) [Type B].

---

WHAT_AND_WHY:
NZQA is the government body that regulates NZ qualifications and assesses the equivalence of overseas qualifications. Its role matters for skilled migrants in two main contexts:

**Residency applications (Skilled Migrant Category):**
The Skilled Migrant Category (SMC) residency pathway awards points for qualifications. A formal NZQA assessment confirms your qualification's NZQF level and is required as evidence in the points claim. Without it, Immigration NZ may not award points for overseas qualifications. If you plan to apply for NZ residency in the next 2–3 years, obtaining a NZQA assessment early is advisable.

**Licensed or regulated occupations:**
Some NZ occupations require formal qualification recognition as a condition of practice: registered nurses (Nursing Council of NZ), registered teachers (Teaching Council), chartered engineers (Engineering NZ). If you are in a regulated occupation, check the relevant professional body's requirements separately from NZQA — most regulated bodies have their own assessment process in addition to NZQA.

**General employment:**
Most private sector NZ employers in IT, banking, and corporate roles do not require a formal NZQA assessment for employment. Your CV, portfolio, and demonstrated experience carry more weight. However, some employers (particularly government, healthcare, and education) may request evidence of qualification equivalence.

**What NZQA assesses:**
NZQA places your qualification on the NZQF at a level from 1 (basic vocational) to 10 (doctoral). A 3-year bachelor's degree from a recognised Indian or Sri Lankan university typically maps to NZQF Level 7. A postgraduate diploma maps to Level 8. A master's degree maps to Level 9.

---

HOW_TO:
**Step 1 — Determine whether you need a formal NZQA assessment**
- Planning NZ residency via Skilled Migrant Category → Yes, obtain assessment
- Working in a regulated occupation (nurse, teacher, engineer) → Check with the relevant professional body
- Private sector IT/corporate role, no immediate residency plans → Optional but beneficial; lower urgency
- Karthik is enrolled in a NZ master's programme → NZ qualification being earned; NZQA assessment of overseas degree may still be useful for residency

**Step 2 — Gather your qualification documents**
Required: original academic transcripts, degree/diploma certificates, English translations if documents are not in English (Indian and Sri Lankan university documents are typically in English).

**Step 3 — Get transcripts certified**
NZQA requires certified copies of transcripts. Options: certify via NZ Justice of the Peace (JP — free, find at jpanz.org.nz), or have originals sighted at a NZQA-approved authentication agent.

**Step 4 — Apply online through NZQA**
URL: https://www.nzqa.govt.nz/qualifications-standards/qualifications/nzqa-qualifications/international-qualifications
Complete the International Qualification Assessment (IQA) application online. Upload certified transcripts and certificates. Pay the assessment fee: $755 [Type B — NZQA fee schedule, confirm at nzqa.govt.nz].

**Step 5 — Wait for assessment**
Processing time: 10 weeks (increased from 25-40 working days due to high demand) [Type B — NZQA processing standard]. NZQA may request additional documents during assessment. Respond promptly to any requests.

**Step 6 — Receive and record your NZQA assessment outcome**
You will receive a formal letter confirming your qualification's NZQF level equivalence. Store this document securely — it is required for residency applications and regulated occupation registration.

---

KEY_FACTS:
- NZQA formal assessment is required for Skilled Migrant Category residency points claims [Type B — Immigration NZ, SMC instructions]
- Assessment fee: $755 for International Qualification Assessment (IQA) [Type B — NZQA fee schedule, confirm at nzqa.govt.nz]
- Processing time: 10 weeks (increased from 25-40 working days due to high demand) [Type B — NZQA administrative standard]
- A 3-year bachelor's degree from a recognised Indian/Sri Lankan university typically maps to NZQF Level 7 [Type B — NZQA assessment guidelines]
- NZQA assessment does not replace regulated occupation body assessments (nursing, teaching, engineering) [Type B — respective professional bodies]
- Certifying documents via a NZ Justice of the Peace (JP) is free [Type B — JP services]
- NZQA Level 7 = bachelor's degree equivalent; Level 8 = postgraduate diploma; Level 9 = master's degree [Type A — NZQF Framework]

---

NUMBER_TYPES:
  - figure: "$755 IQA assessment fee"
    type: B
    type_label: Administrative
    source: NZQA fee schedule
    caveat: "Confirm current fee at nzqa.govt.nz as fees are subject to periodic revision."
    last_confirmed: 2026-03-03

  - figure: "10 weeks (increased from 25-40 working days due to high demand) processing time"
    type: B
    type_label: Administrative
    source: NZQA processing standard
    caveat: "Confirm current processing time at nzqa.govt.nz as this varies with application volume."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya (Indian bachelor's + DBS Singapore work experience): If Priya intends to apply for NZ residency via Skilled Migrant Category (likely given partner visa pathway and NZ settlement plans), a NZQA assessment of her Indian engineering or IT degree is recommended within the first 3–6 months. Apply early so the outcome is available when needed. Her degree from a recognised Indian institution will almost certainly map to NZQF Level 7, earning her points in the SMC assessment.

  Karthik (Sri Lankan bachelor's, enrolling in UoA Master's): Karthik is actively earning a NZ qualification (UoA Master's in AI = NZQF Level 9 upon completion). His NZ qualification will not require NZQA assessment. However, a NZQA assessment of his Sri Lankan undergraduate degree may still be useful if it adds evidence for any future joint residency application or employer credentialing. Lower priority than Priya's assessment — defer until after initial settlement tasks are complete.

---

PERSONA_SOLO_AEWV:
  Assess your occupation and residency plans. If you are in IT, software, or corporate and your immediate focus is employment (not regulated occupation registration), a NZQA assessment is optional in the first 3 months. However, if you have any intention of applying for NZ permanent residency in the next 2–3 years, apply within 6 months of arrival — the assessment result is valid and can be used in a future residency application. The $755 fee is modest relative to the residency application benefits.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T19
      task_name: CV and LinkedIn for NZ Job Market
      relationship: "NZQA assessment result can be referenced on CV and LinkedIn to confirm qualification equivalence for NZ employers. Complete T17 before updating profile with NZ-specific credentials."
    - task_id: T11
      task_name: Rental Agreement and Bond
      relationship: "NZ address required for NZQA correspondence — complete T11 before applying."
  inline_references:
    - "Skilled Migrant Category (SMC) referenced in WHAT_AND_WHY and PERSONA fields"
    - "T19 referenced for CV/LinkedIn integration"

---

WATCH_OUTS:
  - NZQA assessment is of your qualification only — it does not assess your skills, work experience, or professional registration. Do not conflate a NZQA assessment with professional body registration.
  - If you are a registered engineer, nurse, or teacher in your home country, contact the relevant NZ professional body (Engineering NZ, Nursing Council, Teaching Council) directly — they have separate and specific assessment processes.
  - Processing time of 10 weeks (increased from 25-40 working days due to high demand) is the standard — do not apply at the last minute before a residency application deadline. Apply well in advance.
  - NZQA only assesses qualifications at degree level and above. Vocational qualifications, certificates, and diplomas below bachelor's level have a separate assessment pathway.
  - A NZQA assessment result is not the same as having a NZ qualification — it is an equivalence assessment only. This is sufficient for most immigration and employment purposes.

---

SOURCES:
  - title: "International Qualifications Assessment — NZQA"
    url: "https://www.nzqa.govt.nz/qualifications-standards/qualifications/nzqa-qualifications/international-qualifications"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Primary NZQA source for IQA application process, fees, and processing times."

  - title: "New Zealand Qualifications Framework — NZQA"
    url: "https://www.nzqa.govt.nz/qualifications-standards/qualifications/nzqa-qualifications/nzqf"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "NZQF level descriptions and framework overview."

  - title: "Skilled Migrant Category — Immigration NZ"
    url: "https://www.immigration.govt.nz/new-zealand-visas/visa-alternates/skilled-migrant-category-resident-visa"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "SMC residency requirements — relevant context for NZQA assessment need."

  - title: "Justice of the Peace NZ — find a JP"
    url: "https://www.jpanz.org.nz/find-a-jp"
    tier: 2
    tier_label: Government-backed
    last_accessed: 2026-03-03
    notes: "Free document certification service — find a JP near you."


---
TASK_ID: T18
TASK_NAME: Building NZ Credit History
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if major NZ credit bureaus (Centrix, Equifax NZ, illion) change reporting practices, or if credit card eligibility criteria for new migrants change. Check annually.
---

METADATA:
  phase: Month 2–6
  timing: Begin building credit history from Month 2 onward. First credit card application: no earlier than 3–6 months after arrival with a NZ salary history.
  time_required: Ongoing (low-effort passive process)
  priority_score: 58
  task_type: Free (some products have fees — check before applying)
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
New migrants arrive in New Zealand with no NZ credit history — overseas credit scores and records do not transfer. NZ lenders (banks, landlords, mobile providers) check NZ credit files before extending credit. Building a NZ credit history from scratch takes 6–12 months of consistent behaviour. Key steps: ensure all bills are paid on time (in your name), apply for a credit card after 3–6 months of NZ income history, use it lightly and pay in full each month, and check your credit file annually for accuracy.

---

WHAT_AND_WHY:
New Zealand uses credit bureau reporting to assess individual creditworthiness. The three main bureaus are Centrix, Equifax NZ, and illion. Lenders, landlords, and some employers access credit reports when making decisions.

**What affects your NZ credit score:**
Positive factors: on-time bill payments (utilities, phone, rent if reported), responsible credit card use (low utilisation, full monthly repayment), length of credit history, number of accounts in good standing.

Negative factors: missed or late payments, defaults, excessive credit applications in a short period (hard enquiries), accounts sent to collections.

**Overseas credit history does not transfer:**
Your CIBIL score (India), illion score (Singapore), or Sri Lankan credit history has no standing with NZ credit bureaus. You start from zero. This means:
- Bank credit card: typically requires 3–6 months NZ income history
- Personal loan: typically 12+ months NZ income and credit history
- Mortgage: typically 2+ years NZ credit history plus deposit requirement
- Rental application: no credit check required by law, but some property managers do check

**Building credit passively from day one:**
Simply being in New Zealand and paying bills on time starts building your credit file. Utility accounts, phone contracts, and bank account activity are all reported. The key is to have accounts in your own name — a partner's account does not build your credit.

---

HOW_TO:
**Step 1 — Ensure bills are in your name from day one**
Electricity, internet, and phone accounts in your own name from the start of your tenancy will contribute to your credit file. Joint accounts are reported for both account holders.

**Step 2 — Set up automatic payments for all bills**
Never miss a payment. Set up automatic payments (direct debit) for rent, utilities, phone, and any credit facilities. A single missed payment can appear on your credit file and negatively affect your score for up to 5 years.

**Step 3 — Apply for a credit card after 3–6 months**
Wait until you have 3–6 months of NZ salary deposits into your NZ bank account. Apply for an entry-level credit card from your bank first — they have your transaction history. Start with a low credit limit ($1,000–$2,000). Use the card for small regular purchases (groceries, petrol) and pay the balance in full each month.

**Step 4 — Do not apply for multiple credit products simultaneously**
Each credit application creates a hard enquiry on your credit file. Multiple hard enquiries in a short period reduce your score. Apply for one product, wait 3–6 months, then consider the next.

**Step 5 — Check your credit report annually**
All NZ consumers are entitled to one free credit report per year from each bureau. Check for errors, fraudulent accounts, or incorrect defaults. Access free reports at:
- Centrix: centrix.co.nz
- Equifax NZ: equifax.co.nz
- illion: illion.co.nz

**Step 6 — Maintain a low credit utilisation ratio**
Credit utilisation (balance ÷ credit limit) should ideally stay below 30%. If your card limit is $2,000, keep your monthly spend below $600 before repayment.

---

KEY_FACTS:
- NZ credit history starts from zero for new migrants — overseas scores do not transfer [Type B — credit bureau policy]
- NZ credit bureaus: Centrix, Equifax NZ, illion [Type B — industry]
- All consumers entitled to one free credit report per year from each bureau [Type A — Credit Reporting Privacy Code 2004]
- Negative credit events (missed payments, defaults) remain on file for up to 5 years [Type A — Credit Reporting Privacy Code 2004]
- Recommended credit card application timing: 3–6 months after arrival with NZ income history [Type B — general banking guidance]
- Credit utilisation below 30% is considered positive by most scoring models [Type B — credit bureau guidance]
- Mortgage applications typically require 2+ years NZ credit history plus 20% deposit minimum [Type B/C — NZ bank lending criteria, varies by lender]

---

NUMBER_TYPES:
  - figure: "5 years — negative event retention on credit file"
    type: A
    type_label: Statutory
    source: Credit Reporting Privacy Code 2004
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "30% credit utilisation guideline"
    type: B
    type_label: Administrative
    source: NZ credit bureau scoring guidance
    caveat: "Add caveat: 'This is a general guideline — credit scoring models vary by bureau and lender.'"
    last_confirmed: 2026-03-03

  - figure: "20% minimum mortgage deposit"
    type: C
    type_label: Market Rate
    source: RBNZ LVR restrictions and bank lending criteria
    caveat: "Check current LVR (loan-to-value ratio) restrictions at rbnz.govt.nz and with specific lenders as lending criteria change."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya and Karthik should each build their own individual credit histories — a partner's credit file is separate and does not transfer. Priya's AEWV salaried income gives her a strong base for credit card eligibility at 3–6 months. She should apply for her own entry-level credit card at ANZ (her bank) at the 4–5 month mark. Karthik's credit building is lower priority initially given student status — but ensure his phone contract and any utility accounts include his name to passively build his file.

  Joint financial products: A joint bank account (T21) does not build credit history on its own — credit cards and loans do. Treat credit building as two parallel individual processes.

---

PERSONA_SOLO_AEWV:
  Passive credit building starts immediately — ensure your phone, electricity, and internet are all in your name. Your active step is the credit card application at 3–6 months with your bank. Set a low limit ($1,000–$1,500), use it for regular small purchases, and pay in full by the due date every month without exception. Check your credit file at 12 months to confirm it is building correctly. This foundation will matter when you apply for a personal loan, car finance, or mortgage in years 2–4.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T07
      task_name: Open NZ Bank Account In Person
      relationship: "NZ bank account (T07) is the prerequisite for all NZ credit products. Bank account history is the primary basis for credit card eligibility at 3–6 months."
    - task_id: T21
      task_name: Joint Bank Account
      relationship: "Joint bank account (T21) is a relationship banking tool — does not directly build individual credit history. Keep individual credit building as a parallel process."
  inline_references:
    - "T07 referenced as prerequisite in HOW_TO"
    - "T21 referenced in PERSONA fields"

---

WATCH_OUTS:
  - Do not apply for a credit card in the first month — rejection due to insufficient NZ credit history creates a hard enquiry that harms your thin credit file. Wait 3–6 months.
  - Store credit (e.g. buy-now-pay-later services like Afterpay, Laybuy, Humm) appears on NZ credit files. Use sparingly and always repay on time.
  - If you receive pre-approved credit offers, read the terms carefully — some NZ financial products targeted at new migrants carry high interest rates (18–26% p.a. [Type C]).
  - NZ "no credit history" is different from "bad credit" — be patient. Most lenders understand that new migrants have thin files and weigh income and employment stability accordingly after 6–12 months.
  - Closing a credit account reduces your average account age — keep your first NZ credit card open even after upgrading to better products later.

---

SOURCES:
  - title: "Credit Reporting Privacy Code 2004 — Office of the Privacy Commissioner"
    url: "https://www.privacy.org.nz/privacy-act-2020/codes-of-practice/credit-reporting-privacy-code-2020"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Statutory framework for NZ credit reporting — consumer rights, retention periods."

  - title: "Centrix — free credit report"
    url: "https://www.centrix.co.nz/personal/my-credit-score"
    tier: 3
    tier_label: Industry/Commercial
    last_accessed: 2026-03-03
    notes: "One of three NZ credit bureaus — free annual report available."

  - title: "Equifax NZ — credit report"
    url: "https://www.equifax.co.nz/personal"
    tier: 3
    tier_label: Industry/Commercial
    last_accessed: 2026-03-03
    notes: "Second NZ credit bureau — free annual report."

  - title: "illion — credit report"
    url: "https://www.illion.co.nz/personal-credit-report"
    tier: 3
    tier_label: Industry/Commercial
    last_accessed: 2026-03-03
    notes: "Third NZ credit bureau — free annual report."


---
TASK_ID: T19
TASK_NAME: CV and LinkedIn for NZ Job Market
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review annually as NZ hiring norms evolve. Check if major NZ job boards or LinkedIn NZ usage patterns change significantly.
---

METADATA:
  phase: Month 1–3
  timing: Update CV and LinkedIn within first 2–4 weeks of arrival. Active job search relevant if changing employer after initial AEWV period.
  time_required: 3–6 hours (initial CV rewrite and LinkedIn update)
  priority_score: 55
  task_type: Free
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
New Zealand CV conventions differ from Indian, Sri Lankan, and Singapore formats. NZ CVs are concise (2 pages maximum), achievement-focused, and omit personal details like date of birth, marital status, and photo. LinkedIn is heavily used by NZ recruiters — an updated NZ-style profile with a NZ location is important for inbound recruiter outreach. Tailoring your CV and LinkedIn for the NZ market within your first month positions you well for any role changes after your initial AEWV period and for building your NZ professional network.

---

WHAT_AND_WHY:
The NZ job market differs from South Asian and Singaporean markets in several meaningful ways:

**CV conventions in NZ:**
Length: 2 pages maximum for most roles. NZ hiring managers spend 30–60 seconds on initial CV screening — dense 4–6 page CVs common in India are counterproductive.
Personal details: Do not include date of birth, photo, marital status, nationality, or religion. These are not required and including them can expose hiring managers to unconscious bias claims — some NZ recruiters actively screen them out.
Format: Clean, white space, readable font. Achievement bullet points rather than duty descriptions. Quantify impact where possible (e.g. "reduced processing time by 40%" rather than "responsible for process improvement").
Cover letter: Short (3–4 paragraphs), tailored to the specific role, explaining why you are suited and your visa status clearly.

**LinkedIn in NZ:**
NZ has high LinkedIn penetration for professional roles. Recruiters routinely search LinkedIn before and after receiving applications. Key NZ optimisation steps: update location to Auckland, NZ; update "open to work" settings; connect with NZ-based professionals in your field; follow NZ companies you are interested in; engage with NZ industry content to increase profile visibility.

**Visa status disclosure:**
NZ employers are accustomed to AEWV and do not generally penalise candidates for visa status. Being transparent about your visa type (AEWV, partner work visa) and right to work removes ambiguity and builds trust. Some AEWV roles have employer-specific accreditation requirements — your accredited employer sponsor is the only employer you can work for under a standard AEWV. Changing employers on AEWV requires a new employer-sponsored visa application.

**NZ job market:**
Primary job boards: seek.co.nz (dominant), trademe.co.nz/jobs, linkedin.com/jobs. Recruitment agencies: Robert Half, Hays, Randstad active in tech and finance roles. NZ tech community: meetup events, tech conferences (TechWeekNZ), and professional networks (NZTech) support networking beyond job boards.

---

HOW_TO:
**Step 1 — Rewrite your CV to NZ format**
- Trim to 2 pages
- Remove photo, DOB, marital status, nationality
- Add NZ address and NZ mobile number at the top
- Rewrite each role description using achievement-oriented bullet points with measurable outcomes
- Ensure the most recent 2–3 roles are given the most space
- Tailor summary/objective to NZ market language

**Step 2 — Update LinkedIn profile**
- Change location to Auckland, New Zealand
- Update headline to reflect your current NZ situation (e.g. "Senior Software Engineer | Java | Spring Boot | Auckland")
- Add NZ phone number to contact info (visible to connections)
- Update "about" section with a brief NZ-oriented professional summary
- If comfortable, enable "Open to Work" (visible to recruiters only option available)
- Request LinkedIn recommendations from previous Singapore/India managers — 2–3 strong recommendations carry weight with NZ recruiters

**Step 3 — Register on seek.co.nz**
Create a candidate profile and upload your NZ CV. Set up job alerts for your target roles and salary range. Seek is the primary NZ job discovery channel — more actively used than LinkedIn for applications in most NZ sectors.

**Step 4 — Connect with NZ recruiters in your field**
Search LinkedIn for recruiters specialising in your sector in Auckland. Send a brief connection request with a note about your background and what you are looking for. Specialist tech recruiters (e.g. Datacom, Fronde, Fusion5 for IT roles) can provide market intelligence even before you are actively job-searching.

**Step 5 — Attend NZ professional network events**
Eventbrite NZ, Meetup.com Auckland, and TechWeekNZ list professional events. In-person networking remains highly effective in NZ's smaller, relationship-oriented job market. Aim for 1–2 events per month once settled.

---

KEY_FACTS:
- NZ CV standard: 2 pages maximum, no photo, no DOB, no marital status [Type B — NZ HR/recruitment industry norm]
- seek.co.nz is the dominant NZ job board [Type B — industry]
- LinkedIn is widely used by NZ tech and professional recruiters [Type B — industry]
- AEWV is employer-specific — changing employers requires a new visa application [Type A — Immigration Act 2009, Immigration Instructions]
- Partner work visa holders (e.g. Karthik) have unrestricted work rights — can work for any NZ employer [Type A — Immigration NZ partner work visa conditions]
- NZ average IT/software engineering salary range: $80,000–$150,000 depending on experience and specialisation [Type C — seek.co.nz salary insights, Hays NZ Salary Guide]

---

NUMBER_TYPES:
  - figure: "2 page CV maximum"
    type: B
    type_label: Administrative
    source: NZ HR/recruitment industry norm
    caveat: "Industry norm, not legislated — some roles (academic, senior executive) may accept longer CVs."
    last_confirmed: 2026-03-03

  - figure: "$80,000–$150,000 NZ IT salary range"
    type: C
    type_label: Market Rate
    source: seek.co.nz salary insights, Hays NZ Salary Guide 2025
    caveat: "Check current salary benchmarks at seek.co.nz/career-advice/salary-insights and hays.net.nz as market rates change annually."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya (AEWV salaried software engineer): Priya's immediate CV priority is confirming her current NZ employer details are correct on LinkedIn — she is already employed. Her focus should be LinkedIn network building for future visibility, attend tech meetups, and build NZ professional connections. Her AEWV is employer-specific — any role change requires a new employer-sponsored visa or a pathway to open work rights via residency. Keep this context in mind when considering any career moves.

  Karthik (partner work visa, UoA student): Karthik has unrestricted work rights on his partner visa — he can work for any NZ employer without sponsorship. His CV and LinkedIn should be updated to reflect NZ location and his UoA enrolment. His UoA network (classmates, faculty, industry connections through the university's AI programme) is a valuable employment pathway. Part-time roles in AI/ML, data analysis, or tech support are realistic targets during study. Update CV to NZ format and register on seek.co.nz for part-time and project-based roles.

---

PERSONA_SOLO_AEWV:
  Update CV and LinkedIn within your first 2 weeks — it is a 3–6 hour task that opens NZ recruiter inbound contact immediately. Even if you are not actively job-searching, having a NZ-optimised LinkedIn profile means opportunities surface passively. Your AEWV is employer-specific — focus on performing well in your current role while building your NZ network for future options once you have NZ experience and potentially open work rights via residency.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T17
      task_name: NZQA Qualification Recognition
      relationship: "NZQA assessment result (T17) can be referenced on CV and LinkedIn to confirm NZ qualification equivalence. Obtain T17 result and add to CV/LinkedIn in the credentials section."
    - task_id: T18
      task_name: Building NZ Credit History
      relationship: "No direct relationship — both are Month 1–3 parallel tasks."
  inline_references:
    - "T17 referenced for qualification credential integration"
    - "seek.co.nz and linkedin.com referenced throughout HOW_TO"

---

WATCH_OUTS:
  - AEWV workers cannot freely change employers — your visa is tied to your accredited employer sponsor. Do not imply open work rights on job applications if you are on a standard AEWV. Be transparent about your visa status.
  - NZ salary negotiation norms: it is acceptable to negotiate salary in NZ. Research market rates on seek.co.nz salary insights before any salary discussion.
  - NZ employment culture is relatively flat and informal compared to corporate India or Singapore — first-name basis with senior management is standard. Titles and hierarchy are less prominent in day-to-day work.
  - New migrants sometimes undervalue their experience in NZ job applications due to imposter syndrome or unfamiliarity with NZ norms. Your overseas experience is genuinely valuable — present it confidently with NZ-style achievement framing.
  - Reference checks are standard in NZ — prepare 2–3 professional references who can be contacted by NZ employers. Overseas references are acceptable.

---

SOURCES:
  - title: "seek.co.nz — NZ job board and salary insights"
    url: "https://www.seek.co.nz"
    tier: 3
    tier_label: Industry/Commercial
    last_accessed: 2026-03-03
    notes: "Primary NZ job board. Salary insights tool available at seek.co.nz/career-advice/salary-insights."

  - title: "Hays NZ Salary Guide"
    url: "https://www.hays.net.nz/salary-guide"
    tier: 3
    tier_label: Industry/Commercial
    last_accessed: 2026-03-03
    notes: "Annual NZ salary benchmarking guide by sector and role."

  - title: "TechWeekNZ — NZ technology industry events"
    url: "https://techweek.co.nz"
    tier: 3
    tier_label: Industry/Commercial
    last_accessed: 2026-03-03
    notes: "NZ tech community events — useful for network building in Auckland tech sector."

  - title: "Immigration NZ — AEWV conditions"
    url: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Confirms AEWV employer-specific conditions and changing employer requirements."


---
TASK_ID: T20
TASK_NAME: KiwiSaver Confirmation and Fund Review
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review annually at NZ tax year end (31 March) or when significant life changes occur (income change, approaching retirement, buying first home).
---

METADATA:
  phase: Month 3–6
  timing: Review at 3 months after initial enrolment (T10). Confirm provider, fund type, and contribution rate are still appropriate.
  time_required: 1–2 hours
  priority_score: 50
  task_type: Free
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
Three months after initial KiwiSaver enrolment (T10), review your provider, fund type, and contribution rate with fresh perspective. The auto-enrolment default fund may not be optimal for your age, risk tolerance, and investment horizon. Switching KiwiSaver providers is free and straightforward — done online through your chosen new provider. This review also confirms you are on track to receive the full government member tax credit ($521.43/year) by contributing the minimum required amount.

---

WHAT_AND_WHY:
The 3-month KiwiSaver review matters because:

**Default fund problem:** If you were auto-enrolled without choosing a provider (or chose quickly without research), you may be in a conservative or balanced default fund. For workers in their 30s–40s with a 20–30 year investment horizon, a growth or aggressive fund typically produces better long-term returns — accepting more short-term volatility for higher compounding. A conservative fund at age 35 can result in significantly lower retirement savings over 30 years.

**Fee drag:** Management fees reduce your returns every year. A provider charging 1.5% p.a. versus one charging 0.3% p.a. makes a material difference over a 20-year horizon. At $60,000 balance, the difference in annual fees is $720 — compounding over decades, this is meaningful.

**Government member tax credit check:** The government contributes up to $521.43 per year to your KiwiSaver if you contribute a minimum of $1,042.86 per year (approximately $20/week). At 3 months, confirm your contributions are on track to hit the annual threshold by 30 June (the government tax credit calculation date). If your contribution rate is too low, increase it temporarily or make a voluntary top-up.

**Contribution rate review:** At initial setup (T10), a 3% contribution rate was recommended to preserve cash flow during the settlement period. At 3 months, assess whether increasing to 4% or 6% is affordable — the additional employer contribution match remains at 3% regardless of your rate.

---

HOW_TO:
**Step 1 — Log in to myIR and check your current KiwiSaver status**
URL: https://myir.ird.govt.nz
Navigate to KiwiSaver → your account summary. Confirm: current provider, fund type, contribution rate, current balance, and year-to-date contributions.

**Step 2 — Assess your current fund type against your profile**
If you are under 50 and have a 15+ year investment horizon:
- Conservative/defensive fund → switch to growth or aggressive
- Balanced fund → consider switching to growth if comfortable with volatility
- Growth or aggressive fund → no change needed

Use the sorted.org.nz fund finder to compare your current fund's fees and historical performance against alternatives.

**Step 3 — Check government tax credit track**
Calculate: (months employed in NZ ÷ 12) × $1,042.86 = contributions target for the year.
Example: 3 months employed → $260.72 should have been contributed so far.
If your contributions are below target, consider a one-off voluntary top-up via myIR or directly through your provider.

**Step 4 — Switch provider if needed (optional)**
Switching is free and takes approximately 5–10 business days. Go to your chosen new provider's website → select "switch from existing provider." The new provider manages the transfer. Your balance moves automatically — you do not need to contact your old provider.

**Step 5 — Adjust contribution rate if desired**
To change contribution rate: log in to myIR → KiwiSaver → change contribution rate. Takes effect from your next pay period. Notify your employer's payroll team if they require separate notification (most handle it automatically through the myIR system).

---

KEY_FACTS:
- Government member tax credit: up to $521.43/year for contributions of $1,042.86+ per year [Type A — KiwiSaver Act 2006, Section 220]
- Government credit calculation date is 30 June each year [Type A — KiwiSaver Act 2006]
- Switching KiwiSaver providers is free [Type A — KiwiSaver Act 2006, Section 72]
- Provider switch takes approximately 5–10 business days [Type B — provider processing standard]
- Management fees typically 0.3%–1.5% per year depending on provider and fund type [Type C — check sorted.org.nz]
- Contribution rate changes take effect from next pay period after myIR update [Type B — IRD administrative]

---

NUMBER_TYPES:
  - figure: "$521.43 government member tax credit / $1,042.86 threshold"
    type: A
    type_label: Statutory
    source: KiwiSaver Act 2006, Section 220
    caveat: "State as confirmed fact. Subject to Budget changes — confirm at ird.govt.nz."
    last_confirmed: 2026-03-03

  - figure: "30 June government credit calculation date"
    type: A
    type_label: Statutory
    source: KiwiSaver Act 2006
    caveat: "State as confirmed fact."
    last_confirmed: 2026-03-03

  - figure: "5–10 business days provider switch time"
    type: B
    type_label: Administrative
    source: KiwiSaver provider processing standard
    caveat: "Confirm current processing time with your new provider as this varies."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya (3-month review): Confirm she was enrolled in her chosen fund (Simplicity Growth or equivalent low-fee growth fund) at T10. Check contribution rate — if 3% is comfortable, consider increasing to 4% now that the initial settlement cash crunch has passed. Verify government tax credit is tracking — if she started work in June 2026, her first government credit calculation date is June 2027, giving a full year to contribute the $1,042.86 threshold.

  Karthik (3-month review): If Karthik has started any part-time employment and enrolled in KiwiSaver, review his fund type and contributions. If not employed, no KiwiSaver action needed. Note: once he completes his UoA master's and begins full-time NZ employment, ensure he is enrolled and review then.

---

PERSONA_SOLO_AEWV:
  At 3 months, take 60 minutes to review your KiwiSaver setup. Check your fund type on sorted.org.nz — if you were defaulted into a conservative fund, switch to growth. Verify you are on track for the government tax credit threshold. The difference between a well-configured and a default KiwiSaver over 20 years can be tens of thousands of dollars. This is a high-value, low-effort task.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T10
      task_name: KiwiSaver Election
      relationship: "T20 is the scheduled 3-month review of the initial KiwiSaver setup completed in T10. Read T10 for full KiwiSaver background before completing T20."
  inline_references:
    - "T10 referenced throughout as the foundation task"
    - "sorted.org.nz referenced in HOW_TO for fund comparison"
    - "myIR referenced in HOW_TO for account management"

---

WATCH_OUTS:
  - Do not switch providers without comparing fees and fund performance first. Some providers with strong brand recognition charge high fees that erode returns. Use sorted.org.nz for neutral comparison.
  - The government member tax credit is calculated on contributions from 1 July to 30 June each year — if you arrive mid-year, your first credit will be pro-rated. This is normal.
  - Increasing your contribution rate reduces your take-home pay. Model the impact before changing: at 6% vs 3% on a $100,000 salary, the difference is $3,000 per year in take-home pay, partially offset by employer matching which stays at 3% regardless.
  - Do not make a KiwiSaver withdrawal for first home purchase until you have confirmed NZ residency plans — the first home withdrawal rules require you to have been contributing for at least 3 years and the property must be your first NZ home.

---

SOURCES:
  - title: "KiwiSaver — switching providers (IRD)"
    url: "https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/making-changes-to-my-kiwisaver/changing-to-another-provider"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Official IRD guidance on free provider switching process."

  - title: "KiwiSaver fund finder — Sorted"
    url: "https://www.sorted.org.nz/tools/kiwisaver-fund-finder"
    tier: 2
    tier_label: Government-backed independent
    last_accessed: 2026-03-03
    notes: "Fee and performance comparison tool for all KiwiSaver providers."

  - title: "Member tax credit — Inland Revenue"
    url: "https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/growing-my-kiwisaver-account/getting-the-kiwisaver-government-contribution"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "Confirms government tax credit amount, threshold, and calculation date."


---
TASK_ID: T21
TASK_NAME: Joint Bank Account
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
VERIFIED_BY: Ruchira
NEXT_REVIEW_TRIGGER: Review if NZ banks change joint account opening requirements or acceptable documentation for couples. Check annually.
---

METADATA:
  phase: Month 2–4
  timing: Open after both partners have established individual accounts (T07) and are settled in permanent accommodation. Not urgent — individual accounts cover all Day 1 needs.
  time_required: 45–60 minutes (in-branch visit)
  priority_score: 45
  task_type: Free (no monthly fee for standard transaction account)
  professional_advice_required: false
  professional_advice_note: null

---

SUMMARY:
A joint bank account is useful for couples managing shared household expenses — rent, utilities, groceries, and shared savings. In NZ, a joint account is opened in-branch at any major bank. Both account holders have equal access and equal liability. The joint account complements — but does not replace — individual accounts, which each partner needs for salary deposits, individual KiwiSaver, credit history, and personal expenses. Open after both partners have individual accounts and are settled in permanent accommodation.

---

WHAT_AND_WHY:
A joint bank account in NZ functions identically to an individual account in terms of NZ banking infrastructure — same debit card functionality, same internet banking, same BPAY/direct debit capability. The difference is that both account holders can transact independently and both are jointly and severally liable for any overdraft or fees.

**When a joint account makes sense:**
Managing shared household expenses from a single account simplifies budgeting. Both partners can see the same transaction history, making it easier to track household spending. For couples where one partner (Priya) earns the primary income and the other (Karthik) is studying, a joint account provides Karthik with easy access to household funds without requiring separate transfers.

**When a joint account does NOT replace individual accounts:**
Salary must be deposited into the employee's individual account (or joint — employer's choice, but individual is cleaner). KiwiSaver is individual — contributions come from the employee's individual account. Credit history is individual — joint accounts do not build individual credit files. Personal expenses and savings are cleaner in individual accounts.

**Recommended structure for couples:**
- Individual account (Priya): receives salary, KiwiSaver deducted, personal expenses
- Individual account (Karthik): receives any income, personal expenses
- Joint account (both): rent, utilities, groceries, shared savings — funded by regular automatic transfers from each individual account

---

HOW_TO:
**Step 1 — Confirm both partners have individual NZ bank accounts (T07)**
Joint account opening requires both account holders to be present in branch. Both must have existing NZ bank accounts or the bank must be willing to open individual and joint accounts simultaneously.

**Step 2 — Choose bank for joint account**
Simplest approach: open the joint account at the same bank as your primary individual accounts (likely ANZ if you followed T07 recommendations). This allows easy internal transfers between individual and joint accounts with no delay.

**Step 3 — Book an in-branch appointment**
Both account holders must attend in person. Book online or call your branch. Visit the same ANZ or BNZ branch where individual accounts were opened.

**Step 4 — Bring required documents (both people)**
Both need to bring:
- Passport
- Visa evidence (eVisa letter)
- NZ address proof (rental agreement)
- NZ mobile number
- Individual account numbers (if opening at an existing bank)

**Step 5 — Complete joint account application in branch**
Select account type: standard everyday transaction account (no monthly fee [Type C — confirm current fee]). Confirm both account holders have equal access and withdrawal rights (standard).

**Step 6 — Set up automatic transfers**
Once the joint account is open, set up a regular automatic transfer from each individual account to the joint account on pay day. Agree a monthly household budget amount to transfer from each partner.

**Step 7 — Set up direct debits from joint account**
Move rent, utilities, internet, and grocery automatic payments to the joint account. This centralises household spending and simplifies budgeting.

---

KEY_FACTS:
- Both account holders on a joint account have equal access and equal liability for any debt [Type B — NZ banking standard terms]
- A joint account does not build individual credit history — individual credit products are still needed [Type B — NZ credit bureau reporting practice]
- No monthly fee for standard NZ transaction accounts [Type C — confirm current fee schedule with your bank]
- Both account holders must attend branch in person to open a joint account [Type B — NZ bank KYC requirement]
- Joint account can be closed by either account holder's request or mutual agreement [Type B — NZ banking standard terms]

---

NUMBER_TYPES:
  - figure: "$0 monthly fee for standard transaction account"
    type: C
    type_label: Market Rate
    source: ANZ, ASB, BNZ, Westpac fee schedules
    caveat: "Confirm current fee schedule with your bank as fee structures are subject to change."
    last_confirmed: 2026-03-03

---

PERSONA_CONSTRAINED_COUPLE:
  Priya and Karthik: Open the joint account at ANZ (their individual account bank) at 2–3 months post-arrival — after initial settlement tasks are complete and a household budget is understood. The joint account structure recommended is: Priya transfers $X per fortnight from her salary to the joint account for rent and household bills; Karthik contributes from any part-time income; both use individual accounts for personal spending and KiwiSaver. This structure is clear, equitable, and administratively clean for tax purposes.

  NZ relationship property law note: In NZ, assets and debts accumulated during a de facto relationship of 3+ years are treated as relationship property under the Property (Relationships) Act 1976. A joint account balance is straightforwardly joint property. Priya and Karthik should be aware that NZ relationship property law applies to them as a couple living together in NZ regardless of their marriage status in their home country — NZ law applies to NZ-domiciled assets.

---

PERSONA_SOLO_AEWV:
  Not applicable as a primary task. If you have a de facto partner arriving later or already in NZ, the joint account setup follows the same process. For solo migrants, T21 is informational only — a single well-managed individual account covers all needs.

---

CROSS_REFERENCES:
  related_tasks:
    - task_id: T07
      task_name: Open NZ Bank Account In Person
      relationship: "Individual accounts (T07) are prerequisites for the joint account. Both partners must have individual accounts before or at the time of joint account opening."
    - task_id: T18
      task_name: Building NZ Credit History
      relationship: "Joint bank account does not build individual credit history. Individual credit products (credit cards) are still needed per T18 for each partner's individual credit file."
  inline_references:
    - "T07 referenced as prerequisite throughout"
    - "T18 referenced for credit history context"
    - "NZ relationship property law (Property (Relationships) Act 1976) referenced in PERSONA fields"

---

WATCH_OUTS:
  - Joint account liability is joint and several — if one account holder goes into overdraft or accrues fees, both are liable. Manage the account actively and avoid overdraft.
  - Closing a joint account requires agreement from both account holders in most NZ bank terms — or can be forced by one party in some circumstances. Understand the terms before opening.
  - NZ relationship property law (Property (Relationships) Act 1976) applies to de facto couples who have lived together for 3+ years. Joint account balances, jointly purchased assets, and contributions to shared expenses can all become relationship property. This is worth understanding early — it is not alarming, but awareness prevents surprises.
  - Do not use the joint account as the sole account for salary deposits — individual accounts for salary deposits keep payroll and tax records cleaner.

---

SOURCES:
  - title: "ANZ joint bank account — opening requirements"
    url: "https://www.anz.co.nz/personal/bank-accounts/everyday-banking/everyday-account"
    tier: 3
    tier_label: Provider/Commercial
    last_accessed: 2026-03-03
    notes: "ANZ account details and opening requirements — confirm current fee schedule."

  - title: "Property (Relationships) Act 1976 — New Zealand Legislation"
    url: "https://www.legislation.govt.nz/act/public/1976/0166/latest/DLM440945.html"
    tier: 1
    tier_label: Primary Government
    last_accessed: 2026-03-03
    notes: "NZ relationship property law — applies to de facto couples domiciled in NZ after 3 years."


---
# APPENDIX A: SOURCES MASTER LIST
CHUNK_ID: CHUNK_APP_A
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
---

This appendix consolidates all sources cited across T01–T21, organised by tier and domain. Use to verify source currency and identify sources requiring re-check at next review.

## TIER 1 — PRIMARY GOVERNMENT SOURCES (NZ)

| Source | URL | Tasks Referenced |
|--------|-----|-----------------|
| IRD — IRD numbers for individuals | https://www.ird.govt.nz/managing-my-tax/ird-numbers/ird-numbers-for-individuals | T08 |
| IRD — New to NZ guidance | https://www.ird.govt.nz/international-tax/individuals/tax-for-new-zealand-tax-residents | T08 |
| IRD — IR330 Tax code declaration | https://www.ird.govt.nz/forms-guides/number/forms-300-399/ir330-tax-code-declaration | T09 |
| IRD — Tax codes for individuals | https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-codes-for-individuals | T09 |
| IRD — KiwiSaver overview | https://www.ird.govt.nz/kiwisaver | T10 |
| IRD — KS2 KiwiSaver deduction notice | https://www.ird.govt.nz/forms-guides/number/forms-100-199/ks2-kiwisaver-deduction-notice | T10 |
| IRD — KiwiSaver provider switching | https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/making-changes-to-my-kiwisaver/changing-to-another-provider | T20 |
| IRD — KiwiSaver member tax credit | https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/growing-my-kiwisaver-account/getting-the-kiwisaver-government-contribution | T20 |
| IRD — myIR online services | https://myir.ird.govt.nz | T08, T10, T20 |
| Tax Administration Act 1994 | https://www.legislation.govt.nz/act/public/1994/0166/latest/DLM348342.html | T08 |
| Income Tax Act 2007 — Schedule 2 (PAYE rates) | https://www.legislation.govt.nz/act/public/2007/0097/latest/DLM1522997.html | T08 |
| Income Tax Act 2007 — Schedule 1 (Tax rates) | https://www.legislation.govt.nz/act/public/2007/0097/latest/DLM1523176.html | T09 |
| Income Tax Act 2007 — Section CW 27 (Transitional resident exemption) | https://www.legislation.govt.nz/act/public/2007/0097/latest/DLM1512301.html | T05 |
| Income Tax Act 2007 — Section YD 1 (Tax residency) | https://www.legislation.govt.nz/act/public/2007/0097/latest/DLM1518393.html | T05 |
| KiwiSaver Act 2006 | https://www.legislation.govt.nz/act/public/2006/0040/latest/DLM378372.html | T10, T20 |
| Residential Tenancies Act 1986 | https://www.legislation.govt.nz/act/public/1986/0120/latest/DLM94278.html | T11, T14 |
| Tenancy Services — bonds | https://www.tenancy.govt.nz/bonds | T11 |
| Tenancy Services — starting a tenancy | https://www.tenancy.govt.nz/starting-a-tenancy | T11 |
| Tenancy Services — tenant rights | https://www.tenancy.govt.nz/tenants-rights-and-responsibilities | T14 |
| Tenancy Services — Tenancy Tribunal | https://www.tenancy.govt.nz/disputes/apply-to-tribunal | T14 |
| Tenancy Services — healthy homes | https://www.tenancy.govt.nz/healthy-homes | T14 |
| Health (Subsidised Primary Health Care) Notice 2011 | https://www.health.govt.nz/our-work/primary-health-care/about-primary-health-organisations | T12 |
| Pharmaceutical Schedule — Ministry of Health | https://www.pharmac.govt.nz/medicines/pharmaceutical-schedule | T12 |
| Community Services Card — Work and Income NZ | https://www.workandincome.govt.nz/products/a-z-benefits/community-services-card.html | T12 |
| Accident Compensation Act 2001 | https://www.legislation.govt.nz/act/public/2001/0049/latest/DLM99494.html | T13 |
| ACC — what we cover | https://www.acc.co.nz/im-injured/what-we-cover | T13 |
| ACC — earner levy rates | https://www.acc.co.nz/im-a-business/levies/earner-levies | T13 |
| NZQA — International Qualifications Assessment | https://www.nzqa.govt.nz/qualifications-standards/qualifications/nzqa-qualifications/international-qualifications | T17 |
| NZQA — New Zealand Qualifications Framework | https://www.nzqa.govt.nz/qualifications-standards/qualifications/nzqa-qualifications/nzqf | T17 |
| Immigration NZ — Skilled Migrant Category | https://www.immigration.govt.nz/new-zealand-visas/visa-alternates/skilled-migrant-category-resident-visa | T17 |
| Immigration NZ — AEWV conditions | https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa | T19 |
| Credit Reporting Privacy Code 2004 | https://www.privacy.org.nz/privacy-act-2020/codes-of-practice/credit-reporting-privacy-code-2020 | T18 |
| Land Transport Act 1998 | https://www.legislation.govt.nz/act/public/1998/0110/latest/DLM433613.html | T16 |
| Land Transport Rule: Speed Limits 2022 | https://www.nzta.govt.nz/resources/rules/land-transport-rule-setting-of-speed-limits-2022 | T16 |
| NZTA — overseas licence holders | https://www.nzta.govt.nz/driver-licences/getting-a-licence/new-to-new-zealand/overseas-licence-holders | T16 |
| NZTA — testing and licensing agents | https://www.nzta.govt.nz/driver-licences/testing-and-licensing-agents | T16 |
| Reserve Bank of NZ — foreign exchange | https://www.rbnz.govt.nz/statistics/series/exchange-and-interest-rates | T15 |
| Property (Relationships) Act 1976 | https://www.legislation.govt.nz/act/public/1976/0166/latest/DLM440945.html | T21 |
| JP NZ — find a JP | https://www.jpanz.org.nz/find-a-jp | T17 |

## TIER 1 — PRIMARY GOVERNMENT SOURCES (FOREIGN)

| Source | URL | Tasks Referenced |
|--------|-----|-----------------|
| Central Bank of Sri Lanka — forex | https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates | T15 |
| India Income Tax Act 1961 — Section 6 | https://www.incometaxindia.gov.in | T03, T05 |
| FEMA 1999 — RBI India | https://www.rbi.org.in/Scripts/BS_FemaNotifications.aspx | T03, T05 |

## TIER 2 — GOVERNMENT-BACKED INDEPENDENT SOURCES

| Source | URL | Tasks Referenced |
|--------|-----|-----------------|
| Healthpoint — find a GP | https://www.healthpoint.co.nz/general-practice | T12 |
| University of Auckland — Health and Counselling | https://www.auckland.ac.nz/en/students/student-support/health-counselling-chaplaincy.html | T12 |
| Sorted — KiwiSaver fund finder | https://www.sorted.org.nz/tools/kiwisaver-fund-finder | T10, T20 |
| Powerswitch — electricity comparison | https://www.powerswitch.org.nz | T11 |
| AA — practice theory tests | https://www.aa.co.nz/vehicles/driving/learner-driver/practice-theory-tests | T16 |
| TechWeekNZ | https://techweek.co.nz | T19 |

## TIER 3 — PROVIDER / COMMERCIAL SOURCES

| Source | URL | Tasks Referenced |
|--------|-----|-----------------|
| trademe.co.nz — rentals | https://www.trademe.co.nz/a/property/residential/rent | T01, T11 |
| Simplicity KiwiSaver | https://www.simplicity.kiwi/kiwisaver | T10 |
| Southern Cross Health Insurance | https://www.southerncross.co.nz | T13 |
| Wise — NZ remittances | https://wise.com/nz | T15 |
| Instarem — NZ remittances | https://www.instarem.com/en-nz | T15 |
| seek.co.nz — jobs and salary insights | https://www.seek.co.nz | T19 |
| Hays NZ Salary Guide | https://www.hays.net.nz/salary-guide | T19 |
| Centrix — credit report | https://www.centrix.co.nz/personal/my-credit-score | T18 |
| Equifax NZ — credit report | https://www.equifax.co.nz/personal | T18 |
| illion — credit report | https://www.illion.co.nz/personal-credit-report | T18 |
| ANZ — joint bank account | https://www.anz.co.nz/personal/bank-accounts/everyday-banking/everyday-account | T21 |


---
# APPENDIX B: NUMBER TYPES MASTER REGISTER
CHUNK_ID: CHUNK_APP_B
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
---

This appendix provides a machine-readable consolidated register of all numbers, figures, and statistics cited across T01–T21, tagged by type. The AI system uses this register to determine which caveat instruction to apply when citing a figure, without parsing prose.

## TYPE A — STATUTORY (State as fact, cite legislation)

| Figure | Task(s) | Source | Notes |
|--------|---------|--------|-------|
| 45% no-declaration PAYE rate | T08, T09 | Income Tax Act 2007, Schedule 2 | Apply when no IRD number/IR330 provided |
| NZ tax brackets: 10.5% / 17.5% / 30% / 33% / 39% | T09 | Income Tax Act 2007, Schedule 1, Part A | Marginal rates |
| Bracket thresholds: $0–$14k / $14k–$48k / $48k–$70k / $70k–$180k / $180k+ | T09 | Income Tax Act 2007, Schedule 1, Part A | Legislated — stable unless Budget changes |
| KiwiSaver employer minimum contribution: 3% | T10 | KiwiSaver Act 2006, Section 101B | On top of salary |
| KiwiSaver employee options: 3%, 4%, 6%, 8%, 10% | T10 | KiwiSaver Act 2006 | Legislated contribution rate options |
| Government member tax credit: up to $521.43/year | T10, T20 | KiwiSaver Act 2006, Section 220 | Requires min $1,042.86/year contribution |
| KiwiSaver minimum contribution for full govt credit: $1,042.86/year | T10, T20 | KiwiSaver Act 2006, Section 220 | ~$20/week |
| KiwiSaver 56-day opt-out window | T10 | KiwiSaver Act 2006, Section 17 | From start of new employment |
| KiwiSaver permanent emigration withdrawal | T10 | KiwiSaver Act 2006, Section 213 | Full balance including employer contributions |
| KiwiSaver free provider switching | T20 | KiwiSaver Act 2006, Section 72 | No cost to member |
| Government credit calculation date: 30 June | T20 | KiwiSaver Act 2006 | Annual |
| Bond maximum: 4 weeks rent | T11 | Residential Tenancies Act 1986, Section 18 | Cannot exceed 4 weeks |
| Bond lodgement within 23 working days | T11 | Residential Tenancies Act 1986, Section 22 | Landlord obligation |
| Rent in advance maximum: 2 weeks | T11 | Residential Tenancies Act 1986, Section 20 | Cannot exceed 2 weeks |
| Rent increase: max once every 12 months with 60 days notice | T11, T14 | Residential Tenancies Act 1986, Section 24 | 12-month lock-in from tenancy start |
| Landlord inspection notice: 24 hours | T11, T14 | Residential Tenancies Act 1986, Section 48 | Routine inspections, max 4/year |
| Landlord entry notice (other): 48 hours | T14 | Residential Tenancies Act 1986, Section 48 | Non-inspection entry |
| Tenant notice to end periodic tenancy: 28 days | T14 | Residential Tenancies Act 1986, Section 51 | Written notice |
| Landlord notice to end periodic tenancy: 63 days (no reason) / 42 days (sale) | T14 | Residential Tenancies Act 1986, Section 53 | Post-2021 amendment |
| Letting fees illegal | T11, T14 | Residential Tenancies Act 1986, Section 13B | Amended 2018 |
| Retaliatory notice unlawful | T14 | Residential Tenancies Act 1986, Section 54A | Cannot evict tenant for asserting rights |
| Negative credit events: 5 years on file | T18 | Credit Reporting Privacy Code 2004 | Missed payments, defaults |
| Free annual credit report entitlement | T18 | Credit Reporting Privacy Code 2004 | One per bureau per year |
| Overseas licence valid for driving in NZ: 12 months from entry | T16 | Land Transport Act 1998, Section 18 | Clock starts at entry date |
| Open road speed limit: 100 km/h | T16 | Land Transport Rule: Speed Limits 2022 | Standard NZ open road |
| Urban speed limit: 50 km/h | T16 | Land Transport Rule: Speed Limits 2022 | Unless otherwise signed |
| ACC coverage for all persons in NZ | T13 | Accident Compensation Act 2001, Section 18 | Includes migrants, tourists |
| ACC weekly compensation: ~80% of pre-injury earnings | T13 | Accident Compensation Act 2001, Section 103 | Up to maximum liable earnings cap |
| NZ tax residency: 183 days in NZ | T05 | Income Tax Act 2007, Section YD 1 | General rule |
| Transitional resident exemption: 4 years | T05 | Income Tax Act 2007, Section CW 27 | Foreign passive income |
| NRI status (India): 182 days outside India in FY | T03, T05 | Income Tax Act 1961, Section 6 | India |
| NZQF Level 7 = bachelor's degree | T17 | New Zealand Qualifications Framework | 3-year degree from recognised institution |
| NZQF Level 8 = postgrad diploma / Level 9 = master's | T17 | New Zealand Qualifications Framework | Equivalence levels |
| $5.00 prescription co-payment | T12 | Pharmaceutical Schedule, Ministry of Health | Eligible patients; reviewed regularly |

## TYPE B — ADMINISTRATIVE (State with recency caveat, confirm at source)

| Figure | Task(s) | Source | Caveat instruction |
|--------|---------|--------|-------------------|
| IRD number processing time: 1–2 business days | T08 | IRD processing standard | "Confirm current processing time at ird.govt.nz" |
| ASB rejects hostel/temporary addresses | T07 | ASB bank policy | "Confirm current policy at asb.co.nz" |
| ANZ pre-arrival application: 90 days | T07 | ANZ policy | "Confirm current availability at anz.co.nz" |
| Westpac pre-arrival application: 180 days | T07 | Westpac policy | "Confirm current availability at westpac.co.nz" |
| Debit card arrival: 3–5 business days | T07 | Bank processing standard | "Confirm current delivery time with your bank" |
| Kiwibank requires work visa >1 year | T07 | Kiwibank policy | "Confirm current policy at kiwibank.co.nz" |
| KiwiSaver contribution rate change: next pay period | T20 | IRD administrative | "Confirm timing with your employer payroll" |
| KiwiSaver provider switch: 5–10 business days | T20 | Provider standard | "Confirm with new provider" |
| NZQA IQA processing time: 10 weeks (increased from 25-40 working days due to high demand) | T17 | NZQA processing standard | "Confirm current time at nzqa.govt.nz" |
| Enrolled GP consultation: $20–$60 | T12 | Health NZ practice funding | "Confirm current fee with your GP practice at enrolment" |
| ACC earner levy rate: ~1.45% | T13 | ACC levy schedule | "Confirm current rate at acc.co.nz — reviewed annually" |
| NZTA knowledge test: 32/35 pass mark | T16 | NZTA test standard | "Confirm at nzta.govt.nz" |
| NZTA licence conversion fee: ~$52.10 | T16 | NZTA fee schedule | "Confirm current fee at nzta.govt.nz" |
| NZQA IQA fee: $755 | T17 | NZQA fee schedule | "Confirm current fee at nzqa.govt.nz" |
| Tenancy Tribunal application fee: $28 | T14 | Tenancy Services fee schedule | "Confirm current fee at tenancy.govt.nz" |
| NZ bank SWIFT wire fee: $15–$30 | T15 | Bank fee schedules | "Confirm current fee with your bank" |
| Bond lodgement portal | T11 | Tenancy Services | "Confirm current portal at tenancy.govt.nz" |
| Singapore licence — no knowledge test required | T16 | NZTA recognised list | "Confirm Singapore remains on NZTA recognised list at nzta.govt.nz" |

## TYPE C — MARKET RATE (Check with provider — varies and changes)

| Figure | Task(s) | Source | Caveat instruction |
|--------|---------|--------|-------------------|
| Auckland 2BR rent: $550–$1,100/week | T01, T11 | trademe.co.nz | "Check current rental prices at trademe.co.nz" |
| SIM card cost: $2–$5 | T06 | Carrier websites | "Check current pricing at carrier stores" |
| Mobile plan: ~$28/month (Skinny) | T06 | Skinny Mobile | "Check current plans at skinny.co.nz" |
| NZ bank exchange rate margin: 2–4% | T15 | NZ bank FX rates | "Compare rates at time of transfer" |
| Wise transfer fee: 0.4–1.5% | T15 | wise.com | "Check current fee at wise.com" |
| KiwiSaver management fees: 0.3%–1.5% p.a. | T10, T20 | sorted.org.nz | "Compare at sorted.org.nz" |
| NZ IT salary range: $80,000–$150,000 | T19 | seek.co.nz, Hays guide | "Check current rates at seek.co.nz/salary-insights" |
| Casual (unsubsidised) GP consultation: $80–$150+ | T12 | Auckland GP practices | "Confirm with specific practice" |
| Dental check-up: $150–$350 | T12 | Auckland dental practices | "Check current pricing with dental practices" |
| NZ mortgage minimum deposit: ~20% | T18 | RBNZ LVR restrictions | "Check current LVR restrictions at rbnz.govt.nz" |
| High-interest credit products: 18–26% p.a. | T18 | NZ financial market | "Check specific product terms" |
| Serviced apartment: $700–$1,200/week (1BR) | T02 | Auckland serviced apartment market | "Check current pricing at booking time" |


---
# APPENDIX C: POLICY CHANGE LOG
CHUNK_ID: CHUNK_APP_C
VERSION: 1.0
CREATED: 2026-03-03
---

This appendix tracks material policy and legislative changes that affect the accuracy of this knowledge base. The AI system should check this log to determine if a task's content has been superseded before presenting information.

## LOG FORMAT
Each entry follows:
DATE | TASK(S) AFFECTED | CHANGE DESCRIPTION | ACTION REQUIRED | STATUS

---

## ACTIVE LOG

| Date | Task(s) Affected | Change Description | Action Required | Status |
|------|-----------------|-------------------|-----------------|--------|
| 2026-03-03 | ALL | Initial knowledge base created. All content verified at this date. | No action — baseline version. | BASELINE |

---

## REVIEW TRIGGERS (scheduled)

The following events should trigger a review of the tasks indicated:

| Trigger Event | Task(s) to Review |
|--------------|------------------|
| NZ Budget announcement (typically May) | T09 (tax rates), T10/T20 (KiwiSaver credit), T12 (CSC thresholds) |
| IRD annual levy review | T13 (ACC earner levy) |
| KiwiSaver Act amendment | T10, T20 |
| Residential Tenancies Act amendment | T11, T14 |
| NZTA fee schedule update | T16 |
| NZQA fee schedule update | T17 |
| Immigration NZ AEWV policy change | T19 |
| RBNZ LVR restriction change | T18 |
| India Budget / FEMA amendment | T03, T05, T15 |
| Sri Lanka Central Bank forex policy change | T15 |
| Annual (all tasks) | T01–T21 |

---

## RETIRED ENTRIES

No entries retired as of initial version.


---
# APPENDIX D: GLOSSARY
CHUNK_ID: CHUNK_APP_D
VERSION: 1.0
LAST_VERIFIED: 2026-03-03
---

Key NZ-specific terms, acronyms, and concepts used throughout this knowledge base. Provided for both AI context and human reference.

## A

**ACC (Accident Compensation Corporation)**
NZ's universal no-fault accident insurance scheme. Covers all persons physically in NZ for accident-related injuries. Does not cover illness or disease. Funded through earner, employer, and motor vehicle levies. See T13.

**AEWV (Accredited Employer Work Visa)**
The primary NZ work visa for skilled migrants whose employer holds NZ Immigration accreditation. Employer-specific — visa holder may only work for the sponsoring accredited employer. Typically 2–5 years duration. See T19.

**At.govt.nz**
Auckland Transport's public-facing journey planner and information website. Use for PT route planning and timetable information.

## B

**BPAY**
Australian bill payment system — not used in NZ. NZ equivalent is internet banking direct credit and direct debit.

**Bond**
Security deposit paid at start of tenancy. Capped at 4 weeks rent. Must be lodged with Tenancy Services (not held by landlord). See T11.

## C

**Capitation payment**
Government funding paid to enrolled GP practices per enrolled patient. Enables GP practices to charge lower enrolled rates versus casual rates.

**CIBIL**
India's primary credit bureau scoring system. Does not transfer to NZ. NZ has its own credit bureaus (Centrix, Equifax NZ, illion). See T18.

**Community Services Card (CSC)**
Government-issued card that reduces GP and prescription co-payments for low-income households. Income-tested. Apply via Work and Income NZ. See T12.

## D

**De facto relationship**
A committed couple living together in a marriage-like relationship without being formally married. Recognised under NZ law — Property (Relationships) Act 1976 applies after 3 years. See T21.

**Direct debit**
Automatic payment from your bank account authorised to a payee. Standard NZ method for paying recurring bills (rent, utilities, subscriptions).

## E

**ESCT (Employer Superannuation Contribution Tax)**
Tax deducted by employer from their KiwiSaver contribution before it reaches your account. Normal — does not affect your contribution rate or eligibility.

## F

**FEMA (Foreign Exchange Management Act 1999)**
Indian legislation governing foreign exchange transactions for Indian residents and NRIs. Requires Indian accounts to be reclassified to NRE/NRO status when holder becomes NRI. See T03, T05.

**Fixed-term tenancy**
Rental agreement with a specified end date. Cannot be ended early by either party except by mutual agreement or serious breach (unless break clause included).

## G

**GP (General Practitioner)**
A primary care doctor — your first point of contact for non-emergency medical care in NZ. Enrolled patients pay subsidised rates. See T12.

## H

**Healthy Homes Standards**
NZ regulations requiring rental properties to meet minimum standards for heating, insulation, ventilation, moisture barriers, and draught stopping. Landlord's obligation. Introduced 2019.

**Health New Zealand | Te Whatu Ora**
NZ's national health authority (replaced District Health Boards in 2022). Administers public hospital and specialist services.

## I

**IFSC (Indian Financial System Code)**
India's bank branch routing code. Required for international wire transfers to Indian bank accounts via Wise or SWIFT.

**IQA (International Qualification Assessment)**
NZQA's formal process for assessing overseas qualifications against the NZ Qualifications Framework. Required for SMC residency applications. See T17.

**IR330**
IRD tax code declaration form. Submitted to employer before first pay day to activate correct PAYE tax deductions. See T09.

**IRD (Inland Revenue Department)**
NZ's tax authority. Administers income tax, KiwiSaver, GST, and Working for Families. Online portal: myIR.

**IRD number**
NZ's unique tax identification number — 8 or 9 digits. Required for all employment, KiwiSaver, and government interactions. See T08.

## J

**JP (Justice of the Peace)**
A volunteer official in NZ who can certify documents, witness signatures, and take statutory declarations. Free service. Find via jpanz.org.nz.

## K

**KiwiSaver**
NZ's voluntary workplace retirement savings scheme. Employer must contribute minimum 3%. Government contributes up to $521.43/year. See T10, T20.

**KS2**
KiwiSaver deduction notice form. Submitted to employer to select contribution rate and chosen provider. Submitted alongside IR330. See T10.

## L

**Letting fee**
An admin fee for processing a rental application. Illegal in NZ under the Residential Tenancies Act 1986 (amendment 2018). Do not pay if requested.

**LVR (Loan to Value Ratio)**
RBNZ restriction on the maximum mortgage size relative to property value. Currently minimum 20% deposit for most purchases. See T18.

## M

**myIR**
IRD's online portal for managing tax, KiwiSaver, and filing returns. Access at myir.ird.govt.nz.

## N

**NHI (National Health Index number)**
NZ's unique health identifier. Assigned at first NZ health system interaction. Used across hospitals, GPs, labs, and specialists.

**NRE account (Non-Resident External)**
Indian bank account type for NRIs. INR-denominated. Interest is tax-free in India. Fully repatriable. Priya's primary Indian account type post-NRI classification.

**NRO account (Non-Resident Ordinary)**
Indian bank account type for NRI income earned in India (rent, etc). TDS applicable on interest. Repatriation limited to $1 million USD per year. See T03.

**NRI (Non-Resident Indian)**
Tax classification under Indian Income Tax Act 1961. Established when individual spends fewer than 182 days in India in a financial year. Triggers FEMA account reclassification obligations. See T03, T05.

**NZQA (New Zealand Qualifications Authority)**
Government body that regulates NZ qualifications and assesses overseas qualification equivalence. See T17.

**NZQF (New Zealand Qualifications Framework)**
Framework that classifies all NZ and recognised overseas qualifications from Level 1 (basic vocational) to Level 10 (doctoral). See T17.

## P

**PAYE (Pay As You Earn)**
NZ income tax deduction system. Employer deducts tax from each pay and remits to IRD on employee's behalf.

**Periodic tenancy**
Rental agreement with no fixed end date. Continues until notice given by either party. Tenant: 28 days notice. Landlord: 63 days notice.

## R

**RBNZ (Reserve Bank of New Zealand)**
NZ's central bank. Administers monetary policy, banking regulation, and LVR restrictions.

**RTA (Residential Tenancies Act 1986)**
Primary legislation governing all residential tenancies in NZ. Covers bond, rent, entry rights, maintenance, and dispute resolution.

## S

**seek.co.nz**
NZ's dominant job board. Primary platform for employer job advertising and candidate job search.

**SMC (Skilled Migrant Category)**
NZ's points-based residency pathway for skilled workers. Points awarded for age, work experience, qualifications, and NZ job offer. NZQA assessment often required. See T17.

**sorted.org.nz**
Government-funded independent personal finance resource. Includes KiwiSaver fund comparison tool, mortgage calculators, and general financial guidance.

## T

**Tenancy Services**
NZ government agency administering the Residential Tenancies Act. Provides mediation services and the Tenancy Tribunal. Contact: 0800 836 262 or tenancy.govt.nz.

**Tenancy Tribunal**
Quasi-judicial body that resolves disputes between landlords and tenants under the RTA. Application fee: $28. Decisions are legally binding. See T14.

**Transitional resident exemption**
4-year automatic NZ tax exemption on most foreign passive income (interest, dividends, overseas rental income) for new NZ tax residents. Starts from 183 days of NZ residency. Highly valuable for migrants with overseas assets. See T05.

## U

**UoA (University of Auckland)**
NZ's largest university, ranked in the world's top 100. Located in Auckland CBD and Grafton (health sciences). Karthik's institution for his Master's in AI.

## V

**VTNZ (Vehicle Testing New Zealand)**
NZ licensing and vehicle inspection agency. One of the NZTA-approved licensing agents for overseas licence conversion. See T16.

## W

**Wise (formerly TransferWise)**
UK-based international money transfer fintech. Offers mid-market exchange rates with transparent fees. Recommended for NZD → INR and NZD → LKR remittances. See T15.

**Work and Income NZ (WINZ)**
NZ government agency administering social welfare benefits including Community Services Card, accommodation supplements, and Jobseeker support.

