import { PageContainer } from '@ant-design/pro-layout';
import BaseService from '@/utils/BaseService';
import { useRef } from 'react';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import BaseCrud from '@/components/BaseCrud';
import { ArrowDownOutlined, BugOutlined, EditOutlined, MinusOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

export const service = new BaseService<TemplateItem>('notifier/template');
const Template = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<TemplateItem>[] = [
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
      ],
    },
  ];

  const schema = {};
  return (
    <PageContainer>
      <BaseCrud
        columns={columns}
        service={service}
        title="通知模版"
        schema={schema}
        actionRef={actionRef}
      />
    </PageContainer>
  );
};
export default Template;
