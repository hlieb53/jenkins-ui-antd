import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import {
  ArrowDownOutlined,
  BarsOutlined,
  BugOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SmallDashOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu, Space, Upload } from 'antd';
import { useRef, useState } from 'react';
import { useIntl } from '@@/plugin-locale/localeExports';
import { downloadObject, onlyMessage } from '@/utils/util';
import Service from '@/pages/notice/Config/service';
import { observer } from '@formily/react';
import SearchComponent from '@/components/SearchComponent';
import { getMenuPathByParams, MENUS_CODE } from '@/utils/menu';
import { history } from 'umi';
import { model } from '@formily/reactive';
import { PermissionButton, ProTableCard } from '@/components';
import NoticeConfig from '@/components/ProTableCard/CardItems/noticeConfig';
import Debug from '@/pages/notice/Config/Debug';
import Log from '@/pages/notice/Config/Log';
import { providerObj, typeList, typeObj } from '@/components/ProTableCard/CardItems/noticeTemplate';
import usePermissions from '@/hooks/permission';
import SyncUser from '@/pages/notice/Config/SyncUser';

export const service = new Service('notifier/config');

export const state = model<{
  current?: ConfigItem;
  debug?: boolean;
  log?: boolean;
  syncUser: boolean;
}>({
  debug: false,
  log: false,
  syncUser: false,
});

