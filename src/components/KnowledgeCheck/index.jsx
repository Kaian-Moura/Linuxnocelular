import React, {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {questions} from '../../lib/learning.mjs';
import styles from './styles.module.css';

export default function KnowledgeCheck() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [firstAnswers, setFirstAnswers] = useState([]);
  const focusTarget = useRef(null);
  const previousIndex = useRef(0);
  useEffect(() => {
    if (previousIndex.current !== index) focusTarget.current?.focus();
    previousIndex.current = index;
  }, [index]);
  const question = questions[index];
  const score = firstAnswers.filter(Boolean).length;
  function reset() {setIndex(0); setSelected(null); setSubmitted(false); setFirstAnswers([]);}
  function submit(event) {
    event.preventDefault();
    if (selected === null) return;
    setSubmitted(true);
    setFirstAnswers(current => current.length === index ? [...current, selected === question.correct] : current);
  }
  return <section className={styles.quiz} aria-label="Exercício de compreensão">
    {question ? <>
      <div className={styles.header}><strong>Entenda antes de avançar</strong><span>Pergunta {index + 1} de {questions.length}</span></div>
      <form onSubmit={submit}>
        <fieldset><legend ref={focusTarget} tabIndex={-1}>{question.question}</legend>
          {question.options.map((option, optionIndex) => <label className={styles.option} key={option}>
            <input type="radio" name={`knowledge-${question.id}`} checked={selected === optionIndex} onChange={() => {setSelected(optionIndex); setSubmitted(false);}}/>{option}
          </label>)}
        </fieldset>
        <button className="button button--primary" type="submit" disabled={selected === null}>Conferir resposta</button>
      </form>
      {submitted && <div className={styles.feedback} role="status">
        <strong>{selected === question.correct ? 'Correto.' : 'Vamos rever este ponto.'}</strong>
        <p>{question.explanation}</p><Link to={question.href}>Entender melhor: {question.guide} →</Link>
        <button className="button button--secondary" type="button" onClick={() => {setIndex(current => current + 1); setSelected(null); setSubmitted(false);}}>{index === questions.length - 1 ? 'Ver meu resultado' : 'Próxima pergunta'}</button>
      </div>}
    </> : <div className={styles.summary} role="status">
      <h3 ref={focusTarget} tabIndex={-1}>Exercício concluído</h3><p>{score} de {questions.length} respostas corretas na primeira tentativa.</p>
      <p>Você pode revisar as aulas e repetir. Este resultado mede respostas a conceitos; não testa drivers, não comprova root e não autoriza gravar firmware.</p>
      <button className="button button--secondary" type="button" onClick={reset}>Repetir as perguntas</button>
    </div>}
  </section>;
}
