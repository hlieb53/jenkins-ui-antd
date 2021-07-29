export type DeviceInstance = {
  id: string;
  name: string;
  describe: string;
  description: string;
  productId: string;
  productName: string;
  protocolName: string;
  security: any;
  deriveMetadata: string;
  metadata: string;
  binds: any;
  state: {
    value: string;
    text: string;
  };
  creatorId: string;
  creatorName: string;
  createTime: number;
  registryTime: string;
  disabled?: boolean;
  aloneConfiguration?: boolean;
  deviceType: {
    value: string;
    text: string;
  };
  transportProtocol: string;
  messageProtocol: string;
  orgId: string;
  orgName: string;
  configuration: Record<string, any>;
  cachedConfiguration: any;
  transport: string;
  protocol: string;
  address: string;
  registerTime: number;
  onlineTime: string | number;
  tags: any;
};
