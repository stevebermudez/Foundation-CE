import { db } from "./db";
import { lessons, questionBanks, bankQuestions } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";

const COURSE_ID = "04ed7248-fd4e-44e1-8b55-3ba7d204040b"; // FREC II
const UNIT_ID = "e43a2d90-441e-4f0a-9217-82a0534bfd91"; // Session 18

const segment1Content = `## SEGMENT 1: INTRODUCTION TO PROPERTY MANAGEMENT (40 minutes)

### The Role of the Property Manager

Property management encompasses the comprehensive oversight, operation, and administration of real estate assets on behalf of property owners. The property manager functions as a fiduciary agent for the owner, assuming responsibility for daily operations while striving to optimize the property's financial performance and preserve its long-term value. Florida law mandates that individuals who lease, rent, or manage real property for compensation on behalf of others must possess an active real estate license issued by the Florida Department of Business and Professional Regulation.

**Core Objectives of Professional Property Management:**

*Revenue Optimization:*
The property manager works to generate maximum rental income through strategic pricing decisions, maintaining high occupancy levels, and implementing value-added services. This requires ongoing market research, competitive analysis, and responsive adjustments to changing conditions.

*Asset Preservation:*
Protecting the owner's investment requires diligent maintenance, timely repairs, and strategic capital improvements. The manager must balance short-term costs against long-term property values to ensure the asset appreciates over time.

*Owner Goal Alignment:*
Different owners have varying priorities—some focus primarily on monthly cash flow, others on tax advantages, and still others on building equity for eventual sale. The effective property manager understands these objectives and tailors their management approach accordingly.

**Categories of Managed Properties:**

*Residential Real Estate:*
This category includes single-family rental homes, condominium units, townhouse communities, multi-family apartment buildings ranging from small duplexes to large complexes, manufactured housing communities, and short-term vacation rental properties.

*Commercial Real Estate:*
Commercial management covers professional office buildings, retail shopping centers and strip malls, industrial facilities including warehouses and distribution centers, and mixed-use developments combining multiple property types.

*Specialty Properties:*
Certain properties require specialized management expertise, including hospitality properties such as hotels and resorts, self-storage facilities, healthcare-related real estate, and age-restricted senior communities.

### The Property Management Agreement

The management agreement serves as the foundational contract establishing the professional relationship between the property owner and the property manager. This legally binding document defines each party's rights, responsibilities, and expectations.

**Critical Components of the Management Agreement:**

*Party Identification:*
The agreement must clearly identify all parties, including the legal name of the property owner (whether individual, partnership, corporation, or trust), the management company or licensed individual manager, and relevant contact information for both parties.

*Property Specification:*
A complete description of the managed property should include the legal description from public records, street address, property type, number of units or square footage, and identification of any common areas or amenities included in the management scope.

*Agreement Duration:*
The contract should specify the effective date, initial term length, and provisions for renewal or extension. Most management agreements run for one to three years with automatic renewal provisions unless either party provides termination notice.

*Scope of Manager Authority:*
The agreement should detail specific authorities granted to the manager:
- Marketing and promotional activities
- Applicant screening and tenant selection
- Lease preparation, negotiation, and execution
- Collection of rents and other charges
- Coordination of maintenance and repairs
- Preparation of financial statements and reports
- Response to emergencies and urgent situations

*Compensation Structure:*
Management fees typically follow one of several models:
- Percentage of collected gross rents (typically 8-12% for residential, 3-6% for commercial)
- Fixed monthly management fee regardless of occupancy
- Hybrid arrangements combining base fees with performance incentives
- Separate fees for leasing services, lease renewals, or project management

*Owner Obligations:*
The agreement should address what the owner must provide:
- Adequate property and liability insurance coverage
- Sufficient funds for repairs and operating expenses
- Compliance with applicable laws and regulations
- Timely response to manager communications

*Financial Protocols:*
Clear procedures should govern:
- Establishment and management of operating accounts
- Security deposit handling and accounting
- Maintenance reserve requirements
- Timing and method of owner disbursements

*Termination Procedures:*
The agreement should specify:
- Required notice period (commonly 30-90 days)
- Permitted grounds for early termination
- Procedures for transitioning to new management
- Requirements for final accounting and fund transfers

### Property Manager Functions and Duties

**Marketing and Tenant Acquisition:**

*Market Research and Pricing:*
The manager conducts thorough analysis of comparable rental properties to establish competitive yet profitable rental rates. This involves examining similar properties in terms of size, amenities, location, and condition, while also considering seasonal fluctuations and local economic factors.

*Promotional Activities:*
Effective marketing strategies incorporate multiple channels including online rental listing platforms, property signage, social media presence, and traditional advertising where appropriate. All marketing materials and activities must strictly comply with federal and state fair housing requirements.

*Property Presentations:*
The manager coordinates and conducts property showings for prospective tenants, presenting the property's features while providing honest answers to inquiries and disclosing any material facts that could influence the rental decision.

*Applicant Processing:*
A systematic screening process evaluates rental applications by verifying employment and income, reviewing credit history, contacting previous landlords, and checking references. Consistent application of objective screening criteria helps ensure fair treatment while identifying qualified tenants.

**Financial Administration:**

*Rent Administration:*
Establishing clear payment policies, processing incoming payments, enforcing deadlines and late fee provisions, and maintaining detailed payment records form the foundation of effective rent collection.

*Budget Development:*
Annual operating budgets project anticipated income from all sources and estimate expenses across all categories. Regular monitoring compares actual performance against budgeted projections and identifies variances requiring attention.

*Owner Reporting:*
Comprehensive financial statements keep owners informed about their investment:
- Monthly profit and loss statements
- Occupancy reports and rent rolls
- Aging reports for outstanding balances
- Cash flow analysis
- Annual summaries supporting tax preparation

*Cost Management:*
Negotiating favorable terms with service providers, soliciting competitive bids for significant expenditures, and monitoring expenses against industry benchmarks help control operating costs while maintaining property standards.

**Operations and Maintenance:**

*Scheduled Maintenance:*
Proactive maintenance programs address routine service needs before they develop into costly problems. Regular servicing of mechanical systems, seasonal property preparations, and scheduled inspections extend equipment life and prevent failures.

*Repair Coordination:*
When problems arise, the manager evaluates urgency, dispatches appropriate contractors, monitors work quality, and follows up with tenants to confirm satisfaction. Emergency procedures ensure rapid response to urgent situations.

*Property Monitoring:*
Regular inspections of individual units and common areas identify maintenance needs, verify lease compliance, and document property conditions. Inspection findings guide maintenance priorities and budget planning.

*Contractor Oversight:*
Managing relationships with plumbers, electricians, HVAC technicians, landscapers, and other service providers requires verifying credentials, negotiating pricing, monitoring performance, and addressing quality concerns.`;

