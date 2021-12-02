import { PageContainer } from '@ant-design/pro-layout';
import { InstanceModel, service } from '@/pages/device/Instance';
import { history, useParams } from 'umi';
import { Badge, Button, Divider } from 'antd';
import { useEffect, useState } from 'react';
import { statusMap } from '@/pages/device/Product';
import { observer } from '@formily/react';
import Config from '@/pages/device/Instance/Detail/Config';
import Metadata from '@/pages/device/Instance/Detail/Metadata';
import Log from '@/pages/device/Instance/Detail/Log';
import Alarm from '@/pages/device/Instance/Detail/Alarm';
import Info from '@/pages/device/Instance/Detail/Info';
import Functions from '@/pages/device/Instance/Detail/Functions';
import Running from '@/pages/device/Instance/Detail/Running';
import { useIntl } from '@@/plugin-locale/localeExports';

export const deviceStatus = new Map();
deviceStatus.set('online', <Badge status="success" text={'在线'} />);
deviceStatus.set('offline', <Badge status="error" text={'离线'} />);
deviceStatus.set('notActive', <Badge status="processing" text={'未启用'} />);
const InstanceDetail = observer(() => {
  const intl = useIntl();
  const [tab, setTab] = useState<string>('detail');
  const getDetail = (id: string) => {
    service.detail(id).then((response) => {
      InstanceModel.detail = response?.result;
    });
  };
  const params = useParams<{ id: string }>();
  useEffect(() => {
    if (!InstanceModel.current && !params.id) {
      history.goBack();
    } else {
      getDetail(InstanceModel.current?.id || params.id);
    }
  }, []);

  const list = [
    {
      key: 'detail',
      tab: intl.formatMessage({
        id: 'pages.device.instanceDetail.detail',
        defaultMessage: '配置信息',
      }),
      component: <Config />,
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
      tab: intl.formatMessage({
        id: 'pages.device.instanceDetail.metadata',
        defaultMessage: '物模型',
      }),
      component: <Metadata />,
    },
    {
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
      key: 'alarm',
      tab: intl.formatMessage({
        id: 'pages.device.instanceDetail.alarm',
        defaultMessage: '告警设置',
      }),
      component: <Alarm />,
    },
    {
      key: 'visualization',
      tab: intl.formatMessage({
        id: 'pages.device.instanceDetail.visualization',
        defaultMessage: '可视化',
      }),
      component: null,
    },
    {
      key: 'shadow',
      tab: intl.formatMessage({
        id: 'pages.device.instanceDetail.shadow',
        defaultMessage: '设备影子',
      }),
      component: null,
    },
  ];

  return (
    <PageContainer
      onBack={history.goBack}
      onTabChange={setTab}
      tabList={list}
      content={<Info />}
      title={
        <>
          {InstanceModel.detail.name}
          <Divider type="vertical" />
          {deviceStatus.get(InstanceModel.detail.state?.value)}
        </>
      }
      extra={[
        statusMap[0],
        <Button key="2">
          {intl.formatMessage({
            id: 'pages.device.productDetail.disable',
            defaultMessage: '停用',
          })}
        </Button>,
        <Button key="1" type="primary">
          {intl.formatMessage({
            id: 'pages.device.productDetail.setting',
            defaultMessage: '应用配置',
          })}
        </Button>,
      ]}
    >
      {list.find((k) => k.key === tab)?.component}
    </PageContainer>
  );
});
export default InstanceDetail;
