import { PageContainer } from '@ant-design/pro-layout';
import { Button } from 'antd';
import { useState } from 'react';
import Device from './device';
import Init from './init';
import Ops from './ops';

const ViewMap = {
  init: <Init />,
  device: <Device />,
  ops: <Ops />,
};

type ViewType = keyof typeof ViewMap;

const Home = () => {
  const [current, setCurrent] = useState<ViewType>('init');

  return (
    <PageContainer>
      <Button onClick={() => setCurrent('device')}>切换视图</Button>
      {ViewMap[current]}
    </PageContainer>
  );
};
export default Home;
