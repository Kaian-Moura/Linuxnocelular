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
  {id: 'development', title: 'Construir projetos de programação', level: 'Após o primeiro terminal', change: 'Ferramentas de desenvolvimento e arquivos próprios', description: 'Aprenda versões, Python, JavaScript e C/C++ no ambiente que você já confirmou. Não exige substituir Android.', prerequisite: 'Terminal utilizável, editor, espaço e pacotes disponíveis para o ambiente escolhido; confira onde cada comando executa.', lessons: [
    ...basics,
    lesson('development', 'Escolher e conferir meu ambiente', '/docs/projetos/desenvolvimento/', 'Identificar host, arquitetura e gerenciador antes de instalar ferramentas.', 'Termux, distribuição PRoot ou Linux nativo'),
    lesson('git-workshop', 'Guardar versões do meu trabalho', '/docs/aulas/git-primeiro-repositorio/', 'Criar um histórico local, comparar mudanças e recuperar uma cópia separada.', 'Terminal e pasta nova de exercício'),
    lesson('python-workshop', 'Construir uma aplicação Python', '/docs/aulas/python-projeto-completo/', 'Criar inventário manual em JSON, tratar erros e executar testes.', 'Ambiente Python identificado na aula'),
    lesson('javascript-workshop', 'Construir uma aplicação JavaScript', '/docs/aulas/javascript-servidor-local/', 'Servir uma interface local, conferir rotas e encerrar o processo.', 'Ambiente Node.js identificado na aula'),
    lesson('cpp-workshop', 'Compilar e testar C e C++', '/docs/aulas/c-cpp-compilacao/', 'Distinguir fonte e binário e reconstruir com Make e CMake.', 'Ambiente com compiladores compatíveis'),
    lesson('backup-workshop', 'Restaurar uma cópia de exercício', '/docs/aulas/backup-restauracao/', 'Comparar arquivos e recuperar em outro diretório sem apagar o original.', 'Projeto de aula e destino externo'),
  ]},
  {id: 'server', title: 'Servir e administrar na rede local', level: 'Primeiros serviços', change: 'Um processo local e, se escolhido, acesso restrito pela LAN', description: 'Construa uma página, diferencie cliente e servidor e transfira arquivos. Abrir um serviço na internet exige outro projeto.', prerequisite: 'Python disponível, meio de controle do telefone, rede autorizada para os testes e uma pasta sem dados pessoais.', lessons: [
    ...basics,
    lesson('web-workshop', 'Servir minha primeira página', '/docs/aulas/servidor-python/', 'Testar loopback antes de decidir expor a pasta dedicada na rede local.', 'Telefone ou computador com Python'),
    lesson('ssh-workshop', 'Entrar por SSH e copiar um arquivo', '/docs/aulas/ssh-arquivos/', 'Conferir a chave do servidor e validar um documento transferido.', 'Servidor no telefone e cliente no computador'),
    lesson('backup-workshop', 'Verificar uma restauração de arquivos', '/docs/aulas/backup-restauracao/', 'Separar cópia, verificação e restauração em pasta nova.', 'Projeto de aula e destino externo'),
    lesson('maintenance-workshop', 'Manter um registro de mudanças', '/docs/aulas/rotina-manutencao/', 'Anotar versões, consumo, atualizações e testes de retomada.', 'Sistema utilizável e ficha de bancada'),
  ]},
  {id: 'electronics', title: 'Começar com Arduino Uno e ESP32', level: 'Requer placa e host compatíveis', change: 'Ferramentas no host e gravação na placa externa identificada', description: 'Separe código, compilação, upload e observação física. Arquitetura ARM64 não comprova que todas as ferramentas executam.', prerequisite: 'Placa exata identificada, cabo de dados, USB/serial suportados, ferramentas disponíveis para a ABI do host e circuito correto.', lessons: [
    ...basics,
    lesson('electronics-host', 'Conferir o host de programação', '/docs/projetos/arduino-esp32/', 'Comparar arquitetura, ABI, toolchain e caminho USB antes de escolher telefone ou computador.', 'Computador de apoio ou Linux nativo compatível'),
    lesson('uno-workshop', 'Fazer o primeiro projeto no Uno', '/docs/aulas/arduino-uno-primeiro-projeto/', 'Identificar Uno R3, compilar e conferir upload e LED da placa.', 'Host compatível e placa da aula'),
    lesson('esp32-workshop', 'Fazer o primeiro projeto no ESP32', '/docs/aulas/esp32-primeiro-projeto/', 'Conferir modelo e pino do circuito antes de compilar e gravar.', 'Host compatível e placa/circuito da aula'),
    lesson('backup-workshop', 'Conservar fontes e configurações', '/docs/aulas/backup-restauracao/', 'Guardar sketch, identificação de ferramentas e cópia verificável.', 'Pasta de projeto e destino externo'),
  ]},
  {id: 'administration', title: 'Cuidar e investigar meu sistema', level: 'Após o primeiro terminal', change: 'Exercícios locais e instalações condicionais; hardware só com evidências', description: 'Aprenda arquivos, processos, repositórios, logs e rede com programas próprios. Separe o que é consulta, instalação e integração de boot.', prerequisite: 'Um ambiente utilizável e identificado, editor, pasta de exercícios e meio de recuperação; os guias não substituem uma receita de instalação nativa.', lessons: [
    ...basics,
    lesson('permissions', 'Entender permissões com meus próprios arquivos', '/docs/aulas/arquivos-permissoes/', 'Comparar leitura, escrita e execução numa pasta de exercício e restaurar a referência.', 'Terminal do ambiente identificado'),
    lesson('processes', 'Suspender e retomar meu próprio programa', '/docs/aulas/processos-terminal/', 'Distinguir shell, tarefa e processo; encerrar somente o exercício.', 'Terminal interativo com Bash'),
    lesson('packages', 'Escolher o repositório e revisar a instalação', '/docs/aulas/pacotes-repositorios/', 'Identificar gerenciador, release e origem antes de instalar um editor.', 'Termux, APT ou APK, em rotas separadas'),
    lesson('bash', 'Automatizar uma leitura de texto', '/docs/aulas/bash-primeiro-script/', 'Testar argumentos, aspas e falhas sem modificar a entrada.', 'Bash na sua pasta de projeto'),
    lesson('logs', 'Investigar uma falha com logs pequenos', '/docs/aulas/logs-primeira-investigacao/', 'Relacionar mensagem, saída e estado e preparar um registro sanitizado.', 'Programa fictício na pasta do exercício'),
    lesson('network', 'Separar as camadas da rede', '/docs/aulas/rede-local-diagnostico/', 'Distinguir interface, endereço, rota, nome e serviço com testes locais.', 'Aparelhos e rede sob seu controle'),
    lesson('background', 'Retomar uma tarefa em segundo plano', '/docs/aulas/servico-em-background/', 'Usar tmux e encerrar a instância própria, reconhecendo limites de boot/Android.', 'Ambiente identificado; integração de boot é condicional'),
    lesson('performance', 'Criar uma linha de base do desempenho', '/docs/aulas/diagnostico-desempenho/', 'Repetir amostras e separar gargalos, sem forçar clocks ou desativar proteções.', 'Notebook ou ambiente Linux do telefone'),
    lesson('backup-workshop', 'Restaurar uma cópia de exercício', '/docs/aulas/backup-restauracao/', 'Preservar a referência e testar retorno numa pasta separada.', 'Ambiente e destino de backup'),
    lesson('layers', 'Organizar uma falha por camadas', '/docs/diagnostico/assistente-camadas/', 'Encontrar a primeira lacuna manual e abrir a próxima verificação.', 'Somente no navegador para organizar'),
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
