export function getLessonContent(unitNumber: number, lessonNumber: number): string {
  const content = lessonContentByUnit[unitNumber]?.[lessonNumber];
  if (content) {
    return content;
  }
  return `<h2>Lesson ${lessonNumber}</h2><p>Content for this lesson is being developed.</p>`;
}

const lessonContentByUnit: Record<number, Record<number, string>> = {
  1: {
    1: `<h2>Introduction to Real Estate</h2>
<p>Welcome to the FoundationCE Florida Sales Associate Pre-Licensing Course. In this first lesson, we introduce you to the real estate industry and explain why understanding real estate as a business matters for your career.</p>

<h3>What is Real Estate?</h3>
<p>Real estate refers to land and anything permanently attached to it, including buildings, improvements, and natural resources. The real estate industry encompasses all activities related to buying, selling, leasing, managing, and developing real property.</p>

<h3>The Real Estate Industry in Florida</h3>
<p>Florida has one of the largest and most dynamic real estate markets in the United States. The state's population growth, tourism industry, and favorable tax climate drive constant demand for residential, commercial, and investment properties.</p>

<h3>Why Become a Licensed Real Estate Professional?</h3>
<p>A real estate license opens doors to multiple career paths including residential sales, commercial brokerage, property management, and real estate development. Licensed professionals earn compensation by helping others navigate one of the most significant financial transactions of their lives.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Real estate includes land and permanent attachments</li>
<li>Florida's real estate market is driven by population growth and tourism</li>
<li>Licensing provides access to multiple career opportunities</li>
<li>Real estate professionals serve as trusted advisors in major transactions</li>
</ul>`,

    2: `<h2>Types of Real Estate Properties</h2>
<p>In this lesson, we explore the different categories of real estate and the characteristics that define each type.</p>

<h3>Residential Real Estate</h3>
<p>Residential property includes single-family homes, condominiums, townhouses, duplexes, and multi-family buildings with up to four units. This is the largest segment of the real estate market and where most new licensees begin their careers.</p>

<h3>Commercial Real Estate</h3>
<p>Commercial properties are used for business purposes and include office buildings, retail centers, shopping malls, and mixed-use developments. Commercial transactions often involve longer sales cycles and more complex negotiations.</p>

<h3>Industrial Real Estate</h3>
<p>Industrial properties include warehouses, distribution centers, manufacturing facilities, and flex spaces. Location near transportation infrastructure is critical for industrial properties.</p>

<h3>Agricultural Real Estate</h3>
<p>Agricultural or rural property includes farms, ranches, timberland, and undeveloped land used for agricultural purposes. Florida has significant agricultural operations including citrus, cattle, and specialty crops.</p>

<h3>Special Purpose Real Estate</h3>
<p>Special purpose properties are designed for specific uses such as hotels, hospitals, schools, and religious facilities. These properties often require specialized knowledge to market and sell.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Residential property is the largest market segment</li>
<li>Commercial property is used for business purposes</li>
<li>Industrial property focuses on manufacturing and distribution</li>
<li>Agricultural property includes farms and undeveloped land</li>
<li>Special purpose properties require specialized expertise</li>
</ul>`,

    3: `<h2>Roles in the Real Estate Industry</h2>
<p>The real estate industry includes many different professionals who work together to facilitate transactions. Understanding these roles helps you identify where you want to focus your career.</p>

<h3>Real Estate Broker</h3>
<p>A broker holds the highest level of real estate license. Brokers may own their own brokerage, supervise sales associates, and are ultimately responsible for all transactions conducted under their license. In Florida, a broker must meet additional experience and education requirements beyond the sales associate license.</p>

<h3>Sales Associate</h3>
<p>A sales associate works under the supervision of a licensed broker. Sales associates cannot work independently and must be registered with an employing broker or owner-developer. Most new licensees begin as sales associates.</p>

<h3>Broker Associate</h3>
<p>A broker associate holds a broker license but chooses to work under the supervision of another broker rather than operating independently. This allows experienced professionals to leverage the resources of an established brokerage.</p>

<h3>Property Manager</h3>
<p>Property managers oversee the daily operations of rental properties on behalf of owners. Their main responsibility is to protect the owner's investment and maximize the owner's return. Property management requires a real estate license in Florida when performed for compensation.</p>

<h3>Appraiser</h3>
<p>Real estate appraisers provide independent opinions of property value. Appraisers are licensed separately from real estate sales associates and must follow the Uniform Standards of Professional Appraisal Practice (USPAP).</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Brokers may own brokerages and supervise associates</li>
<li>Sales associates must work under a broker</li>
<li>Broker associates have a broker license but work under another broker</li>
<li>Property managers protect owner investments</li>
<li>Appraisers provide independent value opinions</li>
</ul>`,

    4: `<h2>Value of Professional Real Estate Services</h2>
<p>This lesson explains what makes real estate professionals valuable to their clients and how you add value in transactions.</p>

<h3>The Primary Product You Offer</h3>
<p>The primary product that a real estate sales associate offers to the public is expert information on property transfer, markets, and marketing. You help buyers and sellers understand property values, market conditions, contract terms, and associated risks.</p>

<h3>Comparative Market Analysis</h3>
<p>A Comparative Market Analysis (CMA) estimates probable selling price using recent comparable sales. A CMA is not an appraisal and should never be described to the public as an appraisal. CMAs help sellers price their properties competitively and help buyers understand market value.</p>

<h3>Market Knowledge</h3>
<p>Real estate professionals track local market conditions, inventory levels, price trends, and economic factors that affect property values. This knowledge allows you to advise clients on timing, pricing strategy, and negotiation tactics.</p>

<h3>Transaction Management</h3>
<p>You guide clients through the complex process of buying or selling property, including contract preparation, negotiation, inspections, financing, and closing. Your expertise helps prevent costly mistakes and ensures a smooth transaction.</p>

<h3>Professional Standards</h3>
<p>Licensed real estate professionals are held to ethical and legal standards that protect consumers. Your license represents a commitment to professional conduct and accountability.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Your primary product is expert information and guidance</li>
<li>A CMA estimates selling price but is not an appraisal</li>
<li>Market knowledge enables sound advice to clients</li>
<li>Transaction management prevents costly errors</li>
<li>Professional standards protect consumers</li>
</ul>`
  },

  2: {
    1: `<h2>Real Estate License Law, DBPR, DRE, FREC</h2>
<p>Welcome back to FoundationCE and the Florida Sales Associate Pre-Licensing Course. In this lesson, we build your foundation in Florida license law. Before you learn what you may or may not do as a licensee, you need to know who makes the rules and why those rules exist.</p>

<h3>Purpose of License Law</h3>
<p>Florida has a long history of regulating real estate. Real estate is a large target for fraud, misrepresentation, and abuse. The law is designed to protect the public, not to protect licensees. The guiding purpose behind the licensing system is consumer protection.</p>

<h3>The Regulatory Structure</h3>
<p>The modern structure of regulation in Florida involves three main entities:</p>
<ul>
<li><strong>DBPR</strong> - The Department of Business and Professional Regulation is an umbrella agency in the executive branch. It regulates many professions including contractors, cosmetologists, and real estate licensees. DBPR issues licenses, investigates complaints, and can initiate disciplinary action.</li>
<li><strong>DRE</strong> - The Division of Real Estate is part of DBPR. It handles administrative and ministerial work specific to real estate and appraisal regulation, maintains license records, and coordinates the examination process.</li>
<li><strong>FREC</strong> - The Florida Real Estate Commission is the rulemaking and disciplinary body for real estate licensees. FREC members are appointed by the Governor and confirmed by the Senate. FREC adopts rules, interprets Chapter 475, and imposes discipline when licensees violate license law.</li>
</ul>

<h3>Key Florida Statutes and Rules</h3>
<ul>
<li><strong>Chapter 20</strong> - Sets out the organizational structure of the executive branch, including DBPR</li>
<li><strong>Chapter 455</strong> - Provides general regulation for professions and occupations under DBPR</li>
<li><strong>Chapter 475</strong> - The primary real estate license law defining real estate services, license types, disciplinary grounds, and the Real Estate Recovery Fund</li>
<li><strong>Chapter 120</strong> - Sets out administrative procedure, including rulemaking and hearings</li>
<li><strong>Rule Chapter 61J2</strong> - Contains the detailed rules adopted by FREC</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>DBPR is the umbrella agency</li>
<li>DRE is the back office that handles real estate administration</li>
<li>FREC is the board that writes rules, interprets the law, and disciplines licensees</li>
<li>Chapter 475 is the primary real estate license law</li>
</ul>`,

    2: `<h2>License Categories, Qualifications, Application, Background, Education</h2>
<p>In this lesson, we talk about you as an applicant. What does Florida expect from you before it will grant you a sales associate license?</p>

<h3>License Categories</h3>
<p>There are three basic categories in residential brokerage:</p>
<ul>
<li><strong>Sales Associate</strong> - Performs real estate services for compensation but must work under the direction and control of an employing broker or owner-developer</li>
<li><strong>Broker</strong> - May work for themselves, own a brokerage, and supervise sales associates and broker associates</li>
<li><strong>Broker Associate</strong> - Has a broker license but chooses to work under the supervision of another broker instead of operating independently</li>
</ul>

<h3>Basic Qualifications for a Sales Associate License</h3>
<p>Florida requires that you:</p>
<ul>
<li>Be at least 18 years old</li>
<li>Have a high school diploma or its equivalent</li>
<li>Have a United States Social Security number</li>
<li>Be honest, trustworthy, and of good moral character</li>
</ul>
<p>You do not have to be a United States citizen, but you must satisfy the requirements for qualification of immigrants for examination under Florida law.</p>

<h3>The Application Process</h3>
<p>The application is more than a formality. You must respond accurately and completely to every question about your background. If you have ever been arrested, charged, or convicted of a crime, or if you have ever entered a plea of guilty or nolo contendere, even if adjudication was withheld or the record was sealed or expunged, you must carefully follow the instructions on the application.</p>
<p><strong>Failure to disclose is often worse than the underlying offense.</strong> Many applications are denied not because of the original conduct but because the applicant failed to disclose it. When in doubt, disclose.</p>

<h3>Background Check</h3>
<p>After you submit the application and pay the required fees, DBPR orders a background check. Your fingerprints are taken and compared to state and federal criminal databases. The Division of Real Estate prepares a Summary of Applicants which provides FREC with information needed to approve or deny your application.</p>

<h3>Education Requirements</h3>
<p>An applicant must complete a state-approved pre-license course for sales associates (FREC Course I) of at least 63 hours including the final exam before taking the state exam. After completing the pre-license course and passing the school exam, you are eligible to take the state licensure examination. Once you pass the state exam and DBPR issues your license, you must complete post-licensing education before your first renewal, and then ongoing continuing education for every renewal after that.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Sales associates must work under a broker</li>
<li>You must be 18 with a high school diploma and Social Security number</li>
<li>Always disclose criminal history on your application</li>
<li>Background checks are required for all applicants</li>
<li>63 hours of pre-license education is required</li>
</ul>`,

    3: `<h2>Registration vs Licensure, Mutual Recognition, Who Must Be Licensed, Exemptions, Unlicensed Activity</h2>
<p>In this final lesson for Unit 2, we connect the license to the work you are allowed to perform.</p>

<h3>Registration vs Licensure</h3>
<p><strong>Registration</strong> is the placement of your name and address on the official record. <strong>Licensure</strong> is the legal authorization to practice a regulated profession. The state may require both registration and licensure, but a license is what authorizes you to perform real estate services.</p>

<h3>Mutual Recognition</h3>
<p>Florida has mutual recognition agreements with certain other states. Under these agreements, a licensee in another state may obtain a Florida license without taking the full pre-license course, provided they meet the experience and law exam requirements and are not Florida residents as defined by statute. Mutual recognition is not reciprocity. It is a specific agreement between Florida and certain states.</p>

<h3>Who Must Be Licensed</h3>
<p>Real estate services in Florida include advertising, buying, appraising, renting, selling, exchanging, leasing, and managing real property for another and for compensation. If a person performs any of these services for someone else for a fee, commission, or other valuable consideration, that person usually must hold an active real estate license.</p>

<h3>Exemptions from Licensure</h3>
<p>The law lists several exemptions:</p>
<ul>
<li>Owners who handle their own real estate</li>
<li>Salaried employees of an owner or of a registered broker or owner-developer who perform limited duties</li>
<li>Attorneys in fact acting under a power of attorney</li>
<li>Certain government employees performing official duties</li>
<li>Partners in a partnership who sell partnership property and receive a share of profits in proportion to their interest</li>
</ul>
<p>You must learn which exemptions exist and where they end.</p>

<h3>Unlicensed Activity</h3>
<p>Unlicensed activity is a serious violation. A person who performs real estate services for another for compensation without a required license can face criminal penalties, administrative fines, and civil liability. Licensees who assist or cooperate with unlicensed activity also risk discipline.</p>
<p>Exam questions often describe a scenario where an unlicensed assistant does too much: negotiating commission, giving legal advice, or showing property without supervision.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Registration is recording your information; licensure authorizes practice</li>
<li>Mutual recognition allows certain out-of-state licensees to obtain a Florida license</li>
<li>Performing real estate services for another for compensation requires a license</li>
<li>Several exemptions exist but are limited in scope</li>
<li>Unlicensed activity can result in criminal and civil penalties</li>
</ul>`
  },

  3: {
    1: `<h2>FREC Composition, Makeup and Purpose</h2>
<p>Welcome to Unit 3 of the FoundationCE Florida Sales Associate Pre-Licensing Course. Now that you understand how DBPR and the Division of Real Estate support licensing, it is time to focus on the Florida Real Estate Commission, known as FREC. FREC is the centerpiece of your regulatory world. It writes rules, interprets statutes, disciplines licensees, and protects consumers.</p>

<h3>FREC's Mission</h3>
<p>The mission of FREC is simple: protect the public by regulating real estate practice in Florida. Everything FREC does must align with consumer protection.</p>

<h3>FREC Structure</h3>
<p>FREC is a seven-member commission appointed by the Governor and confirmed by the Florida Senate:</p>
<ul>
<li>Four members must be licensed brokers with at least five years of active experience</li>
<li>One member must be a licensed broker or sales associate with at least two years of active licensure</li>
<li>Two members must be consumer members with no connection to the real estate industry</li>
<li>At least one member must be sixty years of age or older</li>
</ul>
<p>Terms are staggered four-year terms, and no member may serve more than two consecutive terms. FREC must meet at least monthly, but it may meet more frequently when needed.</p>

<h3>Public Transparency</h3>
<p>FREC operates with public transparency. Meetings are open to the public except for portions involving discipline where confidentiality is permitted by law. Disciplined licensees, rule changes, and administrative cases are all handled through formal, recorded proceedings.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>FREC has seven members appointed by the Governor</li>
<li>Two members must be consumer members</li>
<li>Four members must be brokers with five years experience</li>
<li>FREC's purpose is consumer protection</li>
<li>Members serve four-year staggered terms</li>
</ul>`,

    2: `<h2>Powers, Duties and Rulemaking Authority</h2>
<p>In this lesson, we dive into the authority of the Florida Real Estate Commission. FREC operates under three main categories of power: ministerial, quasi-legislative, and quasi-judicial.</p>

<h3>Ministerial Powers</h3>
<p>Ministerial powers are administrative tasks, such as maintaining records, certifying licenses, and preparing and publishing information. These actions do not involve discretion.</p>

<h3>Quasi-Legislative Powers</h3>
<p>Quasi-legislative powers involve FREC's authority to make rules. These rules become part of the Florida Administrative Code under Rule Chapter 61J2. FREC uses these powers to interpret and implement Chapter 475 of the Florida Statutes. The Commission cannot create laws; it can only adopt rules that enforce or clarify existing statutes.</p>
<p>Examples include rules on escrow procedures, advertising standards, and license renewal procedures.</p>

<h3>Quasi-Judicial Powers</h3>
<p>Quasi-judicial powers allow FREC to discipline licensees, impose fines, suspend or revoke licenses, issue reprimands, and grant or deny applications. FREC acts like a court in these circumstances.</p>

<h3>FREC May:</h3>
<ul>
<li>Adopt a seal</li>
<li>Make rules</li>
<li>Decide questions of practice</li>
<li>Impose discipline</li>
<li>Grant or deny licensure</li>
<li>Determine if a licensee has violated Chapter 475 or a FREC rule</li>
</ul>

<h3>Special Authorities</h3>
<p><strong>Summary Suspension</strong> may be issued when a licensee poses an immediate, serious danger to the public. This is extremely rare but very testable.</p>
<p><strong>Prima Facie Evidence</strong> means "on its face." A current, valid real estate license issued by DBPR is prima facie evidence that the licensee is properly licensed.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Ministerial powers are administrative tasks</li>
<li>Quasi-legislative powers allow FREC to adopt rules</li>
<li>Quasi-judicial powers allow FREC to discipline licensees</li>
<li>Summary suspension is for immediate public danger</li>
<li>A valid license is prima facie evidence of licensure</li>
</ul>`,

    3: `<h2>Licensing, Renewals, Status Changes and Discipline</h2>
<p>In this final lesson for Unit 3, we connect FREC's authority to the real-world lifecycle of your license.</p>

<h3>License Renewal</h3>
<p>Every licensee in Florida must renew their license every two years. Renewal dates follow the month of your original issuance. You must complete post-licensing education before your first renewal and continuing education after that.</p>

<h3>License Status Changes</h3>
<p>If you fail to renew on time, your license becomes <strong>involuntarily inactive</strong>. An involuntarily inactive license may be reactivated within a prescribed period by completing the required continuing education or by taking the 28-hour reactivation course.</p>
<p>Failing to reactivate the license within the allowed time results in the license becoming <strong>null and void</strong>. Null and void means the license no longer exists.</p>

<h3>Employment Changes</h3>
<p>FREC regulates changes in employment. A sales associate or broker associate may only work for one employer at a time. When you change employers, you must notify the state and update your license record. Advertising and escrow handling are tied to the broker of record, not to the associate personally.</p>

<h3>Disciplinary Process</h3>
<p>FREC enforces compliance through disciplinary actions. If a complaint is filed, DBPR may investigate. If probable cause is found, a formal complaint may be issued and the case may go before FREC in a quasi-judicial capacity.</p>
<p>Penalties can include reprimand, fines, probation, suspension, or revocation. The Real Estate Recovery Fund may compensate injured parties for certain damages caused by a licensee, but the licensee must later reimburse the Fund.</p>

<h3>Three Keys to Stay Active and in Good Standing</h3>
<ul>
<li>Renew on time</li>
<li>Complete required education</li>
<li>Follow advertising, escrow, and practice rules</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Licenses must be renewed every two years</li>
<li>Failure to renew leads to involuntarily inactive status</li>
<li>Null and void means the license no longer exists</li>
<li>Associates may only work for one broker at a time</li>
<li>FREC can impose reprimands, fines, suspension, or revocation</li>
</ul>`
  },

  4: {
    1: `<h2>Authorized Relationships and Key Terms</h2>
<p>Welcome to Unit 4 of the FoundationCE Florida Sales Associate Pre-Licensing Course. In this unit, we will talk about who you represent, how you represent them, and what you must disclose. These rules are heavily tested on the state exam because they control your legal duties in every transaction.</p>

<h3>Florida is a Disclosure State</h3>
<p>The law does not assume that buyers or sellers automatically understand who you represent. Instead, Florida requires that licensees clearly explain the type of brokerage relationship that exists in certain residential transactions.</p>

<h3>Key Terms</h3>
<ul>
<li><strong>Customer</strong> - A party to a transaction who receives limited services from a licensee. A transaction broker typically works with customers.</li>
<li><strong>Principal</strong> - Someone who has entered into a representation agreement that creates a fiduciary relationship. When you act as a single agent, your buyer or seller is your principal.</li>
<li><strong>Fiduciary</strong> - A fiduciary owes loyalty, confidentiality, obedience, full disclosure, and other higher-level duties. Fiduciaries must put the principal's interests ahead of their own.</li>
</ul>

<h3>Three Authorized Brokerage Relationships in Florida</h3>
<ol>
<li><strong>Single Agent</strong> - A fiduciary relationship with the highest duties</li>
<li><strong>Transaction Broker</strong> - A limited representation relationship</li>
<li><strong>No Brokerage Relationship</strong> - You do not represent the buyer or seller at all but still owe certain limited duties</li>
</ol>

<h3>Dual Agency is Prohibited</h3>
<p>Dual agency in residential transactions is not allowed in Florida. You cannot represent both buyer and seller as a fiduciary in the same residential transaction. Instead, the law offers transaction brokerage as the flexible middle ground.</p>

<h3>Presumption of Transaction Brokerage</h3>
<p>Florida law creates a presumption. Unless a single agent or no brokerage relationship is established in writing, you are presumed to be operating as a transaction broker in a residential transaction. That is the default relationship.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Florida requires disclosure of brokerage relationships</li>
<li>A customer receives limited services; a principal has a fiduciary relationship</li>
<li>Three authorized relationships: single agent, transaction broker, no brokerage</li>
<li>Dual agency is prohibited in Florida residential transactions</li>
<li>Transaction brokerage is the default relationship</li>
</ul>`,

    2: `<h2>Duties by Relationship and Required Disclosures</h2>
<p>In this lesson, we break down the duties you owe in each relationship and the disclosures you must make.</p>

<h3>Single Agent Duties</h3>
<p>A single agent relationship is a fiduciary relationship. As a single agent, you owe:</p>
<ul>
<li>Dealing honestly and fairly</li>
<li>Loyalty</li>
<li>Confidentiality</li>
<li>Obedience</li>
<li>Full disclosure</li>
<li>Accounting for all funds</li>
<li>Skill, care, and diligence in the transaction</li>
<li>Presenting all offers and counteroffers in a timely manner</li>
<li>Disclosing all known facts that materially affect the value of residential real property and are not readily observable</li>
</ul>
<p>You must give the <strong>Single Agent Notice</strong> in writing before, or at the time of, entering into a listing or representation agreement or before showing property, whichever happens first.</p>

<h3>Transaction Broker Duties</h3>
<p>The transaction broker relationship is a limited form of representation, not a fiduciary relationship. As a transaction broker, you owe:</p>
<ul>
<li>Dealing honestly and fairly</li>
<li>Accounting for all funds</li>
<li>Using skill, care, and diligence in the transaction</li>
<li>Disclosing all known facts that materially affect the value of residential real property and are not readily observable</li>
<li>Presenting all offers and counteroffers in a timely manner</li>
<li>Limited confidentiality</li>
<li>Any additional duties agreed to in writing</li>
</ul>
<p><strong>Limited confidentiality</strong> means you must not disclose certain information that would harm one party in negotiations, such as the lowest price a seller is willing to accept or the highest price a buyer is willing to pay, unless the party gives written permission or disclosure is required by law.</p>

<h3>No Brokerage Relationship Duties</h3>
<p>In a no brokerage relationship, you do not represent either party. Even so, you still owe three limited duties:</p>
<ul>
<li>Dealing honestly and fairly</li>
<li>Disclosing all known facts that materially affect the value of residential real property and are not readily observable</li>
<li>Accounting for all funds entrusted to you</li>
</ul>
<p>The <strong>No Brokerage Relationship Notice</strong> must be provided in writing before showing property.</p>

<h3>When Disclosures Are Required</h3>
<p>Written relationship disclosure requirements apply to residential sales, defined as the sale of improved residential property of four units or fewer, unimproved residential property intended for four units or fewer, or agricultural property of ten acres or fewer.</p>
<p>Disclosures are NOT required in nonresidential transactions, in the leasing of real property, in business opportunity sales that do not include four or fewer residential units, or where the licensee knows the other party is already represented.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Single agents owe loyalty and full fiduciary duties</li>
<li>Transaction brokers owe limited confidentiality, not loyalty</li>
<li>No brokerage relationship still requires honesty and disclosure of material facts</li>
<li>Disclosures apply to residential sales of four units or fewer</li>
<li>Leases and commercial transactions do not require written relationship disclosures</li>
</ul>`,

    3: `<h2>Designated Sales Associates and Exam Scenarios</h2>
<p>In this lesson, we focus on designated sales associates and bring all the relationship rules together with exam-style scenarios.</p>

<h3>Designated Sales Associates</h3>
<p>In certain nonresidential transactions, Florida law allows a special structure called designated sales associates. This is only available when:</p>
<ul>
<li>The transaction is not a residential sale as defined in statute</li>
<li>Both buyer and seller each have assets of one million dollars or more</li>
<li>The broker, at the customers' request, designates different sales associates to act as single agents for each side in the same transaction</li>
</ul>
<p>The designated sales associates each have all the duties of a single agent to their respective customers. The broker becomes more like an intermediary overseeing both sides. Both parties must sign a disclosure confirming their assets meet the threshold.</p>

<h3>Common Exam Scenarios</h3>
<p><strong>Scenario One:</strong> A sales associate meets a buyer at an open house for a single-family home. No written disclosure has been signed. Under Florida law, the brokerage relationship is presumed to be transaction brokerage. The associate owes the duties of a transaction broker, including limited confidentiality, but not fiduciary loyalty.</p>

<p><strong>Scenario Two:</strong> A listing agreement clearly identifies the broker as a single agent for the seller. Later, a potential buyer wants the same associate to help write up an offer. The associate cannot remain a single agent for the seller and also represent the buyer. The relationship may be changed to transaction broker only if the seller signs the Consent to Transition disclosure before the change.</p>

<p><strong>Scenario Three:</strong> A broker is helping a corporate buyer purchase a large warehouse. Both the buyer and the seller have assets over one million dollars. At the customers' request, the broker designates one sales associate for the buyer and another for the seller. This is permitted as a designated sales associate arrangement because it is a qualifying nonresidential transaction.</p>

<p><strong>Scenario Four:</strong> A licensee is chatting casually with a neighbor at a barbecue. The neighbor casually mentions they might sell their house someday. No confidential information is requested or given. This is an unanticipated casual conversation. Relationship disclosures are not required at this point.</p>

<h3>Exam Tips</h3>
<ul>
<li>Watch for when written disclosures are required</li>
<li>Know which relationship the law presumes when no written disclosure is used</li>
<li>Understand the difference between fiduciary duties and transaction broker duties</li>
<li>Know the conditions for designated sales associates</li>
<li>Identify transactions where disclosure rules do not apply</li>
</ul>`,

    4: `<h2>Disclosure Requirements</h2>
<p>In this lesson, we examine the specific disclosure requirements in Florida real estate transactions.</p>

<h3>Brokerage Relationship Disclosures</h3>
<p>Florida law requires written disclosure of the brokerage relationship in residential transactions. The specific forms include:</p>
<ul>
<li><strong>Single Agent Notice</strong> - Must be given before or at the time of entering a listing or representation agreement, or before showing property</li>
<li><strong>Transaction Broker Notice</strong> - While transaction brokerage is presumed, the notice should still be given</li>
<li><strong>No Brokerage Relationship Notice</strong> - Must be provided in writing before showing property</li>
<li><strong>Consent to Transition</strong> - Required when changing from single agent to transaction broker</li>
</ul>

<h3>Property Condition Disclosures</h3>
<p>Licensees must disclose all known facts that materially affect the value of residential property and are not readily observable. This includes:</p>
<ul>
<li>Known defects in the property</li>
<li>Environmental hazards</li>
<li>Neighborhood conditions affecting value</li>
<li>Zoning issues or pending changes</li>
</ul>

<h3>Johnson v. Davis Rule</h3>
<p>The Johnson v. Davis case established that sellers of residential property must disclose known material facts that:</p>
<ul>
<li>Are not readily observable</li>
<li>Are not known to the buyer</li>
<li>Materially affect the value of the property</li>
</ul>

<h3>Radon Gas Disclosure</h3>
<p>Florida law requires a radon gas disclosure in every contract for the sale of real property. The disclosure warns buyers about the potential for radon gas.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Single agent notice must be given before entering agreements or showing property</li>
<li>Material facts affecting value must be disclosed</li>
<li>Johnson v. Davis requires seller disclosure of known defects</li>
<li>Radon disclosure is required in all sales contracts</li>
</ul>`
  },

  5: {
    1: `<h2>Brokerage Offices, Entities, Signage, Record Keeping</h2>
<p>Welcome to Unit 5 of the FoundationCE Florida Sales Associate Pre-Licensing Course. This unit teaches the mechanics of how a Florida real estate brokerage operates. To protect the public, Florida requires tight controls on offices, signage, record keeping, and how business is conducted.</p>

<h3>Brokerage Office Requirements</h3>
<p>A broker must register the office with the state. The office must be a physical, stationary building that provides privacy for conducting business. A broker may not operate as a broker from a temporary shelter or vehicle.</p>

<h3>Branch Offices</h3>
<p>A broker may open additional offices, known as branch offices. A branch office must be registered as a branch office if the broker intends to conduct real estate business there more than temporarily. A temporary construction trailer is not automatically a branch office unless business is regularly conducted there.</p>

<h3>Signage Requirements</h3>
<p>Every registered office must have an entrance sign with:</p>
<ul>
<li>The broker's trade name (if any)</li>
<li>The name of at least one broker</li>
<li>The words "Licensed Real Estate Broker" or the abbreviation "Lic Real Estate Broker"</li>
</ul>

<h3>Brokerage Entities</h3>
<p>A broker may operate as a sole proprietor, corporation, partnership, or limited liability company. Sales associates and broker associates cannot operate independently. They must work under an employing broker or owner-developer. Associates cannot be officers or partners that direct the brokerage unless they hold a broker license.</p>

<h3>Record Keeping</h3>
<p>A broker is required to maintain business records for at least five years. This includes escrow records, transaction files, contracts, offers, and listing agreements. If the broker is involved in litigation, the retention period extends to two years after the conclusion of the litigation, even if that period exceeds five years.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Offices must be stationary physical locations</li>
<li>Branch offices must be registered if used regularly</li>
<li>Entrance signs must include broker name and "Licensed Real Estate Broker"</li>
<li>Sales associates must work under a broker</li>
<li>Records must be retained for at least five years</li>
</ul>`,

    2: `<h2>Escrow Rules, Deposits, Trust Accounts, Settlement Procedures</h2>
<p>In this lesson, we explore one of the most heavily tested areas on the state exam: escrow and trust account rules.</p>

<h3>Deposit Handling</h3>
<p>When a buyer makes an earnest money deposit, the broker is responsible for safeguarding the funds. The deposit may be held by the closing agent, an attorney, or the broker. If the broker holds the funds, they must be deposited into a trust account.</p>

<h3>Deposit Timelines</h3>
<p>Florida has strict deposit timelines:</p>
<ul>
<li>A sales associate must deliver a deposit to their broker no later than the <strong>end of the next business day</strong></li>
<li>The broker must deposit the funds into the trust account by the <strong>end of the third business day</strong> following receipt of the deposit by the licensee</li>
</ul>
<p>Always count business days, not calendar days.</p>

<h3>Trust Account Rules</h3>
<p>A trust account must be separate from operating accounts. A broker may place a small amount of personal money in the trust account to cover bank fees but may not commingle client funds with business funds.</p>

<h3>Escrow Disputes</h3>
<p>An escrow dispute arises when there is a good faith doubt as to which party should receive the escrowed funds. A good faith doubt may be triggered when the buyer and seller give conflicting demands.</p>
<p>When an escrow dispute occurs, the broker must notify the state within a specific period and choose one of the authorized settlement procedures:</p>
<ul>
<li>Mediation</li>
<li>Arbitration</li>
<li>Litigation</li>
<li>Request for an escrow disbursement order from FREC</li>
</ul>

<h3>Important Rules</h3>
<p>A sales associate may never directly disburse escrow funds and may never deposit deposit checks directly into the broker's escrow account. The associate delivers deposits to the broker for processing.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Associates must deliver deposits by end of next business day</li>
<li>Brokers must deposit by end of third business day</li>
<li>Trust accounts must be separate from operating accounts</li>
<li>Escrow disputes require notification to the state</li>
<li>Authorized settlement procedures include mediation, arbitration, litigation, or FREC order</li>
</ul>`,

    3: `<h2>Advertising, Compensation, Employment Changes, Exam Scenarios</h2>
<p>In this final lesson of Unit 5, we tackle advertising rules and compensation, which are common exam topics.</p>

<h3>Advertising Rules</h3>
<p>Florida requires all real estate advertising to be in the name of the brokerage. An advertisement must clearly identify the registered brokerage name. This applies to print ads, online listings, business cards, social media posts, and team advertising.</p>

<h3>Blind Ads</h3>
<p>A <strong>blind ad</strong> is an advertisement that fails to disclose the licensed name of the brokerage. Blind ads are illegal. An ad cannot lead the public to believe a property is being offered by a private individual if it is being offered by a licensee.</p>

<h3>Team Advertising</h3>
<p>Team advertising must follow strict rules. A team name may not imply that the team is a separate brokerage. The brokerage name must appear in at least the same size type as the team name.</p>

<h3>Compensation Rules</h3>
<p>A sales associate or broker associate may only be paid by their employing broker. They may not receive direct payment from a seller, buyer, or other licensee.</p>
<p>Referral fees may be paid between brokers. A Florida broker may pay a referral fee to an out-of-state broker if the out-of-state broker does not physically participate in the transaction in Florida.</p>

<h3>Employment Changes</h3>
<p>When a sales associate changes employers, they may not take listings with them unless the broker gives permission. Listings belong to the broker, not the associate. The associate must update their license record with the state when changing employers.</p>

<h3>Exam Scenarios</h3>
<p><strong>Scenario One:</strong> A sales associate accepts a deposit check from a buyer on a Friday evening. The associate must deliver the deposit to the broker no later than the end of the next business day, which will usually be Monday unless Monday is a holiday. The broker must deposit the funds by the end of the third business day after receipt.</p>

<p><strong>Scenario Two:</strong> A sales associate runs an online ad that includes only a team name and phone number, with no brokerage name. This is a blind ad and is a violation of Florida law.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>All advertising must include the brokerage name</li>
<li>Blind ads are illegal</li>
<li>Associates may only be paid by their employing broker</li>
<li>Listings belong to the broker, not the associate</li>
<li>License records must be updated when changing employers</li>
</ul>`
  },

  6: {
    1: `<h2>Types of Violations and Related Laws</h2>
<p>Welcome to Unit 6 of the FoundationCE Florida Sales Associate Pre-Licensing Course. In this unit, we deal with the uncomfortable side of real estate: what happens when licensees break the rules. The goal is not to scare you, but to show you exactly where the lines are so you never cross them by accident.</p>

<h3>Legal Framework</h3>
<p>Florida regulates real estate under Chapter 475 and Chapter 455 of the Florida Statutes, along with Rule Chapter 61J2 of the Florida Administrative Code. Violations of these laws and rules can result in administrative penalties, civil liability, and even criminal charges.</p>

<h3>Categories of Violations</h3>
<ul>
<li><strong>Misrepresentation or fraud</strong> - Making a false statement of a material fact</li>
<li><strong>Culpable negligence</strong> - Serious carelessness showing reckless disregard for safety or rights of others</li>
<li><strong>Commingling</strong> - Mixing client funds with broker's personal or business funds</li>
<li><strong>Conversion</strong> - Using client funds for personal or business purposes without authorization</li>
<li><strong>False or misleading advertising</strong> - Including blind ads and bait-and-switch tactics</li>
<li><strong>Failure to disclose material facts</strong></li>
<li><strong>Unlicensed practice</strong> - Or assisting unlicensed practice</li>
<li><strong>Failure to maintain records</strong></li>
<li><strong>Failure to comply with escrow and trust account rules</strong></li>
<li><strong>Criminal offenses</strong> - Related to real estate or moral turpitude</li>
</ul>

<h3>Key Definitions</h3>
<p><strong>Misrepresentation</strong> involves making a false statement of a material fact. For example, advertising that a property has a new roof when the roof is ten years old is misrepresentation. Misrepresentation can be intentional fraud or negligent.</p>

<p><strong>Culpable negligence</strong> is more than simple carelessness. It is serious carelessness that shows a reckless disregard for the safety or rights of others.</p>

<p><strong>Commingling</strong> is mixing client funds with the broker's personal or business funds. <strong>Conversion</strong> is using client funds for personal or business purposes without authorization. If a broker uses escrow money to pay office rent, that is conversion, and it is one of the most serious violations.</p>

<h3>Criminal Violations</h3>
<p>Some violations are also crimes. For example, practicing without a license can be a criminal offense. Certain types of fraud and theft can lead to criminal prosecution in addition to administrative penalties.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Misrepresentation is making false statements of material fact</li>
<li>Commingling is mixing client and broker funds</li>
<li>Conversion is using client funds without authorization</li>
<li>Unlicensed activity is a serious criminal and administrative violation</li>
<li>Violations can result in administrative, civil, and criminal penalties</li>
</ul>`,

    2: `<h2>Disciplinary Process and Procedures</h2>
<p>In this lesson, we break down the path a case takes from an initial complaint to final discipline. The order matters, and the exam will test the sequence.</p>

<h3>Step 1: The Complaint</h3>
<p>A complaint is an allegation that a licensee has violated a statute or rule. Complaints may come from customers, other licensees, or other agencies. The Department of Business and Professional Regulation screens the complaint to determine whether it is <strong>legally sufficient</strong>.</p>
<p>A complaint is legally sufficient if it contains facts that, if true, would be a violation of law or rule. If the complaint is not legally sufficient, it may be dismissed.</p>

<h3>Step 2: Investigation</h3>
<p>If the complaint is legally sufficient, an investigation is opened. Investigators may interview witnesses, obtain documents, and gather evidence. The subject of the investigation may be notified, and a copy of the complaint may be sent to the licensee, unless confidentiality is required.</p>

<h3>Step 3: Probable Cause</h3>
<p>When the investigation is complete, the case moves to the probable cause stage. A probable cause panel, usually made up of FREC members, reviews the investigative report and decides whether there is probable cause to believe a violation has occurred. If the panel finds no probable cause, the case is dismissed or closed.</p>

<h3>Step 4: Formal Complaint</h3>
<p>If probable cause is found, the Department files a formal complaint. The formal complaint is an administrative pleading that states the charges and the facts that support them. The licensee receives a copy and has the right to respond.</p>

<h3>Step 5: Hearing</h3>
<p>The licensee then chooses between two types of hearings:</p>
<ul>
<li><strong>Informal hearing</strong> before FREC when the licensee does not dispute the facts but wants to be heard on the penalty</li>
<li><strong>Formal hearing</strong> before an administrative law judge when the licensee disputes material facts. The judge hears evidence and issues a recommended order.</li>
</ul>

<h3>Step 6: Final Order</h3>
<p>After the hearing, FREC issues a final order. The final order states the findings, the decision, and any disciplinary action.</p>

<h3>Step 7: Judicial Review</h3>
<p>The licensee may appeal the final order by filing for judicial review in the appropriate court within the allowed time.</p>

<h3>Alternative Resolutions</h3>
<p>At several points in the process, minor violations may be handled with a <strong>notice of noncompliance</strong> or a <strong>citation</strong> instead of a full formal complaint. A notice of noncompliance is used for minor first-time violations that can be corrected quickly. A citation is a type of administrative fine that resolves certain listed violations without a full disciplinary hearing.</p>

<h3>Key Order of Events</h3>
<ol>
<li>Complaint</li>
<li>Investigation</li>
<li>Probable cause</li>
<li>Formal complaint and hearing</li>
<li>Final order</li>
<li>Judicial review</li>
</ol>`,

    3: `<h2>Penalties, Disciplinary Guidelines and the Real Estate Recovery Fund</h2>
<p>In this final lesson for Unit 6, we look at the menu of penalties and the Real Estate Recovery Fund.</p>

<h3>Administrative Penalties</h3>
<p>FREC has authority to impose several types of administrative penalties. From least severe to most severe:</p>
<ul>
<li><strong>Notice of noncompliance</strong> for minor first-time violations</li>
<li><strong>Citation</strong> for certain listed violations, usually with a set fine</li>
<li><strong>Reprimand</strong></li>
<li><strong>Administrative fine</strong></li>
<li><strong>Probation</strong></li>
<li><strong>Suspension</strong></li>
<li><strong>Revocation</strong> or denial of licensure</li>
</ul>

<h3>Understanding the Penalties</h3>
<p>Administrative fines can be significant. The law allows FREC to impose fines per offense, subject to limits set by statute and rule. Serious violations such as conversion of escrow funds often result in both fines and license suspension or revocation.</p>

<p><strong>Probation</strong> means the licensee can continue to practice subject to conditions, such as additional education, supervision, or regular reporting.</p>

<p><strong>Suspension</strong> temporarily removes the right to practice for a set period. When the suspension ends and the license is reinstated, the licensee may resume practice if all conditions are satisfied.</p>

<p><strong>Revocation</strong> permanently removes the license, although in some cases the law may allow re-application after a significant period or under special conditions. A license that is revoked or that becomes null and void no longer authorizes any real estate services.</p>

<h3>The Real Estate Recovery Fund</h3>
<p>The Recovery Fund exists to reimburse members of the public who have suffered monetary losses due to the dishonesty of a real estate licensee in a real estate transaction. The Fund is financed by a portion of license fees and certain fines.</p>

<p>To recover from the Fund, an injured party must usually first obtain a civil judgment against a licensee and show that they were unable to collect the judgment. The Fund does not pay punitive damages or attorney fees in most cases, and it does not cover losses from a licensee acting as a principal in their own account in most situations.</p>

<p>The Fund has maximum payout limits per transaction and per licensee, and it does not reimburse for non-monetary injuries. Once the Fund pays a claim on behalf of a licensee, the license of that licensee is usually subject to automatic suspension until the Fund is repaid.</p>

<h3>Key Points for the Exam</h3>
<ul>
<li>Recovery Fund is a last resort for monetary damages</li>
<li>Judgment first, then attempt to collect, then Recovery Fund</li>
<li>Limits apply per transaction and per licensee</li>
<li>Payment usually triggers suspension until reimbursement</li>
</ul>`
  },

  7: {
    1: `<h2>Fair Housing, Civil Rights Acts, ADA</h2>
<p>Welcome to Unit 7 of the FoundationCE Florida Sales Associate Pre-Licensing Course. This lesson focuses on fair housing laws, civil rights protections, and disability accommodation rules. These laws exist to ensure equal access to housing and prevent discrimination in every part of a transaction.</p>

<h3>Civil Rights Act of 1866</h3>
<p>This law prohibits discrimination in real estate based on race. It applies to all real estate, without exception, and has no exemptions of any kind. If a question on the exam asks which law covers race with no exemptions, the answer is always the Civil Rights Act of 1866.</p>

<h3>Fair Housing Act (Civil Rights Act of 1968)</h3>
<p>The Fair Housing Act forbids discrimination in housing based on:</p>
<ul>
<li>Race</li>
<li>Color</li>
<li>Religion</li>
<li>Sex</li>
<li>National origin</li>
<li>Disability</li>
<li>Familial status (households with children under 18 or pregnant individuals)</li>
</ul>

<h3>Prohibited Actions</h3>
<p>The Fair Housing Act prohibits:</p>
<ul>
<li>Refusing to rent or sell</li>
<li>Quoting different terms or prices based on protected class</li>
<li>False representation of availability</li>
<li>Discriminatory advertising</li>
<li>Discriminatory financing</li>
</ul>

<h3>Steering, Blockbusting, and Redlining</h3>
<ul>
<li><strong>Steering</strong> is guiding buyers to or away from certain neighborhoods based on protected class</li>
<li><strong>Blockbusting</strong> is encouraging owners to sell because protected classes are moving in</li>
<li><strong>Redlining</strong> is the refusal of loans or insurance based on the characteristics of the neighborhood rather than the borrower</li>
</ul>

<h3>Limited Exemptions</h3>
<p>The Fair Housing Act has limited exemptions including owner-occupied buildings with no more than four units, housing operated by private clubs and religious organizations under certain conditions, and certain senior housing when legally qualified.</p>

<h3>Americans with Disabilities Act (ADA)</h3>
<p>The ADA applies mainly to public accommodations such as sales offices, leasing offices, model homes that contain a public area, and short-term lodging operated like a hotel.</p>
<p>Under the Fair Housing Act, housing providers must allow <strong>reasonable accommodations</strong> (changes in rules or policies) and <strong>reasonable modifications</strong> (physical changes to the property) for persons with disabilities.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Civil Rights Act of 1866 covers race with no exceptions</li>
<li>Fair Housing Act protects seven classes including familial status and disability</li>
<li>Steering, blockbusting, and redlining are prohibited</li>
<li>ADA applies to public accommodations</li>
<li>Reasonable accommodations and modifications must be allowed for disability</li>
</ul>`,

    2: `<h2>RESPA, ECOA, Sherman Antitrust</h2>
<p>In this lesson, we shift to transaction-based federal laws including RESPA, ECOA, and antitrust laws that govern competitive practices.</p>

<h3>Real Estate Settlement Procedures Act (RESPA)</h3>
<p>RESPA regulates settlement procedures for most residential mortgage loans. The purpose is to prevent kickbacks, referral fees, unearned fees, and inflated closing costs.</p>

<p>RESPA applies to federally related mortgage loans, which cover most loans through lenders, banks, credit unions, and mortgage companies.</p>

<h3>RESPA Prohibitions</h3>
<p>RESPA prohibits referral fees and kickbacks. For example:</p>
<ul>
<li>A real estate licensee may not receive a fee for sending business to a title company or lender</li>
<li>A lender may not pay a real estate broker for referring customers</li>
<li>Payment is allowed only for actual services performed, not for referrals</li>
</ul>

<h3>Affiliated Business Arrangements</h3>
<p>Affiliated business arrangements are permitted if proper disclosure is given. For example, a broker who owns part of a title company may recommend that company only if the broker provides written disclosure and does not require the buyer to use the affiliate.</p>

<p>RESPA also requires the delivery of a Loan Estimate and a Closing Disclosure with specific timing requirements.</p>

<h3>Equal Credit Opportunity Act (ECOA)</h3>
<p>ECOA prohibits discrimination in credit transactions on the basis of:</p>
<ul>
<li>Race</li>
<li>Color</li>
<li>Religion</li>
<li>National origin</li>
<li>Sex</li>
<li>Marital status</li>
<li>Age</li>
<li>Receipt of public assistance</li>
<li>Exercise of consumer protection rights</li>
</ul>
<p>Lenders cannot ask certain questions unless required by law and cannot discourage applicants based on prohibited factors.</p>

<h3>Sherman Antitrust Act</h3>
<p>Antitrust laws protect competition and prohibit agreements that restrain trade. In real estate, prohibited actions include:</p>
<ul>
<li><strong>Price fixing</strong> - When brokers agree to charge the same commission</li>
<li><strong>Market allocation</strong> - When brokers agree not to compete in certain geographic areas</li>
<li><strong>Group boycotts</strong> - When businesses agree not to deal with another company or person</li>
<li><strong>Tie-in arrangements</strong> - Conditions where a consumer must purchase one service to obtain another</li>
</ul>

<p><strong>Important:</strong> Commission rates are always negotiable. Any statement that rates are "set by law" or "standard" is false and may indicate price fixing.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>RESPA prohibits kickbacks and unearned referral fees</li>
<li>Affiliated business arrangements require disclosure</li>
<li>ECOA prohibits discrimination in credit including marital status</li>
<li>Commission rates are always negotiable</li>
<li>Antitrust violations carry severe criminal penalties</li>
</ul>`,

    3: `<h2>Florida Landlord Tenant Laws, Telephone Solicitation, CAN-SPAM, Scenarios</h2>
<p>In this final lesson for Unit 7, we cover state-level consumer laws and wrap up with exam scenarios.</p>

<h3>Florida Residential Landlord and Tenant Act</h3>
<p>This law governs the relationship between landlords and tenants in residential property. It defines the rights and obligations of both parties, including maintenance duties, access rules, and deposit handling.</p>

<h3>Landlord Obligations</h3>
<p>A landlord must maintain the property in compliance with building, housing, and health codes. The landlord must make repairs necessary to keep the property habitable.</p>

<h3>Security Deposit Rules</h3>
<p>Security deposits must be handled according to strict rules:</p>
<ul>
<li>The landlord must notify the tenant in writing where the deposit is held</li>
<li>Must specify whether it is in an interest-bearing or non-interest-bearing account</li>
<li>Must state the conditions under which deductions may be made</li>
<li>If the landlord intends to impose a claim on the deposit, written notice must be provided within the time required by law</li>
</ul>

<h3>Tenant Obligations</h3>
<p>Tenants must maintain the unit, keep it clean, and use fixtures and appliances in a reasonable manner. Tenants must not destroy or damage the property and must allow reasonable access for repairs with proper notice.</p>

<h3>Telephone Solicitation Rules</h3>
<p>The federal Telephone Consumer Protection Act prohibits marketing calls to numbers on the national do-not-call registry unless there is an established business relationship or written permission. It also limits the times of day when marketing calls may be made.</p>
<p>Florida has its own state do-not-call list with even stricter penalties. Real estate licensees must comply with both. Violations can result in significant fines per call.</p>

<h3>CAN-SPAM Act</h3>
<p>The CAN-SPAM Act regulates commercial email. Emails must include:</p>
<ul>
<li>A valid physical address of the sender</li>
<li>A clear subject line</li>
<li>A clear opt-out link</li>
<li>Must not use deceptive headers or subject lines</li>
</ul>

<h3>Text Message Marketing</h3>
<p>Text message marketing is regulated as well. Texts sent for marketing purposes typically require prior express written consent.</p>

<h3>Exam Watch Points</h3>
<ul>
<li>A tenant deposit dispute without proper notice</li>
<li>A prohibited solicitation to a do-not-call number</li>
<li>Missing disclosures in commercial email</li>
<li>Steering or discriminatory statements in advertising</li>
</ul>`,

    4: `<h2>Environmental Regulations</h2>
<p>This lesson covers environmental laws that affect real estate transactions in Florida.</p>

<h3>Lead-Based Paint Disclosure</h3>
<p>Federal law requires disclosure of known lead-based paint hazards in housing built before 1978. The disclosure includes:</p>
<ul>
<li>Known presence of lead-based paint</li>
<li>A 10-day inspection opportunity</li>
<li>A pamphlet about lead hazards</li>
<li>Signed acknowledgment of receipt</li>
</ul>

<h3>Asbestos</h3>
<p>Asbestos was commonly used in building materials before 1978. When disturbed, asbestos fibers become airborne and can cause serious respiratory illness. Licensees should be aware of potential asbestos in older buildings.</p>

<h3>Radon Gas</h3>
<p>Radon is a naturally occurring radioactive gas that seeps up through the ground. Florida law requires a radon gas disclosure in all real estate contracts. Testing can determine radon levels, and mitigation systems can reduce exposure.</p>

<h3>Underground Storage Tanks</h3>
<p>Properties with underground storage tanks may have contamination issues. Lenders often require environmental assessments for commercial properties with tanks.</p>

<h3>CERCLA (Superfund)</h3>
<p>The Comprehensive Environmental Response, Compensation, and Liability Act establishes liability for contaminated properties. Liability is strict, meaning responsible parties can be held liable regardless of fault. The innocent landowner defense may protect buyers who conducted appropriate due diligence.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Lead-based paint disclosure required for pre-1978 housing</li>
<li>Radon disclosure required in all Florida real estate contracts</li>
<li>CERCLA imposes strict liability for contamination</li>
<li>Environmental issues can significantly affect property value</li>
</ul>`
  },

  8: {
    1: `<h2>Real Property, Bundle of Rights, Estates</h2>
<p>Welcome to Unit 8 of the FoundationCE Florida Sales Associate Pre-Licensing Course. In this unit, we move deeper into what exactly is being bought and sold in a real estate transaction. When someone buys property, they receive much more than walls and land. They receive legal rights that can be separated, limited, or transferred.</p>

<h3>Real Property vs Personal Property</h3>
<p><strong>Real property</strong> consists of land and anything permanently attached to the land, along with the legal rights associated with ownership. Real property includes the surface of the land, the air space above, and the subsurface, subject to legal limits.</p>
<p><strong>Personal property</strong> is movable property that is not fixed to the land. Furniture, vehicles, and most appliances are examples of personal property.</p>

<h3>The Bundle of Rights</h3>
<p>The legal rights associated with real property are often described as a bundle of rights. These rights include:</p>
<ul>
<li>The right to possess</li>
<li>The right to use</li>
<li>The right to exclude others</li>
<li>The right to enjoy</li>
<li>The right to dispose of the property</li>
</ul>
<p>An owner can sell some rights and keep others. For example, an owner might sell oil or mineral rights and keep surface rights.</p>

<h3>Estates in Real Property</h3>
<p>An estate is the degree, quantity, nature, and extent of interest a person has in real property. Estates are grouped into <strong>freehold estates</strong> and <strong>leasehold estates</strong>.</p>

<h3>Freehold Estates</h3>
<p>A freehold estate is an ownership interest that is for an indefinite length of time. Examples include:</p>
<ul>
<li><strong>Fee simple absolute</strong> - The largest and most complete bundle of rights available</li>
<li><strong>Life estate</strong> - Ownership that lasts for the lifetime of a specified person</li>
<li><strong>Fee simple subject to conditions</strong> - Ownership with restrictions that could cause forfeiture</li>
</ul>

<h3>Leasehold Estates</h3>
<p>Leasehold estates are interests in real property for a definite period, usually created by a lease. The tenant has the right of possession but not ownership. Types include:</p>
<ul>
<li>Estate for years</li>
<li>Tenancy at will</li>
<li>Tenancy at sufferance</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Real property includes land and permanent attachments plus legal rights</li>
<li>The bundle of rights includes possession, use, exclusion, enjoyment, and disposition</li>
<li>Fee simple means full ownership with the greatest bundle of rights</li>
<li>A life estate ends at death of a named person</li>
<li>Leasehold means possession for a limited time under a lease</li>
</ul>`,

    2: `<h2>Tenancies, Co-Ownership, Homestead</h2>
<p>In this lesson, we compare different ways people can hold title together and we introduce Florida homestead protections.</p>

<h3>Ownership in Severalty</h3>
<p>Ownership in severalty means title is held by a single person or a single legal entity. Corporate ownership is ownership in severalty because the corporation is considered one legal person.</p>

<h3>Co-Ownership</h3>
<p>Co-ownership exists when title is held by two or more persons at the same time. The most common forms for the exam are:</p>

<h4>Tenancy in Common</h4>
<ul>
<li>No right of survivorship</li>
<li>Each co-owner has an undivided interest in the whole property, which may be equal or unequal</li>
<li>If one tenant in common dies, that person's share passes to their heirs or according to their will</li>
</ul>

<h4>Joint Tenancy</h4>
<ul>
<li>Includes the right of survivorship</li>
<li>If one joint tenant dies, that person's share automatically passes to the surviving joint tenants, not to heirs</li>
<li>Usually requires the four unities of possession, interest, time, and title</li>
</ul>

<h4>Tenancy by the Entireties</h4>
<ul>
<li>A special form of co-ownership for married couples</li>
<li>Includes the right of survivorship</li>
<li>Treats the couple as one legal person</li>
<li>If one spouse dies, the surviving spouse becomes the sole owner automatically</li>
<li>Provides some protection against individual creditors of one spouse</li>
</ul>
<p>In Florida, when a married couple appears on a deed as husband and wife, the usual presumption is tenancy by the entireties.</p>

<h3>Florida Homestead</h3>
<p>Florida homestead rules give certain protections to an owner's primary residence:</p>
<ul>
<li>Limit forced sale by most judgment creditors</li>
<li>Provide a constitutional tax exemption</li>
<li>Impose restrictions on how homestead property can be devised in a will when there is a surviving spouse or minor children</li>
</ul>
<p>Homestead protections apply primarily to the primary residence of the owner, up to certain acreage limits.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Severalty means ownership by one person or entity</li>
<li>Tenancy in common has no survivorship rights</li>
<li>Joint tenancy includes right of survivorship</li>
<li>Tenancy by the entireties is for married couples only</li>
<li>Homestead protects the primary residence from creditors</li>
</ul>`,

    3: `<h2>Condos, Co-ops, HOAs, CDDs, Time Shares</h2>
<p>In the last lesson for Unit 8, we focus on common interest communities and time share ownership. These ownership forms are very common in Florida and appear frequently on exams.</p>

<h3>Condominiums</h3>
<p>A condominium is a form of ownership that combines individual ownership of a unit with shared ownership of common elements. The unit owner owns the interior space of the unit and an undivided share of common areas such as hallways, pools, and recreational facilities.</p>
<p>Condominiums are created by a declaration that describes the property and the rights of unit owners. Buyers must receive specific documents including the declaration, articles of incorporation, bylaws, rules, and financial information. Florida law provides a rescission period during which a purchaser may cancel after receiving the required documents.</p>

<h3>Cooperatives</h3>
<p>In a cooperative (co-op), a corporation owns the building, and residents purchase shares of stock in the corporation. The shareholder receives a proprietary lease to occupy a specific unit. The resident does not own real property directly, but rather an interest in a corporation that owns the property. Financing and transfer rules can be more complex than condominiums.</p>

<h3>Homeowners Associations (HOAs)</h3>
<p>HOAs govern planned developments where owners hold title to their lots or units and also share ownership or use rights in common areas such as private roads, parks, or amenities. HOAs enforce covenants, conditions, and restrictions (CC&Rs). Owners must comply with association rules and pay assessments.</p>

<h3>Community Development Districts (CDDs)</h3>
<p>CDDs are special-purpose units of local government that finance infrastructure and community improvements in certain developments. Property owners in a CDD pay assessments that help repay bonds issued for roads, utilities, and amenities. The presence of a CDD affects property taxes and assessments, so buyers must be informed.</p>

<h3>Time Shares</h3>
<p>A time share is a form of ownership or right to use property for a specific period each year. Two broad types:</p>
<ul>
<li><strong>Fee simple interest</strong> - The buyer owns a fractional interest in the property</li>
<li><strong>Right to use</strong> - The buyer has the contractual right to occupy a unit for a certain period for a certain number of years, but does not own the real property</li>
</ul>
<p>Time shares are heavily regulated to protect consumers against high-pressure sales tactics. Purchasers typically have a rescission period during which they can cancel the contract.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Condo owners own their unit plus an undivided share of common elements</li>
<li>Co-op residents own stock in a corporation and have a proprietary lease</li>
<li>HOAs enforce CC&Rs and collect assessments</li>
<li>CDDs are government entities that finance infrastructure</li>
<li>Time shares can be fee simple ownership or right to use</li>
</ul>`,

    4: `<h2>HOAs and Time Sharing</h2>
<p>This lesson provides additional detail on homeowners associations and time share regulations in Florida.</p>

<h3>HOA Governance</h3>
<p>Homeowners associations are governed by:</p>
<ul>
<li><strong>Declaration of Covenants</strong> - The master document creating the HOA and establishing CC&Rs</li>
<li><strong>Articles of Incorporation</strong> - Creates the HOA as a legal entity</li>
<li><strong>Bylaws</strong> - Internal operating rules for the association</li>
<li><strong>Rules and Regulations</strong> - Day-to-day policies adopted by the board</li>
</ul>

<h3>HOA Disclosure Requirements</h3>
<p>Before selling property in an HOA community, sellers must provide buyers with:</p>
<ul>
<li>A copy of the declaration and any amendments</li>
<li>The articles of incorporation and bylaws</li>
<li>Current rules and regulations</li>
<li>Financial information and assessment history</li>
<li>Any pending litigation involving the association</li>
</ul>

<h3>Time Share Regulations</h3>
<p>Florida heavily regulates time share sales to protect consumers:</p>
<ul>
<li><strong>Public offering statement</strong> - Must be provided before sale</li>
<li><strong>Rescission period</strong> - Buyers have 10 days to cancel after signing or receiving documents, whichever is later</li>
<li><strong>No deposits before rescission period expires</strong> - Developers cannot require payment until rescission period ends</li>
<li><strong>Advertising rules</strong> - Must be truthful and not misleading</li>
</ul>

<h3>Exchange Programs</h3>
<p>Many time share owners participate in exchange programs that allow them to trade their time at different resorts. Exchange companies facilitate these trades for a fee.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>HOA documents must be disclosed before sale</li>
<li>Time share buyers have a 10-day rescission period</li>
<li>Developers cannot collect deposits during rescission period</li>
<li>CC&Rs run with the land and bind future owners</li>
</ul>`
  },

  9: {
    1: `<h2>Types of Deeds</h2>
<p>Welcome to Unit 9 of the FoundationCE Florida Sales Associate Pre-Licensing Course. In this unit, we cover how ownership is transferred and how title is protected. Understanding deeds is fundamental to real estate practice.</p>

<h3>What is a Deed?</h3>
<p>A deed is a written instrument that conveys an interest in real property from a grantor (seller) to a grantee (buyer). For a deed to be valid, it must meet certain requirements under Florida law.</p>

<h3>Requirements for a Valid Deed</h3>
<ul>
<li>Must be in writing</li>
<li>Must identify the grantor and grantee</li>
<li>Must contain words of conveyance (granting clause)</li>
<li>Must have a legal description of the property</li>
<li>Must be signed by the grantor</li>
<li>Must be delivered to and accepted by the grantee</li>
</ul>

<h3>Types of Deeds</h3>

<h4>General Warranty Deed</h4>
<p>Provides the greatest protection to the buyer. The grantor warrants (guarantees) that:</p>
<ul>
<li>They have good title and the right to convey</li>
<li>The property is free from encumbrances except as noted</li>
<li>They will defend the title against all claims</li>
</ul>
<p>The warranties extend back to the origin of the title.</p>

<h4>Special Warranty Deed</h4>
<p>The grantor only warrants against defects that occurred during their period of ownership. Does not cover problems that existed before the grantor acquired the property.</p>

<h4>Quitclaim Deed</h4>
<p>Provides no warranties whatsoever. The grantor simply transfers whatever interest they may have, if any. Often used to clear up title defects or transfer property between family members.</p>

<h4>Bargain and Sale Deed</h4>
<p>Implies that the grantor has title but makes no warranties against encumbrances. Less common in Florida residential transactions.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>A deed must be in writing and signed by the grantor</li>
<li>General warranty deed provides the most protection</li>
<li>Special warranty deed covers only the grantor's period of ownership</li>
<li>Quitclaim deed provides no warranties</li>
<li>Delivery and acceptance are required to complete the transfer</li>
</ul>`,

    2: `<h2>Title Transfer Process</h2>
<p>In this lesson, we explore how title is transferred from seller to buyer and the importance of recording.</p>

<h3>Delivery and Acceptance</h3>
<p>A deed does not transfer title until it is delivered by the grantor and accepted by the grantee. Signing the deed alone is not enough. The grantor must have the intent to immediately transfer ownership.</p>

<h3>Recording the Deed</h3>
<p>After closing, the deed should be recorded in the public records of the county where the property is located. Recording provides constructive notice to the world that the transfer has occurred.</p>

<h3>Constructive Notice vs Actual Notice</h3>
<ul>
<li><strong>Constructive notice</strong> is notice that is presumed by law because information is available in the public records</li>
<li><strong>Actual notice</strong> is direct knowledge of a fact</li>
</ul>
<p>Recording protects the buyer against subsequent purchasers and creditors who might claim an interest in the property.</p>

<h3>Chain of Title</h3>
<p>The chain of title is the history of all recorded documents affecting ownership of a property. A title search examines this chain to identify any breaks, defects, or encumbrances.</p>

<h3>Title Insurance</h3>
<p>Title insurance protects against losses from defects in title that were not discovered during the title search. There are two types:</p>
<ul>
<li><strong>Owner's policy</strong> protects the buyer for as long as they own the property</li>
<li><strong>Lender's policy</strong> protects the mortgage lender for the amount of the loan</li>
</ul>
<p>The owner's policy is a one-time premium paid at closing. The lender usually requires a lender's policy as a condition of the loan.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Delivery and acceptance are required to transfer title</li>
<li>Recording provides constructive notice to the world</li>
<li>Title insurance protects against undiscovered defects</li>
<li>Owner's policy protects the buyer; lender's policy protects the lender</li>
<li>Chain of title shows the history of ownership</li>
</ul>`,

    3: `<h2>Title Insurance, Easements, and Liens</h2>
<p>In this final lesson for Unit 9, we examine encumbrances that affect title including easements and liens.</p>

<h3>Encumbrances</h3>
<p>An encumbrance is any claim, lien, charge, or liability attached to real property that may diminish its value or burden its title. Encumbrances do not necessarily prevent transfer of title, but they do affect it.</p>

<h3>Easements</h3>
<p>An easement is a right to use another person's land for a specific purpose. Common types include:</p>
<ul>
<li><strong>Easement appurtenant</strong> benefits a neighboring property (runs with the land)</li>
<li><strong>Easement in gross</strong> benefits a person or company rather than a property (like utility easements)</li>
<li><strong>Prescriptive easement</strong> acquired through open, continuous, and hostile use for a statutory period</li>
</ul>

<h3>Liens</h3>
<p>A lien is a charge against property that provides security for a debt or obligation. Types include:</p>
<ul>
<li><strong>Mortgage lien</strong> secures a loan used to purchase or refinance property</li>
<li><strong>Property tax lien</strong> secures unpaid property taxes</li>
<li><strong>Mechanic's lien</strong> secures payment for labor or materials used to improve property</li>
<li><strong>Judgment lien</strong> results from a court judgment against the property owner</li>
</ul>

<h3>Lien Priority</h3>
<p>When multiple liens exist, priority determines which gets paid first if the property is sold or foreclosed:</p>
<ul>
<li>Property tax liens generally have first priority</li>
<li>Other liens typically follow the order of recording (first in time, first in right)</li>
</ul>

<h3>Deed Restrictions</h3>
<p>Deed restrictions (or restrictive covenants) are private limitations on how property may be used. They run with the land and bind future owners. Common restrictions include building setbacks, architectural requirements, and use limitations.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Encumbrances affect title but do not prevent transfer</li>
<li>Easements grant use rights to others</li>
<li>Liens are security for debts and follow priority rules</li>
<li>Property tax liens generally have first priority</li>
<li>Deed restrictions run with the land</li>
</ul>`
  },

  10: {
    1: `<h2>Metes and Bounds</h2>
<p>Welcome to Unit 10 of the FoundationCE Florida Sales Associate Pre-Licensing Course. This unit covers legal descriptions, which are essential for accurately identifying real property in contracts, deeds, and other legal documents.</p>

<h3>What is a Legal Description?</h3>
<p>A legal description precisely identifies a parcel of real property in a way that distinguishes it from all other parcels. Street addresses are not legal descriptions because they can change and are not precise enough for legal purposes.</p>

<h3>Metes and Bounds</h3>
<p>The metes and bounds system is the oldest method of legal description. It describes property by starting at a defined point and tracing the boundaries using directions and distances.</p>

<h3>Key Terms</h3>
<ul>
<li><strong>Metes</strong> are measurements of distance (feet, chains, rods)</li>
<li><strong>Bounds</strong> are directions or references to natural or artificial landmarks</li>
<li><strong>Point of Beginning (POB)</strong> is where the description starts and must return</li>
<li><strong>Monument</strong> is a fixed point used as a reference (iron pin, tree, rock, etc.)</li>
</ul>

<h3>How It Works</h3>
<p>A metes and bounds description begins at a defined point of beginning, then describes the boundary lines using compass directions and distances. For example:</p>
<p>"Beginning at the iron pin on the north side of Main Street, thence north 45 degrees east 200 feet to an oak tree, thence south 45 degrees east 150 feet to a stone marker..."</p>
<p>The description must close, meaning it must return to the point of beginning.</p>

<h3>Advantages and Challenges</h3>
<p>Metes and bounds can describe irregularly shaped parcels with precision. However, descriptions can become lengthy and complex. Natural monuments may be destroyed or moved over time.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Metes are distances; bounds are directions or landmarks</li>
<li>Every description starts at a point of beginning (POB)</li>
<li>The description must close (return to the POB)</li>
<li>Monuments are fixed reference points</li>
<li>Metes and bounds is the oldest method of legal description</li>
</ul>`,

    2: `<h2>Rectangular Survey System</h2>
<p>In this lesson, we cover the rectangular survey system, also known as the government survey system, which is used throughout much of Florida and the western United States.</p>

<h3>Overview</h3>
<p>The rectangular survey system divides land into a grid pattern based on principal meridians (north-south lines) and base lines (east-west lines). Florida uses the Tallahassee Principal Meridian and Base Line as its reference point.</p>

<h3>Key Terms</h3>
<ul>
<li><strong>Township lines</strong> run east-west every 6 miles, creating horizontal rows</li>
<li><strong>Range lines</strong> run north-south every 6 miles, creating vertical columns</li>
<li><strong>Township</strong> is a 6-mile by 6-mile square formed by the intersection of township and range lines</li>
<li><strong>Section</strong> is a one-mile by one-mile square; each township contains 36 sections</li>
</ul>

<h3>Townships</h3>
<p>Each township is identified by its position relative to the base line and principal meridian. For example, "Township 2 South, Range 3 East" means the township is 2 rows south of the base line and 3 columns east of the principal meridian.</p>

<h3>Sections</h3>
<p>Each township contains 36 sections, numbered 1 through 36. Section 1 is in the northeast corner, and the numbering follows a serpentine pattern. Each section contains 640 acres.</p>

<h3>Subdividing Sections</h3>
<p>Sections can be divided into smaller parcels:</p>
<ul>
<li>A half section = 320 acres</li>
<li>A quarter section = 160 acres</li>
<li>A quarter of a quarter section = 40 acres</li>
</ul>
<p>Descriptions read from smallest to largest: "The NE 1/4 of the SW 1/4 of Section 12, Township 3 South, Range 2 East."</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Florida uses the Tallahassee Principal Meridian</li>
<li>Townships are 6 miles square and contain 36 sections</li>
<li>Each section is 1 mile square (640 acres)</li>
<li>Section 1 is in the northeast corner</li>
<li>Descriptions read from smallest to largest subdivision</li>
</ul>`,

    3: `<h2>Lot and Block (Recorded Plat)</h2>
<p>In this final lesson for Unit 10, we cover the lot and block system, which is the most common method for describing residential property in subdivisions.</p>

<h3>What is the Lot and Block System?</h3>
<p>The lot and block system (also called the recorded plat system) uses a recorded map or plat to identify individual lots within a subdivision. When a developer creates a subdivision, they record a plat map with the county that shows all lots, blocks, streets, and common areas.</p>

<h3>Components of a Plat</h3>
<ul>
<li><strong>Lot</strong> is an individual parcel of land</li>
<li><strong>Block</strong> is a group of lots surrounded by streets or other boundaries</li>
<li><strong>Plat book and page</strong> identify where the plat is recorded in public records</li>
</ul>

<h3>How Descriptions Work</h3>
<p>A lot and block description references the recorded plat. For example:</p>
<p>"Lot 14, Block 3, Sunny Acres Subdivision, according to the plat thereof recorded in Plat Book 45, Page 23, of the Public Records of Orange County, Florida."</p>

<h3>Advantages</h3>
<p>The lot and block system is simple and efficient. Once the plat is recorded, each lot can be described with just a few words. The plat contains all the detailed measurements and boundaries.</p>

<h3>Interpreting Legal Descriptions</h3>
<p>When you encounter any legal description:</p>
<ul>
<li>Determine which system is being used (metes and bounds, rectangular survey, or lot and block)</li>
<li>For lot and block, verify the plat recording information</li>
<li>For rectangular survey, work from smallest to largest subdivision</li>
<li>For metes and bounds, trace from point of beginning back to close</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Lot and block uses a recorded plat map</li>
<li>The plat must be recorded in the public records</li>
<li>Descriptions reference lot number, block, subdivision name, and recording information</li>
<li>This is the most common method for residential subdivisions</li>
<li>The plat contains all detailed measurements</li>
</ul>`
  }
};

