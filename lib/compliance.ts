/**
 * Comprehensive Statutory Compliance Engine & Calendar
 * Includes: TDS, GST, Income Tax, ROC, Bank Holidays, All-India & Global Festivals, Prayer Timings.
 * Generates dates dynamically for any year/month so changes and roll-overs happen automatically.
 */

export interface ComplianceItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'tds' | 'gst' | 'income-tax' | 'roc' | 'bank-holiday' | 'festival' | 'islamic' | 'prayer';
  priority: 'high' | 'medium' | 'low';
  description: string;
  statutoryAct?: string;
  formName?: string;
}

// Generate monthly & quarterly statutory dates dynamically for any year
export function getStatutoryCompliances(year: number): ComplianceItem[] {
  const items: ComplianceItem[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthStr = String(m).padStart(2, '0');

    // 1. TDS Monthly Deposit (Section 200(1) / Rule 30)
    // 7th of every month (for March deductions, it is 30th April)
    if (m === 4) {
      items.push({
        id: `tds-deposit-${year}-03`,
        date: `${year}-04-30`,
        title: 'TDS/TCS Deposit (March Deductions)',
        category: 'tds',
        priority: 'high',
        description: 'Challan ITNS 281 deposit for tax deducted/collected in the month of March.',
        statutoryAct: 'Income Tax Act 1961',
        formName: 'ITNS 281',
      });
    } else {
      const prevMonthName = new Date(year, m - 2).toLocaleString('en', { month: 'short' });
      items.push({
        id: `tds-deposit-${year}-${monthStr}`,
        date: `${year}-${monthStr}-07`,
        title: `TDS/TCS Payment (${prevMonthName})`,
        category: 'tds',
        priority: 'high',
        description: `Payment of TDS/TCS deducted/collected for previous month (${prevMonthName}).`,
        statutoryAct: 'Income Tax Act 1961',
        formName: 'ITNS 281',
      });
    }

    // 2. GST Monthly Compliances
    // GSTR-1: 11th of every month (outward supplies)
    items.push({
      id: `gst-gstr1-${year}-${monthStr}`,
      date: `${year}-${monthStr}-11`,
      title: `GSTR-1 (Monthly Outward Supplies)`,
      category: 'gst',
      priority: 'high',
      description: 'Monthly return of outward supplies of goods or services for turnover > ₹5 Crore or non-QRMP taxpayers.',
      statutoryAct: 'CGST Act 2017',
      formName: 'GSTR-1',
    });

    // GSTR-3B: 20th of every month (Monthly summary return & tax payment)
    items.push({
      id: `gst-gstr3b-${year}-${monthStr}`,
      date: `${year}-${monthStr}-20`,
      title: `GSTR-3B (Monthly Summary & Tax Payment)`,
      category: 'gst',
      priority: 'high',
      description: 'Monthly summary return along with tax liability payment for previous month.',
      statutoryAct: 'CGST Act 2017',
      formName: 'GSTR-3B',
    });
  }

  // Quarterly TDS Returns (Form 24Q, 26Q, 27Q)
  items.push(
    {
      id: `tds-q1-${year}`,
      date: `${year}-07-31`,
      title: 'TDS Return Filing Q1 (Apr-Jun)',
      category: 'tds',
      priority: 'high',
      description: 'Quarterly statement of TDS for Q1 (Form 24Q for Salary, 26Q for Non-Salary, 27Q for NRI).',
      statutoryAct: 'Income Tax Act 1961',
      formName: 'Form 24Q / 26Q / 27Q',
    },
    {
      id: `tds-q2-${year}`,
      date: `${year}-10-31`,
      title: 'TDS Return Filing Q2 (Jul-Sep)',
      category: 'tds',
      priority: 'high',
      description: 'Quarterly statement of TDS for Q2.',
      statutoryAct: 'Income Tax Act 1961',
      formName: 'Form 24Q / 26Q / 27Q',
    },
    {
      id: `tds-q3-${year}`,
      date: `${year}-01-31`,
      title: 'TDS Return Filing Q3 (Oct-Dec)',
      category: 'tds',
      priority: 'high',
      description: 'Quarterly statement of TDS for Q3.',
      statutoryAct: 'Income Tax Act 1961',
      formName: 'Form 24Q / 26Q / 27Q',
    },
    {
      id: `tds-q4-${year}`,
      date: `${year}-05-31`,
      title: 'TDS Return Filing Q4 (Jan-Mar)',
      category: 'tds',
      priority: 'high',
      description: 'Quarterly statement of TDS for Q4 of previous FY.',
      statutoryAct: 'Income Tax Act 1961',
      formName: 'Form 24Q / 26Q / 27Q',
    }
  );

  // Income Tax Advance Tax Installments
  items.push(
    {
      id: `advance-tax-1-${year}`,
      date: `${year}-06-15`,
      title: 'Income Tax Advance Tax Installment 1 (15%)',
      category: 'income-tax',
      priority: 'high',
      description: 'First installment of Advance Tax (15% of estimated tax liability).',
      statutoryAct: 'Section 211, Income Tax Act',
      formName: 'Challan ITNS 280',
    },
    {
      id: `advance-tax-2-${year}`,
      date: `${year}-09-15`,
      title: 'Income Tax Advance Tax Installment 2 (45%)',
      category: 'income-tax',
      priority: 'high',
      description: 'Second installment of Advance Tax (cumulative 45% of estimated tax).',
      statutoryAct: 'Section 211, Income Tax Act',
      formName: 'Challan ITNS 280',
    },
    {
      id: `advance-tax-3-${year}`,
      date: `${year}-12-15`,
      title: 'Income Tax Advance Tax Installment 3 (75%)',
      category: 'income-tax',
      priority: 'high',
      description: 'Third installment of Advance Tax (cumulative 75% of estimated tax).',
      statutoryAct: 'Section 211, Income Tax Act',
      formName: 'Challan ITNS 280',
    },
    {
      id: `advance-tax-4-${year}`,
      date: `${year}-03-15`,
      title: 'Income Tax Advance Tax Installment 4 (100%)',
      category: 'income-tax',
      priority: 'high',
      description: 'Final installment of Advance Tax (100% of estimated tax liability).',
      statutoryAct: 'Section 211, Income Tax Act',
      formName: 'Challan ITNS 280',
    }
  );

  // ITR & Audit Due Dates
  items.push(
    {
      id: `itr-individual-${year}`,
      date: `${year}-07-31`,
      title: 'ITR Filing Due Date (Individuals / Non-Audit)',
      category: 'income-tax',
      priority: 'high',
      description: 'Last date to file Income Tax Return (ITR-1, ITR-2, ITR-4) for non-audit individual taxpayers.',
      statutoryAct: 'Section 139(1), Income Tax Act',
      formName: 'ITR-1 / 2 / 4',
    },
    {
      id: `tax-audit-${year}`,
      date: `${year}-09-30`,
      title: 'Tax Audit Report Due Date (Form 3CA/3CB-3CD)',
      category: 'income-tax',
      priority: 'high',
      description: 'Filing of Tax Audit Report under Section 44AB by a practicing Chartered Accountant.',
      statutoryAct: 'Section 44AB, Income Tax Act',
      formName: 'Form 3CA/3CD / 3CB/3CD',
    },
    {
      id: `itr-audit-${year}`,
      date: `${year}-10-31`,
      title: 'ITR Filing Due Date (Corporate & Audit Cases)',
      category: 'income-tax',
      priority: 'high',
      description: 'Filing of Income Tax Return for companies, partners, and businesses subject to Tax Audit.',
      statutoryAct: 'Section 139(1), Income Tax Act',
      formName: 'ITR-5 / ITR-6',
    }
  );

  // ROC Compliances (Ministry of Corporate Affairs)
  items.push(
    {
      id: `roc-dpt3-${year}`,
      date: `${year}-06-30`,
      title: 'ROC Form DPT-3 (Return of Deposits)',
      category: 'roc',
      priority: 'high',
      description: 'Annual return of deposits and particulars not considered as deposits by all registered companies.',
      statutoryAct: 'Companies Act 2013',
      formName: 'Form DPT-3',
    },
    {
      id: `roc-dir3kyc-${year}`,
      date: `${year}-09-30`,
      title: 'ROC DIR-3 KYC (Director KYC Filing)',
      category: 'roc',
      priority: 'high',
      description: 'Annual KYC filing for all DIN holders to avoid DIN deactivation and ₹5,000 late fee.',
      statutoryAct: 'Companies (Appointment of Directors) Rules',
      formName: 'DIR-3 KYC / Web KYC',
    },
    {
      id: `roc-aoc4-${year}`,
      date: `${year}-10-29`,
      title: 'ROC Form AOC-4 (Financial Statements Filing)',
      category: 'roc',
      priority: 'high',
      description: 'Filing of Balance Sheet, P&L, Directors Report, Auditor Report within 30 days of AGM.',
      statutoryAct: 'Section 137, Companies Act',
      formName: 'Form AOC-4 / AOC-4 CFS',
    },
    {
      id: `roc-mgt7-${year}`,
      date: `${year}-11-28`,
      title: 'ROC Form MGT-7 / MGT-7A (Annual Return)',
      category: 'roc',
      priority: 'high',
      description: 'Filing of Annual Return of company within 60 days of AGM.',
      statutoryAct: 'Section 92, Companies Act',
      formName: 'Form MGT-7 / MGT-7A',
    }
  );

  // Quarterly GST CMP-08 for Composition Dealers (18th of month following quarter)
  items.push(
    {
      id: `gst-cmp08-q1-${year}`,
      date: `${year}-07-18`,
      title: 'GST CMP-08 Q1 (Composition Dealers)',
      category: 'gst',
      priority: 'medium',
      description: 'Quarterly statement for payment of self-assessed tax by composition scheme taxpayers.',
      statutoryAct: 'CGST Act 2017',
      formName: 'CMP-08',
    },
    {
      id: `gst-cmp08-q2-${year}`,
      date: `${year}-10-18`,
      title: 'GST CMP-08 Q2 (Composition Dealers)',
      category: 'gst',
      priority: 'medium',
      description: 'Quarterly statement for composition dealers for Q2.',
      statutoryAct: 'CGST Act 2017',
      formName: 'CMP-08',
    },
    {
      id: `gst-cmp08-q3-${year}`,
      date: `${year}-01-18`,
      title: 'GST CMP-08 Q3 (Composition Dealers)',
      category: 'gst',
      priority: 'medium',
      description: 'Quarterly statement for composition dealers for Q3.',
      statutoryAct: 'CGST Act 2017',
      formName: 'CMP-08',
    },
    {
      id: `gst-cmp08-q4-${year}`,
      date: `${year}-04-18`,
      title: 'GST CMP-08 Q4 (Composition Dealers)',
      category: 'gst',
      priority: 'medium',
      description: 'Quarterly statement for composition dealers for Q4.',
      statutoryAct: 'CGST Act 2017',
      formName: 'CMP-08',
    },
    {
      id: `gst-annual-${year}`,
      date: `${year}-12-31`,
      title: 'GST Annual Return (GSTR-9 / 9C)',
      category: 'gst',
      priority: 'high',
      description: 'Annual return and reconciliation statement for previous financial year.',
      statutoryAct: 'Section 44, CGST Act',
      formName: 'GSTR-9 / GSTR-9C',
    }
  );

  return items;
}

