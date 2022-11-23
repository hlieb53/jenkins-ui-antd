import { Modal, Form } from 'antd';
import ActionsTypeComponent from '@/pages/rule-engine/Scene/Save/components/TriggerWay/actionsType';
import { useEffect, useState } from 'react';
import Notify from '../notify';
import type { ActionsType } from '@/pages/rule-engine/Scene/typings';
import Device from '../DeviceOutput';

interface Props {
  close: () => void;
  save: (data: any) => void;
  data: Partial<ActionsType>;
  name: number;
}

export default (props: Props) => {
  const [form] = Form.useForm();
  const [actionType, setActionType] = useState<string>('');

  useEffect(() => {
    if (props.data?.executor) {
      form.setFieldsValue({
        type: props.data.executor,
      });
    }
  }, [props.data]);

  const actionTypeComponent = (type: string) => {
    console.log(type, '111');
    switch (type) {
      case 'device':
        return <Device />;
      case 'notify':
        return (
          <Notify
            value={props.data?.notify || {}}
            save={(data: any) => {
              setActionType('');
              props.save(data);
            }}
            name={props.name}
            cancel={() => {
              setActionType('');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title="类型"
      open
      width={800}
      onCancel={() => {
        props.close();
      }}
      onOk={async () => {
        const values = await form.validateFields();
        console.log(values.type);
        setActionType(values.type);
        // props.save({ ...props.data, type: values.type });
      }}
    >
      <Form form={form} layout={'vertical'}>
        <Form.Item
          name="type"
          label="类型"
          required
          rules={[{ required: true, message: '请选择类型' }]}
        >
          <ActionsTypeComponent />
        </Form.Item>
      </Form>
      {actionTypeComponent(actionType)}
    </Modal>
  );
};