lessonContentByUnit[11] = {
  1: `<h2>Contract Essentials</h2>
<p>Welcome to Unit 11 of the FoundationCE Florida Sales Associate Pre-Licensing Course. This unit covers real estate contracts, which are fundamental to every transaction.</p>

<h3>What is a Contract?</h3>
<p>A contract is a legally enforceable agreement between two or more parties. In real estate, contracts govern the sale, lease, and listing of property.</p>

<h3>Essential Elements of a Valid Contract</h3>
<ul>
<li><strong>Competent parties</strong> - Parties must be of legal age (18 in Florida) and sound mind</li>
<li><strong>Offer and acceptance</strong> - A valid offer must be accepted as presented (mutual assent)</li>
<li><strong>Legal purpose</strong> - The contract must be for a lawful objective</li>
<li><strong>Consideration</strong> - Something of value must be exchanged (money, promise, or action)</li>
</ul>

<h3>Statute of Frauds</h3>
<p>The Statute of Frauds requires certain contracts to be in writing to be enforceable, including:</p>
<ul>
<li>Contracts for the sale of real property</li>
<li>Leases for more than one year</li>
<li>Listing agreements for more than one year</li>
</ul>

<h3>Types of Contracts</h3>
<ul>
<li><strong>Express contract</strong> - Terms are stated in words (written or oral)</li>
<li><strong>Implied contract</strong> - Terms are understood from actions or circumstances</li>
<li><strong>Bilateral contract</strong> - Both parties make promises (most real estate contracts)</li>
<li><strong>Unilateral contract</strong> - One party makes a promise; the other acts (option contracts)</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Valid contracts require competent parties, offer/acceptance, legal purpose, and consideration</li>
<li>Real estate contracts must be in writing per the Statute of Frauds</li>
<li>Most real estate contracts are bilateral (mutual promises)</li>
</ul>`,

  2: `<h2>Purchase Agreements</h2>
<p>In this lesson, we examine the purchase and sale agreement, the most important contract in real estate transactions.</p>

<h3>Components of a Purchase Agreement</h3>
<ul>
<li><strong>Identification of parties</strong> - Full legal names of buyer and seller</li>
<li><strong>Property description</strong> - Legal description or sufficient identification</li>
<li><strong>Purchase price</strong> - Amount agreed upon</li>
<li><strong>Earnest money</strong> - Good faith deposit</li>
<li><strong>Financing terms</strong> - Cash, mortgage, or other arrangements</li>
<li><strong>Closing date</strong> - When title will transfer</li>
<li><strong>Contingencies</strong> - Conditions that must be met</li>
</ul>

<h3>Common Contingencies</h3>
<ul>
<li><strong>Financing contingency</strong> - Buyer must obtain loan approval</li>
<li><strong>Inspection contingency</strong> - Property must pass inspection</li>
<li><strong>Appraisal contingency</strong> - Property must appraise at or above purchase price</li>
<li><strong>Sale of existing home</strong> - Buyer must sell current property first</li>
</ul>

<h3>Earnest Money</h3>
<p>Earnest money demonstrates the buyer's good faith. In Florida, earnest money must be deposited within the time specified in the contract (usually 3 business days) into an escrow account.</p>

<h3>Contract Status</h3>
<ul>
<li><strong>Executed contract</strong> - All parties have performed their obligations</li>
<li><strong>Executory contract</strong> - Some obligations remain to be performed</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Purchase agreements must include all essential terms</li>
<li>Contingencies protect buyers during the transaction</li>
<li>Earnest money goes into escrow, not to the seller</li>
</ul>`,

  3: `<h2>Listing Contracts</h2>
<p>This lesson covers listing agreements, the contracts between property owners and real estate brokers.</p>

<h3>Types of Listing Agreements</h3>
<ul>
<li><strong>Exclusive right of sale</strong> - Broker earns commission regardless of who sells the property; most common and preferred by brokers</li>
<li><strong>Exclusive agency</strong> - Broker earns commission unless the owner sells the property without broker assistance</li>
<li><strong>Open listing</strong> - Non-exclusive; owner can give to multiple brokers; only the procuring cause earns commission</li>
<li><strong>Net listing</strong> - Broker keeps anything above a minimum price; legal in Florida but not recommended</li>
</ul>

<h3>Essential Elements of Listing Agreements</h3>
<ul>
<li>Names of all parties</li>
<li>Property description</li>
<li>Listing price</li>
<li>Commission rate or amount</li>
<li>Expiration date (required in Florida)</li>
<li>Broker's duties and responsibilities</li>
</ul>

<h3>Florida Requirements</h3>
<p>In Florida, all listing agreements must:</p>
<ul>
<li>Be in writing</li>
<li>Include a definite expiration date (no automatic renewal)</li>
<li>Specify the commission amount or rate</li>
<li>Be signed by the property owner</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Exclusive right of sale provides most protection for broker</li>
<li>All listings must have a definite expiration date in Florida</li>
<li>Net listings are legal but discouraged</li>
</ul>`,

  4: `<h2>Contract Remedies and Performance</h2>
<p>In this final lesson, we examine what happens when contracts are performed, breached, or terminated.</p>

<h3>Contract Performance</h3>
<ul>
<li><strong>Complete performance</strong> - All terms fulfilled; contract is executed</li>
<li><strong>Substantial performance</strong> - Minor deviations but main purpose achieved</li>
<li><strong>Partial performance</strong> - Only some obligations completed</li>
</ul>

<h3>Breach of Contract</h3>
<p>A breach occurs when a party fails to perform contractual obligations. Types include:</p>
<ul>
<li><strong>Material breach</strong> - Significant failure that defeats the contract purpose</li>
<li><strong>Minor breach</strong> - Slight deviation that doesn't defeat the purpose</li>
<li><strong>Anticipatory breach</strong> - One party announces they will not perform</li>
</ul>

<h3>Remedies for Breach</h3>
<ul>
<li><strong>Compensatory damages</strong> - Money to cover actual losses</li>
<li><strong>Liquidated damages</strong> - Pre-agreed amount (often the earnest money)</li>
<li><strong>Specific performance</strong> - Court orders completion of the contract; common in real estate because each property is unique</li>
<li><strong>Rescission</strong> - Contract is cancelled and parties returned to original positions</li>
</ul>

<h3>Contract Termination</h3>
<p>Contracts may terminate by:</p>
<ul>
<li>Performance (completion)</li>
<li>Mutual agreement</li>
<li>Operation of law (impossibility, death, bankruptcy)</li>
<li>Breach</li>
<li>Expiration of contingency period</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Specific performance is common in real estate due to unique properties</li>
<li>Liquidated damages are often set at the earnest money amount</li>
<li>Rescission returns parties to their pre-contract positions</li>
</ul>`
};