const segment2Content = `## SEGMENT 2: FLORIDA LANDLORD-TENANT LAW (50 minutes)

### Florida Residential Landlord and Tenant Act Overview

Chapter 83, Part II of the Florida Statutes establishes the legal framework governing residential rental relationships in Florida. This comprehensive legislation defines the rights and responsibilities of both landlords and tenants, creating standards for rental housing transactions throughout the state.

**Scope of Coverage:**

The statute applies to rental arrangements for residential dwelling units including:
- Detached houses and attached townhomes
- Apartments and condominium units rented to tenants
- Manufactured homes when the home rather than the lot is rented
- Individual rooms rented within a larger residence

Certain occupancies fall outside the statute's coverage:
- Short-term hotel and motel stays
- Institutional residence arrangements
- Housing provided to members of fraternal or social organizations
- Lodging provided to employees as an employment benefit
- Occupancy pursuant to a purchase contract

### Landlord Duties and Responsibilities

**Habitability and Maintenance Obligations:**

Florida law imposes specific maintenance duties on residential landlords:

*Building Code Compliance:*
The landlord must maintain the property in compliance with applicable building, housing, and health codes. Any code violations that materially affect the health or safety of occupants must be promptly corrected.

*Structural Integrity:*
The landlord bears responsibility for maintaining the structural components of the building including the roof, exterior walls, foundation, floors, ceilings, windows, and exterior doors in sound condition.

*Plumbing Systems:*
All plumbing fixtures and systems must be maintained in reasonable working order, including pipes, drains, toilets, sinks, and water heaters.

*Climate Control:*
Where heating or air conditioning systems are provided as part of the rental, the landlord must maintain these systems in functional condition. Hot water systems must similarly be kept operational.

*Common Area Maintenance:*
In multi-unit properties, the landlord must keep shared spaces clean, safe, and properly maintained. This includes hallways, stairwells, laundry facilities, parking areas, and recreational amenities.

*Waste Management:*
For buildings with multiple units, the landlord must arrange for garbage collection services and provide suitable containers for refuse storage.

*Appliance Maintenance:*
Any appliances provided by the landlord—refrigerators, stoves, dishwashers, and similar equipment—must be maintained in reasonable working condition throughout the tenancy.

*Security Features:*
The landlord must provide and maintain functioning locks on exterior doors and windows, along with keys or other access devices as appropriate.

*Environmental Disclosures:*
Properties constructed before 1978 require disclosure of known lead-based paint hazards and provision of educational materials regarding lead paint risks.

**Prohibited Landlord Conduct:**

Certain landlord actions are expressly prohibited under Florida law:

Landlords may not interrupt essential services—electricity, gas, water, or heat—as a means of pressuring tenants or forcing them to vacate. Deliberate service interruptions expose landlords to significant liability.

Self-help eviction tactics are strictly forbidden. Landlords cannot change locks, remove doors or windows, take tenant belongings, or engage in other actions designed to exclude a tenant from the premises without going through proper legal eviction procedures.

Any attempt to terminate utility services to force tenant departure constitutes illegal conduct that may result in tenant remedies including damages.

### Tenant Duties and Responsibilities

**Statutory Tenant Obligations:**

Florida law imposes corresponding duties on residential tenants:

*Regulatory Compliance:*
Tenants must comply with applicable building, housing, and health codes affecting their use of the premises.

*Sanitation:*
Maintaining the dwelling in a clean and sanitary condition is the tenant's responsibility. This includes regular cleaning and avoiding conditions that could attract pests or create health hazards.

*Waste Disposal:*
Tenants must remove garbage from the unit and dispose of it properly in designated receptacles.

*Proper Use of Systems:*
Electrical, plumbing, heating, cooling, and other building systems must be used appropriately and reasonably.

*Property Preservation:*
Tenants may not damage, deface, or remove any portion of the premises. They must also prevent guests from causing damage.

*Neighbor Relations:*
Tenants must conduct themselves in ways that do not disturb other residents' peaceful enjoyment of their homes.

*Rules Compliance:*
Reasonable rules and regulations established by the landlord and communicated to the tenant must be followed.

*Authorized Use:*
The property may only be used for its intended purpose as specified in the lease agreement.

### Security Deposit Regulations

Florida imposes detailed requirements for the handling of tenant security deposits that property managers must carefully observe.

**Deposit Amount:**

Unlike some states, Florida does not cap the amount of security deposit a landlord may require. Market conditions and competitive factors generally influence deposit amounts, with most landlords collecting deposits equal to one or two months' rent.

**Deposit Custody Options:**

Landlords must hold security deposits using one of three prescribed methods:

*Non-Interest Account:*
The deposit may be held in a separate non-interest-bearing account maintained at a banking institution located in Florida.

*Interest-Bearing Account:*
Alternatively, the deposit may be placed in an interest-bearing account at a Florida financial institution. Under this option, the landlord must pay the tenant either the actual interest earned or five percent simple annual interest, paid either annually or upon lease termination.

*Surety Bond:*
The landlord may instead post a surety bond with the circuit court clerk in an amount equal to total security deposits held plus an additional five hundred dollars.

**Disclosure Requirements:**

Within thirty days after receiving a security deposit, the landlord must provide written notice to the tenant disclosing:
- The name and street address of the banking institution holding the deposit
- Whether the account bears interest or not
- If interest-bearing, the applicable interest rate

Failure to provide this notice does not forfeit the deposit but may affect the landlord's ability to impose claims.

**Deposit Return Procedures:**

*When No Claim Exists:*
If the landlord intends no claim against the deposit, the full amount must be returned within fifteen days after the tenant vacates and surrenders possession.

*When Imposing a Claim:*
If the landlord intends to retain any portion of the deposit, written notice must be sent within thirty days of the tenant vacating. This notice must:
- Be sent by certified mail to the tenant's last known address
- State the landlord's intention to impose a claim
- Describe each claimed item with specificity
- State the amount claimed for each item
- Inform the tenant of their right to object within fifteen days

If the tenant fails to object within fifteen days, the landlord may deduct the claimed amounts. If the tenant timely objects, the landlord must initiate legal proceedings within forty-five days or forfeit the claim.

**Allowable Deductions:**

Legitimate deductions from security deposits include:
- Rent remaining unpaid at lease termination
- Physical damage exceeding ordinary wear and deterioration
- Cleaning expenses when the tenant failed to leave the unit in reasonably clean condition
- Costs specifically authorized by lease provisions
- Amounts owed for other lease breaches causing quantifiable damages

**Non-Compliance Consequences:**

Landlords who fail to return deposits or provide required notices within specified timeframes forfeit their right to impose claims against the deposit. Courts may award the tenant the full deposit amount plus court costs and reasonable attorney fees.`;

