---
title: Referências, evidências e confiabilidade
description: Como verificar informação técnica, registrar lacunas e distinguir fontes primárias de relatos e testes reais.
sidebar_position: 2
last_verified: '2026-10-10'
---

## Política de fontes

O ponto de partida são documentação e repositórios dos próprios projetos. Fóruns e discussões ajudam a encontrar sintomas, mas uma coincidência de nome não demonstra que o mesmo erro ocorra pelo mesmo motivo. Compare kernel, controlador, topologia, firmware e etapas antes de aplicar uma solução.

Cada página registra revisão documental e fontes relevantes. Uma data indica quando a informação foi consultada; não congela compatibilidade futura. Tags e commits são preferíveis para procedimentos que dependem do código. Recursos não testados devem permanecer identificados assim.

## Mapa de referências primárias

| Tema | Fonte | O que procurar |
|---|---|---|
| Linux móvel / postmarketOS-Nura | [Nura](https://nura.eco/), [instalação](https://nura.eco/install/), [pmbootstrap](https://docs.nura.eco/pmbootstrap/) | Modelo/variante, categorias, versões, imagens, manual da ferramenta |
| Ubuntu Touch | [dispositivos UBports](https://devices.ubuntu-touch.io/), [manual](https://docs.ubports.com/en/latest/userguide/install.html) | Página do modelo, firmware base e instalador |
| Outros ports | [Mobian](https://mobian.org/), [Droidian](https://droidian.org/) | Lista de aparelhos e instruções específicas |
| Android / boot | [AOSP](https://source.android.com/docs/core/architecture), [Verified Boot](https://source.android.com/docs/security/features/verifiedboot) | Conceitos, contratos e formatos; não substitui procedimento do fabricante |
| Android com ferramentas Linux | [Termux app](https://github.com/termux/termux-app), [pacotes](https://github.com/termux/termux-packages) | Origem de APKs, versões, arquitetura, patches |
| Ambientes PRoot / X11 | [proot-distro](https://github.com/termux/proot-distro), [Termux:X11](https://github.com/termux/termux-x11) | CLI da versão instalada, limitações, aplicativo e integração |
| Kernel / drivers | [documentação Linux](https://docs.kernel.org/), [código do kernel](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/) | Configuração, interfaces, device tree, patches e subsistemas |
| Gráficos | [Mesa](https://docs.mesa3d.org/), [Wayland](https://wayland.freedesktop.org/) | Drivers, APIs, renderizador efetivo e integração |
| Desktop / mídia | [GNOME](https://help.gnome.org/), [PipeWire](https://docs.pipewire.org/), [BlueZ](https://github.com/bluez/bluez) | Sessão, acesso, dispositivos e serviços |
| Distribuições | [Alpine](https://docs.alpinelinux.org/), [Debian](https://www.debian.org/doc/) | Pacotes, repositórios, init e arquitetura |
| Site | [Docusaurus](https://docusaurus.io/docs), [GitHub Pages](https://docs.github.com/en/pages) | Build, navegação, publicação e permissões |

Esses diretórios são referências, não links de download genéricos de firmware. Cada tutorial aponta páginas mais específicas quando disponíveis.

## Mudança de nome e fontes bloqueadas

O próprio projeto anunciou a mudança de postmarketOS para Nura em [27/09/2026](https://nura.eco/blog/2026/09/27/nura-rename/). Na revisão de outubro, diversos domínios antigos redirecionam. Alguns endpoints da wiki aplicaram proteção anti-bot ou recusaram acesso automatizado. Isso **não** significa que a página esteja inexistente ou que o aparelho não seja suportado.

Quando isso acontece, distinguimos acesso bloqueado de fonte lida. Um snippet antigo de busca pode ajudar a localizar a página, mas não certifica sua atualização. Conteúdo dependente da tabela atual deve ser conferido manualmente no site e no pacote de integração antes de flash.

O script `npm run check:external` gera um relatório com códigos HTTP e redirecionamentos. Ele testa disponibilidade de links, não lê tecnicamente todos os procedimentos. `403`, desafio anti-bot ou timeout são resultados inconclusivos; `404` exige procurar a localização correta e conferir o conteúdo. O relatório registra sua própria data real de execução.

## Como comparar relatos

Suponha que um fórum diga “desativar autosuspend resolveu o teclado”. Primeiro descubra se o seu teclado enumera, se o driver HID cria input e se eventos chegam à sessão. Se ele nem aparece no barramento, um problema no compositor não é a hipótese principal. Se aparecem eventos e não texto, perda de alimentação é menos provável naquela etapa.

Depois compare versão/controlador e logs. Teste uma mudança reversível, com estado anterior salvo e observação de resultado. Se o teste melhora, repita os cenários relevantes e procure a explicação estrutural antes de criar uma regra permanente. Uma diferença observada é evidência; sua interpretação ainda precisa de justificativa.

## Níveis de validação

1. **Referência identificada:** URL e projeto encontrados, mas conteúdo não confirmado.
2. **Revisão documental:** conteúdo lido e condições descritas.
3. **Teste isolado:** uma etapa passou, como enumeração ou geração de frames.
4. **Teste completo:** caminho útil observado, com hardware e versões registrados.
5. **Regressão/reprodução:** boot, reconexão e outros cenários repetidos; escopo exato preservado.

Não promova nível 2 a nível 5 pela quantidade de detalhes do texto. Um build Docusaurus bem-sucedido não testa um kernel. Uma imagem de câmera numa janela não comprova reconhecimento em Meet; uma GPU num teste de cálculo não comprova desktop acelerado estável.

## Lacunas abertas desta edição

Não há bancada cobrindo todos os modelos nem uma imagem universal. O estudo do OnePlus depende de adaptações específicas; não inclui distribuição pública de blobs privados nem uma garantia completa de recuperação/PD/hotplug. Guias de outras plataformas seguem fontes primárias e não foram executados nesta sessão. Páginas de suporte mutáveis precisam ser revisitadas antes de instalações futuras.

Revisão documental: **10/10/2026**. Registre novas evidências no [padrão de contribuição](contribuir.md), preservando essas distinções.
