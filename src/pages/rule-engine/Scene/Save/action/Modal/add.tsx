import { Modal, Form } from 'antd';
import ActionsTypeComponent from '@/pages/rule-engine/Scene/Save/components/TriggerWay/actionsType';
import { useEffect, useState } from 'react';
import Notify from '../notify';
import type { ActionsType } from '@/pages/rule-engine/Scene/typings';
import Device from '../DeviceOutput';
import Delay from '../Delay';

interface Props {
  close: () => void;
  save: (data: any, options?: any) => void;
  data: Partial<ActionsType>;
  name: number;
  // type: ParallelType;
  parallel: boolean;
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
    switch (type) {
      case 'device':
        return (
          <Device
            value={props.data?.device}
            save={(data: any, options: any) => {
              setActionType('');
              props.save(
                {
                  type: 'device',
                  executor: 'device',
                  key: props.data.key || `device_${new Date().getTime()}`,
                  device: {
                    ...data,
                  },
                },
                options,
              );
            }}
            name={props.name}
            cancel={() => {
              setActionType('');
            }}
            parallel={props.parallel}
          />
        );
      case 'notify':
        return (
          <Notify
            value={props.data?.notify || {}}
            options={props.data?.options || {}}
            save={(data: any, option: any) => {
              setActionType('');
              props.save(
                {
                  ...data,
                  executor: 'notify',
                  key: props.data.key || `notify_${new Date().getTime()}`,
                },
                option,
              );
            }}
            name={props.name}
            cancel={() => {
              setActionType('');
            }}
          />
        );
      case 'delay':
        return (
          <Delay
            value={props.data?.delay || {}}
            save={(data: any, options) => {
              setActionType('');
              props.save(
                {
                  type: 'delay',
                  executor: 'delay',
                  key: props.data.key || `delay_${new Date().getTime()}`,
                  delay: {
                    ...data,
                  },
                },
                options,
              );
            }}
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
      width={860}
      onCancel={() => {
        props.close();
      }}
      onOk={async () => {
        const values = await form.validateFields();
        setActionType(values.type);
        if (values.type === 'relieve' || values.type === 'trigger') {
          console.log(values.type, props.data);
          props.save({ ...props.data, type: values.type, executor: values.type });
        }
      }}
    >
      <Form form={form} layout={'vertical'}>
        <Form.Item
          name="type"
          label="类型"
          required
          rules={[{ required: true, message: '请选择类型' }]}
        >
          <ActionsTypeComponent parallel={props.parallel} />
        </Form.Item>
      </Form>
      {actionTypeComponent(actionType)}
    </Modal>
  );
};
