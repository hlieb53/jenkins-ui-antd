import { Button, Modal } from 'antd';
import { createForm, Field, onFieldReact, onFieldValueChange, onFormInit } from '@formily/core';
import { createSchemaField } from '@formily/react';
import React, { useMemo, useRef } from 'react';
import * as ICONS from '@ant-design/icons';
import { Form, FormGrid, FormItem, Input, Select, NumberPicker, Password } from '@formily/antd';
import type { ISchema } from '@formily/json-schema';
import service from '@/pages/DataCollect/service';
import { onlyMessage } from '@/utils/util';
import { RadioCard } from '@/components';

interface Props {
  data: Partial<CollectorItem>;
  close: () => void;
  reload: () => void;
}

export default (props: Props) => {
  const channelRef = useRef<any>(null);
  const channelListRef = useRef<any[]>([]);

  const form = useMemo(
    () =>
      createForm({
        validateFirst: true,
        effects: () => {
          onFormInit(async (f) => {
            const response = await service.queryChannelNoPaging({});
            if (response.status === 200) {
              channelListRef.current = response.result;
              f.setFieldState('channelId', (state) => {
                state.dataSource = (response?.result || []).map((item: ChannelItem) => {
                  return {
                    value: item.id,
                    label: item.name,
                  };
                });
              });
            }
            if (props.data?.id) {
              const resp = await service.queryCollectorByID(props.data?.id);
              if (resp.status === 200) {
                form.setInitialValues(resp.result);
              }
            } else {
              f.setInitialValues({
                circuitBreaker: {
                  type: 'LowerFrequency',
                },
              });
            }
          });
          onFieldValueChange('channelId', (field, f) => {
            const value = (field as Field).value;
            if (value) {
              const dt = channelListRef.current.find((item) => item.id === value);
              channelRef.current = dt;
              f.setFieldState('configuration.unitId', (state) => {
                state.visible = dt?.provider && dt?.provider === 'MODBUS_TCP';
              });
              f.setFieldState('configuration.endian', (state) => {
                state.visible = dt?.provider && dt?.provider === 'MODBUS_TCP';
              });
            }
          });
          onFieldReact('circuitBreaker.type', async (field, f) => {
            const func = (field as Field).value;
            f.setFieldState('circuitBreaker.type', (state) => {
              let tooltip = '';
              if (func === 'LowerFrequency') {
                tooltip =
                  '连续20次异常，降低连接频率至原有频率的1/10（重试间隔不超过1分钟），故障处理后自动恢复至设定连接频率';
              } else if (func === 'Break') {
                tooltip = '连续10分钟异常，停止采集数据进入熔断状态，设备重新启用后恢复采集状态';
              } else if (func === 'Ignore') {
                tooltip = '忽略异常，保持原采集频率超时时间为5s';
              }
              state.decoratorProps = {
                tooltip: tooltip,
                gridSpan: 2,
              };
            });
          });
        },
      }),
    [props.data?.id],
  );

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      Select,
      NumberPicker,
      Password,
      FormGrid,
      RadioCard,
    },
    scope: {
      icon(name: any) {
        return React.createElement(ICONS[name]);
      },
    },
  });

  const schema: ISchema = {
    type: 'object',
    properties: {
      layout: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          minColumns: 2,
          columnGap: 24,
        },
        properties: {
          channelId: {
            title: '所属通道',
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请选择所属通道',
            },
            'x-disabled': !!props.data?.id,
            'x-validator': [
              {
                required: true,
                message: '请选择所属通道',
              },
            ],
          },
          name: {
            title: '采集器名称',
            'x-component': 'Input',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请输入名称',
            },
            'x-validator': [
              {
                required: true,
                message: '请输入名称',
              },
              {
                max: 64,
                message: '最多可输入64个字符',
              },
            ],
          },
          'configuration.unitId': {
            title: '从机地址',
            'x-component': 'NumberPicker',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请输入从机地址',
            },
            'x-visible': false,
            'x-validator': [
              {
                required: true,
                message: '请输入从机地址',
              },
              {
                max: 255,
                message: '请输入0-255之间的正整数',
              },
              {
                min: 0,
                message: '请输入0-255之间的正整数',
              },
            ],
          },
          'circuitBreaker.type': {
            title: '故障处理',
            'x-component': 'RadioCard',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请选择故障处理',
              model: 'singular',
              itemStyle: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                minWidth: '130px',
                height: '50px',
              },
              options: [
                { label: '降频', value: 'LowerFrequency' },
                { label: '熔断', value: 'Break' },
                { label: '忽略', value: 'Ignore' },
              ],
            },
            default: 'LowerFrequency',
            'x-validator': [
              {
                required: true,
                message: '请选择处理方式',
              },
            ],
          },
          'configuration.endian': {
            title: '高低位切换',
            'x-component': 'RadioCard',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
              tooltip: '统一配置所有点位的高低位切换',
            },
            'x-component-props': {
              placeholder: '请选择高低位切换',
              model: 'singular',
              itemStyle: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                minWidth: '130px',
                height: '50px',
              },
              options: [
                { label: 'AB', value: 'BIG' },
                { label: 'BA', value: 'LITTLE' },
              ],
            },
            'x-visible': false,
            default: 'BIG',
            'x-validator': [
              {
                required: true,
                message: '请选择大小端',
              },
            ],
          },
          description: {
            title: '说明',
            'x-component': 'Input.TextArea',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              rows: 3,
              showCount: true,
              maxLength: 200,
              placeholder: '请输入说明',
            },
          },
        },
      },
    },
  };

  const save = async () => {
    const value = await form.submit<CollectorItem>();
    let response: any = null;
    if (props.data?.id) {
      response = await service.updateCollector(props.data?.id, { ...props.data, ...value });
    } else {
      const obj = {
        ...value,
        provider: channelRef.current?.provider,
        channelName: channelRef.current?.name,
        configuration: {
          ...value.configuration,
        },
      };
      response = await service.saveCollector({ ...obj });
    }
    if (response && response?.status === 200) {
      onlyMessage('操作成功');
      props.reload();
    }
  };

  return (
    <Modal
      title={props?.data?.id ? '编辑' : '新增'}
      maskClosable={false}
      open
      onCancel={props.close}
      width={700}
      footer={[
        <Button key={1} onClick={props.close}>
          取消
        </Button>,
        <Button
          type="primary"
          key={2}
          onClick={() => {
            save();
          }}
        >
          确定
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <SchemaField schema={schema} />
      </Form>
    </Modal>
  );
};
