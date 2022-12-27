import React from 'react';
import type { ProtocolItem } from '@/pages/link/Protocol/typings';
// import { StatusColorEnum } from '@/components/BadgeStatus';
import { Ellipsis, TableCard } from '@/components';
import '@/style/common.less';
import '../index.less';
import { Col, Row } from 'antd';

export interface ProcotolCardProps extends ProtocolItem {
  detail?: React.ReactNode;
  actions?: React.ReactNode[];
  avatarSize?: number;
}

const defaultImage = require('/public/images/protocol.png');

export default (props: ProcotolCardProps) => {
  return (
    <TableCard
      showMask={false}
      actions={props.actions}
      showStatus={false}
      // status={props.state === 1 ? 'enabled' : 'disabled'}
      // statusText={props.state === 1 ? '正常' : '禁用'}
      // statusNames={{
      //   enabled: StatusColorEnum.success,
      //   disabled: StatusColorEnum.error,
      // }}
    >
      <div className={'pro-table-card-item'}>
        <div className={'card-item-avatar'}>
          <img width={88} height={88} src={defaultImage} alt={''} />
        </div>
        <div className={'card-item-body'}>
          <div className={'card-item-header'}>
            <Ellipsis title={props.name} titleClassName={'card-item-header-name'} />
            {/*<Tooltip title={props.name}>*/}
            {/*  <span className={'card-item-header-name ellipsis'}>{props.name}</span>*/}
            {/*</Tooltip>*/}
          </div>
          <Row gutter={24}>
            <Col span={12}>
              <div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12 }}>ID</div>
                {/*<div*/}
                {/*  style={{*/}
                {/*    width: '100%',*/}
                {/*    overflow: 'hidden',*/}
                {/*    whiteSpace: 'nowrap',*/}
                {/*    textOverflow: 'ellipsis',*/}
                {/*  }}*/}
                {/*>*/}
                {/*  <Tooltip title={props.id}>{props.id}</Tooltip>*/}
                {/*</div>*/}
                <Ellipsis title={props.id} />
              </div>
            </Col>
            <Col span={12}>
              <div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)', fontSize: 12 }}>类型</div>
                <div>{props.type}</div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </TableCard>
  );
};