const segment3Content = `## SEGMENT 3: LEASE AGREEMENTS AND TYPES OF TENANCIES (55 minutes)

### Leasehold Estate Classifications

Property managers must understand the distinct categories of landlord-tenant relationships recognized under Florida law.

**Estate for Years:**

This tenancy type has definite commencement and termination dates specified in the lease agreement. Despite its name, the term can be any specific duration—days, weeks, months, or years.

*Defining Features:*
- Specific beginning and ending dates stated in the lease
- Terminates automatically when the specified period ends
- Neither party required to give notice of termination
- Rent terms fixed for duration unless lease specifies adjustments
- Continues despite death of either landlord or tenant

*Practical Example:*
A lease commencing March 1, 2025 and ending February 28, 2026 constitutes an estate for years. When February 28 arrives, the tenancy terminates without any notice requirement.

**Periodic Estate:**

This tenancy continues for successive periods automatically until either party provides proper notice of termination.

*Defining Features:*
- No fixed termination date specified
- Automatically renews for another period unless terminated
- Requires advance notice to end the tenancy
- Most commonly structured as month-to-month
- Can also be week-to-week, quarter-to-quarter, or year-to-year

*Florida Notice Requirements:*
- Week-to-week tenancy: Seven days advance notice
- Month-to-month tenancy: Fifteen days advance notice
- Quarter-to-quarter tenancy: Thirty days advance notice
- Year-to-year tenancy: Sixty days advance notice

**Estate at Will:**

This tenancy lacks any definite duration and exists only so long as both parties desire its continuation.

*Defining Features:*
- No specified term or duration
- Either party may terminate with reasonable notice
- Often arises informally when possession is permitted without a written lease
- Terminates automatically upon death of either party
- Ends automatically if property ownership transfers

**Estate at Sufferance:**

This occurs when a tenant wrongfully remains in possession after their legal right to occupy has ended.

*Defining Features:*
- Tenant has no legal right to continue occupying
- Represents the most limited form of tenancy interest
- Landlord may pursue immediate eviction
- Alternatively, landlord may accept rent and create a periodic tenancy
- Holdover tenant potentially liable for increased rent or damages

### Commercial Lease Structures

**Gross Lease Structure:**

Under a gross lease arrangement, the tenant pays a fixed periodic rent while the landlord assumes responsibility for paying all property operating expenses.

*Tenant Perspective:*
- Occupancy costs are predictable and budgetable
- No exposure to variable operating expense increases
- Simplified accounting with single rent payment

*Landlord Perspective:*
- Marketing simplified with straightforward rent structure
- Maintains direct control over property operations
- Bears risk of operating cost increases
- Benefits if expenses decrease below projections

**Net Lease Variations:**

Net leases shift some or all operating expenses from landlord to tenant in addition to base rent.

*Single Net Lease:*
Tenant pays base rent plus property taxes only. Landlord remains responsible for insurance and maintenance costs.

*Double Net Lease:*
Tenant pays base rent plus property taxes and building insurance. Landlord retains maintenance responsibilities.

*Triple Net Lease:*
Tenant pays base rent plus property taxes, insurance, and maintenance expenses. Landlord typically responsible only for structural components and roof. This structure is common for single-tenant commercial properties.

**Percentage Lease Structure:**

Retail properties frequently utilize percentage leases tying a portion of rent to the tenant's business performance.

*Key Components:*
- Base rent providing minimum guaranteed income
- Breakpoint establishing the sales threshold triggering percentage rent
- Percentage rate applied to sales exceeding the breakpoint
- Precise definition of qualifying gross sales

*Calculation Example:*
Monthly base rent: $3,500
Annual breakpoint: $600,000
Percentage rate: 6% of sales above breakpoint
Tenant's annual sales: $750,000
Percentage rent calculation: ($750,000 - $600,000) × 6% = $9,000 additional annual rent

**Index-Adjusted Lease:**

These leases tie periodic rent adjustments to published economic indicators.

*Common Indices:*
- Consumer Price Index (CPI) - most frequently used
- Regional cost-of-living adjustments
- Commercial property rental indices

*Adjustment Mechanisms:*
- Direct percentage matching to index change
- Capped adjustments limiting increases
- Stepped increases at specified intervals

**Ground Lease Arrangements:**

Long-term ground leases involve rental of land upon which the tenant constructs improvements.

*Typical Terms:*
- Duration of fifty to ninety-nine years
- Tenant finances and owns improvements during lease term
- Improvements may revert to landlord at lease expiration
- Often used for major commercial developments

### Assignment and Subletting

**Assignment Defined:**

An assignment transfers the tenant's entire remaining lease interest to another party. The new tenant (assignee) steps into the original tenant's position with respect to the landlord.

*Key Characteristics:*
- Complete transfer of remaining term
- Assignee deals directly with landlord
- Original tenant may retain secondary liability
- Requires landlord consent unless lease provides otherwise

**Sublease Defined:**

A sublease transfers less than the tenant's entire interest—either for a shorter period or for a portion of the space.

*Key Characteristics:*
- Original tenant retains some interest
- Subtenant pays rent to original tenant
- Original tenant remains primarily liable to landlord
- Creates layered landlord-tenant relationships`;

