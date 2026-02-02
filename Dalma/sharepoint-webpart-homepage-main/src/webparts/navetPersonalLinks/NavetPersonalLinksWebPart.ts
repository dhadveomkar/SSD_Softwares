import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'NavetPersonalLinksWebPartStrings';
import NavetPersonalLinks from './components/NavetPersonalLinks';
import { INavetPersonalLinksProps } from './components/INavetPersonalLinksProps';

export interface INavetPersonalLinksWebPartProps extends INavetPersonalLinksProps {
}

export default class NavetPersonalLinksWebPart extends BaseClientSideWebPart<INavetPersonalLinksWebPartProps> {

  public render(): void {
    const element: React.ReactElement<INavetPersonalLinksProps> = React.createElement(
      NavetPersonalLinks,
      {
        context: this.context,
        ...this.properties,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('listTitle', {
                  label: 'Navn på liste'
                }),
                PropertyPaneSlider('smallListLimit', {
                  label: 'Antall snarveier i vanlig visning',
                  min: 1,
                  max: 20,
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
