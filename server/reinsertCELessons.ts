/**
 * Re-insert CE course lessons with correct content
 * Run after the auto-update script overwrote content
 */

import { db } from './db';
import { lessons } from '@shared/schema';

// Unit IDs from the database
const COURSE_1_UNITS = [
  'b8ca0e0f-d27c-4dcc-9052-d8b43d1d5c03', // Hour 1: Recent Changes
  '8747794a-b8a9-4847-baf0-aa6f325e7331', // Hour 2: Agency Law
  'f99bd2d3-aed9-406f-a72a-4e6c170b4f94', // Hour 3: Escrow Management
];

const COURSE_2_UNITS = [
  '7b0a9386-01ec-426d-9c7c-f8aaa3642821', // Hour 1: Ethics vs Law
  '42ea02fb-30bb-40d2-85e9-56ce4f58f924', // Hour 2: Advertising Standards
  'a6afbf6b-f80a-4c17-9550-21c0acfbe1cd', // Hour 3: Commission Disputes
];

const COURSE_3_UNITS = [
  '10f4ee0d-f8a1-41f6-b27c-96aa474d2ad7', // Hour 1: Contract Structure
  '81b17460-08a7-462f-9a12-cd7b5cad4597', // Hour 2: Contingencies
  '5d9ac551-52d8-4160-b5f3-2f71fa10d5f0', // Hour 3: Disclosures
  'ccea8b47-17cd-4b59-9518-622daa3b9ce2', // Hour 4: Inspections
  '4bf74438-91e2-479b-a315-a9b9bfa0c5b7', // Hour 5: Loan Approval
  'a25de530-55f0-43b9-a856-38bac08e489c', // Hour 6: Appraisal Gaps
  'acd74122-246f-46b8-8c2e-412a8217e971', // Hour 7: Title
  '890c1b87-a3a3-4ec2-a339-17284a7710e3', // Hour 8: Closing
];

