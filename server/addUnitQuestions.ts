import { db } from "./db";
import { practiceExams, examQuestions } from "@shared/schema";
import { eq, and, like } from "drizzle-orm";

// Unit 9: Title, Deeds and Ownership Restrictions
const unit9Questions = [
  { questionText: "Which type of deed contains the greatest number of warranties and provides the most protection to the grantee?", options: ["Quitclaim deed", "Bargain and sale deed", "Special warranty deed", "General warranty deed"], correctAnswer: "D", explanation: "A general warranty deed contains all six covenants of title and warrants against defects arising during the grantor's ownership and all prior owners." },
  { questionText: "A deed that transfers whatever interest the grantor has, without any warranties, is called a:", options: ["General warranty deed", "Special warranty deed", "Quitclaim deed", "Bargain and sale deed"], correctAnswer: "C", explanation: "A quitclaim deed offers no warranties and simply conveys whatever interest the grantor may have." },
  { questionText: "The granting clause in a deed contains:", options: ["Legal description of the property", "Words of conveyance", "Acknowledgment", "Recording information"], correctAnswer: "B", explanation: "The granting clause contains the words of conveyance such as 'grant' or 'convey' that transfer title." },
  { questionText: "For a deed to be valid, it must be:", options: ["Recorded", "Notarized", "Signed by the grantee", "Signed by the grantor"], correctAnswer: "D", explanation: "The grantor's signature is essential for a valid deed. Recording provides constructive notice but is not required for validity." },
  { questionText: "Title insurance protects against:", options: ["Future zoning changes", "Physical damage to property", "Hidden title defects existing before policy date", "Market value decline"], correctAnswer: "C", explanation: "Title insurance protects against defects in title that existed before the policy was issued but were not discovered." },
  { questionText: "An owner's title insurance policy protects:", options: ["The lender", "The buyer/owner", "The seller", "The title company"], correctAnswer: "B", explanation: "An owner's policy protects the buyer/owner against title defects. A separate lender's policy protects the mortgage lender." },
  { questionText: "A covenant that promises the grantor has the right to convey the property is the covenant of:", options: ["Seisin", "Right to convey", "Quiet enjoyment", "Further assurance"], correctAnswer: "B", explanation: "The covenant of right to convey warrants that the grantor has the legal right and authority to transfer the property." },
  { questionText: "An encumbrance that affects the physical condition of the property is a:", options: ["Lien", "Deed restriction", "Easement", "License"], correctAnswer: "C", explanation: "Easements are encumbrances that affect the physical use of property by granting rights to others." },
  { questionText: "A restrictive covenant that prohibits certain uses of property is also called a:", options: ["Lien", "Deed restriction", "Easement appurtenant", "License"], correctAnswer: "B", explanation: "Deed restrictions (restrictive covenants) limit how property can be used, such as prohibiting commercial activities in residential areas." },
  { questionText: "The covenant of seisin warrants that:", options: ["The property is free of encumbrances", "The grantor owns the property", "The grantee will not be disturbed", "The grantor will defend the title"], correctAnswer: "B", explanation: "The covenant of seisin warrants that the grantor owns the estate being conveyed." },
  { questionText: "Which deed is commonly used to clear a cloud on title?", options: ["General warranty deed", "Special warranty deed", "Quitclaim deed", "Bargain and sale deed"], correctAnswer: "C", explanation: "Quitclaim deeds are often used to clear clouds on title because they release any interest a person may have without making warranties." },
];

