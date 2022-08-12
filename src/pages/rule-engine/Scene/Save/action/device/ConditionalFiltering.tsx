import { Col, Form, Select, InputNumber, Input, DatePicker, Space, TreeSelect } from 'antd';
import { ItemGroup } from '@/pages/rule-engine/Scene/Save/components';
import type { FormInstance } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import { queryBuiltInParams } from '@/pages/rule-engine/Scene/Save/action/service';

interface ConditionalFilteringProps {
  name: number;
  form: FormInstance;
  data?: any;
  productId: string;
  propertiesId?: string;
}

const getFormValueByName = (name: string[], values: any) => {
  return name.reduce((prev, next) => {
    return prev ? prev[next] : values[next];
  }, '');
};

export default (props: ConditionalFilteringProps) => {
  const [builtInList, setBuiltInList] = useState<any[]>([]);
  const [source, setSource] = useState<any>('fixed');
  const [type, setType] = useState('string');
  const [termTypes, setTermTypes] = useState([]);

  const valueTypeMap = (_type: string) => {
    switch (_type) {
      case 'init':
      case 'float':
      case 'double':
      case 'long':
        return <InputNumber placeholder={'请输入过滤条件值'} />;
      case 'date':
        return (
          <>
            {
              // @ts-ignore
              <DatePicker />
            }
          </>
        );
      case 'boolean':
        return (
          <Select
            placeholder={'请选择过滤条件值'}
            options={[
              { label: '是', value: 'true' },
              { label: '否', value: 'false' },
            ]}
          />
        );
      default:
        return <Input placeholder={'请输入过滤条件值'} />;
    }
  };

  const handleName = (data: any) => {
    return (
      <Space>
        {data.name}
        {data.description && (
          <div style={{ color: 'grey', marginLeft: '5px' }}>({data.description})</div>
        )}
      </Space>
    );
  };

  const getTreeItem = (data: any, id: string): any => {
    let _item = undefined;
    data.some((item: any) => {
      if (item.id === id) {
        _item = item;
        return true;
      }
      if (item.children) {
        _item = getTreeItem(item.children, id);
        return !!_item;
      }
      return false;
    });
    return _item;
  };

  const handleTreeData = (data: any): any[] => {
    if (data.length > 0) {
      return data.map((item: any) => {
        const name = handleName(item);
        if (item.children) {
          return { ...item, name, disabled: true, children: handleTreeData(item.children) };
        }
        return { ...item, name };
      });
    }
    return [];
  };

  const getItemByChildren = (id: string, data: any[]) => {
    let BuiltItem = undefined;
    data.forEach((_item) => {
      if (_item.id === id) {
        BuiltItem = _item;
      } else if (_item.children) {
        BuiltItem = getItemByChildren(id, _item.children);
      }
    });
    return BuiltItem;
  };

  const getBuiltItemById = useCallback(
    (id: string) => {
      const builtItem: any = getItemByChildren(id, builtInList);
      if (builtItem) {
        setType(builtItem.type);
        setTermTypes(builtItem.termTypes);
      }
      return builtItem ? builtItem : {};
    },
    [builtInList],
  );

  const getBuiltInParamsData = () => {
    const data = props.form.getFieldsValue();
    queryBuiltInParams(data, { action: props.name }).then((res: any) => {
      if (res.status === 200) {
        // const actionParams = res.result.filter(
        //   (item: any) => item.id === `action_${props.name + 1}`,
        // );
        setBuiltInList(handleTreeData(res.result));
      }
    });
  };

  useEffect(() => {
    if (props.data && props.data[0] && props.data[0].column) {
      if (builtInList && builtInList.length) {
        getBuiltItemById(props.data[0].column);
      }
    }
  }, [props.data, builtInList]);

  useEffect(() => {
    if (props.data && props.data[0] && props.data[0].column) {
      setSource(props.data[0].value.source);
    }
    getBuiltInParamsData();
  }, []);

  useEffect(() => {
    if (props.productId || props.propertiesId) {
      getBuiltInParamsData();
      const actions = props.form.getFieldValue('actions');
      if (actions?.[props.name].terms?.[0]) {
        actions[props.name].terms[0] = {
          column: undefined,
          termType: undefined,
          value: {
            source: 'fixed',
            value: undefined,
          },
        };
      }
      setSource('fixed');
    }
  }, [props.productId, props.propertiesId]);

  return (
    <>
      <Col span={4}>
        <Form.Item name={[props.name, 'terms', 0, 'column']}>
          <TreeSelect
            placeholder={'请选择参数'}
            fieldNames={{
              value: 'id',
              label: 'name',
            }}
            treeData={builtInList}
            onSelect={() => {
              props.form.setFields([
                {
                  name: [props.name, 'terms', 0, 'termType'],
                  value: undefined,
                },
                {
                  name: [props.name, 'terms', 0, 'value', 'source'],
                  value: 'fixed',
                },
                {
                  name: [props.name, 'terms', 0, 'value', 'value'],
                  value: undefined,
                },
                {
                  name: [props.name, 'terms', 0, 'value', 'value', 0],
                  value: undefined,
                },
                {
                  name: [props.name, 'terms', 0, 'value', 'value', 1],
                  value: undefined,
                },
              ]);
            }}
          />
        </Form.Item>
      </Col>
      <Form.Item
        noStyle
        dependencies={[props.name, 'terms', 0, 'column']}
        shouldUpdate={(prevValues, curValues) => {
          console.log(['actions', `${props.name}`, 'terms', '0', 'column']);
          const pValue = getFormValueByName(
            ['actions', `${props.name}`, 'terms', '0', 'column'],
            prevValues,
          );
          const cValue = getFormValueByName(
            ['actions', `${props.name}`, 'terms', '0', 'column'],
            curValues,
          );
          return pValue !== cValue;
        }}
      >
        {({ getFieldValue }) => {
          const column = getFieldValue(['actions', `${props.name}`, 'terms', '0', 'column']);
          const columnItem = getTreeItem(builtInList, column);
          return (
            columnItem?.type !== 'boolean' && (
              <Col span={3}>
                <Form.Item name={[props.name, 'terms', 0, 'termType']}>
                  <Select
                    style={{ width: '100%' }}
                    options={termTypes}
                    fieldNames={{ value: 'id', label: 'name' }}
                    placeholder={'操作符'}
                  />
                </Form.Item>
              </Col>
            )
          );
        }}
      </Form.Item>

      <Col span={8}>
        <Form.Item noStyle>
          <ItemGroup>
            <Form.Item name={[props.name, 'terms', 0, 'value', 'source']} initialValue={'fixed'}>
              <Select
                options={[
                  { label: '手动输入', value: 'fixed' },
                  { label: '内置参数', value: 'upper' },
                ]}
                style={{ width: 120 }}
                onSelect={(v: any) => {
                  setSource(v);
                  if (
                    ['nbtw', 'btw'].includes(
                      props.data && props.data[0] && props.data[0].termType,
                    ) &&
                    source === 'fixed'
                  ) {
                    props.form.setFields([
                      {
                        name: [props.name, 'terms', 0, 'value', 'value', 0],
                        value: undefined,
                      },
                      {
                        name: [props.name, 'terms', 0, 'value', 'value', 1],
                        value: undefined,
                      },
                    ]);
                  } else {
                    props.form.setFields([
                      {
                        name: [props.name, 'terms', 0, 'value', 'value'],
                        value: undefined,
                      },
                    ]);
                  }
                }}
              />
            </Form.Item>
            {['nbtw', 'btw'].includes(props.data && props.data[0] && props.data[0].termType) &&
            source === 'fixed' ? (
              <>
                <Form.Item name={[props.name, 'terms', 0, 'value', 'value', 0]}>
                  {source === 'fixed' ? (
                    valueTypeMap(type)
                  ) : (
                    <TreeSelect
                      placeholder={'请选择参数'}
                      fieldNames={{ value: 'id', label: 'name' }}
                      treeData={builtInList}
                    />
                  )}
                </Form.Item>
                <Form.Item name={[props.name, 'terms', 0, 'value', 'value', 1]}>
                  {source === 'fixed' ? (
                    valueTypeMap(type)
                  ) : (
                    <TreeSelect
                      placeholder={'请选择参数'}
                      fieldNames={{ value: 'id', label: 'name' }}
                      treeData={builtInList}
                    />
                  )}
                </Form.Item>
              </>
            ) : (
              <Form.Item name={[props.name, 'terms', 0, 'value', 'value']}>
                {source === 'fixed' ? (
                  valueTypeMap(type)
                ) : (
                  <TreeSelect
                    placeholder={'请选择参数'}
                    fieldNames={{ value: 'id', label: 'name' }}
                    treeData={builtInList}
                  />
                )}
              </Form.Item>
            )}
          </ItemGroup>
        </Form.Item>
      </Col>
      <Col>
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', paddingBottom: 24 }}>
          执行后续动作
        </div>
      </Col>
    </>
  );
};
