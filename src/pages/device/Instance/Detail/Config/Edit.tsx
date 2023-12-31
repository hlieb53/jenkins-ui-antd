import { createForm, onFormInit } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { InstanceModel, service } from '@/pages/device/Instance';
import type { ISchema } from '@formily/json-schema';
import { Form, FormGrid, FormItem, Input, Password, PreviewText, Select } from '@formily/antd';
import { Button, Drawer, Space } from 'antd';
import { useParams } from 'umi';
import { onlyMessage } from '@/utils/util';

const componentMap = {
  string: 'Input',
  password: 'Password',
  enum: 'Select',
};

interface Props {
  close: () => void;
  metadata: any[];
  reload: () => void;
}

const Edit = (props: Props) => {
  const { metadata } = props;
  console.log(metadata);
  const params = useParams<{ id: string }>();
  const id = InstanceModel.detail?.id || params?.id;

  const form = createForm({
    validateFirst: true,
    initialValues: InstanceModel.detail?.configuration,
    effects: () => {
      onFormInit((f) => {
        if (InstanceModel.detail.accessProvider === 'OneNet') {
          metadata?.[0].properties?.forEach((item: any) => {
            f.setFieldState(item.property, (state) => {
              state.validator = [
                {
                  required: true,
                  message: `请输入${item.name}`,
                },
              ];
            });
          });
        }
        if (InstanceModel.detail.accessProvider === 'Ctwing') {
          f.setFieldState('ctwing_imei', (state) => {
            state.validator = [
              {
                required: true,
                message: `请输入IMEI`,
              },
            ];
          });
          f.setFieldState('ctwing_sn', (state) => {
            state.validator = [
              {
                required: true,
                message: `请输入SN`,
              },
            ];
          });
        }
      });
    },
  });

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      Password,
      Select,
      FormGrid,
      PreviewText,
    },
  });

  const configToSchema = (data: any[]) => {
    const config = {};
    data.forEach((item) => {
      config[item.property] = {
        type: 'string',
        title: item.name,
        'x-decorator': 'FormItem',
        'x-component': componentMap[item.type.type],
        'x-decorator-props': {
          tooltip: item.description,
        },
        enum:
          item?.type?.type === 'enum' && item?.type?.elements
            ? (item?.type?.elements || []).map((t: { value: string; text: string }) => {
                return {
                  label: t.text,
                  value: t.value,
                };
              })
            : [],
      };
    });
    return config;
  };

  const renderConfigCard = () => {
    return metadata?.map((item: any) => {
      const itemSchema: ISchema = {
        type: 'object',
        properties: {
          grid: {
            type: 'void',
            'x-component': 'FormGrid',
            'x-component-props': {
              minColumns: [1],
              maxColumns: [1],
            },
            properties: configToSchema(item.properties),
          },
        },
      };

      return (
        <>
          <PreviewText.Placeholder value="-">
            <Form form={form} layout="vertical">
              <SchemaField schema={itemSchema} />
            </Form>
          </PreviewText.Placeholder>
        </>
      );
    });
  };
  return (
    <Drawer
      title="编辑配置"
      placement="right"
      onClose={() => {
        props.close();
      }}
      visible
      extra={
        <Space>
          <Button
            type="primary"
            onClick={async () => {
              const values = (await form.submit()) as any;
              const resp = await service.modify(id || '', {
                id,
                configuration: { ...values },
              });
              if (resp.status === 200) {
                onlyMessage('操作成功！');
                if ((window as any).onTabSaveSuccess) {
                  if (resp.result) {
                    (window as any).onTabSaveSuccess(resp);
                    setTimeout(() => window.close(), 300);
                  }
                } else {
                  if (props.reload) {
                    props.reload();
                  }
                  props.close();
                }
              }
            }}
          >
            保存
          </Button>
        </Space>
      }
    >
      {renderConfigCard()}
    </Drawer>
  );
};

export default Edit;
