import { getDaysInMonth, isWeekend, format, addDays } from 'date-fns';

// Calculates Easter date for a given year using Computus (Meeus/Jones/Butcher algorithm)
function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

export function isHoliday(date) {
  const day = date.getDate();
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();

  // Fixed holidays in Italy
  const fixedHolidays = [
    { day: 1, month: 0 },   // Capodanno
    { day: 6, month: 0 },   // Epifania
    { day: 25, month: 3 },  // Liberazione
    { day: 1, month: 4 },   // Festa dei Lavoratori
    { day: 2, month: 5 },   // Festa della Repubblica
    { day: 15, month: 7 },  // Ferragosto
    { day: 1, month: 10 },  // Tutti i Santi
    { day: 8, month: 11 },  // Immacolata
    { day: 25, month: 11 }, // Natale
    { day: 26, month: 11 }, // Santo Stefano
  ];

  const isFixedHoliday = fixedHolidays.some(h => h.day === day && h.month === month);
  if (isFixedHoliday) return true;

  // Pasquetta (Easter Monday)
  const easter = getEasterDate(year);
  const pasquetta = addDays(easter, 1);
  
  if (day === pasquetta.getDate() && month === pasquetta.getMonth()) {
    return true;
  }

  return false;
}

export function generateMonthDays(year, month) {
  const date = new Date(year, month, 1);
  const daysInMonth = getDaysInMonth(date);
  
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(year, month, i);
    days.push({
      date: currentDate,
      dayNumber: i,
      isWeekend: isWeekend(currentDate),
      isHoliday: isHoliday(currentDate),
    });
  }
  return days;
}

export const months = [
  "GENNAIO", "FEBBRAIO", "MARZO", "APRILE", "MAGGIO", "GIUGNO",
  "LUGLIO", "AGOSTO", "SETTEMBRE", "OTTOBRE", "NOVEMBRE", "DICEMBRE"
];