lessonContentByUnit[12] = {
  1: `<h2>Mortgage Basics</h2>
<p>Welcome to Unit 12 of the FoundationCE Florida Sales Associate Pre-Licensing Course. This unit explains how residential mortgage financing works.</p>

<h3>Lien Theory vs Title Theory</h3>
<p><strong>Florida is a lien theory state.</strong> In lien theory, the borrower holds legal title, and the lender has a lien on the property as security for the debt. The lien is removed once the loan is paid in full.</p>

<h3>Components of a Mortgage Loan</h3>
<p>Mortgage financing involves two separate documents:</p>
<ul>
<li><strong>Promissory note</strong> - The promise to repay the loan. It specifies the loan amount, interest rate, payment schedule, and repayment terms.</li>
<li><strong>Mortgage</strong> - The security instrument. It pledges the property as collateral for the debt. If the borrower defaults, the lender may foreclose.</li>
</ul>

<h3>Important Mortgage Clauses</h3>
<ul>
<li><strong>Acceleration clause</strong> - Allows the lender to demand full repayment if the borrower defaults</li>
<li><strong>Right to reinstate</strong> - Allows the borrower to bring the loan current</li>
<li><strong>Due on sale clause</strong> - Requires the loan to be paid off if the property is transferred</li>
<li><strong>Prepayment clause</strong> - May impose penalties for early payoff</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Florida is a lien theory state - borrower holds title</li>
<li>Promissory note is the promise to pay; mortgage is the security</li>
<li>Acceleration clause allows lender to demand full payment after default</li>
</ul>`,

  2: `<h2>Promissory Notes</h2>
<p>In this lesson, we examine the promissory note and its key elements.</p>

<h3>What is a Promissory Note?</h3>
<p>The promissory note is the borrower's written promise to repay the loan. It is the evidence of the debt and is a negotiable instrument that can be bought and sold.</p>

<h3>Key Elements of a Note</h3>
<ul>
<li><strong>Principal amount</strong> - The loan amount borrowed</li>
<li><strong>Interest rate</strong> - The cost of borrowing (fixed or adjustable)</li>
<li><strong>Payment schedule</strong> - Monthly payments, due dates</li>
<li><strong>Maturity date</strong> - When the loan must be paid in full</li>
<li><strong>Maker</strong> - The borrower who signs the note</li>
<li><strong>Payee</strong> - The lender who receives payments</li>
</ul>

<h3>Types of Interest Rates</h3>
<ul>
<li><strong>Fixed rate</strong> - Same rate for the entire loan term</li>
<li><strong>Adjustable rate (ARM)</strong> - Rate changes based on an index plus margin</li>
</ul>

<h3>Amortization</h3>
<p>Amortization refers to the repayment of a loan through regular payments. <strong>Early payments</strong> consist mostly of interest. As time passes, more goes toward principal.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>The note is the evidence of debt; the mortgage is the security</li>
<li>Fixed rates stay constant; ARMs change with market conditions</li>
<li>Early payments are mostly interest</li>
</ul>`,

  3: `<h2>Mortgage Instruments</h2>
<p>This lesson covers the mortgage document and its legal requirements.</p>

<h3>The Mortgage Document</h3>
<p>The mortgage is the security instrument that pledges the property as collateral. It gives the lender the right to foreclose if the borrower defaults.</p>

<h3>Recording Requirements</h3>
<p>Mortgages should be recorded in public records to provide constructive notice of the lender's lien. Recording protects the lender's priority position.</p>

<h3>Mortgage Priority</h3>
<p>Priority is generally determined by recording date ("first in time, first in right"). However, property taxes and special assessments have priority over all mortgages.</p>

<h3>Loan-to-Value Ratio (LTV)</h3>
<p>LTV = Loan Amount / Property Value. Example: $240,000 loan / $300,000 value = 80% LTV. Lower LTV means less risk for the lender.</p>

<h3>Discount Points</h3>
<p>One discount point = 1% of the loan amount. Points are paid upfront to reduce the interest rate. One point typically lowers the rate by about 1/8 percent.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Recording protects lender's priority</li>
<li>Property taxes have priority over mortgages</li>
<li>One point = 1% of loan amount</li>
</ul>`
};

