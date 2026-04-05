import api from './axios'
export const getAllOrders = () => api.get('/orders/all')
export const updateOrderStatus = (id, status) =>
    api.put(`/orders/${id}/status`, { status })