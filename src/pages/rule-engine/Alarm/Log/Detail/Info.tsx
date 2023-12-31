import { Descriptions, Modal, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { Store } from 'jetlinks-store';
import styles from './index.less';
import ReactJson from 'react-json-view';

interface Props {
  data: Partial<AlarmLogHistoryItem>;
  close: () => void;
}

const Info = (props: Props) => {
  const [data, setDada] = useState<Partial<AlarmLogHistoryItem>>(props.data || {});

  useEffect(() => {
    setDada(props.data);
  }, [props.data]);

  return (
    <Modal
      title={'详情'}
      visible
      onCancel={props.close}
      onOk={props.close}
      width={1000}
      className={styles.conent}
    >
      <Descriptions bordered column={2}>
        {data.targetType === 'device' && (
          <>
            <Descriptions.Item label="告警设备" span={1}>
              {data?.targetName || ''}
            </Descriptions.Item>
            <Descriptions.Item label="设备ID" span={1}>
              {data?.targetId || ''}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="告警名称" span={1}>
          {data?.alarmConfigName || ''}
        </Descriptions.Item>
        <Descriptions.Item label="告警时间" span={1}>
          {moment(data?.alarmTime).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="告警级别" span={1}>
          <Tooltip
            placement="topLeft"
            title={
              (Store.get('default-level') || []).find((item: any) => item?.level === data?.level)
                ?.title || data?.level
            }
          >
            <div className="ellipsis" style={{ maxWidth: 100 }}>
              {(Store.get('default-level') || []).find((item: any) => item?.level === data?.level)
                ?.title || data?.level}
            </div>
          </Tooltip>
        </Descriptions.Item>
        <Descriptions.Item label="告警说明" span={1}>
          <Tooltip placement="topLeft" title={data?.description || ''}>
            <div className="ellipsis" style={{ maxWidth: 1 }}>
              {data?.description || ''}
            </div>
          </Tooltip>
        </Descriptions.Item>
        <Descriptions.Item label="告警流水" span={2}>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <ReactJson
              enableClipboard={false}
              displayObjectSize={false}
              displayDataTypes={false}
              name={false}
              src={JSON.parse(data?.alarmInfo || '{}')}
            />
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};
export default Info;
