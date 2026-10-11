export const PROGRESS_KEY = 'celular-linux:learning:v1';
export const PROGRESS_VERSION = 1;

const lesson = (id, title, href, result, place) => ({id, title, href, result, place});
const basics = [
  lesson('identity', 'Conhecer meu aparelho', '/docs/compatibilidade/inventario/', 'Registrar modelo, variante, Android e o que funciona hoje.', 'Telefone e anotações'),
  lesson('concepts', 'Entender as peças do projeto', '/docs/comece-aqui/micro-aulas/', 'Distinguir root, bootloader, kernel e distribuição com exemplos.', 'Nesta documentação'),
  lesson('terminal', 'Praticar antes de usar o terminal real', '/docs/comece-aqui/laboratorio/', 'Localizar pastas, ler arquivos e interpretar erros no simulador.', 'Somente no navegador'),
];
export const tracks = [
  {id: 'termux', title: 'Programar mantendo Android', level: 'Primeira experiência', change: 'Aplicativos e arquivos; sem root ou flash', description: 'Indicado para começar quando é possível instalar aplicativos e confirmar permissões no Android.', prerequisite: 'Android acessível, internet, armazenamento e uma cópia externa dos arquivos importantes.', lessons: [
    ...basics,
    lesson('termux-project', 'Construir meu primeiro projeto', '/docs/aulas/primeiro-projeto-termux/', 'Instalar Termux, criar um programa Python, editar e executar.', 'Termux no telefone'),
    lesson('backup', 'Conferir uma cópia fora do telefone', '/docs/preparacao/backup/', 'Abrir arquivos copiados e reconhecer o que o backup não contém.', 'Telefone e computador/destino externo'),
    lesson('development', 'Continuar com outras linguagens', '/docs/projetos/desenvolvimento/', 'Escolher o ambiente e testar Python, JavaScript ou C/C++.', 'Ambiente identificado no tutorial'),
  ]},
  {id: 'desktop', title: 'Ter um desktop mantendo Android', level: 'Após o primeiro terminal', change: 'Aplicativos, pacotes e uma sessão gráfica', description: 'Debian e desktop executados sobre o kernel Android; não substituem o sistema do telefone.', prerequisite: 'Termux utilizável, Android compatível com a rota gráfica, internet, espaço e aceitação dos limites de PRoot.', lessons: [
    ...basics,
    lesson('termux-project', 'Preparar Termux e um primeiro arquivo', '/docs/aulas/primeiro-projeto-termux/', 'Confirmar instalação, pacotes e capacidade de salvar seu trabalho.', 'Termux no telefone'),
    lesson('debian-desktop', 'Abrir meu primeiro desktop Debian', '/docs/aulas/debian-desktop/', 'Instalar o ambiente compatível, abrir a interface e identificar onde os programas executam.', 'Android, Termux e Debian, em etapas separadas'),
    lesson('proot-backup', 'Guardar e recuperar o ambiente', '/docs/android/proot-distro/', 'Reconhecer a versão da ferramenta e testar o backup numa área separada.', 'Termux e armazenamento de backup'),
    lesson('remote', 'Entender acesso remoto', '/docs/desktop/acesso-remoto/', 'Distinguir cliente, servidor, tela compartilhada e sessão virtual.', 'Telefone e computador cliente'),
  ]},
  {id: 'native', title: 'Investigar Linux no lugar do Android', level: 'Avançado; depende do aparelho', change: 'Pode apagar dados e alterar a inicialização', description: 'Esta trilha prepara uma decisão. Ela não reconhece seu modelo nem fornece autorização automática para gravar imagens.', prerequisite: 'Port documentado para a variante, canal de controle, hardware essencial compatível, backup e recuperação verificável.', lessons: [
    ...basics,
    lesson('support', 'Conferir suporte por função e versão', '/docs/compatibilidade/matriz/', 'Encontrar evidências de kernel, vídeo, input, rede e energia para a variante.', 'Fontes do port e ficha do aparelho'),
    lesson('backup', 'Conferir backup externo', '/docs/preparacao/backup/', 'Testar arquivos e preservar contas/autenticadores antes de qualquer limpeza.', 'Telefone e destino externo'),
    lesson('adb', 'Preparar comunicação de manutenção', '/docs/preparacao/adb-fastboot/', 'Instalar ferramentas oficiais e reconhecer consultas ADB/Fastboot.', 'Computador e telefone, conforme o modo'),
    lesson('recovery-plan', 'Preparar um plano concreto de retorno', '/docs/preparacao/plano-recuperacao/', 'Identificar pacote, modo, ferramenta, condições e lacunas da restauração.', 'Computador e documentação do fabricante'),
    lesson('decision', 'Passar pelos critérios de instalação', '/docs/escolha/', 'Avaliar os requisitos confirmados e resolver os desconhecidos.', 'Assistente e fontes do modelo'),
    lesson('native-method', 'Ler a receita específica do port', '/docs/nativo/visao-geral/', 'Escolher um método documentado; não usar imagem de outro modelo.', 'Computador, com recuperação preparada'),
    lesson('native-desktop', 'Configurar um Linux já instalado', '/docs/aulas/mini-pc-nativo/', 'Validar desktop, monitor, periféricos e reinício depois da instalação confirmada.', 'Linux nativo do telefone'),
  ]},
];

