---
title: 'Manutenção: conserve um mini-PC previsível'
description: Registre uma linha de base, prepare cópias e atualizações por camada, observe energia e repita testes sem alterar tudo de uma vez.
sidebar_position: 40
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Um mini-PC confiável precisa voltar ao trabalho no dia seguinte: abrir os documentos, retomar rede e periféricos e recuperar dados quando algo muda. Esta aula transforma “otimizar o telefone” numa rotina com **estado anterior, alteração identificada e resultado observado**.

**Dificuldade:** intermediária, após as primeiras aulas. **Materiais:** sistema já utilizável, registro de versões, backup externo, canal de controle e método de recuperação específico quando houver mudanças de boot. **Resultado:** rotina de manutenção adequada ao seu caminho. Não há configuração universal de “máximo desempenho”, nem promessa de resolver drivers ausentes aumentando frequências.

## 1. Faça uma linha de base antes de personalizar

Crie uma pasta de registros num local sob seu controle. Pelo gerenciador, use `Documentos/registros-mini-pc`; pelo terminal, como usuário comum, `mkdir -p "$HOME/Documentos/registros-mini-pc"`. Anote data e objetivo: terminal, desktop, servidor ou eletrônica. Um recurso fora do objetivo deve ser marcado como tal, sem dizer que funciona.

Use a [ficha de bancada](../diagnostico/ficha-evidencias.mdx) para sistema, kernel, versão, acesso, topologia de cabos e testes. Ela pode ser exportada e retomada localmente. No **Linux nativo**, estas consultas ajudam a identificar o contexto:

```sh
cat /etc/os-release
uname -r
uname -m
df -h
free -h
```

Em **Termux**, consulte `termux-info`, `df -h "$HOME"` e as versões das ferramentas do projeto. Uma consulta a `/etc/os-release` dentro de PRoot descreve a distribuição convidada, não substituição do Android. `free` descreve memória do kernel, não uma quota exclusiva para cada aplicação; registre o contexto.

Não publique diagnósticos completos sem revisar dados pessoais. Copie para as anotações apenas os valores necessários. Guarde também a origem da imagem e instruções do port quando usa Linux nativo: um número de kernel sozinho não identifica todos os patches.

**Checkpoint 1:** você consegue descrever o estado que pretende conservar antes de qualquer mudança.

## 2. Faça um ensaio pequeno de uso

Escolha um conjunto curto que represente seu objetivo:

| Objetivo | Ações observáveis |
|---|---|
| Programação | Abrir projeto salvo, executar teste, editar uma linha, salvar, reconstruir |
| Desktop | Abrir documento e navegador, digitar, mover/rolar, conferir som quando necessário |
| Servidor local | Abrir uma página pelo cliente, salvar/exportar dados pelo método da aplicação |
| Arduino/ESP32 | Compilar a placa identificada; upload e circuito apenas quando o hardware estiver disponível |

Registre quais aplicações estavam abertas e o tempo de observação. Teste primeiro em uma montagem estável. Para monitor/hub/PD, siga a [montagem progressiva](../hardware/montagem-validada.md), sem retirar vários cabos simultaneamente e depois atribuir a falha a um único driver.

O ensaio deve incluir **retomada**, não apenas primeira abertura: encerre corretamente a aplicação, reabra e confirme o mesmo documento. Reboot é um teste separado e só deve ser feito quando existe alimentação estável, arquivos salvos e um meio de retomar o controle.

## 3. Prepare cópias por tipo de dado

Separe projeto, configuração e sistema:

- **Projeto:** código, documentos, manifests e dados. Faça [backup/restauração](backup-restauracao.md) em uma área separada.
- **Configuração:** arquivo exato que pretende alterar, caminho, dono e valor anterior. Preserve uma cópia antes de editar; exportação de preferências pode exigir ferramenta do desktop.
- **Sistema/boot:** lista de pacotes, receita do port, artefatos originais e recuperação. Backup de documentos não reverte um kernel incompatível.