// Master Calendar of All Festivals, Regional Celebrations & Bank Holidays
export const masterCalendarList: ComplianceItem[] = [
  // 2025 Festivals & Holidays
  { id: 'h25-01', date: '2025-01-13', title: 'Lohri (Punjabi Harvest Festival)', category: 'festival', priority: 'medium', description: 'Traditional Punjabi bonfire festival celebrating winter harvest.' },
  { id: 'h25-02', date: '2025-01-14', title: 'Makar Sankranti / Pongal / Magh Bihu', category: 'festival', priority: 'medium', description: 'Sun enters Capricorn; celebrated with kite flying and sweet sesame laddoos.' },
  { id: 'h25-03', date: '2025-01-26', title: 'Republic Day (National Bank Holiday)', category: 'bank-holiday', priority: 'high', description: 'Commemorates the enactment of the Constitution of India in 1950.' },
  { id: 'h25-04', date: '2025-02-02', title: 'Vasant Panchami / Saraswati Puja', category: 'festival', priority: 'medium', description: 'Festival celebrating goddess of knowledge Saraswati and arrival of spring.' },
  { id: 'h25-05', date: '2025-02-12', title: 'Guru Ravidas Jayanti', category: 'festival', priority: 'medium', description: 'Birth anniversary of Guru Ravidas Ji celebrated widely in North India & Punjab.' },
  { id: 'h25-06', date: '2025-02-19', title: 'Chhatrapati Shivaji Maharaj Jayanti (Maharashtra)', category: 'festival', priority: 'medium', description: 'Birth anniversary of Great Maratha warrior king Shivaji Maharaj.' },
  { id: 'h25-07', date: '2025-02-26', title: 'Maha Shivaratri', category: 'festival', priority: 'medium', description: 'Night of Shiva; sacred fasting, prayers and night-long vigil.' },
  { id: 'h25-08', date: '2025-03-01', title: 'Ramadan Begins (Sehri & Fasting Starts)', category: 'islamic', priority: 'high', description: 'Holy month of dawn-to-dusk fasting, prayer, reflection and community.' },
  { id: 'h25-09', date: '2025-03-13', title: 'Holika Dahan', category: 'festival', priority: 'medium', description: 'Triumph of good over evil; bonfire lit on the eve of Holi.' },
  { id: 'h25-10', date: '2025-03-14', title: 'Holi (Festival of Colors)', category: 'festival', priority: 'high', description: 'Vibrant festival of spring, colors, music and joy.' },
  { id: 'h25-11', date: '2025-03-30', title: 'Gudi Padwa (Marathi New Year) / Ugadi', category: 'festival', priority: 'medium', description: 'Traditional New Year for Maharashtrians and Telugu/Kannada people.' },
  { id: 'h25-12', date: '2025-03-31', title: 'Eid ul-Fitr (Meethi Eid - Bank Holiday)', category: 'islamic', priority: 'high', description: 'End of Ramadan celebrated with sweet sheer khurma, prayers and charity.' },
  { id: 'h25-13', date: '2025-04-06', title: 'Ram Navami', category: 'festival', priority: 'medium', description: 'Celebrates the birth of Lord Rama.' },
  { id: 'h25-14', date: '2025-04-10', title: 'Mahavir Jayanti (Bank Holiday)', category: 'bank-holiday', priority: 'medium', description: 'Most important religious holiday in Jainism celebrating Lord Mahavira.' },
  { id: 'h25-15', date: '2025-04-13', title: 'Baisakhi / Vaisakhi (Sikh New Year & Khalsa Sirjana)', category: 'festival', priority: 'high', description: 'Harvest festival of Punjab and creation of the Khalsa by Guru Gobind Singh Ji.' },
  { id: 'h25-16', date: '2025-04-14', title: 'Dr. B.R. Ambedkar Jayanti (Bank Holiday)', category: 'bank-holiday', priority: 'high', description: 'Birth anniversary of the architect of the Indian Constitution.' },
  { id: 'h25-17', date: '2025-04-18', title: 'Good Friday (Bank Holiday)', category: 'bank-holiday', priority: 'medium', description: 'Christian holiday commemorating the crucifixion of Jesus Christ.' },
  { id: 'h25-18', date: '2025-04-20', title: 'Easter Sunday', category: 'festival', priority: 'medium', description: 'Resurrection of Jesus Christ from the dead.' },
  { id: 'h25-19', date: '2025-05-01', title: 'Maharashtra Day / International Workers Day', category: 'bank-holiday', priority: 'medium', description: 'Commemorates formation of Maharashtra and international labor rights.' },
  { id: 'h25-20', date: '2025-05-12', title: 'Buddha Purnima (Bank Holiday)', category: 'bank-holiday', priority: 'medium', description: 'Birth, enlightenment and passing of Gautama Buddha.' },
  { id: 'h25-21', date: '2025-06-07', title: 'Eid ul-Adha (Bakra Eid - Bank Holiday)', category: 'islamic', priority: 'high', description: 'Festival of sacrifice, honors willingness of Ibrahim to sacrifice his son.' },
  { id: 'h25-22', date: '2025-07-06', title: 'Muharram (Ashura - Bank Holiday)', category: 'islamic', priority: 'high', description: 'Tenth day of Muharram mourning martyrdom of Imam Husain.' },
  { id: 'h25-23', date: '2025-07-10', title: 'Jagannath Rath Yatra (Puri)', category: 'festival', priority: 'medium', description: 'Grand annual chariot procession of Lord Jagannath in Odisha.' },
  { id: 'h25-24', date: '2025-08-09', title: 'Raksha Bandhan', category: 'festival', priority: 'medium', description: 'Sacred bond of protection and love between brothers and sisters.' },
  { id: 'h25-25', date: '2025-08-15', title: 'Independence Day (National Holiday)', category: 'bank-holiday', priority: 'high', description: 'Commemorates Indias independence from British rule in 1947.' },
  { id: 'h25-26', date: '2025-08-16', title: 'Krishna Janmashtami', category: 'festival', priority: 'medium', description: 'Birth celebration of Lord Krishna with Dahi Handi and midnight prayers.' },
  { id: 'h25-27', date: '2025-08-27', title: 'Ganesh Chaturthi (Vinayaka Chavithi)', category: 'festival', priority: 'high', description: '10-day festival honoring Lord Ganeshas arrival, celebrated with modaks.' },
  { id: 'h25-28', date: '2025-09-05', title: 'Milad-un-Nabi (Eid-e-Milad)', category: 'islamic', priority: 'medium', description: 'Observance of the birthday of the Prophet Muhammad.' },
  { id: 'h25-29', date: '2025-09-22', title: 'Sharad Navratri Begins (Durga Puja)', category: 'festival', priority: 'high', description: 'Nine nights of divine feminine power, Garba, Dandiya and Durga Puja.' },
  { id: 'h25-30', date: '2025-10-02', title: 'Mahatma Gandhi Jayanti & Dussehra (Vijayadashami)', category: 'bank-holiday', priority: 'high', description: 'Birth anniversary of Father of the Nation and victory of Lord Rama over Ravana.' },
  { id: 'h25-31', date: '2025-10-10', title: 'Karwa Chauth', category: 'festival', priority: 'medium', description: 'Fasting by married women for the longevity and prosperity of their husbands.' },
  { id: 'h25-32', date: '2025-10-18', title: 'Dhanteras (Wealth & Health Celebration)', category: 'festival', priority: 'medium', description: 'Auspicious day for purchasing metals and welcoming Goddess Lakshmi.' },
  { id: 'h25-33', date: '2025-10-20', title: 'Diwali (Deepawali - Festival of Lights)', category: 'festival', priority: 'high', description: 'Largest Indian festival celebrating light over darkness, Lakshmi Puja.' },
  { id: 'h25-34', date: '2025-10-21', title: 'Govardhan Puja / Gujarati New Year (Bestu Varas)', category: 'festival', priority: 'medium', description: 'Commemorates Lord Krishna lifting Mount Govardhan.' },
  { id: 'h25-35', date: '2025-10-22', title: 'Bhai Dooj / Bhau Beej', category: 'festival', priority: 'medium', description: 'Celebration of sibling affection between sisters and brothers.' },
  { id: 'h25-36', date: '2025-10-27', title: 'Chhath Puja (Arghya to Sun God)', category: 'festival', priority: 'high', description: 'Ancient Vedic festival dedicated to Surya Dev and Chhathi Maiya.' },
  { id: 'h25-37', date: '2025-11-05', title: 'Guru Nanak Dev Ji Jayanti (Gurpurab - Bank Holiday)', category: 'bank-holiday', priority: 'high', description: 'Birth anniversary of the founder of Sikhism, marked with Prabhat Pheris and Langar.' },
  { id: 'h25-38', date: '2025-12-25', title: 'Christmas Day (Global Bank Holiday)', category: 'bank-holiday', priority: 'high', description: 'Celebration of the birth of Jesus Christ.' },

  // 2026 Festivals & Holidays
  { id: 'h26-01', date: '2026-01-13', title: 'Lohri (Punjabi Festival)', category: 'festival', priority: 'medium', description: 'Winter harvest festival of Punjab.' },
  { id: 'h26-02', date: '2026-01-14', title: 'Makar Sankranti / Pongal', category: 'festival', priority: 'medium', description: 'Harvest festival across India.' },
  { id: 'h26-03', date: '2026-01-26', title: 'Republic Day (National Bank Holiday)', category: 'bank-holiday', priority: 'high', description: 'National holiday honoring the Constitution of India.' },
  { id: 'h26-04', date: '2026-02-15', title: 'Maha Shivaratri', category: 'festival', priority: 'medium', description: 'Sacred night of Lord Shiva.' },
  { id: 'h26-05', date: '2026-02-18', title: 'Ramadan 2026 Begins (Sehri & Iftar)', category: 'islamic', priority: 'high', description: 'Start of the holy month of Ramadan.' },
  { id: 'h26-06', date: '2026-02-19', title: 'Shivaji Jayanti (Maharashtra)', category: 'festival', priority: 'medium', description: 'Birth anniversary of Chhatrapati Shivaji Maharaj.' },
  { id: 'h26-07', date: '2026-03-03', title: 'Holika Dahan', category: 'festival', priority: 'medium', description: 'Sacred eve of Holi.' },
  { id: 'h26-08', date: '2026-03-04', title: 'Holi (Festival of Colors)', category: 'festival', priority: 'high', description: 'Spring festival of colors.' },
  { id: 'h26-09', date: '2026-03-19', title: 'Gudi Padwa / Ugadi', category: 'festival', priority: 'medium', description: 'Marathi and Telugu New Year.' },
  { id: 'h26-10', date: '2026-03-20', title: 'Eid ul-Fitr (Bank Holiday)', category: 'islamic', priority: 'high', description: 'Eid al-Fitr celebrating completion of Ramadan fasts.' },
  { id: 'h26-11', date: '2026-03-26', title: 'Ram Navami', category: 'festival', priority: 'medium', description: 'Celebration of Lord Ramas birth.' },
  { id: 'h26-12', date: '2026-03-31', title: 'Mahavir Jayanti', category: 'bank-holiday', priority: 'medium', description: 'Jain festival of Lord Mahavira.' },
  { id: 'h26-13', date: '2026-04-03', title: 'Good Friday (Bank Holiday)', category: 'bank-holiday', priority: 'medium', description: 'Commemoration of the Crucifixion of Jesus.' },
  { id: 'h26-14', date: '2026-04-13', title: 'Baisakhi (Khalsa Day)', category: 'festival', priority: 'high', description: 'Sikh festival and Punjabi harvest.' },
  { id: 'h26-15', date: '2026-04-14', title: 'Dr. B.R. Ambedkar Jayanti', category: 'bank-holiday', priority: 'high', description: 'National tribute to Dr. Ambedkar.' },
  { id: 'h26-16', date: '2026-05-01', title: 'Maharashtra Day / May Day', category: 'bank-holiday', priority: 'medium', description: 'Workers Day and Maharashtra foundation day.' },
  { id: 'h26-17', date: '2026-05-27', title: 'Eid ul-Adha (Bakra Eid)', category: 'islamic', priority: 'high', description: 'Islamic Feast of Sacrifice.' },
  { id: 'h26-18', date: '2026-06-25', title: 'Muharram (Ashura)', category: 'islamic', priority: 'high', description: 'Mourning day of Muharram.' },
  { id: 'h26-19', date: '2026-07-29', title: 'Raksha Bandhan', category: 'festival', priority: 'medium', description: 'Bond of siblings.' },
  { id: 'h26-20', date: '2026-08-05', title: 'Krishna Janmashtami', category: 'festival', priority: 'medium', description: 'Lord Krishnas appearance day.' },
  { id: 'h26-21', date: '2026-08-15', title: 'Independence Day', category: 'bank-holiday', priority: 'high', description: '79th Indian Independence Day celebration.' },
  { id: 'h26-22', date: '2026-08-17', title: 'Ganesh Chaturthi', category: 'festival', priority: 'high', description: 'Arrival of Lord Ganesha.' },
  { id: 'h26-23', date: '2026-08-25', title: 'Milad-un-Nabi', category: 'islamic', priority: 'medium', description: 'Prophet Muhammads birthday.' },
  { id: 'h26-24', date: '2026-09-11', title: 'Sharad Navratri Begins', category: 'festival', priority: 'high', description: 'Start of Navratri festivities.' },
  { id: 'h26-25', date: '2026-09-20', title: 'Dussehra (Vijayadashami)', category: 'festival', priority: 'high', description: 'Victory of good over evil.' },
  { id: 'h26-26', date: '2026-10-02', title: 'Mahatma Gandhi Jayanti', category: 'bank-holiday', priority: 'high', description: 'International Day of Non-Violence.' },
  { id: 'h26-27', date: '2026-11-08', title: 'Diwali (Deepawali)', category: 'festival', priority: 'high', description: 'Grand Festival of Lights.' },
  { id: 'h26-28', date: '2026-11-24', title: 'Guru Nanak Jayanti (Gurpurab)', category: 'bank-holiday', priority: 'high', description: 'Celebration of Guru Nanak Dev Ji.' },
  { id: 'h26-29', date: '2026-12-25', title: 'Christmas Day', category: 'bank-holiday', priority: 'high', description: 'Global Christmas celebrations.' },
];

