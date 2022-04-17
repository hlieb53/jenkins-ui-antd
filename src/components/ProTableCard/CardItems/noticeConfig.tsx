import React from 'react';
import { TableCard } from '@/components';
import '@/style/common.less';
import '../index.less';
import { imgMap, typeList } from './noticeTemplate';

export interface NoticeCardProps extends ConfigItem {
  detail?: React.ReactNode;
  actions?: React.ReactNode[];
  avatarSize?: number;
}

export default (props: NoticeCardProps) => {
  return (
    <TableCard detail={props.detail} actions={props.actions} showStatus={false}>
      <div className={'pro-table-card-item'}>
        <div className={'card-item-avatar'}>
          <img width={88} height={88} src={imgMap[props.type]} alt={props.type} />
        </div>
        <div className={'card-item-body'}>
          <div className={'card-item-header'}>
            <span className={'card-item-header-name ellipsis'}>{props.name}</span>
          </div>
          <div className={'card-item-content'}>
            <div>
              <label>通知方式</label>
              <div className={'ellipsis'}>{typeList[props.type][props.provider] || '暂无'}</div>
            </div>
            <div>
              <label>说明</label>
              <div className={'ellipsis'}>{props.description}</div>
            </div>
          </div>
        </div>
      </div>
    </TableCard>
  );
};
