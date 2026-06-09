export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  const apiErr = err as {
    response?: {
      data?: {
        message?: string;
        error?: { message?: string };
      };
    };
  };

  return (
    apiErr.response?.data?.error?.message
    ?? apiErr.response?.data?.message
    ?? fallback
  );
}
