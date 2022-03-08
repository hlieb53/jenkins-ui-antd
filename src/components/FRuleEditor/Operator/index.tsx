import { Input, Tree } from 'antd';
import Service from './service';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import ReactMarkdown from 'react-markdown';
import { treeFilter } from '@/utils/tree';
import type { OperatorItem } from './typings';
import { Store } from 'jetlinks-store';

const service = new Service();

const Operator = () => {
  const [data, setData] = useState<OperatorItem[]>([]);
  const [item, setItem] = useState<Partial<OperatorItem>>({});
  const dataRef = useRef<OperatorItem[]>([]);
  const getData = async () => {
    // TODO 从物模型中获取属性数据
    const properties = {
      id: 'property',
      name: '属性',
      description: '',
      code: '',
      children: [
        {
          id: 'test',
          name: '测试数据',
        },
      ],
    };
    const response = await service.getOperator();
    if (response.status === 200) {
      setData([properties, ...response.result]);
      dataRef.current = [properties, ...response.result];
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const search = (value: string) => {
    if (value) {
      const nodes = treeFilter(dataRef.current, value, 'name') as OperatorItem[];
      setData(nodes);
    } else {
      setData(dataRef.current);
    }
  };
  return (
    <div className={styles.box}>
      <Input.Search onSearch={search} allowClear placeholder="搜索关键字" />
      <Tree
        className={styles.tree}
        onSelect={(k, info) => {
          setItem(info.node as unknown as OperatorItem);
        }}
        fieldNames={{
          title: 'name',
          key: 'id',
        }}
        titleRender={(node) => (
          <div className={styles.node}>
            <div>{node.name}</div>
            <div className={node.children?.length > 0 ? styles.parent : styles.add}>
              <a
                onClick={() => {
                  Store.set('add-operator-value', node.code);
                }}
              >
                添加
              </a>
            </div>
          </div>
        )}
        autoExpandParent={true}
        treeData={data}
      />
      <div className={styles.explain}>
        <ReactMarkdown>{item.description || ''}</ReactMarkdown>
      </div>
    </div>
  );
};
export default Operator;