lessonContentByUnit[13] = {
  1: `<h2>Conventional Loan Programs</h2>
<p>Welcome to Unit 13 of the FoundationCE Florida Sales Associate Pre-Licensing Course. This unit explores various loan programs and financing options.</p>

<h3>Conforming vs Non-Conforming Loans</h3>
<p><strong>Conforming loans</strong> meet the standards set by Fannie Mae and Freddie Mac, including loan limits. <strong>Non-conforming loans</strong> (jumbo loans) exceed these limits or don't meet other standards.</p>

<h3>Private Mortgage Insurance (PMI)</h3>
<p>Conventional loans with less than 20% down payment typically require PMI to protect the lender against default.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Conforming loans meet Fannie Mae/Freddie Mac standards</li>
<li>Jumbo loans exceed conforming limits</li>
<li>PMI is required for low down payment conventional loans</li>
</ul>`,

  2: `<h2>Government Loan Programs</h2>
<p>This lesson covers government-backed loan programs in detail.</p>

<h3>FHA Loan Features</h3>
<ul>
<li>Low down payment (as low as 3.5%)</li>
<li>Mortgage insurance premium required</li>
<li>Property must meet FHA standards</li>
<li>Loan limits vary by county</li>
</ul>

<h3>VA Loan Features</h3>
<ul>
<li>No down payment required for eligible veterans</li>
<li>No monthly mortgage insurance</li>
<li>Funding fee may be required</li>
<li>Certificate of eligibility needed</li>
</ul>

<h3>USDA Rural Development Loans</h3>
<p>USDA loans assist buyers in rural areas with low or moderate income. No down payment required for eligible properties and borrowers.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>FHA requires mortgage insurance; VA does not</li>
<li>VA loans are for eligible veterans only</li>
<li>USDA loans are for rural areas</li>
</ul>`,

  3: `<h2>Creative Financing Options</h2>
<p>This lesson explores alternative financing methods.</p>

<h3>Seller Financing</h3>
<p>The seller acts as the lender, allowing the buyer to make payments directly to the seller. This can help buyers who cannot qualify for traditional financing.</p>

<h3>Assumable Loans</h3>
<p>Some loans can be assumed by a new buyer. FHA and VA loans may be assumable. Most conventional loans have due-on-sale clauses preventing assumption.</p>

<h3>Lease Option</h3>
<p>A lease with an option to purchase allows a tenant to rent with the right to buy the property later at a predetermined price.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Seller financing allows the seller to be the lender</li>
<li>FHA and VA loans may be assumable</li>
<li>Due-on-sale clauses prevent most loan assumptions</li>
</ul>`
};