const segment4Content = `## SEGMENT 4: TENANT RELATIONS, FINANCIAL MANAGEMENT, AND EVICTIONS (55 minutes)

### Fair Housing Compliance in Property Management

Property managers must ensure strict compliance with federal and state fair housing laws throughout all phases of the rental process.

**Federal Protected Classes:**

The Fair Housing Act prohibits discrimination based on:
- Race
- Color
- Religion
- National origin
- Sex (including sexual orientation and gender identity)
- Familial status (families with children under 18)
- Disability (physical or mental)

**Reasonable Accommodations:**

Property managers must provide reasonable accommodations for disabled tenants when requested:
- Policy modifications to accommodate disability needs
- Allowing assistance animals despite pet restrictions
- Reserved accessible parking spaces
- Modified rent payment schedules when disability-related

**Reasonable Modifications:**

Tenants with disabilities may request permission to make physical modifications:
- Installation of grab bars and ramps
- Widening doorways for wheelchair access
- Lowering countertops and switches
- Tenant typically bears modification costs
- Landlord may require restoration upon departure

### Rent Collection and Delinquency Management

**Establishing Collection Procedures:**

Effective rent collection begins with clear policies:
- Due date and grace period clearly stated in lease
- Acceptable payment methods defined
- Late fee amounts and timing specified
- Returned payment charges disclosed
- Payment application order established

**Handling Delinquencies:**

When tenants fall behind on rent:

*Initial Response:*
- Prompt contact after payment due date passes
- Document all communications
- Offer payment plan options when appropriate
- Assess tenant's payment history and circumstances

*Three-Day Notice to Pay or Vacate:*
Florida's statutory notice for rent delinquency:
- Must be served when rent remains unpaid
- Excludes Saturday, Sunday, and legal holidays
- Specifies amount due with reasonable specificity
- Demands payment OR surrender of premises
- Does not require court involvement initially

### Property Financial Management

**Operating Budget Development:**

Comprehensive budgets project annual performance:

*Income Projections:*
- Gross potential rental income
- Vacancy and collection loss allowance
- Other income sources (parking, laundry, fees)
- Effective gross income calculation

*Expense Categories:*
- Fixed expenses (taxes, insurance, debt service)
- Variable expenses (utilities, repairs, supplies)
- Administrative costs (management, legal, accounting)
- Reserve contributions for capital items

**Key Performance Metrics:**

*Occupancy Rate:*
Occupied Units ÷ Total Units = Occupancy Rate
Example: 92 occupied ÷ 100 units = 92% occupancy

*Vacancy Rate:*
Vacant Units ÷ Total Units = Vacancy Rate
Example: 8 vacant ÷ 100 units = 8% vacancy

*Collection Rate:*
Rent Collected ÷ Rent Charged = Collection Rate
Example: $95,000 collected ÷ $100,000 charged = 95% collection

*Net Operating Income:*
Effective Gross Income - Operating Expenses = NOI
Example: $500,000 EGI - $200,000 expenses = $300,000 NOI

*Operating Expense Ratio:*
Operating Expenses ÷ Effective Gross Income = OER
Example: $200,000 ÷ $500,000 = 40% OER

### The Florida Eviction Process

When a tenant violates lease terms or fails to pay rent, the landlord must follow Florida's statutory eviction procedures.

**Notice Requirements:**

*Three-Day Notice (Nonpayment):*
Required for rent delinquency:
- States amount due
- Demands payment OR surrender
- Excludes weekends and holidays from counting
- Must be properly served

*Seven-Day Notice (Lease Violation):*
For violations other than nonpayment:
- Describes the violation specifically
- Demands cure within seven days OR
- Demands surrender if violation is incurable

**Eviction Lawsuit Process:**

*Step One - Proper Notice:*
Serve appropriate statutory notice before filing lawsuit.

*Step Two - Wait for Expiration:*
Allow full notice period to pass without compliance.

*Step Three - Court Filing:*
If tenant fails to comply with notice, file eviction complaint in county court:
- Include copy of lease agreement
- Attach served notice with proof of service
- Pay required filing fees
- Request damages if applicable

*Step Four - Defendant Service:*
Court arranges service of summons and complaint on tenant:
- Tenant has five business days to respond (excluding weekends and holidays)
- Failure to respond permits default judgment request

*Step Five - Court Proceedings:*
If tenant contests eviction:
- Hearing scheduled before judge
- Both parties present evidence and arguments
- Judge determines whether eviction warranted
- Judgment entered for prevailing party

*Step Six - Possession Recovery:*
Following judgment for landlord:
- Request writ of possession from clerk
- Sheriff posts writ giving tenant twenty-four hours to vacate
- Sheriff returns to remove tenant and belongings if necessary

**Critical Eviction Rules:**

*Self-Help Prohibition:*
Landlords absolutely may not:
- Change locks to exclude tenant
- Remove tenant belongings from premises
- Disconnect utility services
- Engage in harassment or intimidation tactics

Such actions expose landlords to significant liability and potential tenant damage awards.

*Retaliation Prohibition:*
Eviction may not be pursued in retaliation for tenant exercise of legal rights:
- Complaints to housing authorities or code enforcement
- Participation in tenant organizations
- Exercise of rights guaranteed under the lease or law

*Documentation Importance:*
Maintain thorough records throughout:
- Copies of all notices with proof of service
- Complete payment history
- Documentation of lease violations
- Records of all tenant communications
- Court filings and documents

### SESSION 18 SUMMARY AND KEY TAKEAWAYS

**Essential Points:**

1. **Property Manager Function:** Acts as owner's fiduciary agent to optimize income, preserve asset value, and achieve owner's investment objectives

2. **Licensing Requirement:** Florida requires real estate licensure for those who lease, rent, or manage property for others for compensation

3. **Management Agreement:** Must specify duties, authority, compensation, term, and termination provisions

4. **Landlord Duties:** Maintain habitable conditions; comply with codes; keep systems operational; provide security features

5. **Tenant Duties:** Pay rent timely; maintain cleanliness; avoid damage; follow rules; use property appropriately

6. **Security Deposits:** Hold in Florida bank; disclose within 30 days; return within 15 days if no claim; provide itemized notice within 30 days if claiming

7. **Tenancy Types:** Estate for Years (fixed term), Periodic Estate (auto-renewing), Estate at Will (no fixed term), Estate at Sufferance (wrongful holdover)

8. **Lease Structures:** Gross (landlord pays expenses), Net (tenant pays some expenses), Percentage (retail sales-based), Index (tied to economic indicators)

9. **Fair Housing:** Cannot discriminate based on race, color, religion, national origin, sex, familial status, or disability

10. **Eviction Process:** Serve proper notice; allow cure period; file court action; obtain judgment; execute writ of possession

**Key Formulas:**

- **Occupancy Rate** = Occupied Units ÷ Total Units
- **Vacancy Rate** = Vacant Units ÷ Total Units
- **Collection Rate** = Rent Collected ÷ Rent Charged
- **Net Operating Income** = Effective Gross Income - Operating Expenses
- **Operating Expense Ratio** = Operating Expenses ÷ Effective Gross Income
- **Percentage Rent** = (Gross Sales - Breakpoint) × Percentage Rate`;

