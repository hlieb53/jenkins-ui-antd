import { Button, Drawer, Dropdown, Menu, message } from 'antd';
import { createSchemaField, observer } from '@formily/react';
import MetadataModel from '../model';
import type { Field, IFieldState } from '@formily/core';
import { createForm } from '@formily/core';
import {
  ArrayItems,
  Editable,
  Form,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Radio,
  Select,
  Space,
} from '@formily/antd';
import type { ISchema } from '@formily/json-schema';
import {
  DataTypeList,
  DateTypeList,
  EventLevel,
  FileTypeList,
  PropertySource,
} from '@/pages/device/data';
import { useMemo } from 'react';
import { productModel } from '@/pages/device/Product';
import { service } from '@/pages/device/components/Metadata';
import { Store } from 'jetlinks-store';
import type { DeviceMetadata, MetadataItem } from '@/pages/device/Product/typings';

import JsonParam from '@/components/Metadata/JsonParam';
import ArrayParam from '@/components/Metadata/ArrayParam';
import EnumParam from '@/components/Metadata/EnumParam';
import BooleanEnum from '@/components/Metadata/BooleanParam';
import ConfigParam from '@/components/Metadata/ConfigParam';
import { useIntl } from '@@/plugin-locale/localeExports';
import { lastValueFrom } from 'rxjs';
import SystemConst from '@/utils/const';
import DB from '@/db';
import _ from 'lodash';
import { useParams } from 'umi';
import { InstanceModel } from '@/pages/device/Instance';
import FRuleEditor from '@/components/FRuleEditor';
import { action } from '@formily/reactive';

interface Props {
  type: 'product' | 'device';
}