lessonContentByUnit[14] = {
  1: `<h2>Closing Statements, Debits and Credits</h2>
<p>Welcome to Unit 14 of the FoundationCE Florida Sales Associate Pre-Licensing Course. In this unit, we learn how to prepare closing statements, calculate prorations, and apply Florida transfer taxes.</p>

<h3>Understanding Closing Statements</h3>
<p>A closing statement summarizes the financial details of a real estate transaction. It shows what the buyer must pay and what the seller will receive.</p>

<h3>Debits and Credits</h3>
<ul>
<li><strong>Debit</strong> - An amount owed or paid. It increases the amount a party must bring to closing.</li>
<li><strong>Credit</strong> - An amount received or owed to the party. It reduces the amount required at closing.</li>
</ul>

<h3>Common Buyer Debits</h3>
<p>Purchase price, recording fees, loan origination fees, documentary stamps on the note, intangible tax, and prepaid expenses.</p>

<h3>Common Seller Debits</h3>
<p>Real estate commission, documentary stamps on the deed, and prorated rent or taxes owed to the buyer.</p>

<h3>Common Buyer Credits</h3>
<p>Earnest money deposits and new loan proceeds.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Debits increase what a party owes; credits reduce it</li>
<li>Earnest money is a buyer credit</li>
<li>Purchase price is a buyer debit</li>
</ul>`,

  2: `<h2>Prorations, Prepaid Items, Accrued Items</h2>
<p>In this lesson, we work through prorations. Prorations allocate expenses or income between the buyer and seller based on the date of closing.</p>

<h3>Prepaid vs Accrued Items</h3>
<ul>
<li><strong>Prepaid items</strong> are paid in advance. Examples: rent collected for future periods, insurance premiums. Prepaid items are credited to the seller and debited to the buyer.</li>
<li><strong>Accrued items</strong> are expenses incurred but not yet paid. Example: property taxes in Florida are usually accrued. Accrued items are credited to the buyer and debited to the seller.</li>
</ul>

<h3>Proration Methods</h3>
<ul>
<li><strong>365-day method</strong> - Divides yearly amount by 365</li>
<li><strong>360-day method</strong> - Divides yearly amount by 360 (using 30-day months)</li>
</ul>
<p>If not specified, the 365-day method is standard for Florida.</p>

<h3>Proration Example</h3>
<p>Annual taxes are $3,600. Closing occurs October 15. Taxes are paid in arrears.</p>
<ol>
<li>Daily rate: $3,600 / 365 = $9.86 per day</li>
<li>Seller's days (Jan 1 - Oct 15): 288 days</li>
<li>Seller owes: 288 x $9.86 = $2,838.08 (seller debit, buyer credit)</li>
</ol>

<h3>Key Points to Remember</h3>
<ul>
<li>Prepaid = seller credit, buyer debit</li>
<li>Accrued = buyer credit, seller debit</li>
<li>Florida taxes are typically paid in arrears</li>
</ul>`,

  3: `<h2>Florida Transfer Taxes, Doc Stamps, Intangible Tax</h2>
<p>In this final lesson, we apply Florida's state transfer taxes. These are tested frequently and must be memorized.</p>

<h3>Documentary Stamp Tax on Deeds</h3>
<p>Rate: <strong>$0.70 per $100 of consideration</strong> in most counties. To calculate: round up to nearest $100, divide by 100, multiply by $0.70. This is typically a <strong>seller debit</strong>.</p>

<h3>Documentary Stamp Tax on Notes</h3>
<p>Rate: <strong>$0.35 per $100 of loan amount</strong>. This is typically a <strong>buyer debit</strong>.</p>

<h3>Intangible Tax on Mortgages</h3>
<p>Rate: <strong>2 mills ($2 per $1,000 borrowed)</strong> or multiply loan amount by 0.002. Applies to new mortgages only. This is a <strong>buyer debit</strong>.</p>

<h3>Example Calculation</h3>
<p>Home sells for $250,000 with a $200,000 new mortgage:</p>
<ul>
<li>Doc stamps on deed: $250,000 / 100 x $0.70 = $1,750 (seller)</li>
<li>Doc stamps on note: $200,000 / 100 x $0.35 = $700 (buyer)</li>
<li>Intangible tax: $200,000 x 0.002 = $400 (buyer)</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Deed stamps: $0.70 per $100 - paid by seller</li>
<li>Note stamps: $0.35 per $100 - paid by buyer</li>
<li>Intangible tax: $2 per $1,000 - paid by buyer on new mortgages only</li>
</ul>`,

  4: `<h2>RESPA Requirements</h2>
<p>This lesson covers the Real Estate Settlement Procedures Act (RESPA) and its requirements for residential mortgage transactions.</p>

<h3>What is RESPA?</h3>
<p>RESPA is a federal law that protects consumers in the home-buying process. It requires disclosures about settlement costs and prohibits certain practices that increase costs to consumers.</p>

<h3>Key RESPA Requirements</h3>
<ul>
<li><strong>Loan Estimate</strong> - Must be provided within 3 business days of loan application</li>
<li><strong>Closing Disclosure</strong> - Must be provided at least 3 business days before closing</li>
<li><strong>Affiliated Business Disclosure</strong> - Required when referring to affiliated service providers</li>
</ul>

<h3>Prohibited Practices</h3>
<ul>
<li><strong>Kickbacks</strong> - Payments for referrals of settlement services are illegal</li>
<li><strong>Fee splitting</strong> - Splitting fees for services not actually performed is prohibited</li>
<li><strong>Seller-required title insurance</strong> - Sellers cannot require buyers to use a specific title company</li>
</ul>

<h3>Escrow Account Rules</h3>
<p>RESPA limits the amount lenders can require for escrow accounts. Lenders may collect:</p>
<ul>
<li>Two months cushion above the amount needed for annual taxes and insurance</li>
<li>Must provide annual escrow account statements</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Loan Estimate within 3 days of application</li>
<li>Closing Disclosure at least 3 days before closing</li>
<li>Kickbacks for referrals are illegal under RESPA</li>
</ul>`
};