// Unit 10: Legal Descriptions
const unit10Questions = [
  { questionText: "A metes-and-bounds description always begins and ends at the:", options: ["Principal meridian", "Base line", "Point of beginning (POB)", "Range line"], correctAnswer: "C", explanation: "Metes-and-bounds descriptions must close by returning to the point of beginning (POB)." },
  { questionText: "In the rectangular survey system, a township contains how many square miles?", options: ["1", "6", "36", "640"], correctAnswer: "C", explanation: "A township is 6 miles by 6 miles, containing 36 square miles or 36 sections." },
  { questionText: "One section of land contains how many acres?", options: ["40", "160", "320", "640"], correctAnswer: "D", explanation: "One section equals one square mile, which contains 640 acres." },
  { questionText: "In the rectangular survey system, principal meridians run:", options: ["East to west", "North to south", "Diagonally", "In circles"], correctAnswer: "B", explanation: "Principal meridians run north to south, while base lines run east to west." },
  { questionText: "A plat map is used in which method of legal description?", options: ["Metes and bounds", "Rectangular survey", "Lot and block", "Government survey"], correctAnswer: "C", explanation: "The lot and block (recorded plat) method refers to a recorded plat map that shows lot boundaries within a subdivision." },
  { questionText: "The term 'metes' refers to:", options: ["Corners and monuments", "Distance and direction", "Boundaries only", "Lot numbers"], correctAnswer: "B", explanation: "Metes refers to distance and direction measurements, while bounds refers to fixed objects or monuments." },
  { questionText: "A monument used in a legal description could be:", options: ["A tree or rock", "An iron stake", "A street intersection", "All of the above"], correctAnswer: "D", explanation: "Monuments can be natural objects (trees, rocks) or artificial markers (iron stakes, street corners) used to identify boundaries." },
  { questionText: "How many acres are in the NE 1/4 of the SE 1/4 of a section?", options: ["10 acres", "20 acres", "40 acres", "80 acres"], correctAnswer: "C", explanation: "A section has 640 acres. SE 1/4 = 160 acres. NE 1/4 of 160 = 40 acres." },
  { questionText: "Range lines in the rectangular survey system run:", options: ["East to west", "North to south", "Parallel to base lines", "Through townships only"], correctAnswer: "B", explanation: "Range lines run north to south, parallel to principal meridians, creating columns of townships." },
  { questionText: "The rectangular survey system is also known as the:", options: ["Metes and bounds system", "Lot and block system", "Government survey system", "Plat system"], correctAnswer: "C", explanation: "The rectangular survey system is also called the government survey system, established by the federal government." },
  { questionText: "Township lines run:", options: ["North to south", "East to west", "Diagonally", "Parallel to meridians"], correctAnswer: "B", explanation: "Township lines run east to west, parallel to base lines, creating rows of townships." },
  { questionText: "A benchmark is used primarily for:", options: ["Measuring lot size", "Establishing elevation", "Recording deeds", "Identifying owners"], correctAnswer: "B", explanation: "Benchmarks are permanent markers used to establish elevations above sea level for surveying purposes." },
];

// Unit 11: Real Estate Contracts
const unit11Questions = [
  { questionText: "For a contract to be valid, there must be:", options: ["Recording", "Notarization", "Mutual assent (offer and acceptance)", "A real estate license"], correctAnswer: "C", explanation: "Mutual assent (meeting of the minds through offer and acceptance) is essential for a valid contract." },
  { questionText: "The Statute of Frauds requires contracts for the sale of real estate to be:", options: ["Recorded", "Notarized", "In writing", "Witnessed"], correctAnswer: "C", explanation: "The Statute of Frauds requires real estate contracts to be in writing to be enforceable." },
  { questionText: "Consideration in a contract means:", options: ["Thoughtful negotiation", "Something of value exchanged", "Legal capacity", "Written terms"], correctAnswer: "B", explanation: "Consideration is something of value given by each party, which can be money, property, services, or a promise." },
  { questionText: "An executory contract is one that:", options: ["Has been fully performed", "Has not yet been performed", "Is void", "Is illegal"], correctAnswer: "B", explanation: "An executory contract has obligations remaining to be performed by one or both parties." },
  { questionText: "A voidable contract is:", options: ["Valid but can be rescinded by one party", "Never enforceable", "Always illegal", "Void from the beginning"], correctAnswer: "A", explanation: "A voidable contract is valid but may be rescinded by one party due to circumstances like duress, fraud, or minority." },
  { questionText: "The remedy of specific performance is most commonly used for:", options: ["Personal service contracts", "Real estate contracts", "Employment contracts", "Rental agreements"], correctAnswer: "B", explanation: "Specific performance is used for real estate contracts because each property is unique and monetary damages are inadequate." },
  { questionText: "A bilateral contract is one in which:", options: ["Only one party makes a promise", "Both parties make promises", "No promises are made", "The contract is optional"], correctAnswer: "B", explanation: "In a bilateral contract, both parties exchange promises to perform, creating mutual obligations." },
  { questionText: "An option contract is considered:", options: ["A bilateral contract", "A unilateral contract", "A void contract", "An executory contract only"], correctAnswer: "B", explanation: "An option is unilateral because only the optionor (seller) is obligated; the optionee (buyer) has a right but no obligation." },
  { questionText: "Liquidated damages in a real estate contract typically refers to:", options: ["Seller keeping earnest money", "Court-ordered damages", "Specific performance", "Rescission"], correctAnswer: "A", explanation: "Liquidated damages are pre-agreed damages, often allowing the seller to keep the earnest money if the buyer defaults." },
  { questionText: "The time limit to bring a legal action is governed by the:", options: ["Statute of Frauds", "Statute of Limitations", "Statute of Uses", "Recording act"], correctAnswer: "B", explanation: "The Statute of Limitations sets the time period within which a lawsuit must be filed." },
  { questionText: "A contract made by a minor is generally:", options: ["Void", "Voidable by the minor", "Always enforceable", "Illegal"], correctAnswer: "B", explanation: "Contracts made by minors are voidable at the minor's option because they lack full legal capacity." },
  { questionText: "An assignment of a contract transfers:", options: ["Ownership of property", "Rights under the contract", "Duties only", "Nothing"], correctAnswer: "B", explanation: "An assignment transfers the assignor's rights under the contract to the assignee." },
  { questionText: "Novation occurs when:", options: ["A contract is voided", "A new party replaces an original party", "Terms are modified", "A contract is recorded"], correctAnswer: "B", explanation: "Novation substitutes a new party for an original party, releasing the original party from obligations." },
  { questionText: "The parol evidence rule prevents:", options: ["Oral testimony to contradict written contracts", "Written modifications", "Recording of contracts", "Consideration requirements"], correctAnswer: "A", explanation: "The parol evidence rule prevents parties from introducing oral evidence that contradicts a written contract." },
  { questionText: "A counteroffer:", options: ["Accepts the original offer", "Rejects and replaces the original offer", "Keeps the original offer open", "Is always illegal"], correctAnswer: "B", explanation: "A counteroffer rejects the original offer and creates a new offer that the original offeror may accept or reject." },
  { questionText: "Earnest money is also known as:", options: ["Option money", "Good faith deposit", "Down payment", "Closing costs"], correctAnswer: "B", explanation: "Earnest money is a good faith deposit showing the buyer's serious intent to complete the purchase." },
];

