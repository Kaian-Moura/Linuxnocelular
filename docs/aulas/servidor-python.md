---
title: Publique sua primeira página local com Python
description: Crie uma página própria, teste em loopback e só depois permita um acesso deliberado na rede local, com início, parada e recuperação.
sidebar_position: 21
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você vai escrever uma página HTML e servi-la no telefone usando a biblioteca padrão do Python. Primeiro, somente o próprio telefone conseguirá acessá-la. Depois, se quiser e tiver uma rede apropriada, você permitirá acesso ao computador pela LAN. Cada fase termina com um resultado visível e uma forma de parar. **Este é um servidor de demonstração, não uma publicação segura de produção.**

**Dificuldade:** iniciante após [o primeiro terminal](../comece-aqui/terminal-primeiros-passos.md). Reserve tempo para instalar, editar e testar, sem deixar downloads ou o servidor sem acompanhamento. Materiais: telefone com Termux operacional ou Linux nativo já instalado, teclado/entrada, navegador no telefone quando disponível, computador com navegador para a fase LAN e alimentação confiável. Não precisa de root Android, domínio, cartão de crédito nem abertura de portas no roteador.

## Resultado e limites antes de começar

Seu resultado será uma página com o título “Meu primeiro servidor”, texto escolhido por você e um link para um segundo documento público de estudo. Isso ensina arquivo, URL, processo, porta e cliente. HTML descreve o conteúdo que o navegador apresenta; o servidor responde ao pedido pelo arquivo; o navegador continua sendo o cliente. Não há conta, formulário, banco de dados nem backend dinâmico nesta aula.

