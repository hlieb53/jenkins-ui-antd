import { model } from '@formily/reactive';
import type { MetadataItem, MetadataType } from '@/pages/device/Product/typings';

type MetadataModelType = {
  item: MetadataItem | unknown;
  edit: boolean;
  type: MetadataType;
  action: 'edit' | 'add';
  import: boolean;
  importMetadata: boolean;
};
const MetadataModel = model<MetadataModelType>({
  item: undefined,
  edit: false,
  type: 'events',
  action: 'add',
  import: false,
  importMetadata: false,
});
export default MetadataModel;
