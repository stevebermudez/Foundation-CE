import { db } from "./db";
import { practiceExams, examQuestions } from "@shared/schema";
import { eq, and, like } from "drizzle-orm";

interface QuizQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

interface UnitQuiz {
  unitNumber: number;
  questions: QuizQuestion[];
}

const quizzes: UnitQuiz[] = [
  {
    unitNumber: 2,
    questions: [
      { question: "The primary purpose of Florida real estate license law is to", optionA: "increase the income of real estate licensees", optionB: "protect the public by regulating real estate brokers and sales associates", optionC: "create a standard form of real estate contract", optionD: "regulate interest rates charged on real estate loans", correctAnswer: "B" },
      { question: "Which state agency is responsible for licensing and regulating real estate professionals in Florida", optionA: "Department of Financial Services", optionB: "Department of Business and Professional Regulation", optionC: "Department of State", optionD: "Real Estate Recovery Fund", correctAnswer: "B" },
      { question: "Which entity provides administrative and ministerial support services specifically for the Florida Real Estate Commission", optionA: "Division of Professions", optionB: "Division of Real Estate", optionC: "Florida Supreme Court", optionD: "Attorney General", correctAnswer: "B" },
      { question: "Which Florida statute chapter primarily contains the real estate license law", optionA: "Chapter 20", optionB: "Chapter 120", optionC: "Chapter 455", optionD: "Chapter 475", correctAnswer: "D" },
      { question: "Which of the following is one of the basic qualifications for a Florida sales associate license", optionA: "United States citizenship", optionB: "Florida residency", optionC: "High school diploma or equivalent", optionD: "College degree in real estate", correctAnswer: "C" },
      { question: "A sales associate applicant was convicted of a misdemeanor 5 years ago and had adjudication withheld. On the license application, the applicant must", optionA: "omit the information because adjudication was withheld", optionB: "omit the information because it is older than 3 years", optionC: "disclose the offense if asked, even if adjudication was withheld", optionD: "disclose only felonies, not misdemeanors", correctAnswer: "C" },
      { question: "Failure to disclose a prior criminal conviction on a license application", optionA: "is acceptable if the conviction was sealed", optionB: "may be grounds for denial of the application", optionC: "has no effect if the applicant later passes the exam", optionD: "is required under privacy laws", correctAnswer: "B" },
      { question: "Which statement correctly describes the education requirement for a sales associate applicant", optionA: "The applicant must complete a 72 hour FREC Course II", optionB: "The applicant must complete a pre license course unless an education exemption applies", optionC: "The applicant needs only to pass the state exam", optionD: "The applicant must complete 45 hours of post licensing education before taking the exam", correctAnswer: "B" },
      { question: "A broker holds a broker license but chooses to work under another broker as an associate. This licensee is", optionA: "a sales associate", optionB: "an owner developer", optionC: "a broker associate", optionD: "a registered assistant", correctAnswer: "C" },
      { question: "Registration refers to", optionA: "the legal authorization to practice real estate", optionB: "placing the licensee's name and address on the records of the DBPR", optionC: "automatic renewal of a license", optionD: "the post licensing education process", correctAnswer: "B" },
      { question: "Which of the following is a requirement common to both broker and sales associate applicants", optionA: "United States citizenship", optionB: "Minimum of two years of college", optionC: "Fingerprint based background check", optionD: "At least two years of real estate experience", correctAnswer: "C" },
      { question: "Mutual recognition agreements allow", optionA: "Florida residents to bypass pre license education", optionB: "nonresident licensees from certain states to obtain a Florida license without the full pre license course", optionC: "foreign nationals to practice without a Social Security number", optionD: "any out of state licensee to perform services in Florida without a Florida license", correctAnswer: "B" },
      { question: "Which activity is considered a real estate service that usually requires a license when performed for another and for compensation", optionA: "Paying a mortgage payment for a relative", optionB: "Giving a friend a free estimate of value without expectation of compensation", optionC: "Advertising and negotiating the sale of property for a commission", optionD: "Building a home as a licensed contractor", correctAnswer: "C" },
      { question: "Which person is required to hold an active real estate license", optionA: "A salaried employee of an owner who leases units in a single building and receives no bonuses based on rentals", optionB: "An individual paid a fee to market and sell another person's home", optionC: "An attorney at law who drafts a contract as part of legal representation", optionD: "A person who sells their own property", correctAnswer: "B" },
      { question: "Which of the following is typically exempt from real estate licensure when performing real estate related tasks", optionA: "A sales associate who works for two brokers at the same time", optionB: "A property management firm that charges a commission to manage rentals", optionC: "A partner in a partnership who sells partnership property and receives a share of profits in proportion to their interest", optionD: "A person who finds tenants for a landlord in exchange for a fee per tenant", correctAnswer: "C" },
      { question: "A person who performs real estate services for another, for compensation, without a required license is", optionA: "guilty of unlicensed activity", optionB: "exempt if the services are occasional", optionC: "permitted if they work under an owner", optionD: "subject only to civil, not criminal, penalties", correctAnswer: "A" },
      { question: "The term owner developer refers to", optionA: "a licensed sales associate who also holds a contractor license", optionB: "an individual or entity that owns subdivisions or properties and employs licensees to sell them", optionC: "any person who develops property and sells it through a broker", optionD: "a government agency that owns and develops public property", correctAnswer: "B" },
      { question: "Which statement about post licensing and continuing education is correct", optionA: "A sales associate must complete post licensing education before the first renewal", optionB: "Continuing education is completed once, and then no further education is required", optionC: "Post licensing and continuing education are optional", optionD: "Only brokers are required to complete post licensing education", correctAnswer: "A" },
      { question: "Which law primarily governs administrative procedure, such as rulemaking and hearings, that affect licensees", optionA: "Chapter 20, Florida Statutes", optionB: "Chapter 120, Florida Statutes", optionC: "Chapter 475, Florida Statutes", optionD: "Rule Chapter 61J2, Florida Administrative Code", correctAnswer: "B" },
      { question: "A sales associate applicant lives in another state and owns a vacation condo in Florida. For the purpose of mutual recognition rules, that person is considered", optionA: "a Florida resident if they spend at least 2 weeks per year in the condo", optionB: "a Florida resident if they hold a Florida driver license", optionC: "a nonresident unless they meet the statutory definition of Florida resident", optionD: "a resident of both states for licensing purposes", correctAnswer: "C" }
    ]
  },
  {
    unitNumber: 3,
    questions: [
      { question: "The main purpose of the Florida Real Estate Commission is to", optionA: "promote the real estate industry", optionB: "protect the public", optionC: "regulate mortgage lenders", optionD: "increase commission rates", correctAnswer: "B" },
      { question: "How many members sit on the Florida Real Estate Commission", optionA: "five", optionB: "six", optionC: "seven", optionD: "nine", correctAnswer: "C" },
      { question: "How many FREC members must be consumer members", optionA: "one", optionB: "two", optionC: "three", optionD: "four", correctAnswer: "B" },
      { question: "Which FREC members must have at least five years of active broker experience", optionA: "all licensed members", optionB: "two members", optionC: "four members", optionD: "one member", correctAnswer: "C" },
      { question: "FREC's quasi-legislative powers allow the Commission to", optionA: "issue criminal penalties", optionB: "adopt rules", optionC: "conduct ministerial tasks only", optionD: "prosecute licensees", correctAnswer: "B" },
      { question: "FREC's quasi-judicial powers include", optionA: "appointing DBPR staff", optionB: "issuing administrative discipline", optionC: "establishing real estate laws", optionD: "preparing state exams", correctAnswer: "B" },
      { question: "Ministerial powers of FREC include", optionA: "adopting rules", optionB: "imposing fines", optionC: "maintaining records and certifying licenses", optionD: "conducting hearings", correctAnswer: "C" },
      { question: "FREC members are appointed by the", optionA: "Florida House of Representatives", optionB: "DBPR Secretary", optionC: "Governor and confirmed by the Senate", optionD: "Division of Real Estate", correctAnswer: "C" },
      { question: "How often must FREC meet at minimum", optionA: "weekly", optionB: "monthly", optionC: "quarterly", optionD: "annually", correctAnswer: "B" },
      { question: "A summary suspension may be issued when a licensee", optionA: "fails to complete continuing education", optionB: "poses an immediate, serious danger to the public", optionC: "makes a minor advertising error", optionD: "changes brokers without notice", correctAnswer: "B" },
      { question: "Prima facie evidence means", optionA: "evidence obtained through investigation", optionB: "evidence that is presumed true on its face unless rebutted", optionC: "evidence from witness testimony only", optionD: "evidence from criminal courts", correctAnswer: "B" },
      { question: "A Florida real estate license must be renewed every", optionA: "one year", optionB: "two years", optionC: "three years", optionD: "four years", correctAnswer: "B" },
      { question: "If a licensee fails to renew on time, the license becomes", optionA: "null and void", optionB: "involuntarily inactive", optionC: "suspended", optionD: "revoked", correctAnswer: "B" },
      { question: "A license that becomes null and void", optionA: "may be renewed with a late fee", optionB: "no longer exists and must be reapplied for", optionC: "is automatically reinstated after 6 months", optionD: "may be reactivated with continuing education", correctAnswer: "B" },
      { question: "Continuing education for renewal must be completed", optionA: "only for the first renewal", optionB: "for every renewal after the first", optionC: "only by brokers", optionD: "only for sales associates", correctAnswer: "B" },
      { question: "A sales associate may work for", optionA: "any number of brokers at the same time", optionB: "only one employer at a time", optionC: "up to three brokers simultaneously", optionD: "any broker who will pay them", correctAnswer: "B" },
      { question: "Rule Chapter 61J2 contains", optionA: "Florida criminal law", optionB: "detailed rules adopted by FREC", optionC: "federal fair housing guidelines", optionD: "mortgage lending regulations", correctAnswer: "B" },
      { question: "FREC may impose which of the following penalties", optionA: "criminal imprisonment", optionB: "reprimand, fine, probation, suspension, or revocation", optionC: "only fines", optionD: "only license revocation", correctAnswer: "B" },
      { question: "The 28-hour reactivation course is required when", optionA: "a license has been involuntarily inactive for too long", optionB: "a broker wants to become a sales associate", optionC: "continuing education was completed on time", optionD: "applying for initial licensure", correctAnswer: "A" },
      { question: "A current, valid real estate license issued by DBPR is prima facie evidence that", optionA: "the licensee has never been disciplined", optionB: "the licensee is properly licensed", optionC: "the licensee owns property", optionD: "the licensee has completed continuing education", correctAnswer: "B" }
    ]
  },
  {
    unitNumber: 6,
    questions: [
      { question: "The primary purpose of disciplinary action under Florida real estate license law is to", optionA: "punish licensees", optionB: "protect the public", optionC: "increase state revenue", optionD: "reduce the number of licensees", correctAnswer: "B" },
      { question: "Commingling occurs when a broker", optionA: "mixes escrow funds with personal or business funds", optionB: "deposits escrow funds in a title company", optionC: "places a sign on a property without permission", optionD: "pays commission to a cooperating broker", correctAnswer: "A" },
      { question: "Conversion occurs when a broker", optionA: "returns escrow funds to the wrong party by mistake", optionB: "deposits escrow funds in a trust account", optionC: "uses client funds for personal or business expenses without authorization", optionD: "changes from one broker to another", correctAnswer: "C" },
      { question: "Practicing real estate without a license is", optionA: "a minor administrative infraction only", optionB: "a criminal offense and a violation of license law", optionC: "allowed if supervised by a broker", optionD: "permitted for out of state brokers", correctAnswer: "B" },
      { question: "Which of the following is the first step in the disciplinary process", optionA: "probable cause determination", optionB: "filing of a formal complaint", optionC: "investigation", optionD: "receipt of a legally sufficient complaint", correctAnswer: "D" },
      { question: "A complaint is legally sufficient when it", optionA: "is in writing and notarized", optionB: "contains facts that, if true, would be a violation of law or rule", optionC: "is submitted by another licensee", optionD: "is reviewed by the governor", correctAnswer: "B" },
      { question: "After a complaint is found legally sufficient, the next step is", optionA: "judicial review", optionB: "filing a lawsuit in civil court", optionC: "an investigation", optionD: "immediate suspension of the license", correctAnswer: "C" },
      { question: "The probable cause panel", optionA: "conducts the initial investigation", optionB: "issues the final order", optionC: "determines whether there is sufficient evidence of a violation", optionD: "pays claims from the Recovery Fund", correctAnswer: "C" },
      { question: "An informal hearing before FREC is used when", optionA: "the licensee disputes material facts", optionB: "the licensee admits the facts but wants to be heard on the penalty", optionC: "the case involves criminal charges", optionD: "the complainant demands a jury trial", correctAnswer: "B" },
      { question: "A formal hearing is conducted by", optionA: "the governor", optionB: "the Real Estate Recovery Fund", optionC: "an administrative law judge", optionD: "a county court judge", correctAnswer: "C" },
      { question: "A final order in a disciplinary case is issued by", optionA: "the administrative law judge", optionB: "the Department of State", optionC: "the Florida Real Estate Commission", optionD: "the county clerk", correctAnswer: "C" },
      { question: "A notice of noncompliance is most likely used for", optionA: "conversion of escrow funds", optionB: "serious criminal misconduct", optionC: "a minor first time violation that can be corrected", optionD: "unlicensed practice", correctAnswer: "C" },
      { question: "A citation issued by DBPR", optionA: "is a criminal charge", optionB: "is a type of administrative fine for certain listed violations", optionC: "automatically revokes a license", optionD: "cannot be disputed", correctAnswer: "B" },
      { question: "Which of the following is a possible administrative penalty that FREC may impose", optionA: "incarceration", optionB: "probation", optionC: "revocation followed by imprisonment", optionD: "only a warning, never suspension", correctAnswer: "B" },
      { question: "Suspension of a real estate license means", optionA: "the license is null and void and cannot be reinstated", optionB: "the licensee may practice only commercial real estate", optionC: "the licensee temporarily loses the right to practice for a set period", optionD: "the licensee may practice only under supervision", correctAnswer: "C" },
      { question: "The Real Estate Recovery Fund is designed to", optionA: "pay commissions to cooperating brokers", optionB: "reimburse licensees for business losses", optionC: "reimburse members of the public who suffer monetary damages because of licensee misconduct in certain situations", optionD: "pay advertising expenses for the Commission", correctAnswer: "C" },
      { question: "Before a claimant may receive payment from the Real Estate Recovery Fund, the claimant usually must", optionA: "file a complaint with the MLS", optionB: "obtain a civil judgment and show that collection was attempted and failed", optionC: "request an informal hearing", optionD: "apply to the local association of Realtors", correctAnswer: "B" },
      { question: "Payment from the Real Estate Recovery Fund on behalf of a licensee generally results in", optionA: "promotion of the licensee", optionB: "automatic suspension of the license until the Fund is repaid", optionC: "no effect on the licensee's status", optionD: "automatic renewal of the license", correctAnswer: "B" },
      { question: "Which of the following is most likely to result in revocation of a real estate license", optionA: "Failing to complete continuing education on time one time", optionB: "Minor record keeping errors", optionC: "Conversion of escrow funds and serious fraud", optionD: "Failure to return a phone call", correctAnswer: "C" },
      { question: "Judicial review of a final order in a disciplinary case is obtained by", optionA: "filing a request with the Recovery Fund", optionB: "filing an appeal in the appropriate court within the allowed time", optionC: "appealing to the MLS", optionD: "sending a letter directly to FREC", correctAnswer: "B" }
    ]
  },
  {
    unitNumber: 7,
    questions: [
      { question: "The Civil Rights Act of 1866 prohibits discrimination based on", optionA: "race only", optionB: "race and religion", optionC: "race and sex", optionD: "all protected classes", correctAnswer: "A" },
      { question: "Familial status under the Fair Housing Act includes", optionA: "married couples only", optionB: "households with a child under eighteen", optionC: "senior citizens only", optionD: "individuals living alone", correctAnswer: "B" },
      { question: "The Fair Housing Act protects all except", optionA: "race", optionB: "sex", optionC: "marital status", optionD: "disability", correctAnswer: "C" },
      { question: "Steering is", optionA: "encouraging owners to sell because protected classes are moving in", optionB: "guiding buyers to or away from neighborhoods based on protected class", optionC: "refusing to make loans in certain areas", optionD: "requiring higher prices for certain buyers", correctAnswer: "B" },
      { question: "Blockbusting is", optionA: "refusing to sell to certain buyers", optionB: "guiding buyers away from neighborhoods", optionC: "encouraging owners to sell by claiming protected classes are moving in", optionD: "making loans at higher rates", correctAnswer: "C" },
      { question: "Redlining is", optionA: "drawing property boundaries in red ink", optionB: "refusal of loans or insurance based on neighborhood characteristics", optionC: "advertising only in certain areas", optionD: "requiring higher down payments", correctAnswer: "B" },
      { question: "The Americans with Disabilities Act applies mainly to", optionA: "private residences", optionB: "public accommodations such as sales offices", optionC: "single family homes", optionD: "vacant land", correctAnswer: "B" },
      { question: "A reasonable accommodation under the Fair Housing Act is", optionA: "a physical change to the property", optionB: "a change in rules or policies", optionC: "a rent reduction", optionD: "a waiver of deposits", correctAnswer: "B" },
      { question: "A reasonable modification is", optionA: "a policy change", optionB: "a physical change to the property such as adding grab bars", optionC: "a rent increase", optionD: "a change in lease terms", correctAnswer: "B" },
      { question: "RESPA applies to", optionA: "commercial loans only", optionB: "federally related residential mortgage loans", optionC: "all cash transactions", optionD: "seller financing only", correctAnswer: "B" },
      { question: "RESPA prohibits", optionA: "disclosure of closing costs", optionB: "referral fees and kickbacks", optionC: "affiliated business arrangements", optionD: "mortgage insurance", correctAnswer: "B" },
      { question: "The Equal Credit Opportunity Act prohibits discrimination based on", optionA: "property value", optionB: "marital status and receipt of public assistance", optionC: "loan amount", optionD: "neighborhood", correctAnswer: "B" },
      { question: "Price fixing occurs when brokers", optionA: "compete for listings", optionB: "agree to charge the same commission", optionC: "advertise different rates", optionD: "negotiate individually", correctAnswer: "B" },
      { question: "Market allocation occurs when brokers agree", optionA: "to compete in all areas", optionB: "not to compete in certain geographic areas", optionC: "on advertising content", optionD: "to share listings", correctAnswer: "B" },
      { question: "Commission rates are", optionA: "set by law", optionB: "set by local associations", optionC: "always negotiable", optionD: "fixed by FREC", correctAnswer: "C" },
      { question: "The Florida Residential Landlord and Tenant Act requires landlords to", optionA: "increase rent annually", optionB: "maintain the property in compliance with codes", optionC: "provide free utilities", optionD: "allow pets in all units", correctAnswer: "B" },
      { question: "Security deposits must be held according to", optionA: "tenant preferences", optionB: "strict statutory rules with written notice requirements", optionC: "federal regulations only", optionD: "oral agreements", correctAnswer: "B" },
      { question: "The federal Do Not Call registry prohibits", optionA: "all phone calls to consumers", optionB: "marketing calls to registered numbers without consent or business relationship", optionC: "calls from brokers only", optionD: "calls during business hours", correctAnswer: "B" },
      { question: "The CAN SPAM Act requires commercial emails to include", optionA: "the sender's Social Security number", optionB: "a valid physical address and opt-out link", optionC: "the recipient's income", optionD: "a notarized signature", correctAnswer: "B" },
      { question: "Which law covers race discrimination with no exemptions", optionA: "Fair Housing Act", optionB: "Civil Rights Act of 1866", optionC: "ADA", optionD: "RESPA", correctAnswer: "B" }
    ]
  },
  {
    unitNumber: 10,
    questions: [
      { question: "Which of the following is required for a valid contract", optionA: "earnest money", optionB: "written document", optionC: "competent parties", optionD: "notarization", correctAnswer: "C" },
      { question: "Consideration in a real estate contract refers to", optionA: "the purchase price only", optionB: "something of legal value exchanged", optionC: "the broker's fee", optionD: "the appraisal value", correctAnswer: "B" },
      { question: "A voidable contract is", optionA: "illegal", optionB: "unenforceable due to the Statute of Frauds", optionC: "valid until one party chooses to cancel it", optionD: "missing an essential element", correctAnswer: "C" },
      { question: "An executory contract is", optionA: "fully performed", optionB: "signed but not delivered", optionC: "still in progress", optionD: "illegal", correctAnswer: "C" },
      { question: "A counteroffer", optionA: "accepts the original offer", optionB: "rejects the original offer", optionC: "requires the offeror to perform", optionD: "has no legal impact", correctAnswer: "B" },
      { question: "The Statute of Frauds requires that", optionA: "all agreements be written", optionB: "all real estate sales contracts be written to be enforceable", optionC: "leases under one year be written", optionD: "oral agreements be recorded", correctAnswer: "B" },
      { question: "Oral leases longer than one year are", optionA: "void", optionB: "enforceable without limitations", optionC: "unenforceable under the Statute of Frauds", optionD: "valid only with earnest money", correctAnswer: "C" },
      { question: "Specific performance is", optionA: "a monetary award", optionB: "a court order requiring the breaching party to perform", optionC: "a form of rescission", optionD: "a type of assignment", correctAnswer: "B" },
      { question: "Liquidated damages", optionA: "are determined by a jury", optionB: "must be equal to ten percent of the purchase price", optionC: "are pre-agreed damages written into the contract", optionD: "are never allowed in real estate contracts", correctAnswer: "C" },
      { question: "A listing agreement must", optionA: "renew automatically", optionB: "include a definite termination date", optionC: "be open ended", optionD: "be verbal", correctAnswer: "B" },
      { question: "In an exclusive right of sale listing", optionA: "the broker earns a commission only if the broker finds the buyer", optionB: "the owner may avoid paying a commission by finding the buyer", optionC: "the broker earns a commission regardless of who finds the buyer", optionD: "more than one broker may list the property", correctAnswer: "C" },
      { question: "A buyer brokerage agreement", optionA: "is optional and may be oral", optionB: "must be written and must contain a termination date", optionC: "is prohibited from including compensation", optionD: "is not covered by the Statute of Frauds", correctAnswer: "B" },
      { question: "Assignment transfers", optionA: "title", optionB: "contract rights and obligations", optionC: "ownership of real property", optionD: "possession only", correctAnswer: "B" },
      { question: "Novation", optionA: "cancels a contract without replacement", optionB: "substitutes a new contract that replaces the original", optionC: "transfers possession", optionD: "is a type of financing", correctAnswer: "B" },
      { question: "A void contract is", optionA: "valid unless challenged", optionB: "missing an essential element", optionC: "enforceable only with witnesses", optionD: "the same as a voidable contract", correctAnswer: "B" },
      { question: "A bilateral contract contains", optionA: "a promise for an act", optionB: "a promise for a promise", optionC: "an obligation only on one side", optionD: "no obligations", correctAnswer: "B" },
      { question: "A listing agreement creates", optionA: "an ownership interest", optionB: "an employment relationship", optionC: "a leasehold", optionD: "a mortgage", correctAnswer: "B" },
      { question: "Contract termination by impossibility occurs when", optionA: "the parties disagree", optionB: "performance becomes legally or physically impossible", optionC: "one party wants to renegotiate", optionD: "the buyer finds a better property", correctAnswer: "B" },
      { question: "A contract that appears valid but cannot be enforced in court due to legal defenses is", optionA: "void", optionB: "voidable", optionC: "unenforceable", optionD: "executed", correctAnswer: "C" },
      { question: "The Statute of Limitations for an action on a written contract in Florida is", optionA: "two years", optionB: "three years", optionC: "five years", optionD: "seven years", correctAnswer: "C" }
    ]
  },
  {
    unitNumber: 13,
    questions: [
      { question: "The promissory note", optionA: "pledges property as collateral", optionB: "is the borrower's written promise to repay", optionC: "conveys title to the lender", optionD: "sets real estate taxes", correctAnswer: "B" },
      { question: "The mortgage", optionA: "sets loan interest rates", optionB: "pledges the property as security", optionC: "guarantees title", optionD: "replaces the promissory note", correctAnswer: "B" },
      { question: "The clause that requires full repayment when property is transferred is the", optionA: "habendum clause", optionB: "due on sale clause", optionC: "seisin clause", optionD: "covenant of further assurance", correctAnswer: "B" },
      { question: "One discount point equals", optionA: "one percent of the purchase price", optionB: "one percent of the loan amount", optionC: "one eighth of one percent of the interest rate", optionD: "one half of the property value", correctAnswer: "B" },
      { question: "One discount point typically increases lender yield by", optionA: "one percent", optionB: "one half of one percent", optionC: "one eighth of one percent", optionD: "one tenth of one percent", correctAnswer: "C" },
      { question: "Origination fees are", optionA: "prepaid taxes", optionB: "charges for processing and underwriting the loan", optionC: "optional for FHA loans only", optionD: "credits from the seller", correctAnswer: "B" },
      { question: "Simple interest is calculated on", optionA: "principal only", optionB: "interest plus principal", optionC: "the original purchase price", optionD: "the down payment", correctAnswer: "A" },
      { question: "The Federal Reserve increases credit availability by", optionA: "raising the discount rate", optionB: "selling government securities", optionC: "lowering reserve requirements", optionD: "removing mortgage insurance", correctAnswer: "C" },
      { question: "The primary mortgage market is where", optionA: "loans are sold", optionB: "loans are originated", optionC: "securities are guaranteed", optionD: "taxes are assessed", correctAnswer: "B" },
      { question: "Fannie Mae purchases", optionA: "only conventional loans", optionB: "conventional, FHA, and VA loans", optionC: "only VA loans", optionD: "only second mortgages", correctAnswer: "B" },
      { question: "Freddie Mac purchases", optionA: "FHA loans only", optionB: "VA loans only", optionC: "conventional loans", optionD: "construction loans", correctAnswer: "C" },
      { question: "Ginnie Mae guarantees", optionA: "securities backed by FHA and VA loans", optionB: "conventional loan underwriting", optionC: "discount points", optionD: "real estate taxes", correctAnswer: "A" },
      { question: "Loan to value is", optionA: "loan amount divided by property value", optionB: "down payment divided by loan amount", optionC: "interest rate divided by term", optionD: "closing costs divided by loan amount", correctAnswer: "A" },
      { question: "Down payment equals", optionA: "loan amount minus interest", optionB: "purchase price minus loan amount", optionC: "loan amount multiplied by interest rate", optionD: "commission multiplied by price", correctAnswer: "B" },
      { question: "Monthly interest is calculated by", optionA: "dividing the loan amount by twelve", optionB: "dividing interest by loan term", optionC: "multiplying principal by annual rate then dividing by twelve", optionD: "multiplying down payment by annual rate", correctAnswer: "C" },
      { question: "Early payments in a fully amortized loan consist mostly of", optionA: "principal", optionB: "tax escrow", optionC: "interest", optionD: "private mortgage insurance", correctAnswer: "C" },
      { question: "The housing expense ratio compares", optionA: "total monthly debts to net income", optionB: "housing costs to gross monthly income", optionC: "loan value to property value", optionD: "interest rate to term", correctAnswer: "B" },
      { question: "The total debt ratio compares", optionA: "all monthly obligations to gross monthly income", optionB: "only mortgage interest to income", optionC: "housing payment plus down payment", optionD: "interest rate to principal", correctAnswer: "A" },
      { question: "A mortgage buydown", optionA: "increases the interest rate", optionB: "temporarily or permanently reduces the interest rate", optionC: "eliminates lender yield", optionD: "removes escrow requirements", correctAnswer: "B" },
      { question: "A fully amortized mortgage", optionA: "never reduces principal", optionB: "becomes interest only after year five", optionC: "pays the loan to zero at the end of the term", optionD: "requires annual lump sum payments", correctAnswer: "C" }
    ]
  },
  {
    unitNumber: 17,
    questions: [
      { question: "Leverage allows investors to", optionA: "avoid debt", optionB: "control large assets with limited capital", optionC: "eliminate all risk", optionD: "reduce appreciation", correctAnswer: "B" },
      { question: "A major disadvantage of real estate investment is", optionA: "high liquidity", optionB: "low leverage", optionC: "lack of liquidity", optionD: "automatic returns", correctAnswer: "C" },
      { question: "Risk refers to", optionA: "guaranteed income", optionB: "the chance actual return differs from expected return", optionC: "depreciation expense", optionD: "tax liability", correctAnswer: "B" },
      { question: "Net operating income equals", optionA: "rent minus mortgage", optionB: "effective gross income minus operating expenses", optionC: "gross income minus capital expenses", optionD: "cash flow minus taxes", correctAnswer: "B" },
      { question: "Cash flow equals", optionA: "mortgage payments minus taxes", optionB: "net operating income minus debt service", optionC: "income minus depreciation", optionD: "revenue minus goodwill", correctAnswer: "B" },
      { question: "The IRV formula is", optionA: "income times rate equals value", optionB: "income divided by rate equals value", optionC: "value divided by income equals rate", optionD: "rate divided by value equals income", correctAnswer: "B" },
      { question: "A cap rate equals", optionA: "debt service divided by income", optionB: "interest rate", optionC: "net operating income divided by value", optionD: "value divided by rent", correctAnswer: "C" },
      { question: "To find net operating income using IRV", optionA: "multiply value by cap rate", optionB: "divide value by cap rate", optionC: "multiply cash flow by debt service", optionD: "divide rent by taxes", correctAnswer: "A" },
      { question: "Cash on cash return measures", optionA: "annual cash flow divided by initial cash invested", optionB: "net operating income divided by value", optionC: "closing costs divided by rent", optionD: "debt service divided by gross income", correctAnswer: "A" },
      { question: "Equity buildup comes from", optionA: "rent increases only", optionB: "loan principal reduction", optionC: "higher taxes", optionD: "depreciation", correctAnswer: "B" },
      { question: "Appreciation refers to", optionA: "decrease in property value", optionB: "increase in property value", optionC: "tax assessor changes", optionD: "insurance claims", correctAnswer: "B" },
      { question: "Business brokerage involves", optionA: "only land sales", optionB: "ongoing enterprises and intangible assets", optionC: "tenant placement", optionD: "mortgage underwriting", correctAnswer: "B" },
      { question: "Goodwill represents", optionA: "equipment value", optionB: "inventory", optionC: "intangible value such as reputation", optionD: "tax liability", correctAnswer: "C" },
      { question: "A going concern is a business that", optionA: "is closed", optionB: "has no customers", optionC: "continues operating with measurable cash flow", optionD: "is insolvent", correctAnswer: "C" },
      { question: "The balance sheet lists", optionA: "revenue and expenses", optionB: "assets, liabilities, and equity", optionC: "income and depreciation", optionD: "cash inflows only", correctAnswer: "B" },
      { question: "The income statement shows", optionA: "assets and liabilities", optionB: "cash reserves", optionC: "revenue and expenses", optionD: "depreciation only", correctAnswer: "C" },
      { question: "In an asset sale, the buyer purchases", optionA: "corporate stock", optionB: "liabilities only", optionC: "equipment, inventory, and other assets", optionD: "only leases", correctAnswer: "C" },
      { question: "In a stock sale, the buyer purchases", optionA: "assets only", optionB: "ownership of the corporation including liabilities", optionC: "inventory only", optionD: "goodwill only", correctAnswer: "B" },
      { question: "Florida requires a real estate license for business brokerage because", optionA: "businesses are intangible", optionB: "business sales often involve real property or leases", optionC: "the IRS requires it", optionD: "lenders require it", correctAnswer: "B" },
      { question: "The primary purpose of investment analysis is", optionA: "determine property taxes", optionB: "estimate financial performance and risk", optionC: "reduce insurance premiums", optionD: "prepare loan documents", correctAnswer: "B" }
    ]
  },
  {
    unitNumber: 18,
    questions: [
      { question: "Ad valorem means", optionA: "age based", optionB: "value based", optionC: "location based", optionD: "income based", correctAnswer: "B" },
      { question: "Assessed value is", optionA: "the same as market value", optionB: "market value minus adjustments", optionC: "always lower than taxable value", optionD: "determined by the federal government", correctAnswer: "B" },
      { question: "The Florida homestead exemption can be up to", optionA: "ten thousand dollars", optionB: "twenty five thousand dollars", optionC: "fifty thousand dollars", optionD: "one hundred thousand dollars", correctAnswer: "C" },
      { question: "The second twenty five thousand dollars of homestead exemption", optionA: "applies only to school taxes", optionB: "applies to non school taxes", optionC: "applies to federal income tax", optionD: "applies only when selling", correctAnswer: "B" },
      { question: "Millage is expressed as", optionA: "cents per dollar", optionB: "dollars per hundred", optionC: "dollars per thousand dollars of value", optionD: "percentage of purchase price", correctAnswer: "C" },
      { question: "Property taxes equal", optionA: "assessed value times land value", optionB: "taxable value times millage rate", optionC: "market value times two mills", optionD: "loan amount times mill rate", correctAnswer: "B" },
      { question: "Homeowners may deduct", optionA: "repairs", optionB: "improvements", optionC: "depreciation", optionD: "mortgage interest and property taxes", correctAnswer: "D" },
      { question: "Investors may deduct", optionA: "principal payments", optionB: "depreciation", optionC: "personal expenses", optionD: "homeowner association fines", correctAnswer: "B" },
      { question: "Land", optionA: "can be depreciated", optionB: "cannot be depreciated", optionC: "is depreciated over forty years", optionD: "is expensed", correctAnswer: "B" },
      { question: "Residential rental property is depreciated over", optionA: "fifteen years", optionB: "twenty seven and a half years", optionC: "thirty nine years", optionD: "five years", correctAnswer: "B" },
      { question: "Capital gain equals", optionA: "selling price minus closing costs", optionB: "selling price minus loan balance", optionC: "selling price minus adjusted basis", optionD: "selling price minus depreciation", correctAnswer: "C" },
      { question: "Adjusted basis equals", optionA: "purchase price plus improvements minus depreciation", optionB: "loan amount minus taxes", optionC: "market value minus land", optionD: "cash flow minus debt service", correctAnswer: "A" },
      { question: "Homeowners may exclude capital gains up to", optionA: "fifty thousand dollars", optionB: "one hundred thousand dollars", optionC: "two hundred fifty thousand or five hundred thousand if married", optionD: "unlimited amount", correctAnswer: "C" },
      { question: "A 1031 exchange", optionA: "eliminates tax permanently", optionB: "defers tax on investment property", optionC: "applies to primary residences", optionD: "cannot involve real estate", correctAnswer: "B" },
      { question: "Save Our Homes limits annual assessed value increases to", optionA: "ten percent", optionB: "five percent", optionC: "three percent or the increase in CPI", optionD: "the millage rate", correctAnswer: "C" },
      { question: "Property taxes in Florida are", optionA: "paid monthly", optionB: "paid in arrears", optionC: "paid in advance", optionD: "paid by tenants", correctAnswer: "B" },
      { question: "The taxable value of a homesteaded property equals", optionA: "market value minus land", optionB: "assessed value minus exemptions", optionC: "selling price minus mortgage", optionD: "market value minus closing costs", correctAnswer: "B" },
      { question: "Depreciable basis equals", optionA: "loan amount minus land", optionB: "purchase price minus land plus improvements", optionC: "property taxes minus depreciation", optionD: "loan interest plus principal", correctAnswer: "B" },
      { question: "An item that is not deductible on a primary residence is", optionA: "mortgage interest", optionB: "property taxes", optionC: "repairs", optionD: "points on a new loan", correctAnswer: "C" },
      { question: "The purpose of depreciation is", optionA: "to reduce property taxes", optionB: "to recover the cost of improvements over time", optionC: "to calculate market value", optionD: "to determine millage", correctAnswer: "B" }
    ]
  },
  {
    unitNumber: 19,
    questions: [
      { question: "Police power includes", optionA: "private deed restrictions", optionB: "zoning and building codes", optionC: "federal income taxation", optionD: "HOA rules", correctAnswer: "B" },
      { question: "Comprehensive plans guide", optionA: "mortgage underwriting", optionB: "long term community development", optionC: "private lease agreements", optionD: "advertising standards", correctAnswer: "B" },
      { question: "Zoning classification that controls hazardous activities is", optionA: "residential", optionB: "commercial", optionC: "industrial", optionD: "agricultural", correctAnswer: "C" },
      { question: "Residential zoning may regulate", optionA: "mortgage interest", optionB: "number of permitted dwelling units", optionC: "federal taxes", optionD: "insurance", correctAnswer: "B" },
      { question: "A nonconforming use", optionA: "violates the law", optionB: "was legal when established", optionC: "may expand without restriction", optionD: "changes zoning classification", correctAnswer: "B" },
      { question: "A variance", optionA: "changes the zoning district", optionB: "allows deviation from requirements due to hardship", optionC: "eliminates zoning", optionD: "applies only to agricultural property", correctAnswer: "B" },
      { question: "A special exception is", optionA: "automatic zoning approval", optionB: "a conditional use allowed after review", optionC: "an illegal use", optionD: "a zoning violation", correctAnswer: "B" },
      { question: "The subdivision plat is recorded", optionA: "before preliminary approval", optionB: "after final approval", optionC: "only after construction", optionD: "at closing", correctAnswer: "B" },
      { question: "A certificate of occupancy is issued when", optionA: "taxes are paid", optionB: "utilities are installed", optionC: "the structure complies with building codes", optionD: "the land is rezoned", correctAnswer: "C" },
      { question: "Asbestos is hazardous when", optionA: "it is in good condition", optionB: "it is disturbed and releases fibers", optionC: "it is painted", optionD: "it is outside the building", correctAnswer: "B" },
      { question: "Radon is", optionA: "visible gas from appliances", optionB: "a naturally occurring radioactive gas from soil", optionC: "found only in commercial buildings", optionD: "regulated by HOAs", correctAnswer: "B" },
      { question: "Lead based paint disclosure is required for homes built before", optionA: "1950", optionB: "1960", optionC: "1978", optionD: "1990", correctAnswer: "C" },
      { question: "CERCLA created", optionA: "mortgage lending rules", optionB: "the Superfund program for environmental cleanup", optionC: "zoning regulations", optionD: "property tax assessments", correctAnswer: "B" },
      { question: "Under CERCLA, liability can be", optionA: "optional", optionB: "joint and several", optionC: "eliminated through transfer", optionD: "limited to tenants", correctAnswer: "B" },
      { question: "Flood insurance is required when property is in", optionA: "any area near water", optionB: "a special flood hazard area with a federally backed loan", optionC: "a commercial zone", optionD: "an agricultural zone", correctAnswer: "B" },
      { question: "Wetlands are", optionA: "exempt from all regulation", optionB: "protected areas requiring special permits for development", optionC: "only found in coastal areas", optionD: "always buildable", correctAnswer: "B" },
      { question: "Environmental disclosure in Florida", optionA: "is never required", optionB: "requires disclosure of known environmental defects", optionC: "applies only to commercial property", optionD: "is optional for sellers", correctAnswer: "B" },
      { question: "Building permits are required", optionA: "only for commercial projects", optionB: "before construction can begin", optionC: "after construction is complete", optionD: "only for government buildings", correctAnswer: "B" },
      { question: "Floor area ratio is a", optionA: "mortgage calculation", optionB: "development control limiting building size relative to lot size", optionC: "property tax formula", optionD: "insurance rating", correctAnswer: "B" },
      { question: "Buffer standards are zoning requirements that", optionA: "increase building height", optionB: "separate incompatible uses", optionC: "eliminate parking requirements", optionD: "allow mixed uses", correctAnswer: "B" }
    ]
  }
];

