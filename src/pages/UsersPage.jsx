import React, { useEffect, useState } from 'react'
import { Table, Tag, Select, message, Avatar, Space } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { getAllUsers, updateUserRole } from '../api/userApi'

export default function UsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        getAllUsers()
            .then((res) => setUsers(res.data))
            .catch(() => message.error('Không tải được danh sách user!'))
            .finally(() => setLoading(false))
    }, [])

    const handleRoleChange = async (userId, role) => {
        try {
            await updateUserRole(userId, role)
            message.success('Cập nhật role thành công!')
            setUsers((prev) =>
                prev.map((u) => u._id === userId ? { ...u, role } : u)
            )
        } catch {
            message.error('Cập nhật thất bại!')
        }
    }

    const columns = [
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            render: (avatar, record) => (
                avatar
                    ? <Avatar src={avatar} size={40} />
                    : <Avatar size={40} style={{ background: '#6C63FF' }}
                        icon={<UserOutlined />}>
                        {record.name?.[0]?.toUpperCase()}
                    </Avatar>
            ),
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            render: (email) => (
                <span style={{ color: '#666' }}>{email}</span>
            ),
        },
        {
            title: 'Đăng ký lúc',
            dataIndex: 'createdAt',
            render: (d) => new Date(d).toLocaleDateString('vi-VN'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            render: (role, record) => (
                <Select
                    value={role}
                    style={{ width: 120 }}
                    onChange={(val) => handleRoleChange(record._id, val)}
                    options={[
                        {
                            value: 'user',
                            label: <Tag color="blue">User</Tag>,
                        },
                        {
                            value: 'admin',
                            label: <Tag color="red">Admin</Tag>,
                        },
                    ]}
                />
            ),
            filters: [
                { text: 'User', value: 'user' },
                { text: 'Admin', value: 'admin' },
            ],
            onFilter: (value, record) => record.role === value,
        },
    ]

    return (
        <div>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16,
            }}>
                <h2 style={{ margin: 0, fontWeight: 700 }}>
                    Quản lý Users
                    <span style={{
                        fontSize: 14, fontWeight: 400,
                        color: '#999', marginLeft: 8,
                    }}>
                        ({users.length} tài khoản)
                    </span>
                </h2>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                rowClassName={(record) =>
                    record.role === 'admin' ? 'admin-row' : ''
                }
            />

            <style>{`
        .admin-row { background: #fafafa; }
        .admin-row:hover > td { background: #f0eeff !important; }
      `}</style>
        </div>
    )
}