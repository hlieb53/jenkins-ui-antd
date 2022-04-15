import type {ActionType, ProColumns} from '@jetlinks/pro-table';
import ProTable from '@jetlinks/pro-table';
import type {LogItem} from '@/pages/device/Instance/Detail/Log/typings';
import {Card, Input, Modal, Tooltip} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {useIntl} from '@@/plugin-locale/localeExports';
import {InstanceModel, service} from '@/pages/device/Instance';
import {useEffect, useRef, useState} from 'react';
import SearchComponent from '@/components/SearchComponent';

const Log = () => {
  const intl = useIntl();

  const [type, setType] = useState<any>({});
  const actionRef = useRef<ActionType>();
  const [searchParams, setSearchParams] = useState<any>({});

  useEffect(() => {
    service.queryLogsType().then((resp) => {
      if (resp.status === 200) {
        const list = (resp.result as { text: string; value: string }[]).reduce(
          (previousValue, currentValue) => {
            previousValue[currentValue.value] = currentValue;
            return previousValue;
          },
          {},
        );
        setType({ ...list });
      }
    });
  }, []);

  const columns: ProColumns<LogItem>[] = [
    {
      title: '类型',
      dataIndex: 'type',
      renderText: (text) => text.text,
      valueType: 'select',
      valueEnum: { ...type },
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      defaultSortOrder: 'descend',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '内容',
      dataIndex: 'content',
      valueType: 'option',
      ellipsis: true,
      render: (text, record) => <span>{String(record.content)}</span>,
    },
    {
      title: intl.formatMessage({
        id: 'pages.data.option',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      align: 'center',
      width: 200,
      render: (text, record) => {
        let content = '';
        try {
          content = JSON.stringify(JSON.parse(record.content), null, 2);
        } catch (error) {
          content = record.content;
        }
        return [
          <a
            key="editable"
            onClick={() =>
              Modal.info({
                title: '详细信息',
                width: 700,
                content: <Input.TextArea bordered={false} rows={15} value={content} />,
              })
            }
          >
            <Tooltip title="查看">
              <SearchOutlined />
            </Tooltip>
          </a>,
        ];
      },
    },
  ];

  return (
    <Card>
      <SearchComponent<LogItem>
        field={[...columns]}
        target="logs"
        enableSave={false}
        // pattern={'simple'}
        onSearch={(param) => {
          actionRef.current?.reset?.();
          setSearchParams(param);
        }}
        // onReset={() => {
        //   // 重置分页及搜索参数
        //   actionRef.current?.reset?.();
        //   setSearchParams({});
        // }}
      />
      <ProTable<LogItem>
        search={false}
        columns={columns}
        size="small"
        actionRef={actionRef}
        params={searchParams}
        toolBarRender={false}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        request={async (params) => {
          return service.queryLog(InstanceModel.detail.id!, params);
        }}
      />
    </Card>
  );
};
export default Log;
