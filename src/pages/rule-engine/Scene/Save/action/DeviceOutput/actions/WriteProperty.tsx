import { Col, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import TypeModel from './TypeModel';
// import { useEffect, useState } from "react";

interface Props {
  properties: any[];
  value?: any;
  id?: string;
  onChange?: (value?: any) => void;
  propertiesChange?: (value?: string) => void;
}

// const item = {
//   a1: {
//     "value": 10,
//     "source": "fixed",
//   }
// }

export default (props: Props) => {
  const [propertiesId, setPropertiesId] = useState<string | undefined>(undefined);
  const [propertiesValue, setPropertiesValue] = useState(undefined);
  const [propertiesType, setPropertiesType] = useState('');
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    console.log(props.value);
    if (props.value) {
      if (props.properties && props.properties.length) {
        if (0 in props.value) {
          setPropertiesValue(props.value[0]);
        } else if ('undefined' in props.value) {
          // setPropertiesKey(undefined);
          setPropertiesValue(undefined);
        } else {
          Object.keys(props.value).forEach((key: string) => {
            // setPropertiesKey(key);
            setPropertiesValue(props.value[key].value);
            const propertiesItem = props.properties.find((item: any) => item.id === key);
            if (propertiesItem) {
              setPropertiesType(propertiesItem.valueType.type);
            }
          });
        }
      }
    } else {
      // setPropertiesKey(undefined);
      setPropertiesValue(undefined);
    }
  }, [props.value, props.properties]);

  useEffect(() => {
    // console.log(propertiesValue)
    if (props.onChange && propertiesValue) {
      const obj = {
        [propertiesId || 0]: {
          value: propertiesValue,
          source: source,
        },
      };
      props.onChange(obj);
    }
  }, [propertiesValue, source]);

  return (
    <Row gutter={24}>
      <Col span={12}>
        <Select
          id={props.id}
          value={props.value ? props.value[0] : undefined}
          options={props.properties.filter((item) => {
            if (item.expands && item.expands.type) {
              return item.expands.type.includes('write');
            }
            return false;
          })}
          fieldNames={{ label: 'name', value: 'id' }}
          style={{ width: '100%' }}
          placeholder={'请选择属性'}
          onChange={(e, option) => {
            setPropertiesId(e);
            setPropertiesType(option.valueType.type);
            console.log(option);
          }}
        ></Select>
      </Col>
      {propertiesId && (
        <Col span={12}>
          <TypeModel
            value={propertiesValue}
            type={propertiesType}
            onChange={(value, sources) => {
              setPropertiesValue(value);
              setSource(sources);
            }}
          />
        </Col>
      )}
    </Row>
  );
};
