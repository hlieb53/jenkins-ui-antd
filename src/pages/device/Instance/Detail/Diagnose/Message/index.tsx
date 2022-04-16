import TitleComponent from '@/components/TitleComponent';
import './index.less';
import Dialog from './Dialog';
import { Button, Col, DatePicker, Empty, Input, InputNumber, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { InstanceModel, service } from '@/pages/device/Instance';
import useSendWebsocketMessage from '@/hooks/websocket/useSendWebsocketMessage';
import { map } from 'rxjs/operators';
import type { Field } from '@formily/core';
import { createForm, onFieldReact } from '@formily/core';
import { createSchemaField, FormProvider } from '@formily/react';
import {
  ArrayTable,
  DatePicker as FDatePicker,
  FormItem,
  Input as FInput,
  NumberPicker,
  PreviewText,
  Select as FSelect,
} from '@formily/antd';
import { randomString } from '@/utils/util';
import Log from './Log';
import { Store } from 'jetlinks-store';

interface Props {
  onChange: (type: string) => void;
}

const DatePicker1: any = DatePicker;

const Message = (props: Props) => {
  const [subscribeTopic] = useSendWebsocketMessage();
  const [dialogList, setDialogList] = useState<any[]>([]);
  const [logList, setLogList] = useState<any[]>([]);
  const [type, setType] = useState<'property' | 'function'>('function');
  const [input, setInput] = useState<any>({});
  const [inputs, setInputs] = useState<any[]>([]);

  const [propertyType, setPropertyType] = useState<'read' | 'setting'>('read');
  const [property, setProperty] = useState<any>({});
  const [propertyValue, setPropertyValue] = useState<any>('');

  const metadata = JSON.parse(InstanceModel.detail?.metadata || '{}');

  const subscribeLog = () => {
    const id = `device-debug-${InstanceModel.detail?.id}`;
    const topic = `/debug/device/${InstanceModel.detail?.id}/trace`;
    subscribeTopic!(id, topic, {})
      ?.pipe(map((res) => res.payload))
      .subscribe((payload: any) => {
        if (payload.error) {
          props.onChange(!payload.upstream ? 'down-error' : 'up-error');
        } else {
          props.onChange(!payload.upstream ? 'down-success' : 'up-success');
        }
        if (payload.type === 'log') {
          logList.push({
            key: randomString(),
            ...payload,
          });
          setLogList([...logList]);
        } else {
          dialogList.push({
            key: randomString(),
            ...payload,
          });
          setDialogList([...dialogList]);
          Store.set('diagnose', dialogList);
        }
        const chatBox = document.getElementById('dialog');
        if (chatBox) {
          chatBox.scrollTop = chatBox.scrollHeight;
        }
      });
  };

  const getItemNode = (t: string) => {
    switch (t) {
      case 'boolean':
        return (
          <Select
            style={{ width: '100%', textAlign: 'left' }}
            options={[
              { label: 'true', value: true },
              { label: 'false', value: false },
            ]}
            placeholder={'请选择'}
            onChange={(value) => {
              setPropertyValue(value);
            }}
          />
        );
      case 'int':
      case 'long':
      case 'float':
      case 'double':
        return (
          <InputNumber
            style={{ width: '100%' }}
            placeholder={'请输入'}
            onChange={(value) => {
              setPropertyValue(value);
            }}
          />
        );
      case 'date':
        return (
          <DatePicker1
            style={{ width: '100%' }}
            onChange={(value: any) => {
              setPropertyValue(value);
            }}
          />
        );
      default:
        return (
          <Input
            onChange={(e) => {
              setPropertyValue(e.target.value);
            }}
            placeholder="填写属性值"
            style={{ width: '100%' }}
          />
        );
    }
  };
  useEffect(() => {
    subscribeLog();
    const arr = Store.get('diagnose') || [];
    setDialogList(arr);
  }, []);

  const form = createForm({
    initialValues: {
      data: [...inputs],
    },
    effects() {
      onFieldReact('data.*.valueType.type', (field) => {
        const value = (field as Field).value;
        const format = field.query('..value').take() as any;
        if (format) {
          switch (value) {
            case 'date':
              format.setComponent(FDatePicker);
              break;
            case 'boolean':
              format.setComponent(FSelect);
              format.setDataSource([
                { label: '是', value: true },
                { label: '否', value: false },
              ]);
              break;
            case 'int':
              format.setComponent(NumberPicker);
              break;
            default:
              format.setComponent(FInput);
              break;
          }
        }
      });
    },
  });

  const dataRender = () => {
    switch (type) {
      case 'function':
        return (
          <Col span={5}>
            <Select
              style={{ width: '100%' }}
              onChange={(value: any) => {
                const data = (metadata?.functions || []).find((item: any) => item.id === value);
                setInput(data);
                setInputs(data?.inputs || []);
                form.setValues({
                  data: data?.inputs || [],
                });
              }}
            >
              {(metadata?.functions || []).map((i: any) => (
                <Select.Option key={i.id} value={i.id}>
                  {i.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        );
      case 'property':
        return (
          <>
            <Col span={5}>
              <Select
                style={{ width: '100%' }}
                value={propertyType}
                placeholder="请选择"
                onChange={(value: any) => {
                  setPropertyType(value);
                }}
              >
                <Select.Option value={'read'}>读取属性</Select.Option>
                <Select.Option value={'setting'}>设置属性</Select.Option>
              </Select>
            </Col>
            <Col span={5}>
              <Select
                style={{ width: '100%' }}
                value={property}
                placeholder="选择属性"
                onChange={(value: any) => {
                  setProperty(value);
                }}
              >
                {(metadata?.properties || []).map((i: any) => (
                  <Select.Option key={i.id} value={i.id}>
                    {i.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            {!!property && propertyType === 'setting' && (
              <Col span={5}>
                {getItemNode(
                  (metadata?.properties || []).find((it: any) => it.id === property)?.valueType
                    ?.type || '',
                )}
              </Col>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      FInput,
      ArrayTable,
      PreviewText,
      FSelect,
      FDatePicker,
      NumberPicker,
    },
  });

  const schema = {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        'x-decorator': 'FormItem',
        'x-component': 'ArrayTable',
        'x-component-props': {
          scroll: { x: '100%' },
        },
        items: {
          type: 'object',
          properties: {
            column1: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: '参数名称',
              },
              properties: {
                name: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'PreviewText.Input',
                },
              },
            },
            column2: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: '输入类型',
              },
              properties: {
                'valueType.type': {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'PreviewText.Input',
                },
              },
            },
            column3: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: '值',
              },
              properties: {
                value: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': FInput,
                },
              },
            },
          },
        },
      },
    },
  };

  return (
    <Row gutter={24}>
      <Col span={16}>
        <TitleComponent data="调试" />
        <div className="content">
          <div className="dialog" id="dialog">
            {dialogList.map((item) => (
              <Dialog data={item} key={item.key} />
            ))}
          </div>
        </div>
        <div className="function">
          <Row gutter={24}>
            <Col span={5}>
              <Select
                value={type}
                placeholder="请选择"
                style={{ width: '100%' }}
                onChange={(value) => {
                  setType(value);
                  setInputs([]);
                  setInput({});
                }}
              >
                <Select.Option value="function">调用功能</Select.Option>
                <Select.Option value="property">操作属性</Select.Option>
              </Select>
            </Col>
            {dataRender()}
            <Col span={3}>
              <Button
                type="primary"
                onClick={async () => {
                  props.onChange('waiting');
                  if (type === 'function') {
                    const list = (form?.values?.data || []).filter((it) => !!it.value);
                    const obj = {};
                    list.map((it) => {
                      obj[it.id] = it.value;
                    });
                    await service.executeFunctions(InstanceModel.detail?.id || '', input.id, {
                      ...obj,
                    });
                  } else {
                    if (propertyType === 'read') {
                      await service.readProperties(InstanceModel.detail?.id || '', [property]);
                    } else {
                      await service.settingProperties(InstanceModel.detail?.id || '', {
                        [property]: propertyValue,
                      });
                    }
                  }
                }}
              >
                发送
              </Button>
            </Col>
          </Row>
          {inputs.length > 0 && (
            <div className="parameter">
              <h4>功能参数</h4>
              <FormProvider form={form}>
                <SchemaField schema={schema} />
              </FormProvider>
            </div>
          )}
        </div>
      </Col>
      <Col span={8}>
        <div
          style={{
            paddingLeft: 20,
            borderLeft: '1px solid rgba(0, 0, 0, .09)',
            overflow: 'hidden',
            maxHeight: 600,
            overflowY: 'auto',
            minHeight: 400,
          }}
        >
          <TitleComponent data={'日志'} />
          <div style={{ marginTop: 10 }}>
            {logList.length > 0 ? (
              logList.map((item) => <Log data={item} key={item.key} />)
            ) : (
              <Empty />
            )}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Message;
