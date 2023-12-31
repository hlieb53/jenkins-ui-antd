import React from 'react';
import { Ellipsis, TableCard } from '@/components';
import '@/style/common.less';
import '../index.less';
import { imgMap, typeList } from './noticeTemplate';
import { CheckOutlined } from '@ant-design/icons';

export interface NoticeCardProps extends ConfigItem {
  detail?: React.ReactNode;
  actions?: React.ReactNode[];
  avatarSize?: number;
  className?: string;
  onUnBind?: (e: any) => void;
  showBindBtn?: boolean;
  cardType?: 'bind' | 'unbind';
  showTool?: boolean;
  onClick?: () => void;
}

export const ExtraNoticeConfigCard = (props: NoticeCardProps) => {
  return (
    <TableCard
      showTool={props.showTool}
      showMask={false}
      showStatus={false}
      actions={props.actions}
      onClick={props.onClick}
      className={props.className}
    >
      <div className={'pro-table-card-item'}>
        <div className={'card-item-avatar'}>
          <img width={88} height={88} src={imgMap[props.type][props.provider]} alt={props.type} />
        </div>
        <div className={'card-item-body'}>
          <div className={'card-item-header'}>
            <Ellipsis title={props.name} titleClassName={'card-item-header-name'} />
          </div>
          <div className={'card-item-content'}>
            <div>
              <label>通知方式</label>
              <Ellipsis title={typeList[props.type][props.provider] || '暂无'} />
            </div>
            <div>
              <label>说明</label>
              <Ellipsis title={props.description} />
            </div>
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

export default (props: NoticeCardProps) => {
  return (
    <TableCard detail={props.detail} actions={props.actions} showStatus={false} showMask={false}>
      <div className={'pro-table-card-item'}>
        <div className={'card-item-avatar'}>
          <img width={88} height={88} src={imgMap[props.type][props.provider]} alt={props.type} />
        </div>
        <div className={'card-item-body'}>
          <div className={'card-item-header'}>
            {/*<span className={'card-item-header-name ellipsis'}>*/}
            {/*  <Tooltip placement="topLeft" title={props.name}>*/}
            {/*    {props.name}*/}
            {/*  </Tooltip>*/}
            {/*</span>*/}
            <Ellipsis title={props.name} titleClassName={'card-item-header-name'} />
          </div>
          <div className={'card-item-content'}>
            <div>
              <label>通知方式</label>
              <Ellipsis title={typeList[props.type][props.provider] || '暂无'} />
              {/*<div className={'ellipsis'}>{typeList[props.type][props.provider] || '暂无'}</div>*/}
            </div>
            <div>
              <label>说明</label>
              <Ellipsis title={props.description} />
              {/*<div className={'ellipsis'}>*/}
              {/*  <Tooltip placement="topLeft" title={props.description}>*/}
              {/*    {props.description}*/}
              {/*  </Tooltip>*/}
              {/*</div>*/}
            </div>
          </div>
        </div>
      </div>
    </TableCard>
  );
};
