import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import DynamicNav from './components/DynamicNav';
import { sp } from '@pnp/sp/presets/all';

export default class DynamicNavigationWebPart extends BaseClientSideWebPart<{}> {
  public onInit(): Promise<void> {
    return super.onInit().then(_ => {
      sp.setup({ spfxContext: this.context });
    });
  }

  public render(): void {
    const element = React.createElement(DynamicNav, {});
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}
