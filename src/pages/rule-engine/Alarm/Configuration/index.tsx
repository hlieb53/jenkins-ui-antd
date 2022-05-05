import { PageContainer } from '@ant-design/pro-layout';
import SearchComponent from '@/components/SearchComponent';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import { PermissionButton } from '@/components';
import {
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LikeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useRef, useState } from 'react';
import { Badge, message, Space } from 'antd';
import ProTableCard from '@/components/ProTableCard';
import Save from './Save';
import Service from '@/pages/rule-engine/Alarm/Configuration/service';
import AlarmConfig from '@/components/ProTableCard/CardItems/AlarmConfig';

const service = new Service('alarm/config');

const Configuration = () => {
  const intl = useIntl();
  const [visible, setVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();

  const [current, setCurrent] = useState<any>();
  const columns: ProColumns<ConfigurationItem>[] = [
    {
      dataIndex: 'name',
      title: '名称',
    },
    {
      title: '类型',
      dataIndex: 'targetType',
    },
    {
      title: '告警级别',
      dataIndex: 'level',
    },
    {
      title: '关联场景联动',
      dataIndex: 'sceneName',
    },
    {
      title: '状态',
      dataIndex: 'state',
      renderText: (state) => (
        <Badge text={state?.text} status={state?.value === 'disabled' ? 'error' : 'success'} />
      ),
    },
    {
      title: '说明',
      dataIndex: 'description',
    },
    {
      title: '操作',
      valueType: 'option',
      align: 'center',
      render: (_, record) => [
        record.sceneTriggerType === 'manual' && (
          <PermissionButton
            key="trigger"
            type="link"
            style={{ padding: 0 }}
            isPermission={true}
            popConfirm={{
              title: '确认手动触发?',
              onConfirm: async () => {
                await service._execute(record.sceneId);
                message.success(
                  intl.formatMessage({
                    id: 'pages.data.option.success',
                    defaultMessage: '操作成功!',
                  }),
                );
                actionRef.current?.reload();
              },
            }}
          >
            <LikeOutlined />
          </PermissionButton>
        ),
        <PermissionButton
          isPermission={true}
          key="edit"
          style={{ padding: 0 }}
          tooltip={{
            title: intl.formatMessage({
              id: 'pages.data.option.edit',
              defaultMessage: '编辑',
            }),
          }}
          type="link"
          onClick={() => {
            setVisible(true);
            setCurrent(record);
          }}
        >
          <EditOutlined />
        </PermissionButton>,
        <PermissionButton
          isPermission={true}
          key="action"
          style={{ padding: 0 }}
          popConfirm={{
            title: intl.formatMessage({
              id: `pages.data.option.${
                record.state?.value !== 'disabled' ? 'disabled' : 'disabled'
              }.tips`,
              defaultMessage: `确认${record.state?.value !== 'disabled' ? '禁用' : '启用'}?`,
            }),
            onConfirm: async () => {
              if (record.state?.value === 'disabled') {
                await service._enable(record.id);
              } else {
                await service._disable(record.id);
              }
              message.success(
                intl.formatMessage({
                  id: 'pages.data.option.success',
                  defaultMessage: '操作成功!',
                }),
              );
              actionRef.current?.reload();
            },
          }}
          tooltip={{
            title: intl.formatMessage({
              id: `pages.data.option.${
                record.state?.value !== 'disabled' ? 'disabled' : 'enabled'
              }`,
              defaultMessage: record.state?.value !== 'disabled' ? '禁用' : '启用',
            }),
          }}
          type="link"
        >
          {record.state?.value === 'disabled' ? <CloseCircleOutlined /> : <PlayCircleOutlined />}
        </PermissionButton>,
        <PermissionButton
          type="link"
          isPermission={true}
          key="delete"
          disabled={record.state?.value !== 'disabled'}
          style={{ padding: 0 }}
          popConfirm={{
            title: '确认删除?',
            onConfirm: () => service.remove(record.id),
          }}
          tooltip={{
            title: intl.formatMessage({
              id: 'pages.data.option.remove',
              defaultMessage: '删除',
            }),
          }}
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
        field={columns}
        onSearch={(data) => {
          actionRef.current?.reset?.();
          setParam(data);
        }}
      />
      <ProTableCard<any>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        params={param}
        columns={columns}
        request={(params) => service.query(params)}
        gridColumn={3}
        cardRender={(record) => (
          <AlarmConfig
            {...record}
            actions={[
              record.sceneTriggerType === 'manual' ? (
                <PermissionButton
                  key="trigger"
                  type="link"
                  isPermission={true}
                  popConfirm={{
                    title: '确认手动触发?',
                    onConfirm: async () => {
                      await service._execute(record.sceneId);
                      message.success(
                        intl.formatMessage({
                          id: 'pages.data.option.success',
                          defaultMessage: '操作成功!',
                        }),
                      );
                      actionRef.current?.reload();
                    },
                  }}
                >
                  <LikeOutlined />
                  手动触发
                </PermissionButton>
              ) : null,
              <PermissionButton
                isPermission={true}
                key="edit"
                type="link"
                onClick={() => {
                  setCurrent(record);
                  setVisible(true);
                }}
              >
                <EditOutlined />
                编辑
              </PermissionButton>,
              <PermissionButton
                isPermission={true}
                style={{ padding: 0 }}
                popConfirm={{
                  title: intl.formatMessage({
                    id: `pages.data.option.${
                      record.state?.value !== 'disabled' ? 'disabled' : 'enabled'
                    }.tips`,
                    defaultMessage: `确认${record.state?.value !== 'disabled' ? '禁用' : '启用'}?`,
                  }),
                  onConfirm: async () => {
                    if (record.state?.value === 'disabled') {
                      await service._enable(record.id);
                    } else {
                      await service._disable(record.id);
                    }
                    message.success(
                      intl.formatMessage({
                        id: 'pages.data.option.success',
                        defaultMessage: '操作成功!',
                      }),
                    );
                    actionRef.current?.reload();
                  },
                }}
                tooltip={{
                  title: intl.formatMessage({
                    id: `pages.data.option.${
                      record.state?.value !== 'disabled' ? 'disabled' : 'enabled'
                    }`,
                    defaultMessage: record.state?.value !== 'disabled' ? '禁用' : '启用',
                  }),
                }}
                key="action"
                type="link"
              >
                {record.state?.value !== 'disabled' ? (
                  <CloseCircleOutlined />
                ) : (
                  <PlayCircleOutlined />
                )}
                {record.state?.value !== 'disabled' ? '禁用' : '启用'}
              </PermissionButton>,
              <PermissionButton
                type="link"
                tooltip={{
                  title: '删除',
                }}
                disabled={record.state?.value !== 'disabled'}
                popConfirm={{
                  title: '确认删除?',
                  onConfirm: async () => {
                    await service.remove(record.id);
                    actionRef.current?.reset?.();
                  },
                }}
                isPermission={true}
                key="delete"
              >
                <DeleteOutlined />
              </PermissionButton>,
            ]}
          />
        )}
        headerTitle={
          <Space>
            <PermissionButton
              isPermission={true}
              onClick={() => {
                setCurrent(undefined);
                setVisible(true);
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
          </Space>
        }
      />
      <Save
        data={current}
        visible={visible}
        close={() => {
          setVisible(false);
          actionRef.current?.reset?.();
        }}
      />
    </PageContainer>
  );
};
export default Configuration;
