export type ProductItem = {
  id: string;
  name: string;
  classifiedId: string;
  classifiedName: string;
  configuration: Record<string, any>;
  createTime: number;
  creatorId: string;
  deviceType: {
    text: string;
    value: string;
  };
  count?: number;
  messageProtocol: string;
  metadata: string;
  orgId: string;
  protocolName: string;
  state: number;
  transportProtocol: string;
};

export type ConfigProperty = {
  property: string;
  name: string;
  description: string;
  type: {
    name: string;
    id: string;
    type: string;
  };
  scopes: any[];
};

export type ConfigMetadata = {
  name: string;
  description: string;
  scopes: any[];
  properties: ConfigProperty[];
};

export type DeviceMetadata = {
  events: Partial<EventMetadata>[];
  properties: Partial<PropertyMetadata>[];
  functions: Partial<FunctionMetadata>[];
  tags: Partial<TagMetadata>[];
};
export type MetadataItem = Partial<EventMetadata | PropertyMetadata | FunctionMetadata> &
  Record<string, any>;

type EventMetadata = {
  id: string;
  name: string;
  expands?: {
    eventType?: string;
    level?: string;
  } & Record<string, any>;
  valueType: {
    type: string;
    properties: {
      id: string;
      name: string;
      dataType: string;
      valueType: {
        type: string;
      } & Record<any, any>;
    }[];
  };
  description: string;
};
type FunctionMetadata = {
  id: string;
  name: string;
  async: boolean;
  output: Record<any, any>;
  inputs: ({
    id: string;
    name: string;
    valueType: {
      type: string;
    } & Record<any, any>;
  } & Record<string, any>)[];
};
type PropertyMetadata = {
  id: string;
  name: string;
  dataType?: string;
  valueType: {
    type: string;
  } & Record<any, any>;
  expands: Record<string, any>;
  description?: string;
};
type TagMetadata = {
  id: string;
  name: string;
  valueType: {
    type: string;
  } & Record<string, any>;
  expands: Record<string, any>;
};
