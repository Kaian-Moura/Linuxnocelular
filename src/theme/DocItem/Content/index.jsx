import React from 'react';
import OriginalContent from '@theme-original/DocItem/Content';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';

export default function DocItemContent(props) {
  const {frontMatter} = useDoc();
  const rawDate = String(frontMatter.last_verified || '');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate.split('-').reverse().join('/') : null;
  const evidence = frontMatter.verification || frontMatter.validation;
  return <OriginalContent {...props}>
    <aside className="guide-context" aria-label="Contexto e ajuda deste guia">
      <div>{date && <span>Revisão da página: <time dateTime={rawDate}>{date}</time></span>}<span>{evidence === 'documental' ? 'Revisão documental' : 'Consulte as fontes e o escopo de teste'}</span></div>
      <p>{frontMatter.hardware_tested === false ? 'Sem teste físico nesta revisão. ' : ''}Modelo, firmware e versão podem mudar o procedimento.</p>
      <nav aria-label="Ajuda para seguir este guia"><Link to="/docs/comece-aqui/minha-trilha/">Minha trilha</Link><Link to="/docs/comece-aqui/terminal-primeiros-passos/">Onde digitar?</Link><Link to="/docs/diagnostico/erros-para-iniciantes/">Não funcionou?</Link></nav>
    </aside>
    {props.children}
  </OriginalContent>;
}
