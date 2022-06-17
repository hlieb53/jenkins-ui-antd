import PermissionButton from '@/components/PermissionButton';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@jetlinks/pro-table';
import { Badge, Card, Empty, Input, Popconfirm, Tabs, Tooltip } from 'antd';
import { useIntl, useLocation } from 'umi';
import { useEffect, useRef, useState } from 'react';
import {
  DeleteOutlined,
  DisconnectOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons';
import BindDevice from '@/pages/link/Channel/Modbus/Access/bindDevice';
import { service } from '@/pages/link/Channel/Modbus';
import encodeQuery from '@/utils/encodeQuery';
import styles from './index.less';
import AddPoint from './addPoint';
import useSendWebsocketMessage from '@/hooks/websocket/useSendWebsocketMessage';
import { map } from 'rxjs/operators';
import { useDomFullHeight } from '@/hooks';
import { onlyMessage } from '@/utils/util';

const Access = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const location = useLocation<string>();
  const [param, setParam] = useState<any>({});
  const [opcUaId, setOpcUaId] = useState<any>('');
  const { permission } = PermissionButton.usePermission('link/Channel/Modbus');
  const [deviceVisiable, setDeviceVisiable] = useState<boolean>(false);
  const [pointVisiable, setPointVisiable] = useState<boolean>(false);
  const [bindList, setBindList] = useState<any>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [current, setCurrent] = useState<any>({});
  const [data, setData] = useState<any>([]);
  const [subscribeTopic] = useSendWebsocketMessage();
  const [propertyValue, setPropertyValue] = useState<any>({});
  const wsRef = useRef<any>();
  const [filterList, setFilterList] = useState([]);
  const { minHeight } = useDomFullHeight(`.modbusAccess`, 26);

  const columns: ProColumns<any>[] = [
    {
      title: '属性ID',
      dataIndex: 'metadataId',
      ellipsis: true,
    },
    {
      title: '功能码',
      render: (record: any) => <>{record.function?.text}</>,
    },
    {
      title: '读取起始位置',
      render: (record: any) => <>{record.codecConfig?.readIndex}</>,
    },
    {
      title: '读取长度',
      render: (record: any) => <>{record.codecConfig?.readLength}</>,
    },
    {
      title: '值',
      width: 100,
      render: (record: any) => <>{propertyValue[record?.metadataId] || '-'}</>,
    },
    {
      title: '状态',
      dataIndex: 'state',
      renderText: (state) => (
        <Badge text={state?.text} status={state?.value === 'disabled' ? 'error' : 'success'} />
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      align: 'center',
      width: 200,
      render: (text, record) => [
        <PermissionButton
          isPermission={permission.update}
          key="edit"
          onClick={() => {
            setPointVisiable(true);
            setCurrent(record);
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
        </PermissionButton>,
        <PermissionButton
          type="link"
          key={'action'}
          style={{ padding: 0 }}
          popConfirm={{
            title: intl.formatMessage({
              id: `pages.data.option.${
                record.state?.value !== 'disabled' ? 'disabled' : 'enabled'
              }.tips`,
              defaultMessage: '确认禁用？',
            }),
            onConfirm: async () => {
              const item = {
                ...record,
                state: record.state?.value === 'enabled' ? 'disabled' : 'enabled',
              };
              await service.saveMetadataConfig(opcUaId, deviceId, item);
              onlyMessage(
                intl.formatMessage({
                  id: 'pages.data.option.success',
                  defaultMessage: '操作成功!',
                }),
              );
              actionRef.current?.reload();
            },
          }}
          isPermission={permission.action}
          tooltip={{
            title: intl.formatMessage({
              id: `pages.data.option.${record.state.value !== 'disabled' ? 'disabled' : 'enabled'}`,
              defaultMessage: record.state?.value !== 'disabled' ? '禁用' : '启用',
            }),
          }}
        >
          {record.state?.value !== 'disabled' ? <StopOutlined /> : <PlayCircleOutlined />}
        </PermissionButton>,
        <PermissionButton
          isPermission={permission.delete}
          style={{ padding: 0 }}
          disabled={record.state?.value === 'enabled'}
          tooltip={{
            title:
              record.state?.value === 'disabled'
                ? intl.formatMessage({
                    id: 'pages.data.option.remove',
                    defaultMessage: '删除',
                  })
                : '请先禁用该点位，再删除。',
          }}
          popConfirm={{
            title: '确认删除',
            disabled: record.state.value === 'enabled',
            onConfirm: async () => {
              const resp: any = await service.removeMetadataConfig(record.id);
              if (resp.status === 200) {
                onlyMessage(
                  intl.formatMessage({
                    id: 'pages.data.option.success',
                    defaultMessage: '操作成功!',
                  }),
                );
                actionRef.current?.reload();
              }
            },
          }}
          key="delete"
          type="link"
        >
          <DeleteOutlined />
        </PermissionButton>,
      ],
    },
  ];

  const getBindList = (masterId: any) => {
    service
      .bindDevice(
        encodeQuery({
          terms: {
            'id$modbus-master': masterId,
          },
        }),
      )
      .then((res: any) => {
        if (res.status === 200) {
          if (res.result && res.result !== 0) {
            setDeviceId(res.result[0]?.id);
            setProductId(res.result[0]?.productId);
            setBindList(res.result);
            setFilterList(res.result);
            setParam({
              deviceId: res.result[0]?.id,
              // terms: [{ column: 'deviceId', value: res.result[0]?.deviceId }],
            });
          }
        }
      });
  };

  useEffect(() => {
    const item = new URLSearchParams(location.search);
    const id = item.get('id');
    if (id) {
      setOpcUaId(id);
      getBindList(id);
    }
  }, []);

  useEffect(() => {
    if (productId && deviceId) {
      const point = data.map((item: any) => item.metadataId);
      const id = `instance-info-property-${deviceId}-${productId}-${point.join('-')}`;
      const topic = `/dashboard/device/${productId}/properties/realTime`;
      wsRef.current = subscribeTopic?.(id, topic, {
        deviceId: deviceId,
        properties: data.map((item: any) => item.metadataId),
        history: 1,
      })
        ?.pipe(map((res) => res.payload))
        .subscribe((payload: any) => {
          const { value } = payload;
          propertyValue[value.property] = value.formatValue;
          setPropertyValue({ ...propertyValue });
          // console.log(propertyValue)
        });
    }
    return () => wsRef.current && wsRef.current?.unsubscribe();
  }, [data]);

  // useEffect(() => {
  //   console.log(deviceId);
  // }, [deviceId]);

  return (
    <PageContainer>
      <Card className={styles.list}>
        <div className="modbusAccess" style={{ display: 'flex', minHeight }}>
          <div>
            <div style={{ width: '250px', marginTop: 15 }}>
              <Input.Search
                placeholder="请输入绑定设备名称"
                allowClear
                onSearch={(value) => {
                  if (value) {
                    const items = bindList.filter((item: any) => item.name.match(value));
                    setFilterList(items);
                    setFilterList(items);
                    if (items.length === 0) {
                      setParam({
                        deviceId: undefined,
                      });
                    } else {
                      setParam({
                        deviceId: items[0]?.id,
                        // terms: [{ column: 'deviceId', value: items[0]?.deviceId }],
                      });
                      setDeviceId(items[0]?.id);
                    }
                  } else {
                    setFilterList(bindList);
                    if (deviceId) {
                      setParam({
                        deviceId: deviceId,
                      });
                    } else {
                      setParam({
                        deviceId: undefined,
                      });
                    }
                  }
                }}
              />
              <PermissionButton
                onClick={() => {
                  setDeviceVisiable(true);
                }}
                isPermission={permission.add}
                key="add"
                icon={<PlusOutlined />}
                type="dashed"
                style={{ width: '100%', margin: '16px 0 18px 0' }}
              >
                绑定设备
              </PermissionButton>
            </div>
            {filterList.length > 0 ? (
              <Tabs
                style={{ height: 600 }}
                tabPosition={'left'}
                activeKey={deviceId}
                onChange={(e) => {
                  setDeviceId(e);
                  const items = bindList.find((item: any) => item.id === e);
                  setProductId(items?.productId);
                  setParam({
                    deviceId: e,
                  });
                }}
              >
                {filterList.map((item: any) => (
                  <Tabs.TabPane
                    key={item.id}
                    tab={
                      <div className={styles.left}>
                        <Tooltip title={item.name}>
                          <div className={styles.text}>{item.name}</div>
                        </Tooltip>
                        <Popconfirm
                          title="确认解绑该设备嘛？"
                          onConfirm={() => {
                            service.unbind([item.id], opcUaId).then((res: any) => {
                              if (res.status === 200) {
                                onlyMessage('解绑成功');
                                getBindList(opcUaId);
                              }
                            });
                          }}
                          okText="是"
                          cancelText="否"
                        >
                          <DisconnectOutlined className={styles.icon} />
                        </Popconfirm>
                      </div>
                    }
                  ></Tabs.TabPane>
                ))}
              </Tabs>
            ) : (
              <Empty description={<>暂无绑定设备</>} />
            )}
          </div>
          <div style={{ width: '100%' }}>
            <ProTable
              actionRef={actionRef}
              params={param}
              columns={columns}
              rowKey="id"
              search={false}
              headerTitle={
                <>
                  <PermissionButton
                    onClick={() => {
                      setPointVisiable(true);
                      setCurrent({});
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
                  <div style={{ marginLeft: 10 }}>
                    <Input.Search
                      placeholder="请输入属性ID"
                      allowClear
                      onSearch={(value) => {
                        console.log(value);
                        if (value) {
                          setParam({
                            terms: [
                              { column: 'metadataId', value: `%${value}%`, termType: 'like' },
                            ],
                          });
                        } else {
                          setParam({
                            deviceId: deviceId,
                            // terms: [{ column: 'deviceId', value: deviceId }],
                          });
                        }
                      }}
                    />
                  </div>
                </>
              }
              request={async (params) => {
                if (!params.deviceId) {
                  return {
                    code: 200,
                    result: {
                      data: [],
                      pageIndex: 0,
                      pageSize: 0,
                      total: 0,
                    },
                    status: 200,
                  };
                }
                const res = await service.queryMetadataConfig(opcUaId, params.deviceId, {
                  ...params.terms,
                  sorts: [{ name: 'createTime', order: 'desc' }],
                });
                setData(res.result.data);
                return {
                  code: res.message,
                  result: {
                    data: res.result.data,
                    pageIndex: res.result.pageIndex,
                    pageSize: res.result.pageSize,
                    total: res.result.total,
                  },
                  status: res.status,
                };
              }}
            />
          </div>
        </div>
      </Card>
      {deviceVisiable && (
        <BindDevice
          id={opcUaId}
          close={() => {
            setDeviceVisiable(false);
            getBindList(opcUaId);
          }}
        />
      )}
      {pointVisiable && (
        <AddPoint
          deviceId={deviceId}
          opcUaId={opcUaId}
          data={current}
          close={() => {
            setPointVisiable(false);
            actionRef.current?.reload();
          }}
        />
      )}
    </PageContainer>
  );
};
export default Access;
