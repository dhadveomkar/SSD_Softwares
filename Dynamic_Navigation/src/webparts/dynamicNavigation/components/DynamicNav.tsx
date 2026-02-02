import * as React from 'react';
import { useEffect, useState } from 'react';
import { sp } from '@pnp/sp/presets/all';

interface NavItem { ID:number; Title:string; LinkUrl?:any; ParentId?:number|null; Order?:number; IconUrl?:string; Audience?:string; IsExternal?:boolean; OpenInNewTab?:boolean; Visible?:boolean; children?:NavItem[]; }

const DynamicNav: React.FC = () => {
  const [items,setItems] = useState<NavItem[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string | null>(null);

  useEffect(()=>{ sp.web.currentUser.get().then(u=> loadNavItems(u.Email)).catch(e=> setError(e.message)); },[]);

  async function loadNavItems(currentUserEmail:string){
    try{
      const raw = await sp.web.lists.getByTitle('DynamicNavigationItems').items.select('ID','Title','LinkUrl','ParentId','Order','IconUrl','Audience','IsExternal','OpenInNewTab','Visible').orderBy('Order',true).get();
      const mapped:NavItem[] = raw.map((r:any)=>({ ID:r.ID, Title:r.Title, LinkUrl:r.LinkUrl, ParentId:r.ParentId||null, Order:r.Order, IconUrl:r.IconUrl, Audience:r.Audience||'', IsExternal:r.IsExternal, OpenInNewTab:r.OpenInNewTab, Visible: typeof r.Visible === 'undefined' ? true : !!r.Visible}));
      const filtered = mapped.filter(i=> i.Visible);
      const tree = buildTree(filtered);
      setItems(tree);
    }catch(e:any){ setError(e.message || String(e)); }
    finally{ setLoading(false); }
  }

  function buildTree(flat:NavItem[]){ const map = new Map<number,NavItem>(); flat.forEach(i=>{ i.children=[]; map.set(i.ID,i)}); const roots:NavItem[] = []; map.forEach(i=>{ if(i.ParentId && map.has(i.ParentId)){ map.get(i.ParentId)!.children!.push(i);} else roots.push(i); }); function sortRec(list:NavItem[]){ list.sort((a,b)=>(a.Order||0)-(b.Order||0)); list.forEach(i=> i.children && sortRec(i.children)); } sortRec(roots); return roots; }

  if(loading) return <div>Loading navigation...</div>;
  if(error) return <div style={{color:'red'}}>Error: {error}</div>;

  return (
    <nav className="dynamic-nav"><ul>{items.map(it=> <NavNode key={it.ID} item={it} level={0} />)}</ul></nav>
  );
}

const NavNode: React.FC<{item:NavItem; level:number}> = ({item,level})=>{
  const [open,setOpen] = useState(false);
  const hasChildren = item.children && item.children.length>0;
  const link = item.LinkUrl ? (typeof item.LinkUrl === 'object' ? item.LinkUrl.Url : String(item.LinkUrl)) : '#';
  return (
    <li className={`nav-item level-${level}`}>
      <div className="nav-item-row">
        {item.IconUrl ? <img src={item.IconUrl} alt="" style={{width:20,height:20}} /> : <span style={{width:20,height:20,display:'inline-block',background:'#ddd'}}></span>}
        <a href={link} target={item.OpenInNewTab ? '_blank' : '_self'} rel={item.IsExternal ? 'noopener noreferrer' : undefined}>{item.Title}</a>
        {hasChildren && <button onClick={()=> setOpen(!open)}>{open? '▾':'▸'}</button>}
      </div>
      {hasChildren && open && <ul>{item.children!.map(ch=> <NavNode key={ch.ID} item={ch} level={level+1} />)}</ul>}
    </li>
  );
}

export default DynamicNav;