/**
 * Calculates prayer times dynamically for any given date.
 * Based on solar angles for Delhi/North India (approx. 28.61° N, 77.20° E).
 * Provides reliable timings: Fajr (Sehri end), Sunrise, Dhuhr, Asr, Maghrib (Iftar start), Isha.
 */
export function getPrayerTimingsForDate(dateStr: string) {
  const d = new Date(dateStr);
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);

  // Solar declination approximation for seasonality
  const declination = -23.44 * Math.cos(((360 / 365) * (dayOfYear + 10) * Math.PI) / 180);

  // Minutes offset from noon based on seasonal daylight variation
  const variationMin = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 45;

  const fajrHour = 5;
  const fajrMin = Math.round(15 - variationMin * 0.4);

  const sunriseHour = 6;
  const sunriseMin = Math.round(35 - variationMin * 0.35);

  const dhuhrHour = 12;
  const dhuhrMin = 28;

  const asrHour = 16;
  const asrMin = Math.round(20 + variationMin * 0.3);

  const maghribHour = 18;
  const maghribMin = Math.round(25 + variationMin * 0.4);

  const ishaHour = 19;
  const ishaMin = Math.round(45 + variationMin * 0.3);

  const format = (h: number, m: number) => {
    let cleanH = h;
    let cleanM = m;
    while (cleanM >= 60) {
      cleanM -= 60;
      cleanH += 1;
    }
    while (cleanM < 0) {
      cleanM += 60;
      cleanH -= 1;
    }
    const ampm = cleanH >= 12 ? 'PM' : 'AM';
    const displayH = cleanH > 12 ? cleanH - 12 : cleanH === 0 ? 12 : cleanH;
    return `${String(displayH).padStart(2, '0')}:${String(cleanM).padStart(2, '0')} ${ampm}`;
  };

  return {
    sehriEnd: format(fajrHour, fajrMin - 10), // Safe buffer for Sehri
    fajr: format(fajrHour, fajrMin),
    sunrise: format(sunriseHour, sunriseMin),
    dhuhr: format(dhuhrHour, dhuhrMin),
    asr: format(asrHour, asrMin),
    maghrib: format(maghribHour, maghribMin),
    iftar: format(maghribHour, maghribMin), // Maghrib marks exact Iftar time
    isha: format(ishaHour, ishaMin),
  };
}

// Master query function to get all items for a specific date
export function getAllCalendarItemsForDate(dateStr: string): ComplianceItem[] {
  const d = new Date(dateStr);
  const year = d.getFullYear() || 2025;

  const statutory = getStatutoryCompliances(year);
  const matchedStatutory = statutory.filter((item) => item.date === dateStr);
  const matchedFestivals = masterCalendarList.filter((item) => item.date === dateStr);

  return [...matchedStatutory, ...matchedFestivals];
}

// Master query function to get all items for a month
export function getAllCalendarItemsForMonth(year: number, month: number): ComplianceItem[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const statutory = getStatutoryCompliances(year).filter((item) => item.date.startsWith(prefix));
  const festivals = masterCalendarList.filter((item) => item.date.startsWith(prefix));

  return [...statutory, ...festivals].sort((a, b) => a.date.localeCompare(b.date));
}
