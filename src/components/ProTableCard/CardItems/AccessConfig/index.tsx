import React from 'react';
import { StatusColorEnum } from '@/components/BadgeStatus';
import { TableCard } from '@/components';
import '@/style/common.less';
import { Badge, Tooltip } from 'antd';
import type { AccessItem } from '@/pages/link/AccessConfig/typings';
import './index.less';
import classNames from 'classnames';

export interface AccessConfigCardProps extends AccessItem {
  detail?: React.ReactNode;
  actions?: React.ReactNode[];
  avatarSize?: number;
  showTool?: boolean;
  activeStyle?: string;
}

const defaultImage = require('/public/images/device-access.png');

export default (props: AccessConfigCardProps) => {
  return (
    <TableCard
      showMask={false}
      actions={props.actions}
      status={props.state.value}
      statusText={props.state.text}
      statusNames={{
        enabled: StatusColorEnum.success,
        disabled: StatusColorEnum.error,
      }}
      showTool={props.showTool}
      contentClassName={props.state.value === 'disabled' ? 'tableCardDisabled' : 'tableCardEnabled'}
      className={classNames('access-config-card-item', props.activeStyle)}
    >
      <div className="context-access">
        <div>
          <img width={88} height={88} src={defaultImage} alt={''} />
        </div>
        <div className="card">
          <div className="header">
            <div className="title ellipsis">
              <Tooltip title={props.name} placement="topLeft">
                {props.name || '--'}
              </Tooltip>
            </div>
            <div className="desc">
              <Tooltip title={props.description} placement="topLeft">
                {props.description || '--'}
              </Tooltip>
            </div>
          </div>
          <div className="container">
            <div className="server">
              <div className="subTitle">{props?.channelInfo?.name || '--'}</div>
              <div className="serverItem">
                {props.channelInfo?.addresses.slice(0, 2).map((i: any, index: number) => (
                  <div className="subItem" key={i.address + `_address${index}`}>
                    <Tooltip title={i.address}>
                      <Badge color={i.health === -1 ? 'red' : 'green'} />
                      {i.address}
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
            <div className="procotol">
              <div className="subTitle">{props?.protocolDetail?.name || '--'}</div>
              <div className="desc">
                <Tooltip title={props.protocolDetail?.description}>
                  {props.protocolDetail?.description || '--'}
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TableCard>
  );
};
