export const OPENAI_REASONING_EFFORTS = Object.freeze([
  'none',
  'low',
  'medium',
  'high',
  'xhigh',
  'max'
]);

export function assertCompletedResponse(response) {
  const status = response?.status || 'unknown';
  if (status === 'completed') return response;

  const error = new Error(`OpenAI response was not completed: ${status}`);
  error.code = 'OPENAI_RESPONSE_NOT_COMPLETED';
  error.responseStatus = status;
  throw error;
}
