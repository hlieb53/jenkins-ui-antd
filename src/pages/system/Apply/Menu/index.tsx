import { onlyMessage } from '@/utils/util';
import { Modal, Tree, Select } from 'antd';
import { useEffect, useState } from 'react';
import { service } from '../index';

interface Props {
  close: Function;
  data: any;
}

const MenuPage = (props: Props) => {
  const { data } = props;
  const { Option } = Select;
  const [treeData, setTreeData] = useState<any[]>([]);
  const [keys, setKeys] = useState<any>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [half, setHalf] = useState<string[]>([]);
  const [ownerList, setOwenrList] = useState<any>([]);

  // const getTree = async () => {
  //   const res = await service.queryOwner(['iot']);
  //   if (res.status === 200) {
  //     setOwenrList(res.result);
  //     console.log(res.result);
  //     const resp = await service.queryOwnerTree(res.result?.[0]);
  //     if (resp.status === 200) {
  //       setTreeData(resp.result);
  //       const pid = resp.result.map((item: any) => item.id);
  //       setExpandedKeys(pid);
  //     }
  //   }
  // };

  const getMenus = async () => {
    const res = await service.queryTree({
      terms: [
        {
          column: 'appId',
          value: data.id,
        },
      ],
    });
    if (res.status === 200) {
      console.log(res.result);
      setTreeData(res.result);
      const pid = res.result.map((item: any) => item.id);
      setExpandedKeys(pid);
      setKeys(pid);
    }
  };

  const getOwner = async () => {
    if (data.provider !== 'internal-standalone') {
      const res = await service.queryOwner(['iot']);
      if (res.status === 200) {
        setOwenrList(res.result);
      }
    } else {
      const resp = await service.queryOwnerStandalone(data.id, ['iot']);
      if (resp.status === 200) {
        setOwenrList(resp.result);
      }
    }
  };

  const getTree = async (parms: any) => {
    if (data.provider !== 'internal-standalone') {
      const res = await service.queryOwnerTree(parms);
      if (res.status === 200) {
        setTreeData(res.result);
        const pid = res.result.map((item: any) => item.id);
        setExpandedKeys(pid);
      }
    } else {
      const resp = await service.queryOwnerTreeStandalone(data.id, parms);
      if (resp.status === 200) {
        setTreeData(resp.result);
        const pid = resp.result.map((item: any) => item.id);
        setExpandedKeys(pid);
      }
    }
  };

  const save = async (datalist: any) => {
    const res = await service.saveOwnerTree('iot', data.id, datalist);
    if (res?.status === 200) {
      onlyMessage('操作成功');
    }
  };

  //过滤节点-默认带上父节点
  const filterTree = (nodes: any[], list: any[]) => {
    if (!nodes?.length) {
      return nodes;
    }
    return nodes.filter((it) => {
      // 不符合条件的直接砍掉
      if (list.indexOf(it.id) <= -1) {
        return false;
      }
      // 符合条件的保留，并且需要递归处理其子节点
      it.children = filterTree(it.children, list);
      return true;
    });
  };

  useEffect(() => {
    getOwner();
    getMenus();
  }, []);

  return (
    <Modal
      visible
      maskClosable={false}
      title="集成菜单"
      width={600}
      onCancel={() => {
        props.close();
      }}
      onOk={() => {
        const items = filterTree(treeData, [...keys, ...half]);
        if (items && items.length !== 0) {
          save(items);
        } else {
          onlyMessage('请勾选配置菜单', 'warning');
        }
      }}
    >
      <Select
        style={{ width: 200, marginBottom: 20 }}
        placeholder="请选择集成系统"
        onChange={(value) => {
          // console.log(value);
          if (value) {
            getTree(value);
          }
        }}
      >
        {ownerList.map((item: any) => (
          <Option value={item} key={item}>
            {item}
          </Option>
        ))}
      </Select>
      <Tree
        fieldNames={{
          title: 'name',
          key: 'id',
        }}
        checkable
        treeData={treeData}
        checkedKeys={keys}
        autoExpandParent={true}
        onCheck={(_keys: any, e: any) => {
          console.log(e);
          setKeys(_keys);
          setHalf(e.halfCheckedKeys);
        }}
        expandedKeys={expandedKeys}
        onExpand={(_keys: any[]) => {
          setExpandedKeys(_keys);
        }}
      />
    </Modal>
  );
};

export default MenuPage;
