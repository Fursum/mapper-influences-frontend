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

export function isNumber(value: string | number) {
  if (typeof value === 'number' && !isNaN(value)) {
    return true;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return !isNaN(Number(value));
  }
  return false;
}
