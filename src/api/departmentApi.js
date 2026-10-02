import axiosClient from './axiosClient';

export const departmentApi = {
  getAllDepartments: () => {
    return axiosClient.get('/departments');
  },

  getDepartmentById: (id) => {
    return axiosClient.get(`/departments/${id}`);
  },

  createDepartment: (data) => {
    return axiosClient.post('/departments', data);
  },

  updateDepartment: (id, data) => {
    return axiosClient.put(`/departments/${id}`, data);
  },

  deleteDepartment: (id) => {
    return axiosClient.delete(`/departments/${id}`);
  },
};