// Unit 12: Residential Mortgages
const unit12Questions = [
  { questionText: "The document that creates a lien on real property as security for a debt is the:", options: ["Promissory note", "Mortgage", "Deed", "Title insurance policy"], correctAnswer: "B", explanation: "The mortgage creates a lien on the property as security for the loan evidenced by the promissory note." },
  { questionText: "The borrower's personal promise to repay a loan is evidenced by the:", options: ["Mortgage", "Promissory note", "Deed of trust", "Title policy"], correctAnswer: "B", explanation: "The promissory note is the borrower's written promise to repay the debt according to specified terms." },
  { questionText: "The mortgagor is the:", options: ["Lender", "Borrower", "Trustee", "Title company"], correctAnswer: "B", explanation: "The mortgagor is the borrower who gives the mortgage as security for the loan." },
  { questionText: "The clause that allows a lender to demand full payment upon default is the:", options: ["Due-on-sale clause", "Acceleration clause", "Prepayment clause", "Subordination clause"], correctAnswer: "B", explanation: "The acceleration clause allows the lender to declare the entire loan balance due immediately upon default." },
  { questionText: "The due-on-sale clause prevents:", options: ["Early payoff", "Loan assumption without lender approval", "Recording of the mortgage", "Interest rate changes"], correctAnswer: "B", explanation: "The due-on-sale (alienation) clause requires full payment or lender approval if the property is sold." },
  { questionText: "Equity in a property is calculated as:", options: ["Market value plus debt", "Market value minus debt", "Purchase price only", "Loan balance only"], correctAnswer: "B", explanation: "Equity equals the property's market value minus any outstanding mortgage balance or liens." },
  { questionText: "The loan-to-value ratio (LTV) compares:", options: ["Loan amount to purchase price", "Loan amount to appraised value", "Down payment to loan", "Interest to principal"], correctAnswer: "B", explanation: "LTV ratio is the loan amount divided by the property's appraised value, expressed as a percentage." },
  { questionText: "In a deed of trust, the neutral third party who holds title is the:", options: ["Beneficiary", "Trustor", "Trustee", "Mortgagee"], correctAnswer: "C", explanation: "In a deed of trust, the trustee is the neutral third party who holds bare legal title as security for the loan." },
  { questionText: "The process of gradually paying off a loan through regular payments is called:", options: ["Acceleration", "Amortization", "Subordination", "Novation"], correctAnswer: "B", explanation: "Amortization is the gradual repayment of a loan through scheduled periodic payments of principal and interest." },
  { questionText: "A deficiency judgment may be obtained when:", options: ["The borrower pays off early", "The foreclosure sale proceeds are less than the debt owed", "The property appreciates", "The interest rate changes"], correctAnswer: "B", explanation: "If the foreclosure sale proceeds don't cover the debt, the lender may seek a deficiency judgment for the remaining balance." },
];