const Config = observer(() => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  // const location = useLocation<{ id: string }>();

  const { permission: configPermission } = usePermissions('notice/Config');
  // const id = (location as any).query?.id;

  const columns: ProColumns<ConfigItem>[] = [
    {
      dataIndex: 'name',
      title: '配置名称',
      ellipsis: true,
      fixed: 'left',
      width: '25%',
    },
    {
      dataIndex: 'type',
      title: '通知方式',
      renderText: (text, record) => typeObj?.[record.type]?.text || record.type,
      valueType: 'select',
      valueEnum: typeObj,
    },
    {
      dataIndex: 'provider',
      title: '类型',
      renderText: (text, record) => {
        return typeList[record?.type][record?.provider];
      },
      valueType: 'select',
      valueEnum: providerObj,
    },
    {
      dataIndex: 'description',
      ellipsis: true,
      title: '说明',
    },
    {
      title: intl.formatMessage({
        id: 'pages.data.option',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (text, record) => [
        (record.provider === 'dingTalkMessage' || record.provider === 'corpMessage') && (
          <PermissionButton
            tooltip={{
              title: '同步用户',
            }}
            style={{ padding: 0 }}
            type="link"
            isPermission={configPermission.bind}
            onClick={() => {
              state.syncUser = true;
              state.current = record;
            }}
          >
            <TeamOutlined />
          </PermissionButton>
        ),
        <PermissionButton
          key="edit"
          type="link"
          style={{ padding: 0 }}
          isPermission={configPermission.update}
          onClick={async () => {
            // setLoading(true);
            state.current = record;
            history.push(getMenuPathByParams(MENUS_CODE['notice/Config/Detail'], record.id));
          }}
          tooltip={{
            title: intl.formatMessage({
              id: 'pages.data.option.edit',
              defaultMessage: '编辑',
            }),
          }}
        >
          <EditOutlined />
        </PermissionButton>,
        <PermissionButton
          type="link"
          style={{ padding: 0 }}
          isPermission={configPermission.export}
          onClick={() => downloadObject(record, `通知配置_${record.name}`)}
          key="download"
          tooltip={{
            title: intl.formatMessage({
              id: 'pages.data.option.export',
              defaultMessage: '导出',
            }),
          }}
        >
          <ArrowDownOutlined />
        </PermissionButton>,
        <PermissionButton
          type="link"
          style={{ padding: 0 }}
          isPermission={configPermission.debug}
          key="debug"
          onClick={() => {
            state.debug = true;
            state.current = record;
          }}
          tooltip={{
            title: intl.formatMessage({
              id: 'pages.notice.option.debug',
              defaultMessage: '调试',
            }),
          }}
        >
          <BugOutlined />
        </PermissionButton>,
        <PermissionButton
          type="link"
          style={{ padding: 0 }}
          isPermission={configPermission.log}
          key="record"
          onClick={() => {
            state.log = true;
          }}
          tooltip={{
            title: intl.formatMessage({
              id: 'pages.data.option.record',
              defaultMessage: '通知记录',
            }),
          }}
        >
          <BarsOutlined />
        </PermissionButton>,
        <PermissionButton
          style={{ padding: 0 }}
          type="link"
          isPermission={configPermission.delete}
          popConfirm={{
            onConfirm: async () => {
              await service.remove(record.id);
              onlyMessage(
                intl.formatMessage({
                  id: 'pages.data.option.success',
                  defaultMessage: '操作成功!',
                }),
              );
              actionRef.current?.reload();
            },
            title: '确认删除',
          }}
          tooltip={{
            title: intl.formatMessage({
              id: 'pages.data.option.remove',
              defaultMessage: '删除',
            }),
          }}
          key="remove"
        >
          <DeleteOutlined />
        </PermissionButton>,
      ],
    },
  ];

  const [param, setParam] = useState({});
  return (
    <PageContainer>
      <SearchComponent
        // defaultParam={[{ column: 'type$IN', value: id }]}
        field={columns}
        onSearch={(data) => {
          actionRef.current?.reset?.();
          setParam(data);
        }}
      />
      <ProTableCard<ConfigItem>
        rowKey="id"
        actionRef={actionRef}
        search={false}
        params={param}
        columnEmptyText={''}
        columns={columns}
        scroll={{ x: 1366 }}
        headerTitle={
          <Space>
            <PermissionButton
              isPermission={configPermission.add}
              onClick={() => {
                state.current = undefined;
                history.push(getMenuPathByParams(MENUS_CODE['notice/Config/Detail']));
              }}
              key="button"
              icon={<PlusOutlined />}
              type="primary"
            >
              {intl.formatMessage({
                id: 'pages.data.option.add',
                defaultMessage: '新增',
              })}
            </PermissionButton>
            <Upload
              disabled={!configPermission.import}
              key={'import'}
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = async (result) => {
                  const text = result.target?.result as string;
                  if (!file.type.includes('json')) {
                    onlyMessage('文件内容格式错误', 'warning');
                    return;
                  }
                  try {
                    const data = JSON.parse(text || '{}');
                    const res: any = await service.savePatch(data);
                    if (res.status === 200) {
                      onlyMessage('操作成功');
                      actionRef.current?.reload();
                    }
                  } catch {
                    onlyMessage('文件内容格式错误', 'warning');
                  }
                };
                return false;
              }}
            >
              <PermissionButton isPermission={configPermission.import} style={{ marginLeft: 12 }}>
                导入
              </PermissionButton>
            </Upload>
            <PermissionButton
              popConfirm={{
                title: '确认导出当前页数据？',
                onConfirm: async () => {
                  const resp: any = await service.queryNoPagingPost({ ...param, paging: false });
                  if (resp.status === 200) {
                    downloadObject(resp.result, '通知配置数据');
                    onlyMessage('导出成功');
                  } else {
                    onlyMessage('导出错误', 'error');
                  }
                },
              }}
              isPermission={configPermission.export}
            >
              导出
            </PermissionButton>
          </Space>
        }
        // gridColumn={3}
        gridColumns={[2, 2, 3]}
        request={async (params) =>
          service.query({ ...params, sorts: [{ name: 'createTime', order: 'desc' }] })
        }
        cardRender={(record) => (
          <NoticeConfig
            {...record}
            detail={
              <div
                style={{ fontSize: 18, padding: 8 }}
                onClick={() => {
                  state.current = record;
                  history.push(getMenuPathByParams(MENUS_CODE['notice/Config/Detail'], record.id));
                }}
              >
                <EyeOutlined />
              </div>
            }
            actions={[
              // (record.provider === 'dingTalkMessage' || record.provider === 'corpMessage') && (
              //   <PermissionButton
              //     key="syncUser"
              //     isPermission={true}
              //     type="link"
              //     onClick={() => {
              //       state.syncUser = true;
              //       state.current = record;
              //     }}
              //   >
              //     <TeamOutlined />
              //     同步用户
              //   </PermissionButton>
              // ),
              <PermissionButton
                isPermission={configPermission.update}
                type={'link'}
                key="edit"
                onClick={async () => {
                  state.current = record;
                  history.push(getMenuPathByParams(MENUS_CODE['notice/Config/Detail'], record.id));
                }}
              >
                <EditOutlined />
                编辑
              </PermissionButton>,
              <PermissionButton
                type={'link'}
                key="debug"
                isPermission={configPermission.debug}
                onClick={() => {
                  state.debug = true;
                  state.current = record;
                }}
              >
                <BugOutlined />
                调试
              </PermissionButton>,
              <PermissionButton
                type={'link'}
                key="log"
                isPermission={configPermission.log}
                onClick={() => {
                  state.log = true;
                  state.current = record;
                }}
              >
                <UnorderedListOutlined />
                通知记录
              </PermissionButton>,
              <Dropdown
                key={'more'}
                placement="bottom"
                overlay={
                  <Menu>
                    <Menu.Item key="export">
                      <PermissionButton
                        type={'link'}
                        key="export"
                        isPermission={configPermission.export}
                        onClick={() => downloadObject(record, `通知配置_${record.name}`)}
                      >
                        <ArrowDownOutlined />
                        导出
                      </PermissionButton>
                    </Menu.Item>
                    {(record.provider === 'dingTalkMessage' ||
                      record.provider === 'corpMessage') && (
                      <Menu.Item key="syncUser">
                        <PermissionButton
                          key="syncUser"
                          isPermission={configPermission.bind}
                          type="link"
                          onClick={() => {
                            state.syncUser = true;
                            state.current = record;
                          }}
                        >
                          <TeamOutlined />
                          同步用户
                        </PermissionButton>
                      </Menu.Item>
                    )}
                  </Menu>
                }
              >
                <PermissionButton type={'link'} isPermission={true} key="other">
                  <SmallDashOutlined />
                  其他
                </PermissionButton>
              </Dropdown>,
              <PermissionButton
                key="delete"
                isPermission={configPermission.delete}
                popConfirm={{
                  title: '确认删除？',
                  onConfirm: async () => {
                    await service.remove(record.id);
                    actionRef.current?.reset?.();
                  },
                }}
                type={'link'}
              >
                <DeleteOutlined />
              </PermissionButton>,
            ]}
          />
        )}
      />
      <Debug />
      {state.log && <Log />}
      {state.syncUser && <SyncUser />}
    </PageContainer>
  );
});
export default Config;
