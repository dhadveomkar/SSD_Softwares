import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './BookStoreWebPart.module.scss';
import * as strings from 'BookStoreWebPartStrings';

export interface IBookStoreWebPartProps {
  description: string;
}

export default class BookStoreWebPart extends BaseClientSideWebPart<IBookStoreWebPartProps> {

  private _isDarkTheme: boolean = false;

public render(): void {

  // Choose header background or icon based on theme
  const headerBg = this._isDarkTheme 
    ? require('./assets/header-dark.png') 
    : require('./assets/header-light.png');

  this.domElement.innerHTML = `
    <section class="${styles.bookStore}">

      <header class="${styles.header}" style="background-image: url('${headerBg}'); background-size: cover; padding: 1em; color: white;">
        <h1>📚 Online Book Store</h1>
        <p>${escape(this.properties.description)}</p>
        <input type="text" id="searchBox" class="${styles.search}"
               placeholder="Search books..." />
      </header>

      <div class="${styles.bookGrid}">
        ${this._bookCard('Clean Code', 'Robert C. Martin', '₹499')}
        ${this._bookCard('Atomic Habits', 'James Clear', '₹399')}
        ${this._bookCard('Java – The Complete Reference', 'Herbert Schildt', '₹699')}
        ${this._bookCard('You Don’t Know JS', 'Kyle Simpson', '₹459')}
      </div>

    </section>
  `;

  this._attachSearch();
}


  // -----------------------------
  // BOOK CARD TEMPLATE
  // -----------------------------
  private _bookCard(title: string, author: string, price: string): string {
    return `
      <div class="${styles.bookCard}">
        <div class="${styles.bookIcon}">📘</div>
        <h3>${title}</h3>
        <p>${author}</p>
        <span class="${styles.price}">${price}</span>
        <button class="${styles.buyBtn}">Buy Now</button>
      </div>
    `;
  }

  // -----------------------------
  // SEARCH FUNCTIONALITY
  // -----------------------------
  private _attachSearch(): void {
  // Query the search input
  const searchBox = this.domElement.querySelector('#searchBox') as HTMLInputElement;
  // Query all book cards
  const cards = this.domElement.querySelectorAll(`.${styles.bookCard}`);

  if (!searchBox) return;

  // Attach event listener
  searchBox.addEventListener('keyup', () => {
    const value = searchBox.value.toLowerCase();

    cards.forEach(card => {
      const text = (card.textContent || '').toLowerCase();

      // Use indexOf for compatibility with older ES targets
      const isVisible = text.indexOf(value) > -1;

      (card as HTMLElement).style.display = isVisible ? 'block' : 'none';
    });
  });
}

  // -----------------------------
  // THEME SUPPORT
  // -----------------------------
  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;

    this._isDarkTheme = !!currentTheme.isInverted;

    const semanticColors = currentTheme.semanticColors;
    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || '');
      this.domElement.style.setProperty('--link', semanticColors.link || '');
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // -----------------------------
  // PROPERTY PANE
  // -----------------------------
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: 'Store subtitle'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
