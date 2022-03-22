import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  // primaryColor: '#1890ff',
  // 极光绿
  primaryColor: '#1d39c4',
  layout: 'mix',
  contentWidth: 'Fluid',
  splitMenus: true,
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Jetlinks',
  pwa: false,
  logo: '/logo.svg',
  iconfontUrl: '',
};

export default Settings;
