// Hebrew calendar utilities with enhanced scheduling support
export interface HebrewDateInfo {
  hebrewDate: string;
  parsha: string;
  gregorianDate: string;
  dayOfWeek: string;
  hebrewDayOfWeek: string;
  hebrewMonth: string;
  hebrewDay: number;
  hebrewYear: number;
}

// Hebrew months in order
const hebrewMonths = [
  'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר',
  'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
];

// Hebrew numbers
const hebrewNumbers: { [key: number]: string } = {
  1: 'א׳', 2: 'ב׳', 3: 'ג׳', 4: 'ד׳', 5: 'ה׳', 6: 'ו׳', 7: 'ז׳', 8: 'ח׳', 9: 'ט׳', 10: 'י׳',
  11: 'י״א', 12: 'י״ב', 13: 'י״ג', 14: 'י״ד', 15: 'ט״ו', 16: 'ט״ז', 17: 'י״ז', 18: 'י״ח', 19: 'י״ט', 20: 'כ׳',
  21: 'כ״א', 22: 'כ״ב', 23: 'כ״ג', 24: 'כ״ד', 25: 'כ״ה', 26: 'כ״ו', 27: 'כ״ז', 28: 'כ״ח', 29: 'כ״ט', 30: 'ל׳'
};

// Days of the week in English and Hebrew
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hebrewDaysOfWeek = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת קודש'];

// Torah portions in order (complete annual cycle)
const parshiot = [
  'בראשית', 'נח', 'לך לך', 'וירא', 'חיי שרה', 'תולדות',
  'ויצא', 'וישלח', 'וישב', 'מקץ', 'ויגש', 'ויחי',
  'שמות', 'וארא', 'בא', 'בשלח', 'יתרו', 'משפטים',
  'תרומה', 'תצוה', 'כי תשא', 'ויקהל', 'פקודי', 'ויקרא',
  'צו', 'שמיני', 'תזריע', 'מצורע', 'אחרי מות', 'קדושים',
  'אמור', 'בהר', 'בחקתי', 'במדבר', 'נשא', 'בהעלתך',
  'שלח לך', 'קרח', 'חקת', 'בלק', 'פינחס', 'מטות',
  'מסעי', 'דברים', 'ואתחנן', 'עקב', 'ראה', 'שפטים',
  'כי תצא', 'כי תבוא', 'נצבים', 'וילך', 'האזינו', 'וזאת הברכה'
];

// Reference date: June 25, 2025 = כ״ט סיון תשפ״ה, Wednesday, פרשת קרח
const REFERENCE_DATE = new Date(2025, 5, 25); // June 25, 2025 (Wednesday)
const REFERENCE_HEBREW_DAY = 29;
const REFERENCE_HEBREW_MONTH = 8; // Sivan (0-indexed)
const REFERENCE_HEBREW_YEAR = 5785;
const REFERENCE_PARSHA_INDEX = 37; // קרח
const REFERENCE_DAY_OF_WEEK = 3; // Wednesday (0 = Sunday)

// Find the most recent Sunday for Parsha calculation
function getMostRecentSunday(date: Date): Date {
  const sunday = new Date(date);
  const dayOfWeek = sunday.getDay();
  sunday.setDate(sunday.getDate() - dayOfWeek);
  return sunday;
}

