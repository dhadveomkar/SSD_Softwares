import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LastSaleComponent } from '../../last-sale/last-sale';

interface NavItem {
  key: string;
  label: string;
  badge?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  constructor(private router: Router) {}

// hovered key on left column (collabs)
  hoveredCollabKey: string | null = null;

  // selected node for the hovered key (keeps template simple & safe)
  selectedHover: NavItem | null = null;

  navItems: NavItem[] = [
    { key: 'last-sale', label: 'LAST SALE' },
    {
      key: 'eyewear',
      label: 'EYEWEAR',
      children: [
        { key: 'eye-all', label: 'SHOP ALL' },
        { key: 'sun', label: 'SUNGLASSES' },
        { key: 'eye', label: 'EYEGLASSES' },
        { key: 'sport', label: 'SPORTS EYEWEAR' },
      ]
    },
    {
      key: 'headwear',
      label: 'HEADWEAR',
      children: [
        { key: 'hw-all', label: 'ALL' },
        { key: 'baseball', label: 'BASEBALL CAPS' },
        { key: 'snapback', label: 'SNAPBACK CAPS' },
        { key: 'sports', label: 'SPORTS CAPS' },
        { key: 'dad', label: 'DAD CAPS' },
        { key: '5p', label: '5 PANEL CAPS' },
        { key: 'bucket', label: 'BUCKET HATS' },
        { key: 'docker', label: 'DOCKER HATS' },
        { key: 'beanie', label: 'BEANIES' },
      ]
    },
    { key: 'umsystms', label: 'UMSYSTMS', badge: 'NEW' },
    { key: 'loop-wait', label: 'LOOP WAITLIST', badge: 'NEW' },
    { key: 'winterwear', label: 'WINTERWEAR' },
    { key: 'clothing', label: 'CLOTHING' },

    // ACCESSORIES (with LOOP → MIXTAPE 2.0 node inside)
    {
      key: 'accessories',
      label: 'ACCESSORIES',
      children: [
        { key: 'acc-all', label: 'SHOP ALL' },
        { key: 'wallets', label: 'WALLETS' },
        { key: 'bags', label: 'BACKPACKS' },
        { key: 'sling', label: 'SLING BAGS' },
        { key: 'coin', label: 'COIN POUCHES' },
        { key: 'belts', label: 'BELTS' },
        { key: 'keychains', label: 'KEYCHAINS' },
        { key: 'socks', label: 'SOCKS' },

        {
          key: 'loop',
          label: 'LOOP',
          children: [
            { key: 'mixtape-1', label: 'MIXTAPE 1.0' },
            {
              key: 'mixtape-2',
              label: 'MIXTAPE 2.0',
              children: [
                { key: 'mixtape-2-royalenfield', label: 'ROYAL ENFIELD' },
                { key: 'mixtape-2-mtv', label: 'MTV' },
                { key: 'mixtape-2-playboy', label: 'PLAYBOY' },
                { key: 'mixtape-2-raftaar', label: 'RAFTAAR' },
                { key: 'mixtape-2-rannvijay', label: 'RANNVIJAY' },
                { key: 'mixtape-2-gullygang', label: 'GULLY GANG' },
                { key: 'mixtape-2-youthiapa', label: 'YOUTHIAPA' }
              ]
            },
            { key: 'mixtape-3', label: 'MIXTAPE 3.0' }
          ]
        }
      ]
    },

    // COLLABS: left list + MIXTAPE 2.0 node (key 'collabs-mixtape-2')
    {
      key: 'collabs',
      label: 'COLLABS',
      children: [
        { key: 'collabs-royal-enfield', label: 'ROYAL ENFIELD' },
        { key: 'collabs-mtv', label: 'MTV' },
        { key: 'collabs-playboy', label: 'PLAYBOY' },
        { key: 'collabs-raftaar', label: 'RAFTAAR' },
        { key: 'collabs-rannvijay', label: 'RANNVIJAY' },
        { key: 'collabs-gully-gang', label: 'GULLY GANG' },
        { key: 'collabs-youthiapa', label: 'YOUTHIAPA' },
        {
          key: 'collabs-mixtape-2',
          label: 'MIXTAPE 2.0',
          children: [
            { key: 'mix-okami', label: 'OKAMI' },
            { key: 'mix-mobeius', label: 'MOBEIUS' },
            { key: 'mix-screenseva', label: 'SCREENSEVA' },
            { key: 'mix-bhaukal', label: 'BHAUKAL' },
            { key: 'mix-homework', label: 'HOMEWORK' },
            { key: 'mix-doodle-mapuls', label: 'DOODLE MAPULS' },
            { key: 'mix-studio-sorted', label: 'STUDIO SORTED' }
          ]
        }
      ]
    },

    { key: 'about', label: 'ABOUT US' }
  ];

  // click handler (replace with router navigation if you wish)
  openCategory(key: string) {
    console.log('Clicked →', key);
  }

  // sets hovered key and also caches the selected node for the template
  setHovered(key: string | null) {
    this.hoveredCollabKey = key;
    this.selectedHover = this.findItem(key);
  }

  // reset hover (use on mouseleave)
  clearHover() {
    this.hoveredCollabKey = null;
    this.selectedHover = null;
  }

  // find item inside collabs by key (returns NavItem or null)
  findItem(key: string | null): NavItem | null {
    if (!key) return null;
    const collabsNode = this.navItems.find(n => n.key === 'collabs');
    if (!collabsNode?.children) return null;
    return collabsNode.children.find(c => c.key === key) ?? null;
  }

  
}
