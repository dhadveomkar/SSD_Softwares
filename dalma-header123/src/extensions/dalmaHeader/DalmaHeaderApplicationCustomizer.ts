import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { escape } from '@microsoft/sp-lodash-subset';

export interface IDalmaHeaderProperties {
  logoUrl?: string;
  heroImageUrl?: string;
  menuItems?: string; // JSON string of {title, href}
}

const LOG_SOURCE: string = 'DalmaHeaderApplicationCustomizer';

export default class DalmaHeaderApplicationCustomizer
  extends BaseApplicationCustomizer<IDalmaHeaderProperties> {

  private bottomPlaceholder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized DALMA Header Customizer`);

    this.context.placeholderProvider.changedEvent.add(this, this.renderHeader);

    this.renderHeader(); // attempt immediate render
    return Promise.resolve();
  }

  private renderHeader(): void {

    if (!this.bottomPlaceholder) {
      this.bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Bottom);
    }

    if (!this.bottomPlaceholder) {
      console.warn("DALMA HEADER: Bottom placeholder not found.");
      return;
    }

    /** DEFAULT PROPERTIES **/
    const logoUrl =
      this.properties.logoUrl ||
      '/sites/DALMADIGITALIZATION/SiteAssets/dalma_logo.png';

    const heroImageUrl =
      this.properties.heroImageUrl ||
      '/sites/DALMADIGITALIZATION/SiteAssets/Mumbai_Skyline_at_Night.jpg';

    let menu: Array<{ title: string; href: string }> = [];

    try {
      if (this.properties.menuItems) {
        menu = JSON.parse(this.properties.menuItems);
      } else {
        // Default menu
        menu = [
          { title: 'Home', href: '/sites/DALMADIGITALIZATION' },
          { title: 'Dashboards', href: '/sites/DALMADIGITALIZATION/SitePages/Dashboards.aspx' },
          { title: 'Reports', href: '/sites/DALMADIGITALIZATION/SitePages/Reports.aspx' },
          { title: 'Operations', href: '/sites/DALMADIGITALIZATION/SitePages/Operations.aspx' },
          { title: 'Contact', href: '/sites/DALMADIGITALIZATION/SitePages/Contact.aspx' }
        ];
      }
    } catch {
      console.warn("DALMA HEADER: menuItems JSON parse failed. Using defaults.");
      menu = [
        { title: 'Home', href: '/sites/DALMADIGITALIZATION' },
        { title: 'Dashboards', href: '/sites/DALMADIGITALIZATION/SitePages/Dashboards.aspx' },
        { title: 'Reports', href: '/sites/DALMADIGITALIZATION/SitePages/Reports.aspx' },
        { title: 'Operations', href: '/sites/DALMADIGITALIZATION/SitePages/Operations.aspx' },
        { title: 'Contact', href: '/sites/DALMADIGITALIZATION/SitePages/Contact.aspx' }
      ];
    }

    /** Build Menu HTML **/
    const menuHtml = menu
      .map(m => `<li class="dalma-menu-item"><a href="${escape(m.href)}">${escape(m.title)}</a></li>`)
      .join("");

    /** HEADER + NAV + HERO **/
    const html = `
      <div id="dalma-header-container" style="font-family:Segoe UI,Arial; width:100%; box-sizing:border-box;">

        <!-- TOP BAR -->
        <div style="background:white; padding:10px 20px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${escape(logoUrl)}"
                 alt="DALMA logo"
                 style="height:44px; object-fit:contain;"
                 onerror="this.style.display='none'"/>
            <div style="font-weight:600; color:#0b5ea8; font-size:16px;">
              DALMA DIGITALIZATION
            </div>
          </div>

          <div style="font-size:13px; color:#444;">
            <a href="mailto:digitalization@dalma.com">digitalization@dalma.com</a>
          </div>
        </div>

        <!-- BLUE LINE -->
        <div style="height:6px; background:#1E90FF;"></div>

        <!-- NAVIGATION -->
        <nav style="background:#fff; border-top:1px solid #eee; border-bottom:1px solid #eee;">
          <div style="max-width:1400px; margin:0 auto; padding:10px 20px;">
            <ul style="list-style:none; display:flex; gap:22px; margin:0; padding:0; align-items:center;">
              ${menuHtml}
            </ul>
          </div>
        </nav>

        <!-- HERO IMAGE -->
        <div style="position:relative; width:100%; overflow:hidden; margin-top:10px;">
          <img src="${escape(heroImageUrl)}"
               alt="Hero"
               style="width:100%; height:340px; object-fit:cover; display:block;"
               onerror="this.style.display='none'"/>

          <!-- CENTERED BOX -->
          <div style="
            position:absolute;
            left:50%; top:50%;
            transform:translate(-50%,-50%);
          ">
            <div style="
              background:rgba(11,94,168,0.9);
              padding:12px 20px;
              border-radius:4px;
              box-shadow:0 4px 16px rgba(0,0,0,0.2);
            ">
              <div style="
                color:white;
                font-weight:700;
                font-size:22px;
                letter-spacing:1px;
              ">DALMA DIGITALIZATION</div>
            </div>
          </div>
        </div>

      </div>

      <!-- CSS -->
      <style>
        .dalma-menu-item a {
          color:#333;
          text-decoration:none;
          font-weight:600;
          transition:0.2s;
        }
        .dalma-menu-item a:hover {
          color:#0b5ea8;
          text-decoration:underline;
        }
        @media(max-width:720px){
          .dalma-menu-item { display:none; }
        }
      </style>
    `;

    this.bottomPlaceholder.domElement.innerHTML = html;
  }

  public onDispose(): void {}
}
