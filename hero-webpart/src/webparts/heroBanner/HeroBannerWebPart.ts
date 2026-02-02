import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

export interface IHeroBannerWebPartProps {}

export default class HeroBannerWebPart extends BaseClientSideWebPart<IHeroBannerWebPartProps> {

  public render(): void {
    this.domElement.innerHTML = `
<style>
:root{
  --blue:#1e90ff;
  --deep:#0b5fa8;
  --overlay: rgba(5,10,20,0.35);
  --card-bg: #2d9bff;
  --glass: rgba(255,255,255,0.06);
  --maxcontent:1200px;
  font-family: Inter, Roboto, 'Segoe UI', system-ui, -apple-system;
}

*{box-sizing:border-box}
body,html{height:100%;margin:0;background:#f2f6fb;color:#fff}

/* HEADER */
header{
  display:flex;
  align-items:center;
  justify-content:center;
  padding:8px 16px;
  background:transparent;
}

.header-inner{
  max-width:var(--maxcontent);
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-direction:row;
  gap:40px;
}

.logo img{
  height:42px;
  width:auto;
}

.nav{
  display:flex;
  gap:18px;
  align-items:center;
  font-size:13px;
  color:#0b5fa8;
}

.nav a{
  color:#0b5fa8;
  text-decoration:none;
  opacity:.95;
}

/* HERO */
.hero{
  position:relative;
  overflow:hidden;
  background:#000;
  width:100%;
  min-height:520px;
}

.carousel{
  display:flex;
  transition:transform 1s cubic-bezier(.2,.9,.3,1);
  will-change:transform;
  width:100%;
}

.slide{
  min-width:100%;
  height:520px;
  background-position:center;
  background-size:cover;
  filter:contrast(1.02) saturate(1.05);
  position:relative;
}

.slide::after{
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(180deg, rgba(0,24,48,0.25) 0%, rgba(0,6,14,0.45) 60%);
}

/* ARROWS */
.arrow{
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  width:48px;height:48px;
  border-radius:6px;
  background:rgba(0,0,0,0.35);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;border:0;z-index:60;
  backdrop-filter:blur(4px);
}
.arrow svg{width:18px;height:18px;fill:#fff}
.arrow.left{left:14px}
.arrow.right{right:14px}

/* DOTS */
.dots{
  position:absolute;
  left:50%;
  bottom:18px;
  transform:translateX(-50%);
  display:flex;gap:8px;
}
.dot{
  width:10px;height:10px;
  border-radius:50%;
  background:rgba(255,255,255,0.25);
  cursor:pointer;
}
.dot.active{background:#fff}

/* Responsive */
@media (max-width:520px){
  .logo img{height:34px}
  .nav{gap:12px;font-size:12px}
  .slide{height:320px}
  .arrow{width:40px;height:40px}
}
</style>

<header>
  <div class="header-inner">
    <div class="logo">
      <img src="/sites/DALMADIGITALIZATION/SiteAssets/dalma_logo.png" alt="ADNOC logo" />
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
  <div id="carousel" class="carousel">
    <div class="slide" style="background-image:url('/sites/DALMADIGITALIZATION/SiteAssets/Mumbai_Skyline_at_Night.jpg')"></div>
    <div class="slide" style="background-image:url('/sites/DALMADIGITALIZATION/SiteAssets/Mumbai_Skyline_at_Night.jpg')"></div>
    <div class="slide" style="background-image:url('/sites/DALMADIGITALIZATION/SiteAssets/Mumbai_Skyline_at_Night.jpg')"></div>
  </div>

  <button class="arrow left" id="prev">
    <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
  </button>

  <button class="arrow right" id="next">
    <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
  </button>

  <div class="dots" id="dots"></div>
</section>

<script>
(function(){
  const carousel = document.getElementById('carousel');
  const slides = Array.from(carousel.children);
  const dotsWrap = document.getElementById('dots');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const hero = document.getElementById('hero');

  slides.forEach((s,i)=>{
    const d = document.createElement('button');
    d.className = 'dot';
    d.addEventListener('click',()=>{ goTo(i); resetAuto(); });
    dotsWrap.appendChild(d);
  });

  const dots = Array.from(dotsWrap.children);
  let index = 0;

  function update(){
    carousel.style.transform = 'translateX(' + (-index * 100) + '%)';
    dots.forEach((d,i)=>d.classList.toggle('active', i===index));
  }

  function goTo(i){ index = (i+slides.length)%slides.length; update(); }
  function prev(){ goTo(index-1); }
  function next(){ goTo(index+1); }

  let autoTimer = null;
  function startAuto(){ autoTimer = setInterval(()=>{ next(); }, 4500); }
  function resetAuto(){ clearInterval(autoTimer); startAuto(); }
  startAuto();

  hero.addEventListener('mouseenter',()=>clearInterval(autoTimer));
  hero.addEventListener('mouseleave',()=>resetAuto());

  prevBtn.addEventListener('click',()=>{ prev(); resetAuto(); });
  nextBtn.addEventListener('click',()=>{ next(); resetAuto(); });

  update();
})();
</script>
    `;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: []
    };
  }
}
