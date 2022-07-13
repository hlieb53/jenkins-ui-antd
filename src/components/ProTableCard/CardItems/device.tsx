import React, { useState } from 'react';
import type { DeviceInstance } from '@/pages/device/Instance/typings';
import { StatusColorEnum } from '@/components/BadgeStatus';
import { TableCard, Ellipsis } from '@/components';
import '@/style/common.less';
import '../index.less';
import { CheckOutlined } from '@ant-design/icons';

export interface DeviceCardProps extends Partial<DeviceInstance> {
  detail?: React.ReactNode;
  actions?: React.ReactNode[];
  avatarSize?: number;
  className?: string;
  content?: React.ReactNode[];
  onClick?: () => void;
  grantedPermissions?: string[];
  onUnBind?: (e: any) => void;
  showBindBtn?: boolean;
  cardType?: 'bind' | 'unbind';
  showTool?: boolean;
}

const defaultImage = require('/public/images/device-type-3-big.png');

export const PermissionsMap = {
  read: '查看',
  save: '编辑',
  delete: '删除',
};

export const handlePermissionsMap = (permissions?: string[]) => {
  return permissions && permissions.length
    ? permissions.map((item) => PermissionsMap[item]).toString()
    : '';
};

export const ExtraDeviceCard = (props: DeviceCardProps) => {
  const [imgUrl, setImgUrl] = useState<string>(props.photoUrl || defaultImage);

  return (
    <TableCard
      showTool={props.showTool}
      showMask={false}
      status={props.state?.value}
      actions={props.actions}
      statusText={props.state?.text}
      statusNames={{
        online: StatusColorEnum.processing,
        offline: StatusColorEnum.error,
        notActive: StatusColorEnum.warning,
      }}
      onClick={props.onClick}
      className={props.className}
    >
      <div className={'pro-table-card-item'}>
        <div className={'card-item-avatar'}>
          <img
            width={88}
            height={88}
            src={imgUrl}
            alt={''}
            onError={() => {
              setImgUrl(defaultImage);
            }}
          />
        </div>
        <div className={'card-item-body'}>
          <div className={'card-item-header'}>
            <Ellipsis title={props.name} titleClassName={'card-item-header-name'} />
          </div>
          <div className={'card-item-content-flex'}>
            <div className={'flex-auto'}>
              <label>ID</label>
              <Ellipsis title={props.id || ''} titleClassName={'ellipsis'} />
              {/*<div className={'ellipsis'}>*/}
              {/*  <Tooltip title={props.id}>{props.id || ''}</Tooltip>*/}
              {/*</div>*/}
            </div>
            {props.cardType === 'bind' ? (
              <div className={'flex-auto'}>
                <label>说明</label>
                <Ellipsis title={props.describe || ''} titleClassName={'ellipsis'} />
                {/*<Tooltip title={props.describe}>*/}
                {/*  <div className={'ellipsis'}>{props.describe}</div>*/}
                {/*</Tooltip>*/}
              </div>
            ) : (
              <div className={'flex-auto'}>
                <label>资产权限</label>
                <Ellipsis
                  title={handlePermissionsMap(props.grantedPermissions)}
                  titleClassName={'ellipsis'}
                />
                {/*<div className={'ellipsis'}>*/}
                {/*  <Tooltip title={handlePermissionsMap(props.grantedPermissions)}>*/}
                {/*    {handlePermissionsMap(props.grantedPermissions)}*/}
                {/*  </Tooltip>*/}
                {/*</div>*/}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={'checked-icon'}>
        <div>
          <CheckOutlined />
        </div>
      </div>
    </TableCard>
  );
};

export default (props: DeviceCardProps) => {
  return (
    <TableCard
      detail={props.detail}
      actions={props.actions}
      status={props.state?.value}
      statusText={props.state?.text}
      statusNames={{
        online: StatusColorEnum.processing,
        offline: StatusColorEnum.error,
        notActive: StatusColorEnum.warning,
      }}
    >
      <div className={'pro-table-card-item'}>
        <div className={'card-item-avatar'}>
          <img width={88} height={88} src={props.photoUrl || defaultImage} alt={''} />
        </div>
        <div className={'card-item-body'}>
          <div className={'card-item-header'}>
            <Ellipsis title={props.name} titleClassName={'card-item-header-name'} />
          </div>
          <div className={'card-item-content'}>
            <div>
              <label>设备类型</label>
              <Ellipsis
                title={props.deviceType ? props.deviceType.text : ''}
                titleClassName={'ellipsis'}
              />
              {/*<div className={'ellipsis'}>{props.deviceType ? props.deviceType.text : ''}</div>*/}
            </div>
            <div>
              <label>产品名称</label>
              <Ellipsis title={props.productName} titleClassName={'ellipsis'} />
              {/*<div className={'ellipsis'}>{props.productName || ''}</div>*/}
            </div>
          </div>
        </div>
      </div>
    </TableCard>
  );
};
