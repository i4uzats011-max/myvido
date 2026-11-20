export interface Holiday {
  date: string;
  name: string;
  type: 'bank-holiday' | 'festival' | 'islamic';
}

export const holidays: Holiday[] = [
  // ===== 2025 =====
  { date: '2025-01-14', name: 'Makar Sankranti / Pongal', type: 'festival' },
  { date: '2025-01-26', name: 'Republic Day', type: 'bank-holiday' },
  { date: '2025-02-02', name: 'Vasant Panchami', type: 'festival' },
  { date: '2025-02-12', name: 'Guru Ravidas Jayanti', type: 'festival' },
  { date: '2025-02-19', name: 'Shivaji Jayanti', type: 'festival' },
  { date: '2025-02-26', name: 'Maha Shivaratri', type: 'festival' },
  { date: '2025-03-01', name: 'Ramadan Begins', type: 'islamic' },
  { date: '2025-03-14', name: 'Holi', type: 'festival' },
  { date: '2025-03-30', name: 'Ugadi / Gudi Padwa', type: 'festival' },
  { date: '2025-03-31', name: 'Eid ul-Fitr', type: 'islamic' },
  { date: '2025-04-06', name: 'Ram Navami', type: 'festival' },
  { date: '2025-04-10', name: 'Mahavir Jayanti', type: 'bank-holiday' },
  { date: '2025-04-13', name: 'Baisakhi', type: 'festival' },
  { date: '2025-04-14', name: 'Dr. Ambedkar Jayanti', type: 'bank-holiday' },
  { date: '2025-04-18', name: 'Good Friday', type: 'bank-holiday' },
  { date: '2025-05-01', name: 'May Day / Workers Day', type: 'bank-holiday' },
  { date: '2025-05-12', name: 'Buddha Purnima', type: 'bank-holiday' },
  { date: '2025-06-07', name: 'Eid ul-Adha (Bakra Eid)', type: 'islamic' },
  { date: '2025-07-06', name: 'Muharram', type: 'islamic' },
  { date: '2025-07-10', name: 'Rath Yatra', type: 'festival' },
  { date: '2025-08-09', name: 'Raksha Bandhan', type: 'festival' },
  { date: '2025-08-15', name: 'Independence Day', type: 'bank-holiday' },
  { date: '2025-08-16', name: 'Janmashtami', type: 'festival' },
  { date: '2025-08-27', name: 'Ganesh Chaturthi', type: 'festival' },
  { date: '2025-09-05', name: 'Milad-un-Nabi (Eid-e-Milad)', type: 'islamic' },
  { date: '2025-09-22', name: 'Navratri Begins', type: 'festival' },
  { date: '2025-10-02', name: 'Gandhi Jayanti / Dussehra', type: 'bank-holiday' },
  { date: '2025-10-20', name: 'Diwali', type: 'festival' },
  { date: '2025-10-21', name: 'Govardhan Puja', type: 'festival' },
  { date: '2025-10-22', name: 'Bhai Dooj', type: 'festival' },
  { date: '2025-10-23', name: 'Chhath Puja', type: 'festival' },
  { date: '2025-11-01', name: 'Karnataka Rajyotsava', type: 'festival' },
  { date: '2025-11-05', name: 'Guru Nanak Jayanti', type: 'bank-holiday' },
  { date: '2025-11-14', name: "Children's Day", type: 'festival' },
  { date: '2025-12-25', name: 'Christmas', type: 'bank-holiday' },

  // ===== 2026 =====
  { date: '2026-01-14', name: 'Makar Sankranti / Pongal', type: 'festival' },
  { date: '2026-01-26', name: 'Republic Day', type: 'bank-holiday' },
  { date: '2026-02-17', name: 'Maha Shivaratri', type: 'festival' },
  { date: '2026-02-18', name: 'Ramadan Begins', type: 'islamic' },
  { date: '2026-03-04', name: 'Holi', type: 'festival' },
  { date: '2026-03-19', name: 'Ugadi / Gudi Padwa', type: 'festival' },
  { date: '2026-03-20', name: 'Eid ul-Fitr', type: 'islamic' },
  { date: '2026-03-26', name: 'Ram Navami', type: 'festival' },
  { date: '2026-03-31', name: 'Mahavir Jayanti', type: 'bank-holiday' },
  { date: '2026-04-03', name: 'Good Friday', type: 'bank-holiday' },
  { date: '2026-04-13', name: 'Baisakhi', type: 'festival' },
  { date: '2026-04-14', name: 'Dr. Ambedkar Jayanti', type: 'bank-holiday' },
  { date: '2026-05-01', name: 'May Day / Workers Day', type: 'bank-holiday' },
  { date: '2026-05-01', name: 'Buddha Purnima', type: 'bank-holiday' },
  { date: '2026-05-27', name: 'Eid ul-Adha (Bakra Eid)', type: 'islamic' },
  { date: '2026-06-25', name: 'Muharram', type: 'islamic' },
  { date: '2026-07-29', name: 'Raksha Bandhan', type: 'festival' },
  { date: '2026-08-05', name: 'Janmashtami', type: 'festival' },
  { date: '2026-08-15', name: 'Independence Day', type: 'bank-holiday' },
  { date: '2026-08-17', name: 'Ganesh Chaturthi', type: 'festival' },
  { date: '2026-08-25', name: 'Milad-un-Nabi (Eid-e-Milad)', type: 'islamic' },
  { date: '2026-09-11', name: 'Navratri Begins', type: 'festival' },
  { date: '2026-09-20', name: 'Dussehra', type: 'festival' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'bank-holiday' },
  { date: '2026-10-09', name: 'Diwali', type: 'festival' },
  { date: '2026-10-10', name: 'Govardhan Puja', type: 'festival' },
  { date: '2026-10-11', name: 'Bhai Dooj', type: 'festival' },
  { date: '2026-10-12', name: 'Chhath Puja', type: 'festival' },
  { date: '2026-10-25', name: 'Guru Nanak Jayanti', type: 'bank-holiday' },
  { date: '2026-11-14', name: "Children's Day", type: 'festival' },
  { date: '2026-12-25', name: 'Christmas', type: 'bank-holiday' },
];

export function getHolidaysForDate(date: string): Holiday[] {
  return holidays.filter((h) => h.date === date);
}

export function getHolidaysForMonth(year: number, month: number): Holiday[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return holidays.filter((h) => h.date.startsWith(prefix));
}

export function getUpcomingHolidays(fromDate: string, limit = 5): Holiday[] {
  return holidays
    .filter((h) => h.date >= fromDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}
