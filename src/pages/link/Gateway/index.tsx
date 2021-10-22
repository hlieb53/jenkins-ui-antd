import {PageContainer} from '@ant-design/pro-layout';
import type {GatewayItem} from '@/pages/link/Gateway/typings';
import {useEffect, useRef} from 'react';
import type {ActionType, ProColumns} from '@jetlinks/pro-table';
import {Tooltip} from 'antd';
import {
  ArrowDownOutlined,
  BarsOutlined,
  BugOutlined,
  EditOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import BaseCrud from '@/components/BaseCrud';
import {useIntl} from '@@/plugin-locale/localeExports';
import {ISchema} from "@formily/json-schema";
import Service from "@/pages/link/Gateway/service";
import linkService from "@/pages/link/service";
import GatewayModel from "@/pages/link/Gateway/model";

export const service = new Service('network/config');

const Gateway = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<GatewayItem>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      dataIndex: 'name',
      title: intl.formatMessage({
        id: 'pages.table.name',
        defaultMessage: '名称',
      }),
    },
    {
      dataIndex: 'type',
      title: intl.formatMessage({
        id: 'pages.link.type',
        defaultMessage: '类型',
      }),
    },
    {
      dataIndex: 'state',
      title: intl.formatMessage({
        id: 'pages.searchTable.titleStatus',
        defaultMessage: '状态',
      }),
      render: (text, record) => record.state.value,
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
        <a onClick={() => console.log(record)}>
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.edit',
              defaultMessage: '编辑',
            })}
          >
            <EditOutlined/>
          </Tooltip>
        </a>,
        <a>
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.remove',
              defaultMessage: '删除',
            })}
          >
            <MinusOutlined/>
          </Tooltip>
        </a>,
        <a>
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.download',
              defaultMessage: '下载配置',
            })}
          >
            <ArrowDownOutlined/>
          </Tooltip>
        </a>,
        <a>
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.notice.option.debug',
              defaultMessage: '调试',
            })}
          >
            <BugOutlined/>
          </Tooltip>
        </a>,
        <a>
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.record',
              defaultMessage: '通知记录',
            })}
          >
            <BarsOutlined/>
          </Tooltip>
        </a>,
      ],
    },
  ];

  const getProviders = () => {
    linkService.getProviders().subscribe(data => {
      GatewayModel.provider = data;
    });
  }

  useEffect(() => {
    getProviders();
  }, []);

  const schema: ISchema = {
    type: 'object',
    properties: {
      name: {},
      type: {
        title: '类型',
        'x-component': 'Select',
        enum: GatewayModel.provider
      },
      network: {},
      description: {}
    }
  };

  return (
    <PageContainer>
      <BaseCrud
        columns={columns}
        service={service}
        title={intl.formatMessage({
          id: 'pages.link.gateway',
          defaultMessage: '设备网关',
        })}
        schema={schema}
        actionRef={actionRef}
      />
    </PageContainer>
  );
};
export default Gateway;
