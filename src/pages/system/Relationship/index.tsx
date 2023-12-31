import SearchComponent from '@/components/SearchComponent';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import ProTable from '@jetlinks/pro-table';
import { useRef, useState } from 'react';
import Service from '@/pages/system/Relationship/service';
import { PageContainer } from '@ant-design/pro-layout';
import { PermissionButton } from '@/components';
import { useIntl } from 'umi';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Save from './Save';
import { useDomFullHeight } from '@/hooks';
import { onlyMessage } from '@/utils/util';
import { message } from 'antd';

export const service = new Service('relation');

const Relationship = () => {
  const intl = useIntl();
  const [param, setParam] = useState<any>({});
  const [current, setCurrent] = useState<Partial<ReationItem>>({});
  const [visible, setVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const { permission } = PermissionButton.usePermission('system/Relationship');
  const { minHeight } = useDomFullHeight(`.relation`, 24);

  const columns: ProColumns<ReationItem>[] = [
    {
      dataIndex: 'name',
      title: '名称',
      ellipsis: true,
      fixed: 'left',
      width: '20%',
    },
    {
      dataIndex: 'objectTypeName',
      title: '关联方',
      ellipsis: true,
      valueType: 'select',
      request: async () => {
        const res = await service.getTypes();
        if (res.status === 200) {
          return res.result.map((item: any) => ({ label: item.name, value: item.name }));
        }
        return [];
      },
    },
    {
      dataIndex: 'targetType',
      title: '被关联方',
      ellipsis: true,
      valueType: 'select',
      render: (_, row) => {
        return row.targetTypeName;
      },
      valueEnum: {
        user: {
          text: '用户',
          status: 'user',
        },
      },
    },
    {
      dataIndex: 'description',
      title: '说明',
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      align: 'left',
      width: 200,
      fixed: 'right',
      render: (text, record) => [
        <PermissionButton
          isPermission={permission.update}
          key="warning"
          onClick={() => {
            setVisible(true);
            setCurrent(record);
          }}
          type={'link'}
          style={{ padding: 0 }}
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
          isPermission={permission.delete}
          style={{ padding: 0 }}
          tooltip={{
            title: '删除',
          }}
          popConfirm={{
            title: '确认删除',
            onConfirm: async () => {
              const resp: any = await service.remove(record.id);
              if (resp.status === 200) {
                onlyMessage(
                  intl.formatMessage({
                    id: 'pages.data.option.success',
                    defaultMessage: '操作成功!',
                  }),
                );
                actionRef.current?.reload();
              } else {
                message.error(resp.message);
              }
            },
          }}
          key="button"
          type="link"
        >
          <DeleteOutlined />
        </PermissionButton>,
      ],
    },
  ];

  return (
    <PageContainer>
      <SearchComponent<ReationItem>
        field={columns}
        target="relationship"
        onSearch={(data) => {
          actionRef.current?.reload();
          setParam(data);
        }}
      />
      <ProTable<ReationItem>
        actionRef={actionRef}
        params={param}
        columns={columns}
        search={false}
        rowKey="id"
        columnEmptyText={''}
        scroll={{ x: 1366 }}
        tableClassName={'relation'}
        tableStyle={{ minHeight }}
        request={async (params) => {
          return service.query({ ...params, sorts: [{ name: 'createTime', order: 'desc' }] });
        }}
        headerTitle={[
          <PermissionButton
            isPermission={permission.add}
            key="add"
            onClick={() => {
              setVisible(true);
              setCurrent({});
            }}
            type="primary"
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.data.option.add',
                defaultMessage: '新增',
              }),
            }}
          >
            新增
          </PermissionButton>,
        ]}
      />
      {visible && (
        <Save
          data={current}
          close={() => {
            setVisible(false);
            actionRef.current?.reload();
          }}
        />
      )}
    </PageContainer>
  );
};
export default Relationship;
