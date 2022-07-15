import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import ProTable from '@jetlinks/pro-table';
import { Button, Popconfirm, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { useIntl } from '@@/plugin-locale/localeExports';
import { EditOutlined, EyeOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useHistory } from 'umi';
import { model } from '@formily/reactive';
import { observer } from '@formily/react';
import type { FirmwareItem } from '@/pages/device/Firmware/typings';
import Save from './Save';
import { onlyMessage } from '@/utils/util';
import { PermissionButton } from '@/components';
import useDomFullHeight from '@/hooks/document/useDomFullHeight';
import usePermissions from '@/hooks/permission';
import SearchComponent from '@/components/SearchComponent';
import { getMenuPathByParams, MENUS_CODE } from '@/utils/menu';
import { service } from '@/pages/device/Firmware';

export const state = model<{
  current?: FirmwareItem;
  visible: boolean;
}>({
  visible: false,
});
const Task = observer(() => {
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const { minHeight } = useDomFullHeight(`.firmware-task`, 24);
  const { permission } = usePermissions('device/Firmware');
  const [param, setParam] = useState({});
  const history = useHistory<Record<string, string>>();

  const columns: ProColumns<FirmwareItem>[] = [
    {
      title: '任务名称',
      ellipsis: true,
      dataIndex: 'name',
    },
    {
      title: '推送方式',
      ellipsis: true,
      dataIndex: 'version',
    },
    {
      title: intl.formatMessage({
        id: 'pages.table.description',
        defaultMessage: '说明',
      }),
      ellipsis: true,
      align: 'center',
      dataIndex: 'description',
    },
    {
      title: '完成比例',
      ellipsis: true,
      dataIndex: 'signMethod',
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
        <Link
          onClick={() => {
            state.current = record;
          }}
          to={`/device/firmware/detail/${record.id}`}
          key="link"
        >
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.detail',
              defaultMessage: '查看',
            })}
            key={'detail'}
          >
            <EyeOutlined />
          </Tooltip>
        </Link>,
        <a
          key="editable"
          onClick={() => {
            state.visible = true;
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
        <a key="delete">
          <Popconfirm
            title={intl.formatMessage({
              id: 'pages.data.option.remove.tips',
              defaultMessage: '确认删除？',
            })}
            onConfirm={async () => {
              await service.remove(record.id);
              onlyMessage(
                intl.formatMessage({
                  id: 'pages.data.option.success',
                  defaultMessage: '操作成功!',
                }),
              );
              actionRef.current?.reload();
            }}
          >
            <Tooltip
              title={intl.formatMessage({
                id: 'pages.data.option.remove',
                defaultMessage: '删除',
              })}
            >
              <MinusOutlined />
            </Tooltip>
          </Popconfirm>
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <SearchComponent<FirmwareItem>
        field={columns}
        target="firmware-task"
        onSearch={(data) => {
          // 重置分页数据
          actionRef.current?.reset?.();
          setParam(data);
        }}
      />
      <ProTable<FirmwareItem>
        scroll={{ x: 1366 }}
        tableClassName={'firmware-task'}
        tableStyle={{ minHeight }}
        search={false}
        params={param}
        headerTitle={
          <div>
            <PermissionButton
              onClick={() => {
                state.visible = true;
              }}
              isPermission={permission.add}
              key="button"
              icon={<PlusOutlined />}
              type="primary"
            >
              {intl.formatMessage({
                id: 'pages.data.option.add',
                defaultMessage: '新增',
              })}
            </PermissionButton>
            <Button
              onClick={() => {
                const url = getMenuPathByParams(MENUS_CODE['device/Firmware/Task/Detail'], '123');
                history.push(url);
              }}
            >
              详情
            </Button>
          </div>
        }
        request={async (params) =>
          service.query({ ...params, sorts: [{ name: 'createTime', order: 'desc' }] })
        }
        columns={columns}
        actionRef={actionRef}
      />
      <Save
        data={state.current}
        visible={state.visible}
        close={() => {
          state.visible = false;
        }}
      />
    </PageContainer>
  );
});
export default Task;
