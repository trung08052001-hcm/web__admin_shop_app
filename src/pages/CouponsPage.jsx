import React, { useEffect, useState } from 'react'
import {
    Table, Button, Modal, Form, Input, InputNumber,
    Select, Switch, message, Popconfirm, Tag, Space, DatePicker,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/couponApi'
import dayjs from 'dayjs'

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form] = Form.useForm()

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const res = await getAllCoupons()
            setCoupons(res.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCoupons() }, [])

    const openCreate = () => {
        setEditing(null)
        form.resetFields()
        setModalOpen(true)
    }

    const openEdit = (coupon) => {
        setEditing(coupon)
        form.setFieldsValue({
            ...coupon,
            expiresAt: dayjs(coupon.expiresAt),
        })
        setModalOpen(true)
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            const data = {
                ...values,
                expiresAt: values.expiresAt.toISOString(),
                code: values.code.toUpperCase(),
            }
            if (editing) {
                await updateCoupon(editing._id, data)
                message.success('Cập nhật thành công!')
            } else {
                await createCoupon(data)
                message.success('Tạo coupon thành công!')
            }
            setModalOpen(false)
            fetchCoupons()
        } catch (err) {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra!')
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteCoupon(id)
            message.success('Đã xoá coupon!')
            fetchCoupons()
        } catch {
            message.error('Xoá thất bại!')
        }
    }

    const columns = [
        {
            title: 'Mã code',
            dataIndex: 'code',
            render: (code) => (
                <Tag color="purple" style={{ fontSize: 13, padding: '4px 10px' }}>
                    {code}
                </Tag>
            ),
        },
        {
            title: 'Loại giảm',
            dataIndex: 'discountType',
            render: (type, record) => (
                <span>
                    {type === 'percent'
                        ? `${record.discountValue}%`
                        : `${record.discountValue.toLocaleString('vi-VN')}đ`}
                    {record.maxDiscount && type === 'percent' && (
                        <span style={{ color: '#999', fontSize: 11 }}>
                            {' '}(tối đa {record.maxDiscount.toLocaleString('vi-VN')}đ)
                        </span>
                    )}
                </span>
            ),
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'minOrderValue',
            render: (v) => v.toLocaleString('vi-VN') + 'đ',
        },
        {
            title: 'Đã dùng',
            render: (_, r) => `${r.usedCount}/${r.usageLimit}`,
        },
        {
            title: 'Hết hạn',
            dataIndex: 'expiresAt',
            render: (d) => new Date(d).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            render: (active) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Đang hoạt động' : 'Tắt'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            render: (_, r) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small"
                        onClick={() => openEdit(r)}>Sửa</Button>
                    <Popconfirm title="Xoá coupon này?"
                        onConfirm={() => handleDelete(r._id)}
                        okText="Xoá" cancelText="Huỷ">
                        <Button icon={<DeleteOutlined />} size="small" danger>Xoá</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16,
            }}>
                <h2 style={{ margin: 0, fontWeight: 700 }}>Quản lý Coupon</h2>
                <Button type="primary" icon={<PlusOutlined />}
                    onClick={openCreate}
                    style={{ background: '#6C63FF' }}>
                    Tạo coupon
                </Button>
            </div>

            <Table columns={columns} dataSource={coupons}
                rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />

            <Modal
                title={editing ? 'Sửa coupon' : 'Tạo coupon mới'}
                open={modalOpen} onOk={handleSave}
                onCancel={() => setModalOpen(false)}
                okText="Lưu" cancelText="Huỷ" width={520}>
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="code" label="Mã code"
                        rules={[{ required: true, message: 'Nhập mã code' }]}>
                        <Input placeholder="VD: WELCOME10" style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                    <Form.Item name="discountType" label="Loại giảm giá"
                        initialValue="percent"
                        rules={[{ required: true }]}>
                        <Select options={[
                            { label: 'Phần trăm (%)', value: 'percent' },
                            { label: 'Số tiền cố định (đ)', value: 'fixed' },
                        ]} />
                    </Form.Item>
                    <Form.Item name="discountValue" label="Giá trị giảm"
                        rules={[{ required: true, message: 'Nhập giá trị' }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="maxDiscount" label="Giảm tối đa (đ) — chỉ áp dụng cho %">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="minOrderValue" label="Đơn hàng tối thiểu (đ)"
                        initialValue={0}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="usageLimit" label="Giới hạn lượt dùng"
                        initialValue={100}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="expiresAt" label="Ngày hết hạn"
                        rules={[{ required: true, message: 'Chọn ngày hết hạn' }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="isActive" label="Kích hoạt"
                        valuePropName="checked" initialValue={true}>
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}