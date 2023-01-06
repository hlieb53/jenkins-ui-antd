import { Checkbox, InputNumber, DatePicker, Input, Select } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface Props {
  value: any;
  type: any;
  enum: any;
  onChange: (value: any) => void;
}

const FIndicators = (props: Props) => {
  const { value, onChange, type } = props;
  const DatePicker1: any = DatePicker;
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    const arr = [];
    if (!!props.enum?.falseText && props.enum?.falseValue !== undefined) {
      arr.push({ text: props.enum?.falseText, value: props.enum?.falseValue });
    }
    if (!!props.enum?.trueText && props.enum?.trueValue !== undefined) {
      arr.push({ text: props.enum?.trueText, value: props.enum?.trueValue });
    }
    setList(arr);
  }, [props.enum]);

  const renderComponent = () => {
    if (['int', 'long', 'double', 'float'].includes(type)) {
      return (
        <>
          <InputNumber
            value={value?.range ? value?.value?.[0] : value?.value}
            onChange={(val) => {
              if (value?.range) {
                onChange({
                  ...value,
                  value: [
                    val > value?.value?.[1] ? value?.value?.[0] : val,
                    value?.value?.[1] || '',
                  ],
                });
              } else {
                onChange({
                  ...value,
                  value: val,
                });
              }
            }}
          />
          {value.range && (
            <>
              ~
              <InputNumber
                value={value?.value?.[1]}
                onChange={(val) => {
                  onChange({
                    ...value,
                    value: [value?.value?.[0], val > value?.value?.[0] ? val : value?.value?.[1]],
                  });
                }}
              />
            </>
          )}
        </>
      );
    } else if (type === 'date') {
      if (value.range) {
        return (
          <DatePicker1.RangePicker
            allowClear={false}
            showTime
            value={
              value?.value && [
                !!value?.value[0] && moment(value.value[0], 'YYYY-MM-DD HH:mm:ss'),
                !!value?.value[1] && moment(value.value[1], 'YYYY-MM-DD HH:mm:ss'),
              ]
            }
            onChange={(_: any, date: string[]) => {
              if (date[0] !== date[1]) {
                onChange({
                  ...value,
                  value: [...date],
                });
              }
            }}
          />
        );
      } else {
        return (
          <DatePicker1
            showTime
            allowClear={false}
            value={
              value?.range
                ? value?.value && value.value?.[0]
                  ? moment(value.value[0], 'YYYY-MM-DD HH:mm:ss')
                  : undefined
                : value?.value
                ? moment(value.value, 'YYYY-MM-DD HH:mm:ss')
                : undefined
            }
            onChange={(_: any, date: string) => {
              onChange({
                ...value,
                value: date,
              });
            }}
          />
        );
      }
    } else if (type === 'boolean') {
      return (
        <Select
          style={{ width: '100%' }}
          placeholder={'请选择'}
          value={value?.value}
          onChange={(val) => {
            const obj = {
              ...value,
              value: [val],
            };
            onChange(obj);
          }}
        >
          {list.map((item) => (
            <Select.Option value={item.value}>{item.text}</Select.Option>
          ))}
        </Select>
      );
    } else if (type === 'string') {
      return (
        <Input
          style={{ width: '100%' }}
          value={value?.value}
          placeholder={'请输入'}
          onChange={(e) => {
            onChange({
              ...value,
              value: e.target.value,
            });
          }}
        />
      );
    } else {
      return (
        <>
          <Input
            value={value?.range ? value?.value?.[0] : undefined}
            onChange={(e) => {
              onChange({
                ...value,
                value: value?.range
                  ? [e.target.value, value?.value && value?.value[1]]
                  : e.target.value,
              });
            }}
          />
          {value.range && (
            <>
              ~
              <Input
                value={value?.value ? value?.value[1] : ''}
                onChange={(e) => {
                  onChange({
                    ...value,
                    value: [value?.value && value?.value[0], e.target.value],
                  });
                }}
              />
            </>
          )}
        </>
      );
    }
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {renderComponent()}
      {type !== 'boolean' && type !== 'string' && (
        <Checkbox
          style={{ minWidth: 60, marginLeft: 5 }}
          checked={value?.range}
          onChange={(e) => {
            onChange({
              ...value,
              value: e.target.checked ? [undefined, undefined] : undefined,
              range: e.target.checked,
            });
          }}
        >
          范围
        </Checkbox>
      )}
    </div>
  );
};
export default FIndicators;