// Unit 13: Types of Mortgages and Sources of Financing
const unit13Questions = [
  { questionText: "FHA loans are:", options: ["Made directly by the government", "Insured by FHA", "Guaranteed by FHA", "Only for veterans"], correctAnswer: "B", explanation: "FHA does not make loans directly but insures loans made by approved lenders against borrower default." },
  { questionText: "VA loans are:", options: ["Insured by VA", "Guaranteed by VA", "Made by VA directly", "Only for first-time buyers"], correctAnswer: "B", explanation: "VA guarantees a portion of loans made by approved lenders to eligible veterans and service members." },
  { questionText: "Conventional loans are those that are:", options: ["Government insured", "Government guaranteed", "Not government backed", "Made by the government"], correctAnswer: "C", explanation: "Conventional loans are not insured or guaranteed by a government agency (FHA, VA, USDA)." },
  { questionText: "Private mortgage insurance (PMI) is typically required when:", options: ["LTV exceeds 80%", "LTV is below 50%", "The loan is FHA-insured", "The property is commercial"], correctAnswer: "A", explanation: "PMI is typically required for conventional loans when the down payment is less than 20% (LTV above 80%)." },
  { questionText: "A balloon mortgage has:", options: ["Fully amortized payments", "A large final payment", "No interest charges", "Variable payments only"], correctAnswer: "B", explanation: "A balloon mortgage has regular payments followed by a large lump-sum (balloon) payment at the end." },
  { questionText: "An adjustable-rate mortgage (ARM) has:", options: ["A fixed interest rate", "An interest rate that can change", "No principal payments", "Government guarantees"], correctAnswer: "B", explanation: "An ARM has an interest rate that adjusts periodically based on a specified index plus a margin." },
  { questionText: "The secondary mortgage market is where:", options: ["Second mortgages are made", "Existing loans are bought and sold", "Borrowers get loans directly", "Title insurance is issued"], correctAnswer: "B", explanation: "The secondary market is where lenders sell existing mortgage loans to investors, freeing capital for new loans." },
  { questionText: "Fannie Mae and Freddie Mac operate in the:", options: ["Primary market", "Secondary market", "Title insurance industry", "Appraisal industry"], correctAnswer: "B", explanation: "Fannie Mae and Freddie Mac are government-sponsored enterprises that buy mortgages in the secondary market." },
  { questionText: "A purchase money mortgage is one where:", options: ["The buyer pays cash", "The seller provides financing", "The bank provides all funds", "No down payment is required"], correctAnswer: "B", explanation: "A purchase money mortgage is seller financing where the seller takes back a mortgage as part of the purchase price." },
  { questionText: "A wraparound mortgage:", options: ["Pays off the existing mortgage", "Includes the existing mortgage within a new larger loan", "Is always illegal", "Has no interest"], correctAnswer: "B", explanation: "A wraparound mortgage wraps around an existing mortgage, with the new loan including the balance of the old one." },
  { questionText: "The index in an ARM is:", options: ["The lender's profit margin", "A benchmark rate that determines rate adjustments", "The maximum rate allowed", "The initial rate"], correctAnswer: "B", explanation: "The index is a benchmark rate (like Treasury rates or LIBOR) used to calculate interest rate adjustments in an ARM." },
  { questionText: "A negative amortization loan is one where:", options: ["The loan balance decreases faster", "The loan balance can increase over time", "No payments are required", "Interest rates are negative"], correctAnswer: "B", explanation: "Negative amortization occurs when payments don't cover all interest due, causing unpaid interest to be added to principal." },
];

// Unit 14: Real Estate Related Computations and Closing
const unit14Questions = [
  { questionText: "Prorations at closing divide expenses:", options: ["Equally between parties", "Based on who caused the expense", "Based on ownership period", "By state law only"], correctAnswer: "C", explanation: "Prorations allocate expenses between buyer and seller based on their respective periods of ownership." },
  { questionText: "Property taxes are typically prorated as:", options: ["A credit to seller", "A debit to seller", "Not prorated", "Paid by agent"], correctAnswer: "B", explanation: "Prepaid taxes are credited to seller; if taxes are unpaid, the seller is debited and buyer credited for seller's share." },
  { questionText: "RESPA applies to:", options: ["Commercial transactions", "Residential mortgage loans", "Cash sales only", "Land contracts only"], correctAnswer: "B", explanation: "RESPA (Real Estate Settlement Procedures Act) applies to federally related residential mortgage loans." },
  { questionText: "The Closing Disclosure must be provided to the borrower:", options: ["At application", "3 business days before closing", "At closing only", "After closing"], correctAnswer: "B", explanation: "Under TRID rules, the Closing Disclosure must be provided at least 3 business days before consummation." },
  { questionText: "A seller's net proceeds equal:", options: ["Sales price plus costs", "Sales price minus costs and payoffs", "Sales price only", "Loan balance only"], correctAnswer: "B", explanation: "Net proceeds equal the sales price minus closing costs, commissions, and existing loan payoffs." },
];

