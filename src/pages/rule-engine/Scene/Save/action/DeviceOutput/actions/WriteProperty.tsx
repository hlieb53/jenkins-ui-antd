import { Col, Row, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import TypeModel from './TypeModel';
// import { useEffect, useState } from "react";

interface Props {
  properties: any[];
  value?: any;
  id?: string;
  onChange?: (value?: any, text?: any) => void;
  propertiesChange?: (value?: string) => void;
  name?: any;
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
  const [source, setSource] = useState<string>('fixed');
  const textRef = useRef<any>('');
  const [format, setFormat] = useState<any>('HH:mm:ss');
  const [enumList, setEnumList] = useState<any>([]);

  useEffect(() => {
    console.log(props.value);
    if (props.value) {
      if (props.properties && props.properties.length) {
        if (0 in props.value) {
          setPropertiesValue(props.value[0]);
        } else if ('undefined' in props.value) {
          setPropertiesValue(undefined);
        } else {
          Object.keys(props.value).forEach((key: string) => {
            setPropertiesId(key);
            setPropertiesValue(props.value[key].value);
            setSource(props.value[key].source);
            const propertiesItem = props.properties.find((item: any) => item.id === key);
            if (propertiesItem) {
              setPropertiesType(propertiesItem.valueType.type);
            }
          });
        }
      }
    } else {
      setPropertiesValue(undefined);
    }
  }, [props.properties]);

  useEffect(() => {
    if (props.onChange && propertiesValue) {
      const obj = {
        [propertiesId || 0]: {
          value: propertiesValue,
          source: source,
        },
      };
      props.onChange(obj, textRef.current);
    }
  }, [propertiesValue, source]);

  return (
    <Row gutter={24}>
      <Col span={12}>
        <Select
          id={props.id}
          value={props.value ? propertiesId : undefined}
          options={props.properties?.filter((item) => {
            if (item.expands && item.expands.type) {
              return item.expands.type.includes('write');
            }
            return false;
          })}
          fieldNames={{ label: 'name', value: 'id' }}
          style={{ width: '100%' }}
          placeholder={'请选择属性'}
          onChange={(e, option) => {
            // console.log(option);
            setPropertiesId(e);
            setPropertiesType(option.valueType.type);
            setFormat(option.valueType?.format);
            setEnumList(option.valueType?.elements);
            textRef.current = option.name;
            setPropertiesValue(undefined);
          }}
        ></Select>
      </Col>
      {propertiesId && (
        <Col span={12}>
          <TypeModel
            value={propertiesValue}
            type={propertiesType}
            name={props.name}
            source={source}
            format={format}
            elements={enumList}
            onChange={(value, sources) => {
              // console.log(value, sources);
              setPropertiesValue(value);
              setSource(sources);
            }}
          />
        </Col>
      )}
    </Row>
  );
};