// Quiz 18-1 Questions
const quiz181Questions = [
  {
    questionText: "In Florida, a person who leases property on behalf of others for compensation must possess:",
    options: ["A property management certification", "An active real estate license", "A community association manager license", "No license is required"],
    correctAnswer: 1,
    explanation: "Florida statutes require that individuals who lease, rent, or manage real property for others for compensation hold a valid real estate license. This requirement ensures that property managers have the education and oversight necessary to protect property owners and tenants."
  },
  {
    questionText: "Which document establishes the relationship between a property owner and the property manager?",
    options: ["Listing agreement", "Lease agreement", "Management agreement", "Purchase contract"],
    correctAnswer: 2,
    explanation: "The management agreement is the contract that creates the agency relationship between the property owner and the property manager. This document specifies the manager's duties, compensation, authority limits, and other essential terms."
  },
  {
    questionText: "A property manager's primary objectives include all of the following EXCEPT:",
    options: ["Generating maximum rental income", "Preserving property value", "Guaranteeing the owner against all losses", "Achieving the owner's investment goals"],
    correctAnswer: 2,
    explanation: "Property managers cannot and should not guarantee owners against all losses, as many factors affecting property performance lie beyond management control. The manager's proper objectives include maximizing income, preserving value, and working to achieve the owner's specific goals."
  },
  {
    questionText: "Management fees for residential properties typically range from:",
    options: ["1% to 3% of gross rent", "8% to 12% of gross rent", "20% to 25% of gross rent", "15% to 18% of gross rent"],
    correctAnswer: 1,
    explanation: "Residential property management fees typically fall within the 8-12% range, though actual fees vary based on property type, size, location, and services provided. Commercial properties typically command lower percentages (3-6%) due to larger rent amounts."
  },
  {
    questionText: "Under Florida law, landlords must maintain which of the following in reasonable working condition?",
    options: ["Swimming pool filtration", "Plumbing systems", "Landscaping irrigation", "Decorative lighting"],
    correctAnswer: 1,
    explanation: "Florida's landlord-tenant statute specifically requires landlords to maintain plumbing in reasonable working condition. This represents a core habitability requirement."
  },
  {
    questionText: "Which action constitutes illegal self-help eviction in Florida?",
    options: ["Serving a three-day notice", "Changing locks while tenant is away", "Filing an eviction lawsuit", "Charging late fees"],
    correctAnswer: 1,
    explanation: "Changing locks to exclude a tenant constitutes illegal self-help eviction under Florida law. Landlords must pursue formal legal eviction procedures through the courts rather than taking matters into their own hands."
  },
  {
    questionText: "Security deposits in Florida must be held in:",
    options: ["Any convenient bank account", "A Florida banking institution", "A safe deposit box", "The manager's business account"],
    correctAnswer: 1,
    explanation: "Florida law specifically requires that security deposits be held in a banking institution located in Florida. The landlord may choose between non-interest-bearing accounts, interest-bearing accounts, or surety bonds."
  },
  {
    questionText: "When a landlord makes no claim against a security deposit, it must be returned within:",
    options: ["7 days", "15 days", "30 days", "45 days"],
    correctAnswer: 1,
    explanation: "When the landlord intends no claim against the security deposit, the full amount must be returned within fifteen days after the tenant vacates. Missing this deadline can result in forfeiture of the landlord's right to later impose claims."
  },
  {
    questionText: "If a landlord intends to claim against a security deposit, notice must be sent within:",
    options: ["7 days", "15 days", "30 days", "45 days"],
    correctAnswer: 2,
    explanation: "When claiming amounts from the security deposit, the landlord has thirty days from the tenant's departure to send itemized written notice by certified mail. This notice must describe each claimed item specifically."
  },
  {
    questionText: "Which is a statutory obligation of tenants under Florida law?",
    options: ["Making structural repairs", "Painting interior walls annually", "Maintaining the unit in clean condition", "Replacing worn appliances"],
    correctAnswer: 2,
    explanation: "Florida statute specifically obligates tenants to keep their dwelling unit in a clean and sanitary condition. Structural repairs and appliance replacement are typically landlord responsibilities."
  },
  {
    questionText: "Landlords must disclose security deposit account information within how many days of receiving the deposit?",
    options: ["7 days", "15 days", "30 days", "60 days"],
    correctAnswer: 2,
    explanation: "Landlords must provide written disclosure of security deposit account information within thirty days of receiving the deposit. This disclosure must include the depository's name and address and whether the account earns interest."
  },
  {
    questionText: "After receiving notice of a landlord's security deposit claim, a tenant has how many days to object?",
    options: ["7 days", "15 days", "30 days", "45 days"],
    correctAnswer: 1,
    explanation: "Upon receiving the landlord's notice of intent to claim against the security deposit, the tenant has fifteen days to object in writing. If the tenant fails to timely object, the landlord may deduct the claimed amounts."
  },
  {
    questionText: "Reasonable advance notice before entering an occupied rental unit in Florida is presumed to be:",
    options: ["6 hours", "12 hours", "24 hours", "48 hours"],
    correctAnswer: 1,
    explanation: "Florida law provides that twelve hours constitutes presumptively reasonable advance notice before landlord entry into an occupied rental unit. The notice should specify the date, approximate time, and purpose of entry."
  },
  {
    questionText: "A landlord who interrupts essential services to force a tenant to vacate has committed:",
    options: ["A permitted collection tactic", "An illegal self-help eviction", "A lease modification", "An acceleration of rent"],
    correctAnswer: 1,
    explanation: "Interrupting essential services—electricity, gas, water, or heat—to force a tenant to leave constitutes prohibited self-help eviction under Florida law. Service interruption exposes landlords to tenant lawsuits and potential damages."
  },
  {
    questionText: "The management agreement should specify all of the following EXCEPT:",
    options: ["Manager's compensation", "Property description", "Names of future tenants", "Term of the agreement"],
    correctAnswer: 2,
    explanation: "Management agreements establish the terms between owner and manager but cannot identify future tenants who haven't yet applied or been selected. Tenant identification occurs later through the leasing process."
  }
];

