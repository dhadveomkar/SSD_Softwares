import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface INavetPersonalLinksProps {
  context: WebPartContext;
  listTitle: string;
  smallListLimit: number;
}