export async function reinsertCELessons() {
  console.log('🔧 Re-inserting CE course lessons with correct content...\n');

  try {
    // Course 1: Core Law Lessons
    const course1Lessons = [
      {
        unitId: COURSE_1_UNITS[0],
        lessonNumber: 1,
        title: 'The Florida Real Estate Commission (FREC) and DBPR',
        content: `The Florida Real Estate Commission (FREC) operates under the authority of the Florida Department of Business and Professional Regulation (DBPR). Together, these bodies are responsible for licensing real estate professionals, enforcing laws and rules governing real estate practice, and protecting the public from unqualified or dishonest practitioners.

FREC consists of seven members appointed by the Governor and confirmed by the Senate. Membership includes licensed brokers and sales associates as well as consumer representatives who are not licensed in any profession regulated by DBPR. Each member serves a four-year term.

In addition to its licensing and enforcement role, FREC has rule-making authority under the Florida Administrative Code. These rules interpret and implement the statutes in Chapter 475, Florida Statutes, and provide detailed guidance on licensing requirements, advertising, escrow procedures, and professional conduct.

Recent years have seen updates in several areas, including electronic signatures, remote online notarization, and changes to continuing education requirements. Licensees must keep informed of these changes to avoid unintentional violations.`,
        durationMinutes: 10,
        sequence: 1,
      },
      {
        unitId: COURSE_1_UNITS[0],
        lessonNumber: 2,
        title: 'Recent Legislative Changes',
        content: `Florida's real estate laws are regularly updated to address market conditions, consumer protection needs, and industry practices. Understanding recent legislative changes is essential for compliance.

Recent legislative updates have included:

1. Changes to continuing education requirements for license renewal
2. Updates to the rental deposit and advance requirements
3. Modifications to disclosure requirements for material defects
4. Electronic signature and remote notarization authorization
5. Changes to community association disclosure requirements

Licensees are expected to stay current with all statutory changes. Ignorance of the law is not a defense against disciplinary action. The DBPR website and official Florida real estate education providers are reliable sources for updates.`,
        durationMinutes: 10,
        sequence: 2,
      },
      {
        unitId: COURSE_1_UNITS[0],
        lessonNumber: 3,
        title: 'FREC Rule Changes and Updates',
        content: `FREC has the authority to adopt rules that interpret and implement Florida's real estate licensing laws. These rules are published in the Florida Administrative Code and have the force of law.

Recent rule changes have addressed:

1. Advertising requirements - including social media and internet advertising standards
2. Escrow account requirements - including interest-bearing accounts and notification procedures
3. Education requirements - including distance learning standards and exam preparation courses
4. Brokerage operations - including office signage and record retention requirements

When FREC proposes new rules or amendments, the public has an opportunity to comment before adoption. Licensees should monitor FREC meeting agendas and proposed rules to anticipate changes that may affect their practice.

Non-compliance with FREC rules can result in disciplinary action including fines, license suspension, or revocation.`,
        durationMinutes: 10,
        sequence: 3,
      },
      // Hour 2
      {
        unitId: COURSE_1_UNITS[1],
        lessonNumber: 1,
        title: 'Single Agent vs Transaction Broker',
        content: `Florida law recognizes different types of brokerage relationships, each with distinct duties and obligations.

A Single Agent represents either the buyer or the seller, but not both, in a real estate transaction. Single agents owe their principal a full set of fiduciary duties including:
- Dealing honestly and fairly
- Loyalty
- Confidentiality
- Obedience
- Full disclosure of all known facts that materially affect the value of residential real property
- Accounting for all funds
- Skill, care, and diligence
- Presenting all offers and counteroffers in a timely manner

A Transaction Broker provides a limited form of representation to buyers, sellers, or both. Transaction brokers do not owe loyalty or confidentiality beyond certain limited matters. Their duties include:
- Dealing honestly and fairly
- Accounting for all funds
- Using skill, care, and diligence
- Disclosing all known facts that materially affect the value of residential real property
- Presenting all offers and counteroffers in a timely manner
- Limited confidentiality

Transaction broker is the default relationship in Florida unless another relationship is established in writing.`,
        durationMinutes: 10,
        sequence: 1,
      },
      {
        unitId: COURSE_1_UNITS[1],
        lessonNumber: 2,
        title: 'Disclosure Requirements',
        content: `Florida law requires written disclosure of the brokerage relationship before a licensee provides services to a buyer or seller in a residential transaction.

The No Brokerage Relationship notice must be given when a licensee will not be representing the party but is still providing services (such as showing a listing to an unrepresented buyer).

Timing of disclosure:
- For residential sales: before or at the time of entering into a listing agreement or showing property
- For rentals: before showing property or accepting an application

The disclosure must be signed by the party, and the licensee should retain a copy for their records.

Failure to provide the required disclosure can result in disciplinary action against the licensee. Additionally, unclear or late disclosures can create confusion about duties and expectations, potentially leading to disputes or litigation.

Best practice: Provide disclosures early, explain them clearly, and document the timing of delivery.`,
        durationMinutes: 10,
        sequence: 2,
      },
      {
        unitId: COURSE_1_UNITS[1],
        lessonNumber: 3,
        title: 'Dual Agency and Authorized Brokerage',
        content: `In Florida, dual agency (representing both buyer and seller as a single agent) is not permitted. However, with proper disclosure and consent, a brokerage may use transaction brokers to work with both parties in the same transaction.

When the same brokerage has licensees working with both the buyer and seller:
1. Written disclosure must be provided to both parties
2. Neither party can receive full single-agent representation
3. Confidential information from one party cannot be shared with the other without permission
4. Both parties must understand the limitations of this arrangement

Designated sales associates is another option available for commercial transactions, but is not available for residential transactions.

Common pitfalls to avoid:
- Accidentally disclosing confidential pricing information
- Appearing to favor one party over the other
- Failing to disclose the in-house situation promptly

Clear communication and documentation help protect both the clients and the licensees in these situations.`,
        durationMinutes: 10,
        sequence: 3,
      },
      // Hour 3
      {
        unitId: COURSE_1_UNITS[2],
        lessonNumber: 1,
        title: 'Escrow Account Requirements',
        content: `Florida law requires brokers to maintain escrow accounts for holding funds that belong to others in connection with real estate transactions. Proper escrow management is one of the most important compliance areas in real estate practice.

Key requirements include:

1. Escrow accounts must be in a Florida bank or credit union
2. The account must be insured by a federal agency (FDIC or NCUA)
3. Funds must be deposited within three business days after the broker receives them (unless the contract specifies otherwise)
4. Brokers must maintain accurate records of all escrow transactions
5. Monthly reconciliation statements are required

Interest-bearing escrow accounts may be used with written permission of all parties entitled to the funds. Interest earned belongs to the parties as agreed.

Personal funds of the broker may be kept in an escrow account only to cover minimum balance requirements or bank fees, typically up to $5,000.`,
        durationMinutes: 10,
        sequence: 1,
      },
      {
        unitId: COURSE_1_UNITS[2],
        lessonNumber: 2,
        title: 'Common Escrow Violations',
        content: `Escrow violations are among the most common reasons for disciplinary action against Florida real estate licensees. Understanding these violations helps avoid them.

Common violations include:

1. Failure to deposit escrow funds within required timeframes
2. Commingling - mixing escrow funds with personal or business funds
3. Conversion - using escrow funds for purposes other than intended
4. Improper disbursement of escrow funds
5. Failure to maintain proper records
6. Failure to notify FREC of conflicting demands on escrow funds

When there is a dispute over escrow funds, brokers have several options:
- Mediation (if agreed by all parties)
- Arbitration (if agreed by all parties)
- Litigation (interpleader action)
- Request FREC to issue an escrow disbursement order (EDO)

Brokers must notify FREC within 15 business days of receiving conflicting demands unless the matter is resolved within that time.`,
        durationMinutes: 10,
        sequence: 2,
      },
      {
        unitId: COURSE_1_UNITS[2],
        lessonNumber: 3,
        title: 'Recent Disciplinary Trends',
        content: `Review of recent FREC disciplinary cases reveals common areas of violation that licensees should be aware of:

1. Advertising violations - failure to include brokerage name, misleading claims, unlicensed advertising
2. Escrow violations - late deposits, inadequate records, improper disbursement
3. Disclosure failures - failing to disclose material facts or agency relationships
4. Unlicensed activity - practicing without a current active license
5. Trust account violations - commingling, conversion, failure to reconcile
6. Failure to supervise - brokers failing to supervise sales associates

Penalties range from administrative fines to license suspension or revocation, depending on severity and prior history.

The best way to avoid disciplinary action is to:
- Stay current on laws and rules
- Maintain accurate records
- Seek guidance when uncertain
- Complete required continuing education
- Respond promptly to DBPR inquiries

When receiving a complaint, cooperate fully and consider consulting with an attorney experienced in real estate license defense.`,
        durationMinutes: 10,
        sequence: 3,
      },
    ];

    // Course 2: Ethics Lessons
    const course2Lessons = [
      {
        unitId: COURSE_2_UNITS[0],
        lessonNumber: 1,
        title: 'Law vs. Ethics: Understanding the Distinction',
        content: `Law and ethics are related but distinct concepts that guide professional conduct in real estate.

Law refers to the formal rules established by government that are enforceable through regulatory or judicial action. In real estate, these include licensing statutes, contract law, fair housing laws, and FREC rules.

Ethics refers to broader standards of conduct based on principles such as honesty, fairness, and respect. Ethical standards often exceed legal requirements.

Example: A seller tells their agent that the roof has leaked in the past but was repaired. The law may require disclosure only of known existing defects. Ethics suggests full transparency about past issues that might concern a buyer, even if not legally required.

Understanding this distinction helps licensees:
- Recognize that legal compliance is the minimum standard
- Appreciate that ethical conduct builds trust and reputation
- Navigate situations where the law is unclear
- Make decisions that protect clients and the public`,
        durationMinutes: 10,
        sequence: 1,
      },
      {
        unitId: COURSE_2_UNITS[0],
        lessonNumber: 2,
        title: 'Ethical Decision-Making Framework',
        content: `When facing ethical dilemmas, licensees can apply a structured decision-making framework:

1. Identify the ethical issue - What values or principles are in conflict?

2. Gather relevant facts - What do you know? What do you need to know?

3. Consider stakeholders - Who is affected by this decision? How?

4. Evaluate options - What are the possible courses of action?

5. Apply ethical principles - Which option best aligns with honesty, fairness, and professional standards?

6. Make a decision and act - Choose the course of action that you can justify and defend.

7. Reflect on the outcome - What can you learn for future situations?

Common ethical dilemmas in real estate include:
- Pressure to omit negative information about a property
- Temptation to encourage a higher offer than the buyer intended
- Conflicts between loyalty to clients and honesty to other parties
- Balancing commission incentives with client interests

The best approach is to default to transparency and fairness, even when the law might allow less.`,
        durationMinutes: 10,
        sequence: 2,
      },
      {
        unitId: COURSE_2_UNITS[0],
        lessonNumber: 3,
        title: 'Professional Standards and Codes of Conduct',
        content: `In addition to legal requirements, many real estate professionals are bound by professional codes of conduct established by organizations such as the National Association of REALTORS® (NAR) or state associations.

Key principles found in most professional codes include:

1. Client interests first - The client's interests come before the agent's own interests.

2. Cooperation - Professionals should work cooperatively with other practitioners when it serves their clients.

3. Truthfulness - All statements should be accurate and not misleading.

4. Competence - Professionals should only undertake tasks within their expertise or seek appropriate guidance.

5. Fair treatment - All parties should be treated fairly and honestly.

Violations of professional codes can result in sanctions from the professional organization, separate from any regulatory action by DBPR or FREC.

Building a reputation for ethical conduct is one of the most valuable assets a real estate professional can develop. Trust leads to referrals, repeat business, and long-term success.`,
        durationMinutes: 10,
        sequence: 3,
      },
      // Hour 2
      {
        unitId: COURSE_2_UNITS[1],
        lessonNumber: 1,
        title: 'Advertising Compliance Requirements',
        content: `Florida law and FREC rules establish specific requirements for real estate advertising. Compliance protects consumers and maintains professional standards.

Key advertising requirements include:

1. Brokerage identification - All advertising must include the name of the brokerage firm as registered with DBPR. This applies to all media including print, online, social media, and video.

2. Truthfulness - Advertisements must not contain false or misleading statements, including exaggerated claims about property features or market conditions.

3. License status - Advertisements should not suggest that a sales associate can act independently of their brokerage.

4. Property information - Facts about properties must be accurate and verifiable.

5. Equal opportunity - All advertising must comply with fair housing laws and avoid discriminatory language.

Common advertising violations include:
- Failing to include the brokerage name
- Using only a team name without the brokerage
- Making unsubstantiated claims (e.g., "#1 Agent" without verification)
- Using photos of properties that don't match the actual listing`,
        durationMinutes: 10,
        sequence: 1,
      },
      {
        unitId: COURSE_2_UNITS[1],
        lessonNumber: 2,
        title: 'Fair Housing in Advertising',
        content: `Fair housing laws prohibit discrimination in housing based on protected classes. These laws apply to all advertising, including:

- Print advertisements
- Online listings and websites
- Social media posts
- Video and virtual tours
- Email marketing
- Property signage

Protected classes under federal law include: race, color, religion, national origin, sex, familial status, and disability. Florida law adds additional protections.

Advertising best practices:
- Focus on property features, not the characteristics of potential buyers
- Avoid language that suggests preference for certain groups (e.g., "perfect for young professionals")
- Include the Equal Housing Opportunity logo or statement
- Avoid photos that suggest only certain types of people are welcome
- Be cautious with neighborhood descriptions that might be interpreted as code words

Even unintentional discriminatory language can result in complaints and investigations. When in doubt, focus strictly on the physical property and its features.`,
        durationMinutes: 10,
        sequence: 2,
      },
      {
        unitId: COURSE_2_UNITS[1],
        lessonNumber: 3,
        title: 'Digital Marketing and Social Media Standards',
        content: `Digital marketing and social media present unique challenges for real estate professionals. The same rules that apply to traditional advertising apply online, with some additional considerations.

Social media best practices:
1. Include your brokerage name in your profile and, where possible, in individual posts about listings
2. Be careful about testimonials - they must be genuine and accurately represent client experiences
3. Respond to comments and questions professionally
4. Avoid making promises or guarantees about market performance
5. Keep personal opinions separate from professional advice

Digital advertising considerations:
- Targeted advertising must not discriminate based on protected classes
- "Dark posts" (ads shown only to select audiences) must still comply with fair housing
- Retargeting and algorithms should be monitored for unintended discrimination
- Virtual tours and video walk-throughs must accurately represent the property

Record keeping:
- Keep copies of advertisements for your files
- Document the dates advertisements were published or posted
- Be prepared to produce advertising records if requested by DBPR`,
        durationMinutes: 10,
        sequence: 3,
      },
      // Hour 3
      {
        unitId: COURSE_2_UNITS[2],
        lessonNumber: 1,
        title: 'Commission Agreements and Disputes',
        content: `Commission disputes are a common source of conflict in real estate transactions. Understanding the legal framework and professional standards helps resolve these disputes appropriately.

Commission basics:
- Commissions are negotiable between the broker and client
- Commission agreements should be in writing
- The listing agreement typically specifies the commission rate and how it will be split if a cooperating broker is involved
- The buyer representation agreement may also address compensation

Common sources of disputes:
1. Multiple brokers claiming to be procuring cause
2. Disagreements over whether conditions for earning commission were met
3. Expired listings followed by subsequent sales
4. In-house transactions where both sides are represented by the same brokerage

Professional approaches to disputes:
- Document all activities and communications throughout the transaction
- Communicate promptly and professionally when issues arise
- Attempt direct resolution before escalating
- Consider mediation or arbitration through professional associations
- Avoid public disputes or negative statements about other professionals`,
        durationMinutes: 10,
        sequence: 1,
      },
      {
        unitId: COURSE_2_UNITS[2],
        lessonNumber: 2,
        title: 'Procuring Cause Principles',
        content: `Procuring cause determines which broker is entitled to a commission when more than one broker claims to have contributed to a sale.

The basic test: Which broker's efforts were the primary cause of the transaction? This is often called the "but for" test - "but for" this broker's efforts, would the transaction have occurred?

Factors considered in procuring cause determinations:
1. Who first introduced the buyer to the property?
2. Who maintained ongoing contact and communication?
3. Was there a break in the chain of events?
4. Who conducted negotiations leading to the contract?
5. What were the terms of any representation agreements?

Important principles:
- Initial introduction alone does not guarantee procuring cause
- A buyer working with multiple brokers creates risk of disputes
- Written representation agreements help clarify expectations
- Time gaps between broker contacts may break the causal chain
- The conduct and diligence of each broker matters

When disputes arise, professional arbitration through associations like NAR or local boards can provide faster, less expensive resolution than litigation.`,
        durationMinutes: 10,
        sequence: 2,
      },
      {
        unitId: COURSE_2_UNITS[2],
        lessonNumber: 3,
        title: 'Professional Cooperation and Relationships',
        content: `Successful real estate professionals build cooperative relationships with other practitioners, even when representing different parties.

Benefits of professional cooperation:
- Smoother transactions for clients
- Faster resolution of issues
- Positive reputation in the professional community
- Increased referrals from other agents
- Better outcomes in dispute resolution

Best practices for cooperation:
1. Respond promptly to inquiries from other agents
2. Present all offers fairly and completely
3. Communicate clearly about showing availability and feedback
4. Honor commitments for appointments and deadlines
5. Share information that helps the transaction (while protecting confidential client information)
6. Avoid disparaging other professionals to clients

Handling disagreements:
- Address issues directly with the other professional first
- Keep the tone professional and focus on facts
- Avoid involving clients in inter-agent disputes unless necessary
- Seek supervisor guidance if needed
- Use formal dispute resolution when direct communication fails

The real estate community is relatively small. Your reputation for professionalism will follow you throughout your career.`,
        durationMinutes: 10,
        sequence: 3,
      },
    ];

    // Course 3: Transaction Mastery Lessons (abbreviated - 2 lessons per unit)
    const course3Lessons = [
      // Hour 1
      {
        unitId: COURSE_3_UNITS[0],
        lessonNumber: 1,
        title: 'Understanding the FAR/BAR Contract',
        content: `The FAR/BAR contract is the standard form used by many Florida real estate professionals for residential transactions. FAR refers to Florida Realtors; BAR refers to The Florida Bar. Together, their representatives developed and maintain this standardized form.

The contract creates a binding agreement between buyer and seller and defines:
- Property identification and legal description
- Purchase price and financing terms
- Earnest money deposit amount and terms
- All contingencies and their deadlines
- Closing date and possession terms
- Allocation of costs (who pays what)
- Default remedies if either party breaches

Standardization provides consistency and clarity, reduces negotiation time on basic terms, and ensures important issues are addressed.`,
        durationMinutes: 15,
        sequence: 1,
      },
      {
        unitId: COURSE_3_UNITS[0],
        lessonNumber: 2,
        title: 'The Effective Date and Deadline Calculations',
        content: `The Effective Date is the date the contract becomes binding. It is typically defined as the date the last party signs and delivers the accepted contract.

Why it matters:
- Nearly all deadlines (inspection, appraisal, financing, title, closing) are calculated from the Effective Date
- Misunderstanding the Effective Date leads to missed deadlines and disputes

Example:
Offer signed by buyer: June 1
Counteroffer signed by seller: June 2
Buyer initials and delivers final changes: June 3
Effective Date: June 3

If the inspection period is 10 days, count from June 4 (day after Effective Date). The last day for inspection notice is June 13.

Always check whether deadlines are calendar days or business days. Calendar days include weekends and holidays. Business days typically exclude weekends and federal holidays.`,
        durationMinutes: 15,
        sequence: 2,
      },
      // Hour 2
      {
        unitId: COURSE_3_UNITS[1],
        lessonNumber: 1,
        title: 'The Life Cycle of a Contingency',
        content: `A contingency typically progresses through these stages:

1. Creation – Included in the contract at the time of offer and acceptance
2. Activation – Becomes effective on the Effective Date
3. Exercise or Performance – Buyer or seller takes required actions
4. Waiver – The protected party voluntarily gives up the right
5. Satisfaction – The condition is met
6. Lapse – Deadline passes without proper notice; right may be lost
7. Release/Termination – Party terminates contract due to unsatisfied contingency

Many contingencies (especially financing) require the buyer to use "good-faith" or "diligent" effort. This means:
- Submit complete loan applications promptly
- Provide requested documents to lender in a timely manner
- Avoid making major credit changes that jeopardize approval
- Cooperate fully with underwriting

If a buyer fails to act in good faith, the buyer may lose the right to rely on the contingency.`,
        durationMinutes: 15,
        sequence: 1,
      },
      {
        unitId: COURSE_3_UNITS[1],
        lessonNumber: 2,
        title: 'Financing and Appraisal Contingencies',
        content: `The financing contingency protects the buyer when purchase depends on obtaining acceptable loan financing.

Key components:
- Loan type (conventional, FHA, VA, etc.)
- Maximum interest rate acceptable to buyer
- Minimum term and maximum payment level
- Approval deadline

Clear to Close vs. Pre-Approval:
Only "clear to close" indicates the buyer is fully ready from the lender's perspective. Pre-approval is not final loan approval.

The appraisal contingency protects the buyer if the property's appraised value is less than the purchase price.

If the appraisal comes in low, options include:
- Seller reduces price to appraised value
- Buyer brings additional cash to closing
- Both compromise: partial price reduction plus added buyer cash
- Parties terminate under appraisal contingency`,
        durationMinutes: 15,
        sequence: 2,
      },
      // Hour 3
      {
        unitId: COURSE_3_UNITS[2],
        lessonNumber: 1,
        title: 'Purpose of Property Disclosures',
        content: `Property disclosures exist to:
- Inform buyers about known issues affecting value, safety, or desirability
- Reduce the risk of post-closing lawsuits for non-disclosure
- Encourage transparency and trust between parties

Sellers and licensees must not misrepresent or conceal known material defects.

A material defect is a condition that significantly affects the property's value, habitability, or desirability. Examples include:
- Chronic roof leaks
- Known structural movement or foundation failure
- Repeated flooding in living areas
- Electrical problems creating fire risk
- Mold affecting indoor air quality
- Termite damage compromising structural integrity

Minor cosmetic issues (small nail holes, worn paint) are usually not material.`,
        durationMinutes: 15,
        sequence: 1,
      },
      {
        unitId: COURSE_3_UNITS[2],
        lessonNumber: 2,
        title: 'Patent vs. Latent Defects and As-Is Contracts',
        content: `Patent defects: Problems that are reasonably observable upon ordinary inspection (e.g., damaged drywall, obvious cracks, missing fixtures).

Latent defects: Hidden defects not easily discoverable by a reasonably careful visual inspection (e.g., concealed water damage behind walls, foundation issues beneath flooring).

Both patent and latent known material defects must typically be disclosed.

An "as-is" contract means the seller is not agreeing to make repairs or improvements. It does NOT excuse the seller from disclosing known material defects.

Under "as-is":
- Buyer typically has the right to inspect
- Buyer can accept property, attempt to renegotiate, or terminate within the inspection period
- Seller must still disclose known issues

Misunderstanding "as-is" is a major risk. Some sellers mistakenly believe they can hide defects if the home is sold "as-is". This is incorrect and can lead to litigation.`,
        durationMinutes: 15,
        sequence: 2,
      },
      // Hour 4
      {
        unitId: COURSE_3_UNITS[3],
        lessonNumber: 1,
        title: 'Types of Inspections and Reports',
        content: `Buyers may order various inspections:
- General home inspection (overall structure and systems)
- Roof inspection
- Termite/pest inspection
- HVAC inspection
- Plumbing or sewer line inspection
- Septic system inspection
- Well water testing
- Pool/spa inspection
- Specialized mold or radon testing

Inspection reports typically include:
- Photos of observed issues
- Notes on safety concerns
- Assessments of remaining life for systems
- Recommendations for repair, replacement, or further evaluation

Buyers should review reports carefully and consult with inspectors before making repair requests.`,
        durationMinutes: 15,
        sequence: 1,
      },
      {
        unitId: COURSE_3_UNITS[3],
        lessonNumber: 2,
        title: 'Repair Requests and Negotiations',
        content: `Within the inspection period, buyer can:
- Accept property as-is and proceed
- Request seller repairs or credits
- Terminate (if contract allows)

Best practices for repair requests:
- Be specific about items to be repaired
- Focus on material defects and safety issues
- Provide supporting documentation from inspection reports

Seller response options:
- Agree to all requested repairs
- Agree to some repairs but not others
- Offer a credit at closing
- Decline all repairs

If repairs are agreed upon:
- Work must be completed by a specified date
- Work should be performed by properly licensed professionals
- Buyer should have the right to re-inspect repairs prior to closing`,
        durationMinutes: 15,
        sequence: 2,
      },
      // Hour 5
      {
        unitId: COURSE_3_UNITS[4],
        lessonNumber: 1,
        title: 'Loan Approval Stages',
        content: `Understanding the stages of loan approval:

Pre-Qualification – Informal review of buyer's income, debts, and credit to estimate borrowing capacity.

Pre-Approval – More detailed; lender may review documentation and run credit, but not a full underwrite.

Conditional Approval – Underwriter issues approval subject to conditions (e.g., appraisal, additional documents).

Clear to Close – All conditions are satisfied; loan is ready to fund.

Only clear to close indicates the buyer is fully ready from the lender's perspective.

Common underwriting conditions:
- Verification of employment and income
- Updated bank statements
- Satisfactory appraisal
- Completion of required repairs
- Acceptable title commitment`,
        durationMinutes: 15,
        sequence: 1,
      },
      {
        unitId: COURSE_3_UNITS[4],
        lessonNumber: 2,
        title: 'Appraisal Basics and Contingency Protection',
        content: `Appraisers estimate market value by examining:
- Recent comparable sales (comps)
- Adjustments for differences in size, age, upgrades, and location
- Market conditions and trends

The appraised value heavily influences the maximum loan amount.

An appraisal contingency allows the buyer to:
- Renegotiate price if appraisal is lower than purchase price
- Terminate contract and recover earnest money if seller will not adjust and buyer cannot bring additional cash

Without such a contingency (or with a waiver), buyer may have to proceed regardless of the appraisal result, subject to lender approval.

If the appraisal contingency deadline passes without action, the contingency is often deemed satisfied or waived.`,
        durationMinutes: 15,
        sequence: 2,
      },
      // Hour 6
      {
        unitId: COURSE_3_UNITS[5],
        lessonNumber: 1,
        title: 'Handling Appraisal Gaps',
        content: `When a property appraises low, consider:
- Buyer's available cash reserves
- Seller's willingness to adjust price
- Market conditions (e.g., multiple-offer situations)

Possible solutions:
1. Seller reduces price to appraised value
2. Buyer brings additional cash to closing to preserve the contract price
3. Both compromise: partial price reduction plus added buyer cash
4. Seller provides credit toward closing costs so buyer can redirect cash
5. Parties terminate under appraisal contingency (if applicable)
6. Request reconsideration of value if comparable sales support higher value`,
        durationMinutes: 15,
        sequence: 1,
      },
      {
        unitId: COURSE_3_UNITS[5],
        lessonNumber: 2,
        title: 'Loan Condition Management',
        content: `Some lender conditions are simple (e.g., updated pay stub). Others are complex (e.g., resolving large unexplained deposits).

Agents should:
- Encourage buyers to be proactive
- Ask lenders early if any conditions seem hard to meet
- Monitor whether conditions can reasonably be cleared by closing

If conditions cannot be met by closing date:
- Parties might agree to extend closing
- If extension isn't possible, termination under financing contingency may occur (if buyer acted in good faith)

Communication best practices:
- Request specific status updates from lenders
- Clarify conditions and deadlines
- Manage expectations and reduce surprises`,
        durationMinutes: 15,
        sequence: 2,
      },
      // Hour 7
      {
        unitId: COURSE_3_UNITS[6],
        lessonNumber: 1,
        title: 'What is Title and Title Examination',
        content: `"Title" refers to legal ownership of property and the associated rights. Clear title means ownership is not subject to undisclosed or unacceptable claims.

Title examiners review:
- Deeds in the chain of title
- Liens (mortgages, judgments, tax liens)
- Easements and rights of way
- Restrictions and covenants
- Court records for potential claims

The result is a title commitment, stating conditions for issuing a title insurance policy.

Common sections of a title commitment:
- Schedule A – Basic information: proposed insured, policy amount, current owner, legal description
- Schedule B-I – Requirements to be met before issuing policy
- Schedule B-II – Exceptions: Items that will not be covered by insurance`,
        durationMinutes: 15,
        sequence: 1,
      },
      {
        unitId: COURSE_3_UNITS[6],
        lessonNumber: 2,
        title: 'Common Title Defects and Resolution',
        content: `Examples of common title defects:
- Unreleased prior mortgage
- Judgment liens against seller
- Unpaid property taxes or assessments
- Easements that restrict use in unexpected ways
- Missing heirs or questions about prior deeds

Most defects can be cured by:
- Paying off liens
- Obtaining releases or satisfactions
- Correcting deed errors with corrective deeds
- Obtaining court orders or affidavits when necessary

If defects cannot be cured within a reasonable time and the contract allows, buyer may have the right to terminate.

Title insurance protects against losses from covered title defects discovered after closing.`,
        durationMinutes: 15,
        sequence: 2,
      },
      // Hour 8
      {
        unitId: COURSE_3_UNITS[7],
        lessonNumber: 1,
        title: 'Closing Day Procedures',
        content: `Closing is when ownership transfers and the transaction is finalized.

Before closing:
- Final walkthrough to verify property condition
- Review closing disclosure for accuracy
- Confirm wire instructions directly with the title company

At closing:
- Sign all required documents
- Provide identification as required
- Deliver certified funds or wire transfer

The closing agent (often a title company or attorney) will:
- Collect and disburse all funds
- Record the deed
- Issue title insurance policies
- Distribute closing documents to all parties`,
        durationMinutes: 15,
        sequence: 1,
      },
      {
        unitId: COURSE_3_UNITS[7],
        lessonNumber: 2,
        title: 'Post-Closing Responsibilities',
        content: `After closing, several tasks remain:

For the buyer:
- Transfer utilities to their name
- File homestead exemption if applicable
- Change locks and security codes
- Update address with relevant parties

For the seller:
- Cancel utilities and redirect mail
- Keep copies of closing documents
- Maintain records for tax purposes

For the agents:
- Provide copies of all documents to clients
- Ensure all commission payments are properly distributed
- Maintain transaction files as required by law
- Follow up with clients for feedback and referrals

Record retention:
Florida law requires brokers to maintain transaction records for at least five years. This includes contracts, disclosures, correspondence, and financial records.`,
        durationMinutes: 15,
        sequence: 2,
      },
    ];

    // Insert all lessons
    console.log('Inserting Course 1 lessons...');
    await db.insert(lessons).values(course1Lessons);
    console.log(`✅ Inserted ${course1Lessons.length} Course 1 lessons`);

    console.log('Inserting Course 2 lessons...');
    await db.insert(lessons).values(course2Lessons);
    console.log(`✅ Inserted ${course2Lessons.length} Course 2 lessons`);

    console.log('Inserting Course 3 lessons...');
    await db.insert(lessons).values(course3Lessons);
    console.log(`✅ Inserted ${course3Lessons.length} Course 3 lessons`);

    console.log('\n🎉 All CE lessons re-inserted successfully!');

  } catch (error) {
    console.error('❌ Error re-inserting lessons:', error);
    throw error;
  }
}

// Run if executed directly
import { fileURLToPath } from 'url';
const isMain = process.argv[1] && fileURLToPath(import.meta.url).includes(process.argv[1].replace(/\.ts$/, ''));

if (isMain) {
  reinsertCELessons()
    .then(() => {
      console.log('\n✅ Completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}
