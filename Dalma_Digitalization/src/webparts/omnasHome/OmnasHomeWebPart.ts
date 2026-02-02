import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import styles from './OmnasHomeWebPart.module.scss';

export interface IOmnasHomeWebPartProps {
  description: string;
}

export default class OmnasHomeWebPart extends BaseClientSideWebPart<IOmnasHomeWebPartProps> {

  public render(): void {
    this.domElement.innerHTML = `
      <div class="${styles.homepage}">

        <!-- Navbar -->
        <header class="${styles.navbar}">
          <div class="${styles.logo}">Omnas</div>
          <nav class="${styles.nav}">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </nav>
          <button class="${styles.menuBtn}">☰</button>
        </header>

        <!-- Hero -->
        <section id="home" class="${styles.hero}">
          <div class="${styles.heroContent}">
            <h1>Build Stunning Web Experiences</h1>
            <p>Fast. Responsive. Beautiful.</p>
            <button class="${styles.btnPrimary}">
              ${this.properties.description || 'Get Started'}
            </button>
          </div>
        </section>

        <!-- Features -->
        <section id="features">
          <h2 class="${styles.sectionTitle}">Why Choose Us</h2>
          <div class="${styles.cardContainer}">
            <div class="${styles.card} ${styles.reveal}">
              <h3>Fast</h3>
              <p>Optimized performance and speed.</p>
            </div>
            <div class="${styles.card} ${styles.reveal}">
              <h3>Modern UI</h3>
              <p>Clean and beautiful design.</p>
            </div>
            <div class="${styles.card} ${styles.reveal}">
              <h3>Responsive</h3>
              <p>Works on all devices.</p>
            </div>
          </div>
        </section>

        <!-- Services -->
        <section id="services">
          <h2 class="${styles.sectionTitle}">Our Services</h2>
          <div class="${styles.servicesGrid}">
            <div class="${styles.service} ${styles.reveal}">Web Development</div>
            <div class="${styles.service} ${styles.reveal}">UI/UX Design</div>
            <div class="${styles.service} ${styles.reveal}">Backend APIs</div>
            <div class="${styles.service} ${styles.reveal}">SEO Optimization</div>
          </div>
        </section>

        <!-- Contact -->
        <section id="contact">
          <h2 class="${styles.sectionTitle}">Contact Us</h2>
          <form class="${styles.contactForm} ${styles.reveal}">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Email" required />
            <textarea placeholder="Message" required></textarea>
            <button class="${styles.btnPrimary}" type="submit">
              Send Message
            </button>
          </form>
        </section>

        <footer class="${styles.footer}">
          © 2025 Omnas. All rights reserved.
        </footer>

      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {

    /* Scroll Reveal Animation */
    const reveals = this.domElement.querySelectorAll(`.${styles.reveal}`);

    window.addEventListener('scroll', () => {
      reveals.forEach((el: Element) => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) {
          el.classList.add(styles.active);
        }
      });
    });

    /* Mobile Menu Toggle */
    const menuBtn = this.domElement.querySelector(`.${styles.menuBtn}`);
    const nav = this.domElement.querySelector(`.${styles.nav}`) as HTMLElement;

    menuBtn?.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Omnas Home Page Settings'
          },
          groups: [
            {
              groupName: 'Hero Section',
              groupFields: [
                PropertyPaneTextField('description', {
                  label: 'Hero Button Text'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
