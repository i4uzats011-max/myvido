import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCalendarItemsForDate,
  getAllCalendarItemsForMonth,
  getPrayerTimingsForDate,
} from '@/lib/compliance';
import { connectToDatabase } from '@/lib/mongodb';
import { Person } from '@/lib/models/Person';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Fetch personal profile events (birthdays, anniversaries, and custom date fields)
    let personEvents: Array<{
      date: string;
      title: string;
      category: string;
      description: string;
      personName: string;
      personId: string;
    }> = [];

    try {
      await connectToDatabase();
      const persons = await Person.find({}).lean();
      persons.forEach((p) => {
        if (p.dob) {
          // If YYYY-MM-DD or MM-DD, align with target year
          const dobParts = p.dob.split('-');
          if (dobParts.length >= 2) {
            const mmdd = dobParts.slice(-2).join('-');
            const targetYear = year || new Date().getFullYear();
            const birthdayDate = `${targetYear}-${mmdd}`;
            personEvents.push({
              date: birthdayDate,
              title: `🎂 Birthday: ${p.name}`,
              category: 'personal-event',
              description: `Birthday reminder for ${p.name}. Notes: ${p.notes || 'None'}`,
              personName: p.name,
              personId: String(p._id),
            });
          }
        }
        if (p.anniversary) {
          const annParts = p.anniversary.split('-');
          if (annParts.length >= 2) {
            const mmdd = annParts.slice(-2).join('-');
            const targetYear = year || new Date().getFullYear();
            const annDate = `${targetYear}-${mmdd}`;
            personEvents.push({
              date: annDate,
              title: `💍 Anniversary: ${p.name}`,
              category: 'personal-event',
              description: `Anniversary reminder for ${p.name}.`,
              personName: p.name,
              personId: String(p._id),
            });
          }
        }
        // Custom date fields
        if (Array.isArray(p.customFields)) {
          p.customFields.forEach((cf) => {
            if (cf.isDate && cf.value) {
              personEvents.push({
                date: cf.value,
                title: `📅 ${cf.label}: ${p.name}`,
                category: 'personal-event',
                description: `${cf.label} for ${p.name}. Notes: ${p.notes || ''}`,
                personName: p.name,
                personId: String(p._id),
              });
            }
          });
        }
        // Remarks with follow-up due dates
        if (Array.isArray(p.remarksHistory)) {
          p.remarksHistory.forEach((rh) => {
            if (rh.dueDate) {
              personEvents.push({
                date: rh.dueDate,
                title: `🔔 Follow-up Due: ${p.name}`,
                category: 'personal-event',
                description: `Remark: ${rh.note}`,
                personName: p.name,
                personId: String(p._id),
              });
            }
          });
        }
      });
    } catch (e) {
      console.warn('Could not load person events for compliance calendar:', e);
    }

    if (date) {
      const items = getAllCalendarItemsForDate(date);
      const prayerTimings = getPrayerTimingsForDate(date);
      const matchedPersonEvents = personEvents.filter((pe) => pe.date === date);

      return NextResponse.json({
        date,
        items: [...items, ...matchedPersonEvents],
        prayerTimings,
      });
    }

    const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;

    const monthItems = getAllCalendarItemsForMonth(currentYear, currentMonth);
    const prefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const matchedPersonEvents = personEvents.filter((pe) => pe.date.startsWith(prefix));

    const todayStr = new Date().toISOString().split('T')[0];
    const todayPrayers = getPrayerTimingsForDate(todayStr);

    return NextResponse.json({
      year: currentYear,
      month: currentMonth,
      items: [...monthItems, ...matchedPersonEvents],
      todayPrayers,
    });
  } catch (error: unknown) {
    console.error('Compliance GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance items' }, { status: 500 });
  }
}
