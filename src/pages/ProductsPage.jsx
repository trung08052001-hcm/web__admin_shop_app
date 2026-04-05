import React, { useEffect, useState } from 'react'
import {
    Table, Button, Modal, Form, Input,
    InputNumber, Select, message, Popconfirm, Image, Space, Tag,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
    getProducts, createProduct,
    updateProduct, deleteProduct, getCategories,
} from '../api/productApi'

export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [form] = Form.useForm()

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [p, c] = await Promise.all([
                getProducts({ limit: 100 }),
                getCategories(),
            ])
            setProducts(p.data.products)
            setCategories(c.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [])

    const openCreate = () => {
        setEditingProduct(null)
        form.resetFields()
        setModalOpen(true)
    }

    const openEdit = (product) => {
        setEditingProduct(product)
        form.setFieldsValue(product)
        setModalOpen(true)
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            if (editingProduct) {
                await updateProduct(editingProduct._id, values)
                message.success('Cập nhật thành công!')
            } else {
                await createProduct(values)
                message.success('Thêm sản phẩm thành công!')
            }
            setModalOpen(false)
            fetchAll()
        } catch (err) {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra!')
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id)
            message.success('Đã xoá sản phẩm!')
            fetchAll()
        } catch {
            message.error('Xoá thất bại!')
        }
    }

    const columns = [
        {
            title: 'Ảnh', dataIndex: 'image',
            render: (url) => (
                <Image src={url} width={48} height={48}
                    style={{ objectFit: 'cover', borderRadius: 8 }} />
            ),
        },
        {
            title: 'Tên sản phẩm', dataIndex: 'name',
            render: (n) => <span style={{ fontWeight: 500 }}>{n}</span>,
        },
        {
            title: 'Danh mục', dataIndex: 'category',
            render: (c) => <Tag color="purple">{c}</Tag>
        },
        {
            title: 'Giá', dataIndex: 'price',
            render: (p) => p.toLocaleString('vi-VN') + 'đ',
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Tồn kho', dataIndex: 'stock',
            render: (s) => <Tag color={s > 0 ? 'green' : 'red'}>{s}</Tag>
        },
        {
            title: 'Thao tác',
            render: (_, r) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small"
                        onClick={() => openEdit(r)}>Sửa</Button>
                    <Popconfirm title="Xoá sản phẩm này?"
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
                <h2 style={{ margin: 0, fontWeight: 700 }}>Quản lý sản phẩm</h2>
                <Button type="primary" icon={<PlusOutlined />}
                    onClick={openCreate}
                    style={{ background: '#6C63FF' }}>
                    Thêm sản phẩm
                </Button>
            </div>

            <Table columns={columns} dataSource={products}
                rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />

            <Modal
                title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                open={modalOpen} onOk={handleSave}
                onCancel={() => setModalOpen(false)}
                okText="Lưu" cancelText="Huỷ" width={560}>
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="name" label="Tên sản phẩm"
                        rules={[{ required: true, message: 'Nhập tên' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả"
                        rules={[{ required: true, message: 'Nhập mô tả' }]}>
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="price" label="Giá (VND)"
                        rules={[{ required: true, message: 'Nhập giá' }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="category" label="Danh mục"
                        rules={[{ required: true, message: 'Chọn danh mục' }]}>
                        <Select options={categories.map((c) => ({ label: c, value: c }))} />
                    </Form.Item>
                    <Form.Item name="image" label="Link ảnh"
                        rules={[{ required: true, message: 'Nhập link ảnh' }]}>
                        <Input placeholder="https://..." />
                    </Form.Item>
                    <Form.Item name="stock" label="Tồn kho"
                        rules={[{ required: true, message: 'Nhập số lượng' }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}