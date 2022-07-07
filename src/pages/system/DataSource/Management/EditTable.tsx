import { randomString } from '@/utils/util';
import { ArrayTable, Editable, Form, FormItem, Input, NumberPicker, Radio } from '@formily/antd';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { Button } from 'antd';
import RemoveData from './RemoveData';

interface Props {
  onChange: (data: any) => void;
  data: Partial<DataSourceItem>[];
  table: {
    id: string;
    table: string;
  };
}

const EditTable = (props: Props) => {
  const _data = (props?.data || []).map((item) => ({ ...item, old_id: randomString() })) || [];
  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Editable,
      Input,
      ArrayTable,
      NumberPicker,
      Radio,
      RemoveData,
    },
  });

  const form = createForm({
    initialValues: {
      array: _data,
    },
  });

  const schema = {
    type: 'object',
    properties: {
      array: {
        type: 'array',
        'x-decorator': 'FormItem',
        'x-component': 'ArrayTable',
        'x-component-props': {
          pagination: { pageSize: 10 },
          scroll: { x: '100%' },
        },
        items: {
          type: 'object',
          properties: {
            column1: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { title: '列名' },
              properties: {
                old_id: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-hidden': true,
                },
                name: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: '请输入名称',
                  },
                  name: 'name',
                  'x-validator': [
                    {
                      max: 64,
                      message: '最多可输入64个字符',
                    },
                    {
                      required: true,
                      message: '请输入名称',
                    },
                  ],
                  required: true,
                  'x-reactions': (field: any) => {
                    const old_id = field.query('.old_id').take().value;
                    const flag = _data.find((item: any) => {
                      return old_id && item?.old_id && item?.old_id === old_id;
                    });
                    field.disabled = !!flag;
                  },
                },
              },
            },
            column2: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { title: '类型' },
              properties: {
                type: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: '请输入类型',
                  },
                  name: 'typeId',
                  'x-validator': [
                    {
                      required: true,
                      message: '请输入类型',
                    },
                    {
                      max: 64,
                      message: '最多可输入64个字符',
                    },
                  ],
                  required: true,
                },
              },
            },
            column3: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { title: '长度' },
              properties: {
                length: {
                  type: 'number',
                  'x-decorator': 'FormItem',
                  'x-component': 'NumberPicker',
                  'x-component-props': {
                    placeholder: '请输入长度',
                  },
                  default: 0,
                  'x-validator': [
                    // {
                    //   required: true,
                    //   message: '请输入长度',
                    // },
                    {
                      maximum: 99999,
                      minimum: 0,
                    },
                  ],
                  // required: true,
                },
              },
            },
            column4: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { title: '精度' },
              properties: {
                precision: {
                  type: 'number',
                  'x-decorator': 'FormItem',
                  'x-component': 'NumberPicker',
                  'x-component-props': {
                    placeholder: '请输入精度',
                  },
                  default: 0,
                  'x-validator': [
                    // {
                    //   required: true,
                    //   message: '请输入精度',
                    // },
                    {
                      maximum: 99999,
                      minimum: 0,
                    },
                  ],
                  // required: true,
                },
              },
            },
            column5: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { width: 120, title: '不能为空' },
              properties: {
                notnull: {
                  type: 'boolean',
                  default: false,
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  'x-component-props': {
                    placeholder: '请选择是否不能为空',
                    optionType: 'button',
                    buttonStyle: 'solid',
                  },
                  'x-validator': [
                    {
                      required: true,
                      message: '请选择是否不能为空',
                    },
                  ],
                  required: true,
                  enum: [
                    {
                      label: '是',
                      value: true,
                    },
                    {
                      label: '否',
                      value: false,
                    },
                  ],
                },
              },
            },
            column6: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { title: '说明' },
              properties: {
                comment: {
                  'x-component': 'Input',
                  'x-decorator': 'FormItem',
                  'x-component-props': {
                    placeholder: '请输入说明',
                  },
                },
              },
            },
            column7: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: '操作',
                dataIndex: 'operations',
                width: 50,
              },
              properties: {
                item: {
                  type: 'void',
                  'x-component': 'FormItem',
                  properties: {
                    remove: {
                      type: 'number',
                      'x-component': 'RemoveData',
                      'x-component-props': {
                        type: props.table,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        properties: {
          add: {
            type: 'void',
            'x-component': 'ArrayTable.Addition',
            title: '新增行',
          },
        },
      },
    },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="primary"
          style={{ marginBottom: 20 }}
          onClick={async () => {
            const data: any = await form.submit();
            const list = (data?.array || []).map((i: any) => {
              const { old_id, ...extra } = i;
              return { ...extra };
            });
            props.onChange({ array: list });
          }}
        >
          保存
        </Button>
      </div>
      <Form form={form}>
        <SchemaField schema={schema} />
      </Form>
    </div>
  );
};

export default EditTable;
