import React from 'react'
import { Layout, Menu, Button } from 'antd'
import {
    DashboardOutlined,
    ShoppingOutlined,
    OrderedListOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { TagOutlined } from '@ant-design/icons'
const { Header, Sider, Content } = Layout

export default function AppLayout() {
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        navigate('/login')
    }

    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/products', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
        { key: '/orders', icon: <OrderedListOutlined />, label: 'Đơn hàng' },
        { key: '/users', icon: <UserOutlined />, label: 'Users' },
        { key: '/coupons', icon: <TagOutlined />, label: 'Coupon' },
    ]

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={220} theme="light"
                style={{ borderRight: '1px solid #f0f0f0' }}>
                <div style={{
                    height: 64, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 20, fontWeight: 700,
                    color: '#6C63FF', borderBottom: '1px solid #f0f0f0',
                }}>
                    Shop Admin
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ border: 'none', marginTop: 8 }}
                />
            </Sider>
            <Layout>
                <Header style={{
                    background: '#fff', padding: '0 24px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'flex-end',
                    borderBottom: '1px solid #f0f0f0',
                }}>
                    <Button icon={<LogoutOutlined />}
                        onClick={handleLogout} type="text" danger>
                        Đăng xuất
                    </Button>
                </Header>
                <Content style={{ padding: 24, background: '#f5f5f5' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}