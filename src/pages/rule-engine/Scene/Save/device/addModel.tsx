import { Modal, Button, Steps } from 'antd';
import { observer } from '@formily/react';
import { observable } from '@formily/reactive';
import { useEffect, useRef, useState } from 'react';
import { onlyMessage } from '@/utils/util';
import type { TriggerDevice, TriggerDeviceOptions } from '@/pages/rule-engine/Scene/typings';
import Product from './product';
import Device from './device';
import Type from './type';
import { numberToString } from '../components/TimingTrigger/whenOption';
import { timeUnitEnum } from '../components/TimingTrigger';
import { Store } from 'jetlinks-store';
import { FormModel } from '@/pages/rule-engine/Scene/Save';
import { isEqual } from 'lodash';

interface AddProps {
  options?: any;
  value?: TriggerDevice;
  onCancel?: () => void;
  onSave?: (data: TriggerDevice, options: any) => void;
}

export interface DeviceModelProps extends Partial<TriggerDevice> {
  steps: { key: string; title: string }[];
  stepNumber: number;
  productId: string;
  productDetail: any;
  metadata: {
    properties?: any[];
    events?: any[];
    functions?: any[];
  };
  deviceKeys: string[];
  orgId: string;
  operation?: TriggerDeviceOptions;
  options: any;
  productPage: number;
  productPageSize: number;
  devicePage: number;
  devicePageSize: number;
}

const defaultModelData: Omit<DeviceModelProps, 'steps'> = {
  stepNumber: 0,
  productId: '',
  productDetail: {},
  deviceKeys: [],
  orgId: '',
  selector: 'fixed',
  metadata: {},
  operation: {
    operator: 'online',
  },
  options: {},
  productPage: 0,
  productPageSize: 0,
  devicePage: 0,
  devicePageSize: 0,
};
export const TriggerDeviceModel = observable<DeviceModelProps>({
  steps: [
    {
      key: 'product',
      title: '选择产品',
    },
    {
      key: 'device',
      title: '选择设备',
    },
    {
      key: 'type',
      title: '触发类型',
    },
  ],
  ...defaultModelData,
});