Não use `tar` de um banco de dados em escrita como se fosse exportação consistente. Pare a aplicação conscientemente ou use seu mecanismo de backup. Git conserva versões registradas do código, mas não substitui cópia externa nem uma política de dados de banco. [Aula Git](git-primeiro-repositorio.md).

Para um arquivo de configuração, confira o destino antes da cópia. `cp -i arquivo arquivo.copia` pede confirmação quando o destino existe; `cp` sem opção pode substituir. Arquivos de sistema requerem preservar atributos/privilégios adequados e uma receita específica. Não copie toda a pasta `/etc` de outra distribuição por cima desta.

## 4. Atualize uma camada por vez

Existem pelo menos quatro tipos de mudança: aplicativo Android, pacotes Termux/distribuição, ambiente do projeto e imagem/kernel/firmware. Cada um tem procedimentos e formas de retorno diferentes.

**Termux:** use a origem do aplicativo e os repositórios oficiais compatíveis. Antes de atualizar PRoot-distro, inventarie e faça backup dos ambientes na versão atual. As interfaces antigas e atuais podem ter layouts distintos; uma lista vazia depois de atualizar não comprova que os arquivos desapareceram. [PRoot e versões](../android/proot-distro.md).

**Debian/Ubuntu:** conferir índices e transação faz parte do gerenciador APT. Uma troca de release é outra operação, que exige notas de atualização e plano próprios. Não use comandos de outra release para “ter todos os repositórios”.

