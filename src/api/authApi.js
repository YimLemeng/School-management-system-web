import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => {
    return axiosClient.post('/auth/login', credentials);
  },

  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },

  getMe: () => {
    return axiosClient.get('/auth/me');
  },

  changePassword: (data) => {
    return axiosClient.post('/auth/change-password', data);
  },
};
