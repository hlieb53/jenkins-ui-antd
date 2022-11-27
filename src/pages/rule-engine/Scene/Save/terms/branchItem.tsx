import { observer } from '@formily/react';
import { useState, useEffect } from 'react';
import { FormModel } from '@/pages/rule-engine/Scene/Save';
import { PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ActionBranchesProps, TermsType } from '@/pages/rule-engine/Scene/typings';
import Term from './term';
import Actions from '@/pages/rule-engine/Scene/Save/action';
import classNames from 'classnames';

interface BranchesItemProps {
  name: number;
  data: ActionBranchesProps;
  isFrist: boolean;
  onDelete: () => void;
}

export default observer((props: BranchesItemProps) => {
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [when, setWhen] = useState<TermsType[]>([]);

  useEffect(() => {
    if (props.data.when) {
      setWhen(props.data.when);
    }
  }, [props.data]);

  const addWhen = (index: number) => {
    const lastBranch = FormModel.branches![index].when;
    FormModel.options?.terms.push({
      terms: [],
    });
    lastBranch.push({
      terms: [
        {
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
      FormModel.branches?.push({
        when: [],
        key: `branch_${new Date().getTime()}`,
        shakeLimit: {
          enabled: true,
          time: 1,
          threshold: 1,
          alarmFirst: false,
        },
        then: [],
      });
    }
  };

  return (
    <div className="actions-terms-warp">
      <div className="actions-terms-title">{props.isFrist ? '当' : '否则'}</div>
      <div
        className={classNames('actions-terms-options', { border: !props.isFrist })}
        onMouseOver={() => setDeleteVisible(true)}
        onMouseOut={() => setDeleteVisible(false)}
      >
        {!props.isFrist && props.data.when?.length ? (
          <div
            className={classNames('terms-params-delete denger', { show: deleteVisible })}
            onClick={props.onDelete}
          >
            <DeleteOutlined />
          </div>
        ) : null}
        <div className="actions-terms-list">
          {when.length ? (
            when.map((item, dIndex) => (
              <Term
                pName={[props.name, 'when']}
                name={dIndex}
                data={item}
                key={item.key}
                isLast={dIndex === when!.length - 1}
                onValueChange={(data) => {
                  FormModel.branches![props.name].when[dIndex] = {
                    ...FormModel.branches![props.name].when[dIndex],
                    ...data,
                  };
                }}
                onLabelChange={(options) => {
                  FormModel.options!.terms[props.name] = options;
                }}
                onDelete={() => {
                  FormModel.branches![props.name].when.splice(dIndex, 1);
                }}
              />
            ))
          ) : (
            <span
              style={{
                fontSize: 14,
                color: '#2F54EB',
                cursor: 'pointer',
                padding: props.isFrist ? '16px 0' : 0,
              }}
              onClick={() => addWhen(props.name)}
            >
              {' '}
              <PlusCircleOutlined style={{ padding: 4 }} /> 添加过滤条件
            </span>
          )}
        </div>
        <div className="actions-branchs">
          <Actions openShakeLimit={true} name={['branches', props.name]} />
        </div>
      </div>
    </div>
  );
});