export default observer((props: AddProps) => {
  const typeRef = useRef<{ validateFields?: any; handleInit?: any }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    TriggerDeviceModel.stepNumber = 0;
    return () => {
      Object.keys(defaultModelData).forEach((key) => {
        if (
          ['selector', 'productId', 'selectorValues', 'operation', 'deviceKeys', 'orgId'].includes(
            key,
          )
        ) {
          TriggerDeviceModel[key] = defaultModelData[key];
        }
      });
    };
  }, []);

  useEffect(() => {
    console.log('productPage', props.value);
    if (props.value) {
      TriggerDeviceModel.selector = props.value.selector;
      TriggerDeviceModel.productId = props.value.productId;
      TriggerDeviceModel.selector = props.value.selector;
      TriggerDeviceModel.selectorValues = props.value.selectorValues;
      TriggerDeviceModel.operation = props.value.operation;
      TriggerDeviceModel.deviceKeys =
        props.value.selector === 'fixed'
          ? props.value.selectorValues?.map((item) => item.value) || []
          : [];
      TriggerDeviceModel.orgId =
        props.value.selector === 'org' ? props.value.selectorValues?.[0].value : [];
    }
  }, [props.value]);

  useEffect(() => {
    console.log('productPage', props.options);

    if (props.options) {
      TriggerDeviceModel.devicePage = props.options.devicePage;
      TriggerDeviceModel.devicePageSize = props.options.devicePageSize;
      TriggerDeviceModel.productPage = props.options.productPage;
      TriggerDeviceModel.productPageSize = props.options.productPageSize;
    }
    setLoading(true);
  }, [props.options]);

  const prev = () => {
    TriggerDeviceModel.stepNumber -= 1;
  };

  const handleOptions = (data: TriggerDeviceOptions) => {
    // console.log(data);

    const _options: any = {
      name: '', // 名称
      onlyName: false,
      type: '', // 触发类型
      productName: '',
      time: undefined,
      when: undefined,
      extraTime: undefined,
      action: TriggerDeviceModel.options.action,
    };
    if (TriggerDeviceModel.selector === 'fixed') {
      _options.name = TriggerDeviceModel.selectorValues?.map((item) => item.name).join(',');
    } else if (TriggerDeviceModel.selector === 'org') {
      _options.name = TriggerDeviceModel.selectorValues?.[0].name + '的';
      _options.productName = TriggerDeviceModel.productDetail.name; // 产品名称
    } else {
      _options.name = '所有的' + TriggerDeviceModel.productDetail.name;
    }

    if (data.timer) {
      const _timer = data.timer;
      _options.when =
        _timer.when!.length === 0
          ? '每天'
          : `每${_timer
              .when!.map((item) => {
                if (_timer!.trigger === 'week') {
                  return numberToString[item];
                } else {
                  return item + '号';
                }
              })
              .join(',')}`;
      if (_timer.once) {
        _options.time = _timer.once;
      } else if (_timer.period) {
        _options.time = _timer.period.from + '-' + _timer.period.to;
        _options.extraTime = `每${_timer.period.every}${timeUnitEnum[_timer.period.unit]}执行1次`;
      }
    }

    if (data.operator === 'online') {
      _options.type = '上线';
      _options.action = '';
    }

    if (data.operator === 'offline') {
      _options.type = '离线';
      _options.action = '';
    }

    if (data.operator === 'reportProperty') {
      _options.type = '属性上报';
      _options.action = '';
    }
    return _options;
  };

  const next = async () => {
    if (TriggerDeviceModel.stepNumber === 0) {
      if (TriggerDeviceModel.productId) {
        TriggerDeviceModel.stepNumber = 1;
      } else {
        onlyMessage('请选择产品', 'error');
      }
    } else if (TriggerDeviceModel.stepNumber === 1) {
      if (TriggerDeviceModel.selector === 'fixed' && !TriggerDeviceModel.selectorValues?.length) {
        onlyMessage('请选择设备', 'error');
        return;
      } else if (
        TriggerDeviceModel.selector === 'org' &&
        !TriggerDeviceModel.selectorValues?.length
      ) {
        onlyMessage('请选择部门', 'error');
        return;
      }
      TriggerDeviceModel.stepNumber = 2;
    } else if (TriggerDeviceModel.stepNumber === 2) {
      // TODO 验证类型数据
      const operationData = await typeRef.current?.validateFields();
      if (operationData) {
        const _options = handleOptions(operationData);
        _options.productPage = TriggerDeviceModel.productPage;
        _options.productPageSize = TriggerDeviceModel.productPageSize;
        _options.devicePage = TriggerDeviceModel.devicePage;
        _options.devicePageSize = TriggerDeviceModel.devicePageSize;
        const saveData = {
          operation: operationData,
          selectorValues: TriggerDeviceModel.selectorValues,
          selector: TriggerDeviceModel.selector!,
          productId: TriggerDeviceModel.productId,
        };
        const isUpdate = isEqual(saveData, FormModel.current.trigger?.device);
        Store.set('TriggerDeviceModel', {
          update: !isUpdate,
        });
        console.log('isUpdate', isUpdate);
        props.onSave?.(saveData, _options);
      }
    }
  };

  const renderComponent = (type: string) => {
    switch (type) {
      case 'device':
        return <Device />;
      case 'type':
        return <Type ref={typeRef} data={TriggerDeviceModel} />;
      default:
        return <Product />;
    }
  };

  return (
    <Modal
      visible
      title="执行规则"
      width={800}
      onCancel={() => {
        props.onCancel?.();
        TriggerDeviceModel.stepNumber = 0;
      }}
      footer={
        <div className="steps-action">
          {TriggerDeviceModel.stepNumber === 0 && (
            <Button
              onClick={() => {
                props.onCancel?.();
                TriggerDeviceModel.stepNumber = 0;
              }}
            >
              取消
            </Button>
          )}
          {TriggerDeviceModel.stepNumber > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
              上一步
            </Button>
          )}
          {TriggerDeviceModel.stepNumber < TriggerDeviceModel.steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => {
                next();
              }}
            >
              下一步
            </Button>
          )}
          {TriggerDeviceModel.stepNumber === TriggerDeviceModel.steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => {
                next();
              }}
            >
              确定
            </Button>
          )}
        </div>
      }
    >
      <div className="steps-steps">
        <Steps current={TriggerDeviceModel.stepNumber} items={TriggerDeviceModel.steps} />
      </div>
      <div className="steps-content">
        {loading && renderComponent(TriggerDeviceModel.steps[TriggerDeviceModel.stepNumber]?.key)}
      </div>
    </Modal>
  );
});