// Quiz 18-2 Questions
const quiz182Questions = [
  {
    questionText: "A tenancy with specified commencement and termination dates is called:",
    options: ["Estate at will", "Estate for years", "Periodic estate", "Estate at sufferance"],
    correctAnswer: 1,
    explanation: "An estate for years has definite, specified beginning and ending dates. The key characteristic is the definite termination date, after which the tenancy ends automatically without requiring notice from either party."
  },
  {
    questionText: "A month-to-month rental arrangement is classified as:",
    options: ["Estate for years", "Estate at will", "Periodic estate", "Estate at sufferance"],
    correctAnswer: 2,
    explanation: "A month-to-month tenancy exemplifies the periodic estate, which automatically renews for successive periods until either party provides proper termination notice."
  },
  {
    questionText: "Florida law requires how many days notice to terminate a month-to-month tenancy?",
    options: ["7 days", "15 days", "30 days", "60 days"],
    correctAnswer: 1,
    explanation: "Florida statute specifies that month-to-month tenancies require fifteen days advance notice for termination. Week-to-week requires seven days, while year-to-year requires sixty days."
  },
  {
    questionText: "A tenant remaining after lease expiration without landlord consent has:",
    options: ["Estate for years", "Estate at will", "Periodic estate", "Estate at sufferance"],
    correctAnswer: 3,
    explanation: "When a tenant remains in possession after lease expiration without the landlord's permission, an estate at sufferance results. This represents the most limited form of tenancy interest."
  },
  {
    questionText: "In a gross lease, who pays operating expenses?",
    options: ["The tenant", "The landlord", "Expenses are shared equally", "A third-party management company"],
    correctAnswer: 1,
    explanation: "Under a gross lease structure, the tenant pays a fixed rent amount while the landlord assumes responsibility for paying all operating expenses including property taxes, insurance, utilities, and maintenance."
  },
  {
    questionText: "Under a triple net lease, the tenant pays rent plus:",
    options: ["Property taxes only", "Property taxes and insurance only", "Property taxes, insurance, and maintenance", "Three months rent in advance"],
    correctAnswer: 2,
    explanation: "A triple net (NNN) lease requires the tenant to pay base rent plus property taxes, insurance premiums, and maintenance costs. This shifts virtually all operating expenses to the tenant."
  },
  {
    questionText: "Percentage leases are most commonly used for:",
    options: ["Residential apartment units", "Industrial warehouse space", "Retail commercial properties", "Professional office buildings"],
    correctAnswer: 2,
    explanation: "Percentage leases are standard in retail settings where landlords share in tenant business success. The structure typically combines base rent with additional rent calculated as a percentage of gross sales."
  },
  {
    questionText: "The sales threshold at which percentage rent begins is called the:",
    options: ["Base rent", "Breakpoint", "Overage", "Escalation"],
    correctAnswer: 1,
    explanation: "The breakpoint is the gross sales level at which percentage rent begins. Sales below the breakpoint incur only base rent; sales above trigger additional percentage rent."
  },
  {
    questionText: "An assignment of a lease involves:",
    options: ["Transfer of a portion of the space", "Transfer for less than the remaining term", "Transfer of the entire remaining interest", "Return of the security deposit"],
    correctAnswer: 2,
    explanation: "An assignment transfers the tenant's complete remaining lease interest to another party. The assignee steps into the original tenant's position and deals directly with the landlord."
  },
  {
    questionText: "In a sublease arrangement:",
    options: ["The original tenant is fully released", "The subtenant pays rent directly to the landlord", "The original tenant retains some interest", "Landlord consent is never required"],
    correctAnswer: 2,
    explanation: "In a sublease, the original tenant transfers only a portion of their interest while retaining some rights. The subtenant pays rent to the original tenant, and the original tenant remains primarily liable."
  },
  {
    questionText: "What notice is required to terminate a year-to-year tenancy in Florida?",
    options: ["15 days", "30 days", "60 days", "90 days"],
    correctAnswer: 2,
    explanation: "Florida law requires sixty days advance notice to terminate a year-to-year periodic tenancy. This longer notice period reflects the more substantial nature of annual arrangements."
  },
  {
    questionText: "An index lease ties rent adjustments to:",
    options: ["Property value changes", "An economic indicator like CPI", "The landlord's operating expenses", "Current interest rates"],
    correctAnswer: 1,
    explanation: "Index leases tie rent adjustments to published economic indices, most commonly the Consumer Price Index. This approach ensures rent keeps pace with inflation while providing predictability."
  },
  {
    questionText: "A ground lease typically involves:",
    options: ["Below-grade parking structures only", "Land only with tenant-constructed improvements", "Month-to-month arrangements", "Government-owned properties exclusively"],
    correctAnswer: 1,
    explanation: "Ground leases involve long-term rental of land upon which the tenant constructs buildings or other improvements at their expense. Typical terms span fifty to ninety-nine years."
  },
  {
    questionText: "The party granting a lease is called the:",
    options: ["Lessee", "Lessor", "Assignee", "Subtenant"],
    correctAnswer: 1,
    explanation: "The lessor is the party granting the lease—typically the property owner or their authorized representative. The lessee is the party receiving the leasehold interest (the tenant)."
  },
  {
    questionText: "Which lease type provides the tenant with the most predictable occupancy costs?",
    options: ["Triple net lease", "Gross lease", "Percentage lease", "Index lease"],
    correctAnswer: 1,
    explanation: "Gross leases provide tenants with the most predictable occupancy costs because the tenant pays a fixed rent regardless of how operating expenses fluctuate."
  }
];

