# Fix the visa list before launch

The onboarding visa options are the weakest part of the current schema, and two of them are wrong according to official NZ sources. "Green List, work to residence" is not a visa anyone arrives on: the Work to Residence Visa is a **resident** visa, and you can only apply for it after **24 months working in a Green List Tier 2 job in NZ**, so Tier 2 migrants arrive on an AEWV ([INZ Work to Residence Visa](https://www.immigration.govt.nz/visas/work-to-residence-visa/)). "Partner of a student" is too narrow, because the Partner of a Worker Work Visa gives the same open work rights and was missing ([INZ Partner of a Worker Work Visa](https://www.immigration.govt.nz/visas/partner-of-a-worker-work-visa/)). The other dimensions are mostly sound but uneven. City changes only one confirmed step (public transport payment), and that difference ends when Motu Move goes national by the end of 2027. Every family value changes at least one official step, but no option covers a sole parent. Healthcare, Education and Trades each trigger a legally required registration step, Technology and Finance trigger none, and the evidence for Finance was not checked. On compliance, the app is not exempt under s 11 of the Immigration Advisers Licensing Act 2007, so it must stay inside the s 7(1)(b) exclusions: restate published INZ information, never assess eligibility, and refer users to INZ or a licensed adviser. Reuse terms differ by agency. INZ uses CC BY 3.0 NZ, while IRD, Govt.nz, the Ministry of Health and Health NZ use CC BY 4.0. Tenancy Services allows non-commercial use only, and NZTA reportedly allows non-commercial use only too. Fourteen non-govt.nz domains are proposed for the government tier, and two of them still need a manual check. Two rule changes land within weeks of this report: Health NZ eligibility on **1 Dec 2026** and NZTA's overseas-licence period on **1 Nov 2026**.

Evidence legend: findings marked **unconfirmed — manual check needed** come from search-engine snippets of the named official page, or from a page that was not opened. They must be checked in a normal browser before they go into product copy. All other findings come from pages fetched on 25 Oct 2026.

## Two of five visa options misdescribe how migrants arrive

The visa list matters most because visa type is the only answer that changes the gates for healthcare, school fees, KiwiSaver and voting. **AEWV** is still the main employer-sponsored work visa and is listed by name on INZ's work hub ([INZ Work](https://www.immigration.govt.nz/work/)). **GREEN_LIST_WORK** is the error. The Work to Residence Visa "lets you stay in New Zealand indefinitely". To apply, you need **24 months in a Tier 2 job within the 30 months before you apply**, a job with an accredited employer, and to be aged 55 or younger ([INZ Work to Residence Visa](https://www.immigration.govt.nz/visas/work-to-residence-visa/)). In the first six months after arrival, a Tier 2 migrant therefore holds an AEWV. **GREEN_LIST_RESIDENCE** is a real arrival category, but INZ calls it the **"Straight to Residence Visa"**. Offshore applicants are granted it before travel, holders "must come to New Zealand within 12 months", and it can include a partner and dependent children aged 24 or younger ([INZ Straight to Residence Visa](https://www.immigration.govt.nz/visas/straight-to-residence-visa/)). The Tier 1 pay floor of NZD $35.00/hr and the fee from NZD $6450 did not appear in the fetched page text (unconfirmed — manual check needed).

The **Partner of a Student Work Visa** still exists, with open work rights "in any job, anywhere in New Zealand" for the same duration as the supporting partner's visa ([INZ Partner of a Student Work Visa](https://www.immigration.govt.nz/visas/partner-of-a-student-work-visa/)). Its sibling, the **Partner of a Worker Work Visa**, gives identical open rights. The supporting visa must run longer than 6 months, and it depends on the main applicant's AEWV band: at least **$28/hr for ANZSCO 1–3**, and **$52.50/hr for ANZSCO 4–5** ($35/hr in a Green List job). Dependent children cannot be included in the application ([INZ Partner of a Worker Work Visa](https://www.immigration.govt.nz/visas/partner-of-a-worker-work-visa/)). The fetched text was partly cut off near the wage figures, so re-check $28/hr on the page. Because the settlement steps for both partner visas are the same, one PARTNER_WORK option replaces PARTNER_OF_STUDENT.

Four more categories are live and common among skilled arrivals. The first is the **Skilled Migrant Category Resident Visa**. Since 24 Aug 2026 it has had three pathways: points-based (6 points), Skilled Work Experience, and Trades and Technician ([INZ 2026 SMC changes](https://www.immigration.govt.nz/live/resident-visas-to-live-in-new-zealand/skilled-residence-pathways-in-new-zealand/skilled-migrant-category-pathway-to-residence/2026-changes-to-the-skilled-migrant-category-resident-visa/)). The second is the **Post-Study Work Visa**, which runs for up to 3 years, becomes online-only from 16 Nov 2026 and is widening in eligibility ([INZ Post-Study Work Visa](https://www.immigration.govt.nz/visas/post-study-work-visa/)). The third is the **Specific Purpose Work Visa**, which covers secondments and intra-company transferees ([INZ Specific Purpose Work Visa](https://www.immigration.govt.nz/visas/specific-purpose-work-visa/)). The fourth is **working holiday** visas ([INZ Work](https://www.immigration.govt.nz/work/)). Both resident options (Straight to Residence and SMC) unlock steps that no temporary visa does, so they belong in the list as separate options.

## Each visa answer gates four steps, and two steps ignore it

The table below shows which first-six-month steps depend on the visa. Gaps in the gates are marked. The key point is that **the visa label alone cannot decide healthcare or school status**. Both depend on visa length or AEWV pay, and a single-select list cannot capture either.

| Step | Rule | Values affected | Source |
|---|---|---|---|
| Public healthcare | Residents eligible (B3). Work visa holders eligible only if the visa allows a stay of **2 years or more** (B5). Children 17 or younger of an eligible parent are eligible (B16). Partners must qualify on their own, except for maternity care. **Rules change 1 Dec 2026.** | All. AEWV, partner, PSW, SPWV and working holiday each depend on visa length | [Health NZ eligibility](https://www.healthnz.govt.nz/hospitals-services/eligibility-subsidies/publicly-funded-healthcare) (last updated 15 Oct 2026) |
| Children's school fees | Children of most work visa holders get domestic status through a Dependent Child Student Visa. Excluded: working holiday, SMC Job Search, Specific Purpose (independent professional or contractual service supplier), seasonal and fishing-crew visas. For AEWV it depends "on how much you earn, what your job is" | AEWV (conditional), WORKING_HOLIDAY (excluded), SPECIFIC_PURPOSE_WORK (partly excluded); residents domestic | [INZ KB 1035](https://www.immigration.govt.nz/knowledgebase/kb-question/kb-question-1035) |
| KiwiSaver | Citizens or people "entitled to live in New Zealand indefinitely". "You cannot join KiwiSaver if you have a temporary, visitor, work or student visa" | STRAIGHT_TO_RESIDENCE, SKILLED_MIGRANT_RESIDENT only | [IRD Joining KiwiSaver](https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/joining-kiwisaver) |
| Enrol to vote | Aged 18+, citizen or permanent resident, and lived in NZ continuously for 12 months at some time | Residents, but outside the first 6 months unless earlier NZ residence counts | [Electoral Commission PDF](https://vote.nz/assets/Are-you-eligible-to-enrol-and-vote.pdf) (unconfirmed — manual check needed) |
| Working for Families | Not available if you or your child "hold only a temporary permit or visa" | Temporary visas: show a "not yet" note | [IRD WFF residency](https://www.ird.govt.nz/working-for-families/can-you-get-it/residency) |
| IRD tax residency | Based on 183 days or a permanent place of abode. "Tax residency is different from your immigration status" | None (no branching) | [IRD tax residency](https://www.ird.govt.nz/international-tax/individuals/tax-residency-status-for-individuals) |
| Driver licence | 12 months on an overseas licence for arrivals on or after **1 Nov 2026** (down from 18). Conversion needs a current licence or one expired within 12 months | None (no branching) | [NZTA time limit](https://www.nzta.govt.nz/travelling-on-our-roads/visitors-and-new-residents/driving-on-nz-roads/time-limit-extended-for-driving-on-an-overseas-licence); [NZTA converting](https://www.nzta.govt.nz/driver-licences/new-residents-and-visitors/converting-to-nz-driver-licence/converting-a-car-licence) (both unconfirmed — manual check needed) |

The AEWV wage threshold for a child's domestic status is not on the KB page. It sits in Ops Manual U8.20, which was not opened. The notes cite it at two different URLs, [87067.htm](https://www.immigration.govt.nz/opsmanual/87067.htm) and [88702.htm](https://www.immigration.govt.nz/opsmanual/88702.htm) (unconfirmed — manual check needed). Benefits also depend on the visa: most Work and Income payments need a residence class visa, and Jobseeker Support needs 2 continuous years since getting it ([Work and Income, Moving to NZ](https://www.workandincome.govt.nz/eligibility/moving-to-nz/index.html), unconfirmed — manual check needed).

## City changes one step, family changes many, occupation splits cleanly

**City.** The only confirmed city-specific step is how you pay for public transport. In Christchurch, "Metrocard and cash will no longer be accepted … from 23 November 2026" across Christchurch, Selwyn and Waimakariri. Contactless payment or a Motu Move card replaces them, and the claim that fares stay the same rests on a search snippet ([Metro](https://www.metroinfo.co.nz/payments-and-fares/metrocard-and-cash/)). Wellington keeps Snapper until Metlink moves to Motu Move, with a 1.5% contactless fee ([Metlink](https://www.metlink.org.nz/getting-started/tickets-and-fares/using-snapper), unconfirmed — manual check needed). Motu Move is due nationwide by the end of 2027 ([NZTA National Ticketing Solution](https://www.nzta.govt.nz/walking-cycling-and-public-transport/public-transport/national-ticketing-solution), unconfirmed — manual check needed). School zones are set per school and depend on the street address, not the city ([MoE enrolment scheme FAQs](https://web-assets.education.govt.nz/s3fs-public/2025-08/FAQs%20about%20Enrolment%20Schemes_English%20(3).pdf?VersionId=njg2rBfQhkL2U44LPUdrt6KGSqyuCePB), unconfirmed — manual check needed). Health eligibility is national ([Health NZ eligibility](https://www.healthnz.govt.nz/hospitals-services/eligibility-subsidies/publicly-funded-healthcare)). AT HOP, council steps (rates, rubbish, dog registration) and tenancy law were not checked. The four city values are therefore correct as places, but OTHER gets no specific step.

**Family.** Every value changes something. A partner adds the partner work visa route. That route depends on the main applicant's ANZSCO level and pay, and the partner must qualify for healthcare on their own ([INZ Partner of a Worker](https://www.immigration.govt.nz/visas/partner-of-a-worker-work-visa/)). The difference between COUPLE_DUAL_WORK and COUPLE_CONSTRAINED is real but narrow: it comes down to whether the partner already holds a visa with work rights. Children add the most steps. They need a Dependent Child Student Visa for domestic school status ([INZ KB 1035](https://www.immigration.govt.nz/knowledgebase/kb-question/kb-question-1035)) and school enrolment with proof of address. Children aged 3–5 can get 20 Hours ECE ([MoE ECE Funding Handbook 4-1](https://www.education.govt.nz/education-professionals/early-learning/funding-and-financials/ece-funding-handbook/chapter-4-20-hours-early-childhood-education/4-1-funding-eligibility), unconfirmed — manual check needed). Children under 14 get zero-fee GP visits ([Zero fees for under 14s](https://info.health.nz/services-support/publicly-funded-health-and-disability-services/zero-fees-for-under-14s), page title only, unconfirmed — manual check needed). Immunisation and Well Child care are available "regardless of immigration status" (Te Whatu Ora guide to eligibility, now under healthnz.govt.nz, unconfirmed — manual check needed). Working for Families is not available on temporary visas ([IRD WFF residency](https://www.ird.govt.nz/working-for-families/can-you-get-it/residency)). No current value lets a sole parent with children answer correctly.

**Occupation.** Three values trigger a legally required step before you can work. Healthcare: HPCA Act s 8(1) requires a current practising certificate ([HPCA Act 2003](https://legislation.govt.nz/act/public/2003/48/en/latest.pdf)), and the Medical Council says you "must be both registered and hold a current practising certificate" ([MCNZ](https://www.mcnz.org.nz/registration/getting-registered/registration-policy/policy-on-practising-certificates/), unconfirmed — manual check needed). Education: "Before you register with the Teaching Council, you need to apply for a Teaching IQA" ([Teaching Council](https://teachingcouncil.nz/en/become-a-teacher/overseas-trained-teacher-coming-to-Aotearoa/requirements-to-teach-in-nz)). The practising-certificate and Tōmua details rest on search snippets (unconfirmed — manual check needed). Trades: electrical workers need a Practising Licence, and overseas-trained workers first need a Limited Certificate, at about $1650 and 12 weeks ([EWRB](https://www.ewrb.govt.nz/licences/becoming-registered-for-overseas-trained-applicants/), unconfirmed — manual check needed). Plumbing, gas and drainlaying work needs a current NZ licence ([PGDB](https://www.pgdb.co.nz/apply_for_registration/register_with_overseas_qualifications/), unconfirmed — manual check needed). Licensed Building Practitioners were not checked. **SEEKING_WORK** changes steps because benefits are mostly closed to temporary visa holders (Work and Income, above). **TECHNOLOGY** has no statutory registration body and changes no official step. **FINANCE** was not checked (FAP licensing sits with the provider firm, but this is unverified). **OTHER_PROFESSIONAL** is too broad to map to any step.

## Proposed dimensions

```yaml
visa:
  label: "Which visa will you arrive on?"
  values:
    - [AEWV, "Accredited Employer Work Visa (AEWV)"]
    - [STRAIGHT_TO_RESIDENCE, "Straight to Residence Visa (Green List Tier 1)"]
    - [SKILLED_MIGRANT_RESIDENT, "Skilled Migrant Category Resident Visa"]
    - [PARTNER_WORK, "Partner work visa (your partner is working or studying in NZ)"]
    - [POST_STUDY_WORK, "Post-Study Work Visa"]
    - [SPECIFIC_PURPOSE_WORK, "Specific Purpose Work Visa"]
    - [WORKING_HOLIDAY, "Working holiday visa"]
    - [OTHER, "Another visa"]
city:
  label: "Where will you live?"
  values:
    - [AUCKLAND, "Auckland"]
    - [WELLINGTON, "Wellington region"]
    - [CHRISTCHURCH, "Greater Christchurch (including Selwyn and Waimakariri)"]
    - [OTHER, "Somewhere else in NZ"]
family:
  label: "Who is moving with you?"
  values:
    - [SOLO, "Just me"]
    - [COUPLE_DUAL_WORK, "Me and my partner, who can already work in NZ"]
    - [COUPLE_CONSTRAINED, "Me and my partner, who can't work in NZ yet"]
    - [FAMILY_WITH_CHILDREN, "Me, my partner and our children"]
    - [SOLE_PARENT, "Me and my children"]
occupation:
  label: "What kind of work will you do?"
  values:
    - [HEALTHCARE, "Healthcare (doctor, nurse or another registered health profession)"]
    - [EDUCATION, "Teaching"]
    - [TRADES, "Electrical, plumbing, gas or drainlaying trade"]
    - [OTHER_PROFESSIONAL, "Another job or profession"]
    - [SEEKING_WORK, "I'm still looking for work"]
```

Reasoning per change, one line each:

1. **GREEN_LIST_WORK removed (merged into AEWV).** Work to Residence is a resident visa you apply for after 24 months in a Tier 2 job, so Tier 2 migrants arrive on an AEWV ([INZ](https://www.immigration.govt.nz/visas/work-to-residence-visa/)).
2. **GREEN_LIST_RESIDENCE renamed STRAIGHT_TO_RESIDENCE.** "Straight to Residence Visa" is INZ's official name, and the green-list URL returns 404 ([INZ](https://www.immigration.govt.nz/visas/straight-to-residence-visa/)).
3. **SKILLED_MIGRANT_RESIDENT added.** It is a live resident category that unlocks KiwiSaver and healthcare as B3 ([INZ SMC 2026](https://www.immigration.govt.nz/live/resident-visas-to-live-in-new-zealand/skilled-residence-pathways-in-new-zealand/skilled-migrant-category-pathway-to-residence/2026-changes-to-the-skilled-migrant-category-resident-visa/); [IRD](https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/joining-kiwisaver)).
4. **PARTNER_OF_STUDENT widened to PARTNER_WORK.** The student and worker partner visas give identical open work rights ([INZ worker](https://www.immigration.govt.nz/visas/partner-of-a-worker-work-visa/); [INZ student](https://www.immigration.govt.nz/visas/partner-of-a-student-work-visa/)).
5. **POST_STUDY_WORK, SPECIFIC_PURPOSE_WORK and WORKING_HOLIDAY added.** All are live categories, and SPWV and working holiday change children's school status ([INZ KB 1035](https://www.immigration.govt.nz/knowledgebase/kb-question/kb-question-1035)).
6. **City labels clarified, values kept.** The transport operator's area covers more than the city: Metro covers Christchurch, Selwyn and Waimakariri, and Metlink covers the Greater Wellington region ([Metro](https://www.metroinfo.co.nz/payments-and-fares/metrocard-and-cash/)).
7. **Family labels reworded, SOLE_PARENT added.** The children's steps (school visa, ECE, GP) apply without a partner, and the current set cannot express a sole parent ([INZ KB 1035](https://www.immigration.govt.nz/knowledgebase/kb-question/kb-question-1035)).
8. **Healthcare, Education and Trades relabelled to name the regulated roles.** Registration is legally required for these roles specifically ([HPCA Act](https://legislation.govt.nz/act/public/2003/48/en/latest.pdf); [Teaching Council](https://teachingcouncil.nz/en/become-a-teacher/overseas-trained-teacher-coming-to-Aotearoa/requirements-to-teach-in-nz); [EWRB](https://www.ewrb.govt.nz/licences/becoming-registered-for-overseas-trained-applicants/)).
9. **TECHNOLOGY and FINANCE merged into OTHER_PROFESSIONAL.** No official step found for either (no statutory body for technology; finance not checked).

## Answer mapping

| Dimension | Old value | New value |
|---|---|---|
| visa | AEWV | AEWV |
| visa | GREEN_LIST_WORK | AEWV |
| visa | GREEN_LIST_RESIDENCE | STRAIGHT_TO_RESIDENCE |
| visa | PARTNER_OF_STUDENT | PARTNER_WORK |
| visa | OTHER | OTHER |
| city | AUCKLAND | AUCKLAND |
| city | WELLINGTON | WELLINGTON |
| city | CHRISTCHURCH | CHRISTCHURCH |
| city | OTHER | OTHER |
| family | SOLO | SOLO |
| family | COUPLE_DUAL_WORK | COUPLE_DUAL_WORK |
| family | COUPLE_CONSTRAINED | COUPLE_CONSTRAINED |
| family | FAMILY_WITH_CHILDREN | FAMILY_WITH_CHILDREN |
| occupation | TECHNOLOGY | OTHER_PROFESSIONAL |
| occupation | HEALTHCARE | HEALTHCARE |
| occupation | EDUCATION | EDUCATION |
| occupation | FINANCE | OTHER_PROFESSIONAL |
| occupation | TRADES | TRADES |
| occupation | OTHER_PROFESSIONAL | OTHER_PROFESSIONAL |
| occupation | SEEKING_WORK | SEEKING_WORK |

Users who answered OTHER may now belong in one of the new visa values (SMC, PSW, SPWV, working holiday). The mapping cannot tell, so prompt those users to re-answer. A GREEN_LIST_WORK user who already holds a Work to Residence Visa is a resident, so mapping them to AEWV would hide KiwiSaver. See decision 2.

## Decisions for the owner

1. **Resident vs temporary for OTHER.** The resident flag can be derived from STRAIGHT_TO_RESIDENCE and SKILLED_MIGRANT_RESIDENT. OTHER is ambiguous. Options: (a) add a follow-up question "Is your visa a resident visa?" shown only for OTHER; (b) treat OTHER as temporary and add a "residents also get" note; (c) add a separate "Another resident visa" value, which goes beyond the current list and needs your approval. Source: [IRD KiwiSaver](https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/joining-kiwisaver).
2. **Existing GREEN_LIST_WORK users.** Options: (a) map them to AEWV (as in the table); (b) ask them to re-answer, since some may already be on Work to Residence. Source: [INZ Work to Residence](https://www.immigration.govt.nz/visas/work-to-residence-visa/).
3. **Healthcare 2-year stay.** For every temporary visa, healthcare eligibility depends on whether the visa allows 2+ years. Options: (a) a yes/no follow-up "Does your visa let you stay in NZ for 2 years or more?"; (b) show both outcomes, phrased conditionally; (c) wait for the 1 Dec 2026 rules before choosing. Source: [Health NZ](https://www.healthnz.govt.nz/hospitals-services/eligibility-subsidies/publicly-funded-healthcare).
4. **AEWV pay band / ANZSCO level.** This decides partner work rights and children's domestic school status. Options: (a) a follow-up shown for AEWV with a partner or children; (b) no question, and conditional copy that links to INZ. Asking for pay and then telling the user the outcome comes close to an eligibility assessment, so option (b) is safer under IAA rule 2 below. Source: [INZ Partner of a Worker](https://www.immigration.govt.nz/visas/partner-of-a-worker-work-visa/).
5. **Partner work status when children are present.** FAMILY_WITH_CHILDREN does not capture whether the partner can work. Options: (a) a follow-up; (b) show both partner steps.
6. **City granularity.** Options: (a) keep the four values until Motu Move is national (end of 2027); (b) replace them with a 16-region picker if the app will link council pages; (c) drop city and show one generic "find your council and transport operator" step.
7. **Technology / Finance.** Options: (a) merge them (as proposed); (b) keep them only for non-official tailoring (job boards, community content); (c) check FMA/FAP employee rules before deciding on Finance.
8. **Working holiday in a skilled-migrant app.** Options: (a) keep it (it changes school status); (b) fold it into OTHER.
9. **Trades scope.** Options: (a) keep it to the confirmed electrical and plumbing/gas/drainlaying regimes; (b) check Licensed Building Practitioners first, then widen the label.

## IAA content rules

The app is a business and acts systematically, so the s 11(a) "informal or family context" exemption does not cover it, and no listed exemption covers a website or app ([IALA 2007, version as at 27 Nov 2025](https://www.legislation.govt.nz/act/public/2007/15/en/latest/)). Section 7(1)(a) defines advice as using immigration knowledge to "advise, direct, assist, or represent" someone "directly or indirectly and whether or not for gain or reward". Unlicensed advice carries a fine of up to **$100,000** (s 63(5)), and **up to 7 years' imprisonment** if given knowingly (s 63(4)) (same source). The IAA's factsheet reportedly gives "advising a person what visa they qualify for" and "advising on how to answer a question on the form" as examples of advice ([IAA factsheet](https://www.iaa.govt.nz/assets/documents/factsheets/factsheet-what-is-nz-immigration-advice.pdf), unconfirmed — manual check needed). No IAA guidance on apps or AI was found.

1. **Restate, don't apply (s 7(1)(b)(i)).** Visa content may summarise information INZ publishes (names, criteria, fees). Each summary must link the INZ source page and show a "last checked" date.
2. **Never assess eligibility (s 7(1)(a)).** Neither the content nor the AI assistant may say that you qualify or are likely to qualify, which visa suits you, or how your facts compare with the criteria. Onboarding answers may tailor settlement steps but must never produce a visa verdict.
3. **Never help answer application questions (s 7(1)(a), "assist").** No guidance on answering specific INZ form or Immigration Online questions, and no review of draft answers.
4. **Always give the referral exits (s 7(1)(b)(ii)).** Every personal visa question gets a pointer to INZ and to the IAA register of licensed advisers. The app may add that lawyers are exempt under s 11(e).
5. **The AI assistant follows rules 1–4 and logs its refusals (s 63(3)(a)).** For "I am X, can I get visa Y?", the assistant links INZ's published criteria, states that it cannot assess individual eligibility, and gives the referral. System prompts and refusals are kept as evidence of "reasonable care and due diligence".
6. **No holding out (ss 64–65).** The app and its assistant never use "adviser", "visa expert" or "immigration consultant" for themselves. These offences carry up to 2 years or $10,000.
7. **Settlement content stays settlement content (s 7(1)(b)(iii), s 4 "settlement services").** IRD, driving, tenancy and GP enrolment content is excluded from "immigration advice". It must not drift into interpreting visa conditions, such as whether your visa allows a given job.
8. **Get legal review before launch.** Whether an AI answering personal visa questions is "advice" has no official ruling. Confirm with a NZ lawyer or the IAA.

## Reuse rules

NZGOAL v2 reportedly makes CC BY 4.0 the default for agencies, but only each site's own statement binds a reuser ([NZGOAL v2](https://www.data.govt.nz/toolkit/policies/nzgoal/nzgoal-version-2), unconfirmed — manual check needed). Rules common to all sites: never use logos, the Coat of Arms, photos, illustrations or third-party material. Attribute in writing only. Never imply endorsement (CC BY 4.0 s 2(a)(6), [legal code](https://creativecommons.org/licenses/by/4.0/legalcode.en)). Show a visible "LandedNZ is not a government service" line. Legislation text has no copyright ([IRD Copyright](https://www.ird.govt.nz/about-this-site/conditions-of-use/copyright)).

| Site | Licence | What the app may do | Required attribution / limits | Source |
|---|---|---|---|---|
| immigration.govt.nz | CC BY 3.0 NZ | Copy, distribute, adapt | Attribute "to the Crown and the Ministry's website". Logos are excluded, and the Flags, Emblems, and Names Protection Act 1981 applies | [INZ Copyright](https://www.immigration.govt.nz/about-us/about-this-site/copyright/) |
| ird.govt.nz | CC BY 4.0 | Reproduce and adapt | Reproduce accurately, never in a misleading context, and acknowledge the source and copyright status. Logos, design and imagery need permission | [IRD Copyright](https://www.ird.govt.nz/about-this-site/conditions-of-use/copyright) |
| govt.nz | CC BY 4.0 | Copy, distribute, adapt | Attribute "to the Crown and the Govt.nz website". No photographs | [Govt.nz Copyright](https://www.govt.nz/about/the-govt-nz-website/using-this-website/copyright-and-attribution/) |
| health.govt.nz | CC BY 4.0 | Adapt, with credit, a licence link and a note of changes | Photos, graphics and logos are excluded. Attribution in writing, not by logo | [MoH Copyright](https://www.health.govt.nz/about-this-site/copyright) |
| healthnz.govt.nz (and info.health.nz) | CC BY 4.0 | Adapt, with credit, a licence link and a note of changes | Photos, illustrations and logos are excluded | [Health NZ Copyright](https://www.healthnz.govt.nz/copyright) |
| tenancy.govt.nz | Non-commercial only, no CC licence | Write original summaries and link, or ask permission | Images and trade marks may not be used for any purpose | [Tenancy Services Copyright](https://www.tenancy.govt.nz/about-tenancy-services/copyright/) |
| nzta.govt.nz | Reportedly CC BY-NC 4.0 | Write original summaries and link, or ask informationteam@nzta.govt.nz | Unconfirmed — manual check needed | [NZTA About this site](https://www.nzta.govt.nz/about-us/about-this-site) |

Suggested attribution format: "Adapted from [page title], Inland Revenue, ird.govt.nz. Crown copyright, CC BY 4.0. Changes made."

## Crown and statutory domain allowlist

Crown entity status comes from Schedule 1 of the Crown Entities Act 2004, version as at 6 June 2026 ([CEA PDF](https://legislation.govt.nz/act/public/2004/115/en/2026-06-06.pdf)). Orders in Council made after that date were not checked.

| Domain | Body | Legal basis | Status |
|---|---|---|---|
| acc.co.nz | Accident Compensation Corporation | CEA Sch 1 Pt 1, Crown agent | Confirmed |
| sorted.org.nz | Te Ara Ahunga Ora Retirement Commission (statutory name "Retirement Commissioner") | CEA Sch 1 Pt 2, autonomous Crown entity; operator stated on [sorted.org.nz/about-us](https://sorted.org.nz/about-us) | Confirmed |
| privacy.org.nz | Privacy Commissioner | CEA Sch 1 Pt 3, independent Crown entity; [OPC about](https://www.privacy.org.nz/about-us/) | Confirmed |
| hdc.org.nz | Health and Disability Commissioner | CEA Sch 1 Pt 3 | Confirmed (domain resolves; About page not read) |
| tikatangata.org.nz (hrc.co.nz redirects) | Human Rights Commission | CEA Sch 1 Pt 3 | Confirmed |
| fireandemergency.nz | Fire and Emergency NZ | CEA Sch 1 Pt 1 | Confirmed |
| nzblood.co.nz | NZ Blood and Organ Service | CEA Sch 1 Pt 1 | Confirmed |
| publictrust.co.nz | Public Trust | CEA Sch 1 Pt 2 | Confirmed |
| teachingcouncil.nz | Teaching Council of Aotearoa NZ | Education and Training Act 2020 s 474 ([PDF](https://legislation.govt.nz/act/public/2020/38/en/latest.pdf)) | Confirmed |
| nursingcouncil.org.nz | Nursing Council of NZ | HPCA Act 2003 s 114 + Sch 2 ([PDF](https://legislation.govt.nz/act/public/2003/48/en/latest.pdf)) | Confirmed |
| mcnz.org.nz | Medical Council of NZ | HPCA Act 2003 s 114 + Sch 2 | Unconfirmed — manual check needed (domain timed out) |
| pgdb.co.nz | Plumbers, Gasfitters, and Drainlayers Board | PGD Act 2006 s 133 ([PDF](https://legislation.govt.nz/act/public/2006/74/en/latest.pdf)) | Confirmed |
| metlink.org.nz | Greater Wellington Regional Council transport brand | Regional council service ([Metlink about](https://app.metlink.org.nz/about-us)); no statutory section cited | Provisional |
| metroinfo.co.nz | Environment Canterbury transport brand | Regional council service ([Metro who we are](https://timaru.metroinfo.co.nz/about-metro/who-we-are/)); no statutory section cited | Provisional |

Already covered by `*.govt.nz`: fma.govt.nz, comcom.govt.nz, ewrb.govt.nz (Electricity Act 1992 s 148), at.govt.nz, retirement.govt.nz, healthnz.govt.nz, tenancy.govt.nz. **Excluded:** cab.org.nz. Citizens Advice Bureau is a registered charity and incorporated society ([Charities Register CC24323](https://register.charities.govt.nz/Charity/CC24323)), so it belongs in a trusted community tier. Replace tewhatuora.govt.nz and info.health.nz links with healthnz.govt.nz URLs, because both now redirect there.

## Open risks

1. **Health NZ eligibility changes on 1 Dec 2026.** The details are unknown, because the Ministry of Health page returned 403. The B5 two-year rule, and decision 3 with it, may change ([Health NZ](https://www.healthnz.govt.nz/hospitals-services/eligibility-subsidies/publicly-funded-healthcare)).
2. **NZTA overseas-licence period drops to 12 months for arrivals from 1 Nov 2026.** This comes from search snippets only. Verify before any driving copy ships.
3. **NZTA licence terms are unverified.** If they are CC BY-NC, NZTA text cannot be adapted in a commercial app.
4. **Auckland Transport governance changed.** The 2026 amendment repealed s 38, and AT's assets vest in Auckland Council at the end of the transitional period, around 7 Nov 2026 at the latest. at.govt.nz content and naming may move to aucklandcouncil.govt.nz ([Amendment Act 2026 No 15](https://legislation.govt.nz/act/public/2026/15/en/latest.pdf)).
5. **Christchurch Metrocard ends 23 Nov 2026,** and Motu Move rollout dates differ across NZTA pages.
6. **Working for Families residence test may tighten.** IRD has proposed requiring citizenship or a residence class visa. Enactment is not confirmed ([IRD RIS 2026](https://www.taxpolicy.ird.govt.nz/-/media/project/ir/tp/publications/2026/ris-residence-requirements.pdf?modified=20260904013257), unconfirmed — manual check needed).
7. **All IAA material is snippet-only.** iaa.govt.nz blocked automated access, so check the factsheet wording by hand. The IAA rules above rest on the Act's text, which was verified.
8. **Other snippet-only or unopened items:** the Tier 1 $35/hr floor and $6450 fee, the Partner of a Worker $28/hr figure, the AEWV threshold for children's school status (Ops Manual U8.20, cited at two URLs), voting eligibility, 20 Hours ECE, zero fees for under-14s, Teaching Council practising certificates, MCNZ, EWRB and PGDB details, Work and Income benefit rules, NZGOAL, and the mcnz.org.nz domain.
9. **Not researched:** ACC coverage regardless of visa, LBP licensing, FMA/FAP rules for finance employees, council steps, tenancy law, and AEWV job-change conditions.

## Conclusion

Visa is the one answer that genuinely changes official steps, yet a single-select visa list cannot capture the two facts that decide most of them: visa length (healthcare) and AEWV pay band (school and partner rights). The proposed list corrects the names and categories. The owner still has to choose between adding follow-up questions and writing conditional copy, and conditional copy is also the safer option under s 7 of the IAA, because asking for pay and returning an outcome looks like an eligibility check. City and occupation are worth less than they appear: city's only official difference expires by the end of 2027, and two occupation values map to no step at all. Several rules change in Nov–Dec 2026, so the content needs a re-verification pass in December before it can be called stable.

## Owner approval (2026-10-25)

1. Visa list approved as proposed (8 values, Working holiday kept).
2. Visa details that one answer can't hold (resident vs temporary for OTHER, 2+ year stay for healthcare, AEWV pay band): conditional copy linking the official page, no new onboarding questions. Decisions 1, 3, 4 and 5 resolved this way.
3. Migration: apply the answer mapping; users who answered GREEN_LIST_WORK or visa OTHER get a prompt to re-check their visa (decision 2). The prompt is a UI change and needs its board (Task 5).
4. City, family and occupation approved as proposed: city keeps 4 values (decision 6a), SOLE_PARENT added, Technology and Finance merge into OTHER_PROFESSIONAL (7a), Working holiday kept (8a), Trades limited to the confirmed electrical and plumbing/gas/drainlaying regimes (9a).

Not decided at this gate: the domain allowlist. Task 3 takes the confirmed domains and leaves out mcnz.org.nz (unconfirmed) and metlink.org.nz / metroinfo.co.nz (provisional) until they are checked.
