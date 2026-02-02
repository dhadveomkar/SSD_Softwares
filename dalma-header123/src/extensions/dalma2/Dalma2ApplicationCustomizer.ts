import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { escape } from '@microsoft/sp-lodash-subset';

export interface IDalma2ApplicationCustomizerProperties {
  logoUrl?: string;
  heroImageUrl?: string;
  menuItems?: string;
}

const LOG_SOURCE: string = 'Dalma4ApplicationCustomizer';

export default class Dalma2ApplicationCustomizer
  extends BaseApplicationCustomizer<IDalma2ApplicationCustomizerProperties> {

  private topPlaceholder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {

    Log.info(LOG_SOURCE, 'DALMA custom header loaded.');

    this.context.placeholderProvider.changedEvent.add(this, this.renderHeader);
    this.renderHeader();

    return Promise.resolve();
  }

  private renderHeader(): void {

    if (!this.topPlaceholder) {
      this.topPlaceholder =
        this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
    }

    if (!this.topPlaceholder) {
      console.warn("DALMA HEADER: Top placeholder not available.");
      return;
    }

    // defaults
    const logoUrl = this.properties.logoUrl
      || '/sites/DALMADIGITALIZATION/SiteAssets/dalma_logo.png';

    const heroImageUrl = this.properties.heroImageUrl
      || '/sites/DALMADIGITALIZATION/SiteAssets/Mumbai_Skyline_at_Night.jpg';

    let menu: Array<{ title: string; href: string }> = [];

    try {
      if (this.properties.menuItems) {
        menu = JSON.parse(this.properties.menuItems);
      } else {
        menu = [
          { title: 'Home', href: '/sites/DALMADIGITALIZATION' },
          { title: 'Dashboards', href: '/sites/DALMADIGITALIZATION/SitePages/Dashboards.aspx' },
          { title: 'Reports', href: '/sites/DALMADIGITALIZATION/SitePages/Reports.aspx' },
          { title: 'Operations', href: '/sites/DALMADIGITALIZATION/SitePages/Operations.aspx' },
          { title: 'Contact', href: '/sites/DALMADIGITALIZATION/SitePages/Contact.aspx' }
        ];
      }
    } catch {
      console.warn("DALMA HEADER: Failed to parse menuItems JSON.");
    }

    const menuHtml = menu
      .map(m => `
        <li class="dalma-menu-item">
          <a href="${escape(m.href)}">${escape(m.title)}</a>
        </li>
      `)
      .join("");

    // ============================
    // CLEAN INSIDE-SHAREPOINT HEADER
    // ============================
    const html = `
<style>

  /* Remove the weird green SharePoint page section header */
  div[data-automation-id="pageHeader"] {
    display: none !important;
  }

  /* Remove margin between SP header & our header */
  .CanvasZone {
    margin-top: 0 !important;
  }

  /* Make our header flush with the top */
  #dalma-header-container {
    margin-top: 0 !important;
    padding: 0 !important;
  }

  /* Menu style */
  .dalma-menu-item a {
    color: #333;
    text-decoration: none;
    font-weight: 600;
    transition: 0.2s;
  }

  .dalma-menu-item a:hover {
    color: #0b5ea8;
    text-decoration: underline;
  }

  @media(max-width:720px){
    .dalma-menu-item {
      display:none;
    }
  }

</style>

<div id="dalma-header-container" style="font-family:Segoe UI,Arial;width:100%;">


  <!-- TOP BAR -->
  <div style="background:white;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:12px;">
      <img src="${escape(logoUrl)}" style="height:44px;" />
      <div style="font-weight:600;color:#0b5ea8;font-size:16px;">
        DALMA DIGITALIZATION
      </div>
    </div>
    <div style="font-size:13px;color:#444;">
      <a href="mailto:digitalization@dalma.com">digitalization@dalma.com</a>
    </div>
  </div>


  <!-- SEPARATOR -->
  <div style="height:6px;background:#1E90FF;"></div>


  <!-- MENU -->
  <nav style="background:#fff;border-bottom:1px solid #ddd;">
    <div style="max-width:1400px;margin:0 auto;padding:10px 20px;">
      <ul style="list-style:none;display:flex;gap:22px;margin:0;padding:0;">
        ${menuHtml}
      </ul>
    </div>
  </nav>


  <!-- FULL-WIDTH HERO -->
  <div style="position:relative;width:100%;overflow:hidden;">
    <img src="${escape(heroImageUrl)}"
         style="width:100%;height:320px;object-fit:cover;" />

    <div style="
        position:absolute;
        top:50%;left:50%;
        transform:translate(-50%,-50%);
        background:rgba(11,94,168,0.9);
        padding:12px 24px;
        border-radius:4px;">
      <div style="color:white;font-weight:700;font-size:22px;letter-spacing:1px;">
        DALMA DIGITALIZATION
      </div>
    </div>
  </div>

</div>
`;

    this.topPlaceholder.domElement.innerHTML = html;
  }

  public onDispose(): void {}
}
