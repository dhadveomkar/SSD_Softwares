import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderName,
  PlaceholderContent
} from '@microsoft/sp-application-base';

const LOG_SOURCE: string = 'HeroCustomizerApplicationCustomizer';

export interface IHeroCustomizerProperties {}

export default class HeroCustomizerApplicationCustomizer
  extends BaseApplicationCustomizer<IHeroCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized HeroCustomizer`);

    this.context.placeholderProvider.changedEvent.add(
      this,
      this._renderPlaceholders.bind(this)
    );

    this._renderPlaceholders();
    return Promise.resolve();
  }

  private _renderPlaceholders(): void {
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this._onDispose.bind(this) }
      );

      if (!this._topPlaceholder) {
        console.warn("Top placeholder not available.");
        return;
      }

      this._topPlaceholder.domElement.innerHTML = `
        <style>
          :root { --maxcontent: 1200px; font-family: Inter, Roboto, Segoe UI, system-ui; }
          * { box-sizing: border-box; }
          .hero-customizer-root { background:#f2f6fb; color:#fff; }
          header { display:flex; justify-content:center; align-items:center; padding:8px 16px; }
          .header-inner { max-width:var(--maxcontent); width:100%; display:flex; justify-content:center; align-items:center; gap:40px; }
          .logo img { height:42px; }
          .nav { display:flex; gap:18px; font-size:13px; color:#0b5fa8; }
          .nav a { color:#0b5fa8; text-decoration:none; }
          .hero { position:relative; overflow:hidden; background:#000; width:100%; min-height:520px; }
          .carousel { display:flex; width:100%; transition:transform 1s cubic-bezier(.2,.9,.3,1); }
          .slide { min-width:100%; height:520px; background-size:cover; background-position:center; }
          .arrow { position:absolute; top:50%; transform:translateY(-50%); width:48px; height:48px; border-radius:6px; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:60; }
          .arrow.left { left:15px; } .arrow.right { right:15px; }
          .dots { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); display:flex; gap:8px; }
          .dot { width:10px; height:10px; background:#ffffff44; border-radius:50%; cursor:pointer; }
          .dot.active { background:white; }
          @media(max-width:520px){ .slide { height:320px; } }
        </style>

        <div class="hero-customizer-root">
          <header>
            <div class="header-inner">
              <div class="logo">
                <img src="/sites/DALMADIGITALIZATION/SiteAssets/dalma_logo.png" />
              </div>
              <nav class="nav">
                <a href="/sites/DALMADIGITALIZATION">Home</a>
                <a href="/sites/DALMADIGITALIZATION/SitePages/Dashboards.aspx">Dashboards</a>
                <a href="/sites/DALMADIGITALIZATION/SitePages/Reports.aspx">Reports</a>
                <a href="/sites/DALMADIGITALIZATION/SitePages/Operations.aspx">Operations</a>
                <a href="/sites/DALMADIGITALIZATION/SitePages/Contact.aspx">Contact</a>
              </nav>
            </div>
          </header>

          <section class="hero" id="hero">
            <div class="carousel" id="carousel">
              <div class="slide" style="background-image:url('/sites/DALMADIGITALIZATION/SiteAssets/Mumbai_Skyline_at_Night.jpg')"></div>
              <div class="slide" style="background-image:url('/sites/DALMADIGITALIZATION/SiteAssets/Mumbai_Skyline_at_Night.jpg')"></div>
              <div class="slide" style="background-image:url('/sites/DALMADIGITALIZATION/SiteAssets/Mumbai_Skyline_at_Night.jpg')"></div>
            </div>

            <button class="arrow left" id="hc-prev">❮</button>
            <button class="arrow right" id="hc-next">❯</button>

            <div class="dots" id="hc-dots"></div>
          </section>
        </div>
      `;

      // Initialize carousel after DOM renders
      setTimeout(() => this._attachCarouselLogic(), 200);
    }
  }

  private _attachCarouselLogic(): void {
    const carousel = document.getElementById("carousel");
    if (!carousel) return;

    // Replace Array.from with slice.call for ES5 compatibility
    const slides = Array.prototype.slice.call(carousel.children) as HTMLElement[];
    const dotsWrap = document.getElementById("hc-dots")!;
    const prevBtn = document.getElementById("hc-prev")!;
    const nextBtn = document.getElementById("hc-next")!;

    let index = 0;

    // Create dots
    dotsWrap.innerHTML = "";
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement("div");
      dot.className = "dot";
      dot.addEventListener("click", (): void => { index = i; update(); resetAuto(); });
      dotsWrap.appendChild(dot);
    }

    const dots = Array.prototype.slice.call(dotsWrap.children) as HTMLElement[];

    const update = (): void => {
      carousel.style.transform = `translateX(-${index * 100}%)`;
      for (let i = 0; i < dots.length; i++) {
        dots[i].classList.toggle("active", i === index);
      }
    };

    const next = (): void => { index = (index + 1) % slides.length; update(); };
    const prev = (): void => { index = (index - 1 + slides.length) % slides.length; update(); };

    prevBtn.addEventListener("click", (): void => { prev(); resetAuto(); });
    nextBtn.addEventListener("click", (): void => { next(); resetAuto(); });

    let autoTimer = setInterval(next, 4500);
    const resetAuto = (): void => { clearInterval(autoTimer); autoTimer = setInterval(next, 4500); };

    update();
  }

  private _onDispose(): void {
    console.log('[HeroCustomizer] disposed');
  }
}
