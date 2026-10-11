---
title: 'Arquivos e permissões: aprenda sem mexer no sistema'
description: Encontre seus arquivos, copie dados fictícios e compreenda leitura, escrita, execução, dono e grupo com exercícios reversíveis.
sidebar_position: 50
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Ao terminar, você terá uma pasta de laboratório, um documento original, cópias separadas e um pequeno programa. Você saberá explicar por que um arquivo pode existir e, ainda assim, não abrir. Esse conhecimento ajuda a configurar projetos, SSH e periféricos sem transformar toda mensagem de erro numa tentativa com privilégios administrativos.

**Dificuldade:** iniciante. **Tempo sugerido:** duas sessões curtas, uma até as cópias e outra para permissões. **Materiais:** terminal Linux ou Termux já acessível, Bash, utilitários básicos e uma pasta nova na área pessoal. **Conhecimento anterior:** [digitar comandos e reconhecer o prompt](../comece-aqui/terminal-primeiros-passos.md). Não é necessário desbloquear bootloader, obter root, instalar desktop ou conectar um monitor externo.

:::warning Limite deste laboratório
Todos os arquivos contêm dados fictícios e são criados numa pasta nova. Execute como usuário comum. Não aplique as mudanças em `/etc`, `/dev`, arquivos de outras pessoas, configurações SSH existentes ou toda a pasta pessoal. Se não consegue entrar como usuário comum, faça a parte de leitura/cópia e registre a limitação dos testes de negação de acesso.
:::

## 1. Escolha onde a aula acontece

Um terminal é uma janela para um ambiente, não prova de que Android foi substituído. No Termux, seus programas continuam sujeitos ao Android. Dentro de Debian PRoot, os caminhos pertencem àquela distribuição convidada. Por SSH, os comandos são executados na máquina remota. Uma janela no notebook pode, portanto, modificar arquivos do telefone; confirme antes.

Abra o terminal onde quer aprender e consulte:

```sh
pwd
whoami
id
command -v bash
command -v cp
command -v chmod
```

`pwd` mostra o diretório atual; `whoami` mostra o nome associado ao usuário; `id` também apresenta identificadores numéricos e grupos. `command -v` procura a ferramenta no contexto daquele shell. Anote ambiente e usuário, sem publicar informações pessoais desnecessárias. No Termux, nomes como `u0_a...` são normais: representam uma identidade de aplicativo Android.

Se `id -u` mostra `0`, você está como root ou numa representação de root do ambiente. A negação de leitura/escrita pode se comportar de forma diferente. Não crie uma conta nem altere permissões do sistema para conseguir seguir a aula: escolha uma sessão de usuário já existente num Linux nativo, ou o Termux fora do PRoot. PRoot também pode apresentar identidades e atributos traduzidos; esta aula não mede isolamento entre Android e Linux convidado.

**Checkpoint 1:** você sabe em qual ambiente está e nenhuma consulta mudou arquivos.

## 2. Prepare ferramentas pela origem correta

`cp`, `ls`, `mkdir`, `cat` e `chmod` costumam existir na instalação básica. Alpine pode fornecer versões BusyBox; Termux normalmente fornece utilitários adaptados ao seu ambiente. Não baixe executáveis de sites que prometem “comandos Linux para qualquer Android”. Esta aula usa operações pequenas disponíveis nas implementações usuais, explicando diferenças quando importam.

Caso Bash realmente esteja ausente, instale **apenas no ambiente identificado**:

```bash
# Termux, fora da distribuição PRoot
pkg update
pkg install bash
```

```bash
# Debian/Ubuntu nativo, com sudo já configurado
sudo apt update
sudo apt install bash
```

```bash
# Alpine/postmarketOS, com sudo já configurado e repositórios do port
sudo apk update
sudo apk add bash
```

Se o port usa `doas`, utilize sua administração documentada; não instale `sudo` para adaptar uma linha. Se Debian PRoot utiliza administração interna como root, os comandos daquela instância dispensam `sudo`, mas os testes de permissões abaixo devem ser entendidos com essa limitação. Consulte [pacotes e repositórios](pacotes-repositorios.md) antes de confirmar qualquer transação.

