import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import packs from '@site/static/downloads/catalog.json';
import styles from './styles.module.css';

function Pack({pack}) {
  const download = useBaseUrl(`/downloads/${pack.filename}`);
  return <article className={styles.card}>
    <h3>{pack.title}</h3><p>{pack.description}</p><p className={styles.limit}>{pack.limits}</p>
    <p>{pack.sourceFiles} fonte(s) · {Math.ceil(pack.bytes / 1024)} KiB · ZIP com pasta <code>{pack.root}</code></p>
    <Link to={`/docs/aulas/${pack.doc}/`}>Ler a aula completa →</Link>
    <a className="button button--primary" href={download} download={pack.filename}>Baixar fontes: {pack.title}</a>
    <details><summary>Conferir o SHA-256 deste ZIP</summary><code className={styles.hash}>{pack.sha256}</code><p>Compare com o hash calculado do arquivo baixado. O hash confirma correspondência com este catálogo; não certifica hardware nem substitui uma origem confiável.</p></details>
  </article>;
}
export default function SourcePacks() {
  return <section aria-label="Projetos originais para download"><div className={styles.grid}>{packs.map(pack => <Pack pack={pack} key={pack.id}/>)}</div></section>;
}
