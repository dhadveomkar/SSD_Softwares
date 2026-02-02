import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { escape } from '@microsoft/sp-lodash-subset';

export interface IDalma4ApplicationCustomizerProperties {
  logoUrl?: string;
  heroImages?: string; // JSON string: ["/sites/.../img1.jpg", "/sites/.../img2.jpg"]
  menuItems?: string; // JSON string: [{ title: string, href: string }]
  heroSwapInterval?: number; // milliseconds
}

const LOG_SOURCE: string = 'Dalma4ApplicationCustomizer';

export default class Dalma4ApplicationCustomizer extends BaseApplicationCustomizer<IDalma4ApplicationCustomizerProperties> {
  private topPlaceholder: PlaceholderContent | undefined;
  private currentHeroIndex: number = 0;
  private heroImages: string[] = [];
  private swapTimer: number | undefined;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized Dalma4 Custom Header');

    // Listen for placeholder changes and render
    this.context.placeholderProvider.changedEvent.add(this, this.renderHeader);
    this.renderHeader();

    return Promise.resolve();
  }

  private renderHeader(): void {
    // Create top placeholder (header area)
    if (!this.topPlaceholder) {
      this.topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
    }

    if (!this.topPlaceholder || !this.topPlaceholder.domElement) {
      console.warn('DALMA4 HEADER: Top placeholder not available.');
      return;
    }

    // Default assets (developer will map /mnt/data/deploy.png to an accessible URL)
    const defaultLogo = this.properties.logoUrl || '/sites/DALMADIGITALIZATION/SiteAssets/dalma_logo.png';
    const defaultHero = '/mnt/data/deploy.png';

    // heroImages can be provided as a JSON string property; otherwise use a single default hero
    try {
      if (this.properties.heroImages) {
        const parsed = JSON.parse(this.properties.heroImages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.heroImages = parsed.map((s: any) => String(s));
        }
      }
    } catch (e) {
      console.warn('DALMA4 HEADER: heroImages parse failed, using default.');
    }
    if (this.heroImages.length === 0) {
      this.heroImages = [defaultHero];
    }

    // Menu items
    let menu: Array<{ title: string; href: string }> = [];
    try {
      if (this.properties.menuItems) {
        const parsed = JSON.parse(this.properties.menuItems);
        if (Array.isArray(parsed)) {
          menu = parsed.map((m: any) => ({ title: String(m.title || ''), href: String(m.href || '#') }));
        }
      }
    } catch (e) {
      console.warn('DALMA4 HEADER: menuItems JSON parse failed.');
    }
    if (menu.length === 0) {
      menu = [
        { title: 'Home', href: '/sites/DALMADIGITALIZATION' },
        { title: 'Dashboards', href: '/sites/DALMADIGITALIZATION/SitePages/Dashboards.aspx' },
        { title: 'Reports', href: '/sites/DALMADIGITALIZATION/SitePages/Reports.aspx' },
        { title: 'Operations', href: '/sites/DALMADIGITALIZATION/SitePages/Operations.aspx' },
        { title: 'Contact', href: '/sites/DALMADIGITALIZATION/SitePages/Contact.aspx' }
      ];
    }

    // hero swap interval
    const interval = Number(this.properties.heroSwapInterval) || 7000;

    // Build menu HTML
    const menuHtml = menu
      .map(m => `<li class="dalma-menu-item"><a href="${escape(m.href)}">${escape(m.title)}</a></li>`)
      .join('');

    // Note: using CSS variables if available for theme-matching, and sensible fallbacks
    const html = `
      <div id="dalma-header-root" class="dalma-header-container" role="banner">
        <div class="dalma-topbar">
          <div class="dalma-inner">
            <div class="dalma-brand">
              <img src="${escape(defaultLogo)}" alt="DALMA logo" class="dalma-logo" />
              <div class="dalma-title">DALMA DIGITALIZATION</div>
            </div>
            <div class="dalma-contact">
              <a href="mailto:digitalization@dalma.com">digitalization@dalma.com</a>
            </div>
          </div>
        </div>

        <nav class="dalma-nav" role="navigation">
          <div class="dalma-inner">
            <ul class="dalma-menu" aria-label="Main navigation">
              ${menuHtml}
            </ul>
          </div>
        </nav>

        <div class="dalma-hero">
          <div class="dalma-hero-inner">
            <img id="dalma-hero-img" src="${escape(this.heroImages[this.currentHeroIndex])}" alt="Hero" />
            <div class="dalma-hero-caption">DALMA DIGITALIZATION</div>
          </div>
        </div>

        <style>
          /* Container sizing to fit within SharePoint page.
             We keep the hero full-width image but center the internal content to match page width. */
          .dalma-header-container { width:100%; box-sizing:border-box; }
          .dalma-inner { max-width:1200px; margin:0 auto; padding:0 20px; box-sizing:border-box; }

          /* Top bar */
          .dalma-topbar { background: var(--themePrimary, #0b5ea8); color: var(--bodyText, #ffffff); padding:10px 0; }
          .dalma-brand { display:flex; align-items:center; gap:12px; }
          .dalma-logo { height:44px; object-fit:contain; }
          .dalma-title { font-weight:700; font-size:16px; color:var(--neutralPrimary, #ffffff); }
          .dalma-contact { font-size:13px; }
          .dalma-contact a { color:var(--neutralLight, #f3f3f3); text-decoration:none; }

          /* Navigation: sticky only (menu sticks while hero scrolls under it) */
          .dalma-nav { background:var(--canvasColor, #ffffff); border-top:1px solid rgba(0,0,0,0.05); border-bottom:1px solid rgba(0,0,0,0.05); position:sticky; top:48px; z-index:999; }
          /* top:48px assumes modern SharePoint suite bar height - it works in most layouts. If your suite bar is taller, tweak this value. */
          .dalma-menu { list-style:none; display:flex; gap:20px; margin:0; padding:12px 0; align-items:center; overflow:auto; }
          .dalma-menu-item a { color:var(--neutralPrimary, #333); text-decoration:none; font-weight:600; padding:6px 8px; display:inline-block; }
          .dalma-menu-item a:hover { color:var(--themePrimary, #0b5ea8); text-decoration:underline; }

          /* Hero */
          .dalma-hero { width:100%; overflow:hidden; background:#f4f4f4; }
          .dalma-hero-inner { position:relative; max-width:100%; }
          .dalma-hero img { width:100%; height:360px; object-fit:cover; display:block; opacity:0; animation:fadeIn 600ms ease forwards; }
          .dalma-hero-caption { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); background:rgba(11,94,168,0.9); padding:12px 22px; border-radius:6px; color:white; font-weight:700; font-size:20px; letter-spacing:1px; }

          /* Fade animation for image swapping */
          @keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }

          /* Mobile friendliness */
          @media(max-width:720px){
            .dalma-hero img { height:220px; }
            .dalma-title { font-size:14px; }
            .dalma-menu { gap:12px; font-size:14px; }
            .dalma-contact { display:none; }
            .dalma-hero-caption { font-size:16px; padding:8px 14px; }
          }

          /* Accessibility: ensure focus styles for keyboard nav */
          .dalma-menu-item a:focus { outline:2px solid var(--themePrimary, #0b5ea8); outline-offset:2px; }
        </style>
      </div>`;

    // Render into placeholder
    this.topPlaceholder.domElement.innerHTML = html;

    // After injecting, wire up hero swapping logic
    this.setupHeroSwapping(interval);
  }

  private setupHeroSwapping(interval: number): void {
    // Clear existing timer
    if (this.swapTimer) {
      window.clearInterval(this.swapTimer);
      this.swapTimer = undefined;
    }

    // If only one image, nothing to swap
    if (!this.heroImages || this.heroImages.length < 2) {
      return;
    }

    // Ensure image element exists
    const imgEl = document.getElementById('dalma-hero-img') as HTMLImageElement | null;
    if (!imgEl) { return; }

    // Swap every `interval` ms with a smooth fade
    this.swapTimer = window.setInterval(() => {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
      const nextSrc = this.heroImages[this.currentHeroIndex];

      // Fade-out -> change -> fade-in
      imgEl.style.transition = 'opacity 400ms ease';
      imgEl.style.opacity = '0';
      setTimeout(() => {
        imgEl.src = nextSrc;
        imgEl.style.opacity = '1';
      }, 420);
    }, interval) as unknown as number; // cast for older TS DOM typings
  }

  @override
  public onDispose(): void {
    if (this.swapTimer) {
      window.clearInterval(this.swapTimer);
    }
  }
}
