import { PageContainer } from '@ant-design/pro-layout';
import { InstanceModel } from '@/pages/device/Instance';
import { history, useParams } from 'umi';
import { Badge, Card, Descriptions, Divider, message, Space, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { observer } from '@formily/react';
import Log from '@/pages/device/Instance/Detail/Log';
// import Alarm from '@/pages/device/components/Alarm';
import Info from '@/pages/device/Instance/Detail/Info';
import Functions from '@/pages/device/Instance/Detail/Functions';
import Running from '@/pages/device/Instance/Detail/Running';
import ChildDevice from '@/pages/device/Instance/Detail/ChildDevice';
import Diagnose from '@/pages/device/Instance/Detail/Diagnose';
// import MetadataMap from '@/pages/device/Instance/Detail/MetadataMap';
import { useIntl } from '@@/plugin-locale/localeExports';
import Metadata from '../../components/Metadata';
import type { DeviceMetadata } from '@/pages/device/Product/typings';
import MetadataAction from '@/pages/device/components/Metadata/DataBaseAction';
import { Store } from 'jetlinks-store';
import SystemConst from '@/utils/const';
import { getMenuPathByCode, getMenuPathByParams, MENUS_CODE } from '@/utils/menu';
import useSendWebsocketMessage from '@/hooks/websocket/useSendWebsocketMessage';
import { Ellipsis, PermissionButton } from '@/components';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Service from '@/pages/device/Instance/service';
import useLocation from '@/hooks/route/useLocation';
import { onlyMessage } from '@/utils/util';
import Parsing from './Parsing';
import EdgeMap from './EdgeMap';
import MapChannel from './MapChannel';
import { service as api } from '../../Product/index';

export const deviceStatus = new Map();
deviceStatus.set('online', <Badge status="success" text={'在线'} />);
deviceStatus.set('offline', <Badge status="error" text={'离线'} />);
deviceStatus.set('notActive', <Badge status="processing" text={'禁用'} />);

const InstanceDetail = observer(() => {
  const intl = useIntl();
  // const [tab, setTab] = useState<string>('detail');
  const params = useParams<{ id: string }>();
  const service = new Service('device-instance');
  const { permission } = PermissionButton.usePermission('device/Instance');
  const location = useLocation();

  // const resetMetadata = async () => {
  //   const resp = await service.deleteMetadata(params.id);
  //   if (resp.status === 200) {
  //     message.success('操作成功');
  //     Store.set(SystemConst.REFRESH_DEVICE, true);
  //     setTimeout(() => {
  //       Store.set(SystemConst.REFRESH_METADATA_TABLE, true);
  //     }, 400);
  //   }
  // };
  const baseList = [
    {
      key: 'detail',
      tab: intl.formatMessage({
        id: 'pages.device.instanceDetail.detail',
        defaultMessage: '实例信息',
      }),
      component: <Info />,
    },
    {
      key: 'running',
      tab: intl.formatMessage({
        id: 'pages.device.instanceDetail.running',
        defaultMessage: '运行状态',
      }),
      component: <Running />,
    },
    {
      key: 'metadata',
      tab: (
        <>
          {intl.formatMessage({
            id: 'pages.device.instanceDetail.metadata',
            defaultMessage: '物模型',
          })}
          <Tooltip
            title={
              <>
                属性：
                <br />
                用于描述设备运行时具体信息和状态。
                <br />
                功能：
                <br />
                指设备可供外部调用的指令或方法。
                <br />
                事件：
                <br />
                设备运行时，主动上报给云端的信息。
                <br />
                标签：
                <br />
                统一为设备添加拓展字段，添加后将在设备信息页显示。
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 5 }} />
          </Tooltip>
        </>
      ),
      component: (
        <Card>
          <Metadata
            type="device"
            // tabAction={
            //   <PermissionButton
            //     isPermission={permission.update}
            //     popConfirm={{
            //       title: '确认重置？',
            //       onConfirm: resetMetadata,
            //     }}
            //     tooltip={{
            //       title: '重置后将使用产品的物模型配置',
            //     }}
            //     key={'reload'}
            //   >
            //     重置操作1
            //   </PermissionButton>
            // }
          />
        </Card>
      ),
    },
    {
      // 物模型中有事件信息，且设备状态是在线的情况下才显示此模块
      key: 'functions',
      tab: intl.formatMessage({
        id: 'pages.device.instanceDetail.functions',
        defaultMessage: '设备功能',
      }),
      component: <Functions />,
    },
    {
      key: 'log',
      tab: intl.formatMessage({
        id: 'pages.device.instanceDetail.log',
        defaultMessage: '日志管理',
      }),
      component: <Log />,
    },
    {
      key: 'diagnose',
      tab: '设备诊断',
      component: <Diagnose />,
    },
  ];

  // const pList = [
  //   'websocket-server',
  //   'http-server-gateway',
  //   'udp-device-gateway',
  //   'coap-server-gateway',
  //   'mqtt-client-gateway',
  //   'mqtt-server-gateway',
  //   'tcp-server-gateway',
  // ];
  const [list, setList] =
    useState<{ key: string; tab: string | ReactNode; component: ReactNode }[]>(baseList);

  const getDetail = async (id: string) => {
    const response = await service.detail(id);
    if (response.status === 200) {
      InstanceModel.detail = response?.result;
      const datalist = [...baseList];
      // if (
      //   InstanceModel.detail?.accessProvider &&
      //   pList.includes(InstanceModel.detail?.accessProvider)
      // ) {
      //   if (isNoCommunity) {
      //     datalist.push({
      //       key: 'metadata-map',
      //       tab: '物模型映射',
      //       component: <MetadataMap type="device" />,
      //     });
      //   }
      // }
      const paring = response.result?.features?.find((item: any) => item.id === 'transparentCodec');
      if (paring) {
        datalist.push({
          key: 'parsing',
          tab: intl.formatMessage({
            id: 'pages.device.instanceDetail.parsing',
            defaultMessage: '数据解析',
          }),
          component: <Parsing tag="device" data={InstanceModel.detail} />,
        });
      }
      if (response.result.protocol === 'modbus-tcp') {
        datalist.push({
          key: 'modbus',
          tab: 'Modbus TCP',
          component: <MapChannel data={InstanceModel.detail} type="MODBUS_TCP" />,
        });
      }
      if (response.result.protocol === 'opc-ua') {
        datalist.push({
          key: 'opcua',
          tab: 'OPC UA',
          component: <MapChannel data={InstanceModel.detail} type="OPC_UA" />,
        });
      }
      if (response.result.deviceType?.value === 'gateway') {
        // 产品类型为网关的情况下才显示此模块
        datalist.push({
          key: 'child-device',
          tab: '子设备',
          component: <ChildDevice data={InstanceModel.detail} />,
        });
      }
      if (response.result.accessProvider === 'edge-child-device' && response.result.parentId) {
        datalist.push({
          key: 'edge-map',
          tab: '边缘端映射',
          component: <EdgeMap data={InstanceModel.detail} />,
        });
      }
      setList(datalist);
      // 写入物模型数据
      const metadata: DeviceMetadata = JSON.parse(response.result?.metadata || '{}');
      MetadataAction.insert(metadata);
    }
  };

  const [subscribeTopic] = useSendWebsocketMessage();

  useEffect(() => {
    if (subscribeTopic) {
      subscribeTopic(
        `instance-editor-info-status-${params.id}`,
        `/dashboard/device/status/change/realTime`,
        {
          deviceId: params.id,
        },
        // @ts-ignore
      ).subscribe((data: any) => {
        const payload = data.payload;
        const state = payload.value.type;
        InstanceModel.detail.state = {
          value: state,
          text: '',
        };
      });
    }
  }, []);

  useEffect(() => {
    Store.subscribe(SystemConst.REFRESH_DEVICE, () => {
      MetadataAction.clean();
      setTimeout(() => {
        getDetail(params.id);
      }, 200);
    });
    // return subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // console.log(InstanceModel.current)
    if (!InstanceModel.current && !params.id) {
      history.goBack();
    } else {
      // setTab('detail');
      InstanceModel.active = 'detail';
      getDetail(params?.id || InstanceModel.current?.id || '');
    }
    return () => {
      MetadataAction.clean();
    };
  }, [params.id]);

  useEffect(() => {
    if ((location as any).query?.key) {
      // setTab((location as any).query?.key || 'detail');
      InstanceModel.active = (location as any).query?.key || 'detail';
    }
    const subscription = Store.subscribe(SystemConst.BASE_UPDATE_DATA, (data) => {
      if ((window as any).onTabSaveSuccess) {
        (window as any).onTabSaveSuccess(data);
        setTimeout(() => window.close(), 300);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const { state } = location;
    if (state && state?.tab) {
      // setTab(state?.tab);
      InstanceModel.active = state?.tab;
    }
  }, [location]);

  return (
    <PageContainer
      className={'page-title-show'}
      onBack={history.goBack}
      onTabChange={(e) => {
        InstanceModel.active = e;
      }}
      tabList={list}
      tabActiveKey={InstanceModel.active}
      content={
        <Descriptions size="small" column={4}>
          <Descriptions.Item label={'ID'}>
            <Ellipsis
              title={InstanceModel.detail?.id}
              tooltip={{ placement: 'topLeft' }}
              style={{ maxWidth: 250 }}
              limitWidth={250}
            />
            {/*<Tooltip placement="topLeft" title={InstanceModel.detail?.id}>*/}
            {/*  <div className="ellipsis" style={{ maxWidth: 250 }}>*/}
            {/*    {InstanceModel.detail?.id}*/}
            {/*  </div>*/}
            {/*</Tooltip>*/}
          </Descriptions.Item>
          <Descriptions.Item label={'所属产品'}>
            <PermissionButton
              type={'link'}
              size={'small'}
              tooltip={{
                title: InstanceModel.detail?.productName,
                placement: 'topLeft',
              }}
              isPermission={!!getMenuPathByCode(MENUS_CODE['device/Product'])}
              onClick={async () => {
                if (InstanceModel.detail?.productId) {
                  //为了判断资产权限
                  const res = await api.detail(InstanceModel.detail?.productId);
                  if (res.status === 200) {
                    const url = getMenuPathByParams(
                      MENUS_CODE['device/Product/Detail'],
                      InstanceModel.detail?.productId,
                    );
                    if (url) {
                      history.replace(url);
                    }
                  }
                }
              }}
            >
              <Ellipsis
                title={InstanceModel.detail?.productName}
                tooltip={{ placement: 'topLeft' }}
                style={{ maxWidth: 250 }}
                limitWidth={250}
              />
              {/*<div className="ellipsis" style={{ width: 250 }}>*/}
              {/*  {InstanceModel.detail?.productName}*/}
              {/*</div>*/}
            </PermissionButton>
          </Descriptions.Item>
        </Descriptions>
      }
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/*<Tooltip placement="topLeft" title={InstanceModel.detail?.name}>*/}
          {/*  <div className="ellipsis" style={{ maxWidth: 250 }}>*/}
          {/*    {InstanceModel.detail?.name}*/}
          {/*  </div>*/}
          {/*</Tooltip>*/}
          <Ellipsis
            title={InstanceModel.detail?.name}
            tooltip={{ placement: 'topLeft' }}
            style={{ maxWidth: 250 }}
            limitWidth={250}
          />
          <Divider type="vertical" />
          <Space>
            {deviceStatus.get(InstanceModel.detail?.state?.value)}
            {InstanceModel.detail?.state?.value === 'notActive' && (
              <PermissionButton
                type={'link'}
                key={'state'}
                popConfirm={{
                  title: '确认启用设备',
                  onConfirm: async () => {
                    const resp = await service.deployDevice(params.id);
                    if (resp.status === 200) {
                      onlyMessage(
                        intl.formatMessage({
                          id: 'pages.data.option.success',
                          defaultMessage: '操作成功!',
                        }),
                      );
                      getDetail(params.id);
                    }
                  },
                }}
                isPermission={permission.action}
                tooltip={{
                  title: '启用设备',
                }}
              >
                启用设备
              </PermissionButton>
            )}
            {InstanceModel.detail?.state?.value === 'online' && (
              <PermissionButton
                type={'link'}
                key={'state'}
                popConfirm={{
                  title: '确认断开连接',
                  onConfirm: async () => {
                    const resp = await service.disconnectDevice(params.id);
                    if (resp.status === 200) {
                      onlyMessage(
                        intl.formatMessage({
                          id: 'pages.data.option.success',
                          defaultMessage: '操作成功!',
                        }),
                      );
                      getDetail(params.id);
                    }
                  },
                }}
                isPermission={permission.action}
                tooltip={{
                  title: '断开连接',
                }}
              >
                断开连接
              </PermissionButton>
            )}
            {InstanceModel.detail?.accessProvider === 'child-device' &&
            InstanceModel.detail?.state?.value === 'offline' ? (
              <div>
                <Tooltip
                  placement="bottom"
                  title={
                    InstanceModel.detail?.features?.find((item) => item.id === 'selfManageState')
                      ? '该设备的在线状态与父设备(网关设备)保持一致'
                      : '该设备在线状态由设备自身运行状态决定，不继承父设备（网关设备）的在线状态'
                  }
                >
                  <QuestionCircleOutlined style={{ fontSize: 14, marginRight: 5 }} />
                </Tooltip>
              </div>
            ) : (
              ''
            )}
          </Space>
        </div>
      }
      extra={[
        // <Button key="2">
        //   {intl.formatMessage({
        //     id: 'pages.device.productDetail.disable',
        //     defaultMessage: '停用',
        //   })}
        // </Button>,
        // <Button key="1" type="primary">
        //   {intl.formatMessage({
        //     id: 'pages.device.productDetail.setting',
        //     defaultMessage: '应用配置',
        //   })}
        // </Button>,
        <img
          style={{ marginRight: 20, cursor: 'pointer' }}
          src={require('/public/images/device/button.png')}
          onClick={() => {
            getDetail(params.id);
            service.getConfigMetadata(params.id).then((config) => {
              if (config.status === 200) {
                InstanceModel.config = config?.result || [];
                message.success('操作成功！');
              }
            });
          }}
        />,
        // <SyncOutlined
        //   onClick={() => {
        //     getDetail(params.id);
        //     service.getConfigMetadata(params.id).then((config) => {
        //       if (config.status === 200) {
        //         InstanceModel.config = config?.result || [];
        //         message.success('操作成功！');
        //       }
        //     });
        //   }}
        //   style={{ fontSize: 20, marginRight: 20 }}
        //   key="1"
        // />,
      ]}
    >
      {list.find((k) => k.key === InstanceModel.active)?.component}
    </PageContainer>
  );
});
export default InstanceDetail;
