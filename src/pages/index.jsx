import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

const routes = [
  ['01', 'Linux nativo', 'Substitua o Android quando houver um port para o seu modelo. Entenda boot, kernel, drivers e recuperação.', '/docs/nativo/visao-geral/', 'Suporte por dispositivo'],
  ['02', 'Linux sobre Android', 'Comece com Termux e PRoot. Explore chroot, interfaces gráficas e os limites do kernel que você já tem.', '/docs/android/visao-geral/', 'Android permanece'],
  ['03', 'Hardware na prática', 'Investigue monitor, hub, teclado, energia e aceleração gráfica. Siga a cadeia de diagnóstico, camada por camada.', '/docs/diagnostico/metodo/', 'Evidências antes de alterações'],
];
const courses = [
  ['SEM ROOT', 'Seu primeiro programa no telefone', 'Instale o Termux pela fonte oficial, escreva Python, corrija um erro e confira uma cópia fora do aparelho.', '/docs/aulas/primeiro-projeto-termux/', 'Android + Termux'],
  ['ANDROID PERMANECE', 'Seu primeiro desktop Debian', 'Siga uma única rota gráfica. Abra, use, encerre e retome o desktop, sabendo em qual ambiente executar cada etapa.', '/docs/aulas/debian-desktop/', 'Termux + PRoot + X11'],
  ['APÓS A INSTALAÇÃO', 'Seu mini-PC com Linux nativo', 'Parta de um port já instalado. Confira desktop, arquivos, rede, monitor, periféricos, reinício e reconexão.', '/docs/aulas/mini-pc-nativo/', 'Depende do port e da variante'],
];
function DesktopDiagram() {
  return <div className={styles.diagram} role="img" aria-label="Um smartphone reaproveitado fornece processamento para monitor, teclado e mouse por um hub. Energia e suporte de drivers precisam ser verificados.">
    <div className={styles.diagramTop}><span className={styles.statusDot}/> EXEMPLO DE CONEXÃO · SUPORTE A VERIFICAR</div>
    <div className={styles.monitor}><div className={styles.screen}>
      <div className={styles.windowTop}><i/><i/><i/><span>seu novo computador</span></div>
      <div className={styles.terminal}><span>~ $ </span>uname -m<br/><strong>aarch64</strong><br/><br/><span>~ $ </span>python ola.py<br/><strong>Olá, Linux!</strong><span className={styles.cursor}>▍</span></div>
      <div className={styles.desktopIcons}><span>⌘</span><span>▣</span><span>⌁</span><span>▤</span></div>
    </div></div>
    <div className={styles.stand}/>
    <div className={styles.connections}><div className={styles.phone}><div>Linux<br/><span>ARM</span></div><i/></div><div className={styles.cable}/><div className={styles.hub}>HUB<br/><small>USB · VÍDEO · PD*</small></div></div>
    <div className={styles.diagramFoot}>* Cada função depende do aparelho, do hub e dos drivers.</div>
  </div>;
}
export default function Home() {
  return <Layout title="Reaproveite seu smartphone como um computador Linux" description="Guias abertos em português: Linux nativo, Termux, PRoot, hardware, recuperação e projetos para smartphones.">
    <main>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span/> CONHECIMENTO ABERTO · EM PORTUGUÊS</div>
          <h1>Seu celular ainda<br/>tem muito <em>a fazer.</em></h1>
          <p>Transforme um smartphone em um computador Linux. Escolha um caminho compatível com o seu hardware, entenda cada etapa e construa com segurança.</p>
          <div className={styles.heroActions}><Link className="button button--primary button--lg" to="/docs/escolha/">Qual caminho devo seguir? <span aria-hidden="true">↗</span></Link><Link className={styles.textLink} to="/docs/comece-aqui/do-zero/">Nunca fiz isso: começar do zero →</Link></div>
          <div className={styles.heroNote}>Não existe instalação universal. Existe um caminho bem investigado.</div>
        </div>
        <DesktopDiagram/>
      </section>
      <div className={styles.strip}><span>APRENDA</span> Entenda antes de executar.<b aria-hidden="true">/</b><span>VERIFIQUE</span> Compatibilidade tem versão.<b aria-hidden="true">/</b><span>CONTRIBUA</span> Documente o que funcionou.</div>
      <section className={styles.learning} aria-labelledby="learning-title">
        <div className={styles.learningIntro}><span className={styles.eyebrow}>PARA QUEM ESTÁ COMEÇANDO</span><h2 id="learning-title">Um resultado concreto, passo a passo.</h2><p>Monte sua trilha, pratique num terminal simulado e acompanhe as verificações. As aulas mostram onde baixar, onde digitar, o que deve aparecer e como retomar depois.</p><div className={styles.learningActions}><Link className="button button--primary" to="/docs/comece-aqui/minha-trilha/">Montar minha trilha →</Link><Link className={styles.textLink} to="/docs/comece-aqui/laboratorio/">Praticar sem alterar meu aparelho →</Link></div></div>
        <div className={styles.cards}>{courses.map(([tag,title,copy,to,place]) => <Link className={styles.card} to={to} key={to}><span className={styles.courseTag}>{tag}</span><h3>{title}</h3><p>{copy}</p><span className={styles.tag}>{place}</span></Link>)}</div>
        <p className={styles.learningNote}>Concluir uma aula registra aprendizado. Compatibilidade e recuperação precisam de evidências do seu aparelho.</p>
      </section>
      <section className={styles.routes} aria-labelledby="routes-title">
        <div className={styles.sectionHead}><div><span className={styles.eyebrow}>MÉTODOS DIFERENTES, OBJETIVOS REAIS</span><h2 id="routes-title">Encontre sua próxima etapa.</h2></div><p>Da primeira sessão no terminal a um desktop nativo. Cada caminho traz seus requisitos e limites.</p></div>
        <div className={styles.cards}>{routes.map(([n,title,copy,to,tag]) => <Link className={styles.card} to={to} key={n}><span className={styles.cardNumber}>{n}<span aria-hidden="true">↗</span></span><h3>{title}</h3><p>{copy}</p><span className={styles.tag}>{tag}</span></Link>)}</div>
      </section>
      <section className={styles.case}>
        <div><span className={styles.eyebrow}>DE ONDE PARTIMOS</span><h2>Um OnePlus 9 Pro.<br/>Muitas lições para compartilhar.</h2><p>O projeto que inspirou esta base passou por Android, ambientes Linux e postmarketOS. Monitor, periféricos e drivers revelaram o que um tutorial de instalação sozinho não resolve.</p><Link className={styles.textLink} to="/docs/dispositivos/oneplus-9-pro/">Conheça o estudo de caso e suas limitações →</Link></div>
        <div className={styles.caseDetails}><span>SNAPDRAGON 888</span><strong>12 GB</strong><p>de RAM no aparelho do projeto</p><hr/><p><b>Um experimento documentado.</b><br/>As adaptações desse aparelho não são uma imagem pronta para qualquer smartphone.</p></div>
      </section>
      <section className={styles.bottom}><h2>Seu próximo projeto pode caber no bolso.</h2><p>Programação, servidores, automação e mais — com exemplos, verificações e alternativas.</p><Link className="button button--primary" to="/docs/projetos/desenvolvimento/">Explorar projetos</Link> <Link className="button button--secondary" to="/docs/comunidade/contribuir/">Contribuir com um aparelho</Link></section>
    </main>
  </Layout>;
}