// Unit 15: Real Estate Markets and Analysis
const unit15Questions = [
  { questionText: "When supply of homes increases and demand stays the same, prices tend to:", options: ["Increase", "Decrease", "Stay the same", "Double"], correctAnswer: "B", explanation: "According to supply and demand principles, increased supply with stable demand leads to lower prices." },
  { questionText: "A buyer's market occurs when:", options: ["Supply exceeds demand", "Demand exceeds supply", "Supply equals demand", "There are no buyers"], correctAnswer: "A", explanation: "A buyer's market exists when supply exceeds demand, giving buyers more negotiating power." },
  { questionText: "A seller's market occurs when:", options: ["Supply exceeds demand", "Demand exceeds supply", "Supply equals demand", "There are no sellers"], correctAnswer: "B", explanation: "A seller's market exists when demand exceeds supply, allowing sellers to command higher prices." },
  { questionText: "A Comparative Market Analysis (CMA) is used to:", options: ["Determine property taxes", "Estimate property value using comparable sales", "Calculate mortgage payments", "Appraise for lending purposes"], correctAnswer: "B", explanation: "A CMA compares similar recently sold properties to help estimate a property's market value or listing price." },
  { questionText: "Absorption rate measures:", options: ["Loan payoff speed", "Rate at which available properties sell", "Interest accumulation", "Population growth"], correctAnswer: "B", explanation: "Absorption rate measures how quickly available inventory sells in a market, indicating market conditions." },
  { questionText: "Economic factors affecting real estate values include:", options: ["Employment rates", "Interest rates", "Population growth", "All of the above"], correctAnswer: "D", explanation: "Employment, interest rates, and population growth all significantly impact real estate demand and values." },
  { questionText: "The principle of highest and best use states that property should be valued based on:", options: ["Current use only", "Most profitable legal use", "Lowest possible use", "Previous owner's use"], correctAnswer: "B", explanation: "Highest and best use is the most profitable, legally permitted, and physically possible use of the property." },
  { questionText: "Market value assumes:", options: ["A distressed sale", "A willing buyer and seller", "No exposure to market", "Forced sale conditions"], correctAnswer: "B", explanation: "Market value assumes willing, informed buyers and sellers with reasonable market exposure and no undue pressure." },
  { questionText: "Appreciation refers to:", options: ["Decrease in property value", "Increase in property value", "Stable property value", "Tax assessment changes"], correctAnswer: "B", explanation: "Appreciation is an increase in property value over time due to market conditions or improvements." },
  { questionText: "Depreciation in real estate refers to:", options: ["Only physical deterioration", "Any loss in property value", "Tax benefits only", "Appreciation"], correctAnswer: "B", explanation: "Depreciation is a loss in property value from any cause, including physical, functional, or external factors." },
  { questionText: "Days on market (DOM) indicates:", options: ["Construction time", "How long a property has been listed for sale", "Loan processing time", "Inspection period"], correctAnswer: "B", explanation: "Days on market measures how long a property has been actively listed for sale." },
  { questionText: "In a balanced market:", options: ["Supply greatly exceeds demand", "Demand greatly exceeds supply", "Supply roughly equals demand", "There are no transactions"], correctAnswer: "C", explanation: "A balanced market has roughly equal supply and demand, with neither buyers nor sellers having a significant advantage." },
  { questionText: "Location is important to value because:", options: ["It cannot be changed", "It affects desirability and utility", "Both A and B", "Neither A nor B"], correctAnswer: "C", explanation: "Location is crucial because it's fixed and significantly impacts property desirability, utility, and value." },
  { questionText: "Market trends can be identified by analyzing:", options: ["Sales data over time", "Listing inventory levels", "Price changes", "All of the above"], correctAnswer: "D", explanation: "Market trend analysis uses multiple data points including sales history, inventory, and pricing patterns." },
];