// Quiz 18-3 Questions
const quiz183Questions = [
  {
    questionText: "Federal fair housing law prohibits discrimination based on all of the following EXCEPT:",
    options: ["Race", "Religion", "Source of income", "Familial status"],
    correctAnswer: 2,
    explanation: "The federal Fair Housing Act protects seven classes: race, color, religion, national origin, sex, familial status, and disability. Source of income is not a federally protected class, though some local jurisdictions have added income source protections."
  },
  {
    questionText: "A reasonable accommodation for a disabled tenant might include:",
    options: ["Waiving all rent payments", "Permitting an assistance animal despite pet restrictions", "Providing free utilities", "Guaranteeing lease renewal"],
    correctAnswer: 1,
    explanation: "Allowing an assistance animal despite pet restrictions is a classic example of reasonable accommodation. Landlords must modify policies when necessary to afford disabled tenants equal housing opportunity."
  },
  {
    questionText: "The Florida three-day notice is used for:",
    options: ["All lease violations", "Non-payment of rent specifically", "Routine inspections", "Month-to-month terminations"],
    correctAnswer: 1,
    explanation: "The three-day notice specifically addresses rent delinquency. It demands payment OR surrender of the premises. Other lease violations typically require a seven-day notice."
  },
  {
    questionText: "The seven-day notice in Florida is used for:",
    options: ["Rent delinquency", "Lease violations other than non-payment", "Lease renewals", "Security deposit claims"],
    correctAnswer: 1,
    explanation: "The seven-day notice addresses lease violations other than non-payment of rent. It describes the violation and demands cure within seven days or surrender if incurable."
  },
  {
    questionText: "Which action constitutes illegal self-help eviction?",
    options: ["Filing an eviction lawsuit", "Posting a three-day notice", "Removing the tenant's belongings from the unit", "Requesting a writ of possession"],
    correctAnswer: 2,
    explanation: "Removing tenant belongings is illegal self-help eviction. Landlords must pursue formal court eviction procedures. Filing lawsuits, serving notices, and requesting writs are all legitimate legal steps."
  },
  {
    questionText: "After the court issues a writ of possession, tenants have how long to vacate?",
    options: ["Immediately upon posting", "24 hours", "72 hours", "7 days"],
    correctAnswer: 1,
    explanation: "Once the sheriff posts the writ of possession, the tenant has twenty-four hours to vacate. If they remain, the sheriff returns to physically remove them and their belongings."
  },
  {
    questionText: "Landlords may NOT evict tenants in retaliation for:",
    options: ["Failing to pay rent", "Damaging property", "Reporting code violations to authorities", "Violating lease terms"],
    correctAnswer: 2,
    explanation: "Eviction may not be pursued in retaliation for tenant exercise of legal rights, including complaints to housing authorities or code enforcement. Tenants have the right to report violations without fear of eviction."
  },
  {
    questionText: "If a property has an occupancy rate of 92%, what is the vacancy rate?",
    options: ["92%", "8%", "9.2%", "0.92%"],
    correctAnswer: 1,
    explanation: "Vacancy rate and occupancy rate are complementary—they must total 100%. If occupancy is 92%, vacancy is 100% - 92% = 8%."
  },
  {
    questionText: "Net Operating Income equals:",
    options: ["Gross rent minus mortgage payments", "Effective gross income minus operating expenses", "Total revenue minus all expenses including debt", "Collected rent minus management fees"],
    correctAnswer: 1,
    explanation: "NOI = Effective Gross Income - Operating Expenses. Notably, NOI is calculated before debt service (mortgage payments). This makes NOI useful for comparing properties with different financing."
  },
  {
    questionText: "The collection rate measures:",
    options: ["Number of units occupied", "Rent received versus rent charged", "Average time to fill vacancies", "Maintenance request response time"],
    correctAnswer: 1,
    explanation: "Collection rate = Rent Collected ÷ Rent Charged. This metric indicates how effectively the property converts charged rent into actual cash receipts."
  },
  {
    questionText: "Preventive maintenance includes:",
    options: ["Emergency plumbing repairs", "Scheduled HVAC system servicing", "Fire damage restoration", "Eviction-related unit turnover"],
    correctAnswer: 1,
    explanation: "Preventive maintenance addresses routine service needs before problems develop. Scheduled HVAC servicing exemplifies this proactive approach—maintaining systems prevents failures."
  },
  {
    questionText: "Move-in inspections should be:",
    options: ["Conducted by the tenant alone", "Documented with signatures from both parties", "Completed within 30 days of occupancy", "Optional for experienced landlords"],
    correctAnswer: 1,
    explanation: "Move-in inspections should document the unit's condition at tenancy commencement with signatures from both landlord and tenant. This creates evidence for resolving disputes about security deposit deductions."
  },
  {
    questionText: "When calculating percentage rent, the breakpoint is:",
    options: ["The minimum rent amount", "The sales level triggering percentage rent", "The maximum rent cap", "The landlord's operating expenses"],
    correctAnswer: 1,
    explanation: "The breakpoint is the sales threshold above which percentage rent applies. Sales below the breakpoint incur only base rent; sales above trigger additional rent at the specified percentage."
  },
  {
    questionText: "The operating expense ratio measures:",
    options: ["Profit margin", "Operating expenses as percentage of income", "Debt service coverage", "Return on investment"],
    correctAnswer: 1,
    explanation: "OER = Operating Expenses ÷ Effective Gross Income. This ratio indicates what portion of income goes to operating the property. Lower ratios generally indicate more efficient operations."
  },
  {
    questionText: "A tenant who fails to respond to an eviction complaint within the required time may face:",
    options: ["Automatic lease renewal", "Default judgment", "Rent reduction", "Extended notice period"],
    correctAnswer: 1,
    explanation: "If a tenant fails to respond to the eviction complaint within five business days, the landlord may request a default judgment. This expedites the eviction when tenants don't contest."
  }
];

