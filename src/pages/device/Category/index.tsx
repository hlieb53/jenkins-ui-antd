import {PageContainer} from '@ant-design/pro-layout';
import Service from '@/pages/device/Category/service';
import type {ActionType, ProColumns} from '@jetlinks/pro-table';
import ProTable from '@jetlinks/pro-table';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, message, Popconfirm, Tooltip} from 'antd';
import {useRef, useState} from 'react';
import {useIntl} from '@@/plugin-locale/localeExports';
import Save from '@/pages/device/Category/Save';
import {model} from '@formily/reactive';
import {observer} from '@formily/react';
import type {Response} from '@/utils/typings';
import SearchComponent from '@/components/SearchComponent';
import {getButtonPermission} from '@/utils/menu';

export const service = new Service('device/category');

export const state = model<{
  visible: boolean;
  current: Partial<CategoryItem>;
  parentId: string | undefined;
}>({
  visible: false,
  current: {},
  parentId: undefined,
});

export const getSortIndex = (data: CategoryItem[], pId?: string): number => {
  let sortIndex = 0;
  if (data.length) {
    if (!pId) {
      return data.sort((a, b) => b.sortIndex - a.sortIndex)[0].sortIndex + 1;
    }
    data.some((department) => {
      if (department.id === pId && department.children) {
        const sortArray = department.children.sort((a, b) => b.sortIndex - a.sortIndex);
        sortIndex = sortArray[0].sortIndex + 1;
        return true;
      } else if (department.children) {
        sortIndex = getSortIndex(department.children, pId);
        return !!sortIndex;
      }
      return false;
    });
  }
  return sortIndex;
};

const Category = observer(() => {
  const actionRef = useRef<ActionType>();
  const [param, setParam] = useState({});
  const [sortParam, setSortParam] = useState<any>({ name: 'sortIndex', order: 'asc' });
  const [treeData, setTreeData] = useState<any[]>([]);

  const intl = useIntl();

  const columns: ProColumns<CategoryItem>[] = [
    {
      title: intl.formatMessage({
        id: 'pages.device.category.name',
        defaultMessage: '分类名称',
      }),
      dataIndex: 'name',
    },
    {
      title: '分类排序',
      dataIndex: 'sortIndex',
      valueType: 'digit',
      sorter: true,
      // render: (text) => (
      //   <Space>{text}<EditOutlined onClick={() => {

      //   }} /></Space>
      // )
    },
    {
      title: intl.formatMessage({
        id: 'pages.table.description',
        defaultMessage: '说明',
      }),
      dataIndex: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.data.option',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      width: 200,
      render: (text, record) => [
        <Button
          key={'edit'}
          onClick={() => {
            state.visible = true;
            state.current = record;
          }}
          type="link"
          style={{ padding: 0 }}
          disabled={getButtonPermission('device/Category', ['update', 'add'])}
        >
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.edit',
              defaultMessage: '编辑',
            })}
          >
            <EditOutlined />
          </Tooltip>
        </Button>,
        <Button
          type="link"
          style={{ padding: 0 }}
          key={'add-next'}
          onClick={() => {
            state.visible = true;
            const sortIndex = getSortIndex(treeData, record.id);
            state.parentId = record.id;
            state.current = {
              sortIndex,
            };
          }}
          disabled={getButtonPermission('device/Category', ['update', 'add'])}
        >
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.device.category.addClass',
              defaultMessage: '添加子分类',
            })}
          >
            <PlusOutlined />
          </Tooltip>
        </Button>,
        <Button
          disabled={getButtonPermission('device/Category', ['delete'])}
          type="link"
          style={{ padding: 0 }}
          key={'delete'}
        >
          <Popconfirm
            onConfirm={async () => {
              const resp = (await service.remove(record.id)) as Response<any>;
              if (resp.status === 200) {
                message.success('操作成功');
              } else {
                message.error('操作失败');
              }
              actionRef.current?.reload();
            }}
            title={'确认删除吗？'}
          >
            <Tooltip
              title={intl.formatMessage({
                id: 'pages.data.option.remove',
                defaultMessage: '删除',
              })}
            >
              <DeleteOutlined />
            </Tooltip>
          </Popconfirm>
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <SearchComponent
        field={columns}
        onSearch={(data) => {
          setParam(data);
        }}
        target="category"
      />
      <ProTable
        params={param}
        search={false}
        request={async (params) => {
          const response = await service.queryTree({
            paging: false,
            sorts: [sortParam],
            ...params,
          });
          setTreeData(response.result);
          return {
            code: response.message,
            result: {
              data: response.result as CategoryItem[],
              pageIndex: 0,
              pageSize: 0,
              total: 0,
            },
            status: response.status,
          };
        }}
        rowKey="id"
        columns={columns}
        onChange={(_, f, sorter: any) => {
          if (sorter.order) {
            setSortParam({ name: sorter.columnKey, order: sorter.order.replace('end', '') });
          } else {
            setSortParam({ name: 'sortIndex', value: 'asc' });
          }
        }}
        headerTitle={
          <Button
            disabled={getButtonPermission('device/Category', ['add'])}
            onClick={() => {
              const sortIndex = getSortIndex(treeData, '');
              state.current = {
                sortIndex,
              };
              state.visible = true;
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
        }
        pagination={false}
        actionRef={actionRef}
      />
      <Save
        data={state.current}
        visible={state.visible}
        close={() => {
          state.visible = false;
          state.current = {};
          state.parentId = undefined;
        }}
        reload={() => {
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
});

export default Category;
