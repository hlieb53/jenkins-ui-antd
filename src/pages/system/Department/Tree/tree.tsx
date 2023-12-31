import { Input, Tree } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { service } from '@/pages/system/Department';
import { Ellipsis, Empty, PermissionButton } from '@/components';
import { useIntl, useLocation } from 'umi';
import { cloneDeep, debounce, omit } from 'lodash';
import Save from '../save';
import { ISchema } from '@formily/json-schema';
import { DepartmentItem } from '@/pages/system/Department/typings';
import { ArrayToTree, onlyMessage } from '@/utils/util';
import classnames from 'classnames';
import _ from 'lodash';

interface TreeProps {
  onSelect: (id: string) => void;
}

export const getSortIndex = (data: DepartmentItem[], pId?: string): number => {
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

const TreeMap = new Map();

export default (props: TreeProps) => {
  const intl = useIntl();
  const [treeData, setTreeData] = useState<undefined | any[]>(undefined);
  const [treeDataList, setTreeDataList] = useState<undefined | any[]>(undefined);
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any>();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [showToolIndex, setShowToolIndex] = useState('');
  const searchKey = useRef('');

  const location = useLocation();

  const { permission } = PermissionButton.usePermission('system/Department');

  const handleTreeMap = (_data: any[]) => {
    if (_data) {
      _data.map((item) => {
        TreeMap.set(item.id, omit(cloneDeep(item), ['children']));
        if (item.children) {
          handleTreeMap(item.children);
        }
      });
    }
  };

  const queryTreeData = async () => {
    setKeys([]);
    const terms: Record<string, any> = {};
    if (searchKey.current) {
      terms.terms = [{ column: 'name$LIKE', value: `%${searchKey.current}%` }];
    }
    setLoading(true);
    const resp = await service.queryOrgThree({
      paging: false,
      sorts: [{ name: 'sortIndex', order: 'asc' }],
      ...terms,
    });
    setLoading(false);

    if (resp.status === 200) {
      handleTreeMap(resp.result);
      setTreeData(resp.result);
      if (resp.result && resp.result.length) {
        setKeys([resp.result[0].id]);
      }
    }
  };

  const queryList = (list: any, id: string, flag?: boolean) => {
    if (list && Array.isArray(list) && list.length) {
      return list.map((item) => {
        if (item.id === id || flag) {
          item.disabled = true;
        }
        if (item.children && Array.isArray(item.children) && item.children.length) {
          item.children = queryList(item.children, id, item.id === id || flag);
        }
        return item;
      });
    } else {
      return [];
    }
  };

  const updateOrg = (id: string) => {
    const list = _.cloneDeep(treeData);
    setTreeDataList(queryList(list, id));
  };

  const deleteItem = async (id: string) => {
    const response: any = await service.remove(id);
    if (response.status === 200) {
      onlyMessage(
        intl.formatMessage({
          id: 'pages.data.option.success',
          defaultMessage: '操作成功!',
        }),
      );
      queryTreeData();
    }
  };

  const searchByTreeMap = (key: string) => {
    const searchTree: string[] = [];
    const treeArray = new Map();
    if (key) {
      TreeMap.forEach((item) => {
        if (item.name.includes(key)) {
          searchTree.push(item.parentId);
          treeArray.set(item.id, item);
        }
      });

      function dig(_data: any[]): any {
        const pIds: string[] = [];
        if (!_data.length) return;
        _data.forEach((item) => {
          if (TreeMap.has(item)) {
            const _item = TreeMap.get(item);
            pIds.push(_item.parentId);
            treeArray.set(item, _item);
          }
        });
      }

      dig(searchTree);

      const arr = ArrayToTree(cloneDeep([...treeArray.values()]));
      setTreeData(arr);
    } else {
      setTreeData(ArrayToTree(cloneDeep([...TreeMap.values()])));
    }
  };

  const onSearchChange = (e: any) => {
    searchKey.current = e.target.value;
    // queryTreeData();
    searchByTreeMap(e.target.value);
  };

  const schema: ISchema = {
    type: 'object',
    properties: {
      parentId: {
        type: 'string',
        title: '上级组织',
        'x-decorator': 'FormItem',
        'x-component': 'TreeSelect',
        'x-component-props': {
          fieldNames: {
            label: 'name',
            value: 'id',
          },
          placeholder: '请选择上级组织',
        },
        enum: treeDataList,
      },
      name: {
        type: 'string',
        title: intl.formatMessage({
          id: 'pages.table.name',
          defaultMessage: '名称',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: '请输入名称',
        },
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
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
        'x-component-props': {
          placeholder: '请输入排序',
        },
        'x-validator': [
          {
            required: true,
            message: '请输入排序',
          },
          {
            pattern: /^[0-9]*[1-9][0-9]*$/,
            message: '请输入大于0的整数',
          },
        ],
      },
    },
  };

  useEffect(() => {
    if ((location as any).query?.save === 'true') {
      setData({ sortIndex: treeData && treeData.length + 1 });
      setVisible(true);
      setTreeDataList(treeData);
    }
  }, [location, treeData]);

  useEffect(() => {
    queryTreeData();
    TreeMap.clear();
  }, []);

  useEffect(() => {
    if (keys.length) {
      props.onSelect(keys[0]);
    }
  }, [keys]);

  return (
    <div className={'left-tree-content border-left'}>
      {loading && (
        <div className={'left-tree-loading'}>
          <LoadingOutlined />
        </div>
      )}
      <Input
        placeholder={'请输入组织名称'}
        className={'left-tree-search'}
        suffix={<SearchOutlined />}
        onChange={debounce(onSearchChange, 500)}
      />
      <PermissionButton
        key={'add'}
        style={{ width: '100%', margin: '24px 0' }}
        type="primary"
        isPermission={permission.add}
        onClick={() => {
          const sortIndex =
            treeData && treeData.length ? treeData[treeData.length - 1].sortIndex + 1 : 1;
          setData({ sortIndex });
          setVisible(true);
          setTreeDataList(treeData);
        }}
      >
        新增
      </PermissionButton>
      {/* <Button
        style={{ width: '100%', margin: '24px 0' }}
        type={'primary'}
        onClick={() => {
          setData({ sortIndex: treeData && treeData.length + 1 });
          setVisible(true);
        }}
      >
        新增
      </Button> */}
      {treeData ? (
        <div className={'left-tree-body'}>
          <Tree
            fieldNames={{
              title: 'name',
              key: 'id',
            }}
            blockNode={true}
            treeData={treeData}
            selectedKeys={keys}
            onSelect={(_keys: any[]) => {
              if (_keys && _keys.length) {
                setKeys(_keys);
              }
            }}
            expandedKeys={expandedKeys}
            onExpand={(_keys: any[]) => {
              setExpandedKeys(_keys);
            }}
            titleRender={(nodeData: any) => {
              return (
                <div
                  className={classnames('tree-node-name')}
                  onMouseEnter={() => {
                    setShowToolIndex(nodeData.id);
                  }}
                  onMouseLeave={() => {
                    setShowToolIndex('');
                  }}
                >
                  <span className={'tree-node-name--title'}>
                    <Ellipsis title={nodeData.name} />
                  </span>
                  <span
                    className={classnames('tree-node-name--btn', {
                      'show-btn': nodeData.id === showToolIndex,
                    })}
                  >
                    <PermissionButton
                      key="editable"
                      tooltip={{
                        title: intl.formatMessage({
                          id: 'pages.data.option.edit',
                          defaultMessage: '编辑',
                        }),
                      }}
                      isPermission={permission.update}
                      style={{ padding: '0 0 0 10px', height: 24 }}
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrg(nodeData.id);
                        setData({
                          ...nodeData,
                        });
                        setVisible(true);
                      }}
                    >
                      <EditOutlined />
                    </PermissionButton>
                    <PermissionButton
                      key={'addChildren'}
                      style={{ padding: '0 0 0 10px', height: 24 }}
                      tooltip={{
                        title: intl.formatMessage({
                          id: 'pages.system.department.option.add',
                          defaultMessage: '新增子组织',
                        }),
                      }}
                      type="link"
                      isPermission={permission.add}
                      onClick={(e) => {
                        e.stopPropagation();
                        setData({
                          parentId: nodeData.id,
                          sortIndex: nodeData.children ? nodeData.children.length + 1 : 1,
                        });
                        setVisible(true);
                        setTreeDataList(treeData);
                      }}
                    >
                      <PlusCircleOutlined />
                    </PermissionButton>
                    <PermissionButton
                      type="link"
                      key="delete"
                      style={{ padding: '0 0 0 10px', height: 24 }}
                      popConfirm={{
                        title: intl.formatMessage({
                          id: 'pages.system.role.option.delete',
                          defaultMessage: '确定要删除吗',
                        }),
                        onConfirm(e) {
                          e?.stopPropagation();
                          deleteItem(nodeData.id);
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      tooltip={{
                        title: intl.formatMessage({
                          id: 'pages.data.option.delete',
                          defaultMessage: '删除',
                        }),
                      }}
                      isPermission={permission.delete}
                    >
                      <DeleteOutlined />
                    </PermissionButton>
                  </span>
                </div>
              );
            }}
          />
        </div>
      ) : (
        <div style={{ height: 200 }}>
          <Empty />
        </div>
      )}
      <Save
        visible={visible}
        title={
          data && data.parentId
            ? intl.formatMessage({
                id: 'pages.system.department.option.add',
              })
            : undefined
        }
        service={service}
        onCancel={() => {
          setVisible(false);
          setData(undefined);
        }}
        reload={async (pId) => {
          await queryTreeData();
          if (pId && !expandedKeys.includes(pId)) {
            setExpandedKeys([...expandedKeys, pId]);
          }
        }}
        data={data}
        schema={schema}
      />
    </div>
  );
};
