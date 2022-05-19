import { PageContainer } from '@ant-design/pro-layout';
import { createSchemaField } from '@formily/react';
import { ISchema } from '@formily/json-schema';
import { Card, Col, message, Row } from 'antd';
import {
  ArrayCollapse,
  ArrayTable,
  Form,
  FormButtonGroup,
  FormGrid,
  FormItem,
  Input,
  PreviewText,
  Select,
} from '@formily/antd';
import { PermissionButton } from '@/components';
import { useMemo } from 'react';
import { createForm, Field, onFieldReact, onFieldValueChange, onFormInit } from '@formily/core';
import { useAsyncDataSource } from '@/utils/util';
import { service } from '..';
import { Store } from 'jetlinks-store';
import { useParams } from 'umi';
import Doc from '@/pages/Northbound/DuerOS/Detail/Doc';
import _ from 'lodash';

const Save = () => {
  const SchemaField = createSchemaField({
    components: {
      FormGrid,
      FormItem,
      Input,
      Select,
      ArrayTable,
      ArrayCollapse,
      PreviewText,
    },
  });

  const { id } = useParams<{ id: string }>();

  const findProductMetadata = (_id: string) => {
    if (!_id) return;
    const _productList = Store.get('product-list');
    const _product = _productList?.find((item: any) => item.id === _id);
    return _product?.metadata && JSON.parse(_product.metadata || '{}');
  };

  const findApplianceType = (_id: string) => {
    if (!_id) return;
    const _productTypes = Store.get('product-types');
    console.log(_productTypes, 'tt');
    return _productTypes?.find((item: any) => item.id === _id);
  };

  const getProduct = () =>
    service.getProduct().then((resp) => {
      Store.set('product-list', resp.result);
      return resp.result;
    });

  const getTypes = () =>
    service.getTypes().then((resp) => {
      Store.set('product-types', resp.result);
      return resp.result;
    });

  const form = useMemo(
    () =>
      createForm({
        validateFirst: true,
        effects() {
          onFormInit(async (form1) => {
            await getTypes();
            await getProduct();
            if (id === ':id') return;
            const resp = await service.detail(id);
            /// 单独处理一下applianceType
            const _data = resp.result;
            if (_data) {
              _data.applianceType = _data?.applianceType?.value;
            }
            form1.setInitialValues(_data);
          });
          onFieldReact('actionMappings.*.layout.action', (field) => {
            const productType = field.query('applianceType').value();
            (field as Field).setDataSource(findApplianceType(productType)?.actions);
          });
          onFieldReact('actionMappings.*.layout.command.message.properties', (field) => {
            const product = field.query('id').value();
            (field as Field).setDataSource(findProductMetadata(product)?.properties);
          });
          onFieldReact('actionMappings.*.layout.command.message.functionId', (field) => {
            const product = field.query('id').value();
            (field as Field).setDataSource(findProductMetadata(product)?.functions);
          });
          onFieldValueChange(
            'actionMappings.*.layout.command.message.functionId',
            (field, form1) => {
              const functionId = field.value;
              if (!functionId) return;
              const product = field.query('id').value();
              const _functionList = findProductMetadata(product)?.functions;
              const _function =
                _functionList && _functionList.find((item: any) => item.id === functionId);
              form1.setFieldState(field.query('.function'), (state) => {
                state.value = _function?.inputs.map((item: any) => ({
                  ...item,
                  valueType: item?.valueType?.type,
                }));
              });
            },
          );
          onFieldReact('propertyMappings.*.layout.source', (field) => {
            const productType = field.query('applianceType').value();
            (field as Field).setDataSource(findApplianceType(productType)?.properties);
          });
          onFieldReact('propertyMappings.*.layout.target', (field) => {
            const product = field.query('id').value();
            (field as Field).setDataSource(findProductMetadata(product)?.properties);
          });
        },
      }),
    [],
  );

  const getProductProperties = (f: Field) => {
    const items =
      form
        .getValuesIn('propertyMappings')
        ?.map((i: { target: string[] }) => i.target?.map((j) => j)) || [];
    const checked = _.flatMap(items);
    const index = checked.findIndex((i) => i === f.value);
    checked.splice(index, 1);
    const _id = form.getValuesIn('id');
    const sourceList = findProductMetadata(_id)?.properties;
    const list = sourceList?.filter((i: { id: string }) => !checked.includes(i.id));
    return new Promise((resolve) => resolve(list));
  };

  const getDuerOSProperties = (f: Field) => {
    const items =
      form.getValuesIn('propertyMappings')?.map((i: { source: string }) => i.source) || [];
    const checked = [...items];
    const index = checked.findIndex((i) => i === f.value);
    checked.splice(index, 1);
    const _productType = form.getValuesIn('applianceType');
    const targetList = findApplianceType(_productType?.value)?.properties;
    console.log(targetList, 'list', _productType);
    const list = targetList?.filter((i: { id: string }) => !checked.includes(i.id));
    return new Promise((resolve) => resolve(list));
  };

  const schema: ISchema = {
    type: 'object',
    properties: {
      name: {
        title: '名称',
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-decorator-props': {
          gridSpan: 1,
        },
        required: true,
        'x-component-props': {
          placeholder: '请输入名称',
        },
        name: 'name',
      },
      layout: {
        type: 'void',
        'x-decorator': 'FormGrid',
        'x-decorator-props': {
          maxColumns: 2,
          minColumns: 2,
          columnGap: 24,
        },
        properties: {
          id: {
            title: '产品',
            'x-decorator-props': {
              gridSpan: 1,
            },
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择产品',
              fieldNames: {
                label: 'name',
                value: 'id',
              },
              showSearch: true,
              showArrow: true,
              filterOption: (input: string, option: any) =>
                option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0,
            },
            'x-reactions': '{{useAsyncDataSource(getProduct)}}',
            required: true,
          },
          applianceType: {
            title: '设备类型',
            'x-decorator-props': {
              gridSpan: 1,
            },
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择产品',
              fieldNames: {
                label: 'name',
                value: 'id',
              },
            },
            'x-reactions': '{{useAsyncDataSource(getTypes)}}',
            required: true,
          },
        },
      },
      actionMappings: {
        type: 'array',
        title: '动作映射',
        'x-component': 'ArrayCollapse',
        'x-decorator': 'FormItem',
        items: {
          type: 'object',
          'x-component': 'ArrayCollapse.CollapsePanel',
          'x-component-props': {
            header: '动作',
          },
          properties: {
            index: {
              type: 'void',
              'x-component': 'ArrayCollapse.Index',
            },
            layout: {
              type: 'void',
              'x-decorator': 'FormGrid',
              'x-decorator-props': {
                maxColumns: 2,
                minColumns: 2,
                columnGap: 24,
              },
              properties: {
                action: {
                  title: '动作',
                  'x-component': 'Select',
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    layout: 'vertical',
                    labelAlign: 'left',
                  },
                  required: true,
                  'x-component-props': {
                    fieldNames: {
                      label: 'name',
                      value: 'id',
                    },
                  },
                },
                actionType: {
                  title: '操作',
                  'x-component': 'Select',
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    layout: 'vertical',
                    labelAlign: 'left',
                  },
                  enum: [
                    { label: '下发指令', value: 'command' },
                    { label: '获取历史数据', value: 'latestData' },
                  ],
                },
                command: {
                  type: 'object',
                  properties: {
                    messageType: {
                      type: 'string',
                      title: '指令类型',
                      'x-decorator-props': {
                        layout: 'vertical',
                        labelAlign: 'left',
                        gridSpan: 2,
                      },
                      'x-component': 'Select',
                      'x-decorator': 'FormItem',
                      enum: [
                        { label: '读取属性', value: 'READ_PROPERTY' },
                        { label: '修改属性', value: 'WRITE_PROPERTY' },
                        { label: '调用功能', value: 'INVOKE_FUNCTION' },
                      ],
                      'x-reactions': {
                        dependencies: ['..actionType'],
                        fulfill: {
                          state: {
                            visible: '{{$deps[0]==="command"}}',
                          },
                        },
                      },
                    },
                    message: {
                      type: 'object',
                      properties: {
                        properties: {
                          title: '属性',
                          'x-component': 'Select',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            layout: 'vertical',
                            labelAlign: 'left',
                          },
                          'x-component-props': {
                            fieldNames: {
                              label: 'name',
                              value: 'id',
                            },
                          },
                          'x-reactions': [
                            {
                              dependencies: ['..messageType', '...actionType'],
                              fulfill: {
                                state: {
                                  visible:
                                    '{{["READ_PROPERTY","WRITE_PROPERTY"].includes($deps[0])||$deps[1]==="latestData"}}',
                                },
                              },
                            },
                            {
                              dependencies: ['..messageType', '...actionType'],
                              fulfill: {
                                state: {
                                  decoratorProps: {
                                    gridSpan:
                                      '{{($deps[0]==="READ_PROPERTY"||$deps[1]==="latestData")?2:1}}',
                                  },
                                },
                              },
                            },
                          ],
                        },
                        value: {
                          title: '值',
                          'x-component': 'Input',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            layout: 'vertical',
                            labelAlign: 'left',
                          },
                          'x-reactions': {
                            dependencies: ['..messageType'],
                            fulfill: {
                              state: {
                                visible: '{{["WRITE_PROPERTY"].includes($deps[0])}}',
                              },
                            },
                          },
                        },
                        functionId: {
                          title: '功能',
                          'x-component': 'Select',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            layout: 'vertical',
                            labelAlign: 'left',
                            gridSpan: 2,
                          },
                          'x-component-props': {
                            fieldNames: {
                              label: 'name',
                              value: 'id',
                            },
                          },
                          'x-reactions': {
                            dependencies: ['..messageType'],
                            fulfill: {
                              state: {
                                visible: '{{["INVOKE_FUNCTION"].includes($deps[0])}}',
                              },
                            },
                          },
                        },
                        inputs: {
                          title: '参数列表',
                          type: 'array',
                          'x-component': 'ArrayTable',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            layout: 'vertical',
                            labelAlign: 'left',
                            gridSpan: 2,
                          },
                          'x-component-props': {
                            pagination: { pageSize: 10 },
                          },
                          items: {
                            type: 'object',
                            properties: {
                              column1: {
                                type: 'void',
                                'x-component': 'ArrayTable.Column',
                                'x-component-props': { width: 50, title: '参数名称' },
                                properties: {
                                  name: {
                                    type: 'string',
                                    'x-component': 'PreviewText.Input',
                                  },
                                },
                              },
                              column2: {
                                type: 'void',
                                'x-component': 'ArrayTable.Column',
                                'x-component-props': { width: 50, title: '类型' },
                                properties: {
                                  valueType: {
                                    type: 'string',
                                    'x-component': 'PreviewText.Input',
                                  },
                                },
                              },
                              column3: {
                                type: 'void',
                                'x-component': 'ArrayTable.Column',
                                'x-component-props': { width: 50, title: '值' },
                                properties: {
                                  value: {
                                    type: 'string',
                                    'x-component': 'Input',
                                  },
                                },
                              },
                            },
                          },
                          'x-reactions': {
                            dependencies: ['..messageType'],
                            fulfill: {
                              state: {
                                visible: '{{["INVOKE_FUNCTION"].includes($deps[0])}}',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            remove: {
              type: 'void',
              'x-component': 'ArrayCollapse.Remove',
            },
          },
        },
        properties: {
          addition: {
            type: 'void',
            title: '新增动作',
            'x-component': 'ArrayCollapse.Addition',
          },
        },
      },
      propertyMappings: {
        title: '属性映射',
        type: 'array',
        'x-component': 'ArrayCollapse',
        'x-decorator': 'FormItem',
        items: {
          type: 'object',
          'x-component': 'ArrayCollapse.CollapsePanel',
          'x-component-props': {
            header: '动作',
          },
          properties: {
            index: {
              type: 'void',
              'x-component': 'ArrayCollapse.Index',
            },
            layout: {
              type: 'void',
              'x-decorator': 'FormGrid',
              'x-decorator-props': {
                maxColumns: 2,
                minColumns: 2,
                columnGap: 24,
              },
              properties: {
                source: {
                  title: 'DuerOS属性',
                  'x-component': 'Select',
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    layout: 'vertical',
                    labelAlign: 'left',
                  },
                  'x-component-props': {
                    fieldNames: {
                      label: 'name',
                      value: 'id',
                    },
                  },
                  'x-reactions': ['{{useAsyncDataSource(getDuerOSProperties)}}'],
                },
                target: {
                  title: '平台属性',
                  'x-component': 'Select',
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    layout: 'vertical',
                    labelAlign: 'left',
                  },
                  'x-component-props': {
                    fieldNames: {
                      label: 'name',
                      value: 'id',
                    },
                    mode: 'tags',
                  },
                  'x-reactions': ['{{useAsyncDataSource(getProductProperties)}}'],
                },
              },
            },
            remove: {
              type: 'void',
              'x-component': 'ArrayCollapse.Remove',
            },
          },
        },
        properties: {
          addition: {
            type: 'void',
            title: '新增属性',
            'x-component': 'ArrayCollapse.Addition',
          },
        },
      },
      description: {
        title: '说明',
        'x-component': 'Input.TextArea',
        'x-decorator': 'FormItem',
        'x-component-props': {
          rows: 3,
          showCount: true,
          maxLength: 200,
          placeholder: '请输入说明',
        },
      },
    },
  };

  const handleSave = async () => {
    const data: any = await form.submit();
    const productName = Store.get('product-list')?.find((item: any) => item.id === data.id)?.name;
    const resp: any = await service.savePatch({ ...data, productName });
    if (resp.status === 200) {
      message.success('保存成功!');
    } else {
      message.error('保存失败!');
    }
    history.back();
  };
  return (
    <PageContainer className={'page-title-show'}>
      <Card>
        <Row>
          <Col span={12}>
            <Form layout="vertical" form={form}>
              <SchemaField
                schema={schema}
                scope={{
                  useAsyncDataSource,
                  getTypes,
                  getProduct,
                  getProductProperties,
                  getDuerOSProperties,
                }}
              />
              <FormButtonGroup.Sticky>
                <FormButtonGroup.FormItem>
                  <PermissionButton isPermission={true} type="primary" onClick={handleSave}>
                    保存
                  </PermissionButton>
                </FormButtonGroup.FormItem>
              </FormButtonGroup.Sticky>
            </Form>
          </Col>
          <Col span={10} push={2}>
            <Doc />
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default Save;