const COURSE_ID = "4793335c-ce58-4cab-af5c-a9160d593ced";

async function importQuizzes() {
  console.log("Starting import of ChatGPT quizzes...");
  
  for (const quiz of quizzes) {
    console.log(`\nProcessing Unit ${quiz.unitNumber}...`);
    
    const unitExams = await db.select()
      .from(practiceExams)
      .where(
        and(
          eq(practiceExams.courseId, COURSE_ID),
          like(practiceExams.title, `%Unit ${quiz.unitNumber}%Quiz%`),
          eq(practiceExams.isFinalExam, 0)
        )
      );
    
    if (unitExams.length === 0) {
      console.log(`  No quiz found for Unit ${quiz.unitNumber}`);
      continue;
    }
    
    const unitExam = unitExams[0];
    console.log(`  Found exam: ${unitExam.title} (ID: ${unitExam.id})`);
    
    const existingQuestions = await db.select()
      .from(examQuestions)
      .where(eq(examQuestions.examId, unitExam.id));
    
    console.log(`  Existing questions: ${existingQuestions.length}`);
    
    if (existingQuestions.length > 0) {
      await db.delete(examQuestions).where(eq(examQuestions.examId, unitExam.id));
      console.log(`  Deleted ${existingQuestions.length} existing questions`);
    }
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      const options = JSON.stringify([q.optionA, q.optionB, q.optionC, q.optionD]);
      await db.insert(examQuestions).values({
        examId: unitExam.id,
        questionText: q.question,
        questionType: "multiple_choice",
        options: options,
        correctAnswer: q.correctAnswer,
        sequence: i + 1
      });
    }
    
    console.log(`  Inserted ${quiz.questions.length} new questions`);
  }
  
  console.log("\n\nImport complete!");
  
  const finalCounts = await db.execute(`
    SELECT 
      CAST(SUBSTRING(pe.title FROM 'Unit (\\d+)') AS INTEGER) as unit_num,
      COUNT(eq.id) as question_count
    FROM practice_exams pe
    JOIN exam_questions eq ON pe.id = eq.exam_id
    WHERE pe.course_id = '${COURSE_ID}'
      AND pe.title LIKE 'Unit%Quiz%'
      AND pe.is_final_exam = 0
    GROUP BY pe.id, pe.title
    ORDER BY unit_num
  `);
  
  console.log("\nFinal question counts:");
  for (const row of finalCounts.rows as any[]) {
    console.log(`  Unit ${row.unit_num}: ${row.question_count} questions`);
  }
}

importQuizzes().catch(console.error);
