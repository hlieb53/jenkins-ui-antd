import { InputNumber, Select } from 'antd';
import { useEffect, useState } from 'react';

interface InputNumberProps {
  value?: { time: number; unit: string };
  onChange?: (value: { time: number; unit: string }) => void;
}

export default (props: InputNumberProps) => {
  const [time, setTime] = useState(props.value?.time || 0);
  const [unit, setUnit] = useState(props.value?.unit || 'seconds');

  useEffect(() => {
    console.log('timer', props.value);
    setTime(props.value?.time || 0);
    setUnit(props.value?.unit || 'seconds');
  }, [props.value]);

  const TimeTypeAfter = (
    <Select
      value={unit}
      options={[
        { label: '秒', value: 'seconds' },
        { label: '分', value: 'minutes' },
        { label: '小时', value: 'hours' },
      ]}
      onChange={(key) => {
        if (props.onChange) {
          props.onChange({
            time: time,
            unit: key,
          });
        }
      }}
    />
  );

  return (
    <InputNumber
      value={time}
      addonAfter={TimeTypeAfter}
      style={{ width: 150 }}
      min={0}
      max={9999}
      onChange={(value) => {
        if (props.onChange) {
          props.onChange({
            time: value,
            unit,
          });
        }
      }}
    />
  );
};