// Unit 16: Real Estate Appraisal
const unit16Questions = [
  { questionText: "The sales comparison approach is most reliable for:", options: ["Income properties", "Special purpose properties", "Residential properties with comparable sales", "New construction"], correctAnswer: "C", explanation: "The sales comparison approach works best when there are sufficient comparable residential sales available." },
  { questionText: "The income approach is most appropriate for:", options: ["Single-family homes", "Income-producing properties", "Vacant land", "Churches"], correctAnswer: "B", explanation: "The income approach values property based on its income-generating potential, ideal for investment properties." },
  { questionText: "The cost approach is most useful for:", options: ["Older homes", "Rental properties", "New or special purpose properties", "Vacant land only"], correctAnswer: "C", explanation: "The cost approach is best for new construction or unique properties where comparable sales are scarce." },
  { questionText: "In the sales comparison approach, adjustments are made to:", options: ["The subject property", "Comparable properties", "Both properties", "Neither property"], correctAnswer: "B", explanation: "Adjustments are always made to the comparable properties to make them more similar to the subject." },
  { questionText: "If a comparable has a feature the subject lacks, you:", options: ["Add to the comparable", "Subtract from the comparable", "Add to the subject", "Make no adjustment"], correctAnswer: "B", explanation: "CBS (Comparable Better, Subtract): If comparable is better, subtract value to bring it down to subject's level." },
  { questionText: "Physical deterioration refers to:", options: ["Outdated design", "Neighborhood decline", "Wear and tear", "External obsolescence"], correctAnswer: "C", explanation: "Physical deterioration is loss in value due to physical wear and tear from age and use." },
  { questionText: "Functional obsolescence is caused by:", options: ["External factors", "Physical damage", "Outdated design or layout", "Normal wear"], correctAnswer: "C", explanation: "Functional obsolescence results from outdated designs, floor plans, or features that reduce desirability." },
  { questionText: "External obsolescence is caused by factors:", options: ["Within the property", "Outside the property", "From physical deterioration", "From poor maintenance"], correctAnswer: "B", explanation: "External (economic) obsolescence results from factors outside the property such as nearby nuisances or economic decline." },
  { questionText: "USPAP stands for:", options: ["United States Property Appraisal Program", "Uniform Standards of Professional Appraisal Practice", "Universal System of Property Assessment", "United System of Professional Appraisers"], correctAnswer: "B", explanation: "USPAP (Uniform Standards of Professional Appraisal Practice) sets ethical and performance standards for appraisers." },
];

// Unit 17: Real Estate Investments and Business Opportunity Brokerage
const unit17Questions = [
  { questionText: "Cash flow from an investment property is calculated as:", options: ["Gross income minus vacancy", "Net operating income minus debt service", "Sales price minus costs", "Rent only"], correctAnswer: "B", explanation: "Cash flow (before taxes) equals net operating income (NOI) minus mortgage debt service payments." },
  { questionText: "Net Operating Income (NOI) equals:", options: ["Gross income minus all expenses", "Effective gross income minus operating expenses", "Cash flow plus debt", "Rent minus vacancy only"], correctAnswer: "B", explanation: "NOI = Effective Gross Income minus Operating Expenses (excluding debt service and depreciation)." },
  { questionText: "The capitalization rate is used to:", options: ["Calculate loan payments", "Convert income to value", "Determine tax liability", "Measure physical condition"], correctAnswer: "B", explanation: "The cap rate converts a property's income stream into an estimated value: Value = NOI ÷ Cap Rate." },
  { questionText: "A higher cap rate generally indicates:", options: ["Lower risk, higher value", "Higher risk, lower value", "No relationship to risk", "Better financing"], correctAnswer: "B", explanation: "Higher cap rates typically indicate higher risk and result in lower property values (Value = NOI ÷ Cap Rate)." },
  { questionText: "Leverage in real estate investing means:", options: ["Paying all cash", "Using borrowed money to increase returns", "Avoiding debt", "Selling quickly"], correctAnswer: "B", explanation: "Leverage uses borrowed money to control a larger investment, potentially amplifying returns (and risks)." },
  { questionText: "The Gross Rent Multiplier (GRM) is calculated as:", options: ["Price ÷ Monthly Rent", "Monthly Rent ÷ Price", "NOI ÷ Price", "Price × Rent"], correctAnswer: "A", explanation: "GRM = Sales Price ÷ Gross Monthly (or Annual) Rent. Lower GRM may indicate better value." },
  { questionText: "Tax depreciation for residential rental property is taken over:", options: ["15 years", "27.5 years", "39 years", "50 years"], correctAnswer: "B", explanation: "Residential rental property is depreciated over 27.5 years for tax purposes (straight-line method)." },
  { questionText: "A business broker specializes in selling:", options: ["Residential homes only", "Operating businesses", "Vacant land", "Government properties"], correctAnswer: "B", explanation: "Business brokers specialize in the sale of operating businesses, which may or may not include real property." },
  { questionText: "Return on investment (ROI) measures:", options: ["Loan interest", "Profit relative to investment", "Property taxes", "Insurance costs"], correctAnswer: "B", explanation: "ROI measures the profitability of an investment by comparing the return (profit) to the amount invested." },
  { questionText: "The Internal Rate of Return (IRR) considers:", options: ["Only one year's income", "Time value of money over the holding period", "Only cash investment", "Only appreciation"], correctAnswer: "B", explanation: "IRR calculates the discount rate that makes NPV of all cash flows equal zero, considering time value of money." },
  { questionText: "A 1031 exchange allows investors to:", options: ["Avoid all taxes permanently", "Defer capital gains taxes", "Eliminate property taxes", "Avoid income taxes"], correctAnswer: "B", explanation: "A 1031 (like-kind) exchange allows deferral of capital gains taxes when exchanging investment properties." },
  { questionText: "Goodwill in a business sale represents:", options: ["Physical assets only", "Intangible value from reputation and customer base", "Inventory value", "Real estate value"], correctAnswer: "B", explanation: "Goodwill is the intangible value of a business including its reputation, customer relationships, and brand." },
  { questionText: "Positive cash flow occurs when:", options: ["Expenses exceed income", "Income exceeds all expenses and debt service", "The property is sold", "Taxes are paid"], correctAnswer: "B", explanation: "Positive cash flow means income after operating expenses and debt service leaves money for the investor." },
];

