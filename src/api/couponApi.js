import api from './axios'
export const getAllCoupons = () => api.get('/coupons')
export const createCoupon = (data) => api.post('/coupons', data)
export const updateCoupon = (id, data) => api.put(`/coupons/${id}`, data)
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`)