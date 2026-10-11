const home = '/home/aluno';
const files = {
  [`${home}/projetos/boas-vindas.txt`]: 'Meu projeto está na pasta projetos.\nEsta saída é simulada; nenhum aparelho foi acessado.',
  [`${home}/nome com espaço.txt`]: 'Aspas mantêm este nome de arquivo como um único argumento.',
};
const directories = new Set([home, `${home}/projetos`, `${home}/Downloads`]);
export const missions = [
  {instruction: 'Descubra em qual pasta você está.', hint: 'pwd', command: 'pwd', cwd: home},
  {instruction: 'Veja os arquivos e pastas disponíveis.', hint: 'ls', command: 'ls', cwd: home},
  {instruction: 'Entre na pasta projetos.', hint: 'cd projetos', command: 'cd', argument: 'projetos', cwd: home},
  {instruction: 'Leia boas-vindas.txt na pasta projetos.', hint: 'cat boas-vindas.txt', command: 'cat', argument: 'boas-vindas.txt', cwd: `${home}/projetos`},
  {instruction: 'Volte para a pasta anterior.', hint: 'cd ..', command: 'cd', argument: '..', cwd: `${home}/projetos`},
  {instruction: 'Leia o arquivo cujo nome contém espaços.', hint: 'cat "nome com espaço.txt"', command: 'cat', argument: 'nome com espaço.txt', cwd: home},
];
export const createLab = () => ({cwd: home, mission: 0, history: [], error: false, sequence: 0});

function tokenize(input) {
  const args = []; let token = '', quote = '', active = false;
  for (const character of input) {
    if (quote) {
      if (character === quote) quote = '';
      else token += character;
      active = true;
    } else if (character === '"' || character === "'") {quote = character; active = true;}
    else if (/\s/.test(character)) {if (active) {args.push(token); token = ''; active = false;}}
    else {token += character; active = true;}
  }
  if (quote) return {error: 'Faltou fechar uma aspa. O simulador não ficou esperando: corrija a linha e tente novamente.'};
  if (active) args.push(token);
  return {args};
}
function resolve(cwd, name) {
  const target = name === '~' ? home : name.startsWith('~/') ? `${home}/${name.slice(2)}` : name.startsWith('/') ? name : `${cwd}/${name}`;
  const parts = [];
  for (const part of target.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop(); else parts.push(part);
  }
  return '/' + parts.join('/');
}

export function runLab(state, input) {
  const commandLine = String(input ?? '').trim();
  if (!commandLine) return state;
  let output = '', cwd = state.cwd, error = false, args = [];
  if (commandLine.length > 160 || /[;&|<>`\n\r\u0000$\\]/.test(commandLine)) {
    error = true; output = 'Esta prática aceita uma linha simples, sem redirecionamento, variáveis, escapes ou operadores. Nada foi executado fora do cenário.';
  } else {
    const parsed = tokenize(commandLine);
    if (parsed.error) {error = true; output = parsed.error;}
    else {
      args = parsed.args;
      const [command, argument] = args;
      if (command === 'clear' && args.length === 1) return {...state, history: [], error: false};
      if (command === 'help' && args.length === 1) output = 'Comandos disponíveis: pwd, ls, cd PASTA, cat ARQUIVO, help e clear. Use aspas em nomes com espaços. O cenário contém somente /home/aluno.';
      else if (command === 'pwd' && args.length === 1) output = cwd;
      else if (command === 'ls' && args.length === 1) {
        output = [...directories, ...Object.keys(files)].filter(path => path !== cwd && path.slice(0, path.lastIndexOf('/')) === cwd).map(path => path.slice(path.lastIndexOf('/') + 1) + (directories.has(path) ? '/' : '')).sort().join('\n');
      } else if (command === 'cd' && args.length === 2) {
        const target = resolve(cwd, argument);
        if (directories.has(target)) {cwd = target; output = 'Pasta alterada. O comando cd normalmente não imprime uma confirmação; aqui mostramos esta explicação para o exercício.';}
        else {error = true; output = `cd: pasta não encontrada neste cenário: ${argument}. Confira ls; Linux distingue maiúsculas de minúsculas.`;}
      } else if (command === 'cat' && args.length === 2) {
        const target = resolve(cwd, argument);
        if (Object.hasOwn(files, target)) output = files[target];
        else {error = true; output = `cat: arquivo não encontrado neste cenário: ${argument}. Confira a pasta atual com pwd e o nome com ls.`;}
      } else {error = true; output = 'Comando ou argumentos não disponíveis nesta prática. Digite help. O simulador não oferece sudo, root, instalação, ADB, SSH ou flash.';}
    }
  }
  const expected = missions[state.mission];
  const completed = expected && !error && expected.cwd === state.cwd && args[0] === expected.command && (expected.argument === undefined || args[1] === expected.argument);
  const sequence = state.sequence + 1;
  return {cwd, mission: state.mission + (completed ? 1 : 0), error, sequence, history: [...state.history, {id: sequence, command: commandLine, output, cwd: state.cwd, error}].slice(-24)};
}
