import { observer, Observer } from '@formily/react';
import { useState, useEffect } from 'react';
import { FormModel } from '@/pages/rule-engine/Scene/Save';
import { PlusCircleOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import type { ActionBranchesProps, TermsType } from '@/pages/rule-engine/Scene/typings';
import Term from './term';
import Actions from '@/pages/rule-engine/Scene/Save/action';
import classNames from 'classnames';
import { set } from 'lodash';
import { Store } from 'jetlinks-store';
import { Form, FormInstance, Popconfirm } from 'antd';

interface BranchesItemProps {
  name: number;
  data: ActionBranchesProps;
  isFirst: boolean;
  paramsOptions: any[];
  onDelete: () => void;
  onDeleteAll?: () => void;
  form: FormInstance;
  className?: string;
}

export default observer((props: BranchesItemProps) => {
  const [when, setWhen] = useState<TermsType[]>([]);
  const [error, setError] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  useEffect(() => {
    Store.subscribe('TriggerDeviceModel', (data) => {
      if (data.update) {
        setError(true);
      }
    });
  }, []);

  useEffect(() => {
    if (props.data.when) {
      setWhen(props.data.when);
    }
  }, [props.data]);

  const addWhen = (index: number) => {
    const lastBranch = FormModel.current.branches![index].when;
    FormModel.current.options?.when.push({
      terms: [{ terms: [] }],
    });

    lastBranch.push({
      terms: [
        {
          type: 'and',
          column: undefined,
          value: undefined,
          key: 'params_1',
        },
      ],
      type: 'and',
      key: 'terms_1',
    });
    // 增加下一个否则, '当' 排除
    if (index > 0) {
      FormModel.current.branches?.push(null as any);
    }
  };

  return (
    <div className={classNames('actions-terms-warp', props.className)}>
      <div className="actions-terms-title">{props.isFirst ? '当' : '否则'}</div>
      <div
        className={classNames('actions-terms-options', { border: !props.isFirst, error: error })}
      >
        {!props.isFirst ? (
          <div className={classNames('terms-params-delete danger show')}>
            <Popconfirm title={'确认删除？'} onConfirm={props.onDelete}>
              <DeleteOutlined />
            </Popconfirm>
          </div>
        ) : null}
        <div
          className={classNames('actions-terms-list')}
          onMouseOver={() => {
            if (!props.isFirst && when.length) setDeleteVisible(true);
          }}
          onMouseOut={() => {
            if (!props.isFirst && when.length) setDeleteVisible(false);
          }}
        >
          <Popconfirm
            title={'该操作将清空其它所有否则条件，确认删除？'}
            placement="topRight"
            onConfirm={props.onDeleteAll}
          >
            <div className={classNames('terms-params-delete', { show: deleteVisible })}>
              <CloseOutlined />
            </div>
          </Popconfirm>
          <div className="actions-terms-list-content">
            <Observer>
              {() =>
                when.length ? (
                  when.map((item, dIndex) => (
                    <Term
                      whenName={props.name}
                      pName={[props.name, 'when']}
                      name={dIndex}
                      data={item}
                      key={item.key}
                      isFirst={dIndex === 0}
                      paramsOptions={props.paramsOptions}
                      isLast={dIndex === when!.length - 1}
                      onValueChange={(data) => {
                        set(FormModel.current.branches!, [props.name, 'when', dIndex], data);
                      }}
                      onLabelChange={(options) => {
                        FormModel.current.options!.terms[props.name] = options;
                      }}
                      onDelete={() => {
                        FormModel.current.branches![props.name].when.splice(dIndex, 1);
                        FormModel.current.options?.when[props.name].terms?.splice(dIndex, 1);
                      }}
                    />
                  ))
                ) : (
                  <span
                    style={{
                      fontSize: 14,
                      color: '#2F54EB',
                      cursor: 'pointer',
                      padding: props.isFirst ? '16px 0' : 0,
                    }}
                    onClick={() => addWhen(props.name)}
                  >
                    {' '}
                    <PlusCircleOutlined style={{ padding: 4 }} /> 添加过滤条件
                  </span>
                )
              }
            </Observer>
          </div>
        </div>
        <div className="actions-branches">
          <Observer>
            {() => {
              return (
                <Form.Item
                  name={['branches', props.name, 'then']}
                  rules={[
                    {
                      validator(_, v) {
                        if (!v || (v && !v.length)) {
                          return Promise.reject('至少配置一个执行动作');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Actions
                    openShakeLimit={true}
                    name={props.name}
                    thenOptions={FormModel.current.branches?.[props.name].then || []}
                    onAdd={(data) => {
                      if (FormModel.current.branches && data) {
                        const newThen = [...FormModel.current.branches[props.name].then, data];
                        FormModel.current.branches[props.name].then = newThen;
                      }
                    }}
                    onUpdate={(data, type) => {
                      const indexOf = FormModel.current.branches![props.name].then.findIndex(
                        (item) => item.parallel === type,
                      );
                      if (indexOf !== -1) {
                        if (data.actions?.length) {
                          FormModel.current.branches![props.name].then[indexOf] = data;
                        } else {
                          FormModel.current.branches![props.name].then[indexOf].actions = [];
                        }
                      }
                    }}
                  />
                </Form.Item>
              );
            }}
          </Observer>
        </div>
      </div>
    </div>
  );
});
