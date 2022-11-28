import React, { useState } from 'react';
import { StatusColorEnum } from '@/components/BadgeStatus';
import { Ellipsis, TableCard } from '@/components';
import '@/style/common.less';
import '../../index.less';
import styles from './index.less';
import type { SceneItem } from '@/pages/rule-engine/Scene/typings';
import { CheckOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { ActionsType, BranchesThen } from '@/pages/rule-engine/Scene/typings';
import MyTooltip from './MyTooltip';

const imageMap = new Map();
imageMap.set('timer', require('/public/images/scene/scene-timer.png'));
imageMap.set('manual', require('/public/images/scene/scene-hand.png'));
imageMap.set('device', require('/public/images/scene/scene-device.png'));

const iconMap = new Map();
iconMap.set('timer', require('/public/images/scene/trigger-type-icon/timing.png'));
iconMap.set('manual', require('/public/images/scene/trigger-type-icon/manual.png'));
iconMap.set('device', require('/public/images/scene/trigger-type-icon/device.png'));

// @ts-ignore
export interface SceneCardProps extends SceneItem {
  detail?: React.ReactNode;
  tools?: React.ReactNode[];
  avatarSize?: number;
  className?: string;
  onUnBind?: (e: any) => void;
  showBindBtn?: boolean;
  cardType?: 'bind' | 'unbind';
  showTool?: boolean;
  onClick?: () => void;
}

enum TriggerWayType {
  manual = '手动触发',
  timer = '定时触发',
  device = '设备触发',
}

enum UnitEnum {
  seconds = '秒',
  minutes = '分',
  hours = '小时',
}

// const selectorRender = (obj: any) => {
//   switch (obj?.selector) {
//     case 'all':
//       return (
//         <span>
//           所有的<span className={styles['trigger-device']}>{obj?.productId}</span>
//         </span>
//       );
//     case 'fixed':
//       return (
//         <span>
//           设备
//           <span className={styles['trigger-device']}>
//             {(obj?.selectorValues || '').map((item: any) => item?.name).join(',')}
//           </span>
//         </span>
//       );
//     case 'org':
//       return (
//         <span>
//           部门
//           <span className={styles['trigger-device']}>
//             {(obj?.selectorValues || '').map((item: any) => item?.name).join(',')}
//           </span>
//         </span>
//       );
//     default:
//       return '';
//   }
// };

// const selectorContextRender = (obj: any) => {
//   switch (obj?.selector) {
//     case 'all':
//       return `所有的${obj?.productId}`;
//     case 'fixed':
//       return `设备${(obj?.selectorValues || '').map((item: any) => item?.name).join(',')}`;
//     case 'org':
//       return `部门${(obj?.selectorValues || '').map((item: any) => item?.name).join(',')}`;
//     default:
//       return '';
//   }
// };

// const timerRender = (timer: any) => {
//   if (timer?.trigger && timer?.mod) {
//     const trigger = timer?.trigger;
//     const mod = timer?.mod;
//     const str: string = trigger === 'week' ? '星期' : trigger === 'month' ? '月' : timer?.cron;
//     if (mod === 'once') {
//       return `，每${str}${timer.when.join('/')}，${timer?.once.time}执行一次`;
//     } else {
//       return `每${str}${timer.when.join('/')}，${timer?.period?.from}-${timer?.period.to}，每${
//         timer?.period.every
//       }${UnitEnum[timer?.period?.unit]}执行一次`;
//     }
//   }
//   return '';
// };

// const operatorRender = (operation: any) => {
//   switch (operation?.operator) {
//     case 'online':
//       return '上线';
//     case 'offline':
//       return '离线';
//     case 'reportEvent':
//       return `上报事件${operation?.options?.eventName}`;
//     case 'reportProperty':
//       return `上报属性${(operation?.options?.propertiesName || []).join(',')}`;
//     case 'readProperty':
//       return `读取属性${(operation?.options?.propertiesName || []).join(',')}`;
//     case 'writeProperty':
//       return `修改属性${(operation?.options?.propertiesName || []).join(',')}`;
//     case 'invokeFunction':
//       return `调用功能${operation?.options?.functionName}`;
//     default:
//       return '';
//   }
// };

const notifyRender = (data: ActionsType | undefined) => {
  switch (data?.notify?.notifyType) {
    case 'dingTalk':
      return (
        <div>
          向<span>{data?.options?.notifierName || data?.notify?.notifierId}</span>
          通过<span className={styles['notify-img-highlight']}>钉钉</span>发送
          <span className={styles['notify-text-highlight']}>
            {data?.options?.templateName || data?.notify?.templateId}
          </span>
        </div>
      );
    case 'weixin':
      return (
        <div>
          向<span className={styles['notify-text-highlight']}>{data?.options?.sendTo || ''}</span>
          <span className={styles['notify-text-highlight']}>{data?.options?.orgName || ''}</span>
          <span className={styles['notify-text-highlight']}>{data?.options?.tagName || ''}</span>
          通过<span className={styles['notify-img-highlight']}>微信</span>发送
          <span className={styles['notify-text-highlight']}>
            {data?.options?.templateName || data?.notify?.templateId}
          </span>
        </div>
      );
    case 'email':
      return (
        <div>
          向<span className={styles['notify-text-highlight']}>{data?.options?.sendTo || ''}</span>
          通过<span className={styles['notify-img-highlight']}>邮件</span>发送
          <span className={styles['notify-text-highlight']}>
            {data?.options?.templateName || data?.notify?.templateId}
          </span>
        </div>
      );
    case 'voice':
      return (
        <div>
          向
          <span className={styles['notify-text-highlight']}>
            {data?.options?.calledNumber || ''}
          </span>
          通过<span className={styles['notify-img-highlight']}>语音</span>发送
          <span className={styles['notify-text-highlight']}>
            {data?.options?.templateName || data?.notify?.templateId}
          </span>
        </div>
      );
    case 'sms':
      return (
        <div>
          向<span className={'notify-text-highlight'}>{data?.options?.sendTo || ''}</span>
          通过<span className={'notify-img-highlight'}>短信</span>发送
          <span className={'notify-text-highlight'}>
            {data?.options?.templateName || data?.notify?.templateId}
          </span>
        </div>
      );
    case 'webhook':
      return (
        <div>
          通过<span className={'notify-img-highlight'}>webhook</span>发送
          <span>{data?.options?.templateName || data?.notify?.templateId}</span>
        </div>
      );
    default:
      return null;
  }
};

const deviceRender = (data: ActionsType | undefined) => {
  switch (data?.device?.selector) {
    case 'fixed':
      return (
        <div>
          {data?.options?.type}
          <span className={styles['notify-text-highlight']}>{data?.options?.name}</span>
          {data?.options?.properties}
        </div>
      );
    case 'tag':
      return (
        <div>
          {data?.options?.type}
          {data.options?.taglist.map((item: any) => (
            <span className={styles['notify-text-highlight']}>
              {item.type}
              {item.name}
              {item.value}
            </span>
          ))}
          {data?.options?.productName}
          {data?.options?.properties}
        </div>
      );
    case 'relation':
      return (
        <div>
          {data?.options?.type}与
          <span className={styles['notify-text-highlight']}>{data?.options?.name}</span>具有相同
          {data?.options?.relationName}的{data?.options?.productName}设备的
          {data?.options?.properties}
        </div>
      );
    default:
      return null;
  }
};

const actionRender = (action: ActionsType, index: number) => {
  switch (action?.executor) {
    case 'notify':
      return (
        <div
          className={styles['card-item-content-action-item-right-item']}
          key={action?.key || index}
        >
          <div className={classNames(styles['trigger-contents'], 'ellipsis')}>
            {notifyRender(action)}
          </div>
        </div>
      );
    case 'delay':
      return (
        <div
          className={styles['card-item-content-action-item-right-item']}
          key={action?.key || index}
        >
          <div className={classNames(styles['trigger-contents'], 'ellipsis')}>
            <span style={{ fontWeight: 'bold' }}>
              {action?.delay?.time}
              {UnitEnum[action?.delay?.unit || '']}
            </span>
            后执行后续动作
          </div>
        </div>
      );
    case 'device':
      return (
        <div
          className={styles['card-item-content-action-item-right-item']}
          key={action?.key || index}
        >
          <div className={classNames(styles['trigger-contents'], 'ellipsis')}>
            {deviceRender(action)}
          </div>
        </div>
      );
    case 'alarm':
      return (
        <div
          className={styles['card-item-content-action-item-right-item']}
          key={action?.key || index}
        >
          <div className={classNames(styles['trigger-contents'], 'ellipsis')}>
            满足条件后将触发关联此场景的告警
          </div>
        </div>
      );
    default:
      return null;
  }
};

const conditionsRender = (when: any[], index: number) => {
  if (when.length) {
    return (when[index]?.terms || []).join('');
  }
  return '';
};

const branchesActionRender = (actions: any[]) => {
  if (actions && actions?.length) {
    const list: any[] = [];
    actions.map((item, index) => {
      const dt = actionRender(item, index);
      list.push(dt);
    });

    return list.map((item, index) => (
      <div className={styles['right-item-right-item-contents-item']}>
        <div style={{ margin: '0 10px' }}>{item}</div>
        <MyTooltip title={actions[index]?.options?.terms || ''}>
          {actions[index]?.options?.terms && (
            <div className={'ellipsis'} style={{ minWidth: 40 }}>
              动作{index + 1}
              {actions[index]?.options?.terms}
            </div>
          )}
        </MyTooltip>
      </div>
    ));
  }
  return '';
};

const ContentRender = (data: SceneCardProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const type = data.triggerType;
  if (
    type === 'device' &&
    (data.branches || [])?.length &&
    Object.keys(data?.trigger?.device || {}).length
  ) {
    // const obj = data.trigger.device;
    // const operation: any = data.trigger.device?.operation;
    const trigger = data?.options?.trigger;
    const text =
      (trigger?.name || '') +
      (trigger?.productName || '') +
      (trigger?.when || '') +
      (trigger?.time || '') +
      (trigger?.extraTime || '') +
      (trigger?.type || '');
    return (
      <div className={styles['card-item-content-box']}>
        <MyTooltip placement="topLeft" title={text}>
          <div className={classNames(styles['card-item-content-trigger'], 'ellipsis')}>
            {text}
            {/*{selectorRender(obj)}*/}
            {/*{operation ? (*/}
            {/*  <span>*/}
            {/*    {timerRender(operation?.timer)}*/}
            {/*    {operatorRender(operation)}*/}
            {/*  </span>*/}
            {/*) : (*/}
            {/*  ''*/}
            {/*)}*/}
          </div>
        </MyTooltip>
        <div className={styles['card-item-content-action']}>
          {(visible ? data.branches || [] : (data?.branches || []).slice(0, 2)).map(
            (item: any, index) => {
              return (
                <div className={styles['card-item-content-action-item']} key={item?.key || index}>
                  <div className={styles['card-item-content-action-item-left']}>
                    {index === 0 ? '当' : '否则'}
                  </div>
                  <div className={styles['card-item-content-action-item-right']}>
                    <div className={styles['card-item-content-action-item-right-item']}>
                      <div className={styles['right-item-left']}>
                        <MyTooltip title={conditionsRender(data.options?.terms || [], index)}>
                          <div className={classNames(styles['trigger-conditions'], 'ellipsis')}>
                            {conditionsRender(data.options?.terms || [], index)}
                          </div>
                        </MyTooltip>
                        {item.shakeLimit?.enabled && (
                          <MyTooltip
                            title={`(${item.shakeLimit?.time}秒内发生${item.shakeLimit?.threshold}
                            次以上时执行一次)`}
                          >
                            <div className={classNames(styles['trigger-shake'], 'ellipsis')}>
                              ({item.shakeLimit?.time}秒内发生{item.shakeLimit?.threshold}
                              次以上时执行一次)
                            </div>
                          </MyTooltip>
                        )}
                      </div>
                      <div className={styles['right-item-right']}>
                        {(item?.then || []).map((i: BranchesThen, _index: number) => (
                          <div key={i?.key || _index} className={styles['right-item-right-item']}>
                            <div className={styles['trigger-ways']}>
                              {i.parallel ? '并行执行' : '串行执行'}
                            </div>
                            <div className={classNames(styles['right-item-right-item-contents'])}>
                              {branchesActionRender(Array.isArray(i?.actions) ? i?.actions : [])}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
          )}
          {(data?.branches || []).length > 2 && (
            <div
              className={styles['trigger-actions-more']}
              onClick={(e) => {
                e.stopPropagation();
                setVisible(!visible);
              }}
            >
              展开更多{!visible ? <DownOutlined /> : <UpOutlined />}
            </div>
          )}
        </div>
      </div>
    );
  } else if (type !== 'device' && data.branches?.length) {
    return (
      <div className={styles['card-item-content-box']}>
        <div className={styles['card-item-content-action']}>
          {data.branches?.length &&
            (data?.branches || []).map((item: any, index) => {
              return (
                <div className={styles['card-item-content-action-item']} key={item?.key || index}>
                  <div className={styles['card-item-content-action-item-left']}>执行</div>
                  <div className={styles['card-item-content-action-item-right']}>
                    <div className={styles['card-item-content-action-item-right-item']}>
                      <div className={styles['right-item-right']}>
                        {(item?.then || []).map((i: BranchesThen, _index: number) => {
                          return (
                            <div key={i?.key || _index} className={styles['right-item-right-item']}>
                              <div className={styles['trigger-ways']}>
                                {i.parallel ? '并行执行' : '串行执行'}
                              </div>
                              <div className={classNames(styles['right-item-right-item-contents'])}>
                                {branchesActionRender(Array.isArray(i?.actions) ? i?.actions : [])}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  } else {
    return <div className={styles['card-item-content-box-empty']}>未配置规则</div>;
  }
};

export const ExtraSceneCard = (props: SceneCardProps) => {
  return (
    <TableCard
      status={props.state.value}
      statusText={props.state.text}
      statusNames={{
        started: StatusColorEnum.success,
        disable: StatusColorEnum.error,
        notActive: StatusColorEnum.warning,
      }}
      showTool={props.showTool}
      showMask={false}
      actions={props.tools}
      onClick={props.onClick}
      className={props.className}
      contentClassName={styles['content-class']}
    >
      <div className={'pro-table-card-item context-access'}>
        <div className={'card-item-avatar'}>
          <img width={88} height={88} src={imageMap.get(props.triggerType)} alt={''} />
        </div>
        <div className={'card-item-body'}>
          <div className={'card-item-header'}>
            <div className={'card-item-header-item'} style={{ maxWidth: '50%' }}>
              <Ellipsis
                title={props.name}
                style={{ fontSize: 18, opacity: 0.85, color: '#000', fontWeight: 'bold' }}
              />
            </div>
            <div className={'card-item-header-item'} style={{ maxWidth: '50%' }}>
              <Ellipsis
                title={props.description}
                style={{ color: 'rgba(0, 0, 0, 0.65)', margin: '3px 0 0 10px' }}
              />
            </div>
          </div>
          <ContentRender {...props} />
        </div>
      </div>
      <div className={styles['card-item-trigger-type']}>
        <div className={styles['card-item-trigger-type-text']}>
          <img height={16} src={iconMap.get(props.triggerType)} style={{ marginRight: 8 }} />
          {TriggerWayType[props.triggerType]}
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

export default (props: SceneCardProps) => {
  return (
    <TableCard
      showMask={false}
      detail={props.detail}
      showTool={props.showTool}
      actions={props.tools}
      status={props.state.value}
      statusText={props.state.text}
      statusNames={{
        started: StatusColorEnum.success,
        disable: StatusColorEnum.error,
        notActive: StatusColorEnum.warning,
      }}
      contentClassName={styles['content-class']}
    >
      <div className={'pro-table-card-item'} onClick={props.onClick}>
        <div className={'card-item-avatar'}>
          <img width={88} height={88} src={imageMap.get(props.triggerType)} alt={''} />
        </div>
        <div className={'card-item-body'}>
          <div className={'card-item-header'}>
            <div className={'card-item-header-item'} style={{ maxWidth: '50%' }}>
              <Ellipsis
                title={props.name}
                style={{ fontSize: 18, opacity: 0.85, color: '#000', fontWeight: 'bold' }}
              />
            </div>
            <div className={'card-item-header-item'} style={{ maxWidth: '50%' }}>
              <Ellipsis
                title={props.description}
                style={{ color: 'rgba(0, 0, 0, 0.65)', margin: '3px 0 0 10px' }}
              />
            </div>
          </div>
          <ContentRender {...props} />
        </div>
      </div>
      <div className={styles['card-item-trigger-type']}>
        <div className={styles['card-item-trigger-type-text']}>
          <img height={16} src={iconMap.get(props.triggerType)} style={{ marginRight: 8 }} />
          {TriggerWayType[props.triggerType]}
        </div>
      </div>
    </TableCard>
  );
};
