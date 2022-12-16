import { Alert, Modal } from 'antd';
import { FormItem, Input } from '@formily/antd';
import { createForm } from '@formily/core';
import { createSchemaField, FormProvider } from '@formily/react';
import { service } from '@/pages/device/Instance';
import { useParams } from 'umi';
import type { PropertyMetadata } from '@/pages/device/Product/typings';
import { onlyMessage } from '@/utils/util';

interface Props {
  data: Partial<PropertyMetadata>;
  onCancel: () => void;
}

const EditProperty = (props: Props) => {
  const { data } = props;
  const params = useParams<{ id: string }>();

  const SchemaField = createSchemaField({
    components: {
      Input,
      FormItem,
    },
  });

  const form = createForm();
  const schema = {
    type: 'object',
    properties: {
      propertyValue: {
        type: 'string',
        title: data?.name || '自定义属性',
        required: true,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          gridSpan: 2,
          labelAlign: 'left',
          layout: 'vertical',
        },
        'x-component': 'Input',
      },
    },
  };

  const handleSetPropertyValue = async (propertyValue: string) => {
    const resp = await service.setProperty(params.id, { [`${data.id}`]: propertyValue });
    if (resp.status === 200) {
      onlyMessage('操作成功');
    }
    props.onCancel();
  };
  return (
    <Modal
      maskClosable={false}
      title="编辑"
      visible
      onOk={async () => {
        const values: any = await form.submit();
        if (!!values) {
          handleSetPropertyValue(values?.propertyValue);
        }
      }}
      onCancel={() => {
        props.onCancel();
      }}
    >
      <Alert message="当数据来源为设备时，填写的值将下发到设备" type="warning" showIcon />
      <div style={{ marginTop: '30px' }}>
        <FormProvider form={form}>
          <SchemaField schema={schema} />
        </FormProvider>
      </div>
    </Modal>
  );
};

export default EditProperty;
