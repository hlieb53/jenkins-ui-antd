// 视频设备通道列表
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@jetlinks/pro-table';
import SearchComponent from '@/components/SearchComponent';
import './index.less';
import { useEffect, useRef, useState } from 'react';
import { ChannelItem } from '@/pages/media/Device/Channel/typings';
import { useHistory, useIntl, useLocation } from 'umi';
import { AIcon, BadgeStatus } from '@/components';
import { StatusColorEnum } from '@/components/BadgeStatus';
import { Button, message, Tooltip } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import Save from './Save';
import Service from './service';
import { ProviderValue } from '../index';
import Live from './Live';
import { getMenuPathByCode, MENUS_CODE } from '@/utils/menu';
import Tree from './Tree';
import { useDomFullHeight } from '@/hooks';
import classnames from 'classnames';
import { PermissionButton } from '@/components';
export const service = new Service('media');

export default () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [queryParam, setQueryParam] = useState({});
  const [visible, setVisible] = useState<boolean>(false);
  const [liveVisible, setLiveVisible] = useState(false);
  const [current, setCurrent] = useState<ChannelItem>();
  const [deviceId, setDeviceId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [type, setType] = useState('');
  const { minHeight } = useDomFullHeight(`.channelDevice`, 24);
  const [show, setShow] = useState(false);
  const permissionCode = 'media/Device';
  const { permission } = PermissionButton.usePermission(permissionCode);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const param = new URLSearchParams(location.search);
    const _deviceId = param.get('id');
    const _type = param.get('type');
    if (_deviceId) {
      setDeviceId(_deviceId);
    }
    if (_type) {
      setType(_type);
    }
  }, [location]);

  /**
   * table 查询参数
   * @param data
   */
  const searchFn = (data: any) => {
    setQueryParam(data);
  };

  const deleteItem = async (id: string) => {
    const resp: any = await service.removeChannel(id);
    if (resp.status === 200) {
      actionRef.current?.reload();
    } else {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<ChannelItem>[] = [
    {
      dataIndex: 'channelId',
      title: '通道ID',
      width: 200,
      ellipsis: true,
    },
    {
      dataIndex: 'name',
      title: intl.formatMessage({
        id: 'pages.table.name',
        defaultMessage: '名称',
      }),
      width: 200,
      ellipsis: true,
    },
    {
      dataIndex: 'manufacturer',
      title: intl.formatMessage({
        id: 'pages.media.device.manufacturer',
        defaultMessage: '设备厂家',
      }),
      hideInTable: type !== ProviderValue.GB281,
    },
    {
      dataIndex: 'address',
      title: '安装地址',
      ellipsis: true,
    },
    {
      dataIndex: 'status',
      width: 90,
      title: intl.formatMessage({
        id: 'pages.searchTable.titleStatus',
        defaultMessage: '状态',
      }),
      valueType: 'select',
      valueEnum: {
        online: {
          text: '已连接',
          status: 'online',
        },
        offline: {
          text: '未连接',
          status: 'offline',
        },
      },
      render: (_, record) => (
        <BadgeStatus
          status={record.status.value}
          statusNames={{
            online: StatusColorEnum.success,
            offline: StatusColorEnum.error,
            notActive: StatusColorEnum.processing,
          }}
          text={record.status.text}
        />
      ),
    },
    {
      title: intl.formatMessage({
        id: 'pages.data.option',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      align: 'left',
      width: 160,
      render: (_, record) => [
        <PermissionButton
          key="editable"
          tooltip={{
            title: intl.formatMessage({
              id: 'pages.data.option.edit',
              defaultMessage: '编辑',
            }),
          }}
          isPermission={permission.update}
          style={{ padding: 0 }}
          type="link"
          onClick={() => {
            setCurrent(record);
            setVisible(true);
          }}
        >
          <EditOutlined />
        </PermissionButton>,
        <Tooltip key={'live'} title={'播放'}>
          <a
            onClick={() => {
              setChannelId(record.channelId);
              setLiveVisible(true);
            }}
          >
            <VideoCameraOutlined />
          </a>
        </Tooltip>,
        <Tooltip key={'playback'} title={'回放'}>
          <a
            onClick={() => {
              const param = new URLSearchParams(location.search);
              const _type = param.get('type');
              history.push(
                `${getMenuPathByCode(MENUS_CODE['media/Device/Playback'])}?id=${
                  record.deviceId
                }&channelId=${record.channelId}&type=${_type}`,
              );
            }}
          >
            <AIcon type={'icon-huifang'} />
          </a>
        </Tooltip>,
        type === ProviderValue.FIXED ? (
          <PermissionButton
            type="link"
            key="delete"
            style={{ padding: 0 }}
            popConfirm={{
              title: intl.formatMessage({
                id: 'pages.system.role.option.delete',
                defaultMessage: '确定要删除吗',
              }),
              onConfirm: () => {
                deleteItem(record.id);
              },
            }}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.data.option.delete',
                defaultMessage: '删除',
              }),
            }}
            isPermission={permission.delete || permission.update}
          >
            <DeleteOutlined />
          </PermissionButton>
        ) : null,
      ],
    },
  ];

  return (
    <PageContainer>
      <div className={'device-channel-warp'}>
        {type === ProviderValue.GB281 && (
          <div className={classnames('left-warp')}>
            <div className={classnames('left-content', { active: show })}>
              <Tree
                deviceId={deviceId}
                onSelect={(key) => {
                  if (key === deviceId && actionRef.current?.reset) {
                    actionRef.current?.reset();
                  } else {
                    setQueryParam({
                      terms: [
                        {
                          column: 'parentId',
                          value: key,
                        },
                      ],
                    });
                  }
                }}
                onTreeLoad={setShow}
              />
            </div>
            <div
              className={classnames('left-warp--btn', { active: !show })}
              onClick={() => {
                setShow(!show);
              }}
            >
              <LeftOutlined />
            </div>
          </div>
        )}
        <div className={'right'}>
          <SearchComponent field={columns} onSearch={searchFn} target={'media-channel'} />
          <ProTable<ChannelItem>
            columns={columns}
            actionRef={actionRef}
            // scroll={{x:1366}}
            columnEmptyText={''}
            tableClassName={'channelDevice'}
            tableStyle={{ minHeight }}
            options={{ fullScreen: true }}
            params={queryParam}
            defaultParams={[
              {
                column: 'id',
              },
            ]}
            request={(params = {}) =>
              service.queryChannel(deviceId, {
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
            headerTitle={[
              type === ProviderValue.GB281 ? (
                <Tooltip
                  key="button"
                  title={<div style={{ width: 265 }}>接入方式为GB/T28281时，不支持新增</div>}
                >
                  <Button disabled>
                    {intl.formatMessage({
                      id: 'pages.data.option.add',
                      defaultMessage: '新增',
                    })}
                  </Button>
                </Tooltip>
              ) : (
                <PermissionButton
                  onClick={() => {
                    setCurrent(undefined);
                    setVisible(true);
                  }}
                  isPermission={permission.add || permission.update}
                  key="button"
                  icon={<PlusOutlined />}
                  type="primary"
                >
                  {intl.formatMessage({
                    id: 'pages.data.option.add',
                    defaultMessage: '新增',
                  })}
                </PermissionButton>
              ),
            ]}
          />
        </div>
      </div>
      <Save
        visible={visible}
        service={service}
        model={current ? 'edit' : 'add'}
        type={type}
        data={current}
        deviceId={deviceId}
        onCancel={() => {
          setVisible(false);
        }}
        onReload={() => {
          actionRef.current?.reload();
        }}
      />
      {liveVisible && (
        <Live
          visible={liveVisible}
          deviceId={deviceId}
          channelId={channelId}
          onCancel={() => {
            setLiveVisible(false);
          }}
        />
      )}
    </PageContainer>
  );
};
