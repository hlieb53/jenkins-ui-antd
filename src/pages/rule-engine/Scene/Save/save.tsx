import { Modal } from '@/components';
import { Form, Input } from 'antd';
import TriggerWay from '@/pages/rule-engine/Scene/Save/components/TriggerWay';
import type { SceneItem } from '@/pages/rule-engine/Scene/typings';
import { useEffect } from 'react';
import { getMenuPathByCode } from '@/utils/menu';
import useHistory from '@/hooks/route/useHistory';

interface Props {
  close: () => void;
  data: Partial<SceneItem>;
}

export default (props: Props) => {
  const [form] = Form.useForm();
  const history = useHistory();

  useEffect(() => {
    form.setFieldsValue({
      ...props.data,
    });
  }, [props.data]);

  return (
    <Modal
      title={props.data?.id ? '编辑' : '新增'}
      maskClosable={false}
      open
      onCancel={() => {
        props.close();
      }}
      onOk={async () => {
        const values = await form.validateFields();
        props.close();
        const url = getMenuPathByCode('rule-engine/Scene/Save');
        if (props.data?.id) {
          history.push(`${url}?triggerType=${values.trigger?.type}&id=${props.data?.id}`);
        } else {
          history.push(`${url}?triggerType=${values.trigger?.type}`);
        }
      }}
      width={700}
    >
      <Form name="scene-save" layout={'vertical'} form={form} autoComplete="off">
        <Form.Item
          name={'name'}
          label={'名称'}
          rules={[
            { required: true, message: '请输入名称' },
            {
              max: 64,
              message: '最多输入64个字符',
            },
          ]}
        >
          <Input placeholder={'请输入名称'} />
        </Form.Item>
        <Form.Item
          label={'触发方式'}
          name={['trigger', 'type']}
          rules={[{ required: true, message: '请选择触发方式' }]}
          initialValue={'device'}
        >
          <TriggerWay
            // onSelect={(val) => {
            //   // console.log(val);
            // }}
            disabled={!!props.data?.id}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
