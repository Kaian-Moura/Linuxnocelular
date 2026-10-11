---
title: Registrar e validar um novo dispositivo
description: Transforme experiências em fichas reproduzíveis, com evidência por recurso e sem dados pessoais.
sidebar_position: 3
last_verified: '2026-10-10'
---

Uma contribuição útil não diz apenas “meu telefone roda Linux”. Ela identifica o aparelho, a pilha, o que foi realmente testado e o que outra pessoa precisa para reproduzir. Um recurso funcional numa versão pode regredir em outra; a ficha deve tornar essa diferença visível.

**Dificuldade:** básica para registrar uma experiência; avançada para revisar um port. **Resultado:** página de dispositivo e evidências saneadas, prontas para revisão comunitária. **Pré-requisitos:** testar somente aparelho próprio/autorizado e seguir [contribuição](../comunidade/contribuir.md). Não é obrigatório fazer flash para contribuir: um inventário verificável ou caminho Android também é útil.

## Identidade mínima e privacidade

Registre fabricante, modelo comercial, SKU/variante, codinome, SoC, arquitetura, RAM/armazenamento e condição de display/touchscreen. Não inclua IMEI, serial, contas, números de telefone, IP doméstico, MAC próprio, senha Wi-Fi, chave SSH, chaves Bluetooth, fotos pessoais ou firmware proprietário.

Inclua versões Android/base firmware quando relevantes, distribuição/branch, kernel completo, pacote de dispositivo, commit de fonte e data dos testes. “Android 12” ou “kernel 5.4” pode ser insuficiente para um módulo ABI-específico. Para uma adaptação, registre flags e toolchain sem redistribuir componentes cuja licença não permite isso.

## Modelo de ficha

Use os templates do repositório e complete, com texto útil, a estrutura abaixo:

```yaml
device:
  manufacturer: "Fabricante"
  model: "Modelo completo"
  variant: "SKU/região/operadora relevante"
  codename: "Codinome confirmado"
  architecture: "aarch64 ou valor medido"
software:
  method: "native | proot | chroot | android-desktop | remote"
  distribution: "Nome e versão/branch"
  kernel: "Resultado de uname -r, quando acessível"
  source_revision: "Commit/tag ou não confirmado"
evidence:
  tested_at: "AAAA-MM-DD"
  scope: "Hardware físico e sequência efetivamente testados"
  limitations: "Recursos não testados ou falhas conhecidas"
```

Esse exemplo ilustra o **conteúdo**; não é uma alegação de compatibilidade nem um schema universal de instalador. O projeto pode manter uma representação estruturada própria para o assistente. Nenhum campo textual “suportado” deve permitir automaticamente um comando de flash.

## Matriz por função e cadeia

| Função | Estado sugerido | Evidência necessária |
|---|---|---|
| Boot | funciona/parcial/quebrado/não testado | Sistema responde e versão conferida |
| Input USB | idem | Enumeração, EV_KEY/EV_REL e aplicação sem root |
| Display externo | idem | Pixels reais, modo e condições de cabo/hub |
| Hotplug | idem | Reconnect preserva sessão, não só primeira conexão |
| Energia | idem | Estado, leituras e tendência, fonte identificada |
| GPU | idem | Renderer real + resultado funcional, sem inferir codec |
| Rede | idem | Associação, IP/rota/DNS e estabilidade testados |
| Bluetooth | idem | Perfil e dados, não só lista/pareamento |
| Câmera | idem | Sensor, resolução, imagem real e API cliente |
| Suspensão | idem | Suspend/resume efetivo e funções após retomar |

“Parcial” precisa de uma frase: “vídeo funciona na conexão inicial, falha após PD”, por exemplo. “Não testado” difere de “quebrado”. Condições como tela danificada também limitam o que pode ser comprovado sobre o display interno.

## Procedimento reproduzível

Descreva materiais e preparação, fonte oficial/port, dependências, versão das ferramentas e instruções completas com verificações. Cada comando de escrita deve declarar alvo, privilégio, efeito, condições de segurança e rollback. Não inclua um flash genérico com placeholder perigoso como se fosse executável.

Para pacotes/configurações, registre arquivos modificados e backup. Para fonte nova, publique commit/patch e build reproduzível quando licenças permitem. Um relatório sobre módulos privados sem seus fontes/builds é estudo de caso, não instalação pública completa; marque essa distinção claramente.

Teste a sequência descrita numa referência limpa quando viável. Se não foi repetida, informe isso. Diferencie teste em display virtual, placa de prova e hardware físico: um gadget HID virtual valida software, mas não o PHY/cabo/hub real. Uma captura de tela do compositor não prova saída HDMI.

## Referências e estado temporal

Use documentação oficial do fabricante para unlock/restore, documentação do projeto para instalação e repositórios/issues para limites. Links para commit/tag são preferíveis ao branch móvel em explicações de código. Inclua data de consulta e data da evidência separadamente.

Página bloqueada, download ausente ou port arquivado devem ser registrados. Não mantenha “funciona” baseado só numa wiki indexada antiga. Uma nova revisão deve atualizar a matriz ou registrar regressão, preservando o histórico necessário.

## Revisão antes de enviar

Execute o build e verificações locais definidos no README. Confira links, headings, blocos de código, acessibilidade e idioma. Faça uma busca por dados privados na cópia que será publicada. Publicar logs é opcional; o relatório pode resumir resultados com trechos mínimos saneados.

Peça revisão técnica especialmente para comandos destrutivos, alterações de kernel/DT, recuperação e claims de compatibilidade. Relatos de outras pessoas podem enriquecer a evidência, mas não devem virar “oficialmente suportado” sem reconhecimento do projeto responsável.

## Manutenção e validação final

Indique como repetir testes após atualização, a quem reportar bugs e o que pode ser revertido. Uma ficha deve permitir que alguém decida entre mini-PC gráfico, servidor ou Linux sobre Android antes de perder seu sistema funcional. Casos negativos bem documentados evitam dano e retrabalho.

**Fontes e verificação:** **2026-10-10**; [reportar problemas no kernel](https://docs.kernel.org/admin-guide/reporting-issues.html), [UBports: porting](https://docs.ubports.com/en/latest/porting/introduction/index.html), [postmarketOS device packages](https://postmarketos.org/devicepkg), [OnePlus como exemplo de limites](oneplus-9-pro.md). O modelo é uma convenção editorial deste projeto e não aprovação oficial desses upstreams.
