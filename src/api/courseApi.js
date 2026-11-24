import axiosClient from './axiosClient';

export const courseApi = {
  getAllCourses: (params = {}) => {
    const normalized = { ...params };
    // Compatibility: support both pageSize and PageSize, default newest first
    if (normalized.pageSize !== undefined && normalized.PageSize === undefined) {
      normalized.PageSize = normalized.pageSize;
    }
    if (normalized.PageSize !== undefined && normalized.pageSize === undefined) {
      normalized.pageSize = normalized.PageSize;
    }
    if (normalized.sortDir === undefined) {
      normalized.sortDir = 'desc';
    }
    return axiosClient.get('/courses', { params: normalized });
  },

  getCourseById: (id) => {
    return axiosClient.get(`/courses/${id}`);
  },

  createCourse: (data) => {
    return axiosClient.post('/courses', data);
  },

  deleteCourse: (id) => {
    return axiosClient.delete(`/courses/${id}`);
  },
};
