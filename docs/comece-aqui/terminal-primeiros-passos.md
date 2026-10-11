---
title: Primeira aula de terminal e arquivos
description: Abra o terminal, copie comandos, reconheça o ambiente, edite um arquivo e instale seu primeiro pacote com verificações.
sidebar_position: 4
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você vai criar uma pasta de exercícios, escrever um arquivo e aprender a reconhecer um comando concluído. Dificuldade: iniciante. Este exercício usa **shell Linux/macOS ou Termux**. Para PowerShell, siga os blocos específicos de [preparação do computador](computador-downloads.md) e [ADB](../preparacao/adb-fastboot.md). A sintaxe não é sempre igual.

Se quiser experimentar primeiro sem abrir um terminal real, faça os [seis exercícios no laboratório simulado](laboratorio.mdx). Ele ensina navegação e leitura em um cenário fictício; depois volte aqui para criar e salvar seus próprios arquivos no ambiente identificado.

## 1. Abra o lugar certo para digitar

No computador, siga [como abrir o terminal](computador-downloads.md). No Android, o terminal desta base é o aplicativo [Termux instalado pelo tutorial](../android/termux.md): abra seu ícone. No Linux nativo do telefone, abra Terminal/Console na interface ou entre por [SSH](../projetos/ssh-remoto.md).

Ao usar SSH, os comandos digitados após a conexão executam **no telefone**, apesar de a janela estar no notebook. Ao usar `adb shell`, você está num shell Android, que não é Debian nem Alpine. Para sair desses shells e voltar ao computador, digite `exit`; cada `exit` encerra apenas o shell atual. Confira o ambiente de novo antes de instalar pacotes.

Digite e aperte Enter, uma linha por vez:

```bash
pwd
id
uname -m
```

`pwd` mostra a pasta atual; `id`, a identidade e grupos; `uname -m`, a arquitetura apresentada pelo kernel. Não alteram configurações. O texto que aparece é a **saída**. A linha que volta a esperar digitação é o **prompt**.

**Verificação:** anote se o comando está sendo executado no notebook, no Termux, no Android via ADB, no Debian PRoot ou no Linux nativo. Caso não saiba, volte ao passo de conexão. Uma arquitetura ARM não comprova por si só qual distribuição está executando.

## 2. Copie somente o comando

Uma documentação pode mostrar `usuario@host:~$ ls`. O trecho antes de `ls` é prompt e não deve ser copiado. Nossos blocos de comando costumam omitir o prompt. Blocos identificados como “saída ilustrativa” são resultado a comparar, não texto a executar.

Copie com o botão do bloco e cole no terminal. No Linux, `Ctrl+Shift+V` ou botão direito → Colar costuma funcionar; `Ctrl+V` pode ter outro significado. No macOS use `Command+V`. Se seu terminal avisa que vai colar várias linhas, confirme apenas depois de entender todas. Comece colando uma linha e esperando a resposta.

Não copie todos os blocos da página: eles podem ser **alternativas** para sistemas diferentes. Leia o rótulo “computador”, “telefone”, “dentro do Debian” e “escolha uma alternativa”. Aspas retas, hífens e maiúsculas fazem parte do comando; não os troque por aspas tipográficas ou traços longos.

## 3. Crie uma pasta e um arquivo seu

**No shell Linux/macOS/Termux, como usuário comum:**

```bash
mkdir -p "$HOME/laboratorio-celular"
cd "$HOME/laboratorio-celular"
pwd
ls -la
```

`mkdir` cria; `-p` permite que a pasta já exista; `cd` muda a pasta da sessão atual. `ls -la` lista detalhes e inclui nomes que começam com ponto. `.` significa pasta atual, `..` significa pasta acima. Se a pasta já tem um `primeiro-exercicio.txt` importante, escolha outro nome antes do próximo bloco.

```bash
printf 'Estou aprendendo a usar o terminal.\n' > primeiro-exercicio.txt
cat primeiro-exercicio.txt
printf 'Este arquivo está na minha pasta de exercícios.\n' >> primeiro-exercicio.txt
cat primeiro-exercicio.txt
```

Na primeira escrita, `>` cria o arquivo ou **substitui todo o conteúdo de um arquivo existente**. Na segunda, `>>` acrescenta. `cat` mostra o conteúdo. O resultado final deve ter duas linhas. Não pratique redirecionamento em `/etc`, `/sys`, `/dev` ou arquivos reais que você precisa preservar.

Para ver a pasta acima sem apagar nada:

```bash
cd ..
pwd
cd "$HOME/laboratorio-celular"
```

Você não perde o arquivo ao sair da pasta. O terminal apenas muda de lugar; o gerenciador de arquivos também pode abrir essa pasta. `~` é abreviação da pasta pessoal; `$HOME` fornece seu caminho no shell e deve permanecer entre aspas quando indicado.

## 4. Leia nomes genéricos antes de substituir

`USUARIO`, `IP_DO_TELEFONE`, `ARQUIVO` e `SERIAL` são nomes que o tutorial pede para substituir. Não são uma senha nem valores secretos universais. Exemplo: se o nome real do arquivo for `foto da mesa.jpg`, o argumento deve continuar entre aspas: `"foto da mesa.jpg"`.