const Edit = observer((props: Props) => {
  const intl = useIntl();
  const form = useMemo(
    () =>
      createForm({
        initialValues: MetadataModel.item as Record<string, unknown>,
      }),
    [],
  );

  const schemaTitleMapping = {
    properties: {
      title: intl.formatMessage({
        id: 'pages.device.productDetail.metadata.dataType',
        defaultMessage: '数据类型',
      }),
    },
    events: {
      title: intl.formatMessage({
        id: 'pages.device.productDetail.metadata.outputParameters',
        defaultMessage: '输出参数',
      }),
    },
    functions: {
      title: intl.formatMessage({
        id: 'pages.device.productDetail.metadata.outputParameters',
        defaultMessage: '输出参数',
      }),
    },
    tags: {
      title: intl.formatMessage({
        id: 'pages.device.productDetail.metadata.dataType',
        defaultMessage: '数据类型',
      }),
    },
  };

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      Select,
      NumberPicker,
      Radio,
      Editable,
      ArrayItems,
      Space,
      FormLayout,
      JsonParam,
      ArrayParam,
      EnumParam,
      BooleanEnum,
      ConfigParam,
      FRuleEditor,
    },
    scope: {
      async asyncOtherConfig(field: Field) {
        const typeField = field.query('..valueType.type').take() as IFieldState;
        const idField = field.query('..id').take() as IFieldState;
        if (!typeField || !idField) return;
        const type = typeField.value;
        const id = idField.value;
        // 获取配置
        const productId = productModel.current?.id;
        if (!productId || !id || !type) return;
        const config = (await lastValueFrom(
          service.getMetadataConfig({
            deviceId: productId,
            metadata: {
              id,
              type: 'property',
              dataType: type,
            },
          }),
        )) as unknown[];
        field.setState({
          visible: config.length > 0,
        });
        field.setComponentProps({
          config,
        });
      },
    },
  });

  const valueTypeConfig = {
    type: 'object',
    'x-index': 4,
    properties: {
      type: {
        title: schemaTitleMapping[MetadataModel.type].title,
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        enum: DataTypeList,
      },
      unit: {
        title: intl.formatMessage({
          id: 'pages.device.instanceDetail.metadata.unit',
          defaultMessage: '单位',
        }),
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-visible': false,
        'x-reactions': [
          {
            dependencies: ['.type'],
            fulfill: {
              state: {
                visible: "{{['int','float','long','double'].includes($deps[0])}}",
              },
            },
          },
          '{{useAsyncDataSource(getUnit)}}',
        ],
      },
      scale: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.accuracy',
          defaultMessage: '精度',
        }),
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
        'x-reactions': {
          dependencies: ['.type'],
          fulfill: {
            state: {
              visible: "{{['float','double'].includes($deps[0])}}",
            },
          },
        },
      },
      booleanConfig: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.boolean',
          defaultMessage: '布尔值',
        }),
        type: 'void',
        'x-decorator': 'FormItem',
        'x-component': 'BooleanEnum',
        'x-reactions': {
          dependencies: ['.type'],
          fulfill: {
            state: {
              visible: "{{['boolean'].includes($deps[0])}}",
            },
          },
        },
      },
      format: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.timeFormat',
          defaultMessage: '时间格式',
        }),
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        enum: DateTypeList,
        'x-reactions': {
          dependencies: ['.type'],
          fulfill: {
            state: {
              visible: "{{['date'].includes($deps[0])}}",
            },
          },
        },
      },
      enumConfig: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.enum',
          defaultMessage: '枚举项',
        }),
        type: 'void',
        'x-decorator': 'FormItem',
        'x-component': 'EnumParam',
        'x-reactions': {
          dependencies: ['.type'],
          fulfill: {
            state: {
              visible: "{{['enum'].includes($deps[0])}}",
            },
          },
        },
      },
      expands: {
        type: 'object',
        properties: {
          maxLength: {
            title: intl.formatMessage({
              id: 'pages.device.productDetail.metadata.maxLength',
              defaultMessage: '最大长度',
            }),
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            'x-decorator-props': {
              tooltip: intl.formatMessage({
                id: 'pages.device.productDetail.metadata.maxLength.byte',
                defaultMessage: '字节',
              }),
            },
            'x-reactions': {
              dependencies: ['..type'],
              fulfill: {
                state: {
                  visible: "{{['string','password'].includes($deps[0])}}",
                },
              },
            },
          },
        },
      },
      elementType: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.elementConfiguration',
          defaultMessage: '元素配置',
        }),
        'x-decorator': 'FormItem',
        'x-component': 'ArrayParam',
        'x-reactions': {
          dependencies: ['.type'],
          fulfill: {
            state: {
              visible: "{{['array'].includes($deps[0])}}",
            },
          },
        },
      },
      jsonConfig: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.jsonObject',
          defaultMessage: 'JSON对象',
        }),
        type: 'void',
        'x-decorator': 'FormItem',
        'x-component': 'JsonParam',
        'x-reactions': {
          dependencies: ['.type'],
          fulfill: {
            state: {
              visible: "{{['object'].includes($deps[0])}}",
            },
          },
        },
      },
      fileType: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.fileType',
          defaultMessage: '文件类型',
        }),
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-visible': false,
        enum: FileTypeList,
        'x-reactions': {
          dependencies: ['.type'],
          fulfill: {
            state: {
              visible: "{{['file'].includes($deps[0])}}",
            },
          },
        },
      },
    },
  } as any;
  const commonConfig = {
    id: {
      title: intl.formatMessage({
        id: 'pages.device.productDetail.metadata.key',
        defaultMessage: '标识',
      }),
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-disabled': MetadataModel.action === 'edit',
      'x-index': 0,
    },
    name: {
      title: intl.formatMessage({
        id: 'pages.table.name',
        defaultMessage: '名称',
      }),
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-index': 1,
    },
    description: {
      title: intl.formatMessage({
        id: 'pages.device.productDetail.metadata.describe',
        defaultMessage: '描述',
      }),
      'x-decorator': 'FormItem',
      'x-component': 'Input.TextArea',
      'x-index': 100,
    },
  } as any;
  const propertySchema: ISchema = {
    type: 'object',
    properties: {
      ...commonConfig,
      valueType: valueTypeConfig,
      expands: {
        'x-index': 5,
        type: 'object',
        properties: {
          source: {
            title: intl.formatMessage({
              id: 'pages.device.productDetail.metadata.source',
              defaultMessage: '来源',
            }),
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            enum: PropertySource,
          },
          virtualRule: {
            type: 'object',
            title: '规则配置',
            'x-visible': false,
            'x-component': 'Editable.Popover',
            'x-reactions': {
              dependencies: ['.source'],
              fulfill: {
                state: {
                  visible: '{{$deps[0]==="rule"}}',
                },
              },
            },
            properties: {
              script: {
                type: 'string',
                'x-component': 'FRuleEditor',
                'x-visible': false,
                'x-reactions': [
                  {
                    dependencies: ['.source', '..id'],
                    fulfill: {
                      state: {
                        visible: '{{$deps[0]==="rule"}}',
                      },
                      schema: {
                        'x-component-props.property': '{{$deps[1]}}',
                      },
                    },
                  },
                ],
              },

              windowType: {
                type: 'string',
                title: '窗口',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  { label: '时间窗口', value: 'time' },
                  { label: '次数窗口', value: 'num' },
                ],
                'x-component-props': {
                  allowClear: true,
                },
              },
              type: {
                type: 'string',
                'x-visible': false,
                'x-reactions': {
                  dependencies: ['.windowType'],
                  when: '{{$deps[0]}}',
                  fulfill: {
                    state: {
                      value: 'window',
                    },
                  },
                },
              },
              aggType: {
                type: 'string',
                title: '聚合函数',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-reactions': '{{useAsyncDataSource(getStreamingAggType)}}',
              },
              window: {
                type: 'object',
                properties: {
                  span: {
                    title: '窗口长度',
                    'x-component': 'Input',
                    'x-decorator': 'FormItem',
                    'x-reactions': [
                      {
                        dependencies: ['..windowType'],
                        when: '{{$deps[0]==="time"}}',
                        fulfill: {
                          state: {
                            title: '窗口长度（秒）',
                          },
                        },
                      },
                      {
                        dependencies: ['..windowType'],
                        when: '{{$deps[0]==="num"}}',
                        fulfill: {
                          state: {
                            title: '窗口长度（次）',
                          },
                        },
                      },
                      {
                        dependencies: ['..windowType'],
                        when: '{{!$deps[0]}}',
                        fulfill: {
                          state: {
                            title: '窗口长度',
                          },
                        },
                      },
                    ],
                  },
                  every: {
                    title: '步长',
                    'x-component': 'Input',
                    'x-decorator': 'FormItem',
                    'x-reactions': [
                      {
                        dependencies: ['..windowType'],
                        when: '{{$deps[0]==="time"}}',
                        fulfill: {
                          state: {
                            title: '步长（秒）',
                          },
                        },
                      },
                      {
                        dependencies: ['..windowType'],
                        when: '{{$deps[0]==="num"}}',
                        fulfill: {
                          state: {
                            title: '步长（次）',
                          },
                        },
                      },
                      {
                        dependencies: ['..windowType'],
                        when: '{{!$deps[0]}}',
                        fulfill: {
                          state: {
                            title: '步长',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          type: {
            title: '属性类型',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              mode: 'tags',
            },
            enum: [
              {
                label: '读',
                value: 'read',
              },
              {
                label: '写',
                value: 'write',
              },
              {
                label: '上报',
                value: 'report',
              },
            ],
          },
          // 存储配置
          configConfig: {
            type: 'void',
            title: intl.formatMessage({
              id: 'pages.device.productDetail.metadata.otherConfiguration',
              defaultMessage: '其他配置',
            }),
            'x-visible': false,
            'x-decorator': 'FormItem',
            'x-component': 'ConfigParam',
            'x-reactions': '{{asyncOtherConfig}}',
          },
        },
      },
    },
  };
  const functionSchema: ISchema = {
    type: 'object',
    properties: {
      ...commonConfig,
      async: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.whetherAsync',
          defaultMessage: '是否异步',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Radio.Group',
        enum: [
          {
            label: intl.formatMessage({
              id: 'pages.device.productDetail.metadata.true',
              defaultMessage: '是',
            }),
            value: true,
          },
          {
            label: intl.formatMessage({
              id: 'pages.device.productDetail.metadata.false',
              defaultMessage: '否',
            }),
            value: false,
          },
        ],
        'x-index': 2,
      },
      inputs: {
        type: 'void',
        'x-index': 3,
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.inputParameter',
          defaultMessage: '输入参数',
        }),
        'x-decorator': 'FormItem',
        'x-component': 'JsonParam',
        'x-reactions': (field) => {
          field.setComponentProps({ keys: 'inputs' });
        },
      },
      output: valueTypeConfig,
    },
  };
  const eventSchema: ISchema = {
    type: 'object',
    properties: {
      ...commonConfig,
      expands: {
        type: 'object',
        'x-index': 2,
        properties: {
          level: {
            title: intl.formatMessage({
              id: 'pages.device.productDetail.metadata.level',
              defaultMessage: 'level',
            }),
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            enum: EventLevel,
          },
        },
      },
      valueType: valueTypeConfig,
    },
  };
  const createTagSchema = () => {
    const temp = _.cloneDeep(propertySchema) as any;
    delete temp.properties?.expands.properties.configConfig;
    delete temp.properties?.expands.properties.source;
    return temp;
  };
  const metadataTypeMapping: Record<string, { name: string; schema: ISchema }> = {
    properties: {
      name: '属性',
      schema: propertySchema,
    },
    events: {
      name: '事件',
      schema: eventSchema,
    },
    functions: {
      name: '功能',
      schema: functionSchema,
    },
    tags: {
      name: '标签',
      schema: createTagSchema(),
    },
  };

  const getUnit = () =>
    service.getUnit().then((resp) => {
      const _data = resp.result.map((item: any) => ({
        label: item.description,
        value: item.id,
      }));
      // 缓存单位数据
      Store.set('units', _data);
      return _data;
    });

  const getStreamingAggType = () =>
    service.getStreamingAggType().then((resp) =>
      resp.result.map((item: any) => ({
        label: `${item.value}(${item.text})`,
        value: item.value,
      })),
    );

  const useAsyncDataSource = (services: (arg0: Field) => Promise<any>) => (field: Field) => {
    field.loading = true;
    services(field).then(
      action.bound!((data: { label: string; value: string }[]) => {
        field.dataSource = data;
        field.loading = false;
      }),
    );
  };

  const param = useParams<{ id: string }>();
  const typeMap = new Map<string, any>();

  typeMap.set('product', productModel.current);
  typeMap.set('device', InstanceModel.detail);
  const saveMap = new Map<string, Promise<any>>();
  const { type } = MetadataModel;

  const saveMetadata = async (deploy?: boolean) => {
    const params = (await form.submit()) as MetadataItem;

    if (!typeMap.get(props.type)) return;

    const metadata = JSON.parse(typeMap.get(props.type).metadata || '{}') as DeviceMetadata;
    const config = (metadata[type] || []) as MetadataItem[];
    const index = config.findIndex((item) => item.id === params.id);
    if (index > -1) {
      config[index] = params;
      DB.getDB().table(`${type}`).update(params.id, params);
    } else {
      config.push(params);
      DB.getDB().table(`${type}`).add(params, params.id);
    }

    if (props.type === 'product') {
      const product = typeMap.get('product');
      // product.metadata = JSON.stringify(metadata);
      // @ts-ignore
      metadata[type] = config;
      product.metadata = JSON.stringify(metadata);
      saveMap.set('product', service.saveProductMetadata(product));
    } else {
      saveMap.set('device', service.saveDeviceMetadata(param.id, metadata));
    }

    const result = await saveMap.get(props.type);
    if (result.status === 200) {
      message.success('操作成功！');
      Store.set(SystemConst.REFRESH_METADATA_TABLE, true);
      if (deploy) {
        Store.set('product-deploy', deploy);
      }
      MetadataModel.edit = false;
      MetadataModel.item = {};
    } else {
      message.error('操作失败！');
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => saveMetadata(true)}>
        保存并生效
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      <Drawer
        width="25vw"
        visible
        title={`${intl.formatMessage({
          id: `pages.data.option.${MetadataModel.action}`,
          defaultMessage: '新增',
        })}-${intl.formatMessage({
          id: `pages.device.metadata.${MetadataModel.type}`,
          defaultMessage: metadataTypeMapping[MetadataModel.type].name,
        })}`}
        onClose={() => {
          MetadataModel.edit = false;
          MetadataModel.item = {};
        }}
        destroyOnClose
        zIndex={1000}
        placement={'right'}
        extra={
          props.type === 'product' ? (
            <Dropdown.Button type="primary" onClick={() => saveMetadata()} overlay={menu}>
              保存数据
            </Dropdown.Button>
          ) : (
            <Button type="primary" onClick={() => saveMetadata()}>
              保存数据
            </Button>
          )
        }
      >
        <Form form={form} layout="vertical" size="small">
          <SchemaField
            scope={{ useAsyncDataSource, getUnit, getStreamingAggType }}
            schema={metadataTypeMapping[MetadataModel.type].schema}
          />
        </Form>
      </Drawer>
    </>
  );
});
export default Edit;
