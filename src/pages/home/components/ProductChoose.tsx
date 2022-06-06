import { FormItem, FormLayout, Select } from '@formily/antd';
import { createForm } from '@formily/core';
import { createSchemaField, FormProvider } from '@formily/react';
import { Button, message, Modal } from 'antd';
import 'antd/lib/tree-select/style/index.less';
import { useEffect, useState } from 'react';
import { service } from '@/pages/device/Instance';
import encodeQuery from '@/utils/encodeQuery';
import { PermissionButton } from '@/components';
import useHistory from '@/hooks/route/useHistory';
import { getMenuPathByParams, MENUS_CODE } from '@/utils/menu';

interface Props {
  visible: boolean;
  close: () => void;
}

const ProductChoose = (props: Props) => {
  const productPermission = PermissionButton.usePermission('device/Product').permission;
  const { visible, close } = props;
  const [productList, setProductList] = useState<any[]>([]);

  const SchemaField = createSchemaField({
    components: {
      Select,
      FormItem,
      FormLayout,
    },
  });

  useEffect(() => {
    service.getProductList(encodeQuery({ paging: false, terms: { state: 1 } })).then((resp) => {
      if (resp.status === 200) {
        const list = resp.result.map((item: { name: any; id: any }) => ({
          label: item.name,
          value: item.id,
        }));
        setProductList(list);
      }
    });
  }, []);

  const form = createForm({});

  const schema = {
    type: 'object',
    properties: {
      layout: {
        type: 'void',
        'x-component': 'FormLayout',
        'x-component-props': {
          layout: 'vertical',
        },
        properties: {
          product: {
            type: 'string',
            title: '产品',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            enum: [...productList],
            'x-component-props': {
              showSearch: true,
              showArrow: true,
              filterOption: (input: string, option: any) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
            },
          },
        },
      },
    },
  };

  const history = useHistory();

  return (
    <Modal
      maskClosable={false}
      visible={visible}
      onCancel={() => close()}
      width="35vw"
      title="选择产品"
      onOk={() => close()}
      footer={[
        <Button key="cancel" onClick={() => close()}>
          取消
        </Button>,
        <Button
          key="ok"
          type="primary"
          onClick={async () => {
            const data: any = await form.submit();
            const path = getMenuPathByParams(`device/Product/Detail`);
            if (path && !!productPermission.update) {
              history.push(
                `${getMenuPathByParams(MENUS_CODE['device/Product/Detail'], data.product)}`,
                {
                  tab: 'access',
                },
              );
            } else {
              message.warning('暂无权限，请联系管理员');
              close();
            }
          }}
        >
          确认
        </Button>,
      ]}
    >
      <div style={{ marginTop: '20px' }}>
        <FormProvider form={form}>
          <SchemaField schema={schema} />
        </FormProvider>
      </div>
    </Modal>
  );
};
export default ProductChoose;
