import { useIntl } from '@@/plugin-locale/localeExports';
import { useRef, useState } from 'react';
import type { ProColumns, ActionType } from '@jetlinks/pro-table';
import type { SystemLogItem } from '@/pages/Log/System/typings';
import { Tag, Tooltip } from 'antd';
import moment from 'moment';
import BaseService from '@/utils/BaseService';
import { EyeOutlined } from '@ant-design/icons';
import ProTable from '@jetlinks/pro-table';
import SearchComponent from '@/components/SearchComponent';
import Detail from '@/pages/Log/System/Detail';

const service = new BaseService<SystemLogItem>('logger/system');
const System = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [param, setParam] = useState({});
  const [visible, setVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<Partial<SystemLogItem>>({});

  const columns: ProColumns<SystemLogItem>[] = [
    {
      title: intl.formatMessage({
        id: 'pages.table.name',
        defaultMessage: '名称',
      }),
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '日志级别',
      dataIndex: 'level',
      width: 80,
      render: (text) => <Tag color={text === 'ERROR' ? 'red' : 'orange'}>{text}</Tag>,
      valueType: 'select',
      valueEnum: {
        ERROR: {
          text: 'ERROR',
          status: 'ERROR',
        },
        INFO: {
          text: 'INFO',
          status: 'INFO',
        },
        DEBUG: {
          text: 'DEBUG',
          status: 'DEBUG',
        },
        WARN: {
          text: 'WARN',
          status: 'WARN',
        },
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.log.system.logContent',
        defaultMessage: '日志内容',
      }),
      dataIndex: 'exceptionStack',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.log.system.serviceName',
        defaultMessage: '服务名',
      }),
      dataIndex: 'context.server',
      width: 150,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.log.system.creationTime',
        defaultMessage: '创建时间',
      }),
      dataIndex: 'createTime',
      width: 200,
      sorter: true,
      ellipsis: true,
      valueType: 'dateTime',
      defaultSortOrder: 'descend',
      renderText: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: intl.formatMessage({
        id: 'pages.data.option',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      align: 'center',
      width: 200,
      render: (text, record) => [
        <a
          key="editable"
          onClick={() => {
            setVisible(true);
            setCurrent(record);
          }}
        >
          <Tooltip title="查看">
            <EyeOutlined />
          </Tooltip>
        </a>,
      ],
    },
  ];
  return (
    <>
      <SearchComponent<SystemLogItem>
        field={columns}
        target="system-log"
        onSearch={(data) => {
          actionRef.current?.reset?.();
          setParam(data);
        }}
      />
      <ProTable<SystemLogItem>
        columns={columns}
        params={param}
        request={async (params) =>
          service.query({ ...params, sorts: [{ name: 'createTime', order: 'desc' }] })
        }
        defaultParams={{ sorts: [{ createTime: 'desc' }] }}
        search={false}
        actionRef={actionRef}
      />
      {visible && (
        <Detail
          data={current}
          close={() => {
            setVisible(false);
            setCurrent({});
          }}
        />
      )}
    </>
  );
};
export default System;
