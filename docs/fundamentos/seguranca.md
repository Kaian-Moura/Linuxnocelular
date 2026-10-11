---
title: Segurança do mini-PC e dos dados
description: Proteja credenciais, serviços, navegador e backups sem confundir root, chroot ou PRoot com isolamento.
sidebar_position: 4
last_verified: '2026-10-10'
---

## Segurança depende do projeto que você montou

Reaproveitar hardware não transforma um kernel sem manutenção em um sistema automaticamente seguro. Determine de onde vêm atualizações de kernel, firmware, distribuição e aplicativos. Uma distribuição atual com kernel downstream antigo pode continuar exposta a falhas que o empacotamento do espaço de usuário não corrige.

Separar seu laboratório do telefone principal reduz a quantidade de contas e dados em risco. Evite importar senhas de uso diário antes de avaliar atualizações, isolamento do navegador e capacidade de recuperação. “É Linux” não é uma avaliação de segurança.

## Camadas que não são isolamento suficiente

PRoot adapta caminhos e chamadas, mas não cria a fronteira de segurança de uma VM. Chroot muda a raiz de arquivos; sozinho não impede um processo privilegiado de atingir o hospedeiro. Root torna um erro mais abrangente. Containers também compartilham o kernel e precisam de configuração de permissões e recursos.

Use essas ferramentas para organizar ambientes, não para executar código hostil supondo proteção inexistente. Para experimentar software desconhecido, prefira uma máquina descartável com isolamento apropriado e sem dados pessoais. A viabilidade de virtualização acelerada em smartphones deve ser comprovada, nunca presumida.

## Navegadores e sandbox

Navegadores dependem de mecanismos do kernel para separar processos e reduzir o impacto de páginas maliciosas. Um navegador pode abrir e ainda apresentar isolamento incompleto. Não trate `--no-sandbox` como correção de compatibilidade para navegação cotidiana. Investigue mensagens, versão, namespaces e o pacote antes de decidir se esse sistema é adequado para contas sensíveis.

O estudo do OnePlus encontrou limitações nesse campo. Isso não se transfere para todos os ports. Veja [GPU e desempenho](../hardware/gpu.md) para não confundir sandbox com aceleração: desativar proteção não implementa um driver gráfico.

## Rede local não dispensa autenticação

Antes de iniciar SSH, VNC, banco de dados ou um servidor de arquivos, escolha quem deve acessá-lo. Para teste local, prefira escutar em `127.0.0.1`. Para LAN, use autenticação, regras de firewall compatíveis e serviços mínimos. Uma rede escolar, pública ou de visitantes não é sua rede doméstica confiável.

**VNC sem autenticação ou sem proteção de transporte pode expor tela e entrada.** Um túnel SSH permite manter o serviço no loopback. Nunca configure encaminhamento de portas do roteador só para “ver se conecta”. Primeiro valide no próprio telefone e na LAN; acesso externo exige uma arquitetura deliberada, atualizações e controle de acesso.

As chaves SSH devem ter uso definido e, quando apropriado, senha. Não publique chaves privadas. Ao mudar uma imagem do aparelho, verifique a identidade SSH por um canal confiável antes de remover um aviso de chave alterada. O aviso pode ser esperado, mas não deve ser ignorado automaticamente.

## Backups, criptografia e disponibilidade

Backup no mesmo armazenamento que será apagado não protege contra flash ou falha da unidade. Faça cópia externa e teste restauração. Guarde dados de projetos, configurações e o registro de versões separadamente de blobs proprietários que você não tem autorização para redistribuir.

Criptografia de dados e boot confiável são controles diferentes. Desbloquear boot pode reduzir garantias de integridade mesmo com arquivos criptografados. Um servidor que depende de uma senha digitada numa tela quebrada após cada boot pode ser seguro contra acesso físico, mas indisponível após queda de energia. Documente esse compromisso, sem remover proteção por impulso.

## Plano de manutenção

1. Registre versões e de quem depende cada atualização.
2. Faça backup e confirme acesso alternativo antes de atualizar kernel ou desktop.
3. Consulte notas de atualização do port; não misture repositórios para forçar versões.
4. Atualize uma camada por vez quando houver risco de incompatibilidade.
5. Verifique boot, rede, entrada, energia e retomada; preserve evidências de regressão.
6. Remova serviços e permissões temporárias quando terminar o diagnóstico.

A bateria também é parte da segurança. Deformação, cheiro, calor anormal ou dano físico exigem interromper o uso e avaliação apropriada. Não desative limites térmicos para ganhar desempenho nem cubra o aparelho com materiais que dificultem dissipação.

## Publicando relatos sem expor sua vida

Logs podem revelar SSIDs, MACs, nomes de usuário, caminhos e tokens. Revise antes de anexar. Um vídeo de câmera de teste pode identificar pessoas ou documentos; substitua por uma cena neutra. Remova dados pessoais mantendo códigos de erro, versões e sequência de eventos. A comunidade precisa da evidência técnica, não de suas credenciais.

## Fontes e verificação

Revisão documental: **10/10/2026**. Veja [sandbox Linux do Chromium](https://chromium.googlesource.com/chromium/src/+/main/sandbox/linux/README.md), [PRoot e seus limites](https://proot-me.github.io/), [manual OpenSSH](https://www.openssh.com/manual.html) e [Verified Boot no AOSP](https://source.android.com/docs/security/features/verifiedboot). Esta página apresenta práticas de projeto; não substitui a análise das versões efetivamente instaladas.
