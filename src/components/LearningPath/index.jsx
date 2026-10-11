import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import {tracks, getTrack, readProgress, exportProgress, PROGRESS_KEY, PROGRESS_VERSION} from '../../lib/learning.mjs';
import styles from './styles.module.css';

const initialProgress = {version: PROGRESS_VERSION, track: 'termux', completed: []};

export default function LearningPath() {
  const [progress, setProgress] = useState(initialProgress);
  const [remember, setRemember] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      const saved = readProgress(raw);
      if (saved) {setProgress(saved); setRemember(true);}
      else if (raw) setStorageMessage('O registro antigo não foi reconhecido. Você pode continuar sem ele; somente a chave de progresso deste projeto será substituída se optar por salvar.');
    } catch {setStorageMessage('Seu navegador não permite acessar o armazenamento local. As marcações funcionam nesta página, mas podem ser perdidas ao sair.');}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      if (remember) window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {setStorageMessage('Não foi possível gravar ou remover o registro local. Exporte o roteiro para conservar suas marcações; configurações de privacidade do navegador podem impedir a gravação.');}
  }, [ready, remember, progress]);

  const track = getTrack(progress.track);
  const count = track.lessons.filter(item => progress.completed.includes(item.id)).length;
  const next = track.lessons.find(item => !progress.completed.includes(item.id));
  function toggle(id) {
    setProgress(current => ({...current, completed: current.completed.includes(id) ? current.completed.filter(value => value !== id) : [...current.completed, id]}));
    setNotice('Marcação atualizada. Ela registra estudo e verificações relatadas por você, sem certificar o aparelho.');
  }
  function changeRemember(event) {
    const enabled = event.target.checked;
    setRemember(enabled);
    if (!enabled) {
      try {window.localStorage.removeItem(PROGRESS_KEY); setStorageMessage('');}
      catch {setStorageMessage('Não foi possível remover o registro local. Suas configurações de privacidade podem bloquear o armazenamento; as marcações continuam nesta página.');}
    }
  }

  return <section className={styles.path} aria-label="Meu roteiro de aprendizado">
    <fieldset className={styles.choices}>
      <legend>1. Escolha o que você quer aprender</legend>
      <div className={styles.trackGrid}>{tracks.map(item => <label key={item.id} className={styles.trackCard}>
        <input type="radio" name="learning-track" value={item.id} checked={progress.track === item.id} onChange={() => {setProgress(current => ({...current, track: item.id})); setNotice('Trilha alterada. As marcações das aulas compartilhadas foram preservadas.');}}/>
        <span><strong>{item.title}</strong><small>{item.level}</small><span>{item.description}</span></span>
      </label>)}</div>
    </fieldset>
    <div className={styles.context}>
      <p><strong>Antes de começar:</strong> {track.prerequisite}</p>
      <p><strong>O que pode mudar:</strong> {track.change}.</p>
      {track.id === 'native' && <p className={styles.warning}><strong>Trilha de investigação.</strong> Concluir aulas não demonstra suporte e não libera comandos de gravação. Use a receita e as condições da variante; uma dúvida de recuperação mantém a instalação bloqueada.</p>}
    </div>
    <div className={styles.progressHeader}>
      <h3>2. Estude, pratique e registre as verificações</h3>
      <span>{count} de {track.lessons.length} aulas marcadas</span>
    </div>
    <progress value={count} max={track.lessons.length} aria-label="Progresso de estudo desta trilha"/>
    <ol className={styles.lessons}>{track.lessons.map((item, index) => <li key={item.id}>
      <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div className={styles.lessonBody}>
        <Link to={item.href}>{item.title}</Link>
        <p>{item.result}</p>
        <small><strong>Onde:</strong> {item.place}</small>
        <label className={styles.check}><input type="checkbox" checked={progress.completed.includes(item.id)} onChange={() => toggle(item.id)}/> Estudei e conferi esta aula: {item.title}</label>
      </div>
    </li>)}</ol>
    <div className={styles.next}>
      {next ? <><strong>Próxima aula ainda sem marcação</strong><Link to={next.href}>{next.title} →</Link></> : <><strong>Você marcou todas as aulas desta trilha.</strong><p>Revise o resultado real, as limitações e o plano de retorno. Essa lista não é uma certificação de hardware.</p></>}
    </div>
    <div className={styles.actions}>
      <label className={styles.check}><input type="checkbox" checked={remember} disabled={!ready} onChange={changeRemember}/> Salvar progresso neste navegador</label>
      <p className={styles.privacy}>Opcional. Salva somente a trilha e os identificadores das aulas marcadas nesta origem do site. Não salva modelo, senhas ou serial; não sincroniza com outro navegador ou computador.</p>
      <div className={styles.buttons}>
        <a className="button button--primary" download="meu-roteiro-celular-linux.md" href={'data:text/markdown;charset=utf-8,' + encodeURIComponent(exportProgress(progress.track, progress.completed))}>Baixar meu roteiro</a>
        <button className="button button--secondary" type="button" onClick={() => {setProgress(current => ({...current, completed: []})); setNotice('Marcações de todas as trilhas apagadas. Nenhum arquivo ou configuração do telefone foi alterado.');}}>Apagar minhas marcações</button>
      </div>
      <p role="status" className={styles.status}>{storageMessage || notice}</p>
    </div>
  </section>;
}
