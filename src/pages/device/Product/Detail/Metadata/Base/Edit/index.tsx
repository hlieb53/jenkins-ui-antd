import { Button, Drawer, message } from 'antd';
import { createSchemaField } from '@formily/react';
import MetadataModel from '@/pages/device/Product/Detail/Metadata/Base/model';
import type { Field, IFieldState } from '@formily/core';
import { createForm } from '@formily/core';
import {
  FormLayout,
  ArrayItems,
  Editable,
  Radio,
  Select,
  Form,
  Input,
  FormItem,
  NumberPicker,
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
import { useCallback, useEffect, useState } from 'react';
import { productModel, service } from '@/pages/device/Product';
import { Store } from 'jetlinks-store';
import type { MetadataItem, MetadataType, UnitType } from '@/pages/device/Product/typings';

import JsonParam from '@/components/Metadata/JsonParam';
import ArrayParam from '@/components/Metadata/ArrayParam';
import EnumParam from '@/components/Metadata/EnumParam';
import BooleanEnum from '@/components/Metadata/BooleanParam';
import ConfigParam from '@/components/Metadata/ConfigParam';
import { useIntl } from '@@/plugin-locale/localeExports';
import { lastValueFrom } from 'rxjs';
import type { DeviceMetadata } from '@/pages/device/Product/typings';

const Edit = () => {
  const intl = useIntl();
  const form = createForm({
    initialValues: MetadataModel.item as Record<string, unknown>,
  });

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

  const [units, setUnits] = useState<{ label: string; value: string }[]>();

  const propertySchema: ISchema = {
    type: 'object',
    properties: {
      id: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.key',
          defaultMessage: '标识',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-disabled': MetadataModel.action === 'edit',
      },
      name: {
        title: intl.formatMessage({
          id: 'pages.table.name',
          defaultMessage: '名称',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      valueType: {
        type: 'object',
        properties: {
          type: {
            title: intl.formatMessage({
              id: 'pages.device.productDetail.metadata.dataType',
              defaultMessage: '数据类型',
            }),
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
            enum: units,
            'x-reactions': {
              dependencies: ['.type'],
              fulfill: {
                state: {
                  visible: "{{['int','float','long','double'].includes($deps[0])}}",
                },
              },
            },
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
      },
      expands: {
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
          readOnly: {
            title: intl.formatMessage({
              id: 'pages.device.productDetail.metadata.whetherReadOnly',
              defaultMessage: '是否只读',
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

      description: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.describe',
          defaultMessage: '描述',
        }),
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
      },
    },
  };

  const functionSchema: ISchema = {
    type: 'object',
    properties: {
      id: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.key',
          defaultMessage: '标识',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      name: {
        title: intl.formatMessage({
          id: 'pages.table.name',
          defaultMessage: '名称',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
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
      },
      inputParams: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.inputParameter',
          defaultMessage: '输入参数',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      outputParams: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.outputParameters',
          defaultMessage: '输出参数',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      description: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.describe',
          defaultMessage: '描述',
        }),
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
      },
    },
  };

  const eventSchema: ISchema = {
    type: 'object',
    properties: {
      id: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.key',
          defaultMessage: '标识',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      name: {
        title: intl.formatMessage({
          id: 'pages.table.name',
          defaultMessage: '名称',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      'expands.level': {
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
  };

  const tagSchema: ISchema = {
    type: 'object',
    properties: {
      id: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.key',
          defaultMessage: '标识',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      name: {
        title: intl.formatMessage({
          id: 'pages.table.name',
          defaultMessage: '名称',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      'valueType.type': {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.dataType',
          defaultMessage: '数据类型',
        }),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        enum: DataTypeList,
      },
      'expands.readOnly': {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.whetherReadOnly',
          defaultMessage: '是否只读',
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
      },
      description: {
        title: intl.formatMessage({
          id: 'pages.device.productDetail.metadata.describe',
          defaultMessage: '描述',
        }),
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
      },
    },
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
      schema: tagSchema,
    },
  };

  const getUnits = useCallback(async () => {
    const cache = Store.get('units');
    if (cache) {
      return cache;
    }
    const response = await service.getUnit();
    const temp = response.result.map((item: UnitType) => ({
      label: item.description,
      value: item.id,
    }));
    Store.set('units', temp);
    return temp;
  }, []);

  useEffect(() => {
    getUnits().then((data) => {
      Store.set('units', data);
      setUnits(data);
    });
  }, [getUnits]);

  const saveMetadata = async (type: MetadataType, params: MetadataItem) => {
    const product = productModel.current;
    if (!product) return;
    const metadata = JSON.parse(product.metadata) as DeviceMetadata;
    const config = metadata[type] as MetadataItem[];
    const index = config.findIndex((item) => item.id === params.id);
    // todo 考虑优化
    if (index > -1) {
      config[index] = params;
    } else {
      config.push(params);
    }
    product.metadata = JSON.stringify(metadata);
    const result = await service.saveProduct(product);
    if (result.status === 200) {
      message.success('操作成功！');
    } else {
      message.error('操作失败！');
    }
  };
  return (
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
        <Button
          type="primary"
          onClick={async () => {
            const data = (await form.submit()) as MetadataItem;
            const { type } = MetadataModel;
            await saveMetadata(type, data);
          }}
        >
          {intl.formatMessage({
            id: 'pages.device.productDetail.metadata.saveData',
            defaultMessage: '保存数据',
          })}
        </Button>
      }
    >
      <Form form={form} layout="vertical" size="small">
        <SchemaField schema={metadataTypeMapping[MetadataModel.type].schema} />
      </Form>
    </Drawer>
  );
};
export default Edit;