lessonContentByUnit[15] = {
  1: `<h2>Market Supply and Demand</h2>
<p>Welcome to Unit 15 of the FoundationCE Florida Sales Associate Pre-Licensing Course. This unit covers real estate markets and market analysis.</p>

<h3>Understanding Supply and Demand</h3>
<p>Real estate markets are governed by the basic economic principles of supply and demand. When demand exceeds supply, prices rise. When supply exceeds demand, prices fall.</p>

<h3>Factors Affecting Demand</h3>
<ul>
<li><strong>Population growth</strong> - More people means more housing demand</li>
<li><strong>Employment rates</strong> - Jobs bring buyers to an area</li>
<li><strong>Interest rates</strong> - Lower rates increase buying power</li>
<li><strong>Consumer confidence</strong> - Optimism encourages home purchases</li>
<li><strong>Local amenities</strong> - Schools, parks, and services attract buyers</li>
</ul>

<h3>Factors Affecting Supply</h3>
<ul>
<li><strong>Construction costs</strong> - Higher costs reduce new development</li>
<li><strong>Land availability</strong> - Limited land restricts supply</li>
<li><strong>Government regulations</strong> - Zoning and permits affect development</li>
<li><strong>Labor availability</strong> - Worker shortages slow construction</li>
</ul>

<h3>Market Equilibrium</h3>
<p>Market equilibrium occurs when supply equals demand. At this point, prices stabilize and properties sell within typical timeframes.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>High demand + low supply = rising prices (seller's market)</li>
<li>Low demand + high supply = falling prices (buyer's market)</li>
<li>Interest rates significantly impact buyer purchasing power</li>
</ul>`,

  2: `<h2>Market Cycles</h2>
<p>In this lesson, we examine real estate market cycles and how they affect property values.</p>

<h3>The Four Phases of Real Estate Cycles</h3>
<ul>
<li><strong>Recovery</strong> - Market begins to improve after a downturn; vacancies decline slowly</li>
<li><strong>Expansion</strong> - Demand increases; prices rise; new construction begins</li>
<li><strong>Hyper-supply</strong> - Too much construction; supply exceeds demand</li>
<li><strong>Recession</strong> - Prices decline; vacancies increase; construction slows</li>
</ul>

<h3>Characteristics of Each Phase</h3>
<p><strong>Recovery:</strong> Bargain prices, cautious buyers, low construction activity</p>
<p><strong>Expansion:</strong> Rising prices, increasing confidence, new development starts</p>
<p><strong>Hyper-supply:</strong> Peak prices, speculative building, first signs of oversupply</p>
<p><strong>Recession:</strong> Declining prices, high vacancies, foreclosures increase</p>

<h3>Indicators to Watch</h3>
<ul>
<li>Days on market</li>
<li>Inventory levels (months of supply)</li>
<li>Price trends</li>
<li>Building permits issued</li>
<li>Foreclosure rates</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Real estate markets are cyclical</li>
<li>Each phase presents different opportunities and risks</li>
<li>6 months of inventory is considered balanced</li>
</ul>`,

  3: `<h2>Comparative Market Analysis</h2>
<p>This lesson covers how agents analyze the market to help clients price properties correctly.</p>

<h3>What is a CMA?</h3>
<p>A Comparative Market Analysis (CMA) is a report prepared by a real estate agent to help determine a property's market value by comparing it to similar recently sold properties.</p>

<h3>CMA Components</h3>
<ul>
<li><strong>Subject property</strong> - The property being analyzed</li>
<li><strong>Comparable sales</strong> - Recently sold similar properties (comps)</li>
<li><strong>Active listings</strong> - Currently listed similar properties (competition)</li>
<li><strong>Expired listings</strong> - Properties that didn't sell (overpriced examples)</li>
</ul>

<h3>Selecting Comparables</h3>
<p>Ideal comparables should be:</p>
<ul>
<li>Sold within the past 3-6 months</li>
<li>Within 1 mile of the subject (or same neighborhood)</li>
<li>Similar in size, age, and condition</li>
<li>Same property type (single-family, condo, etc.)</li>
</ul>

<h3>Making Adjustments</h3>
<p>When comparables differ from the subject:</p>
<ul>
<li>Adjust the comparable's price, not the subject</li>
<li>Add value if comparable is inferior</li>
<li>Subtract value if comparable is superior</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>CMA is not an appraisal (agents cannot "appraise")</li>
<li>Use 3-6 comparable sales for best accuracy</li>
<li>Recent sales are more reliable than older ones</li>
</ul>`
};