// Unit 18: Taxes Affecting Real Estate
const unit18Questions = [
  { questionText: "Ad valorem taxes are based on:", options: ["Income earned", "Property value", "Number of rooms", "Age of property"], correctAnswer: "B", explanation: "Ad valorem means 'according to value' - these property taxes are based on assessed property value." },
  { questionText: "One mill equals:", options: ["$1 per $100", "$1 per $1,000", "$10 per $1,000", "$100 per $1,000"], correctAnswer: "B", explanation: "One mill equals 1/10 of a cent, or $1 per $1,000 of assessed value." },
  { questionText: "The Florida homestead exemption can reduce taxable value by up to:", options: ["$25,000", "0", "$75,000", "$100,000"], correctAnswer: "A", explanation: "Florida homestead exemption provides up to $50,000 exemption ($25,000 on all taxes, $25,000 additional on non-school taxes)." },
  { questionText: "Special assessments are levied for:", options: ["General government operations", "Specific local improvements", "Federal taxes", "Income tax purposes"], correctAnswer: "B", explanation: "Special assessments pay for specific local improvements like sidewalks, sewers, or street lighting." },
  { questionText: "A tax lien takes priority over:", options: ["Nothing", "Most other liens", "Only mortgages", "Only judgments"], correctAnswer: "B", explanation: "Property tax liens generally take priority over most other liens, including mortgages." },
  { questionText: "The Save Our Homes (SOH) amendment limits annual increases in assessed value to:", options: ["5% or CPI", "3% or CPI, whichever is lower", "10%", "No limit"], correctAnswer: "B", explanation: "Save Our Homes caps annual assessment increases at 3% or the Consumer Price Index, whichever is lower." },
  { questionText: "Property taxes become a lien on:", options: ["December 31 of the prior year", "January 1 of the tax year", "When the tax bill is mailed", "When taxes become delinquent"], correctAnswer: "B", explanation: "Property tax liens attach on January 1 of the tax year, even before tax bills are sent." },
  { questionText: "Capital gains tax applies to:", options: ["Rental income", "Profit from selling property", "Property taxes paid", "Mortgage interest"], correctAnswer: "B", explanation: "Capital gains tax is levied on profit realized from the sale of capital assets like real estate." },
  { questionText: "The primary residence capital gains exclusion allows single filers to exclude up to:", options: ["$100,000", "$250,000", "$500,000", "$1,000,000"], correctAnswer: "B", explanation: "Single filers can exclude up to $250,000 of capital gains on the sale of their primary residence ($500,000 for married filing jointly)." },
  { questionText: "Documentary stamp tax in Florida is paid by:", options: ["The buyer only", "The seller typically", "The lender", "The title company"], correctAnswer: "B", explanation: "In Florida, documentary stamp tax on deeds is customarily paid by the seller." },
  { questionText: "Intangible tax applies to:", options: ["Deeds only", "New mortgages", "Property tax bills", "Title insurance"], correctAnswer: "B", explanation: "Florida intangible tax is a one-time tax on new mortgages, paid when the mortgage is recorded." },
  { questionText: "Taxable value equals:", options: ["Market value", "Assessed value minus exemptions", "Just value only", "Purchase price"], correctAnswer: "B", explanation: "Taxable value is assessed value minus any applicable exemptions like homestead." },
];

