import { ProTableCard } from '@/components';
import SearchComponent from '@/components/SearchComponent';
import type { ProductItem } from '@/pages/device/Product/typings';
import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import { service } from '@/pages/device/Product/index';
import { SceneProductCard } from '@/components/ProTableCard/CardItems/product';
import { isNoCommunity } from '@/utils/util';
import { useIntl } from 'umi';
import { service as categoryService } from '@/pages/device/Category';
import { service as deptService } from '@/pages/system/Department';
import { TriggerDeviceModel } from './addModel';
import { observer } from '@formily/reactive-react';

export const handleMetadata = (metadata?: string) => {
  try {
    TriggerDeviceModel.metadata = JSON.parse(metadata || '{}');
  } catch (error) {
    TriggerDeviceModel.metadata = {};
  }
};

export default observer(() => {
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const [searchParam, setSearchParam] = useState<any>({
    pageIndex: TriggerDeviceModel.productPage,
    pageSize: TriggerDeviceModel.productPageSize,
  });

  const [loading, setLoading] = useState(true);

  const columns: ProColumns<ProductItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 300,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '网关类型',
      dataIndex: 'accessProvider',
      width: 150,
      ellipsis: true,
      valueType: 'select',
      hideInTable: true,
      request: () =>
        service.getProviders().then((resp: any) => {
          if (isNoCommunity) {
            return (resp?.result || []).map((item: any) => ({
              label: item.name,
              value: item.id,
            }));
          } else {
            return (resp?.result || [])
              .filter((i: any) =>
                [
                  'mqtt-server-gateway',
                  'http-server-gateway',
                  'mqtt-client-gateway',
                  'tcp-server-gateway',
                ].includes(i.id),
              )
              .map((item: any) => ({
                label: item.name,
                value: item.id,
              }));
          }
        }),
    },
    {
      title: '接入方式',
      dataIndex: 'accessName',
      width: 150,
      ellipsis: true,
      valueType: 'select',
      request: () =>
        service.queryGatewayList().then((resp: any) =>
          resp.result.map((item: any) => ({
            label: item.name,
            value: item.name,
          })),
        ),
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
      width: 150,
      render: (_, row) => <>{row.deviceType ? row.deviceType.text : undefined}</>,
    },
    {
      title: '状态',
      dataIndex: 'state',
      valueType: 'select',
      width: '90px',
      valueEnum: {
        0: {
          text: intl.formatMessage({
            id: 'pages.device.product.status.disabled',
            defaultMessage: '禁用',
          }),
          status: 0,
        },
        1: {
          text: intl.formatMessage({
            id: 'pages.device.product.status.enabled',
            defaultMessage: '正常',
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
      ellipsis: true,
      width: 300,
      // hideInSearch: true,
    },
    {
      dataIndex: 'classifiedId',
      title: '分类',
      valueType: 'treeSelect',
      hideInTable: true,
      fieldProps: {
        fieldNames: {
          label: 'name',
          value: 'id',
        },
      },
      request: () =>
        categoryService
          .queryTree({
            paging: false,
          })
          .then((resp: any) => resp.result),
    },
    {
      dataIndex: 'id$dim-assets',
      title: '所属组织',
      valueType: 'treeSelect',
      hideInTable: true,
      fieldProps: {
        fieldNames: {
          label: 'name',
          value: 'value',
        },
      },
      request: () =>
        deptService
          .queryOrgThree({
            paging: false,
          })
          .then((resp) => {
            const formatValue = (list: any[]) => {
              const _list: any[] = [];
              list.forEach((item) => {
                if (item.children) {
                  item.children = formatValue(item.children);
                }
                _list.push({
                  ...item,
                  value: JSON.stringify({
                    assetType: 'product',
                    targets: [
                      {
                        type: 'org',
                        id: item.id,
                      },
                    ],
                  }),
                });
              });
              return _list;
            };
            return formatValue(resp.result);
          }),
    },
  ];
  return (
    <div>
      <SearchComponent
        field={columns}
        model={'simple'}
        enableSave={false}
        bodyStyle={{ padding: 0, paddingBottom: 16 }}
        onSearch={async (data) => {
          if (loading) {
            setSearchParam({
              pageIndex: TriggerDeviceModel.devicePage,
              pageSize: TriggerDeviceModel.devicePageSize,
              ...data,
            });
            setLoading(true);
          } else {
            actionRef.current?.reset?.();
            setSearchParam(data);
          }
        }}
        target="department-assets-product"
      />
      <div
        style={{
          height: 'calc(100vh - 440px)',
          overflowY: 'auto',
        }}
      >
        <ProTableCard<ProductItem>
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          search={false}
          gridColumn={2}
          columnEmptyText={''}
          onlyCard={true}
          tableAlertRender={false}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: [TriggerDeviceModel.productId],
            onChange: (_, selectedRows) => {
              console.log(selectedRows);
              TriggerDeviceModel.productId = selectedRows.map((item) => item.id)[0];
              TriggerDeviceModel.productDetail = selectedRows?.[0];
              handleMetadata(TriggerDeviceModel.productDetail.metadata);
              // 初始化选择设备类型以及触发类型
              TriggerDeviceModel.deviceKeys = [];
              TriggerDeviceModel.orgId = '';
              TriggerDeviceModel.selector = 'fixed';
              TriggerDeviceModel.operation = {
                operator: 'online',
              };
            },
          }}
          onPageChange={(page, size) => {
            TriggerDeviceModel.productPage = page;
            TriggerDeviceModel.productPageSize = size;
          }}
          request={(params) =>
            service.query({
              ...params,
              sorts: [{ name: 'createTime', order: 'desc' }],
            })
          }
          params={searchParam}
          cardRender={(record) => (
            <SceneProductCard showBindBtn={false} showTool={false} {...record} />
          )}
          height={'none'}
        />
      </div>
    </div>
  );
});