Para obter o aplicativo Termux, use as [origens indicadas pelo próprio projeto](https://github.com/termux/termux-app#installation), seguindo o [guia de instalação](../android/termux.md). Aplicativo e complementos precisam respeitar a compatibilidade de assinatura entre origens. Para o computador, o [guia Linux no computador](../comece-aqui/linux-no-computador.md) explica como preparar um ambiente; o exercício não requer reinstalar seu notebook.

Abra Bash digitando `bash`. Isso inicia um shell dentro da sessão atual; não troca o sistema operacional. `bash --version` deve mostrar uma versão. Ao terminar a aula, `exit` sai desse Bash. Use uma janela dedicada para não misturar trabalhos anteriores.

## 3. Entenda um endereço de arquivo

Diretório é o nome técnico de uma pasta. Um caminho descreve como chegar a um arquivo. Um caminho **absoluto** começa na raiz `/`; um caminho **relativo** começa no diretório atual. `$HOME` é a variável que informa sua área pessoal no ambiente atual. Consulte-a com `printf '%s\n' "$HOME"`; não a altere para copiar exemplos.

`$HOME/projetos/arquivos-aula/original.txt` identifica nosso documento a partir da área pessoal. Dentro de `arquivos-aula`, `original.txt` identifica o mesmo arquivo. `.` significa diretório atual, e `..` significa o diretório acima. `/` é a raiz da árvore; `/root` é uma possível pasta pessoal do usuário root. Esses nomes não significam a mesma coisa.

Aspas duplas em `"$HOME/projetos"` conservam um caminho com espaços como um único argumento. Sem aspas, alguns nomes podem se dividir em vários argumentos. Neste curso escolhemos nomes simples, mas vamos praticar um nome com espaços conscientemente. Maiúsculas e minúsculas geralmente distinguem arquivos no Linux: `original.txt` e `Original.txt` podem ser diferentes.

**Exercício de previsão:** antes de executar, diga para onde `cd ..` levaria você. Depois consulte `pwd` para conferir. Voltar uma pasta não apaga nada. Entretanto, deixar de conferir o diretório antes de criar ou substituir arquivos pode fazer uma instrução correta atingir o lugar errado.

## 4. Crie um laboratório novo e reconhecível

Execute uma linha de cada vez, conferindo a resposta:

```bash
mkdir -p "$HOME/projetos"
mkdir "$HOME/projetos/arquivos-aula"
cd "$HOME/projetos/arquivos-aula"
pwd
ls -la
```

`mkdir -p` permite que a pasta intermediária `projetos` já exista. O segundo `mkdir` exige que `arquivos-aula` seja nova. Se informar **File exists**, não continue criando conteúdo: escolha outro nome em todos os passos, ou retome pela seção 13. Se `cd` falhar, pare; os próximos comandos não devem executar em outro diretório por acidente.

`ls -la` lista também nomes iniciados por ponto. Uma pasta nova apresenta `.` e `..`, mas nenhum documento nosso. Nome iniciado por ponto é uma convenção para ocultar na listagem comum; não é proteção de acesso. Não crie o laboratório em armazenamento compartilhado Android, pendrive FAT ou uma montagem de rede: eles podem não aplicar os mesmos modos Unix.

Prepare conteúdo original:

```bash
printf '%s\n' 'Projeto ficticio: bancada Linux' 'Estado: apenas exercicio de arquivos' > original.txt
mkdir copias
cat original.txt
```

`printf` escreve duas linhas; `>` direciona a saída para o arquivo, **substituindo conteúdo anterior se existir**. Estamos numa pasta nova e o destino ainda não existe. `cat` lê texto para a tela. Não use `cat` para experimentar arquivos binários ou dispositivos do sistema: nosso alvo é somente `original.txt`.

**Checkpoint 4:** `pwd` termina em `arquivos-aula`, `copias` existe e o documento contém duas linhas fictícias. Nenhuma informação de Wi-Fi, conta ou câmera precisa entrar aqui.

## 5. Copie e confirme antes de editar

Faça uma cópia sem mover o original:

```bash
cp -i original.txt copias/original-v1.txt
ls -l original.txt copias/original-v1.txt
cat copias/original-v1.txt
```

O primeiro argumento é a origem; o segundo, o destino. `-i` pede confirmação se o destino já existe. Uma cópia pode conservar o texto e apresentar atributos diferentes; não deduza uma restauração completa de permissões apenas por comparar o conteúdo. As opções estão no [manual de cp publicado pelo Debian](https://manpages.debian.org/trixie/coreutils/cp.1.en.html).

Acrescente uma linha ao original:

```bash
printf '%s\n' 'Observacao: aprendi a conservar uma copia.' >> original.txt
cat original.txt
cat copias/original-v1.txt
```

`>>` acrescenta ao final. A cópia anterior deve continuar com duas linhas; o original passa a ter três. Se ambos mudaram, investigue os caminhos: nesta aula criamos arquivos independentes, sem links. Quando `cp -i` perguntar se pode substituir, responda `n` para conservar a cópia. Não use confirmação automática apenas para eliminar a pergunta.

Crie agora um nome com espaços:

```bash
cp -i original.txt "copias/notas da bancada.txt"
cat "copias/notas da bancada.txt"
```

As aspas pertencem ao comando, não ao nome salvo. Pelo gerenciador de arquivos, abra a pasta e confira as mesmas cópias. Assim você associa o endereço digitado à navegação visual. Cópia no mesmo armazenamento ajuda contra edição acidental, mas não protege de perda do dispositivo: [backup externo](backup-restauracao.md) é outro passo.

## 6. Leia as colunas de `ls -l`

Consulte `ls -l original.txt`. Uma saída **ilustrativa**, com identidade e data fictícias, seria:

```text
-rw-r--r-- 1 aluno grupo 120 out 11 10:00 original.txt
```

O tamanho real dependerá do texto e da codificação. Não tente fazer sua linha inteira coincidir com o exemplo. A parte importante é separar tipo, modos, dono, grupo e nome. Consulte `ls -ld copias` para ver o diretório em si; sem `-d`, a listagem pode mostrar seu conteúdo. [Opções de ls](https://manpages.debian.org/trixie/coreutils/ls.1.en.html).

| Parte | Como ler no exercício |
|---|---|
| Primeiro caractere `-` | Arquivo comum; `d` identifica diretório |
| Próximos três `rw-` | Permissões do dono |
| Próximos três `r--` | Permissões da classe grupo |
| Últimos três `r--` | Permissões da classe outros |
| Dono e grupo | Identidades associadas ao arquivo |
| Nome final | Arquivo que você consultou |

`r` significa leitura, `w` escrita e `x` execução ou travessia, conforme o objeto. Um traço significa que aquele bit está ausente. Não se somam livremente as três classes: o sistema identifica qual classe se aplica à identidade do processo. Ser membro de um grupo não transforma automaticamente você no dono do arquivo.

Para relacionar a sessão à listagem, consulte `id` novamente. Nesta aula você cria e acessa seus próprios arquivos: mede o comportamento de **um usuário**, não comprova isolamento entre duas contas. Não adicionaremos usuários ou grupos para preencher uma demonstração.

## 7. Defina modos explícitos apenas nas fixtures

Uma fixture é um objeto preparado para um teste, aqui nosso documento fictício. Defina que só o dono poderá ler e escrever:

```bash
chmod u=rw,g=,o= original.txt
ls -l original.txt
cat original.txt
```

`u=rw` define leitura e escrita para o dono; `g=` e `o=` retiram os bits dessas classes. O grupo e dono não mudam. Para explicar a notação, consulte o [manual de chmod](https://manpages.debian.org/trixie/coreutils/chmod.1.en.html); modificar modo e modificar proprietário são operações diferentes.

Com usuário comum num sistema de arquivos que aplica esses modos, teste uma negação controlada:

```bash
chmod u-r original.txt
cat original.txt
chmod u+r original.txt
cat original.txt
```

O primeiro `cat` deve informar acesso negado; o segundo volta a mostrar o texto. Execute a restauração `chmod u+r` mesmo após o erro esperado. Se você estiver privilegiado, ou o ambiente traduzir permissões, a leitura pode não ser negada. Registre **teste não conclusivo naquele contexto**, em vez de afirmar que chmod está quebrado.

Faça o mesmo raciocínio para escrita, sem editar segredos: `chmod u-w original.txt` retira escrita do dono; uma tentativa de acrescentar uma linha ao documento deve falhar no contexto comum. `chmod u+w original.txt` restaura. A ausência de escrita no arquivo não significa que ninguém pode remover sua entrada do diretório: permissões do diretório também importam.

**Checkpoint 7:** você descreve qual bit mudou, vê o erro esperado quando aplicável e restaura o acesso apenas ao documento de exercício.

## 8. Descubra por que diretórios também precisam de `x`

Um diretório armazena nomes e permite chegar a objetos. Sua permissão `x` é travessia: chegar ao arquivo pelo caminho. Leitura `r` permite consultar nomes, e escrita `w`, combinada com acesso adequado, permite alterar entradas. Para aprofundar o modelo, consulte a [seção de sistema de arquivos da Referência Debian](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_filesystem_permissions).

Crie uma caixa de exercício:

```bash
mkdir caixa
printf '%s\n' 'Item ficticio dentro da caixa.' > caixa/item.txt
chmod u=rwx,g=,o= caixa
chmod u=rw,g=,o= caixa/item.txt
cat caixa/item.txt
chmod u-x caixa
cat caixa/item.txt
chmod u+x caixa
cat caixa/item.txt
```

O `cat` intermediário deve falhar para usuário comum, embora `item.txt` continue permitindo leitura ao dono. Restaurar `x` na caixa resolve **essa causa preparada**, sem mudar o arquivo interno. A falta de acesso num diretório anterior do caminho também pode impedir chegar ao arquivo; por isso começar com modos do último arquivo não basta.

Agora retire temporariamente a escrita da caixa:

```bash
chmod u-w caixa
printf '%s\n' 'Nova entrada ficticia.' > caixa/novo.txt
printf '%s\n' 'Linha em arquivo existente.' >> caixa/item.txt
chmod u+w caixa
```

No contexto comum, criar `novo.txt` falha, mas acrescentar ao arquivo existente ainda pode funcionar, pois ele continua gravável e o diretório continua atravessável. Se `novo.txt` foi criado num contexto privilegiado, não conclua nada sobre a negação de escrita. Não repita o exercício numa pasta do sistema para “ver se aí falha”.

## 9. Execução não é leitura, nem download

Um arquivo com bit `x` não se torna seguro, nem ganha compatibilidade com ARM64. Executar código é permitir que um programa faça ações com sua identidade. Aqui criaremos apenas uma mensagem fixa, escrita por nós, com Bash como interpretador.

Dentro do Bash, consulte `type -P bash`. Deve aparecer um caminho absoluto. O próximo bloco usa esse caminho na primeira linha do script, evitando presumir que Termux tenha `/bin/bash`:

```bash
printf '#!%s\n' "$(type -P bash)" > saudacao.sh
printf '%s\n' "printf '%s\\n' 'Programa ficticio da aula.'" >> saudacao.sh
chmod u=rw,g=,o= saudacao.sh
cat saudacao.sh
bash saudacao.sh
./saudacao.sh
```

A primeira linha `#!...` identifica o interpretador para execução direta. `bash saudacao.sh` pede que Bash leia o texto; nesse caso o arquivo precisa ser legível, sem exigir seu próprio bit de execução. `./saudacao.sh` tenta executá-lo diretamente e deve falhar sem `x` no contexto usual. `./` aponta explicitamente para o diretório atual.

Agora, somente para nosso script:

```bash
chmod u+x saudacao.sh
./saudacao.sh
```

A mensagem deve aparecer. Se `bash saudacao.sh` funciona e a execução direta continua negada, confira o caminho do interpretador e a montagem. Armazenamento compartilhado Android pode não fornecer execução e atributos Unix como a área privada. Não remonte o sistema nem desative proteções para esta aula; use o diretório pessoal apropriado. [Ambiente de execução Termux](https://github.com/termux/termux-packages/wiki/Termux-execution-environment).

## 10. Reconheça números sem decorar permissões perigosas

Nos modos usuais, leitura vale `4`, escrita `2` e execução `1`. Somam-se os valores desejados para cada classe. `600` representa leitura/escrita para o dono e nenhum desses bits para grupo/outros; `700`, numa pasta particular, inclui travessia para o dono. A explicação é para interpretar receitas, não autorização para aplicá-las em qualquer caminho.

Nesta pasta recém-criada, compare:

```bash
chmod 600 original.txt
chmod 700 caixa
ls -l original.txt
ls -ld caixa
```

Os modos básicos devem coincidir com o que já definimos simbolicamente. Há atributos adicionais, ACLs e políticas que podem afetar o acesso. Não se resolve toda negação de acesso com um número. Não torne todos os usuários capazes de gravar em programas, chaves ou dispositivos; também não execute mudanças recursivas numa árvore desconhecida.

`umask` influencia permissões de novos arquivos. Para observar sem deixar uma configuração persistente, use um subshell, delimitado por parênteses:

```bash
(
  umask 077
  printf '%s\n' 'Dado ficticio criado com mascara restrita.' > mascara.txt
  ls -l mascara.txt
)
umask
```

O subshell acaba e a máscara da sessão externa permanece como estava. A máscara não altera arquivos anteriores e não é criptografia. O exercício deve produzir um arquivo particular no modelo Unix usual; montagens e políticas adicionais podem modificar o resultado.

## 11. Investigue um erro sem ampliar privilégios

Use esta sequência quando um projeto seu não abre: confirme `pwd`, veja se o nome/capitalização está correto, consulte `ls -l` do arquivo e `ls -ld` dos diretórios que controlam o caminho, confira `id` e se o destino é armazenamento privado ou compartilhado. Compare a operação desejada: ler, modificar, criar entrada ou executar.

| Sintoma | Primeiro ponto a conferir |
|---|---|
| `No such file or directory` | Caminho, pasta atual e, em scripts, interpretador da primeira linha |
| `Permission denied` ao ler | Classe aplicável, leitura do arquivo e travessia dos diretórios |
| Texto abre, programa não executa | Bit `x`, interpretador, formato/arquitetura e montagem |
| Arquivo não aceita edição | Escrita no arquivo; para salvar via substituição, diretório também |
| Cópia parece vazia | Origem escolhida, resultado do comando e contexto da máquina |

Editor pode salvar criando um arquivo temporário e substituindo o antigo. Por isso ele pode exigir escrita no diretório, mesmo quando você consegue acrescentar com `>>` ao arquivo existente. Permissões são parte do diagnóstico; espaço cheio e montagem somente leitura são outras causas.

Dispositivos como `/dev/input/event...` e portas de placas possuem políticas próprias. Não transplante o modo desta fixture para eles. Veja [teclados USB](../hardware/teclados-usb.md), [Arduino](arduino-uno-primeiro-projeto.md) e [método de diagnóstico](../diagnostico/metodo.md), que verificam camadas além de acesso ao arquivo.

## 12. Restaure sem sobrescrever o original

Para recuperar o texto de duas linhas, crie outro destino:

```bash
mkdir recuperacao
cp -i copias/original-v1.txt recuperacao/original-recuperado.txt
cat recuperacao/original-recuperado.txt
cat original.txt
```

Se `recuperacao` já existe, consulte antes de continuar. A cópia recuperada deve ter duas linhas e o original permanece com as alterações da aula. Só depois de comparar faz sentido decidir qual usar num projeto real. Aqui não há necessidade de apagar nenhuma versão.

Modos de retomada definidos para **estas fixtures** são `chmod 600 original.txt`, `chmod 700 caixa` e `chmod 600 caixa/item.txt`. Eles não representam o estado anterior de arquivos reais. Se um arquivo importante foi modificado por engano, conserve evidências e a cópia anterior; não tente adivinhar todos os atributos aplicando um modo em massa.

## 13. Fontes, verificação e retomada

Ao voltar outro dia, abra o mesmo ambiente, entre em `"$HOME/projetos/arquivos-aula"` e consulte `pwd`, `ls -la` e os textos. Não repita os blocos com `>` sobre arquivos já existentes sem decidir conservar uma cópia. Variáveis temporárias não são necessárias para retomar esta pasta.

Antes de marcar a aula concluída, explique com suas palavras: qual é o original; onde ficou a versão de duas linhas; por que `x` foi necessário na caixa; por que executar com Bash e diretamente são operações diferentes; e qual usuário realizou os testes. Registre o ambiente e limites na [ficha de evidências](../diagnostico/ficha-evidencias.mdx).

Os exercícios de cópia, modos, negação de leitura/travessia/criação, script e máscara foram executados em diretório temporário do notebook Fedora 44, com usuário comum, Bash 5.3.9 e GNU coreutils 9.10. Isso valida essas operações naquele ambiente; não mede permissões de outro aparelho, compartilhamento Android, ACLs ou isolamento entre contas. Os procedimentos de instalação são condicionais e documentais, sem instalação de pacotes durante essa validação.

Para avançar, use [processos e terminal](processos-terminal.md), [Git](git-primeiro-repositorio.md) ou a [biblioteca de aulas](biblioteca.mdx). Você já pode conservar um projeto e investigar seu acesso sem alterar o sistema inteiro.
