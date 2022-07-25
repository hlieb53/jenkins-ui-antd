import { CloseOutlined } from '@ant-design/icons';
import type { ActionType } from '@jetlinks/pro-table';
import ProTable from '@jetlinks/pro-table';
import { Card, message, Space } from 'antd';
import { observer } from '@formily/react';
import { Store } from 'jetlinks-store';
import SystemConst from '@/utils/const';
import { useEffect, useRef } from 'react';
import { BindModel } from '@/components/BindUser/model';
import { columns, service } from '@/components/BindUser/index';
import { useIntl } from '@@/plugin-locale/localeExports';

const Unbound = observer(() => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    const listener = Store.subscribe(SystemConst.BIND_USER_STATE, () =>
      actionRef.current?.reload(),
    );
    return () => listener.unsubscribe();
  });

  const handleBindResult = {
    next: () =>
      message.success(
        intl.formatMessage({
          id: 'pages.bindUser.bindTheNewUser.success',
          defaultMessage: '绑定成功',
        }),
      ),
    error: async () => {
      message.success(
        intl.formatMessage({
          id: 'pages.bindUser.bindTheNewUser.fail',
          defaultMessage: '绑定失败',
        }),
      );
    },
    complete: () => {
      // 通知左侧组件刷新
      Store.set(SystemConst.BIND_USER_STATE, 'true');
      actionRef.current?.reload();
      BindModel.bindUsers = [];
    },
  };

  const handleOrgBind = () => {
    service
      .saveOrgBind(
        BindModel.bindUsers.map((item) => item.userId),
        BindModel.dimension.id!,
      )
      .subscribe(handleBindResult);
  };

  const handleRoleBind = () => {
    const data = BindModel.bindUsers.map(
      (item) =>
        ({
          ...item,
          dimensionId: BindModel.dimension.id,
          dimensionTypeId: BindModel.dimension.type,
          dimensionName: BindModel.dimension.name,
        } as BindDataItem),
    );
    service.saveRoleBind(data).subscribe(handleBindResult);
  };

  const handleBind = async () => {
    const bindType = BindModel.dimension.type;
    switch (bindType) {
      case 'role':
        handleRoleBind();
        break;
      case 'org':
        handleOrgBind();
        break;
      default:
        message.error(
          intl.formatMessage({
            id: 'pages.bindUser.bindTheNewUser.typeError',
            defaultMessage: '绑定类型数据错误',
          }),
        );
    }
  };

  return (
    <Card
      title={intl.formatMessage({
        id: 'pages.bindUser.bindTheNewUser',
        defaultMessage: '绑定新用户',
      })}
      extra={
        <CloseOutlined
          onClick={() => {
            BindModel.bind = false;
          }}
        />
      }
    >
      <ProTable
        actionRef={actionRef}
        rowKey="id"
        rowSelection={{
          selectedRowKeys: BindModel.bindUsers.map((item) => item.userId),
          onChange: (selectedRowKeys, selectedRows) => {
            BindModel.bindUsers = selectedRows.map((item) => ({
              userId: item.id,
              userName: item.name,
            }));
          },
        }}
        columnEmptyText={''}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <Space size={24}>
            <span>
              {intl.formatMessage({
                id: 'pages.bindUser.bindTheNewUser.selected',
                defaultMessage: '已选',
              })}{' '}
              {selectedRowKeys.length}{' '}
              {intl.formatMessage({
                id: 'pages.bindUser.bindTheNewUser.item',
                defaultMessage: '项',
              })}
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                {intl.formatMessage({
                  id: 'pages.bindUser.bindTheNewUser.deselect',
                  defaultMessage: '取消选择',
                })}
              </a>
            </span>
          </Space>
        )}
        tableAlertOptionRender={() => (
          <Space size={16}>
            <a onClick={handleBind}>
              {intl.formatMessage({
                id: 'pages.bindUser.bindTheNewUser.bulkBinds',
                defaultMessage: '批量绑定',
              })}
            </a>
          </Space>
        )}
        size="small"
        columns={columns}
        pagination={{
          pageSize: 7,
        }}
        request={async (params) => service.query(params)}
        defaultParams={{
          [`id$in-dimension$${BindModel.dimension.type}$not`]: BindModel.dimension.id,
        }}
      />
    </Card>
  );
});
export default Unbound;
