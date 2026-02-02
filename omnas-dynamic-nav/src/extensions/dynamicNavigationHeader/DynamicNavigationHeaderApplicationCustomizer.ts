// src/extensions/dynamicNavigationHeader/DynamicNavigationHeaderApplicationCustomizer.ts
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer, PlaceholderContent, PlaceholderName } from '@microsoft/sp-application-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import DynamicHeader from './components/DynamicHeader';
import { IDynamicHeaderProps } from './components/IDynamicHeaderProps';

const LOG_SOURCE: string = 'DynamicNavigationHeaderApplicationCustomizer';

export interface IDynamicNavigationHeaderProperties {
  listName?: string;
  logoText?: string;
}

export default class DynamicNavigationHeaderApplicationCustomizer
  extends BaseApplicationCustomizer<IDynamicNavigationHeaderProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${LOG_SOURCE}`);

    this.context.placeholderProvider.changedEvent.add(this, () => this._renderPlaceholders());
    this._renderPlaceholders();

    return Promise.resolve();
  }

  private _renderPlaceholders(): void {
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this._onDispose });

      if (!this._topPlaceholder) {
        console.warn('Top placeholder not found.');
        return;
      }

      const props: IDynamicHeaderProps = {
        context: this.context as any,
        listName: this.properties.listName || 'DynamicNavigationItems',
        logoText: this.properties.logoText || 'Omnas Technologies'
      };

      ReactDom.render(React.createElement(DynamicHeader, props), this._topPlaceholder.domElement);
    }
  }

  private _onDispose(): void {
    console.log('[DynamicNavigationHeader] disposed');
  }

  public onDispose(): void {
    super.onDispose();
    console.log('[DynamicNavigationHeader] onDispose called');
  }
}
