import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import {
    ShoppingOutlined, OrderedListOutlined,
    DollarOutlined, ClockCircleOutlined, UserOutlined,
} from '@ant-design/icons'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts'
import { getAllOrders } from '../api/orderApi'
import { getProducts } from '../api/productApi'
import { getAllUsers } from '../api/userApi'

const statusColor = {
    pending: 'orange', processing: 'blue',
    shipped: 'purple', delivered: 'green', cancelled: 'red',
}
const statusLabel = {
    pending: 'Chờ xử lý', processing: 'Đang xử lý',
    shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã huỷ',
}

export default function DashboardPage() {
    const [orders, setOrders] = useState([])
    const [products, setProducts] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [o, p, u] = await Promise.all([
                    getAllOrders(),
                    getProducts({ limit: 100 }),
                    getAllUsers(),
                ])
                setOrders(o.data)
                setProducts(p.data.products)
                setUsers(u.data)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const totalRevenue = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalPrice, 0)

    // Chart data — doanh thu theo ngày
    const revenueByDay = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((acc, o) => {
            const date = new Date(o.createdAt).toLocaleDateString('vi-VN')
            const existing = acc.find((d) => d.date === date)
            if (existing) {
                existing.revenue += o.totalPrice
                existing.orders += 1
            } else {
                acc.push({ date, revenue: o.totalPrice, orders: 1 })
            }
            return acc
        }, [])
        .slice(-7)

    // Chart data — đơn hàng theo trạng thái
    const ordersByStatus = Object.entries(statusLabel).map(([key, label]) => ({
        status: label,
        count: orders.filter((o) => o.status === key).length,
        color: statusColor[key],
    }))

    const columns = [
        {
            title: 'Mã đơn', dataIndex: '_id',
            render: (id) => (
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    #{id.slice(-6).toUpperCase()}
                </span>
            ),
        },
        {
            title: 'Khách hàng', dataIndex: 'user',
            render: (u) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{u?.name || 'N/A'}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{u?.email}</div>
                </div>
            ),
        },
        {
            title: 'Tổng tiền', dataIndex: 'totalPrice',
            render: (p) => (
                <span style={{ fontWeight: 600, color: '#6C63FF' }}>
                    {p.toLocaleString('vi-VN')}đ
                </span>
            ),
        },
        {
            title: 'Ngày đặt', dataIndex: 'createdAt',
            render: (d) => new Date(d).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Trạng thái', dataIndex: 'status',
            render: (s) => (
                <Tag color={statusColor[s]}>{statusLabel[s]}</Tag>
            ),
        },
    ]

    return (
        <div>
            <h2 style={{ marginBottom: 24, fontWeight: 700 }}>Dashboard</h2>

            {/* Stat cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={products.length}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#6C63FF' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={orders.length}
                            prefix={<OrderedListOutlined />}
                            valueStyle={{ color: '#2D9CDB' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title="Tổng Users"
                            value={users.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#9B51E0' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title="Chờ xử lý"
                            value={orders.filter((o) => o.status === 'pending').length}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#F2994A' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Doanh thu card */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card bordered={false}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title="Tổng doanh thu"
                            value={totalRevenue.toLocaleString('vi-VN') + 'đ'}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#27AE60', fontSize: 28 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                {/* Doanh thu 7 ngày */}
                <Col xs={24} lg={14}>
                    <Card
                        title="Doanh thu 7 ngày gần nhất"
                        bordered={false}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                        {revenueByDay.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={revenueByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(v) =>
                                            v >= 1000000
                                                ? `${(v / 1000000).toFixed(1)}M`
                                                : `${(v / 1000).toFixed(0)}K`
                                        }
                                    />
                                    <Tooltip
                                        formatter={(value) => [
                                            value.toLocaleString('vi-VN') + 'đ', 'Doanh thu',
                                        ]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#6C63FF"
                                        strokeWidth={2.5}
                                        dot={{ fill: '#6C63FF', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{
                                height: 260, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                color: '#999',
                            }}>
                                Chưa có dữ liệu
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Đơn hàng theo trạng thái */}
                <Col xs={24} lg={10}>
                    <Card
                        title="Đơn hàng theo trạng thái"
                        bordered={false}
                        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={ordersByStatus} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis
                                    type="category"
                                    dataKey="status"
                                    tick={{ fontSize: 11 }}
                                    width={80}
                                />
                                <Tooltip />
                                <Bar dataKey="count" name="Đơn hàng" radius={[0, 4, 4, 0]}
                                    fill="#6C63FF" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Recent orders table */}
            <Card
                title="Đơn hàng gần đây"
                bordered={false}
                style={{
                    marginTop: 16, borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
            >
                <Table
                    columns={columns}
                    dataSource={orders.slice(0, 5)}
                    rowKey="_id"
                    loading={loading}
                    pagination={false}
                />
            </Card>
        </div>
    )
}