// src/extensions/dynamicNavigationHeader/components/DynamicHeader.tsx
import * as React from 'react';
import { useEffect, useState } from 'react';
import { SPFI, spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/site-users/web';
import { IconButton, Panel, PanelType, Stack, Text } from '@fluentui/react';
import styles from './DynamicHeader.module.scss';
import { IDynamicHeaderProps } from './IDynamicHeaderProps';

export interface IDynamicNavItem {
  Id: number;
  Title: string;
  Url?: string;
  ParentId?: number | null;
  Order?: number;
  IconUrl?: string;
  AudienceType?: string;
  AudienceId?: string;
  IsEnabled?: boolean;
  OpenInNewTab?: boolean;
}

interface ItemWithChildren extends IDynamicNavItem {
  children: ItemWithChildren[];
}

function buildTree(items: IDynamicNavItem[]): ItemWithChildren[] {
  const map = new Map<number, ItemWithChildren>();
  items.forEach(i => map.set(i.Id, { ...i, children: [] }));

  const roots: ItemWithChildren[] = [];
  map.forEach(item => {
    if (item.ParentId) {
      const parent = map.get(Number(item.ParentId));
      if (parent) {
        parent.children.push(item as ItemWithChildren);
      } else {
        roots.push(item as ItemWithChildren);
      }
    } else {
      roots.push(item as ItemWithChildren);
    }
  });

  const sortRec = (arr: ItemWithChildren[]): void => {
    arr.sort((a, b) => (a.Order || 0) - (b.Order || 0));
    arr.forEach(x => x.children.length && sortRec(x.children));
  };

  sortRec(roots);
  return roots;
}

const DynamicHeader: React.FC<IDynamicHeaderProps> = ({ context, listName, logoText }) => {
  const [items, setItems] = useState<ItemWithChildren[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [currentUserSPGroups, setCurrentUserSPGroups] = useState<string[]>([]);

  useEffect(() => {
    // initialize PnPjs v3 with SPFx context (pass SPFx(context) directly)
    const sp: SPFI = spfi().using(SPFx(context));

    const fetchData = async () => {
      try {
        // 1) fetch user groups (v3 style)
        const groups = await sp.web.currentUser.groups();
        const groupTitles = (groups || []).map((g: any) => g && g.Title).filter(Boolean);
        setCurrentUserSPGroups(groupTitles);

        // 2) fetch nav items using CAML fallback (avoids items() typing issues)
        const list = sp.web.lists.getByTitle(listName);
        const caml = {
          ViewXml:
            `<View>
               <Query>
                 <OrderBy>
                   <FieldRef Name='Order' Ascending='TRUE' />
                 </OrderBy>
               </Query>
             </View>`
        };

        // getItemsByCAMLQuery works with older/mismatched PnP typings
        // It returns array of items; field names must match your list columns
        // (ensure your SharePoint list has fields named exactly as selected below)
        // @ts-ignore -- some @pnp typings might not include getItemsByCAMLQuery; this is a safe runtime call
        const rawItems: any[] = await (list as any).getItemsByCAMLQuery(caml);

        // Normalize fields to IDynamicNavItem shape (some fields may come as objects)
        const normalized: IDynamicNavItem[] = (rawItems || []).map(r => ({
          Id: r.Id,
          Title: r.Title,
          Url: (r.Url && r.Url.Url) || r.Url || r.Link || '',
          ParentId: r.ParentId ?? r.ParentID ?? null,
          Order: r.Order ?? r.Position ?? 0,
          IconUrl: r.IconUrl || r.Icon || '',
          AudienceType: r.AudienceType || r.Audience || '',
          AudienceId: r.AudienceId || r.AudienceIdRaw || '',
          IsEnabled: (r.IsEnabled === undefined) ? true : Boolean(r.IsEnabled),
          OpenInNewTab: Boolean(r.OpenInNewTab)
        }));

        const tree = buildTree(normalized);
        setItems(tree);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('DynamicHeader: failed to fetch navigation or groups', err);
        setItems([]);
        setCurrentUserSPGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [context, listName]);

  // Filter by audience (indexOf used for widest compatibility)
  const visibleItems = items.filter(it => {
    if (!it.IsEnabled) return false;
    if (!it.AudienceType || it.AudienceType === 'Everyone' || it.AudienceType === 'None') return true;
    if (it.AudienceType === 'SPGroup' && it.AudienceId) {
      return currentUserSPGroups.indexOf(it.AudienceId) !== -1;
    }
    // AADGroup handling would require Graph + permissions
    return false;
  });

  const renderDesktopMenu = () => (
    <nav aria-label="Main menu">
      <div className={styles.navList} role="menubar">
        {visibleItems.map(top => (
          <div key={top.Id} className={styles.navNode} role="none">
            <a
              href={top.Url || '#'}
              className={styles.navItem}
              role="menuitem"
              target={top.OpenInNewTab ? '_blank' : '_self'}
              rel={top.OpenInNewTab ? 'noreferrer noopener' : undefined}
            >
              {top.IconUrl && <img src={top.IconUrl} alt="" style={{ width: 16, height: 16, marginRight: 6 }} />}
              <span>{top.Title}</span>
            </a>

            {top.children && top.children.length > 0 && (
              <div className={styles.submenu} role="menu">
                {top.children.map(c => (
                  <a key={c.Id} className={styles.submenuItem} href={c.Url || '#'}>
                    {c.Title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );

  const renderMobileMenu = () => (
    <Panel
      isOpen={panelOpen}
      onDismiss={() => setPanelOpen(false)}
      type={PanelType.smallFixedNear}
      headerText="Navigation"
      closeButtonAriaLabel="Close"
    >
      <Stack tokens={{ childrenGap: 8 }}>
        {visibleItems.map(t => (
          <div key={t.Id}>
            <Text variant="mediumPlus">
              <a href={t.Url || '#'} onClick={() => setPanelOpen(false)}>
                {t.Title}
              </a>
            </Text>
            {t.children && t.children.length > 0 && (
              <div style={{ paddingLeft: 12 }}>
                {t.children.map(c => (
                  <div key={c.Id}>
                    <a href={c.Url || '#'} onClick={() => setPanelOpen(false)}>
                      {c.Title}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Stack>
    </Panel>
  );

  if (loading) return <div className={styles.dynamicHeaderRoot}>Loading navigation…</div>;

  return (
    <div className={styles.dynamicHeaderRoot} role="navigation" aria-label="Dynamic navigation">
      <div className={styles.headerInner}>
        <div className={styles.brand}>
          <span className={styles.brandText}>{logoText || 'Omnas Technologies'}</span>
        </div>

        <div className={styles.desktopOnly}>{renderDesktopMenu()}</div>

        <div className={styles.mobileOnly}>
          <IconButton iconProps={{ iconName: 'GlobalNavButton' }} title="Menu" ariaLabel="Menu" onClick={() => setPanelOpen(true)} />
        </div>
      </div>

      {renderMobileMenu()}
    </div>
  );
};

export default DynamicHeader;
