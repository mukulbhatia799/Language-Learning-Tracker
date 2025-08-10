import api from '../api/axios';
export const comment = (submissionId, comment) =>
  api.post(`/submissions/${submissionId}/comment`, { comment }).then(r => r.data);
