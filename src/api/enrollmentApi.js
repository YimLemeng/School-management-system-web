import axiosClient from './axiosClient';

export const enrollmentApi = {
  getAllEnrollments: () => {
    return axiosClient.get('/enrollments');
  },

  enrollStudent: (data) => {
    return axiosClient.post('/enrollments', data);
  },

  confirmEnrollment: (id) => {
    return axiosClient.patch(`/enrollments/${id}/confirm`);
  },

  cancelEnrollment: (id) => {
    return axiosClient.patch(`/enrollments/${id}/cancel`);
  },

  getEnrollmentsByStudent: (studentId) => {
    return axiosClient.get(`/enrollments/student/${studentId}`);
  },

  getEnrollmentsByCourse: (courseId) => {
    return axiosClient.get(`/enrollments/course/${courseId}`);
  },
};
