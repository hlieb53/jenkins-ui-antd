import { PageContainer } from '@ant-design/pro-layout';
import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import {
  ArrowDownOutlined,
  BugOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, message, Popconfirm, Space, Tooltip, Upload } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import Service from '@/pages/notice/Template/service';
import ConfigService from '@/pages/notice/Config/service';
import SearchComponent from '@/components/SearchComponent';
import { history, useLocation } from 'umi';
import { getMenuPathByParams, MENUS_CODE } from '@/utils/menu';
import { model } from '@formily/reactive';
import Debug from './Debug';
import Log from '@/pages/notice/Template/Log';
import { downloadObject } from '@/utils/util';
import moment from 'moment';
import { ProTableCard } from '@/components';
import NoticeCard, { typeList } from '@/components/ProTableCard/CardItems/noticeTemplate';

export const service = new Service('notifier/template');

export const configService = new ConfigService('notifier/config');
export const state = model<{
  current?: TemplateItem;
  debug?: boolean;
  log?: boolean;
}>({
  debug: false,
  log: false,
});
const Template = () => {
  const intl = useIntl();
  const location = useLocation<{ id: string }>();
  const id = (location as any).query?.id;
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<TemplateItem>[] = [
    {
      dataIndex: 'name',
      title: '模版名称',
    },
    {
      dataIndex: 'provider',
      title: '通知方式',
      renderText: (text, record) => typeList[record.type][record.provider],
    },
    {
      dataIndex: 'description',
      title: '说明',
      // valueType: 'dateTime',
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
          key="edit"
          onClick={() => {
            state.current = record;
            history.push(getMenuPathByParams(MENUS_CODE['notice/Template/Detail'], id));
          }}
        >
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.edit',
              defaultMessage: '编辑',
            })}
          >
            <EditOutlined />
          </Tooltip>
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除？"
          onConfirm={async () => {
            await service.remove(record.id);
            actionRef.current?.reload();
          }}
        >
          <a key="delete">
            <Tooltip
              title={intl.formatMessage({
                id: 'pages.data.option.remove',
                defaultMessage: '删除',
              })}
            >
              <DeleteOutlined />
            </Tooltip>
          </a>
        </Popconfirm>,
        <a
          key="download"
          onClick={() => {
            downloadObject(
              record,
              `${record.name}-${moment(new Date()).format('YYYY/MM/DD HH:mm:ss')}`,
            );
          }}
        >
          <Tooltip title="导出">
            <ArrowDownOutlined />
          </Tooltip>
        </a>,
        <a
          key="debug"
          onClick={() => {
            state.debug = true;
            state.current = record;
          }}
        >
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.notice.option.debug',
              defaultMessage: '调试',
            })}
          >
            <BugOutlined />
          </Tooltip>
        </a>,
        <a
          key="log"
          onClick={() => {
            state.log = true;
          }}
        >
          <Tooltip title="通知记录">
            <UnorderedListOutlined />
          </Tooltip>
        </a>,
      ],
    },
  ];

  const [param, setParam] = useState({});
  return (
    <PageContainer>
      <SearchComponent
        defaultParam={[{ column: 'type$IN', value: id }]}
        field={columns}
        onSearch={(data) => {
          actionRef.current?.reset?.();
          setParam(data);
        }}
      />
      <ProTableCard<TemplateItem>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        params={param}
        columns={columns}
        headerTitle={
          <Space>
            <Button
              onClick={() => {
                state.current = undefined;
                history.push(getMenuPathByParams(MENUS_CODE['notice/Template/Detail'], id));
              }}
              key="button"
              icon={<PlusOutlined />}
              type="primary"
            >
              {intl.formatMessage({
                id: 'pages.data.option.add',
                defaultMessage: '新增',
              })}
            </Button>
            <Upload
              key={'import'}
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = async (result) => {
                  const text = result.target?.result as string;
                  if (!file.type.includes('json')) {
                    message.warning('文件内容格式错误');
                    return;
                  }
                  try {
                    const data = JSON.parse(text || '{}');
                    const res: any = await service.savePatch(data);
                    if (res.status === 200) {
                      message.success('操作成功');
                      actionRef.current?.reload();
                    }
                  } catch {
                    message.warning('文件内容格式错误');
                  }
                };
                return false;
              }}
            >
              <Button style={{ marginLeft: 12 }}>导入</Button>
            </Upload>
            <Popconfirm
              title={'确认导出当前页数据？'}
              onConfirm={async () => {
                const resp: any = await service.queryNoPagingPost({ ...param, paging: false });
                if (resp.status === 200) {
                  downloadObject(resp.result, '通知模版数据');
                  message.success('导出成功');
                } else {
                  message.error('导出错误');
                }
              }}
            >
              <Button>导出</Button>
            </Popconfirm>
          </Space>
        }
        gridColumn={3}
        cardRender={(record) => (
          <NoticeCard
            {...record}
            type={id}
            actions={[
              <Button
                key="edit"
                onClick={() => {
                  state.current = record;
                  history.push(getMenuPathByParams(MENUS_CODE['notice/Template/Detail'], id));
                }}
              >
                <EditOutlined />
                编辑
              </Button>,
              <Button
                key="debug"
                onClick={() => {
                  state.debug = true;
                  state.current = record;
                }}
              >
                <BugOutlined />
                调试
              </Button>,
              <Button
                key="export"
                onClick={() => {
                  downloadObject(
                    record,
                    `${record.name}-${moment(new Date()).format('YYYY/MM/DD HH:mm:ss')}`,
                  );
                }}
              >
                <ArrowDownOutlined />
                导出
              </Button>,
              <Button
                key="log"
                onClick={() => {
                  state.log = true;
                }}
              >
                <UnorderedListOutlined />
                通知记录
              </Button>,
              <Popconfirm
                key="delete"
                title="确认删除？"
                onConfirm={async () => {
                  await service.remove(record.id);
                  actionRef.current?.reset?.();
                }}
              >
                <Button key="delete">
                  <DeleteOutlined />
                </Button>
              </Popconfirm>,
            ]}
          />
        )}
        request={async (params) =>
          service.query({ ...params, sorts: [{ name: 'createTime', order: 'desc' }] })
        }
      />
      <Debug />
      <Log />
    </PageContainer>
  );
};
export default Template;
