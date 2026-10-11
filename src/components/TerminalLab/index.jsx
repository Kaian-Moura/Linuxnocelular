import React, {useEffect, useReducer, useRef, useState} from 'react';
import {createLab, runLab, missions} from '../../lib/terminal-lab.mjs';
import styles from './styles.module.css';

export default function TerminalLab() {
  const [state, dispatch] = useReducer((current, action) => action.type === 'reset' ? createLab() : runLab(current, action.input), undefined, createLab);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const consoleRef = useRef(null);
  const followOutput = useRef(true);
  useEffect(() => {
    if (followOutput.current && consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [state.sequence]);
  const mission = missions[state.mission];
  function submit(event) {
    event.preventDefault();
    const output = consoleRef.current;
    followOutput.current = !output || output.scrollHeight - output.scrollTop - output.clientHeight < 24;
    dispatch({input}); setInput(''); setShowHint(false);
  }
  return <section className={styles.lab} aria-label="Laboratório de terminal simulado">
    <div className={styles.title}><span className={styles.dot} aria-hidden="true"/><strong>Simulação local · shell Linux</strong><span>{Math.min(state.mission, missions.length)}/{missions.length} exercícios</span></div>
    <p className={styles.safety}>Você está praticando num cenário fictício. <strong>Nenhum comando é enviado ao computador ou ao telefone.</strong> Isto não é um terminal conectado, uma shell completa ou um teste de hardware.</p>
    <div className={styles.mission} aria-live="polite">
      {mission ? <><strong>Exercício {state.mission + 1}: {mission.instruction}</strong><button type="button" onClick={() => setShowHint(true)}>Mostrar dica</button>{showHint && <code>{mission.hint}</code>}</> : <><strong>Os seis exercícios foram concluídos.</strong><p>Você praticou pasta atual, listagem, navegação, leitura e aspas. Repita no ambiente real somente depois de identificar onde os comandos executam.</p></>}
      {mission && state.cwd !== mission.cwd && <p>Você navegou para outra pasta. Este exercício parte de <code>{mission.cwd}</code>. Para retomar o roteiro, digite <code>cd {mission.cwd}</code> e depois repita a dica. Você também pode recomeçar os exercícios.</p>}
    </div>
    <div ref={consoleRef} className={styles.console} role="log" aria-label="Saída simulada" aria-live="polite" aria-relevant="additions" tabIndex={0}>
      {!state.history.length && <p>Pratique pwd, ls, cd e cat. Digite help para ver os limites do cenário.</p>}
      {state.history.map(item => <div className={styles.entry} key={item.id}>
        <div className={styles.prompt}><span>aluno@simulador:{item.cwd}$</span> {item.command}</div>
        <pre className={item.error ? styles.error : undefined}>{item.output}</pre>
      </div>)}
    </div>
    <form onSubmit={submit} className={styles.form} aria-label="Digitar no terminal simulado">
      <label htmlFor="terminal-lab-command">Comando de prática</label>
      <div><input id="terminal-lab-command" type="text" value={input} onChange={event => setInput(event.target.value)} maxLength={160} spellCheck={false} autoComplete="off" autoCapitalize="none" aria-describedby="terminal-lab-location"/><button className="button button--primary" type="submit">Simular</button></div>
      <small id="terminal-lab-location">Pasta simulada atual: <code>{state.cwd}</code>. O prompt acima não deve ser copiado.</small>
    </form>
    <button type="button" className={styles.reset} onClick={() => {dispatch({type:'reset'}); setInput(''); setShowHint(false);}}>Recomeçar os exercícios</button>
  </section>;
}