export function getHebrewDateInfo(date: Date = new Date()): HebrewDateInfo {
  // Calculate days difference from reference date
  const daysDiff = Math.floor((date.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate Hebrew date
  let hebrewDay = REFERENCE_HEBREW_DAY + daysDiff;
  let hebrewMonth = REFERENCE_HEBREW_MONTH;
  let hebrewYear = REFERENCE_HEBREW_YEAR;
  
  // Days in Hebrew months (simplified - doesn't account for leap years)
  const daysInMonth = [30, 29, 29, 29, 30, 29, 30, 29, 30, 29, 30, 29]; // Tishrei to Elul
  
  // Adjust for month overflow/underflow
  while (hebrewDay > daysInMonth[hebrewMonth]) {
    hebrewDay -= daysInMonth[hebrewMonth];
    hebrewMonth++;
    if (hebrewMonth >= 12) {
      hebrewMonth = 0;
      hebrewYear++;
    }
  }
  
  while (hebrewDay <= 0) {
    hebrewMonth--;
    if (hebrewMonth < 0) {
      hebrewMonth = 11;
      hebrewYear--;
    }
    hebrewDay += daysInMonth[hebrewMonth];
  }
  
  // Calculate parsha based on the most recent Sunday
  const mostRecentSunday = getMostRecentSunday(date);
  const referenceSunday = getMostRecentSunday(REFERENCE_DATE);
  const weeksDiff = Math.floor((mostRecentSunday.getTime() - referenceSunday.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  // Adjust parsha index based on weeks from reference Sunday
  let parshaIndex = REFERENCE_PARSHA_INDEX + weeksDiff;
  
  // Handle year cycle (52-54 parshiot per year depending on leap years and holidays)
  while (parshaIndex < 0) {
    parshaIndex += parshiot.length;
  }
  parshaIndex = parshaIndex % parshiot.length;
  
  const currentParsha = parshiot[parshaIndex];
  
  // Get day of week
  const dayOfWeek = date.getDay();
  const englishDayOfWeek = daysOfWeek[dayOfWeek];
  const hebrewDayOfWeek = hebrewDaysOfWeek[dayOfWeek];
  
  // Format Hebrew date
  const hebrewDayStr = hebrewNumbers[hebrewDay] || hebrewDay.toString();
  const hebrewMonthName = hebrewMonths[hebrewMonth];
  const hebrewDate = `${hebrewDayStr} ${hebrewMonthName} תשפ״ה`;
  
  return {
    hebrewDate,
    parsha: `פרשת ${currentParsha}`,
    gregorianDate: date.toISOString().split('T')[0],
    dayOfWeek: englishDayOfWeek,
    hebrewDayOfWeek,
    hebrewMonth: hebrewMonthName,
    hebrewDay,
    hebrewYear
  };
}

// Check if current date matches Hebrew calendar schedule
export function isHebrewScheduleActive(schedule: any, currentDate: Date = new Date()): boolean {
  if (!schedule || !schedule.useHebrewCalendar) return false;
  
  const currentHebrewInfo = getHebrewDateInfo(currentDate);
  
  // Check specific parshiot
  if (schedule.specificParshiot && schedule.specificParshiot.length > 0) {
    const currentParsha = currentHebrewInfo.parsha.replace('פרשת ', '');
    return schedule.specificParshiot.includes(currentParsha);
  }
  
  // Check Hebrew month range
  if (schedule.hebrewStartMonth || schedule.hebrewEndMonth) {
    const currentMonthIndex = hebrewMonths.indexOf(currentHebrewInfo.hebrewMonth);
    const startMonthIndex = schedule.hebrewStartMonth ? hebrewMonths.indexOf(schedule.hebrewStartMonth) : 0;
    const endMonthIndex = schedule.hebrewEndMonth ? hebrewMonths.indexOf(schedule.hebrewEndMonth) : 11;
    
    // Handle year wrap-around (e.g., Tishrei to Adar)
    if (startMonthIndex <= endMonthIndex) {
      if (currentMonthIndex < startMonthIndex || currentMonthIndex > endMonthIndex) {
        return false;
      }
    } else {
      if (currentMonthIndex < startMonthIndex && currentMonthIndex > endMonthIndex) {
        return false;
      }
    }
    
    // Check specific days within the month range
    if (schedule.hebrewStartDay && currentHebrewInfo.hebrewMonth === schedule.hebrewStartMonth) {
      if (currentHebrewInfo.hebrewDay < schedule.hebrewStartDay) return false;
    }
    
    if (schedule.hebrewEndDay && currentHebrewInfo.hebrewMonth === schedule.hebrewEndMonth) {
      if (currentHebrewInfo.hebrewDay > schedule.hebrewEndDay) return false;
    }
  }
  
  // Check specific Hebrew year (if not recurring)
  if (!schedule.recurring && schedule.hebrewYear) {
    if (currentHebrewInfo.hebrewYear !== schedule.hebrewYear) return false;
  }
  
  return true;
}

// Convert Hebrew date string to Gregorian date
export function parseHebrewDate(hebrewDateStr: string): Date | null {
  try {
    // This is a simplified parser - in production you'd want more robust parsing
    const parts = hebrewDateStr.trim().split(' ');
    if (parts.length < 3) return null;
    
    // Find day number
    const dayStr = parts[0];
    let day = 1;
    for (const [num, heb] of Object.entries(hebrewNumbers)) {
      if (heb === dayStr) {
        day = parseInt(num);
        break;
      }
    }
    
    // Find month
    const monthStr = parts[1];
    const monthIndex = hebrewMonths.indexOf(monthStr);
    if (monthIndex === -1) return null;
    
    // Calculate approximate Gregorian date
    const daysDiff = (day - REFERENCE_HEBREW_DAY) + 
                    (monthIndex - REFERENCE_HEBREW_MONTH) * 30;
    
    const resultDate = new Date(REFERENCE_DATE);
    resultDate.setDate(resultDate.getDate() + daysDiff);
    
    return resultDate;
  } catch (error) {
    return null;
  }
}

// Get all Hebrew months for dropdowns
export function getHebrewMonths(): string[] {
  return [...hebrewMonths];
}

// Get all parshiot for dropdowns
export function getAllParshiot(): string[] {
  return [...parshiot];
}

// Get Hebrew date for a specific date
export function formatHebrewDate(date: Date): string {
  const info = getHebrewDateInfo(date);
  return info.hebrewDate;
}

// Get current parsha
export function getCurrentParsha(): string {
  const info = getHebrewDateInfo();
  return info.parsha;
}

// Get day of week in Hebrew
export function getHebrewDayOfWeek(date: Date = new Date()): string {
  const info = getHebrewDateInfo(date);
  return info.hebrewDayOfWeek;
}

// Get day of week in English
export function getEnglishDayOfWeek(date: Date = new Date()): string {
  const info = getHebrewDateInfo(date);
  return info.dayOfWeek;
}