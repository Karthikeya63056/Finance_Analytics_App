import { format, parse, isValid, isFuture } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (typeof date === 'string') {
    const parsed = parse(date, 'yyyy-MM-dd', new Date());
    return isValid(parsed) ? format(parsed, formatStr) : date;
  }
  return isValid(date) ? format(date, formatStr) : '';
};

export const parseDate = (dateString) => {
  const parsed = parse(dateString, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : null;
};

export const formatDateToInput = (date) => {
  if (typeof date === 'string') {
    return date;
  }
  if (isValid(date)) {
    return format(date, 'yyyy-MM-dd');
  }
  return '';
};

export const isFutureDate = (date) => {
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  return dateObj ? isFuture(dateObj) : false;
};

export const getMonthKey = (date) => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!isValid(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
