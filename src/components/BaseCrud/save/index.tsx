import React, { useEffect, useMemo, useState } from 'react';
import { message, Modal, Spin } from 'antd';
import {
  ArrayItems,
  ArrayTable,
  Editable,
  Form,
  FormGrid,
  FormItem,
  FormTab,
  Input,
  NumberPicker,
  Password,
  PreviewText,
  Radio,
  Select,
  Space,
  Switch,
  Upload,
} from '@formily/antd';
import type { Form as Form1 } from '@formily/core';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import * as ICONS from '@ant-design/icons';
import { useIntl } from '@@/plugin-locale/localeExports';
import type { ISchema } from '@formily/json-schema';
import type BaseService from '@/utils/BaseService';
import { Store } from 'jetlinks-store';
import SystemConst from '@/utils/const';
import { CurdModel } from '@/components/BaseCrud/model';
import type { ISchemaFieldProps } from '@formily/react/lib/types';
import type { ModalProps } from 'antd/lib/modal/Modal';
import FUpload from '@/components/Upload';
import FileUpload from '@/pages/link/Protocol/FileUpload';
import FMonacoEditor from '@/components/FMonacoEditor';
import FBraftEditor from '@/components/FBraftEditor';

interface Props<T> {
  schema: ISchema;
  service: BaseService<T>;
  reload: () => void;
  schemaConfig?: ISchemaFieldProps;
  modelConfig?: ModalProps & { loading?: boolean };
  formEffect?: () => void;
  customForm?: Form1;
  footer?: React.ReactNode;
}

const Save = <T extends Record<string, any>>(props: Props<T>) => {
  const intl = useIntl();
  const { service, schema, reload, schemaConfig, modelConfig, formEffect, customForm, footer } =
    props;

  const [visible, setVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<T>();
  const [model, setModel] = useState<'edit' | 'add' | 'preview'>('edit');

  const form = useMemo(
    () =>
      createForm({
        validateFirst: true,
        initialValues: current,
        effects: formEffect,
      }),
    [current, model],
  );

  useEffect(() => {
    const visibleSubscription = Store.subscribe(SystemConst.BASE_CURD_MODAL_VISIBLE, setVisible);
    const dataSubscription = Store.subscribe(SystemConst.BASE_CURD_CURRENT, setCurrent);
    const modelSubscription = Store.subscribe(SystemConst.BASE_CURD_MODEL, setModel);

    return () => {
      visibleSubscription.unsubscribe();
      dataSubscription.unsubscribe();
      modelSubscription.unsubscribe();
    };
  }, [current]);

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      FormTab,
      Input,
      Password,
      Upload,
      Select,
      ArrayTable,
      Switch,
      FormGrid,
      Editable,
      NumberPicker,
      FUpload,
      FileUpload,
      FMonacoEditor,
      ArrayItems,
      Space,
      Radio,
      FBraftEditor,
    },
    scope: {
      icon(name: any) {
        return React.createElement(ICONS[name]);
      },
    },
  });

  const save = async () => {
    const values: T = await (customForm || form).submit();
    console.log(form.values, 'value', values);
    // 特殊处理通知模版

    if (service?.getUri().includes('/notifier/template')) {
      (values as T & { template: Record<string, any> | string }).template = JSON.stringify(
        values.template,
      );
    }
    const response = await service.update(values);

    if (response.status === 200) {
      Store.set(SystemConst.BASE_UPDATE_DATA, response.result);
    }
    message.success(
      intl.formatMessage({
        id: 'pages.data.option.success',
        defaultMessage: '操作成功',
      }),
    );
    CurdModel.close();
    reload();
  };

  useEffect(() => {
    const subscription = Store.subscribe('save-data', async (callback: (values: any) => void) => {
      if (!callback) return;
      await save();
      if (typeof callback === 'function') {
        callback(form.values);
      }
    });
    return () => {
      Store.set('save-data', undefined);
      subscription.unsubscribe();
    };
  }, [current]);

  return (
    <Modal
      title={intl.formatMessage({
        id: `pages.data.option.${model}`,
        defaultMessage: '编辑',
      })}
      maskClosable={false}
      visible={visible}
      onCancel={CurdModel.close}
      footer={footer}
      onOk={save}
      {...modelConfig}
    >
      <Spin spinning={modelConfig?.loading || false}>
        <PreviewText.Placeholder value="-">
          <Form form={customForm || form} layout={'vertical'}>
            <SchemaField schema={schema} {...schemaConfig} />
          </Form>
        </PreviewText.Placeholder>
      </Spin>
    </Modal>
  );
};

export default Save;
