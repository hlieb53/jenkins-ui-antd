import { PageContainer } from '@ant-design/pro-layout';
import { Badge, Button, message, Space, Tooltip, Upload } from 'antd';
import type { ProductItem } from '@/pages/device/Product/typings';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons';
import Service from '@/pages/device/Product/service';
import { observer } from '@formily/react';
import { model } from '@formily/reactive';
import { useHistory } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import { useEffect, useRef, useState } from 'react';
import Save from '@/pages/device/Product/Save';
import SearchComponent from '@/components/SearchComponent';
import { getMenuPathByParams, MENUS_CODE } from '@/utils/menu';
import { ProTableCard, AIcon, PermissionButton } from '@/components';
import ProductCard from '@/components/ProTableCard/CardItems/product';
import { downloadObject } from '@/utils/util';

export const service = new Service('device-product');
export const statusMap = {
  1: <Badge status="processing" text="已发布" />,
  0: <Badge status="error" text="未发布" />,
};
export const productModel = model<{
  current: ProductItem | undefined;
}>({
  current: undefined,
});

const Product = observer(() => {
  const [visible, setVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<ProductItem>();
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const [queryParam, setQueryParam] = useState({});
  const history = useHistory<Record<string, string>>();
  const { permission } = PermissionButton.usePermission('device/Product');

  useEffect(() => {
    if (history) {
      const state = history.location.state;
      if (state) {
        setQueryParam({
          terms: history.location.state,
        });
      }
    }
  }, [history]);

  const status = {
    1: (
      <Badge
        status="processing"
        text={intl.formatMessage({
          id: 'pages.system.tenant.assetInformation.published',
          defaultMessage: '已发布',
        })}
      />
    ),
    0: (
      <Badge
        status="error"
        text={intl.formatMessage({
          id: 'pages.system.tenant.assetInformation.unpublished',
          defaultMessage: '未发布',
        })}
      />
    ),
  };

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

  /**
   * table 查询参数
   * @param data
   */
  const searchFn = (data: any) => {
    setQueryParam(data);
  };

  const changeDeploy = (id: string, state: 'deploy' | 'undeploy') => {
    service.changeDeploy(id, state).subscribe((res) => {
      if (res) {
        actionRef?.current?.reload();
      }
    });
  };

  const tools = (record: ProductItem) => [
    <Button
      type={'link'}
      onClick={() => {
        productModel.current = record;
        history.push(`${getMenuPathByParams(MENUS_CODE['device/Product/Detail'], record.id)}`);
      }}
      style={{ padding: 0 }}
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
    </Button>,
    <PermissionButton
      isPermission={permission.update}
      key="warning"
      onClick={() => {
        setCurrent(record);
        setVisible(true);
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
      isPermission={permission.export}
      type={'link'}
      style={{ padding: 0 }}
      tooltip={{
        title: intl.formatMessage({
          id: 'pages.data.option.download',
          defaultMessage: '下载',
        }),
      }}
      onClick={async () => {
        downloadObject(
          record,
          intl.formatMessage({
            id: 'pages.device.product',
            defaultMessage: '产品',
          }),
        );
        message.success('操作成功');
      }}
    >
      <DownloadOutlined />
    </PermissionButton>,
    <PermissionButton
      popConfirm={{
        title: intl.formatMessage({
          id: `pages.data.option.${record.state ? 'disabled' : 'enabled'}.tips`,
          defaultMessage: '是否启用?',
        }),
        onConfirm() {
          changeDeploy(record.id, record.state ? 'undeploy' : 'deploy');
        },
      }}
      tooltip={{
        title: intl.formatMessage({
          id: `pages.data.option.${record.state ? 'disabled' : 'enabled'}`,
          defaultMessage: record.state ? '禁用' : '启用',
        }),
      }}
      style={{ padding: 0 }}
      type={'link'}
      isPermission={permission.action}
    >
      {record.state ? <StopOutlined /> : <AIcon type={'icon-fabu'} />}
    </PermissionButton>,
    <PermissionButton
      key="unBindUser"
      type={'link'}
      style={{ padding: 0 }}
      isPermission={permission.delete}
      disabled={record.state === 1}
      popConfirm={{
        title: intl.formatMessage({
          id: 'page.table.isDelete',
          defaultMessage: '是否删除?',
        }),
        onConfirm: async () => {
          if (record.state === 0) {
            await deleteItem(record.id);
          } else {
            message.error('已发布的产品不能进行删除操作');
          }
        },
      }}
      tooltip={{
        title: intl.formatMessage({
          id:
            record.state === 1
              ? 'pages.device.productDetail.deleteTip'
              : 'pages.data.option.remove',
          defaultMessage: '删除',
        }),
      }}
    >
      <DeleteOutlined />
    </PermissionButton>,
  ];

  const columns: ProColumns<ProductItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 300,
      ellipsis: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '接入方式',
      dataIndex: 'transportProtocol',
      width: 120,
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      valueType: 'select',
      valueEnum: {
        device: {
          text: '直连设备',
          status: 'device',
        },
        childrenDevice: {
          text: '网关子设备',
          status: 'childrenDevice',
        },
        gateway: {
          text: '网关设备',
          status: 'gateway',
        },
      },
      width: 120,
      render: (_, row) => <>{row.deviceType ? row.deviceType.text : undefined}</>,
    },
    {
      title: '状态',
      dataIndex: 'state',
      render: (_, row) => <Space size={0}>{status[row.state]}</Space>,
      valueType: 'select',
      width: '90px',
      valueEnum: {
        // 2: {
        //   text: intl.formatMessage({
        //     id: 'pages.searchTable.titleStatus.all',
        //     defaultMessage: '全部',
        //   }),
        //   status: 2,
        // },
        0: {
          text: intl.formatMessage({
            id: 'pages.device.product.status.unpublished',
            defaultMessage: '未发布',
          }),
          status: 0,
        },
        1: {
          text: intl.formatMessage({
            id: 'pages.device.product.status.published',
            defaultMessage: '已发布',
          }),
          status: 1,
        },
      },
    },
    {
      dataIndex: 'describe',
      title: intl.formatMessage({
        id: 'pages.system.description',
        defaultMessage: '说明',
      }),
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({
        id: 'pages.data.option',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      width: 200,
      render: (_, record) => tools(record),
    },
  ];

  return (
    <PageContainer>
      <SearchComponent
        field={columns}
        onSearch={searchFn}
        target="device-produce"
        // onReset={() => {
        //   // 重置分页及搜索参数
        //   actionRef.current?.reset?.();
        //   searchFn({});
        // }}
      />
      <ProTableCard<ProductItem>
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true }}
        // request={async (params = {}) => {
        //   return await lastValueFrom(
        //     service.queryZipCount(encodeQuery({ ...params, sorts: { id: 'ascend' } })),
        //   );
        // }}
        params={queryParam}
        request={(params = {}) =>
          service.query({
            ...params,
            sorts: [
              {
                name: 'createTime',
                order: 'desc',
              },
            ],
          })
        }
        rowKey="id"
        search={false}
        pagination={{ pageSize: 10 }}
        headerTitle={[
          <PermissionButton
            onClick={() => {
              setCurrent(undefined);
              setVisible(true);
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
          </PermissionButton>,
          <Upload
            disabled={!permission.import}
            key={'import'}
            accept={'.json'}
            showUploadList={false}
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.readAsText(file);
              reader.onload = async (result) => {
                const text = result.target?.result as string;
                if (!file.type.includes('json')) {
                  message.error('请上传json格式文件');
                  return false;
                }
                try {
                  const data = JSON.parse(text || '{}');
                  // 设置导入的产品状态为未发布
                  data.state = 0;
                  if (Array.isArray(data)) {
                    message.error('请上传json格式文件');
                    return false;
                  }
                  const res = await service.update(data);
                  if (res.status === 200) {
                    message.success('操作成功');
                    actionRef.current?.reload();
                  }
                  return true;
                } catch {
                  message.error('请上传json格式文件');
                }
              };
              return false;
            }}
          >
            <PermissionButton isPermission={permission.import} style={{ marginLeft: 12 }}>
              导入
            </PermissionButton>
          </Upload>,
        ]}
        cardRender={(record) => (
          <ProductCard
            {...record}
            detail={
              <div
                style={{ fontSize: 18, padding: 8 }}
                onClick={() => {
                  productModel.current = record;
                  history.push(
                    `${getMenuPathByParams(MENUS_CODE['device/Product/Detail'], record.id)}`,
                  );
                }}
              >
                <EyeOutlined />
              </div>
            }
            actions={[
              <PermissionButton
                key="edit"
                onClick={() => {
                  setCurrent(record);
                  setVisible(true);
                }}
                isPermission={permission.update}
                type={'link'}
                style={{ padding: 0 }}
              >
                <EditOutlined />
                {intl.formatMessage({
                  id: 'pages.data.option.edit',
                  defaultMessage: '编辑',
                })}
              </PermissionButton>,
              <PermissionButton
                isPermission={permission.export}
                type={'link'}
                key={'download'}
                style={{ padding: 0 }}
                onClick={async () => {
                  downloadObject(
                    record,
                    intl.formatMessage({
                      id: 'pages.device.product',
                      defaultMessage: '产品',
                    }),
                  );
                  message.success('操作成功');
                }}
              >
                <DownloadOutlined />
                {intl.formatMessage({
                  id: 'pages.data.option.download',
                  defaultMessage: '下载',
                })}
              </PermissionButton>,
              <PermissionButton
                key={'state'}
                popConfirm={{
                  title: intl.formatMessage({
                    id: `pages.data.option.${record.state ? 'disabled' : 'enabled'}.tips`,
                    defaultMessage: '是否启用?',
                  }),
                  onConfirm() {
                    changeDeploy(record.id, record.state ? 'undeploy' : 'deploy');
                  },
                }}
                style={{ padding: 0 }}
                type={'link'}
                isPermission={permission.action}
              >
                {record.state ? <StopOutlined /> : <AIcon type={'icon-fabu'} />}
                {intl.formatMessage({
                  id: `pages.data.option.${record.state ? 'disabled' : 'enabled'}`,
                  defaultMessage: record.state ? '禁用' : '启用',
                })}
              </PermissionButton>,
              <PermissionButton
                key="delete"
                type={'link'}
                style={{ padding: 0 }}
                isPermission={permission.delete}
                disabled={record.state === 1}
                tooltip={
                  record.state === 1
                    ? {
                        title: intl.formatMessage({
                          id: 'pages.device.productDetail.deleteTip',
                          defaultMessage: '已发布的产品不能进行删除操作',
                        }),
                      }
                    : undefined
                }
                popConfirm={{
                  title: intl.formatMessage({
                    id: 'page.table.isDelete',
                    defaultMessage: '是否删除?',
                  }),
                  onConfirm: async () => {
                    if (record.state === 0) {
                      await deleteItem(record.id);
                    } else {
                      message.error('已发布的产品不能进行删除操作');
                    }
                  },
                }}
              >
                <DeleteOutlined />
              </PermissionButton>,
            ]}
          />
        )}
      />
      <Save
        model={!current ? 'add' : 'edit'}
        data={current}
        close={() => {
          setVisible(false);
        }}
        reload={() => {
          actionRef.current?.reload();
        }}
        visible={visible}
      />
    </PageContainer>
  );
});
export default Product;
