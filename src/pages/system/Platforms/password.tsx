import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { Form, FormGrid, FormItem, Password } from '@formily/antd';
import { message, Modal } from 'antd';
import { useMemo, useState } from 'react';
import type { ISchema } from '@formily/json-schema';
import { service } from '@/pages/system/Platforms/index';

interface SaveProps {
  visible: boolean;
  data?: any;
  onReload?: () => void;
  onCancel?: () => void;
}

export default (props: SaveProps) => {
  const [loading, setLoading] = useState(false);

  const SchemaField = createSchemaField({
    components: {
      Form,
      FormGrid,
      FormItem,
      Password,
    },
  });

  const form = useMemo(
    () =>
      createForm({
        validateFirst: true,
        initialValues: props.data || { oath2: true },
      }),
    [props.data],
  );

  const schema: ISchema = {
    type: 'object',
    properties: {
      password: {
        type: 'string',
        title: '密码',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Password',
        'x-component-props': {
          placeholder: '请输入密码',
        },
        'x-decorator-props': {
          gridSpan: 1,
        },
        'x-reactions': [
          {
            dependencies: ['.confirm_password'],
            fulfill: {
              state: {
                selfErrors:
                  '{{$deps[0] && $self.value && $self.value !== $deps[0] ? "确认密码不匹配" : ""}}',
              },
            },
          },
        ],
        'x-validator': [
          {
            max: 64,
            message: '最多可输入64个字符',
          },
          {
            required: true,
            message: '请输入密码',
          },
        ],
      },
      confirm_password: {
        type: 'string',
        title: '确认密码',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Password',
        'x-component-props': {
          placeholder: '请再次输入密码',
        },
        'x-decorator-props': {
          gridSpan: 1,
        },
        'x-reactions': [
          {
            dependencies: ['.password'],
            fulfill: {
              state: {
                selfErrors:
                  '{{$deps[0] && $self.value && $self.value !== $deps[0] ? "确认密码不匹配" : ""}}',
              },
            },
          },
        ],
        'x-validator': [
          {
            max: 64,
            message: '最多可输入64个字符',
          },
          {
            required: true,
            message: '请输入确认密码',
          },
        ],
      },
      id: {
        type: 'string',
        'x-hidden': true,
      },
    },
  };

  /**
   * 关闭Modal
   * @param type 是否需要刷新外部table数据
   * @param id 传递上级部门id，用于table展开父节点
   */
  const modalClose = () => {
    if (props.onCancel) {
      props.onCancel();
    }
  };

  const saveData = async () => {
    // setLoading(true)
    const data: any = await form.submit();
    console.log(data);
    if (data) {
      setLoading(true);
      const resp = await service.update(data);
      setLoading(false);
      if (resp.status === 200) {
        if (props.onReload) {
          props.onReload();
        }
        modalClose();
        message.success('操作成功');
      }
    }
  };

  return (
    <Modal
      maskClosable={false}
      visible={props.visible}
      destroyOnClose={true}
      confirmLoading={loading}
      onOk={saveData}
      onCancel={modalClose}
      width={880}
      title={'重置密码'}
    >
      <Form form={form} layout={'vertical'}>
        <SchemaField schema={schema} />
      </Form>
    </Modal>
  );
};
