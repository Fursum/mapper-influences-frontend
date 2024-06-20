import type { AxiosError, AxiosResponse } from 'axios';

export function mockRequest<T>(returnValue: T, timeout: number): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(returnValue), timeout),
  );
}

// Parameters are the same as above to quickly test for rejection
export async function mockAxiosReject<T>(
  _returnValue: T,
  timeout = 0,
): Promise<AxiosResponse<T>> {
  await new Promise((r) => setTimeout(r, timeout));
  const error: Partial<AxiosError> = {
    isAxiosError: true,
    status: 401,
    message: 'Unauthorized.',
  };

  throw error;
}

export function isNumber(value: string | number, canBeEmpty = false) {
  if (canBeEmpty && (value === '' || value === null)) {
    return true;
  }

  if (typeof value === 'number' && !Number.isNaN(value)) {
    return true;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return !Number.isNaN(Number(value));
  }
  return false;
}

export function relativeTimeText(isoTime: string) {
  const now = new Date();
  const past = new Date(isoTime);
  const diff = (now.getTime() - past.getTime()) / 1000;

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diff < 60) return rtf.format(-Math.floor(diff), 'second');
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute');
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour');
  if (diff < 604800) return rtf.format(-Math.floor(diff / 86400), 'day');
  if (diff < 2592000) return rtf.format(-Math.floor(diff / 604800), 'week');
  if (diff < 31536000) return rtf.format(-Math.floor(diff / 2592000), 'month');

  return rtf.format(-Math.floor(diff / 31536000), 'year');
}
