import { PageContainer } from '@ant-design/pro-layout';
import BaseService from '@/utils/BaseService';
import type { ProtocolItem } from '@/pages/link/Protocol/typings';
import { useRef } from 'react';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import { Tooltip } from 'antd';
import {
  ArrowDownOutlined,
  BarsOutlined,
  BugOutlined,
  EditOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import BaseCrud from '@/components/BaseCrud';

export const service = new BaseService<ProtocolItem>('protocol');
const Protocol = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<ProtocolItem>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      dataIndex: 'name',
      title: '名称',
    },
    {
      dataIndex: 'type',
      title: '通知类型',
    },
    {
      dataIndex: 'provider',
      title: '服务商',
    },
    {
      title: '操作',
      valueType: 'option',
      align: 'center',
      width: 200,
      render: (text, record) => [
        <a onClick={() => console.log(record)}>
          <Tooltip title="编辑">
            <EditOutlined />
          </Tooltip>
        </a>,
        <a>
          <Tooltip title="删除">
            <MinusOutlined />
          </Tooltip>
        </a>,
        <a>
          <Tooltip title="下载配置">
            <ArrowDownOutlined />
          </Tooltip>
        </a>,
        <a>
          <Tooltip title="调试">
            <BugOutlined />
          </Tooltip>
        </a>,
        <a>
          <Tooltip title="通知记录">
            <BarsOutlined />
          </Tooltip>
        </a>,
      ],
    },
  ];

  const schema = {};

  return (
    <PageContainer>
      <BaseCrud
        columns={columns}
        service={service}
        title="协议管理"
        schema={schema}
        actionRef={actionRef}
      />
    </PageContainer>
  );
};

export default Protocol;
