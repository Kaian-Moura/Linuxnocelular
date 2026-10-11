import React,{useEffect,useRef} from 'react';
import OriginalSearchBar from '@theme-original/SearchBar';

// O plugin traduz o placeholder, mas mantém alguns rótulos ARIA literais em
// inglês. A camada local corrige esses rótulos sem copiar o código do plugin.
export default function SearchBar(props) {
  const root=useRef(null);
  useEffect(()=>{
    const label=()=>{
      root.current?.querySelector('input')?.setAttribute('aria-label','Pesquisar na documentação');
      root.current?.querySelectorAll('button').forEach(button=>{
        if(button.textContent.trim()==='✕') button.setAttribute('aria-label','Limpar busca');
      });
    };
    label();
    const observer=new MutationObserver(label);
    if(root.current) observer.observe(root.current,{childList:true,subtree:true});
    return ()=>observer.disconnect();
  },[]);
  return <div ref={root}><OriginalSearchBar {...props}/></div>;
}
