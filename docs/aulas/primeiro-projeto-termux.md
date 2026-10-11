---
title: "Aula prática: seu primeiro projeto no Termux"
description: Do Android sem preparação a um programa Python próprio, com edição, arquivos, exportação, backup e retomada no dia seguinte.
sidebar_position: 1
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Ao terminar, você terá um pequeno **diário de estudos**: o telefone perguntará seu nome e quantos minutos você estudou, converterá o tempo em horas e guardará um registro em arquivo. Você vai escrever o programa, modificar uma mensagem, copiar os arquivos para Downloads e testar uma restauração.

Esta aula mantém o Android. Não exige root, computador, desbloqueio de bootloader nem instalação de outro sistema. Dificuldade: iniciante. Reserve, como orientação, **45–90 minutos**; downloads, leitura e digitação podem aumentar esse tempo. Os exemplos de saída são fictícios e estão identificados; não representam testes realizados no seu aparelho.

## Antes de começar: o que você precisa

Use um Android com tela/entrada utilizável, acesso à internet e espaço livre para o aplicativo, Python e seus arquivos. O conjunto atual de pacotes Termux tem suporte completo a partir de **Android 7**, segundo a [instalação oficial](https://github.com/termux/termux-app#installation). Confira a versão em **Configurações → Sobre o telefone → Versão do Android**, com nomes que variam por marca.

Um teclado físico é opcional. Para uma tela inutilizável, resolva primeiro o [acesso ao aparelho](../preparacao/tela-quebrada.md); esta aula precisa que você consiga instalar e abrir aplicativos. Tenha também um lugar **fora do telefone** para guardar o backup ao final, como seu computador ou uma unidade de armazenamento acessível.

Se Termux já está instalado e tem seus arquivos, não desinstale nem limpe dados. Veja [origens e preservação do ambiente](../android/termux.md) e comece na etapa 2 após confirmar que sua instalação é apropriada.

### Combinados da aula

- Todos os comandos desta página são executados **no aplicativo Termux do telefone**. Nenhum vai no terminal do notebook, em ADB ou dentro de Debian.
- Digite ou cole **uma linha de comando por vez**, pressione Enter e aguarde a próxima linha de entrada. Os blocos Python serão colados **dentro do editor**, conforme indicado.
- Os nomes `diario-estudo`, `estudo.py` e `registro.txt` são concretos: use-os como aparecem para acompanhar a aula. `$HOME` é uma variável do shell, que representa sua pasta pessoal; não a substitua pelo seu nome.
- Não copie as caixas de “saída fictícia”. Elas servem apenas para comparação.

Se esses termos ainda parecem confusos, a [primeira aula de terminal](../comece-aqui/terminal-primeiros-passos.md) explica prompt, pastas e copiar/colar.

## 1. Instale Termux pelo F-Droid

Escolhemos **uma origem** para esta aula: F-Droid, catálogo de aplicativos livres. Os responsáveis pelo Termux também publicam outras opções; trocar de origem exige cuidado com assinaturas e dados.

1. **No navegador do telefone**, abra [f-droid.org](https://f-droid.org/). Confira o endereço e toque em **Download F-Droid/Baixar F-Droid**. Isso baixa o cliente F-Droid, não o Termux.
2. Aguarde o download terminar. Abra a notificação ou o aplicativo **Arquivos → Downloads** e toque no APK do F-Droid.
3. Se Android bloquear a instalação, use **Configurações** no aviso para permitir **Instalar apps desconhecidos** somente para o navegador/Arquivos que abriu esse APK. Volte, toque em **Instalar** e depois **Abrir**. Os nomes e o caminho dessa permissão variam entre fabricantes.
4. Dentro do F-Droid, aguarde a atualização inicial do catálogo. Se a lista está vazia, use a ação de atualizar e espere concluir com internet disponível.
5. Toque na busca, digite **Termux** e abra o resultado. Compare com a [página do pacote `com.termux`](https://f-droid.org/packages/com.termux/). Escolha a versão **sugerida pelo catálogo**, compatível com o aparelho, sem ativar versões de teste apenas para esta aula.
6. Toque em **Instalar**. Se solicitado, autorize o **F-Droid** a instalar aplicativos e retorne à instalação. Confirme o instalador Android e toque em **Abrir**.

Depois da instalação, você pode revogar a autorização temporária do navegador/Arquivos em **Configurações → Aplicativos → Acesso especial → Instalar apps desconhecidos**, ou procurando esse nome nas configurações. Se também a revogar do F-Droid, uma atualização futura poderá pedir a autorização novamente. Não é necessário desligar todas as proteções do Android.

**Checkpoint 1:** há um ícone **Termux** entre seus aplicativos. Abra-o e espere a preparação inicial. Você deve ver texto e um cursor numa tela de terminal. Não deve surgir um desktop Debian: ainda estamos dentro de um aplicativo Android.

Se aparecer “aplicativo não instalado” e você já tinha Termux de outra origem, pare aqui: não apague os dados para tentar novamente. O [guia Termux](../android/termux.md) explica o conflito de assinatura.

## 2. Prepare o terminal e duas ferramentas

Toque na área do terminal para abrir o teclado Android. A faixa adicional do Termux normalmente contém **CTRL**: tocar nela e depois em uma letra envia uma combinação como Ctrl+C. Com teclado físico, mantenha Ctrl pressionado e pressione a letra.

**No Termux, no prompt:**

```bash
termux-info
pwd
df -h "$HOME"
```

`termux-info` mostra informações da instalação; `pwd` mostra a pasta atual; `df` mostra o espaço do filesystem usado pela sua pasta. A capacidade total anunciada do telefone não é igual ao espaço livre. Não publique uma saída de diagnóstico sem revisar dados pessoais.

Se você já usava este Termux, preserve seus projetos e configurações antes de atualizar. **Se há distribuições PRoot existentes, inventarie nomes/versão e faça seus backups na implementação atual antes de `pkg upgrade`**, conforme [PRoot e atualização](../android/proot-distro.md). Esta aula não pede reinstalar aplicativos nem remover ambientes anteriores.

Agora prepare os pacotes:

```bash
pkg update
pkg upgrade
pkg install python nano
```

O primeiro comando atualiza a lista de pacotes, o segundo oferece atualizações do ambiente, e o terceiro instala **Python**, que executará seu programa, e **nano**, que editará o arquivo. Não use `sudo`: ele não faz parte deste procedimento.

Se aparecer uma confirmação como `Do you want to continue? [Y/n]`, leia a transação, digite `y` e pressione Enter somente para a operação solicitada. Uma pergunta sobre substituir um arquivo de configuração é diferente; se a instalação não é nova e você não conhece a alteração, preserve a configuração existente e registre a pergunta.

Espere o prompt voltar após cada linha. Barras de download e uma tela temporariamente cheia de texto são normais. Erros de rede, assinatura ou falta de espaço precisam ser resolvidos antes da próxima etapa; não desabilite a verificação de pacotes.

```bash
python --version
nano --version
```

**Checkpoint 2:** ambos mostram suas versões e voltam ao prompt. O número exato pode ser diferente do que aparece em vídeos antigos. Se `pkg` não existe e o terminal identifica Debian/Ubuntu, você entrou em outro ambiente: volte ao Termux antes de continuar.

## 3. Crie uma pasta só para a aula

**No Termux:**

```bash
mkdir -p "$HOME/projetos"
mkdir "$HOME/projetos/diario-estudo"
cd "$HOME/projetos/diario-estudo"
pwd
ls -la
```

`mkdir -p` permite que a pasta geral `projetos` já exista. O segundo `mkdir` não usa essa opção de propósito: se `diario-estudo` já existe, ele informa isso. Nesse caso, confira seu conteúdo antes de escrever; para **retomar uma aula anterior**, pule a criação e vá à etapa 10, em vez de substituir o programa.

Uma pasta nova deve conter somente as entradas `.` e `..` na listagem detalhada. O caminho apresentado por `pwd` deve terminar em `/projetos/diario-estudo`; o início depende da instalação Android.

**Checkpoint 3:** você sabe onde seu arquivo será guardado. Não estamos escrevendo em Downloads nem em uma pasta de sistema.

## 4. Escreva e execute uma primeira versão

**No Termux, no prompt:**

```bash
nano estudo.py
```

Agora o editor ocupa o terminal. Cole **somente este código Python dentro do nano**, não no prompt do shell:

```python
nome = input("Como posso chamar você? ").strip() or "Estudante"
print(f"Olá, {nome}! Meu diário de estudos começou.")
```

`input` faz uma pergunta e aguarda Enter; `nome` guarda sua resposta; `print` exibe texto. As aspas delimitam as frases, e as chaves de `{nome}` permitem inserir o valor guardado. Estas são duas linhas de um programa, não comandos de instalação.

Para salvar:

1. Pressione **Ctrl+O**. No teclado de tela, toque **CTRL** e depois `o`.
2. Confira que o nome apresentado é `estudo.py` e pressione **Enter**.
3. Pressione **Ctrl+X** para sair do nano.

No rodapé do nano, `^O` quer dizer Ctrl+O. Não digite o caractere `^` no texto. Ao voltar ao prompt:

```bash
cat estudo.py
python estudo.py
```

`cat` deve mostrar as duas linhas salvas. O segundo comando chama Python para executar o arquivo. **Quando a pergunta aparecer, digite seu nome e Enter**, em vez de um novo comando.

**Exemplo fictício de interação, não copie como comando:**

```text
Como posso chamar você? Ana
Olá, Ana! Meu diário de estudos começou.
```

**Checkpoint 4:** o programa perguntou, usou sua resposta e devolveu o prompt. Se você vê `>>>`, abriu o Python interativo digitando apenas `python`; digite `exit()` ali para voltar ao shell e então use `python estudo.py`.

## 5. Transforme a primeira versão em um diário

Preserve a versão pequena antes de editar:

```bash
cp -i estudo.py estudo-primeira-versao.py
ls -l
nano estudo.py
```

`cp -i` copia e pergunta antes de substituir um destino existente. Se `estudo-primeira-versao.py` já guarda uma versão que você precisa preservar, responda `n` e escolha outro nome para essa cópia.

**Dentro do nano**, substitua as duas linhas pelo programa abaixo. Use as setas para colocar o cursor no início da primeira linha antiga. Pressione **Ctrl+K** duas vezes para remover as duas linhas; esse atalho recorta a linha atual. Confira que não sobrou código antigo e então cole o bloco inteiro:

```python
from datetime import datetime
from pathlib import Path

nome = input("Como posso chamar você? ").strip() or "Estudante"

try:
    minutos = int(input("Quantos minutos você estudou hoje? "))
except ValueError:
    raise SystemExit("Digite um número inteiro, como 75. Nada foi salvo.")

if not 1 <= minutos <= 1440:
    raise SystemExit("Use um valor entre 1 e 1440 minutos. Nada foi salvo.")

horas, restantes = divmod(minutos, 60)
registro = Path(__file__).with_name("registro.txt")
data = datetime.now().strftime("%Y-%m-%d %H:%M")

with registro.open("a", encoding="utf-8") as arquivo:
    arquivo.write(f"{data} | {nome} | {minutos} minutos\n")

print(f"{nome}, você estudou {horas} h e {restantes} min.")
print(f"Resumo salvo em: {registro}")
```

Mantenha os **quatro espaços no início** das linhas dentro de `try`, `except`, `if` e `with`. Python usa essa indentação para organizar blocos. Aspas retas e dois-pontos também importam.

Salve com **Ctrl+O → Enter → Ctrl+X**. Este programa usa apenas a biblioteca padrão instalada com Python; não é preciso `pip`, conta em serviço nem chave de API.

### O que mudou e por quê

| Trecho | Função na prática |
| --- | --- |
| `int(input(...))` | Converte os minutos digitados em um número inteiro |
| `try/except` | Mostra uma orientação se alguém escrever letras no lugar de um número |
| `if` | Rejeita zero, negativos e mais de um dia de minutos |
| `divmod(minutos, 60)` | Calcula horas completas e minutos restantes |
| `Path(__file__).with_name(...)` | Coloca o registro junto ao programa, mesmo quando ele for chamado de outra pasta |
| `open("a", encoding="utf-8")` | Acrescenta uma linha ao registro, preservando as anteriores e os acentos |
| `datetime.now()` | Usa a data/hora configurada no telefone; não consulta a internet |

Execute:

```bash
python estudo.py
cat registro.txt
```

Na primeira pergunta, use seu nome. Na segunda, digite `75` e Enter. **Não** inclua a palavra “minutos” na resposta.

**Exemplo fictício; a data, nome e caminho reais serão outros:**

```text
Como posso chamar você? Ana
Quantos minutos você estudou hoje? 75
Ana, você estudou 1 h e 15 min.
Resumo salvo em: /caminho/pessoal/projetos/diario-estudo/registro.txt
```

Faça uma segunda execução com `20`. Ao usar `cat registro.txt`, devem existir duas linhas, porque o programa acrescenta em vez de substituir. Depois execute mais uma vez e responda `abc` na pergunta de minutos. Deve aparecer a mensagem de erro amigável, **sem criar um registro novo**.

**Checkpoint 5:** você consegue explicar quais arquivos são programa e dados, e confirmou que uma entrada inválida não foi registrada. Não use informações pessoais sensíveis nestes testes.

## 6. Personalize sem perder a versão funcional

**No Termux, no prompt:**

```bash
cp -i estudo.py estudo-antes-da-personalizacao.py
nano estudo.py
```

Altere somente a frase `Resumo salvo em:` para `Meu diário está em:`. Preserve `{registro}`, o `f` antes da aspa e os demais caracteres. Salve, saia e execute de novo:

```bash
python estudo.py
```

**Checkpoint 6:** a frase final mudou e o registro continua funcionando. Se aparece erro, confira a linha apontada por Python. Para retornar à cópia funcional, estando nesta pasta:

```bash
cp -i estudo-antes-da-personalizacao.py estudo.py
```

Esse comando pede confirmação para substituir o programa editado. Responda `y` apenas se deseja o retorno. Ele não altera `registro.txt`. Você pode também corrigir no nano sem substituir o arquivo.

## 7. Exporte os arquivos para o Android

Até aqui, seu projeto está na área privada do Termux. Ela não costuma aparecer no aplicativo Arquivos. Para produzir uma cópia acessível:

**No Termux:**

```bash
termux-setup-storage
```

Aceite a permissão Android adequada ao acesso de arquivos, quando solicitada. Nome e alcance variam por versão. Se `$HOME/storage` já existe e o comando pergunta sobre reconstruí-lo, preserve qualquer arquivo próprio guardado **diretamente nessa estrutura** e leia o aviso antes de confirmar; o [código da ferramenta](https://github.com/termux/termux-tools/blob/master/scripts/termux-setup-storage.in) distingue essa estrutura de links do conteúdo real compartilhado. Para esta aula nova, não há motivo para executar repetidamente a preparação.

```bash
ls "$HOME/storage/shared/Download"
mkdir -p "$HOME/storage/shared/Download/aula-termux"
cp -i "$HOME/projetos/diario-estudo/estudo.py" "$HOME/storage/shared/Download/aula-termux/"
cp -i "$HOME/projetos/diario-estudo/registro.txt" "$HOME/storage/shared/Download/aula-termux/"
```

`Download` é o nome do diretório nesse caminho; o gerenciador Android pode exibi-lo como **Downloads**. `cp -i` evita substituição silenciosa. Se a primeira linha falha por permissão, não continue com as cópias: confira **Configurações Android → Aplicativos → Termux → Permissões** e o acesso disponível na sua versão.

Abra **Arquivos → Armazenamento interno → Downloads → aula-termux**. Você deve encontrar `estudo.py` e `registro.txt`. Alguns gerenciadores não abrem código Python; isso não impede verificar nome/tamanho e copiar o arquivo.

**Checkpoint 7:** os dois arquivos estão visíveis fora do Termux. São **cópias**: a próxima execução do programa modifica o registro privado, não atualiza automaticamente o registro exportado. Continue trabalhando no projeto de `$HOME`.

## 8. Faça e teste um backup

Vamos guardar a pasta inteira, incluindo as versões anteriores. **Execute este bloco linha por linha no Termux, na mesma sessão:**

```bash
aula_backup="$HOME/storage/shared/Download/aula-termux/diario-estudo-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$aula_backup" -C "$HOME/projetos" diario-estudo
tar -tzf "$aula_backup"
sha256sum "$aula_backup"
```

A primeira linha cria uma variável com um nome datado, como `diario-estudo-20261011-153012.tar.gz`. O nome inclui segundos: espere um novo segundo se repetir o bloco para conservar outro backup. Essa variável vale nesta sessão; não precisa decorá-la para amanhã.

`tar -czf` reúne e comprime a pasta; `-C` define onde buscar a pasta; `tar -tzf` lista o conteúdo sem extrair. Você deve ver nomes começando por `diario-estudo/`, incluindo `estudo.py` e `registro.txt`, sem erro de arquivo truncado. `sha256sum` calcula um resumo para comparar cópias; sozinho ele não verifica que uma origem desconhecida é confiável.

Agora teste a restauração em **outra pasta**, na mesma sessão:

```bash
mkdir "$HOME/restauracao-aula-termux"
tar -xzf "$aula_backup" -C "$HOME/restauracao-aula-termux"
cat "$HOME/restauracao-aula-termux/diario-estudo/registro.txt"
python "$HOME/restauracao-aula-termux/diario-estudo/estudo.py"
```

Se `mkdir` diz que a pasta já existe, pare e escolha outro nome **em todas as linhas da restauração**, ou confira a restauração anterior. Não extraia sobre seu projeto em uso. O programa recuperado deve fazer as perguntas e aceitar uma resposta válida; esse teste acrescenta uma linha **na cópia restaurada**, sem modificar o registro do projeto original.

**Checkpoint 8:** o backup abre, tem os arquivos esperados e permite executar a cópia recuperada. Este é um backup do seu projeto, não de aplicativos Android, senhas ou de todo o Termux.

### Leve o backup para fora do telefone

Em **Windows, ou Linux desktop com suporte MTP**, conecte um cabo de dados, desbloqueie a tela e abra a notificação USB do Android. Selecione **Transferência de arquivos**, quando oferecida. No gerenciador do computador, abra o telefone, **Armazenamento interno → Download/Downloads → aula-termux** e copie o `.tar.gz` para uma pasta sua. Consulte [preparação do computador](../comece-aqui/computador-downloads.md) para arquivos e checksums e a [transferência documentada pelo Android](https://support.google.com/android/answer/9064445?hl=pt-BR).

**No macOS, não presuma que Finder mostre o telefone por MTP.** Siga a [preparação e cópia pelo ADB](../preparacao/backup.md), que ensina a ferramenta, autorização e cópia de Downloads, ou escolha o [acesso SSH/SFTP](../projetos/ssh-remoto.md) depois de configurar ambos os lados. Esses mecanismos são alternativas; não é necessário fazer root ou desbloquear para copiar o backup que você exportou para armazenamento compartilhado. Confira a existência e o conteúdo da pasta copiada, não apenas que o cabo carrega.

Outra opção é copiar o arquivo por um método de backup que você já controla. Um ZIP/TAR deixado somente no mesmo celular não protege contra perda, dano ou restauração de fábrica. Não publique o arquivo de registro se ele contém dados pessoais.

Compare o SHA256 da cópia com o mostrado no Termux pelo método do sistema do computador. Antes disso, confira **o nome e o arquivo exatos**: comparar dois backups de horários diferentes naturalmente produz valores diferentes.

## 9. Encerre a aula sem apagar nada

Espere todos os comandos terminarem e o prompt reaparecer. Seu programa não fica rodando como serviço: cada execução termina depois de gravar e mostrar o resumo.

No prompt Termux, `exit` encerra a shell atual; se era a última sessão, o aplicativo pode fechar. Você também pode voltar à tela inicial Android depois de confirmar que não há operação em andamento. Fechar a tela não apaga os arquivos. **Limpar armazenamento/dados do aplicativo ou desinstalar Termux apaga a área privada**, por isso não use essas ações para terminar a aula.

## 10. Retome no dia seguinte

Abra o ícone Termux de novo. Você pode estar em outra pasta; isso é normal. **No Termux:**

```bash
cd "$HOME/projetos/diario-estudo"
pwd
ls -l
cat registro.txt
python estudo.py
```

Não repita a criação do arquivo nem cole a primeira versão por cima da versão final. O arquivo existente e as linhas antigas provam a persistência. Registre um tempo novo e confira que o histórico cresceu.

Para editar, use `nano estudo.py`; para atualizar a cópia de Downloads, repita a exportação da etapa 7 conscientemente. Faça um novo backup datado depois de alterações importantes.

Se a pasta desapareceu porque o aplicativo foi desinstalado ou seus dados foram limpos, reinstale o ambiente pela mesma origem, prepare Python/nano e recupere **seu** arquivo de backup numa pasta separada. Identifique o nome real do `.tar.gz` em Downloads, usando `ls`, antes de adaptar a etapa 8; a variável `aula_backup` antiga não reaparece automaticamente em uma sessão nova.

## Se algo não funcionar

| Onde parou | Sintoma | Como voltar ao caminho |
| --- | --- | --- |
| Instalação | APK conflitante | Confira se já existe Termux de outra origem; preserve dados e siga o guia de assinaturas |
| Primeiro início | Preparação não termina | Registre a mensagem, confira internet/espaço e a origem; não limpe dados de uma instalação com arquivos |
| Pacotes | Erro de conexão ou mirror | Confirme rede e data/hora; use os mirrors oficiais por `termux-change-repo`, conforme o guia Termux |
| Execução | `python: command not found` | Confirme que está no Termux e se `pkg install python` terminou |
| Execução | `can't open file` | Use `pwd` e `ls -l`; entre na pasta do projeto e confira `estudo.py`, sem adicionar `.txt` ao nome |
| Execução | `SyntaxError` ou `IndentationError` | Abra o arquivo no nano e compare aspas, dois-pontos e espaços da linha indicada |
| Pergunta de minutos | Rejeita `1,5` ou `75 minutos` | O exercício aceita inteiros; digite `75`, não palavras ou decimais |
| Terminal | Parece “preso” na pergunta | Responda à pergunta e Enter; Ctrl+C cancela essa execução, sem criar uma resposta válida |
| Exportação | `Permission denied` | Confira permissão Android e `storage/shared`; não aplique `chmod 777` no armazenamento |
| Restauração | Diretório já existe | Inspecione a cópia ou escolha outro destino em todas as linhas; preserve o original |
| Amanhã | Programa existe, cópia exportada está antiga | São arquivos distintos; repita a cópia/backup depois da execução |

O [guia profundo Termux](../android/termux.md) trata origens, armazenamento, repositórios e encerramento de processos. [Desenvolvimento](../projetos/desenvolvimento.md) amplia Python, JavaScript e C/C++; a [aula Debian com desktop](debian-desktop.md) é opcional e não é necessária para executar este programa.

## Como reconhecer a conclusão

Você concluiu quando executa o diário sem assistência, localiza programa e registro, modifica uma mensagem, rejeita uma entrada inválida, encontra a exportação no Android e executa uma restauração separada. A última prova é abrir Termux em outro momento e continuar do mesmo arquivo, sem reinstalar.

## Referências e limites da verificação

Revisão **documental em 11/10/2026**; nenhum comando foi executado no telefone durante a redação. O programa e a sequência de exercícios são originais desta aula. A revisão sintática não comprova instalação, desempenho ou permissões de cada fabricante.

- [Termux: instalação, fontes e requisitos Android](https://github.com/termux/termux-app#installation).
- [F-Droid: cliente](https://f-droid.org/) e [Termux no catálogo](https://f-droid.org/packages/com.termux/).
- [Termux packages: ferramentas empacotadas](https://github.com/termux/termux-packages).
- [Termux: implementação de acesso ao armazenamento](https://github.com/termux/termux-tools/blob/master/scripts/termux-setup-storage.in).
- [Python: funções `input`, `int` e `divmod`](https://docs.python.org/3/library/functions.html), [arquivos de texto](https://docs.python.org/3/tutorial/inputoutput.html) e [`pathlib`](https://docs.python.org/3/library/pathlib.html).
- [Manual do nano](https://www.nano-editor.org/dist/latest/nano.html), para edição e atalhos.
