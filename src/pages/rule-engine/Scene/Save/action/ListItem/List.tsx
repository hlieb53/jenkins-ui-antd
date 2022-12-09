import { useEffect, useState } from 'react';
import { AddButton } from '@/pages/rule-engine/Scene/Save/components/Buttons';
import Modal from '../Modal/add';
import './index.less';
import type { ActionsType } from '@/pages/rule-engine/Scene/typings';
import Item from './Item';
import type { ParallelType } from './Item';
interface ListProps {
  thenName: number;
  type: ParallelType;
  actions: ActionsType[];
  parallel: boolean;
  onAdd: (data: any) => void;
  onDelete: (key: string) => void;
}

export default (props: ListProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [actions, setActions] = useState<ActionsType[]>(props.actions);

  useEffect(() => {
    setActions(props.actions);
  }, [props.actions]);

  return (
    <div className="action-list-content">
      {actions.map((item, index) => (
        <Item
          thenName={props.thenName}
          branchGroup={props.parallel ? 1 : 0}
          name={index}
          data={item}
          type={props.type}
          key={item.key}
          parallel={props.parallel}
          options={item.options}
          onDelete={() => {
            props.onDelete(item.key!);
          }}
          onUpdate={(data, options) => {
            props.onAdd({
              ...item,
              ...data,
              options,
            });
            setVisible(false);
          }}
        />
      ))}
      <AddButton
        onClick={() => {
          setVisible(true);
        }}
      >
        点击配置执行动作
      </AddButton>
      {visible && (
        <Modal
          // type={props.type}
          parallel={props.parallel}
          name={props.actions.length}
          branchGroup={props.parallel ? 1 : 0}
          thenName={props.thenName}
          data={{
            key: `${props.type}_${props.actions.length}`,
          }}
          close={() => {
            setVisible(false);
          }}
          save={(data: any, options) => {
            const { type, ...extra } = data;
            const item: ActionsType = {
              ...extra,
              key: data.key,
              options,
            };
            props.onAdd(item);
            setVisible(false);
          }}
        />
      )}
    </div>
  );
};
