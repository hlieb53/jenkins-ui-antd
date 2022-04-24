import SearchComponent from '@/components/SearchComponent';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import ProTable from '@jetlinks/pro-table';
import { Modal } from 'antd';
import { useRef, useState } from 'react';
import { service } from '@/pages/rule-engine/Alarm/Log';

interface Props {
  data: Partial<AlarmLogItem>;
  close: () => void;
}

const typeMap = new Map();
typeMap.set('system', '系统');
typeMap.set('user', '人工');

const SolveLog = (props: Props) => {
  const [param, setParam] = useState<any>({
    terms: [
      {
        column: 'alarmRecordId',
        termType: 'eq',
        value: props.data.id,
        type: 'and',
      },
    ],
    sorts: [
      {
        name: 'createTime',
        order: 'desc',
      },
    ],
  });
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<AlarmLogSolveHistoryItem>[] = [
    {
      dataIndex: 'createTime',
      title: '处理时间',
    },
    {
      dataIndex: 'handleType',
      title: '处理类型',
      render: (text: any) => <span>{typeMap.get(text) || ''}</span>,
    },
    {
      dataIndex: 'address',
      title: '告警时间',
    },
    {
      dataIndex: 'description',
      title: '告警处理',
    },
  ];

  return (
    <Modal title={'处理记录'} visible onCancel={props.close} onOk={() => {}} width={1200}>
      <SearchComponent<AlarmLogSolveHistoryItem>
        field={columns}
        target="bind-channel"
        enableSave={false}
        onSearch={(data) => {
          actionRef.current?.reload();
          const terms = [
            {
              column: 'alarmRecordId',
              termType: 'eq',
              value: props.data.id,
              type: 'and',
            },
          ];
          setParam({
            ...param,
            terms: data?.terms ? [...data?.terms, ...terms] : [...terms],
          });
        }}
      />
      <ProTable<AlarmLogSolveHistoryItem>
        actionRef={actionRef}
        params={param}
        columns={columns}
        search={false}
        headerTitle={'记录列表'}
        request={async (params) => {
          return service.queryHandleHistory({
            ...params,
            sorts: [{ name: 'createTime', order: 'desc' }],
          });
        }}
        rowKey="id"
      />
    </Modal>
  );
};
export default SolveLog;
