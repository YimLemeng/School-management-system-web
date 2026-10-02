import axiosClient from './axiosClient';

export const teacherApi = {
  getAllTeachers: (params = {}) => {
    return axiosClient.get('/teachers', { params });
  },

  getTeacherById: (id) => {
    return axiosClient.get(`/teachers/${id}`);
  },

  createTeacher: (data) => {
    return axiosClient.post('/teachers', data);
  },

  updateTeacher: (id, data) => {
    return axiosClient.put(`/teachers/${id}`, data);
  },

  deleteTeacher: (id) => {
    return axiosClient.delete(`/teachers/${id}`);
  },
};
