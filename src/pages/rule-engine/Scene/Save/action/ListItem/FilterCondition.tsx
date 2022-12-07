import type { TermsType, TermsVale } from '@/pages/rule-engine/Scene/typings';
import { DropdownButton, ParamsDropdown } from '@/pages/rule-engine/Scene/Save/components/Buttons';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState, useCallback, useRef } from 'react';
import classNames from 'classnames';
import { observer } from '@formily/react';
import { queryBuiltInParams } from '@/pages/rule-engine/Scene/Save/action/service';
import '../index.less';
import { FormModel } from '../..';
import { Space } from 'antd';

interface FilterProps {
  thenName: number;
  branchGroup?: number;
  action?: number;
  data?: TermsType;
  onChange: (value: TermsType) => void;
  onLabelChange: (lb: string) => void;
  onAdd: () => void;
  onDelete: () => void;
}

const handleName = (_data: any) => (
  <Space>
    {_data.name}
    <div style={{ color: 'grey', marginLeft: '5px' }}>{_data.fullName}</div>
    {_data.description && (
      <div style={{ color: 'grey', marginLeft: '5px' }}>({_data.description})</div>
    )}
  </Space>
);
//
// const handleOptions = (options: any[]): any[] => {
//   if (!options) return []
//
//   return options.map(item => {
//     const disabled = item.children?.length > 0;
//     return {
//       ...item,
//       column: item.column,
//       key: item.column,
//       value: item.column,
//       title: handleName(item),
//       disabled: disabled,
//       children: handleOptions(item.children),
//     };
//   })
// }

