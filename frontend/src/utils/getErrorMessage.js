export function getErrorMessage(error) {
  return error.response?.data?.error || error.message || error.toString();
}