**Alpine/postmarketOS:** confirme release, repositórios e integração do port antes da transação. `main` e `community` da mesma release não equivalem a misturar stable e edge. Atualizações do kernel/pacotes do dispositivo podem afetar boot, USB, GPU ou câmera. [Administração APK](https://docs.alpinelinux.org/user-handbook/0.1a/Working/apk.html) e [aplicativos](../desktop/instalar-aplicativos.md).

**Dependências do programa:** ambientes Python, lockfile npm e bibliotecas C/C++ têm suas próprias versões. Preserve manifests e código antes de mudar. Atualização global de pacote não é conserto automático para um projeto cujo erro você não identificou.

Não é necessário atualizar tudo durante esta aula. Se a transação inclui remoções inesperadas, mudança de release, kernel desconhecido ou perda do canal de recuperação, pare e esclareça antes de aceitar. A versão anterior pode deixar de estar disponível no repositório; “voltar pacote” não é um rollback garantido.

**Checkpoint 4:** cada atualização tem motivo, origem, escopo, backup e teste de aceitação. Alterar boot exige o [plano de recuperação](../preparacao/plano-recuperacao.md), não somente um commit.

## 5. Configure energia pelo que o hardware suporta

No GNOME, abra **Configurações → Energia**, conforme a versão. Revise apagamento de tela, suspensão e perfis somente quando esses controles existem e estão integrados. A [documentação GNOME de energia](https://help.gnome.org/gnome-help/power.html) descreve a interface; ela não garante que o port do smartphone tenha suspensão funcional.

Apagar tela, bloquear sessão e suspender o sistema são operações diferentes. Um serviço de rede pode precisar continuar com tela apagada, mas não sobreviver à suspensão; uma sessão remota pode mostrar uma área de trabalho enquanto o monitor físico está desligado. Registre o que é desejado antes de alterar o tempo de inatividade.

Faça um teste simples: salve documentos, mantenha o controle alternativo pronto, aguarde o tempo configurado e tente retomar pela entrada suportada. Se suspensão já é marcada como quebrada no port, não a habilite para “ver se melhora autonomia” sem um experimento específico e recuperação.

Em Android, ajustes de bateria são do fabricante e do aplicativo. Exceções de otimização e wake locks não eliminam todas as políticas de encerramento; tampouco fornecem kernel próprio ao PRoot. Configure apenas o necessário ao projeto e observe consumo, conforme [Termux](../android/termux.md).

Não desligue proteções térmicas nem force frequências como melhoria geral. Primeiro identifique carga, renderer/GPU, RAM, armazenamento e ventilação. Um desktop renderizado por software pode continuar lento com CPU em perfil alto. [GPU e aceleração](../hardware/gpu.md).

## 6. Meça consumo e carga em um cenário conhecido

Anote nível de bateria e horário no começo e após um intervalo sob uso semelhante. Registre carregador, cabo, porta PD, periféricos e brilho/resolução. Observe também aquecimento e se teclado/mouse continuam operando durante alimentação.

Se o sistema informa “carregando” mas o nível cai, não conclua imediatamente defeito de bateria: pode haver consumo maior que a potência fornecida, negociação inadequada ou outro problema. Se continua no mesmo percentual por pouco tempo, o arredondamento pode esconder mudança. Compare cenários e siga [energia](../hardware/energia.md).

Não instale ferramentas desconhecidas para “liberar watts”. Software não cria um contrato PD que carregador/hub não suportam. Bateria danificada, conector instável e cabo inadequado exigem verificação física. Faça o diagnóstico antes de configurar automações de recuperação que reiniciam USB ou vídeo repetidamente.

## 7. Organize uma rotina pequena

Os intervalos abaixo são uma organização possível, não requisitos universais:

| Momento | Rotina |
|---|---|
| Antes de trabalhar | Conferir rede/entrada e abrir um arquivo salvo; observar bateria e calor |
| Depois de produzir algo | Salvar, registrar versão quando útil e atualizar a cópia externa |
| Antes de mudar sistema | Inventário, transação prevista, backup, recuperação e canal alternativo |
| Depois da mudança | Repetir o mesmo ensaio pequeno e comparar com a linha de base |
| Periodicamente | Testar uma restauração separada, revisar atualizações pertinentes e conferir espaço |

Comece com lembretes/anotações. Não crie cron, serviço de boot ou watchdog antes de validar o comando manual, seus privilégios, sua duração e o comportamento ao falhar. Um servidor automático precisa de logs, limite de reinício e preservação dos dados. [Servidores e serviços](../projetos/servidor-web.md).

Se quiser automatizar depois, identifique primeiro **qual init controla o ambiente**. OpenRC, systemd e mecanismos Android não são intercambiáveis. PRoot pode não oferecer o mesmo modelo de serviços da distribuição nativa. Não desative o display manager principal como parte de uma “limpeza” genérica.

## 8. Quando algo piorar

Anote a primeira falha, pare de adicionar mudanças e compare com a linha de base:

1. A aplicação ainda abre? O documento continua salvo?
2. O telefone permanece acessível? Sem kernel ativo, SSH não recupera CrashDump.
3. Qual foi a mudança exata: pacote, configuração, imagem ou ligação física?
4. Existe erro reproduzível sem repetir uma ação arriscada?
5. A cópia anterior e o método de retorno são realmente aplicáveis?

Volte uma configuração identificada após preservar o estado atual, quando seguro. Para kernel/firmware, siga o procedimento do port/fabricante. Não use um comando universal de downgrade, relock ou alteração de slot. Se houve CrashDump, vídeo perdido ou queda do canal de controle, use [triagem](../recuperacao/triagem.md) e [diagnóstico por camadas](../diagnostico/metodo.md).

## Testes finais e retomada

Você concluiu quando sua rotina permite encontrar backups, repetir o ensaio, identificar a última mudança e explicar como retomar o controle. Conserve uma ficha anterior e outra posterior às mudanças relevantes. O registro deve mostrar limitações conhecidas, incluindo uso com carregador, reconexão e ausência de algum driver.

Revisão documental **11/10/2026**. Não foram aplicadas políticas de energia, serviços, atualizações ou parâmetros no telefone durante a escrita. As fontes dos procedimentos específicos estão nos capítulos ligados. Uma rotina bem documentada ajuda a detectar regressões; não transforma recursos não suportados em funções confiáveis.
