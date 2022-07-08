import { CaretDownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Checkbox, Radio, Select, Tooltip } from 'antd';
import type { CheckboxValueType } from 'antd/lib/checkbox/Group';
import _ from 'lodash';
import { useEffect, useState } from 'react';

interface Props {
  value: any;
  check?: boolean;
  level?: number;
  assetsList?: any[];
  change: (data: any) => void;
  checkChange?: (data: any) => void;
}

const MenuPermission = (props: Props) => {
  const [value, setValue] = useState<any>(props.value);
  const [checkAll, setCheckAll] = useState<boolean>(props.value?.check === 1);
  const [visible, setVisible] = useState<boolean>(value.id === 'menu-permission');
  const [indeterminate, setIndeterminate] = useState<boolean>(props.value?.check === 2);
  const [checkbox, setCheckbox] = useState<boolean>(false);
  const [checkValue, setCheckValue] = useState<string>('');

  useEffect(() => {
    setValue(props.value);
    setCheckAll(props.value?.check === 1);
    setIndeterminate(props.value?.check === 2);
    const val =
      (props.value?.assetAccesses || []).filter((i: any) => i?.granted)[0]?.supportId || '';
    // if (!val && props.value?.check === 1) {
    //   setCheckValue('creator');
    // } else {
    setCheckValue(val);
    // }
  }, [props.value]);

  const checkAllData: any = (data: any[], check: boolean, cvalue?: any) => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => {
        const buttons = (item?.buttons || []).map((i: any) => {
          return {
            ...i,
            granted: check,
          };
        });
        return {
          ...item,
          assetAccesses: (item?.assetAccesses || []).map((i: any) => {
            return {
              ...i,
              granted: !cvalue ? false : !i.granted ? i.supportId === cvalue : i.granted,
            };
          }),
          check: check ? 1 : 3, // 1: 全选 2: 只选了部分 3: 一个都没选
          buttons: [...buttons],
          children: item?.children ? checkAllData(item?.children || [], check, cvalue) : [],
        };
      });
    }
    return [];
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: (props?.level || 0) * 10,
          transition: 'background .3s',
          borderBottom: '1px solid #f0f0f0',
          minHeight: 50,
        }}
        key={value?.id}
      >
        <div
          style={{
            width: 20,
            textAlign: 'center',
            height: 20,
            transform: !visible ? 'rotate(-90deg)' : 'none',
          }}
        >
          {value?.children && value?.children?.length > 0 && (
            <CaretDownOutlined
              onClick={() => {
                setVisible(!visible);
              }}
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: `calc(50% - ${(props?.level || 0) * 5}px)`,
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <div>
            <Checkbox
              indeterminate={indeterminate}
              checked={checkAll}
              style={{
                padding: '10px 0',
                width: 250 - (props?.level || 0) * 10,
                borderRight: '1px solid #f0f0f0',
                marginRight: 20,
                fontWeight: value.id === 'menu-permission' ? 600 : 400,
              }}
              onChange={(e) => {
                let access: any[] = [];
                let cvalue: any = checkValue;
                if (e.target.checked && !checkValue) {
                  setCheckValue('creator');
                  cvalue = 'creator';
                  access = (value?.assetAccesses || []).map((i: any) => {
                    return {
                      ...i,
                      granted: i.supportId === 'creator',
                    };
                  });
                } else if (!e.target.checked) {
                  setCheckValue('');
                  cvalue = '';
                  access = (value?.assetAccesses || []).map((i: any) => {
                    return {
                      ...i,
                      granted: false,
                    };
                  });
                } else {
                  cvalue = checkValue;
                  access = value?.assetAccesses || [];
                }
                setCheckAll(e.target.checked);
                setIndeterminate(false);
                const buttons = (value?.buttons || []).map((i: any) => {
                  return {
                    ...i,
                    granted: e.target.checked,
                  };
                });
                props.change({
                  ...value,
                  assetAccesses: [...access],
                  check: e.target.checked ? 1 : 3, // 1: 全选 2: 只选了部分 3: 一个都没选
                  buttons: [...buttons],
                  children: checkAllData(value.children || [], e.target.checked, cvalue),
                });
              }}
            >
              {value?.name}
            </Checkbox>
          </div>
          <div style={{ padding: 5 }}>
            {value.id === 'menu-permission' ? (
              <span style={{ fontWeight: value.id === 'menu-permission' ? 600 : 400 }}>
                操作权限
              </span>
            ) : (
              <Checkbox.Group
                name={value?.id}
                value={_.map(
                  (value?.buttons || []).filter((i: any) => i?.granted),
                  'id',
                )}
                onChange={(data: CheckboxValueType[]) => {
                  let access: any[] = [];
                  if (data.length > 0 && !checkValue) {
                    setCheckValue('creator');
                    access = (value?.assetAccesses || []).map((i: any) => {
                      return {
                        ...i,
                        granted: i.supportId === 'creator',
                      };
                    });
                  } else if (data.length === 0) {
                    setCheckValue('');
                    access = (value?.assetAccesses || []).map((i: any) => {
                      return {
                        ...i,
                        granted: false,
                      };
                    });
                  } else {
                    access = value?.assetAccesses || [];
                  }
                  const buttons = value.buttons.map((i: any) => {
                    return {
                      ...i,
                      granted: data.includes(i.id),
                    };
                  });
                  const clen = (value?.children || []).filter((i: any) => i.check !== 3).length;
                  let check: number = 3;
                  if (data.length + clen === 0) {
                    check = 3;
                  } else if (
                    data.length + clen <
                    value?.buttons.length + (value?.children.length || 0)
                  ) {
                    check = 2;
                  } else {
                    check = 1;
                  }
                  const d = {
                    ...value,
                    check,
                    assetAccesses: [...access],
                    buttons: [...buttons],
                  };
                  props.change(d);
                }}
                style={{ width: '100%' }}
                options={(value?.buttons || []).map((i: any) => ({
                  label: i.name,
                  value: i.id,
                  key: i.id,
                }))}
              />
            )}
          </div>
        </div>
        <div
          style={{
            width: `calc(50% - ${(props?.level || 0) * 10}px - 20px)`,
            padding: '10px 0 10px 20px',
          }}
        >
          {value.id === 'menu-permission' ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: value.id === 'menu-permission' ? 600 : 400 }}>
                数据权限
                <Tooltip title="勾选任意数据权限均能看到自己创建的数据权限">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
              <Checkbox
                checked={checkbox}
                style={{ margin: '0 10px' }}
                onChange={(e) => {
                  setCheckbox(e.target.checked);
                  setCheckValue('');
                }}
              >
                批量设置
              </Checkbox>
              {checkbox && (
                <Select
                  showSearch
                  placeholder="请选择"
                  optionFilterProp="children"
                  style={{ width: 200 }}
                  onChange={(val: string) => {
                    setCheckValue(val);
                    if (props.checkChange) {
                      props.checkChange(val);
                    }
                  }}
                  filterOption={(input: any, option: any) =>
                    (option?.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {(props?.assetsList || []).map((item) => (
                    <Select.Option key={`${item?.supportId}`} value={item?.supportId}>
                      {item?.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </div>
          ) : (
            <div>
              {value?.accessSupport?.value !== 'support' ? (
                <div>{value?.accessDescription}</div>
              ) : (
                <Radio.Group
                  defaultValue={'creator'}
                  value={checkValue}
                  onChange={(e) => {
                    setCheckValue(e.target.value);
                    const access = (value?.assetAccesses || []).map((i: any) => {
                      return {
                        ...i,
                        granted: i.supportId === e.target.value,
                      };
                    });
                    const d = {
                      ...value,
                      assetAccesses: [...access],
                    };
                    props.change(d);
                  }}
                >
                  {value?.assetAccesses.map((item: any) => (
                    <Radio value={item?.supportId} key={item?.supportId}>
                      {item?.name}
                    </Radio>
                  ))}
                </Radio.Group>
              )}
            </div>
          )}
        </div>
      </div>
      {visible &&
        value?.children &&
        (value?.children || []).map((item: { id: string }) => (
          <div key={item.id}>
            <MenuPermission
              level={(props?.level || 0) + 1}
              value={item}
              change={(data: any) => {
                const children = (value?.children || []).map((i: any) => {
                  if (data.id === i.id) {
                    return data;
                  }
                  return i;
                });
                let check: number = 3;
                const blen = value.buttons?.length || 0;
                const bblen = (value?.buttons || []).filter((i: any) => i.granted).length || 0;
                const clen = children.length || 0;
                const cclen = (children || []).filter((i: any) => i.check !== 3).length || 0;
                const cclen1 = (children || []).filter((i: any) => i.check === 1).length || 0;
                if (clen + blen > 0 && clen + blen === cclen1 + bblen) {
                  check = 1;
                } else if (cclen + bblen === 0) {
                  check = 3;
                } else {
                  check = 2;
                }
                props.change({ ...value, check, children });
              }}
            />
          </div>
        ))}
    </>
  );
};
export default MenuPermission;