async function updateSession18Content() {
  console.log("Starting Session 18 content update...\n");

  // Delete existing lessons for Session 18
  console.log("Removing old lessons...");
  await db.delete(lessons).where(eq(lessons.unitId, UNIT_ID));

  // Create new lessons with Property Management content
  console.log("Creating new lessons...");

  const lesson1 = {
    id: uuid(),
    unitId: UNIT_ID,
    title: "Introduction to Property Management",
    lessonNumber: 1,
    content: segment1Content,
    createdAt: new Date()
  };

  const lesson2 = {
    id: uuid(),
    unitId: UNIT_ID,
    title: "Florida Landlord-Tenant Law",
    lessonNumber: 2,
    content: segment2Content,
    createdAt: new Date()
  };

  const lesson3 = {
    id: uuid(),
    unitId: UNIT_ID,
    title: "Lease Agreements and Types of Tenancies",
    lessonNumber: 3,
    content: segment3Content,
    createdAt: new Date()
  };

  const lesson4 = {
    id: uuid(),
    unitId: UNIT_ID,
    title: "Tenant Relations, Financial Management, and Evictions",
    lessonNumber: 4,
    content: segment4Content,
    createdAt: new Date()
  };

  await db.insert(lessons).values([lesson1, lesson2, lesson3, lesson4]);
  console.log("✓ Created 4 lessons for Session 18");

  // Delete existing question banks for Session 18
  console.log("\nRemoving old question banks...");
  const existingBanks = await db.select().from(questionBanks).where(eq(questionBanks.unitId, UNIT_ID));
  for (const bank of existingBanks) {
    await db.delete(bankQuestions).where(eq(bankQuestions.bankId, bank.id));
  }
  await db.delete(questionBanks).where(eq(questionBanks.unitId, UNIT_ID));

  // Create question banks and questions
  console.log("Creating question banks...");

  // Quiz 18-1
  const bank1Id = uuid();
  await db.insert(questionBanks).values({
    id: bank1Id,
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    bankType: "unit_quiz",
    title: "Quiz 18-1: Property Management Fundamentals",
    description: "Property management roles, landlord-tenant law basics, and security deposits",
    isActive: 1,
    createdAt: new Date()
  });

  for (let i = 0; i < quiz181Questions.length; i++) {
    const q = quiz181Questions[i];
    await db.insert(bankQuestions).values({
      id: uuid(),
      bankId: bank1Id,
      questionText: q.questionText,
      questionType: "multiple_choice",
      options: q.options,
      correctOption: q.correctAnswer,
      explanation: q.explanation,
      createdAt: new Date()
    });
  }
  console.log("✓ Created Quiz 18-1 with 15 questions");

  // Quiz 18-2
  const bank2Id = uuid();
  await db.insert(questionBanks).values({
    id: bank2Id,
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    bankType: "unit_quiz",
    title: "Quiz 18-2: Leases and Tenancies",
    description: "Types of tenancies, lease structures, and assignment/subletting",
    isActive: 1,
    createdAt: new Date()
  });

  for (let i = 0; i < quiz182Questions.length; i++) {
    const q = quiz182Questions[i];
    await db.insert(bankQuestions).values({
      id: uuid(),
      bankId: bank2Id,
      questionText: q.questionText,
      questionType: "multiple_choice",
      options: q.options,
      correctOption: q.correctAnswer,
      explanation: q.explanation,
      createdAt: new Date()
    });
  }
  console.log("✓ Created Quiz 18-2 with 15 questions");

  // Quiz 18-3
  const bank3Id = uuid();
  await db.insert(questionBanks).values({
    id: bank3Id,
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    bankType: "unit_quiz",
    title: "Quiz 18-3: Tenant Relations and Evictions",
    description: "Fair housing compliance, rent collection, financial management, and eviction process",
    isActive: 1,
    createdAt: new Date()
  });

  for (let i = 0; i < quiz183Questions.length; i++) {
    const q = quiz183Questions[i];
    await db.insert(bankQuestions).values({
      id: uuid(),
      bankId: bank3Id,
      questionText: q.questionText,
      questionType: "multiple_choice",
      options: q.options,
      correctOption: q.correctAnswer,
      explanation: q.explanation,
      createdAt: new Date()
    });
  }
  console.log("✓ Created Quiz 18-3 with 15 questions");

  console.log("\n✅ Session 18 Property Management content update complete!");
  console.log("   - 4 lessons created (Segments 1-4)");
  console.log("   - 3 quizzes created (45 questions total)");
}

updateSession18Content()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Update failed:", err);
    process.exit(1);
  });