lessonContentByUnit[16] = {
  1: `<h2>Purpose of Appraisal, USPAP, Value Concepts, Principles of Value</h2>
<p>Welcome to Unit 16 of the FoundationCE Florida Sales Associate Pre-Licensing Course. Appraisal concepts appear heavily on both state and national portions of the exam.</p>

<h3>What is an Appraisal?</h3>
<p>Appraisals are professional opinions of value developed by licensed appraisers. Lenders require appraisals to ensure property provides sufficient collateral for the loan.</p>

<h3>USPAP</h3>
<p>Appraisers must follow the Uniform Standards of Professional Appraisal Practice (USPAP), which establishes ethical conduct, confidentiality, impartiality, and reporting standards.</p>

<h3>Four Characteristics of Value</h3>
<ul>
<li><strong>Scarcity</strong> - Supply is limited</li>
<li><strong>Utility</strong> - Property is useful</li>
<li><strong>Demand</strong> - People want and can afford it</li>
<li><strong>Transferability</strong> - Ownership rights can be conveyed</li>
</ul>

<h3>Principles of Value</h3>
<ul>
<li><strong>Substitution</strong> - Buyers won't pay more than cost of acquiring a similar property</li>
<li><strong>Conformity</strong> - Value is maximized when property fits surroundings</li>
<li><strong>Contribution</strong> - How much a feature adds to overall value</li>
<li><strong>Highest and best use</strong> - Most productive legal use of the property</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>USPAP sets ethical standards for appraisers</li>
<li>Value requires DUST (Demand, Utility, Scarcity, Transferability)</li>
<li>Substitution: buyers compare alternatives</li>
</ul>`,

  2: `<h2>Sales Comparison, Cost Approach, Income Approach</h2>
<p>In this lesson, we analyze the three approaches used by appraisers to estimate value.</p>

<h3>Sales Comparison Approach</h3>
<p>Compares subject property to similar recently sold properties. Adjustments made for differences in size, condition, location, and amenities.</p>
<p><strong>Key rule:</strong> If comparable is SUPERIOR, SUBTRACT. If comparable is INFERIOR, ADD.</p>
<p>Most reliable for: residential properties and vacant lots.</p>

<h3>Cost Approach</h3>
<p>Estimates land value plus cost to reproduce/replace improvements, minus depreciation.</p>
<p>Steps:</p>
<ol>
<li>Estimate land value</li>
<li>Estimate reproduction/replacement cost</li>
<li>Subtract depreciation</li>
<li>Add land value to depreciated cost</li>
</ol>
<p>Most reliable for: new construction, special purpose properties, properties with few comparables.</p>

<h3>Income Approach</h3>
<p>Values property based on income it produces. Uses gross rent multiplier (GRM) or capitalization rate.</p>
<ul>
<li><strong>GRM</strong> = Price / Gross Monthly Rent (for 1-4 unit residential)</li>
<li><strong>Value using IRV</strong> = NOI / Cap Rate</li>
</ul>
<p>Most reliable for: income-producing properties.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Sales comparison: adjust from comparable to subject</li>
<li>Cost approach starts with land value</li>
<li>Income approach uses NOI and cap rate</li>
</ul>`,

  3: `<h2>Depreciation, GRM, GIM, Reconciliation, Exam Strategy</h2>
<p>In this final lesson of Unit 16, we focus on depreciation, income multipliers, and reconciliation.</p>

<h3>Types of Depreciation</h3>
<ul>
<li><strong>Physical deterioration</strong> - Wear and tear</li>
<li><strong>Functional obsolescence</strong> - Out-of-date features or poor design</li>
<li><strong>External obsolescence</strong> - Negative influences outside the property (noise, pollution)</li>
</ul>
<p>Depreciation can be <strong>curable</strong> (cost-effective to repair) or <strong>incurable</strong> (costs more to fix than value gained).</p>

<h3>Income Multipliers</h3>
<ul>
<li><strong>GRM (Gross Rent Multiplier)</strong> - Uses gross monthly rent for small residential income properties</li>
<li><strong>GIM (Gross Income Multiplier)</strong> - Uses annual income for commercial and larger properties</li>
</ul>

<h3>Reconciliation</h3>
<p>The final step where the appraiser reviews reliability of each approach and gives weight to the most appropriate one to reach the final opinion of value.</p>
<ul>
<li>Sales comparison is most reliable for homes</li>
<li>Income approach is most reliable for income properties</li>
<li>Cost approach is most reliable for new/special-use properties</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>External obsolescence is caused by factors outside the property</li>
<li>GRM uses monthly rent; GIM uses annual income</li>
<li>Reconciliation produces the final value opinion</li>
</ul>`
};

