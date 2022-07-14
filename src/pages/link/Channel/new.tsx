import { Card, Input } from 'antd';
import { useDomFullHeight } from '@/hooks';
import './index.less'
import SearchComponent from '@/components/SearchComponent';
import ProTable, { ActionType, ProColumns } from '@jetlinks/pro-table';
import PermissionButton from '@/components/PermissionButton';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useIntl } from 'umi';
import ChannelCard from './channelCard'

const NewModbus = () => {
    const { minHeight } = useDomFullHeight(`.modbus`);
    const intl = useIntl();
    const actionRef = useRef<ActionType>();
    const { permission } = PermissionButton.usePermission('link/Channel/Modbus');
    const [param, setParam] = useState({});
    const [activeKey, setActiveKey] = useState<any>('')
    const data = [
        {
            id: 1,
            status: 'connect'
        },
        {
            id: 2,
            status: 'disconnect'
        },
    ]

    const columns: ProColumns<any>[] = [
        {
            title: '名称',
            dataIndex: 'name',
            ellipsis: true,
            fixed: 'left',
        },
        {
            title: '功能码',
            dataIndex: 'host',
        },
        {
            title: '从站ID',
            dataIndex: 'port',
            search: false,
            valueType: 'digit',
        },
        {
            title: '寄存器数量',
            dataIndex: 'port',
            search: false,
            valueType: 'digit',
        },
        {
            title: '地址',
            dataIndex: 'port',
            search: false,
            valueType: 'digit',
        },
        {
            title: '当前数据',
            dataIndex: 'port',
            search: false,
            valueType: 'digit',
        },
        {
            title: '采集状态',
            dataIndex: 'port',
            search: false,
            valueType: 'digit',
        },
        {
            title: '状态',
            dataIndex: 'port',
            search: false,
            valueType: 'digit',
        },
        // {
        //   title: '状态',
        //   dataIndex: 'state',
        //   renderText: (state) => (
        //     <Badge text={state?.text} status={state?.value === 'disabled' ? 'error' : 'success'} />
        //   ),
        //   valueType: 'select',
        //   valueEnum: {
        //     disabled: {
        //       text: intl.formatMessage({
        //         id: 'pages.data.option.disabled',
        //         defaultMessage: '禁用',
        //       }),
        //       status: 'disabled',
        //     },
        //     enabled: {
        //       text: '正常',
        //       status: 'enabled',
        //     },
        //   },
        //   filterMultiple: false,
        // },
        // {
        //   title: '操作',
        //   valueType: 'option',
        //   align: 'center',
        //   width: 200,
        //   fixed: 'right',
        //   render: (text, record) => [
        //     <PermissionButton
        //       isPermission={permission.update}
        //       key="edit"
        //       onClick={() => {
        //         setVisible(true);
        //         setCurrent(record);
        //       }}
        //       type={'link'}
        //       style={{ padding: 0 }}
        //       tooltip={{
        //         title: intl.formatMessage({
        //           id: 'pages.data.option.edit',
        //           defaultMessage: '编辑',
        //         }),
        //       }}
        //     >
        //       <EditOutlined />
        //     </PermissionButton>,
        //     <PermissionButton
        //       type="link"
        //       key={'action'}
        //       style={{ padding: 0 }}
        //       popConfirm={{
        //         title: intl.formatMessage({
        //           id: `pages.data.option.${
        //             record.state.value !== 'disabled' ? 'disabled' : 'enabled'
        //           }.tips`,
        //           defaultMessage: '确认禁用？',
        //         }),
        //         onConfirm: async () => {
        //           if (record.state.value === 'disabled') {
        //             await service.edit({
        //               ...record,
        //               state: 'enabled',
        //             });
        //           } else {
        //             await service.edit({
        //               ...record,
        //               state: 'disabled',
        //             });
        //           }
        //           onlyMessage(
        //             intl.formatMessage({
        //               id: 'pages.data.option.success',
        //               defaultMessage: '操作成功!',
        //             }),
        //           );
        //           actionRef.current?.reload();
        //         },
        //       }}
        //       isPermission={permission.action}
        //       tooltip={{
        //         title: intl.formatMessage({
        //           id: `pages.data.option.${record.state.value !== 'disabled' ? 'disabled' : 'enabled'}`,
        //           defaultMessage: record.state.value !== 'disabled' ? '禁用' : '启用',
        //         }),
        //       }}
        //     >
        //       {record.state.value !== 'disabled' ? <StopOutlined /> : <PlayCircleOutlined />}
        //     </PermissionButton>,
        //     <PermissionButton
        //       isPermission={permission.view}
        //       style={{ padding: 0 }}
        //       key="link"
        //       type="link"
        //       tooltip={{
        //         title: '数据点绑定',
        //       }}
        //       onClick={() => {
        //         history.push(`${getMenuPathByCode('link/Channel/Modbus/Access')}?id=${record.id}`);
        //       }}
        //     >
        //       <ControlOutlined />
        //     </PermissionButton>,
        //     <PermissionButton
        //       isPermission={permission.delete}
        //       style={{ padding: 0 }}
        //       disabled={record.state.value === 'enabled'}
        //       popConfirm={{
        //         title: '确认删除',
        //         disabled: record.state.value === 'enabled',
        //         onConfirm: async () => {
        //           const resp: any = await service.remove(record.id);
        //           if (resp.status === 200) {
        //             onlyMessage(
        //               intl.formatMessage({
        //                 id: 'pages.data.option.success',
        //                 defaultMessage: '操作成功!',
        //               }),
        //             );
        //             actionRef.current?.reload();
        //           }
        //         },
        //       }}
        //       key="delete"
        //       type="link"
        //     >
        //       <DeleteOutlined />
        //     </PermissionButton>,
        //   ],
        // },
    ];
    return (
        <Card className='modbus' style={{ minHeight }}>
            <div className='item'>
                <div className='item-left'>
                    <div style={{ width: 220 }}>
                        <Input.Search
                            placeholder="请输入名称"
                            allowClear
                            onSearch={(value) => {
                                console.log(value)
                            }}
                        />
                        <PermissionButton
                            onClick={() => {
                                // setDeviceVisiable(true);
                            }}
                            isPermission={permission.add}
                            key="add"
                            icon={<PlusOutlined />}
                            type="default"
                            style={{ width: '100%', marginTop: 16 }}
                        >
                            新增
                        </PermissionButton>
                        <div className='item-left-list'>
                            {
                                data.map(item => <ChannelCard
                                    active={activeKey === item.id}
                                    data={item}
                                    onClick={() => {
                                        setActiveKey(item.id)
                                        // console.log(item.id)
                                    }}
                                    actions={
                                        <>
                                            <PermissionButton
                                                isPermission={permission.update}
                                                key="edit"
                                                onClick={() => {
                                                    // setVisible(true);
                                                    // setCurrent(record);
                                                }}
                                                type={'link'}
                                                style={{ padding: 0 }}
                                                tooltip={{
                                                    title: intl.formatMessage({
                                                        id: 'pages.data.option.edit',
                                                        defaultMessage: '编辑',
                                                    }),
                                                }}
                                            >
                                                <EditOutlined />编辑
                                            </PermissionButton>
                                            <PermissionButton
                                                isPermission={permission.update}
                                                key="enbale"
                                                onClick={() => {
                                                    // setVisible(true);
                                                    // setCurrent(record);
                                                }}
                                                type={'link'}
                                                style={{ padding: 0 }}
                                            >
                                                <EditOutlined />禁用
                                            </PermissionButton>
                                            <PermissionButton
                                                isPermission={permission.update}
                                                key="delete"
                                                onClick={() => {
                                                    // setVisible(true);
                                                    // setCurrent(record);
                                                }}
                                                type={'link'}
                                                style={{ padding: 0 }}
                                                tooltip={{
                                                    title: intl.formatMessage({
                                                        id: 'pages.data.option.edit',
                                                        defaultMessage: '编辑',
                                                    }),
                                                }}
                                            >
                                                <EditOutlined />
                                            </PermissionButton>
                                        </>} />)
                            }

                        </div>
                    </div>
                </div>
                <div className='item-right'>
                    <SearchComponent<any>
                        field={columns}
                        target="modbus"
                        onSearch={(data) => {
                            actionRef.current?.reset?.();
                            setParam(data);
                        }}
                    />
                    <ProTable
                        actionRef={actionRef}
                        params={param}
                        columns={columns}
                        rowKey="id"
                        // scroll={{ x: 1366 }}
                        search={false}
                        headerTitle={
                            <PermissionButton
                                onClick={() => {
                                    // setMode('add');
                                    // setVisible(true);
                                    // setCurrent({});
                                }}
                                isPermission={permission.add}
                                key="add"
                                icon={<PlusOutlined />}
                                type="primary"
                            >
                                {intl.formatMessage({
                                    id: 'pages.data.option.add',
                                    defaultMessage: '新增',
                                })}
                            </PermissionButton>
                        }
                    // request={async (params) =>
                    //     service.query({ ...params, sorts: [{ name: 'createTime', order: 'desc' }] })
                    // }
                    />
                </div>
            </div>
        </Card >
    )
}
export default NewModbus;