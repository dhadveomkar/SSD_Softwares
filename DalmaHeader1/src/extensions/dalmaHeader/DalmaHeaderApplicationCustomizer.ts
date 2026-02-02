import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './DalmaHeaderApplicationCustomizer.module.scss';

const LOG_SOURCE: string = 'DalmaHeaderApplicationCustomizer';

export interface IDalmaHeaderApplicationCustomizerProperties {
  // Path to logo (hosted in SiteAssets or CDN)
  logoUrl?: string;
  contactEmail?: string;
  homeUrl?: string;
}

export default class DalmaHeaderApplicationCustomizer
  extends BaseApplicationCustomizer<IDalmaHeaderApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized DalmaHeaderApplicationCustomizer`);

    // Wait for placeholders to be available, then render
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceholders.bind(this));
    this._renderPlaceholders();

    return Promise.resolve();
  }

  private _renderPlaceholders(): void {
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this._onDispose });
      if (!this._topPlaceholder) {
        // placeholder not available (e.g., classic page). Exit gracefully.
        return;
      }

      const logoUrl = escape(this.properties.logoUrl || '/SiteAssets/dalma_logo.png');
      const contactEmail = escape(this.properties.contactEmail || 'info@dalma.com');
      const homeUrl = escape(this.properties.homeUrl || '/');

      // Build header HTML (simple, semantic)
      const headerHtml = `
        <div class="${styles.dalmaHeader}">
          <div class="${styles.leftSection}">
            <a class="${styles.homeLink}" href="${homeUrl}">Home</a>
            <div class="${styles.logoWrap}">
              <img src="${logoUrl}" alt="Dalma Logo" class="${styles.logo}" />
            </div>
            <div class="${styles.email}">${contactEmail}</div>
          </div>
          <div class="${styles.titleBox}">DALMA DIGITALIZATION</div>
        </div>
      `;

      this._topPlaceholder.domElement.innerHTML = headerHtml;
    }
  }

  private _onDispose(): void {
    console.log('[DalmaHeaderApplicationCustomizer._onDispose] Disposed custom header.');
  }
}
