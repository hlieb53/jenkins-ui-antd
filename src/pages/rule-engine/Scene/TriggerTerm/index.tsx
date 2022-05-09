import { createSchemaField } from '@formily/react';
import {
  ArrayCards,
  ArrayItems,
  DatePicker,
  Form,
  FormGrid,
  FormItem,
  Input,
  NumberPicker,
  Select,
  Space,
  Switch,
  TreeSelect,
} from '@formily/antd';
import { ISchema } from '@formily/json-schema';
import {
  createForm,
  Field,
  onFieldReact,
  onFieldValueChange,
  onFormValuesChange,
} from '@formily/core';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import FTermArrayCards from '@/components/FTermArrayCards';
import FTermTypeSelect from '@/components/FTermTypeSelect';
import styles from './index.less';
import Service from '@/pages/rule-engine/Scene/service';
import { useAsyncDataSource } from '@/utils/util';
import { Store } from 'jetlinks-store';
import { treeFilter } from '@/utils/tree';
import FInputGroup from '@/components/FInputGroup';

const service = new Service('scene');

interface Props {
  // 查询下拉框的参数
  params: Record<string, any>;
  value?: Record<string, any>;
  onChange?: (value: any) => void;
}

const TriggerTerm = (props: Props, ref: any) => {
  const parseTermRef = useRef<any>();
  const getParseTerm = () =>
    service.getParseTerm(props.params).then((data) => {
      Store.set('trigger-parse-term', data);
      parseTermRef.current = data;
      const handleName = (_data: any): any => (
        <Space>
          {_data.name}
          <div style={{ color: 'grey', marginLeft: '5px' }}>{_data.fullName}</div>
          {_data.description && (
            <div style={{ color: 'grey', marginLeft: '5px' }}>({_data.description})</div>
          )}
        </Space>
      );
      const handleChildrenName = (_data: any[]): any[] => {
        if (_data?.length > 0) {
          return _data.map((it) => {
            if (it.children) {
              return {
                ...it,
                key: it.column,
                name: handleName(it),
                disabled: true,
                children: handleChildrenName(it.children),
              };
            }
            return { ...it, key: it.column, name: handleName(it) };
          });
        } else {
          return [];
        }
      };
      return data?.map((item: any) => {
        const disabled = item.children?.length > 0;
        return {
          column: item.column,
          key: item.column,
          name: handleName(item),
          disabled: disabled,
          children: handleChildrenName(item.children),
        };
      });
    });

  const form = useMemo(
    () =>
      createForm({
        validateFirst: true,
        initialValues: props.value,

        effects() {
          onFormValuesChange(async (f) => {
            if (props.onChange) {
              props.onChange(await f.submit());
            }
          });
          onFieldValueChange('trigger.*.terms.*.column', (field, form1) => {
            if (field.modified) {
              form1.setFieldState(field.query('.value'), (state) => {
                state.value = undefined;
              });
            }
          });
          onFieldReact('trigger.*.terms.*.column', async (field, form1) => {
            const operator = field.query('.termType');
            const value = (field as Field).value;

            // 找到选中的
            const _data = await service.getParseTerm(props.params);
            if (!_data) return;
            // 树形搜索
            const treeValue = treeFilter(_data, value, 'column');
            // 找到
            const target =
              treeValue && treeValue[0]?.children
                ? treeValue[0]?.children.find((item) => item.column === value)
                : treeValue[0];

            form1.setFieldState(operator, (state) => {
              state.dataSource = target?.termTypes?.map((item: any) => ({
                label: item.name,
                value: item.id,
              }));
              if (target?.termTypes?.length > 0) {
                state.value = 'eq';
              }
            });
            form1.setFieldState(field.query('.value.source'), (state) => {
              state.dataSource =
                target && target.metrics && target.metrics.length > 0
                  ? [
                      { label: '手动输入', value: 'manual' },
                      { label: '指标', value: 'metrics' },
                    ]
                  : [{ label: '手动输入', value: 'manual' }];
              state.value = 'manual';
            });
          });
          onFieldReact('trigger.*.terms.*.value.source', (field, form1) => {
            console.log(field, 'field');
            const params = field.query('..column').value();

            // 找到选中的
            const _data = Store.get('trigger-parse-term');
            if (!_data) return;
            // 树形搜索
            const treeValue = treeFilter(_data, params, 'column');
            // 找到
            const target =
              treeValue && treeValue[0] && treeValue[0].children
                ? treeValue[0]?.children.find((item) => item.column === params)
                : treeValue[0];

            const source = (field as Field).value;
            const value = field.query(source === 'manual' ? '.value' : '.metric');
            console.log(value, source, '指标测试', target);
            if (target) {
              if (source === 'manual') {
                // 手动输入
                const valueType = target.dataType;

                const valueTypeMap = {
                  int: NumberPicker,
                  float: NumberPicker,
                  double: NumberPicker,
                  long: NumberPicker,
                  string: Input,
                  date: DatePicker,
                  boolean: Switch,
                };

                form1.setFieldState(value, (state) => {
                  state.componentType = valueTypeMap[valueType];
                  if (valueType === 'date') {
                    state.componentProps = {
                      showTime: true,
                    };
                  }
                });
              } else if (source === 'metrics') {
                // 指标
                form1.setFieldState(value, (state) => {
                  state.componentType = Select;
                  state.dataSource = target?.metrics.map((item: any) => ({
                    label: item.name,
                    value: item.id,
                  }));
                });
              }
            }
          });
        },
      }),
    [props.value, props.params],
  );

  useImperativeHandle(ref, () => ({
    getTriggerForm: () => form.submit(),
  }));
  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      Select,
      ArrayCards,
      FTermArrayCards,
      ArrayItems,
      Space,
      FormGrid,
      FTermTypeSelect,
      TreeSelect,
      FInputGroup,
    },
  });

  const schema: ISchema = {
    type: 'object',
    properties: {
      trigger: {
        type: 'array',
        'x-component': 'FTermArrayCards',
        'x-decorator': 'FormItem',
        'x-component-props': {
          title: '分组',
        },
        items: {
          type: 'object',
          properties: {
            index: {
              type: 'void',
              'x-component': 'FTermArrayCards.Index',
            },
            terms: {
              type: 'array',
              'x-component': 'ArrayItems',
              'x-decorator': 'FormItem',
              items: {
                type: 'object',
                properties: {
                  // 关联类型
                  type: {
                    type: 'string',
                    // "x-decorator": 'FormItem',
                    'x-component': 'FTermTypeSelect',
                  },
                  layout: {
                    type: 'void',
                    'x-component': 'FormGrid',
                    'x-decorator-props': {
                      maxColumns: 24,
                      minColumns: 24,
                    },
                    properties: {
                      // columns
                      column: {
                        type: 'string',
                        // title: '日期',
                        'x-decorator': 'FormItem',
                        'x-component': 'TreeSelect',
                        'x-decorator-props': {
                          gridSpan: 6,
                        },
                        'x-component-props': {
                          placeholder: '请选择参数',
                          fieldNames: { value: 'column', label: 'name', options: 'children' },
                          // treeNodeLabelProp: 'name',
                        },
                        'x-reactions': '{{useAsyncDataSource(getParseTerm)}}',
                      },
                      termType: {
                        type: 'string',
                        // title: '输入框',
                        'x-decorator': 'FormItem',
                        'x-component': 'Select',
                        'x-decorator-props': {
                          gridSpan: 1,
                        },
                        'x-component-props': {
                          placeholder: '操作符',
                        },
                      },
                      value: {
                        type: 'object',
                        'x-component': 'FInputGroup',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          gridSpan: 4,
                          style: {
                            width: '100%',
                          },
                        },
                        'x-component-props': {
                          compact: true,
                          style: {
                            width: '100%',
                          },
                        },
                        properties: {
                          source: {
                            type: 'string',
                            'x-component': 'Select',
                            'x-decorator': 'FormItem',
                            'x-component-props': {
                              style: {
                                minWidth: '110px',
                              },
                            },
                          },
                          value: {
                            type: 'string',
                            'x-component': 'Input',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              style: {
                                width: 'calc(100% - 110px)',
                              },
                            },
                            'x-reactions': {
                              dependencies: ['.source'],
                              fulfill: {
                                state: {
                                  visible: '{{$deps[0]==="manual"}}',
                                },
                              },
                            },
                          },
                          metric: {
                            type: 'string',
                            'x-component': 'Select',
                            'x-decorator': 'FormItem',
                            'x-component-props': {
                              style: {
                                width: '100%',
                              },
                            },
                            'x-decorator-props': {
                              style: {
                                width: 'calc(100% - 110px)',
                              },
                            },
                            'x-reactions': {
                              dependencies: ['.source'],
                              fulfill: {
                                state: {
                                  visible: '{{$deps[0]==="metrics"}}',
                                },
                              },
                            },
                          },
                        },
                      },
                      remove: {
                        type: 'void',
                        'x-decorator': 'FormItem',
                        'x-component': 'ArrayItems.Remove',
                        'x-decorator-props': {
                          gridSpan: 1,
                        },
                      },
                    },
                  },
                },
              },
              properties: {
                add: {
                  type: 'void',
                  title: '添加条件',
                  'x-component': 'ArrayItems.Addition',
                },
              },
            },
            remove: {
              type: 'void',
              'x-component': 'FTermArrayCards.Remove',
            },
          },
        },
        properties: {
          addition: {
            type: 'void',
            title: '添加分组',
            'x-component': 'FTermArrayCards.Addition',
          },
        },
      },
    },
  };
  return (
    <Form form={form} layout="vertical" className={styles.form}>
      <SchemaField schema={schema} scope={{ useAsyncDataSource, getParseTerm }} />
    </Form>
  );
};

export default forwardRef(TriggerTerm);
