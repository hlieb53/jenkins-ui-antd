// 部门管理
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import ProTable from '@jetlinks/pro-table';
import { useEffect, useRef, useState } from 'react';
import { Link, useIntl, useLocation } from 'umi';
import { Button, message, Popconfirm, Tooltip } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  MedicineBoxOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import Service from '@/pages/system/Department/service';
import type { ISchema } from '@formily/json-schema';
import type { DepartmentItem } from '@/pages/system/Department/typings';
import { observer } from '@formily/react';
import { model } from '@formily/reactive';
import Save from './save';
import SearchComponent from '@/components/SearchComponent';

export const service = new Service('organization');

type ModelType = {
  visible: boolean;
  current: Partial<DepartmentItem>;
  parentId: string | undefined;
};
export const State = model<ModelType>({
  visible: false,
  current: {},
  parentId: undefined,
});

export default observer(() => {
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const [param, setParam] = useState({});

  /**
   * 根据部门ID删除数据
   * @param id
   */
  const deleteItem = async (id: string) => {
    const response: any = await service.remove(id);
    if (response.status === 200) {
      message.success(
        intl.formatMessage({
          id: 'pages.data.option.success',
          defaultMessage: '操作成功!',
        }),
      );
    }
    actionRef.current?.reload();
  };

  const columns: ProColumns<DepartmentItem>[] = [
    {
      title: intl.formatMessage({
        id: 'pages.table.name',
        defaultMessage: '名称',
      }),
      dataIndex: 'name',
    },
    {
      title: intl.formatMessage({
        id: 'pages.device.instanceDetail.detail.sort',
        defaultMessage: '排序',
      }),
      search: false,
      valueType: 'digit',
      dataIndex: 'sortIndex',
    },
    {
      title: intl.formatMessage({
        id: 'pages.data.option',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      align: 'center',
      width: 240,
      render: (text, record) => [
        <a
          key="editable"
          onClick={() => {
            State.current = record;
            State.visible = true;
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
        <a
          key="editable"
          onClick={() => {
            State.current = {
              parentId: record.id,
            };
            State.visible = true;
          }}
        >
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.system.department.option.add',
              defaultMessage: '新增子部门',
            })}
          >
            <PlusCircleOutlined />
          </Tooltip>
        </a>,
        <Link key="assets" to={`/system/department/${record.id}/assets`}>
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.assets',
              defaultMessage: '资产分配',
            })}
          >
            <MedicineBoxOutlined />
          </Tooltip>
        </Link>,
        <Link key="user" to={`/system/department/${record.id}/user`}>
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.system.department.user',
              defaultMessage: '用户',
            })}
          >
            <TeamOutlined />
          </Tooltip>
        </Link>,
        <Popconfirm
          key="unBindUser"
          title={intl.formatMessage({
            id: 'pages.system.role.option.delete',
            defaultMessage: '确定要删除吗',
          })}
          onConfirm={() => {
            deleteItem(record.id);
          }}
        >
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.delete',
              defaultMessage: '删除',
            })}
          >
            <a key="delete">
              <DeleteOutlined />
            </a>
          </Tooltip>
        </Popconfirm>,
      ],
    },
  ];

  const schema: ISchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: intl.formatMessage({
          id: 'pages.table.name',
          defaultMessage: '名称',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-validator': [
          {
            max: 64,
            message: '最多可输入64个字符',
          },
          {
            required: true,
            message: '请输入名称',
          },
        ],
      },
      sortIndex: {
        type: 'string',
        title: intl.formatMessage({
          id: 'pages.device.instanceDetail.detail.sort',
          defaultMessage: '排序',
        }),
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
        'x-validator': [
          {
            pattern: /^[0-9]*[1-9][0-9]*$/,
            message: '请输入大于0的整数',
          },
        ],
      },
    },
  };

  const location = useLocation();

  useEffect(() => {
    if ((location as any).query?.save === 'true') {
      State.visible = true;
    }
    /* eslint-disable */
  }, []);

  return (
    <PageContainer>
      <SearchComponent<DepartmentItem>
        field={columns}
        defaultParam={[{ column: 'typeId', value: 'org', termType: 'eq' }]}
        onSearch={async (data) => {
          // 重置分页数据
          actionRef.current?.reset?.();
          setParam(data);
        }}
        onReset={() => {
          // 重置分页及搜索参数
          actionRef.current?.reset?.();
          setParam({});
        }}
        target="department"
      />
      <ProTable<DepartmentItem>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const response = await service.queryOrgThree({
            paging: false,
            ...params,
            sorts: [{ name: 'createTime', order: 'desc' }],
          });
          return {
            code: response.message,
            result: {
              data: response.result,
              pageIndex: 0,
              pageSize: 0,
              total: 0,
            },
            status: response.status,
          };
        }}
        rowKey="id"
        pagination={false}
        search={false}
        params={param}
        toolBarRender={() => [
          <Button
            onClick={() => (State.visible = true)}
            key="button"
            icon={<PlusOutlined />}
            type="primary"
          >
            {intl.formatMessage({
              id: 'pages.data.option.add',
              defaultMessage: '新增',
            })}
          </Button>,
        ]}
        headerTitle={intl.formatMessage({
          id: 'pages.system.department',
          defaultMessage: '部门列表',
        })}
      />
      <Save<DepartmentItem>
        title={
          State.current.parentId
            ? intl.formatMessage({
                id: 'pages.system.department.option.add',
                defaultMessage: '新增子部门',
              })
            : undefined
        }
        service={service}
        onCancel={(type) => {
          if (type) {
            actionRef.current?.reload();
          }
          State.current = {};
          State.visible = false;
        }}
        data={State.current}
        visible={State.visible}
        schema={schema}
      />
    </PageContainer>
  );
});
