import { Descriptions, Modal } from 'antd';
import { useEffect, useState } from 'react';
import moment from 'moment';
// import { service } from '@/pages/account/NotificationRecord';
import { service as service1 } from '@/pages/rule-engine/Alarm/Log';
import { Store } from 'jetlinks-store';
import ReactJson from 'react-json-view';

interface Props {
  data: Partial<NotifitionRecord>;
  close: () => void;
}

const Detail = (props: Props) => {
  const [data, setDada] = useState<any>({});

  useEffect(() => {
    if (props.data?.dataId) {
      service1.queryDefaultLevel().then((resp) => {
        if (resp.status === 200) {
          Store.set('default-level', resp.result?.levels || []);
          if (props.data.detailJson) {
            const detailJson = props.data.detailJson || '{}';
            setDada(JSON.parse(detailJson));
          } else {
            setDada(props.data?.detail || props.data);
          }
        }
      });
    }
  }, [props.data]);

  return (
    <Modal title={'详情'} visible onCancel={props.close} onOk={props.close} width={1000}>
      <Descriptions bordered column={2}>
        {data?.targetType === 'device' && (
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
          {data?.alarmName || data?.alarmConfigName || ''}
        </Descriptions.Item>
        <Descriptions.Item label="告警时间" span={1}>
          {moment(data?.alarmTime).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="告警级别" span={1}>
          {(Store.get('default-level') || []).find(
            (item: any) => Number(item?.level) === Number(data?.level),
          )?.title || data?.level}
        </Descriptions.Item>
        <Descriptions.Item label="告警说明" span={1}>
          {data?.description || ''}
        </Descriptions.Item>
        <Descriptions.Item label="告警流水" span={2}>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {
              // @ts-ignore
              <ReactJson
                enableClipboard={false}
                displayObjectSize={false}
                displayDataTypes={false}
                name={false}
                src={JSON.parse(data?.alarmInfo || '{}')}
              />
            }
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};
export default Detail;
