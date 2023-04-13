import { Card, Descriptions } from 'antd';
import { InstanceModel, service } from '@/pages/device/Instance';
import moment from 'moment';
import { observer } from '@formily/react';
import { useIntl } from '@@/plugin-locale/localeExports';
import Config from '@/pages/device/Instance/Detail/Config';
import Reation from '@/pages/device/Instance/Detail/Reation';
import Save from '../../Save';
import { useEffect, useState } from 'react';
import type { DeviceInstance } from '../../typings';
import { EditOutlined } from '@ant-design/icons';
import Tags from '@/pages/device/Instance/Detail/Tags';
import { Ellipsis, PermissionButton } from '@/components';
import { useDomFullHeight } from '@/hooks';

const Info = observer(() => {
  const intl = useIntl();
  const [visible, setVisible] = useState<boolean>(false);
  const { permission } = PermissionButton.usePermission('device/Instance');
  const { minHeight } = useDomFullHeight(`.device-detail-body`);
  const [parent, setParent] = useState<Partial<DeviceInstance>>({});

  useEffect(() => {
    if (
      InstanceModel.detail?.deviceType?.value === 'childrenDevice' &&
      InstanceModel.detail?.parentId
    ) {
      service.detail(InstanceModel.detail?.parentId).then((resp) => {
        if (resp.status === 200) {
          setParent(resp.result);
        }
      });
    }
  }, [InstanceModel.detail?.parentId]);

  return (
    <>
      <Card className={'device-detail-body'} style={{ minHeight }}>
        <Descriptions
          size="small"
          column={3}
          bordered
          labelStyle={{ width: 150 }}
          contentStyle={{ minWidth: 'calc(100% / 3 - 150px)' }}
          title={[
            <span key={1}>设备信息</span>,
            <PermissionButton
              isPermission={permission.update}
              key={2}
              type={'link'}
              onClick={() => {
                setVisible(true);
              }}
            >
              <EditOutlined />
              编辑
            </PermissionButton>,
          ]}
        >
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.table.deviceId',
              defaultMessage: '设备ID',
            })}
          >
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
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.table.productName',
              defaultMessage: '产品名称',
            })}
          >
            <Ellipsis
              title={InstanceModel.detail?.productName}
              tooltip={{ placement: 'topLeft' }}
              style={{ maxWidth: 250 }}
              limitWidth={250}
            />
            {/*<Tooltip placement="topLeft" title={InstanceModel.detail?.productName}>*/}
            {/*  <div className="ellipsis" style={{ maxWidth: 250 }}>*/}
            {/*    {InstanceModel.detail?.productName}*/}
            {/*  </div>*/}
            {/*</Tooltip>*/}
          </Descriptions.Item>
          {/*<Descriptions.Item label={'产品分类'}>*/}
          {/*  <Ellipsis*/}
          {/*    title={InstanceModel.detail?.classifiedName}*/}
          {/*    tooltip={{ placement: 'topLeft' }}*/}
          {/*    style={{ maxWidth: 250 }}*/}
          {/*    limitWidth={250}*/}
          {/*  />*/}
          {/*</Descriptions.Item>*/}
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.device.instanceDetail.deviceType',
              defaultMessage: '设备类型',
            })}
          >
            {InstanceModel.detail?.deviceType?.text}
          </Descriptions.Item>
          <Descriptions.Item label={'固件版本'}>
            {InstanceModel.detail?.firmwareInfo?.version || ''}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.device.instanceDetail.transportProtocol',
              defaultMessage: '连接协议',
            })}
          >
            {InstanceModel.detail?.transport}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.device.instanceDetail.protocolName',
              defaultMessage: '消息协议',
            })}
          >
            {InstanceModel.detail?.protocolName}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.device.instanceDetail.createTime',
              defaultMessage: '创建时间',
            })}
          >
            {InstanceModel.detail?.createTime
              ? moment(InstanceModel.detail?.createTime).format('YYYY-MM-DD HH:mm:ss')
              : ''}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.device.instanceDetail.registerTime',
              defaultMessage: '注册时间',
            })}
          >
            {InstanceModel.detail?.registerTime
              ? moment(InstanceModel.detail?.registerTime).format('YYYY-MM-DD HH:mm:ss')
              : ''}
          </Descriptions.Item>
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.device.instanceDetail.lastTimeOnline',
              defaultMessage: '最后上线时间',
            })}
          >
            {InstanceModel.detail?.onlineTime
              ? moment(InstanceModel.detail?.onlineTime).format('YYYY-MM-DD HH:mm:ss')
              : ''}
          </Descriptions.Item>
          {InstanceModel.detail?.deviceType?.value === 'childrenDevice' && (
            <Descriptions.Item label={'父设备'}>
              {parent?.name || InstanceModel.detail?.parentId}
            </Descriptions.Item>
          )}
          <Descriptions.Item
            label={intl.formatMessage({
              id: 'pages.table.description',
              defaultMessage: '说明',
            })}
          >
            <Ellipsis
              title={InstanceModel.detail?.description}
              tooltip={{ placement: 'topLeft' }}
              style={{ maxWidth: 250 }}
              limitWidth={250}
            />
            {/*<Tooltip placement="topLeft" title={InstanceModel.detail?.description}>*/}
            {/*  <div className="ellipsis" style={{ maxWidth: 250 }}>*/}
            {/*    {InstanceModel.detail?.description}*/}
            {/*  </div>*/}
            {/*</Tooltip>*/}
          </Descriptions.Item>
        </Descriptions>
        <Config />
        {InstanceModel.detail?.tags && InstanceModel.detail?.tags.length > 0 && <Tags />}
        {InstanceModel.detail?.relations && InstanceModel.detail?.relations.length > 0 && (
          <Reation />
        )}
      </Card>
      <Save
        model={'edit'}
        data={{ ...InstanceModel?.detail, describe: InstanceModel?.detail?.description || '' }}
        close={(data: DeviceInstance | undefined) => {
          setVisible(false);
          if (data) {
            InstanceModel.detail = {
              ...InstanceModel.detail,
              ...data,
              describe: data.description,
            };
          }
        }}
        visible={visible}
      />
    </>
  );
});
export default Info;
