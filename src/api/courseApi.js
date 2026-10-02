import axiosClient from './axiosClient';

export const courseApi = {
  getAllCourses: (params = {}) => {
    return axiosClient.get('/courses', { params });
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
