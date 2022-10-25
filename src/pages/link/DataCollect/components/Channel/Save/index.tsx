import { Button, Modal } from 'antd';
import { createForm, Field } from '@formily/core';
import { createSchemaField } from '@formily/react';
import React, { useEffect, useState } from 'react';
import * as ICONS from '@ant-design/icons';
import { Form, FormGrid, FormItem, Input, Select, NumberPicker, Password } from '@formily/antd';
import type { ISchema } from '@formily/json-schema';
import service from '@/pages/link/DataCollect/service';
import { onlyMessage } from '@/utils/util';
import { action } from '@formily/reactive';

interface Props {
  data: Partial<ChannelItem>;
  close: () => void;
  reload: () => void;
}

export default (props: Props) => {
  const [data, setData] = useState<Partial<ChannelItem>>(props.data);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (props.data?.id) {
      service.queryChannelByID(props.data.id).then((resp) => {
        if (resp.status === 200) {
          setData(resp.result);
        }
      });
    }
  }, [props.data]);

  const form = createForm({
    validateFirst: true,
    initialValues: data || {},
  });

  const getSecurityPolicyList = () => service.querySecurityPolicyList({});

  const useAsyncDataSource = (services: (arg0: Field) => Promise<any>) => (field: Field) => {
    field.loading = true;
    services(field).then(
      action.bound!((resp: any) => {
        field.dataSource = (resp?.result || []).map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        field.loading = false;
      }),
    );
  };

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      Select,
      NumberPicker,
      Password,
      FormGrid,
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
          name: {
            title: '名称',
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
          provider: {
            title: '通讯协议',
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请选择通讯协议',
            },
            enum: [
              { label: 'OPC_UA', value: 'OPC_UA' },
              { label: 'MODBUS_TCP', value: 'MODBUS_TCP' },
            ],
            'x-validator': [
              {
                required: true,
                message: '请选择通讯协议',
              },
            ],
          },
          'configuration.host': {
            title: 'Modbus主机IP',
            'x-component': 'Input',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请输入Modbus主机IP',
            },
            'x-validator': [
              {
                required: true,
                message: '请输入Modbus主机IP',
              },
            ],
            'x-reactions': {
              dependencies: ['..provider'],
              fulfill: {
                state: {
                  visible: '{{$deps[0]==="MODBUS_TCP"}}',
                },
              },
            },
          },
          'configuration.port': {
            title: '端口',
            'x-component': 'NumberPicker',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请输入端口',
            },
            default: 502,
            'x-validator': [
              {
                required: true,
                message: '请输入端口',
              },
              {
                max: 65535,
                message: '请输入0-65535之间的整整数',
              },
              {
                min: 0,
                message: '请输入0-65535之间的整整数',
              },
            ],
            'x-reactions': {
              dependencies: ['..provider'],
              fulfill: {
                state: {
                  visible: '{{$deps[0]==="MODBUS_TCP"}}',
                },
              },
            },
          },
          'configuration.endpoint': {
            title: '端点url',
            'x-component': 'Input',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请输入端点url',
            },
            'x-validator': [
              {
                required: true,
                message: '请输入端点url',
              },
            ],
            'x-reactions': {
              dependencies: ['..provider'],
              fulfill: {
                state: {
                  visible: '{{$deps[0]==="OPC_UA"}}',
                },
              },
            },
          },
          'configuration.securityPolicy': {
            title: '安全策略',
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请选择安全策略',
            },
            'x-validator': [
              {
                required: true,
                message: '请选择安全策略',
              },
            ],
            'x-reactions': [
              '{{useAsyncDataSource(getSecurityPolicyList)}}',
              {
                dependencies: ['..provider'],
                fulfill: {
                  state: {
                    visible: '{{$deps[0]==="OPC_UA"}}',
                  },
                },
              },
            ],
          },
          'configuration.username': {
            title: '用户名',
            'x-component': 'Input',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请输入用户名',
            },
            // 'x-validator': [
            //   {
            //     required: true,
            //     message: '请输入用户名',
            //   },
            // ],
            'x-reactions': {
              dependencies: ['..provider'],
              fulfill: {
                state: {
                  visible: '{{$deps[0]==="OPC_UA"}}',
                },
              },
            },
          },
          'configuration.password': {
            title: '密码',
            'x-component': 'Password',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请输入密码',
            },
            // 'x-validator': [
            //   {
            //     required: true,
            //     message: '请输入密码',
            //   },
            // ],
            'x-reactions': {
              dependencies: ['..provider'],
              fulfill: {
                state: {
                  visible: '{{$deps[0]==="OPC_UA"}}',
                },
              },
            },
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
    const value = await form.submit<ChannelItem>();
    setLoading(true);
    const response: any = props.data?.id
      ? await service.updateChannel(props.data?.id, { ...props.data, ...value })
      : await service.saveChannel({ ...props.data, ...value });
    setLoading(false);
    if (response && response?.status === 200) {
      onlyMessage('操作成功');
      props.reload();
    }
  };

  return (
    <Modal
      title={props?.data?.id ? '编辑' : '新增'}
      maskClosable={false}
      visible
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
          loading={loading}
        >
          确定
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <SchemaField schema={schema} scope={{ useAsyncDataSource, getSecurityPolicyList }} />
      </Form>
    </Modal>
  );
};
