import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'

export default function LoginPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleLogin = async (values) => {
        setLoading(true)
        try {
            const res = await login(values.email, values.password)
            const { user, token } = res.data
            if (user.role !== 'admin') {
                message.error('Tài khoản không có quyền admin!')
                return
            }
            localStorage.setItem('admin_token', token)
            message.success('Đăng nhập thành công!')
            navigate('/')
        } catch (err) {
            message.error(err.response?.data?.message || 'Đăng nhập thất bại!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#f5f5f5',
        }}>
            <Card style={{ width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#6C63FF' }}>
                        Shop Admin
                    </div>
                    <div style={{ color: '#999', marginTop: 4 }}>
                        Đăng nhập để quản lý
                    </div>
                </div>
                <Form layout="vertical" onFinish={handleLogin}>
                    <Form.Item label="Email" name="email"
                        rules={[{ required: true, message: 'Nhập email' }]}>
                        <Input size="large" placeholder="admin@gmail.com" />
                    </Form.Item>
                    <Form.Item label="Mật khẩu" name="password"
                        rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
                        <Input.Password size="large" placeholder="••••••" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" size="large"
                        loading={loading} block
                        style={{ background: '#6C63FF', marginTop: 8 }}>
                        Đăng nhập
                    </Button>
                </Form>
            </Card>
        </div>
    )
}