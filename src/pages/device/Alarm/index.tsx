import { PageContainer } from '@ant-design/pro-layout';
import BaseService from '@/utils/BaseService';
import { useRef } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import moment from 'moment';
import { Divider, Modal, Tag } from 'antd';
import BaseCrud from '@/components/BaseCrud';

const service = new BaseService<AlarmItem>('device/alarm/history');
const Alarm = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<AlarmItem>[] = [
    {
      title: '设备ID',
      dataIndex: 'deviceId',
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
    },
    {
      title: '告警名称',
      dataIndex: 'alarmName',
    },
    {
      title: '告警时间',
      dataIndex: 'alarmTime',
      width: '300px',
      render: (text: any) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/'),
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: '处理状态',
      dataIndex: 'state',
      align: 'center',
      width: '100px',
      render: (text) =>
        text === 'solve' ? <Tag color="#87d068">已处理</Tag> : <Tag color="#f50">未处理</Tag>,
    },
    {
      title: '操作',
      width: '120px',
      align: 'center',
      render: (record: any) => (
        <>
          <a
            onClick={() => {
              let content: string;
              try {
                content = JSON.stringify(record.alarmData, null, 2);
              } catch (error) {
                content = record.alarmData;
              }
              Modal.confirm({
                width: '40VW',
                title: '告警数据',
                content: (
                  <pre>
                    {content}
                    {record.state === 'solve' && (
                      <>
                        <br />
                        <br />
                        <span style={{ fontSize: 16 }}>处理结果：</span>
                        <br />
                        <p>{record.description}</p>
                      </>
                    )}
                  </pre>
                ),
                okText: '确定',
                cancelText: '关闭',
              });
            }}
          >
            详情
          </a>
          {record.state !== 'solve' ? <Divider type="vertical" /> : ''}
          {record.state !== 'solve' && <a onClick={() => {}}>处理</a>}
        </>
      ),
    },
  ];

  const schema = {};

  return (
    <PageContainer>
      <BaseCrud
        columns={columns}
        service={service}
        title={'告警记录'}
        schema={schema}
        actionRef={actionRef}
      />
    </PageContainer>
  );
};

export default Alarm;