const DoubleFilter = ['nbtw', 'btw', 'in', 'nin'];
const columnOptionsMap = new Map<string, any>();
export default observer((props: FilterProps) => {
  const [value, setValue] = useState<Partial<TermsVale> | undefined>({});
  const [termType, setTermType] = useState('');
  const [column, setColumn] = useState('');

  const [BuiltInOptions, setBuiltInOptions] = useState<any[]>([]);
  const [columnOptions, setColumnOptions] = useState<any[]>([]);
  const [ttOptions, setTtOptions] = useState<any>([]);
  const [valueOptions] = useState<any[]>([]);
  const [valueType, setValueType] = useState('');
  const [label, setLabel] = useState<any[]>([undefined, undefined, {}]);

  const ValueRef = useRef<Partial<TermsType>>({
    column: '',
    termType: '',
    value: undefined,
  });

  const valueChange = useCallback(
    (_value: any) => {
      props.onChange?.({ ..._value });
    },
    [column, termType, value],
  );

  const valueEventChange = useCallback(
    (_v: any) => {
      valueChange({
        column: ValueRef.current.column,
        termType: ValueRef.current.termType,
        value: _v,
      });
    },
    [column, termType],
  );

  const paramChange = (item: any) => {
    const node = item.node;
    const _termTypeOptions: any[] =
      node.termTypes?.map((tItem: any) => ({ title: tItem.name, key: tItem.id })) || [];
    setTtOptions(_termTypeOptions);
    setValueType(node.dataType || node.type);
  };

  const convertLabelValue = (columnValue?: string) => {
    if (columnValue) {
      console.log(columnOptionsMap, columnValue);
      const labelOptions = columnOptionsMap.get(columnValue);
      const _termTypeOptions: any[] =
        labelOptions?.termTypes?.map((tItem: any) => ({ title: tItem.name, key: tItem.id })) || [];
      setTtOptions(_termTypeOptions);
      setValueType(labelOptions?.type);
    }
  };

  const handleTreeData = (data: any): any[] => {
    if (data.length > 0) {
      return data.map((item: any) => {
        const name = handleName(item);
        columnOptionsMap.set(item.column, item);
        if (item.children) {
          return {
            ...item,
            key: item.id,
            fullName: item.name,
            title: name,
            disabled: true,
            children: handleTreeData(item.children),
          };
        }
        return { ...item, key: item.id, fullName: item.name, title: name };
      });
    }
    return [];
  };

  const getParams = useCallback(() => {
    const _params = {
      branch: props.thenName,
      branchGroup: props.branchGroup,
      action: props.action,
    };
    columnOptionsMap.clear();
    queryBuiltInParams(FormModel.current, _params).then((res: any) => {
      if (res.status === 200) {
        const params = handleTreeData(
          // res.result.filter((item: any) => !item.id.includes(`action_${props.action}`)),
          res.result,
        );
        setColumnOptions(params);
        setBuiltInOptions(params);
        convertLabelValue(props.data?.column);
      }
    });
  }, [props.data?.column]);

  const handleOptionsLabel = (c: string, t: string, v: any) => {
    const termsTypeKey = {
      eq: '等于_value',
      neq: '不等于_value',
      gt: '大于_value',
      gte: '大于等于_value',
      lt: '小于_value',
      lte: '小于等于_value',
      btw: '在_value和_value2之间',
      nbtw: '不在_value和_value2之间',
      time_gt_now: '距离当前时间大于_value秒',
      time_lt_now: '距离当前时间小于_value秒',
      in: '在_value,_value2之中',
      nin: '不在_value,_value2之中',
    };

    if (DoubleFilter.includes(t)) {
      const str = termsTypeKey[t].replace('_value', v[0]).replace('_value2', v[1]);
      return `${c} ${str}`;
    }
    const str = termsTypeKey[t].replace('_value', v);
    return `${c} ${str}`;
  };

  useEffect(() => {
    const _v = Object.values(label[2]);
    if (_v.length && label[1]) {
      const _l = handleOptionsLabel(label[0], label[1], _v.length > 1 ? _v : _v[0]);
      props.onLabelChange?.(_l);
    }
  }, [label]);

  useEffect(() => {
    if (props.data) {
      setColumn(props.data.column || '');
      setTermType(props.data.termType || '');
      setValue(props.data.value);
      ValueRef.current = props.data || {};
      convertLabelValue(props.data.column);
    }
  }, [props.data]);

  useEffect(() => {
    if (props.data) {
      getParams();
    }
  }, []);

  return (
    <div className="filter-condition-warp">
      {props.data ? (
        <div className="filter-condition-content">
          <div
            className={classNames('filter-condition-delete denger show')}
            onClick={props.onDelete}
          >
            <DeleteOutlined />
          </div>
          <DropdownButton
            options={columnOptions}
            type="param"
            placeholder="请选择参数"
            value={column}
            showLabelKey="fullName"
            isTree={true}
            onChange={(_value, item) => {
              setValue({
                value: undefined,
                source: 'fixed',
              });
              paramChange(item);
              setColumn(_value!);
              const node = item.node;
              const _termTypeOptions: any[] =
                node.termTypes?.map((tItem: any) => ({ title: tItem.name, key: tItem.id })) || [];
              setTtOptions(_termTypeOptions);
              // 默认选中第一个
              let _termTypeValue = undefined;
              if (_termTypeOptions.length) {
                _termTypeValue = _termTypeOptions[0].key;
                label[1] = _termTypeValue;
                setTermType(_termTypeValue);
              } else {
                label[1] = '';
                setTermType('');
              }
              ValueRef.current.column = _value!;
              label[0] = node.fullName;
              setLabel([...label]);
              valueChange({
                column: _value,
                value: {
                  value: undefined,
                  source: 'fixed',
                },
                termType: _termTypeValue,
              });
            }}
          />
          <DropdownButton
            options={ttOptions}
            type="termType"
            placeholder="操作符"
            value={termType}
            onChange={(v) => {
              const _value = {
                ...value,
              };
              if (value && DoubleFilter.includes(v!)) {
                _value.value = [undefined, undefined];
              } else {
                _value.value = undefined;
              }
              setValue(_value);
              setTermType(v!);

              label[1] = v;
              setLabel([...label]);
              ValueRef.current.termType = v;
              valueChange({
                column: props.data!.column,
                value: value as TermsVale,
                termType: v,
              });
            }}
          />
          {DoubleFilter.includes(termType) ? (
            <>
              <ParamsDropdown
                options={valueOptions}
                type="value"
                placeholder="参数值"
                valueType={valueType}
                value={value}
                BuiltInOptions={BuiltInOptions}
                showLabelKey="fullName"
                name={0}
                onChange={(v, lb) => {
                  const _myValue = {
                    value: [v.value, ValueRef.current.value?.value?.[1]],
                    source: v.source,
                  };
                  ValueRef.current.value = _myValue;
                  setValue(_myValue);
                  label[2] = { ...label[2], 0: lb };
                  setLabel([...label]);
                  valueEventChange(_myValue);
                }}
              />
              <ParamsDropdown
                options={valueOptions}
                type="value"
                placeholder="参数值"
                valueType={valueType}
                value={value}
                BuiltInOptions={BuiltInOptions}
                showLabelKey="fullName"
                name={1}
                onChange={(v, lb) => {
                  const _myValue = {
                    value: [ValueRef.current.value?.value?.[0], v.value],
                    source: v.source,
                  };
                  ValueRef.current.value = _myValue;
                  setValue(_myValue);
                  label[2] = { ...label[2], 1: lb };
                  setLabel([...label]);
                  valueEventChange(_myValue);
                }}
              />
            </>
          ) : (
            <ParamsDropdown
              options={valueOptions}
              type="value"
              placeholder="参数值"
              valueType={valueType}
              value={value}
              BuiltInOptions={BuiltInOptions}
              showLabelKey="fullName"
              onChange={(v, lb) => {
                console.log('valueChange4', v);
                setValue({
                  ...v,
                });
                label[2] = { 0: lb };
                setLabel([...label]);
                valueEventChange(v);
              }}
            />
          )}
        </div>
      ) : (
        <div
          className="filter-add-button"
          onClick={() => {
            props.onAdd();
            getParams();
          }}
        >
          <PlusOutlined style={{ paddingRight: 16 }} /> 添加过滤条件
        </div>
      )}
    </div>
  );
});
