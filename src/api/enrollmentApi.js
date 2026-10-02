import axiosClient from './axiosClient';

export const enrollmentApi = {
  enrollStudent: (data) => {
    return axiosClient.post('/enrollments', data);
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
