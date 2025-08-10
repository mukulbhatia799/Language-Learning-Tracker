import api from '../api/axios';
export const testsHeatmap = (params) => api.get('/progress/tests-heatmap', { params }).then(r => r.data);