const ids = new Set(tracks.flatMap(track => track.lessons.map(item => item.id)));
export const getTrack = id => tracks.find(track => track.id === id) || tracks[0];

export function readProgress(raw) {
  if (typeof raw !== 'string' || raw.length > 10000) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== PROGRESS_VERSION || !tracks.some(track => track.id === value.track) || !Array.isArray(value.completed)) return null;
    return {version: PROGRESS_VERSION, track: value.track, completed: [...new Set(value.completed.filter(id => typeof id === 'string' && ids.has(id)))]};
  } catch {return null;}
}

export function exportProgress(trackId, completed = []) {
  const track = getTrack(trackId);
  const marked = new Set(completed);
  return [
    '# Meu roteiro de aprendizado — Celular → Linux', '',
    `Trilha: ${track.title}`, '',
    'Marcações feitas pelo leitor. Não comprovam compatibilidade, autorização para flash ou testes em hardware.', '',
    `Requisito: ${track.prerequisite}`, '',
    ...track.lessons.flatMap(item => [`- [${marked.has(item.id) ? 'x' : ' '}] ${item.title}`, `  Local: ${item.place}`, `  Resultado a conferir: ${item.result}`, `  Guia (caminho no site): ${item.href}`, '']),
    'Antes de alterar boot: confira variante, firmware, imagem, alvo, método, backup e recuperação na fonte do modelo.',
  ].join('\n');
}

export const questions = [
  {id: 'root', question: 'O Magisk está instalado como aplicativo. Isso comprova root?', options: ['Sim, basta o ícone aparecer.', 'Não. É preciso concluir o método específico e validar privilégio real.', 'Sim, se o telefone tem ARM64.'], correct: 1, explanation: 'O APK administra a instalação; root exige integração à inicialização. A verificação é feita no Android, fora de PRoot, pelo método do aparelho.', href: '/docs/preparacao/root-magisk/', guide: 'Root com Magisk'},
  {id: 'host', question: 'Entrei no telefone por SSH usando a janela do notebook. Onde um comando digitado agora executa?', options: ['No notebook, porque a janela está nele.', 'Nos dois aparelhos ao mesmo tempo.', 'No telefone, até sair da conexão remota.'], correct: 2, explanation: 'A janela é o cliente. O shell remoto executa no destino autenticado. Use exit para retornar e confira o ambiente novamente.', href: '/docs/projetos/ssh-remoto/', guide: 'SSH desde o primeiro acesso'},
  {id: 'video', question: 'A porta USB-C do hub anuncia dados a 5 Gbit/s e alimenta o monitor. Isso prova saída de vídeo USB-C?', options: ['Não. Alimentação e velocidade de dados não comprovam DisplayPort Alt Mode.', 'Sim, qualquer USB-C carrega vídeo.', 'Sim, desde que o telefone tenha root.'], correct: 0, explanation: 'Conector, dados, alimentação e vídeo são funções distintas. Confirme a porta e a cadeia completa do modelo, hub, cabo e monitor.', href: '/docs/hardware/usb-c-hubs/', guide: 'USB-C, hubs e funções de cada porta'},
  {id: 'proot', question: 'O comando id mostra root dentro de Debian PRoot. O kernel Android foi substituído?', options: ['Sim, agora é o kernel Debian.', 'Não. PRoot adapta a execução e pode simular a identidade; o kernel continua Android.', 'Sim, se o desktop abriu.'], correct: 1, explanation: 'Identidade apresentada dentro do ambiente não equivale a root real no host. Um desktop PRoot também não transforma a instalação em Linux nativo.', href: '/docs/android/proot-distro/', guide: 'PRoot e os limites do ambiente'},
  {id: 'firmware', question: 'Encontrei uma imagem ARM64 de um celular com o mesmo processador. Posso gravá-la no meu?', options: ['Sim, arquitetura e processador são suficientes.', 'Sim, se renomear para boot.img.', 'Não. Preciso de receita e artefatos para a variante e seu estado de firmware.'], correct: 2, explanation: 'Kernel, descrição da placa, firmware, formato de boot, partições e políticas precisam corresponder. Renomear não transforma uma imagem em compatível.', href: '/docs/nativo/visao-geral/', guide: 'Requisitos de uma instalação nativa'},
  {id: 'success', question: 'Um comando terminou com código 0, mas o monitor continua preto. O objetivo foi comprovado?', options: ['Não. Ainda falta verificar o resultado físico e localizar a camada que falhou.', 'Sim, código 0 garante vídeo.', 'Sim; basta marcar a aula como concluída.'], correct: 0, explanation: 'Sucesso segundo o programa é uma evidência parcial. Validação exige o resultado observável e contexto; uma marcação de estudo não testa o hardware.', href: '/docs/diagnostico/metodo/', guide: 'Diagnóstico por evidências'},
];
