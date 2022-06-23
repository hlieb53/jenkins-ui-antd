import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import { useEffect, useRef, useState } from 'react';
import './index.less';
import Service from './service';
import encodeQuery from '@/utils/encodeQuery';
import { useRequest } from 'umi';
import DashBoard, { DashBoardTopCard } from '@/components/DashBoard';
import type { EChartsOption } from 'echarts';
import Echarts from '@/components/DashBoard/echarts';
// import moment from 'moment';
import { AMap } from '@/components';
import { Marker } from 'react-amap';
import { EnvironmentOutlined } from '@ant-design/icons';
import SystemConst from '@/utils/const';

type RefType = {
  getValues: Function;
};

const service = new Service('device/instance');

const DeviceBoard = () => {
  const [deviceOnline, setDeviceOnline] = useState(0);
  const [deviceOffline, setDeviceOffline] = useState(0);
  const [productPublish, setProductPublish] = useState(0);
  const [productUnPublish, setProductUnPublish] = useState(0);
  const [options, setOptions] = useState<EChartsOption>({});
  const [onlineOptions, setOnlineOptions] = useState<EChartsOption>({});
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [deviceOptions, setDeviceOptions] = useState<EChartsOption>({});
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(0);
  const [point, setPoint] = useState([]);
  const [amapKey, setAmapKey] = useState<any>();

  const ref = useRef<RefType>();

  const { data: deviceTotal } = useRequest(service.deviceCount, {
    formatResult: (res) => res.result,
  });
  const { data: productTotal } = useRequest(service.productCount, {
    defaultParams: [{}],
    formatResult: (res) => res.result,
  });

  //设备数量
  const deviceStatus = async () => {
    const onlineRes = await service.deviceCount(encodeQuery({ terms: { state: 'online' } }));
    if (onlineRes.status === 200) {
      setDeviceOnline(onlineRes.result);
    }
    const offlineRes = await service.deviceCount(encodeQuery({ terms: { state: 'offline' } }));
    if (offlineRes.status === 200) {
      setDeviceOffline(offlineRes.result);
    }
  };

  //产品数量
  const productStatus = async () => {
    const pusblish = await service.productCount({
      terms: [
        {
          column: 'state',
          value: '1',
        },
      ],
    });
    if (pusblish.status === 200) {
      setProductPublish(pusblish.result);
    }
    const unpublish = await service.productCount({
      terms: [
        {
          column: 'state',
          value: '0',
        },
      ],
    });
    if (unpublish.status === 200) {
      setProductUnPublish(unpublish.result);
    }
  };

  //当前在线
  const getOnline = async () => {
    const res = await service.dashboard([
      {
        dashboard: 'device',
        object: 'session',
        measurement: 'online',
        dimension: 'agg',
        group: 'aggOnline',
        params: {
          state: 'online',
          limit: 15,
          from: 'now-15d',
          time: '1d',
          format: 'yyyy-MM-dd',
        },
      },
    ]);
    if (res.status === 200) {
      const x = res.result.map((item: any) => item.data.timeString).reverse();
      const y = res.result.map((item: any) => item.data.value);
      setYesterdayCount(y?.[1]);
      setOnlineOptions({
        xAxis: {
          type: 'category',
          data: x,
          show: false,
        },
        yAxis: {
          type: 'value',
          show: false,
        },
        grid: {
          top: '5%',
          bottom: 0,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        series: [
          {
            name: '在线数',
            data: y.reverse(),
            type: 'bar',
            itemStyle: {
              color: '#2F54EB',
            },
          },
        ],
      });
    }
  };
  //今日设备消息量
  const getDevice = async () => {
    const res = await service.dashboard([
      {
        dashboard: 'device',
        object: 'message',
        measurement: 'quantity',
        dimension: 'agg',
        group: 'today',
        params: {
          time: '1h',
          format: 'yyyy-MM-dd HH:mm:ss',
          limit: 24,
          from: 'now-1d',
        },
      },
      {
        dashboard: 'device',
        object: 'message',
        measurement: 'quantity',
        dimension: 'agg',
        group: 'oneday',
        params: {
          time: '1d',
          format: 'yyyy-MM-dd',
          from: 'now-1d',
        },
      },
      {
        dashboard: 'device',
        object: 'message',
        measurement: 'quantity',
        dimension: 'agg',
        group: 'thisMonth',
        params: {
          time: '1M',
          format: 'yyyy-MM',
          limit: 1,
          from: 'now-1M',
        },
      },
    ]);
    if (res.status === 200) {
      const thisMonth = res.result.find((item: any) => item.group === 'thisMonth').data.value;
      const oneDay = res.result.find((item: any) => item.group === 'oneday').data.value;
      setDay(oneDay);
      setMonth(thisMonth);
      const today = res.result.filter((item: any) => item.group === 'today');
      const x = today.map((item: any) => item.data.timeString).reverse();
      const y = today.map((item: any) => item.data.value).reverse();
      setDeviceOptions({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          show: false,
          data: x,
        },
        yAxis: {
          type: 'value',
          show: false,
        },
        grid: {
          top: '2%',
          bottom: 0,
        },
        series: [
          {
            name: '消息量',
            data: y,
            type: 'line',
            smooth: true,
            color: '#685DEB',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#685DEB', // 100% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#FFFFFF', //   0% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
          },
        ],
      });
    }
  };

  const getEcharts = async () => {
    const data = ref.current!.getValues();
    console.log(data);
    if (data && data.time.type !== 'today') {
      const res = await service.dashboard([
        {
          dashboard: 'device',
          object: 'message',
          measurement: 'quantity',
          dimension: 'agg',
          group: 'device_msg',
          params: {
            time: '1d',
            format: 'yyyy.MM.dd',
            limit: Math.ceil((data.time.end - data.time.start) / (1 * 24 * 3600 * 1000) + 1),
            // from: moment(data.time.start).format('yyyy-MM-DD HH:MM:SS'),
            // to: moment(data.time.end).format('yyyy-MM-DD HH:MM:SS'),
            from: data.time.start,
            to: data.time.end,
          },
        },
      ]);
      if (res.status === 200) {
        const x = res.result.map((item: any) => item.data.timeString).reverse();
        const y = res.result.map((item: any) => item.data.value).reverse();
        setOptions({
          xAxis: {
            type: 'category',
            data: x,
          },
          yAxis: {
            type: 'value',
          },
          tooltip: {
            trigger: 'axis',
            // axisPointer: {
            //   type: 'shadow',
            // },
          },
          grid: {
            top: '2%',
            bottom: '5%',
            left: '2%',
            right: '2%',
          },
          series: [
            {
              name: '消息量',
              data: y,
              type: 'line',
              smooth: true,
              color: '#685DEB',
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: '#685DEB', // 100% 处的颜色
                    },
                    {
                      offset: 1,
                      color: '#FFFFFF', //   0% 处的颜色
                    },
                  ],
                  global: false, // 缺省为 false
                },
              },
            },
          ],
        });
      }
    } else {
      const res = await service.dashboard([
        {
          dashboard: 'device',
          object: 'message',
          measurement: 'quantity',
          dimension: 'agg',
          group: 'device_msg',
          params: {
            time: '1h',
            format: 'yyyy.MM.dd HH:MM:SS',
            limit: 24,
            from: data.time.start,
            to: data.time.end,
          },
        },
      ]);
      if (res.status === 200) {
        const x = res.result.map((item: any) => item.data.timeString).reverse();
        const y = res.result.map((item: any) => item.data.value).reverse();
        setOptions({
          xAxis: {
            type: 'category',
            data: x,
          },
          yAxis: {
            type: 'value',
          },
          tooltip: {
            trigger: 'axis',
          },
          grid: {
            top: '2%',
            bottom: '5%',
            left: '2%',
            right: '2%',
          },
          series: [
            {
              name: '消息量',
              data: y,
              type: 'line',
              smooth: true,
              color: '#685DEB',
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: '#685DEB', // 100% 处的颜色
                    },
                    {
                      offset: 1,
                      color: '#FFFFFF', //   0% 处的颜色
                    },
                  ],
                  global: false, // 缺省为 false
                },
              },
            },
          ],
        });
      }
    }
  };
  //地图数据
  const geo = async (data?: any) => {
    const res = await service.getGeo(data);
    if (res.status === 200) {
      setPoint(res.result.features);
    }
  };

  useEffect(() => {
    deviceStatus();
    productStatus();
    getOnline();
    getDevice();
    geo({});
  }, []);

  useEffect(() => {
    const api = localStorage.getItem(SystemConst.AMAP_KEY);
    setAmapKey(api);
  }, [localStorage.getItem(SystemConst.AMAP_KEY)]);

  return (
    <PageContainer>
      <div className={'device-dash-board'}>
        <DashBoardTopCard>
          <DashBoardTopCard.Item
            title={'产品数量'}
            value={productTotal}
            footer={[
              {
                title: '已发布',
                value: productPublish,
                status: 'success',
              },
              {
                title: '未发布',
                value: productUnPublish,
                status: 'error',
              },
            ]}
            span={6}
          >
            <img src={require('/public/images/device/device-product.png')} />
          </DashBoardTopCard.Item>
          <DashBoardTopCard.Item
            title={'设备数量'}
            value={deviceTotal}
            footer={[
              {
                title: '在线',
                value: deviceOnline,
                status: 'success',
              },
              {
                title: '离线',
                value: deviceOffline,
                status: 'error',
              },
            ]}
            span={6}
          >
            <img src={require('/public/images/device/device-number.png')} />
          </DashBoardTopCard.Item>
          <DashBoardTopCard.Item
            title={'当前在线'}
            value={deviceOnline}
            footer={[
              {
                title: '昨日在线',
                value: yesterdayCount,
              },
            ]}
            span={6}
          >
            <Echarts options={onlineOptions} />
          </DashBoardTopCard.Item>
          <DashBoardTopCard.Item
            title={'今日设备消息量'}
            value={day}
            footer={[
              {
                title: '当月设备消息量',
                value: month,
              },
            ]}
            span={6}
          >
            <Echarts options={deviceOptions} />
          </DashBoardTopCard.Item>
        </DashBoardTopCard>
        <DashBoard
          title={'设备消息'}
          options={options}
          ref={ref}
          height={500}
          defaultTime={'week'}
          showTime={true}
          showTimeTool={true}
          onParamsChange={getEcharts}
        />
        {amapKey && (
          <Card style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: 10,
              }}
            >
              设备分布
            </div>
            <div>
              <AMap
                AMapUI
                style={{
                  height: 500,
                  width: '100%',
                }}
              >
                {point.map((item: any) => (
                  //@ts-ignore
                  <Marker
                    position={{
                      longitude: item.geometry.coordinates?.[0],
                      latitude: item.geometry.coordinates?.[1],
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          backgroundColor: '#666666',
                          color: 'white',
                          textAlign: 'center',
                          marginBottom: 5,
                        }}
                      >
                        {item.properties.deviceName}
                      </div>
                      <div>
                        <EnvironmentOutlined style={{ color: 'blue', fontSize: 22 }} />
                      </div>
                    </div>
                  </Marker>
                ))}
              </AMap>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};
export default DeviceBoard;
