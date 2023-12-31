import {
  PlusOutlined,
  FormOutlined,
  DeleteOutlined,
  StopOutlined,
  PlayCircleOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Button, Input, Tree, Space, Popconfirm, Tooltip, Tag } from 'antd';
import { observer } from '@formily/react';
import { model } from '@formily/reactive';
import { Empty, PermissionButton } from '@/components';
import styles from './index.less';
import service from '@/pages/DataCollect/service';
import { useEffect } from 'react';
import CollectorSave from '../Device/Save';
import { onlyMessage } from '@/utils/util';
import { useIntl } from '@@/plugin-locale/localeExports';

const TreeModel = model<{
  selectedKeys: string[];
  dataSource: any[];
  loading: boolean;
  param: any;
  visible: boolean;
  current: any;
  search: string;
}>({
  selectedKeys: ['*'],
  dataSource: [],
  loading: true,
  param: {
    terms: [],
  },
  visible: false,
  current: {},
  search: '',
});
interface Props {
  channelId?: string;
  change: (data?: any) => void;
}

export default observer((props: Props) => {
  // const deviceImg = require('/public/images/DataCollect/tree-device.png');
  const { permission } = PermissionButton.usePermission('DataCollect/Collector');
  const intl = useIntl();

  const handleSearch = async (params: any) => {
    TreeModel.loading = true;
    TreeModel.param = params;
    const resp = await service.queryCollector({
      ...params,
      paging: false,
      sorts: [{ name: 'createTime', order: 'desc' }],
    });
    if (resp.status === 200) {
      if (TreeModel?.search || props?.channelId) {
        TreeModel.dataSource = resp.result;
      } else {
        TreeModel.dataSource = [
          {
            id: '*',
            name: '全部',
            children: resp.result,
          },
        ];
      }
      TreeModel.selectedKeys = [TreeModel.dataSource?.[0]?.id] || [];
      props.change(TreeModel.dataSource?.[0]);
    }
    TreeModel.loading = false;
  };

  useEffect(() => {
    if (props.channelId) {
      TreeModel.param = {
        terms: [
          {
            column: 'channelId',
            value: props?.channelId,
          },
        ],
      };
      handleSearch(TreeModel.param);
    } else {
      TreeModel.param = {
        terms: [],
      };
      handleSearch(TreeModel.param);
    }
  }, [props.channelId]);

  const getState = (record: any) => {
    if (record) {
      const colorMap = new Map();
      colorMap.set('running', 'success');
      colorMap.set('partialError', 'warning');
      colorMap.set('failed', 'error');
      colorMap.set('stopped', 'default');
      if (record?.state?.value === 'enabled') {
        return (
          record?.runningState && (
            <Tag color={colorMap.get(record?.runningState?.value)}>
              {record?.runningState?.text}
            </Tag>
          )
        );
      } else {
        return <Tag color="processing">禁用</Tag>;
      }
    } else {
      return '';
    }
  };

  return (
    <div>
      <div>
        <Input.Search
          placeholder="请输入名称"
          allowClear
          onSearch={(val) => {
            TreeModel.search = val;
            if (val) {
              TreeModel.param = {
                terms: [{ column: 'name', value: `%${val}%`, termType: 'like' }],
              };
            } else {
              TreeModel.param = { terms: [] };
            }
            handleSearch(TreeModel.param);
          }}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ margin: '16px 0' }}>
        <Tooltip title={!permission.add ? '暂无权限，请联系管理员' : ''}>
          <Button
            type="primary"
            ghost
            disabled={!permission.add}
            style={{ width: '100%' }}
            icon={<PlusOutlined />}
            onClick={() => {
              TreeModel.visible = true;
              TreeModel.current = {};
            }}
          >
            新增采集器
          </Button>
        </Tooltip>
      </div>
      <div>
        {TreeModel.dataSource.length ? (
          <Tree
            style={{ overflow: 'hidden' }}
            className={styles['data-collect-tree']}
            showIcon
            height={document.body.clientHeight < 1000 ? document.body.clientHeight * 0.7 : 650}
            selectedKeys={TreeModel.selectedKeys}
            defaultExpandAll
            autoExpandParent
            switcherIcon={<DownOutlined />}
            fieldNames={{
              title: 'name',
              key: 'id',
            }}
            titleRender={(i) => (
              <div className={i.id !== '*' ? styles.treeTitle : {}}>
                <div
                  className={styles.title}
                  onClick={() => {
                    TreeModel.selectedKeys = [i.id];
                    props.change(i);
                  }}
                >
                  {/*{*/}
                  {/*  i.id !== '*' && <img width={'20px'} style={{ marginRight: 5, width: 10 }} src={deviceImg} />*/}
                  {/*}*/}
                  <div style={{ display: 'flex' }}>
                    <span
                      className={'ellipsis'}
                      style={{
                        marginRight: 5,
                        maxWidth: 85,
                        color: 'rgba(0, 0, 0, 0.6)',
                      }}
                    >
                      {i.name}
                    </span>
                    {i.id !== '*' && getState(i)}
                  </div>
                </div>
                {i.id !== '*' && (
                  <div>
                    <Space className={styles.iconColor}>
                      <Tooltip title={!permission.update ? '暂无权限，请联系管理员' : ''}>
                        <FormOutlined
                          onClick={() => {
                            if (permission.update) {
                              TreeModel.current = i;
                              TreeModel.visible = true;
                            }
                          }}
                        />
                      </Tooltip>
                      <Popconfirm
                        title={intl.formatMessage({
                          id: `pages.data.option.${
                            i?.state?.value !== 'disabled' ? 'disabled' : 'enabled'
                          }.tips`,
                          defaultMessage: '确认禁用？',
                        })}
                        onConfirm={async () => {
                          if (permission.action) {
                            const resp =
                              i?.state?.value !== 'disabled'
                                ? await service.updateCollector(i.id, {
                                    state: 'disabled',
                                    runningState: 'stopped',
                                  })
                                : await service.updateCollector(i.id, {
                                    state: 'enabled',
                                    runningState: 'running',
                                  });
                            if (resp.status === 200) {
                              TreeModel.param = { terms: [] };
                              handleSearch(TreeModel.param);
                              onlyMessage('操作成功');
                            } else {
                              onlyMessage('操作失败！', 'error');
                            }
                          }
                        }}
                      >
                        <Tooltip title={!permission.action ? '暂无权限，请联系管理员' : ''}>
                          {i?.state?.value !== 'disabled' ? (
                            <StopOutlined />
                          ) : (
                            <PlayCircleOutlined />
                          )}
                        </Tooltip>
                      </Popconfirm>
                      <Popconfirm
                        title={'该操作将会删除下属点位，确定删除？'}
                        disabled={i?.state?.value !== 'disabled'}
                        onConfirm={async () => {
                          if (permission.delete) {
                            const resp = await service.removeCollector(i.id);
                            if (resp.status === 200) {
                              TreeModel.param = { terms: [] };
                              handleSearch(TreeModel.param);
                              onlyMessage('操作成功');
                            }
                          }
                        }}
                      >
                        <Tooltip
                          title={
                            !permission.delete
                              ? '暂无权限，请联系管理员'
                              : i?.state?.value !== 'disabled'
                              ? '正常的采集器不能删除'
                              : ''
                          }
                        >
                          <DeleteOutlined />
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  </div>
                )}
              </div>
            )}
            treeData={TreeModel.dataSource}
          />
        ) : (
          <Empty />
        )}
      </div>
      {TreeModel.visible && (
        <CollectorSave
          data={TreeModel.current}
          close={() => {
            TreeModel.visible = false;
          }}
          reload={() => {
            TreeModel.visible = false;
            TreeModel.param = { terms: [] };
            handleSearch(TreeModel.param);
          }}
        />
      )}
    </div>
  );
});
