import React, { useEffect, useState } from 'react'
import { Table, Tag, Select, message, Card } from 'antd'
import { getAllOrders, updateOrderStatus } from '../api/orderApi'

const statusColor = {
    pending: 'orange', processing: 'blue',
    shipped: 'purple', delivered: 'green', cancelled: 'red',
}
const statusLabel = {
    pending: 'Chờ xử lý', processing: 'Đang xử lý',
    shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã huỷ',
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        getAllOrders()
            .then((res) => setOrders(res.data))
            .finally(() => setLoading(false))
    }, [])

    const handleStatusChange = async (orderId, status) => {
        try {
            await updateOrderStatus(orderId, status)
            message.success('Cập nhật trạng thái thành công!')
            setOrders((prev) =>
                prev.map((o) => o._id === orderId ? { ...o, status } : o)
            )
        } catch {
            message.error('Cập nhật thất bại!')
        }
    }

    const columns = [
        {
            title: 'Mã đơn', dataIndex: '_id',
            render: (id) => `#${id.slice(-6).toUpperCase()}`,
        },
        {
            title: 'Khách hàng', dataIndex: 'user',
            render: (u) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{u?.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{u?.email}</div>
                </div>
            ),
        },
        {
            title: 'Sản phẩm', dataIndex: 'items',
            render: (items) => `${items?.length} sản phẩm`,
        },
        {
            title: 'Tổng tiền', dataIndex: 'totalPrice',
            render: (p) => (
                <span style={{ fontWeight: 600, color: '#6C63FF' }}>
                    {p.toLocaleString('vi-VN')}đ
                </span>
            ),
            sorter: (a, b) => a.totalPrice - b.totalPrice,
        },
        {
            title: 'Ngày đặt', dataIndex: 'createdAt',
            render: (d) => new Date(d).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Trạng thái', dataIndex: 'status',
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ width: 150 }}
                    onChange={(val) => handleStatusChange(record._id, val)}
                    options={Object.entries(statusLabel).map(([value, label]) => ({
                        value,
                        label: <Tag color={statusColor[value]}>{label}</Tag>,
                    }))}
                />
            ),
        },
    ]

    const expandedRow = (record) => (
        <Card size="small" title="Chi tiết đơn hàng">
            <Table
                dataSource={record.items}
                rowKey="_id"
                pagination={false}
                size="small"
                columns={[
                    { title: 'Sản phẩm', dataIndex: 'name' },
                    {
                        title: 'Giá', dataIndex: 'price',
                        render: (p) => p.toLocaleString('vi-VN') + 'đ'
                    },
                    { title: 'Số lượng', dataIndex: 'quantity' },
                    {
                        title: 'Thành tiền',
                        render: (_, item) =>
                            (item.price * item.quantity).toLocaleString('vi-VN') + 'đ'
                    },
                ]}
            />
        </Card>
    )

    return (
        <div>
            <h2 style={{ marginBottom: 16, fontWeight: 700 }}>Quản lý đơn hàng</h2>
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="_id"
                loading={loading}
                expandable={{ expandedRowRender: expandedRow }}
                pagination={{ pageSize: 10 }}
            />
        </div>
    )
}