lessonContentByUnit[17] = {
  1: `<h2>Investment Fundamentals, Risk, Leverage, Return</h2>
<p>Welcome to Unit 17 of the FoundationCE Florida Sales Associate Pre-Licensing Course. In this unit we explore real estate as an investment.</p>

<h3>Advantages of Real Estate Investment</h3>
<ul>
<li><strong>Leverage</strong> - Control large assets with limited capital by borrowing</li>
<li><strong>Appreciation</strong> - Value increases over time</li>
<li><strong>Income</strong> - Cash flow from rent</li>
<li><strong>Tax benefits</strong> - Depreciation and interest deductions</li>
</ul>

<h3>Disadvantages</h3>
<ul>
<li>Not highly liquid</li>
<li>Risk of vacancies and market swings</li>
<li>Unexpected expenses</li>
</ul>

<h3>Risk and Return</h3>
<p><strong>Risk</strong> is the chance that actual return will differ from expected return. Higher risk often accompanies higher potential reward.</p>
<p><strong>Leverage</strong> magnifies gains but also magnifies losses. High leverage increases risk because debt payments must be made even when income declines.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Leverage allows control with limited capital</li>
<li>Real estate is not liquid</li>
<li>Higher leverage = higher risk</li>
</ul>`,

  2: `<h2>Cash Flow, Cap Rate, IRV, Cash on Cash, Equity Buildup</h2>
<p>In this lesson we apply investment math. These formulas are critical for exam success.</p>

<h3>Key Formulas</h3>
<ul>
<li><strong>NOI</strong> = Effective Gross Income - Operating Expenses (debt service NOT included)</li>
<li><strong>Cash Flow</strong> = NOI - Debt Service</li>
</ul>

<h3>The IRV Formula</h3>
<p>Used for income property valuation:</p>
<ul>
<li>I = Net Operating Income</li>
<li>R = Capitalization Rate</li>
<li>V = Value</li>
</ul>
<p>Formulas:</p>
<ul>
<li><strong>Value</strong> = I / R</li>
<li><strong>NOI</strong> = V x R</li>
<li><strong>Cap Rate</strong> = I / V</li>
</ul>

<h3>Cash on Cash Return</h3>
<p>Annual cash flow divided by initial cash invested. Shows return on actual dollars invested.</p>

<h3>Equity Buildup</h3>
<p>Occurs when loan principal is reduced over time. As mortgage is paid down, investor's equity increases.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>NOI excludes debt service</li>
<li>Value = NOI / Cap Rate</li>
<li>Cash on cash = Cash flow / Cash invested</li>
</ul>`,

  3: `<h2>Business Brokerage, Financial Statements, Goodwill, Going Concern</h2>
<p>In this final lesson, we explore business brokerage concepts.</p>

<h3>Business Brokerage</h3>
<p>Involves the sale of an ongoing enterprise. Unlike real property brokerage, business brokerage deals with intangible assets, goodwill, and operational performance.</p>

<h3>Key Terms</h3>
<ul>
<li><strong>Going concern</strong> - A business that continues operations with measurable cash flow, inventory, equipment, contracts, and customer relationships</li>
<li><strong>Goodwill</strong> - Intangible value including reputation, brand awareness, and customer loyalty. May increase purchase price beyond asset value.</li>
</ul>

<h3>Financial Statements</h3>
<ul>
<li><strong>Balance sheet</strong> - Lists assets, liabilities, and equity</li>
<li><strong>Income statement</strong> - Shows revenue, expenses, and net profit</li>
<li><strong>Cash flow statement</strong> - Tracks inflows and outflows of cash</li>
</ul>

<h3>Asset Sale vs Stock Sale</h3>
<ul>
<li><strong>Asset sale</strong> - Buyer purchases equipment, inventory, and other assets without corporate stock</li>
<li><strong>Stock sale</strong> - Buyer purchases ownership of the corporation itself, including liabilities</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Goodwill is intangible value</li>
<li>Balance sheet: assets, liabilities, equity</li>
<li>Florida requires a real estate license for business brokerage</li>
</ul>`
};

lessonContentByUnit[18] = {
  1: `<h2>Property Taxes, Assessed Value, Exemptions, Taxable Value</h2>
<p>Welcome to Unit 18 of the FoundationCE Florida Sales Associate Pre-Licensing Course. This unit explains property taxes, exemptions, and federal tax rules.</p>

<h3>Ad Valorem Taxes</h3>
<p>Florida real estate taxes are <strong>ad valorem taxes</strong>, meaning "based on value."</p>

<h3>Assessed Value</h3>
<p>The county property appraiser determines assessed value. Market value is what the property would sell for. Assessed value is market value minus assessment limitations.</p>

<h3>Florida Homestead Exemption</h3>
<p>A Florida resident who owns and occupies property as primary residence may receive up to <strong>$50,000 exemption</strong>:</p>
<ul>
<li>First $25,000 applies to all property taxes</li>
<li>Second $25,000 applies only to non-school taxes</li>
</ul>

<h3>Calculating Property Tax</h3>
<p><strong>Taxable value</strong> = Assessed value - Exemptions</p>
<p><strong>Property tax</strong> = Taxable value x Millage rate</p>
<p>Millage is expressed as dollars per thousand dollars of taxable value.</p>
<p>Example: $100,000 taxable value x 20 mills = $2,000 tax</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Ad valorem means based on value</li>
<li>Homestead exemption is up to $50,000</li>
<li>Millage = dollars per $1,000 of value</li>
</ul>`,

  2: `<h2>Depreciation, Basis, Capital Gains, Federal Taxation</h2>
<p>In this lesson, we study federal income tax rules for homeowners and investors.</p>

<h3>Homeowner Deductions</h3>
<p>Homeowners may deduct mortgage interest and property taxes. They <strong>cannot</strong> deduct repairs or improvements.</p>

<h3>Investor Deductions</h3>
<p>Investors may deduct operating expenses, mortgage interest, property taxes, insurance, repairs, maintenance, management fees, and depreciation.</p>

<h3>Depreciation</h3>
<p>Cost recovery for income-producing property. <strong>Land cannot be depreciated.</strong></p>
<p>Residential rental property is depreciated over <strong>27.5 years</strong> using straight-line depreciation.</p>
<p>Annual depreciation = (Purchase price - Land value + Improvements) / 27.5</p>

<h3>Capital Gains</h3>
<p><strong>Capital gain</strong> = Selling price - Adjusted basis</p>
<p><strong>Adjusted basis</strong> = Original cost + Improvements - Depreciation taken</p>

<h3>Homeowner Exclusion</h3>
<p>Homeowners may exclude up to $250,000 of capital gains (single) or $500,000 (married filing jointly) if they owned and occupied the home for 2 of the previous 5 years.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Land cannot be depreciated</li>
<li>Residential rental: 27.5 year depreciation</li>
<li>Capital gain = Selling price - Adjusted basis</li>
</ul>`,

  3: `<h2>1031 Exchange, Save Our Homes, Non-Deductible Items</h2>
<p>In this final lesson, we examine tax-deferred exchanges and Save Our Homes.</p>

<h3>1031 Exchange</h3>
<p>Allows investors to defer capital gains tax by exchanging one investment property for another. Requirements:</p>
<ul>
<li>Properties must be like-kind</li>
<li>Strict time limits for identification and closing</li>
<li>Tax is <strong>deferred, not forgiven</strong></li>
</ul>

<h3>Save Our Homes</h3>
<p>Florida's amendment limits annual increases in assessed value for homesteaded property to the <strong>lesser of 3% or the change in CPI</strong>. Protects homeowners from large tax increases.</p>

<h3>Non-Deductible Items</h3>
<p>For homeowners and investors:</p>
<ul>
<li>Principal payments</li>
<li>Personal expenses</li>
<li>Improvements to primary residence (not deductible but add to basis)</li>
</ul>

<h3>Exam Rules to Remember</h3>
<ul>
<li>Homeowners deduct interest and property taxes only</li>
<li>Investors deduct a wide range of expenses including depreciation</li>
<li>1031 exchanges defer but do not eliminate tax</li>
<li>Capital gain = Selling price - Adjusted basis</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>1031 exchange defers tax, doesn't eliminate it</li>
<li>Save Our Homes limits annual assessment increases to 3% or CPI</li>
<li>Principal payments are never deductible</li>
</ul>`
};

lessonContentByUnit[19] = {
  1: `<h2>Planning Authority, Zoning, Land Use Controls</h2>
<p>Welcome to Unit 19 of the FoundationCE Florida Sales Associate Pre-Licensing Course. This unit explains planning, zoning, and environmental issues impacting real estate.</p>

<h3>Police Power</h3>
<p>Local governments regulate land use through police power, which includes zoning, building codes, subdivision regulations, and environmental protection.</p>

<h3>Comprehensive Plans</h3>
<p>Guide long-term development including goals for population growth, land use, transportation, utilities, and environmental protection.</p>

<h3>Zoning Classifications</h3>
<ul>
<li><strong>Residential</strong> - Regulates density, building height, lot size, setbacks, parking</li>
<li><strong>Commercial</strong> - Regulates signage, traffic flow, intensity of use</li>
<li><strong>Industrial</strong> - Controls hazardous activities, noise, truck routes</li>
<li><strong>Agricultural</strong> - Preserves farmland, limits non-agricultural uses</li>
<li><strong>Special purpose</strong> - Schools, hospitals, parks, government buildings</li>
</ul>

<h3>Key Points to Remember</h3>
<ul>
<li>Police power includes zoning and building codes</li>
<li>Comprehensive plans guide long-term development</li>
<li>Industrial zoning controls hazardous activities</li>
</ul>`,

  2: `<h2>Variances, Exceptions, Nonconforming Use, Subdivisions</h2>
<p>In this lesson, we examine how property owners obtain relief from zoning rules and how land is developed.</p>

<h3>Nonconforming Use</h3>
<p>A property use that existed before new zoning rules were adopted. Allowed to continue because it was legal when established. <strong>Cannot expand or intensify</strong> beyond what existed originally.</p>

<h3>Variance</h3>
<p>Permission to deviate from specific zoning requirements due to hardship. Does not change the zoning classification. Examples: reduced setback, modified height requirement.</p>

<h3>Special Exception (Conditional Use)</h3>
<p>Allows a use that is permitted only under certain conditions after public review. Examples: churches or day care centers in residential zones.</p>

<h3>Subdivision Process</h3>
<ol>
<li>Developer submits preliminary plat showing lot lines, streets, easements, drainage, utilities</li>
<li>Review and approval</li>
<li>Final plat recorded in public records</li>
</ol>

<h3>Building Permits and Certificates</h3>
<p>Building permits required before construction. Inspections occur throughout building process. Certificate of occupancy issued when structure meets code requirements.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Nonconforming use was legal when established</li>
<li>Variance allows deviation due to hardship</li>
<li>Certificate of occupancy confirms code compliance</li>
</ul>`,

  3: `<h2>Environmental Hazards, CERCLA, Disclosure, Flood Zones</h2>
<p>In this final lesson, we focus on environmental hazards and disclosure requirements.</p>

<h3>Common Environmental Hazards</h3>
<ul>
<li><strong>Asbestos</strong> - Found in older buildings; dangerous when disturbed; removal requires licensed professionals</li>
<li><strong>Radon</strong> - Naturally occurring radioactive gas in soil; Florida requires radon disclosure</li>
<li><strong>Lead-based paint</strong> - Banned after 1978; homes built before require federal disclosure and pamphlet</li>
<li><strong>Mold</strong> - Grows in moist environments; may create health concerns</li>
</ul>

<h3>CERCLA (Superfund)</h3>
<p>The Comprehensive Environmental Response, Compensation, and Liability Act created the Superfund program. Property owners, operators, and even lenders may be liable for cleanup. <strong>Liability is joint and several</strong> - one party may be held accountable for the entire cleanup.</p>

<h3>Flood Zones</h3>
<p>Designated by FEMA. Buyers with federally backed loans must carry flood insurance if in a special flood hazard area.</p>

<h3>Wetlands</h3>
<p>Protected areas requiring special permits for development.</p>

<h3>Disclosure Requirements</h3>
<p>Florida requires disclosure of known environmental defects. Lead paint disclosure required for pre-1978 homes.</p>

<h3>Key Points to Remember</h3>
<ul>
<li>Lead paint disclosure for homes built before 1978</li>
<li>CERCLA liability is joint and several</li>
<li>Flood insurance required in special flood hazard areas</li>
<li>Radon disclosure required in Florida</li>
</ul>`
};