// Unit 19: Planning and Zoning
const unit19Questions = [
  { questionText: "Zoning is an exercise of:", options: ["Eminent domain", "Police power", "Taxation power", "Escheat"], correctAnswer: "B", explanation: "Zoning is an exercise of police power to regulate land use for public health, safety, and welfare." },
  { questionText: "A variance allows:", options: ["A prohibited use", "A deviation from zoning requirements", "Complete exemption from zoning", "Commercial use anywhere"], correctAnswer: "B", explanation: "A variance permits deviation from specific zoning requirements (like setbacks) due to hardship." },
  { questionText: "A nonconforming use is:", options: ["Illegal", "A use that existed before current zoning and may continue", "A variance", "A special exception"], correctAnswer: "B", explanation: "A nonconforming use is a lawful use that existed before current zoning and is allowed to continue (grandfathered)." },
  { questionText: "A special exception (conditional use) permits:", options: ["Any use the owner wants", "Uses allowed if certain conditions are met", "Violation of building codes", "Temporary structures only"], correctAnswer: "B", explanation: "Special exceptions allow uses that are permitted in a zone only if specific conditions are satisfied." },
  { questionText: "Building codes regulate:", options: ["Land use", "Construction standards", "Property taxes", "Zoning districts"], correctAnswer: "B", explanation: "Building codes establish minimum construction standards for structural safety, plumbing, electrical, etc." },
  { questionText: "The comprehensive plan is:", options: ["A zoning map", "A long-range guide for community development", "A building permit", "A subdivision plat"], correctAnswer: "B", explanation: "A comprehensive plan is a community's long-range guide for physical development and land use." },
  { questionText: "Spot zoning refers to:", options: ["Proper zoning practice", "Rezoning a small parcel inconsistent with surrounding area", "Industrial zoning", "Residential zoning"], correctAnswer: "B", explanation: "Spot zoning is rezoning a small parcel for a use inconsistent with surrounding zoning, often considered improper." },
  { questionText: "Buffer zones are used to:", options: ["Increase density", "Separate incompatible uses", "Eliminate parking", "Remove setbacks"], correctAnswer: "B", explanation: "Buffer zones separate incompatible land uses, like placing open space between industrial and residential areas." },
  { questionText: "Setback requirements specify:", options: ["Building height", "Minimum distance from property lines", "Number of units", "Parking spaces"], correctAnswer: "B", explanation: "Setbacks specify minimum distances buildings must be set back from property lines, streets, etc." },
  { questionText: "Mixed-use zoning allows:", options: ["Only residential uses", "Combination of residential and commercial", "Industrial uses only", "Agricultural uses only"], correctAnswer: "B", explanation: "Mixed-use zoning allows a combination of uses (e.g., residential above retail) in the same building or area." },
  { questionText: "An Environmental Impact Statement (EIS) evaluates:", options: ["Property taxes", "Potential environmental effects of a project", "Zoning compliance", "Building code violations"], correctAnswer: "B", explanation: "An EIS analyzes potential environmental impacts of proposed developments under NEPA requirements." },
];

export async function addUnitQuestions() {
  console.log("Adding additional questions to units 9-19...");
  
  const courseId = "4793335c-ce58-4cab-af5c-a9160d593ced";
  
  const unitData = [
    { unitNum: 9, questions: unit9Questions },
    { unitNum: 10, questions: unit10Questions },
    { unitNum: 11, questions: unit11Questions },
    { unitNum: 12, questions: unit12Questions },
    { unitNum: 13, questions: unit13Questions },
    { unitNum: 14, questions: unit14Questions },
    { unitNum: 15, questions: unit15Questions },
    { unitNum: 16, questions: unit16Questions },
    { unitNum: 17, questions: unit17Questions },
    { unitNum: 18, questions: unit18Questions },
    { unitNum: 19, questions: unit19Questions },
  ];
  
  for (const { unitNum, questions } of unitData) {
    // Find the practice exam for this unit
    const exams = await db.select().from(practiceExams).where(
      and(
        eq(practiceExams.courseId, courseId),
        like(practiceExams.title, `Unit ${unitNum} Quiz%`)
      )
    );
    
    if (exams.length === 0) {
      console.log(`Unit ${unitNum}: No practice exam found, skipping`);
      continue;
    }
    
    const exam = exams[0];
    
    // Get existing questions to avoid duplicates
    const existingQs = await db.select().from(examQuestions).where(eq(examQuestions.examId, exam.id));
    const existingTexts = new Set(existingQs.map(q => q.questionText?.substring(0, 50)));
    
    let added = 0;
    let nextSeq = existingQs.length;
    
    for (const q of questions) {
      // Check if question already exists (by first 50 chars)
      if (existingTexts.has(q.questionText.substring(0, 50))) {
        continue;
      }
      
      await db.insert(examQuestions).values({
        examId: exam.id,
        questionText: q.questionText,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        questionType: "multiple_choice",
        sequence: nextSeq++,
        unitReference: String(unitNum)
      });
      
      added++;
    }
    
    console.log(`Unit ${unitNum}: added ${added} new questions (now ${existingQs.length + added} total)`);
  }
  
  console.log("✓ Additional questions added to units 9-19");
}
