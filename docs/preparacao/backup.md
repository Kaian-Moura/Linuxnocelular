---
title: Backup verificável e plano de recuperação
description: Prepare uma saída de emergência antes de desbloquear ou substituir o Android.
sidebar_position: 1
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Resultado esperado

Você terminará com dados pessoais fora do telefone, arquivos de instalação conferidos e um plano de retorno que não dependa do sistema que será removido. Dificuldade: iniciante para arquivos; avançada para partições. Materiais: computador ou disco externo com espaço, cabo de dados, documentação do modelo, acesso às contas de recuperação e tempo para testar a cópia.

**Backup é uma cópia recuperável, não a promessa de que uma ferramenta “fez backup”.** Um diretório dentro do próprio telefone será perdido se `userdata` for apagada. Uma sincronização pode propagar exclusões. Um arquivo de imagem sem chave de criptografia pode não permitir recuperar dados, mesmo se tiver sido copiado integralmente.

## O que precisa ser preservado

Separe três grupos:

| Grupo | Exemplos | Como verificar |
|---|---|---|
| Dados pessoais | Fotos, documentos, projetos, mensagens exportáveis | Abra amostras e restaure uma cópia de teste |
| Identidade e acesso | Autenticadores, códigos de recuperação, passkeys exportáveis conforme fornecedor | Teste recuperação sem depender do telefone |
| Estado técnico | Modelo, versão, fontes de firmware, hashes, mapa de partições | Compare com documentação e registre em texto |

Aplicativos guardam dados privados aos quais ADB comum não tem acesso. Exporte pelo próprio aplicativo e confira a documentação do serviço. Não confie em `adb backup` como solução completa para Android atual: suporte e dados permitidos variam, e esse mecanismo não substitui um plano de restauração. Bancos, autenticadores, eSIM e credenciais do trabalho podem exigir novo provisionamento.

## 1. Faça cópias dos arquivos acessíveis

**Local: computador Linux/macOS; telefone em Android com ADB autorizado.**

```bash
mkdir -p "$HOME/smartphone-backup/arquivos"
adb pull /sdcard/DCIM "$HOME/smartphone-backup/arquivos/"
adb pull /sdcard/Download "$HOME/smartphone-backup/arquivos/"
adb pull /sdcard/Documents "$HOME/smartphone-backup/arquivos/"
```

Cada comando lê um diretório compartilhado e o copia ao computador. Se um diretório não existir, isso não invalida os outros, mas verifique onde o aplicativo salvou os documentos. Não use `/sdcard` como sinônimo de toda a memória do aparelho: é a visão de armazenamento compartilhado exposta ao Android. No Windows, adapte caminhos ao terminal utilizado ou faça cópia por MTP.

Copie também projetos Termux por seu mecanismo próprio, preservando permissões e arquivos ocultos. Não mova bancos de dados de aplicações em uso e considere isso um backup consistente: encerre a aplicação ou use sua exportação. Para Linux nativo já instalado, faça backup de dados, configurações, lista de pacotes e scripts locais antes de alterar kernel ou desktop.

## 2. Confira integridade e restauração

No computador Linux:

```bash
find "$HOME/smartphone-backup/arquivos" -type f | wc -l
du -sh "$HOME/smartphone-backup/arquivos"
find "$HOME/smartphone-backup/arquivos" -type f -exec sha256sum {} + \
  > "$HOME/smartphone-backup/SHA256SUMS-local.txt"
sha256sum -c "$HOME/smartphone-backup/SHA256SUMS-local.txt"
```

Contagem e tamanho detectam uma cópia obviamente vazia; os hashes detectam alteração posterior da cópia. **Esses hashes locais não comprovam que todos os arquivos do telefone foram incluídos.** Compare pastas, abra documentos e imagens, confira exportações e restaure um item em local separado. Criptografe backups com informação sensível e guarde a senha em outro local seguro.

## 3. Prepare a recuperação antes do flash

Crie um documento contendo:

- Modelo, variante, firmware original e patch atual.
- Fonte oficial do pacote de restauração e condições de uso.
- Hash ou assinatura publicada; se não houver, declare a lacuna.
- Combinação de botões documentada para o modo de manutenção.
- Ferramenta necessária e sistema operacional do computador aceito.
- Efeitos sobre dados, slots, bootloader e proteção contra downgrade.
- Como obter ajuda do mantenedor ou assistência se o método falhar.

Baixe o pacote **antes** de apagar o Android, quando o fabricante disponibilizar um método. Confira se é uma OTA, imagem completa ou pacote de recuperação. Eles não são intercambiáveis. Um arquivo destinado a outra região ou operadora pode não servir. [Restauração do Android](../recuperacao/restaurar-android.md) explica como validar a origem sem inventar firmware.

Teste entrar e sair do modo de manutenção sem gravar nada. Se não consegue retornar, resolva o acesso antes de instalar. Uma tela quebrada que impede confirmar desbloqueio e uma porta única ocupada pelo hub precisam de um plano físico real, não só uma conexão SSH que desaparecerá após a troca do sistema.

## Backup de partições: quando é necessário e por que não há receita universal

Alguns ports exigem preservar `boot`, `dtbo`, `vendor_boot`, `super` ou dados de calibração. O mapa, permissões, slots e tamanho dependem do aparelho. ADB sem root normalmente não lê blocos privados. Instalar root ou desbloquear apenas para fazer o backup pode apagar justamente o que você queria preservar.

Uma imagem de `super` não representa necessariamente todas as partições do telefone. Uma imagem de dados criptografados pode depender de chaves vinculadas ao hardware. Partições de modem/calibração podem conter identificadores pessoais e não devem ser compartilhadas. Não restaure partições de identificação de outro aparelho.

Quando uma página específica exigir backup de bloco, confirme origem, destino, tamanho, espaço e método de leitura permitido. A inversão entre `if` e `of` em ferramentas de cópia de bloco pode destruir dados. Esta base não fornece um `dd` genérico sobre `/dev/block/...` porque a segurança depende do mapa real e do estado de montagem.

## Erros, alternativas e rollback

Se `adb pull` falhar por permissão, use a exportação do aplicativo; não tente conceder acesso mundial a todo o armazenamento. Se faltar espaço no computador, reduza o conjunto ao necessário ou use outro disco. Se não houver firmware recuperável, adie a substituição do sistema e explore Linux sobre Android.

O rollback de uma cópia é simplesmente removê-la do destino, depois de conferir que os originais ainda existem. O rollback de desbloqueio ou flash pode reinstalar o software, mas não recuperar dados apagados sem backup. Restaurar o sistema original e religar a trava são operações diferentes, ambas dependentes do fabricante.

## Testes finais e critério para continuar

Continue apenas quando conseguir abrir arquivos da cópia, recuperar acesso às contas essenciais, localizar o pacote correto e descrever o caminho de recuperação sem depender do Android atual. Guarde uma segunda cópia do material mais importante. Em seguida, prepare [ADB/Fastboot](adb-fastboot.md) e selecione um [caminho nativo compatível](../nativo/visao-geral.md).

## Fontes e limites da verificação

Verificação documental em **10/10/2026**; backups do leitor precisam de validação própria.

- [Android: ADB e transferência de arquivos](https://developer.android.com/tools/adb).
- [AOSP: desbloqueio e limpeza de dados](https://source.android.com/docs/core/architecture/bootloader/locking_unlocking).
- [Google: imagens de fábrica e alertas de rollback](https://developers.google.com/android/images).
- [Fairphone: restauração manual e condições por modelo](https://support.fairphone.com/hc/en-us/articles/18896094650513-How-to-manually-install-Android-on-your-Fairphone).
