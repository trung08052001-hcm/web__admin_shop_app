import api from './axios'
export const getAllUsers = () => api.get('/auth/users')
export const updateUserRole = (id, role) =>
    api.put(`/auth/users/${id}/role`, { role })