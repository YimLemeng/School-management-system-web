import axiosClient from './axiosClient';

export const studentApi = {
  getAllStudents: (params = {}) => {
    return axiosClient.get('/students', { params });
  },

  getStudentById: (id) => {
    return axiosClient.get(`/students/${id}`);
  },

  createStudent: (data) => {
    return axiosClient.post('/students', data);
  },

  updateStudent: (id, data) => {
    return axiosClient.put(`/students/${id}`, data);
  },

  deleteStudent: (id) => {
    return axiosClient.delete(`/students/${id}`);
  },
};