Um IP como `192.0.2.10`, quando explicitamente ilustrativo, não identifica seu telefone. Consulte o endereço no sistema/rede e use aquele resultado. Ao usar SSH, mantenha porta, usuário e host separados. Ao usar flash, **não substitua partição por tentativa**: o destino precisa vir do procedimento específico do modelo.

## 5. Instale um editor, escolhendo seu ambiente

Se quiser editar no terminal, use `nano`. Primeiro descubra se já existe:

```bash
command -v nano
```

Um caminho indica o executável encontrado; resultado vazio indica que não foi encontrado no `PATH`. No Termux use `termux-info`; num Linux convencional, veja `cat /etc/os-release`. Dentro de PRoot, a identificação é da distribuição convidada, não do Android hospedeiro.

**Termux; sem sudo:**

```bash
pkg update
pkg install nano
```

**Alpine/postmarketOS; com doas previamente configurado:**

```bash
doas apk update
doas apk add nano
```

**Debian/Ubuntu convencional; com sudo configurado:**

```bash
sudo apt update
sudo apt install nano
```

**Fedora; com sudo configurado:**

```bash
sudo dnf install nano
```

Não execute os quatro caminhos. No Debian PRoot iniciado como root simulado, os comandos APT não precisam de `sudo` **dentro daquele ambiente**; isso não concede root Android. Se você usa sudo em vez de doas no Alpine, troque apenas o elevador pelo que seu administrador configurou.

Atualizar o índice informa os pacotes disponíveis; instalar baixa o pacote e suas dependências. Um pedido de confirmação mostra o que mudará. Leia tamanho, nomes e remoções antes de responder. Um erro de assinatura, repositório ou rede não deve ser contornado desligando a verificação.

## 6. Escreva, salve e saia do editor

Na sua pasta de exercícios:

```bash
nano segundo-exercicio.txt
```

Digite duas frases. Use `Ctrl+O` para gravar, confira o nome do arquivo e aperte Enter. Depois `Ctrl+X` para sair. A legenda `^O` significa Control+O, não o caractere circunflexo seguido de O. Em Termux, a tecla Ctrl pode estar na faixa de teclas adicionais; um teclado físico também serve. Consulte o [manual do nano](https://www.nano-editor.org/dist/latest/nano.html) para a versão instalada.

```bash
cat segundo-exercicio.txt
```

**Verificação:** as frases devem aparecer. Se o arquivo está vazio, pode ter saído sem salvar ou escolhido outro caminho. Confira `pwd` e `ls -la`. Se `nano` informa “permission denied”, esse diretório pode não pertencer a você; volte à sua pasta pessoal, em vez de abrir o editor como root por hábito.

## 7. Aprenda a reconhecer senha, programa ativo e erro

Quando `sudo` ou `doas` pede senha, é comum **não aparecer nenhum caractere**, nem asteriscos. Digite a senha da sua conta e Enter. Não é a senha da rede Wi-Fi. Não existe senha de administrador válida para todos os telefones; imagens e contas têm procedimentos próprios.

Quando um programa continua executando, o prompt não reaparece. Isso é normal num servidor, capturador ou comando que acompanha logs. Para encerrar um exercício comum, `Ctrl+C` pede interrupção. Não interrompa uma gravação de firmware em andamento para experimentar essa tecla.

Num shell compatível, imediatamente após um comando:

```bash
echo $?
```

`0` geralmente significa sucesso segundo o programa; outro número indica condição de erro específica. Esse valor não prova que todo o objetivo físico funcionou. Um driver pode carregar e o monitor continuar preto. Você ainda precisa do teste observável do tutorial.

| Sintoma | O que fazer primeiro |
| --- | --- |
| `command not found` | Verifique nome, instalação, ambiente e pasta do executável |
| `No such file or directory` | Use `pwd`/`ls` e confira aspas/caminho/nome |
| `Permission denied` | Identifique quem tem acesso; não use `chmod 777` como receita |
| Prompt muda para `>` | Pode faltar fechar aspas; cancele o comando não executado com Ctrl+C e revise |
| Comando “não mostra nada” | Pode ter terminado sem saída; confira prompt e o teste esperado |
| Não encontra `/etc/os-release` em Termux | Termux usa estrutura própria; consulte `termux-info` |

## Recuperação e próximos passos

O exercício criou apenas duas anotações na sua pasta pessoal e, se necessário, instalou um editor. Você pode conservar tudo ou remover os arquivos pelo gerenciador após conferir os nomes. Não precisa remover o editor para continuar.

Você concluiu a aula quando consegue identificar ambiente e pasta, executar uma linha, salvar/ler um arquivo e explicar qual gerenciador de pacotes escolher. Aprofunde [permissões, pacotes e serviços](../fundamentos/terminal-pacotes.md), depois siga [Termux](../android/termux.md) ou [ADB](../preparacao/adb-fastboot.md), conforme seu caminho.

## Fontes e verificação

Revisão documental em **11/10/2026**. Exercícios originais; a validação de sintaxe do site não executa instalações nos aparelhos. Fontes das interfaces: [nano](https://www.nano-editor.org/dist/latest/nano.html), [pacotes Alpine](https://docs.alpinelinux.org/user-handbook/0.1a/Working/apk.html), [referência Debian](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html), [Termux packages](https://github.com/termux/termux-packages) e [DNF](https://dnf.readthedocs.io/en/latest/command_ref.html).
