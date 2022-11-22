import { observer } from '@formily/reactive-react';
import { Form, Select } from 'antd';
import { useEffect, useState } from 'react';
import ReadProperty from '../../device/readProperty';
import TopCard from '../device/TopCard';
import DeviceModel from '../model';
import FunctionCall from './functionCall';
import WriteProperty from './WriteProperty';

interface Props {
  get: (data: any) => void;
}

export default observer((props: Props) => {
  const [form] = Form.useForm();
  const [deviceMessageType, setDeviceMessageType] = useState('WRITE_PROPERTY');
  const [properties, setProperties] = useState([]); // 物模型-属性
  const [propertiesId, setPropertiesId] = useState<string | undefined>(''); // 物模型-属性ID,用于串行
  const [functionList, setFunctionList] = useState<any>([]); // 物模型-功能
  const [functionId, setFunctionId] = useState('');
  const [functions, setFunctions] = useState([]);

  const TypeList = [
    {
      label: '功能调用',
      value: 'INVOKE_FUNCTION',
      image: require('/public/images/scene/invoke-function.png'),
      tip: '-',
    },
    {
      label: '读取属性',
      value: 'READ_PROPERTY',
      image: require('/public/images/scene/read-property.png'),
      tip: '-',
    },
    {
      label: '设置属性',
      value: 'WRITE_PROPERTY',
      image: require('/public/images/scene/write-property.png'),
      tip: '-',
    },
  ];

  useEffect(() => {
    if (DeviceModel.productDetail) {
      const metadata = JSON.parse(DeviceModel.productDetail?.metadata || '{}');
      setProperties(metadata.properties);
      setFunctions(metadata.functions);
    }
  }, [DeviceModel.productDetail, functionId]);

  useEffect(() => {
    if (functionId && functions.length !== 0) {
      const functionItem: any = functions.find((item: any) => item.id === functionId);
      if (functionItem) {
        const item = functionItem.valueType
          ? functionItem.valueType.properties
          : functionItem.inputs;
        const array = [];
        for (const datum of item) {
          array.push({
            id: datum.id,
            name: datum.name,
            type: datum.valueType ? datum.valueType.type : '-',
            format: datum.valueType ? datum.valueType.format : undefined,
            options: datum.valueType ? datum.valueType.elements : undefined,
            value: undefined,
          });
        }
        setFunctionList(array);
        console.log(propertiesId, 'array');
      }
    }
  }, [functions, functionId]);

  useEffect(() => {
    props.get(form);
  }, [form]);

  return (
    <div>
      <Form form={form} layout={'vertical'}>
        <Form.Item name="messageType" label="动作类型" required initialValue="WRITE_PROPERTY">
          <TopCard
            typeList={TypeList}
            onChange={(value: string) => {
              setDeviceMessageType(value);
            }}
          />
        </Form.Item>
        {deviceMessageType === 'INVOKE_FUNCTION' && (
          <>
            <Form.Item
              name={['device', 'message', 'functionId']}
              label="功能调用"
              rules={[{ required: true, message: '请选择功能' }]}
            >
              <Select
                showSearch
                allowClear
                options={functions}
                fieldNames={{ label: 'name', value: 'id' }}
                style={{ width: '100%' }}
                placeholder={'请选择功能'}
                filterOption={(input: string, option: any) =>
                  option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={(value) => {
                  setFunctionId(value);
                }}
              />
            </Form.Item>
            {functionId && (
              <Form.Item
                name={['device', 'message', 'inputs']}
                rules={[{ required: true, message: '请输入功能值' }]}
              >
                <FunctionCall functionData={functionList} productId={DeviceModel.productId[0]} />
              </Form.Item>
            )}
          </>
        )}
        {deviceMessageType === 'READ_PROPERTY' && (
          <Form.Item
            name={['device', 'message', 'properties']}
            label="读取属性"
            rules={[{ required: true, message: '请选择读取属性' }]}
          >
            <ReadProperty properties={properties} propertiesChange={setPropertiesId} />
          </Form.Item>
        )}
        {deviceMessageType === 'WRITE_PROPERTY' && <WriteProperty properties={properties} />}
      </Form>
    </div>
  );
});