`http.server` é útil para esse laboratório, mas a própria [documentação Python](https://docs.python.org/3/library/http.server.html) desaconselha seu uso em produção. Na configuração apresentada não há autenticação nem criptografia HTTP. O diretório servido e eventuais links simbólicos importam para a privacidade. Por isso criaremos uma pasta dedicada contendo somente exemplos públicos; não serviremos sua pasta pessoal, Downloads, `.ssh`, backups ou o armazenamento inteiro do telefone.

**Checkpoint inicial:** explique onde estará o processo Python e onde abrirá o navegador. Se o telefone não tem navegador/tela utilizável, você ainda pode conferir loopback por consulta HTTP local; depois use a fase LAN ou um túnel SSH já preparado. Não pule diretamente para escuta em todas as interfaces para compensar a falta de tela.

## 1. Escolha o ambiente certo e instale duas ferramentas

### Termux mantendo Android

Faça a [instalação Termux](../android/termux.md), caso ainda não exista. Abra o aplicativo **fora de Debian PRoot**, confira seu espaço e instale:

```bash
pkg update
pkg install python nano
python3 --version
```

Espere cada linha terminar e leia a confirmação de pacotes. `pkg` administra o ambiente do aplicativo, `python3` executa Python e `nano` edita texto. Não use `sudo` aqui. A primeira [aula Termux/Python](primeiro-projeto-termux.md) ensina teclado, pacote, editor e erros da instalação. Nenhum desses comandos substitui Android.

### Linux nativo do telefone

Abra Terminal/Console local ou uma conexão SSH já conferida e identifique o sistema com `cat /etc/os-release`. Os exemplos de instalação pressupõem `sudo` já configurado para sua conta; se o port usa outro mecanismo administrativo, siga sua documentação sem habilitar root por tentativa. Use **somente** o gerenciador correspondente:

```bash
# Debian/Ubuntu nativo, com administração autorizada
sudo apt update
sudo apt install python3 nano
```

```bash
# Alpine/postmarketOS nativo, com administração autorizada
sudo apk update
sudo apk add python3 nano
```

Outras distribuições podem fornecer Python e editor por outros pacotes; consulte [programação](../projetos/desenvolvimento.md). A parte de criação/servidor será feita **como usuário comum**, sem `sudo`. Verifique `python3 --version`; a CLI com `--directory` requer Python compatível, disponível a partir de 3.7. Não suponha que o Python de um notebook é o Python do telefone.

Em uma shell Debian PRoot, você também pode fazer um laboratório de arquivos, mas o ambiente compartilha o kernel Android e tem restrições próprias. Para este primeiro percurso, use Termux externo ou Linux nativo, reduzindo uma camada. Um servidor web funcionando não comprova GPU, kernel mainline, USB-C ou capacidade de containers.

**Checkpoint 1:** versão Python identificada no telefone e editor disponível. Consulte também `python3 -m http.server --help`: uma lista de opções confirma o módulo. `-m` manda executar um módulo instalado, não baixar código de um site. [Linha de comando Python](https://docs.python.org/3/using/cmdline.html).

## 2. Prepare uma pasta que possa ser publicada inteira

**Local: terminal do telefone escolhido na etapa 1.** Consulte `pwd` e `ls "$HOME"`. Se `aula-servidor` já existe, não copie os passos de criação sobre ele. Inspecione a experiência anterior ou escolha outro nome e ajuste todos os caminhos. Os arquivos do laboratório devem ser novos e conter apenas texto que você aceitaria mostrar aos participantes dessa rede.

```bash
mkdir "$HOME/aula-servidor"
mkdir "$HOME/aula-servidor/publico"
cd "$HOME/aula-servidor/publico"
pwd
```

Pare se algum comando falhar; não continue num diretório diferente por hábito. A saída de `pwd` deve terminar em `/aula-servidor/publico`. No Termux, o prefixo completo da pasta pessoal pode ser longo, sob a área privada do aplicativo; não deve necessariamente começar por `/home`. `$HOME` resolve essa diferença. No Linux nativo, a pasta normalmente pertence à conta local.

`publico` será a raiz HTTP: o arquivo `publico/index.html` aparecerá no endereço `/` do servidor. A URL não precisa conter o caminho completo do disco. Uma pasta de trabalho não fica pública só por existir; é a escuta do servidor, a rede e a raiz escolhida que criam esse acesso.

**Checkpoint 2:** só há a pasta nova, nenhum segredo e nenhum link simbólico para dados externos. Não copie uma coleção inteira de arquivos para tornar o exemplo mais interessante. Comece pequeno e mantenha backups fora da raiz pública.

## 3. Escreva sua página no editor

Execute `nano "$HOME/aula-servidor/publico/index.html"`. **Cole o conteúdo abaixo dentro do editor**, não no prompt do shell:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Meu primeiro servidor</title>
    <style>
      body { max-width: 44rem; margin: 3rem auto; padding: 0 1rem;
             font-family: system-ui, sans-serif; line-height: 1.6; }
      h1 { color: #23634a; }
      .nota { border-left: 4px solid #23634a; padding-left: 1rem; }
    </style>
  </head>
  <body>
    <h1>Meu primeiro servidor</h1>
    <p>Uma página escrita por mim, servida pelo meu ambiente Python.</p>
    <p class="nota">Demonstração local: não envie senhas nem dados pessoais.</p>
    <p><a href="sobre.txt">Leia o segundo arquivo de estudo</a></p>
  </body>
</html>
```

Ctrl+O abre a gravação; confira o nome e pressione Enter; Ctrl+X sai. No Termux, use CTRL da faixa adicional ou seu teclado. Abra `nano "$HOME/aula-servidor/publico/sobre.txt"` e escreva duas linhas, por exemplo “Este arquivo também é público no laboratório.” e “O teste começa pelo próprio telefone.” Grave e saia da mesma maneira.

Consulte `ls -l "$HOME/aula-servidor/publico"`. Devem existir `index.html` e `sobre.txt`, sem extensão `.txt` acrescentada ao HTML. Abra o HTML de novo para conferir a gravação. O bloco é um exemplo original e pode ser personalizado depois do primeiro teste; inicialmente mantenha o título para reconhecer a resposta.

**Checkpoint 3:** os arquivos existem e o texto foi preservado. Se o editor abre vazio na retomada, verifique caminho e usuário. “Gravei no notebook” não significa “gravei no telefone”; uma sessão remota precisa estar identificada antes da edição.

## 4. Inicie primeiro em loopback

**Local: terminal do telefone, como usuário comum.**

```bash
python3 -m http.server 8080 --bind 127.0.0.1 --directory "$HOME/aula-servidor/publico"
```

A porta **8080** é um número escolhido para o laboratório, não uma exigência do telefone. É alta e não demanda privilégio administrativo no cenário comum. `127.0.0.1` é loopback: o próprio sistema é o destino. `--directory` define explicitamente a raiz pública, independentemente da pasta em que abriu o terminal.

Espere uma linha anunciando servidor e porta. O terminal não devolve o prompt porque o processo continua trabalhando. Isso é o resultado esperado, não um travamento. Deixe essa sessão aberta. No Termux, abra outra sessão para consultas; no GNOME, outra janela/aba de terminal. Não acrescente `&`, `nohup` ou um serviço automático agora: primeiro aprenda a enxergar e encerrar o processo.

Se a porta está ocupada, Python informa erro de endereço/porta em uso. Não mate um processo desconhecido. Encerre apenas uma experiência anterior que você reconhece, ou escolha outra porta alta, como 8081, e ajuste **todos os endereços dos testes**. Se o módulo não existe, volte à instalação Python e confirme qual executável está usando.

**Checkpoint 4:** servidor em primeiro plano, raiz certa e bind explicitamente local. Um código de erro seguido de prompt não equivale a servidor funcionando.

## 5. Veja o resultado e faça uma consulta independente

**No navegador do próprio telefone**, digite na barra de endereço:

```text
http://127.0.0.1:8080/
```

Digite o protocolo `http://`, sem transformar a linha numa busca. O título deve aparecer na aba/página; o texto e o link devem estar visíveis. Clique em “Leia o segundo arquivo de estudo”. Deve abrir o texto de `sobre.txt`. Volte para a página inicial.

Ao consultar, o terminal do servidor registra pedidos como `GET /` e `GET /sobre.txt`, com status. Um `200` para seu documento indica resposta bem-sucedida; um pedido automático de ícone `favicon.ico` com `404` não invalida sua página. Não confunda um arquivo de ícone inexistente com falta de servidor.

Se não há navegador local, ou você quer uma segunda evidência, **na outra sessão do telefone** execute este bloco Python pelo shell:

```bash
python3 - <<'PY'
from urllib.request import urlopen
with urlopen('http://127.0.0.1:8080/', timeout=5) as resposta:
    texto = resposta.read().decode('utf-8')
    print('Status HTTP:', resposta.status)
    print('Título presente:', '<title>Meu primeiro servidor</title>' in texto)
PY
```

O trecho entre `PY` é executado por Python; a última linha `PY` precisa ficar sozinha para encerrar a entrada. Resultado esperado neste exemplo: `Status HTTP: 200` e `Título presente: True`. Isso consulta um serviço **local**, não qualquer site externo. A biblioteca cliente está documentada em [urllib.request](https://docs.python.org/3/library/urllib.request.html).

**Checkpoint 5:** resposta visível/consultável e log correspondente. No computador, `127.0.0.1` é **o computador**, não o telefone: a mesma URL lá não deve alcançar este servidor sem uma ligação adicional.

## 6. Edite e reconheça o que está sendo atualizado

Na segunda sessão, reabra `index.html` no nano. Altere somente o parágrafo “Uma página escrita por mim...” para uma frase de estudo, sem nome/endereço pessoal. Grave e saia. No navegador do telefone, atualize a página. Se o texto antigo continuar, tente recarga sem cache e confira o arquivo servido; não reinicie kernel nem troque Python para atualizar HTML estático.

O processo lê os arquivos da raiz definida; trocar o conteúdo é diferente de trocar endereço/porta. Um navegador pode ter cache. Uma URL para `sobre.txt` não mostra o HTML de `index.html` só porque ambos pertencem ao projeto.

Registre “antes, depois e verificação”: arquivo alterado, frase esperada e resposta observada. Para estudar um erro seguro, abra `http://127.0.0.1:8080/nao-existe.txt`; deve receber `404`, enquanto `/` continua funcionando. Você separou **servidor alcançável** de **arquivo existente** sem apagar nada.

**Checkpoint 6:** sabe distinguir uma alteração de conteúdo e uma falha de caminho. Não altere permissões de todas as pastas para resolver um erro de URL.

## 7. Decida conscientemente se vai compartilhar na LAN

Se o objetivo era aprender o servidor local, você já conseguiu; pode ir para parada/backup. Para compartilhar, use uma rede doméstica ou laboratório autorizado e aparelho cliente conhecido. O servidor desta fase oferece arquivos sem login e sem HTTPS; só publique o conteúdo de estudo. Desative qualquer redirecionamento de porta existente pertinente ao experimento ou escolha um contexto isolado administrado por você. Não mexa no roteador de terceiros.

No Android, abra **Configurações → rede Wi-Fi atual → detalhes** e anote o IPv4. No Linux nativo, abra detalhes da rede no desktop ou consulte `ip address show` e identifique a interface conectada. Não use o IP do notebook, gateway, endereço celular nem máscara `/24`. Se não consegue identificar a interface, [a microaula de rede](../comece-aqui/micro-aulas.md) explica essa distinção.

Volte à janela do servidor e pressione **Ctrl+C**. Deve voltar ao prompt. Agora, substituindo `IP_DO_TELEFONE` pelo seu IPv4 real, inicie:

```bash
python3 -m http.server 8080 --bind "IP_DO_TELEFONE" --directory "$HOME/aula-servidor/publico"
```

Não execute deixando o campo literal: ele não corresponde a um endereço da sua interface. A escuta agora aponta à interface escolhida; não usamos `0.0.0.0` como atalho para escutar indiscriminadamente. Mudança de rede/IP exige reavaliar esse valor. Não há necessidade de usar porta 80 nem root para a demonstração.

**No navegador do computador**, digite `http://IP_DO_TELEFONE:8080/`, preenchendo o mesmo IP. Leia o título, clique no segundo arquivo e confira o log do servidor. Uma resposta no computador, além da resposta local, confirma este acesso LAN específico. Não confirma acesso fora de casa, permanência após reinício ou disponibilidade 24 horas.

Se falha, confira a ficha: bind, IP, porta, servidor em execução, conexão dos dois aparelhos, isolamento entre clientes e firewall. Em rede escolar/empresa, o isolamento pode ser deliberado. Não contorne isso abrindo portas externas. Um firewall nativo precisa de regra mínima apropriada à rede confiável, pelo guia da distribuição; não desligue todas as proteções para esta aula.

**Checkpoint 7:** você consegue dizer quais clientes podem tentar acessar e quais arquivos estão publicados. Encerre o processo ao concluir esse teste, ou retorne à escuta loopback, usando Ctrl+C e o comando da etapa 4.

## Alternativa: visualizar pelo computador mantendo loopback no telefone

Se já preparou [SSH com host key e chave do cliente](ssh-arquivos.md), mantenha o servidor Python da etapa 4. No terminal do computador, preencha novamente as variáveis de usuário, IP e porta daquela aula se abriu uma janela nova. No Linux/macOS, abra um túnel local com a mesma chave do cliente:

```bash
ssh -i "$HOME/.ssh/id_ed25519_aula" -o ExitOnForwardFailure=yes -N -L 127.0.0.1:8081:127.0.0.1:8080 -p "$sshPhonePort" "$sshPhoneUser@$sshPhoneIp"
```

No PowerShell do Windows, use o caminho correspondente ao perfil do cliente:

```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519_aula" -o ExitOnForwardFailure=yes -N -L 127.0.0.1:8081:127.0.0.1:8080 -p $sshPhonePort "$sshPhoneUser@$sshPhoneIp"
```

Confira os três valores com sua ficha SSH: Termux desta aula usa 8022; um Linux nativo pode usar 22 ou outra porta confirmada. `-i` seleciona a chave privada própria criada na aula SSH; não troque pelo arquivo `.pub`. Digite sua passphrase quando solicitada. Não elimine a conferência da host key. `-N` mantém a ligação sem abrir shell; o primeiro `127.0.0.1:8081` é a escuta local **do computador**; o destino final `127.0.0.1:8080` é alcançado **a partir do telefone**. A janela fica ocupada enquanto o túnel existe. `ExitOnForwardFailure=yes` encerra a tentativa se a escuta local não puder ser criada, por exemplo porque 8081 já está ocupada; ele não garante que Python esteja ativo no destino.

No navegador do computador, abra `http://127.0.0.1:8081/`. Ao terminar, Ctrl+C fecha o túnel; outro Ctrl+C, na janela correta do telefone, para Python. Um túnel exige conexão SSH utilizável e não inventa uma rota de internet até seu telefone. Use-o somente depois da aula SSH; ele é uma alternativa à exposição HTTP na LAN, não um requisito do primeiro teste. [Encaminhamento local OpenSSH](https://man.openbsd.org/ssh).

## 8. Guarde o trabalho, pare e retome sem adivinhar

Arquivos persistem na pasta do projeto; o processo em primeiro plano não está configurado para iniciar no boot. Crie uma pasta nova de cópia **fora de `publico`**, pelo gerenciador ou terminal do telefone, e guarde `index.html` e `sobre.txt`. Confira as cópias abrindo-as e comparando hashes. Depois transfira uma cópia para fora do aparelho por [SFTP](ssh-arquivos.md) ou faça o [laboratório de backup/restauração](backup-restauracao.md). Uma cópia só no mesmo telefone não protege de limpeza do aplicativo/armazenamento.

Na ficha do projeto, anote versão Python, ambiente, pasta pública, porta, bind, data e quais clientes foram testados. Não coloque essa ficha privada ou um pacote de backup dentro da pasta servida. O servidor oferece arquivos dessa raiz; um pacote privado ali também poderá ser baixado por quem alcançar a escuta.

Para parar, localize a janela do processo e pressione Ctrl+C. Confirme o retorno do prompt e tente **recarregar** a URL: conteúdo já desenhado na aba pode continuar visível mesmo depois de parar, por isso a aparência da aba sozinha não prova serviço ativo. Um novo pedido/consulta deve falhar quando não existe outro servidor na mesma porta. Não use desligamento abrupto como rotina de encerrar o experimento.

Para retomar outro dia, abra o mesmo ambiente, confirme arquivos e rede, consulte a versão e execute o comando loopback da etapa 4. Se escolheu LAN, reconfirme o IP antes de iniciar. Não restaure um IP antigo por memória. Se faltam arquivos, restaure o backup **numa pasta separada**, valide, e só então decida qual cópia será a próxima raiz pública.

**Checkpoint 8:** pasta externa verificada, processo encerrado e uma retomada reproduzível pelo comando anotado. Isso não cria serviço de produção nem depende do notebook para executar Python no telefone.

## 9. Energia e manutenção sem prometer disponibilidade

Android pode limitar processos em segundo plano. Tela apagada, aplicativo removido da lista, mudança de Wi-Fi ou economia de bateria podem interromper sua experiência. Confira as opções de bateria **do Termux** e as [restrições Android](https://developer.android.com/develop/background-work/background-tasks/bg-work-restrictions); não desligue indiscriminadamente as proteções de todos os aplicativos. Se usar um wake lock documentado do Termux para teste, monitore consumo/temperatura e libere-o ao terminar, conforme [manutenção Termux](../android/termux.md).

No Linux nativo, suspensão também pode pausar CPU/rede. Apagar a tela e suspender o sistema são ações diferentes. Consulte [energia](../hardware/energia.md), meça carga sustentada e use alimentação adequada. Um símbolo de raio não demonstra que a bateria consegue sustentar o servidor e os periféricos. Não faça este laboratório com bateria crítica e sem caminho de recuperação.

Atualize Python e pacotes pelo gerenciador do ambiente, preservando seu projeto e conferindo a versão depois. Se a atualização muda comportamento, anote e teste de novo em loopback. Automatização, múltiplos clientes, login, uploads, HTTPS e publicação externa são outro projeto: veja [servidor web](../projetos/servidor-web.md), com servidor e integração adequados. Não acrescente um script de login em cima desta demonstração e declare que ela está segura.

## Erros e evidências para pedir ajuda

| Sintoma | Próxima verificação útil |
| --- | --- |
| O terminal não aceita outro comando | Python está em primeiro plano; use outra sessão ou Ctrl+C |
| 404 apenas num arquivo | Nome/caminho, maiúsculas, extensão e raiz pública |
| Lista de diretório em vez da página | `index.html` está ausente/foi salvo com outro nome; confira a pasta publicada |
| Funciona no telefone, não no computador | Bind loopback ou problema de rota/firewall/isolamento |
| Endereço indisponível após trocar Wi-Fi | IP escolhido deixou de pertencer à interface |
| Só falha após apagar a tela | Registre tempo, estado de energia e processo; não conclua erro de HTML |
| A aba ainda mostra algo depois de parar | Cache/desenho antigo; faça um novo pedido para conferir |

Compartilhe ambiente, versão, comando com IP sanitizado, pasta pública e mensagem real; não envie diretórios privados nem logs contendo identificadores desnecessários de clientes. Explique se o teste foi loopback, túnel ou LAN: esses resultados respondem perguntas diferentes.

## Verificação final e fontes

Você concluiu quando sua página própria e o segundo arquivo respondem, uma edição é reconhecida, o erro 404 é compreendido, a exposição escolhida é identificada, há cópia externa e consegue parar/retomar. LAN é opcional: registre “não testada” se fez somente loopback.

Fontes primárias consultadas em **11/10/2026**: Python (`http.server`, linha de comando e `urllib.request`), OpenSSH para túnel, Android para processos e fontes dos tutoriais vinculados. **Hardware do telefone não testado nesta elaboração.**

No notebook, o HTML desta página foi salvo numa pasta temporária dedicada e servido com `http.server`, bind `127.0.0.1` e uma porta alta livre selecionada para não disputar serviços existentes. Foram verificados HTTP 200, título, segundo arquivo, HTTP 404, edição de conteúdo e parada por SIGINT — o sinal usado por Ctrl+C nesse contexto. Depois da parada, um novo pedido deixou de responder. **Não foram testados LAN, túnel, Termux, navegador físico do telefone, bateria ou suspensão.** Essa validação demonstra o exemplo local de arquivos/HTTP, sem certificar segurança de produção nem o seu hardware.
