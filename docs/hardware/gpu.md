---
title: GPU, Mesa, Adreno e aceleração gráfica
description: Separe renderização, apresentação, codec de vídeo e desempenho real.
sidebar_position: 8
last_verified: '2026-10-10'
---

Uma GPU potente no Android pode permanecer inutilizada no Linux nativo. A aceleração depende do driver kernel, firmware, API de userspace, integração de buffers/display e escolha feita pelo compositor ou aplicativo. Instalar Mesa não garante que essas peças se encaixem.

**Dificuldade:** intermediária no diagnóstico; avançada para adaptar drivers. **Resultado:** identificar o renderer real e provar a função necessária sem confundir WebGL com decodificação de vídeo. **Pré-requisitos:** desktop estável, logs, acesso de recuperação e ferramentas de consulta disponíveis para sua arquitetura.

## Quatro capacidades separadas

1. **Renderização:** OpenGL ES/OpenGL/Vulkan calculam pixels.
2. **Apresentação:** EGL/GBM/Wayland/KMS levam os buffers à tela.
3. **Vídeo:** um codec dedicado pode decodificar/encodar H.264, VP9 ou AV1.
4. **Cálculo:** Vulkan compute ou outras APIs podem executar workloads; aplicações precisam suportá-las.

Freedreno oferece drivers para GPUs Adreno suportadas; Turnip é o driver Vulkan dessa família. Zink implementa OpenGL sobre Vulkan. O suporte depende da GPU e versão específicas, como explica a [documentação Freedreno](https://docs.mesa3d.org/drivers/freedreno.html), e Zink tem [requisitos próprios](https://docs.mesa3d.org/drivers/zink.html). Kernel `msm`/DRM e Qualcomm `KGSL` downstream são interfaces diferentes. O mesmo arquivo de biblioteca não necessariamente funciona nos dois.

`llvmpipe`/`softpipe` indicam renderização por CPU, não Adreno. Isso pode permitir desktop funcional, mas consumir CPU e energia e limitar fluidez. GPU disponível para um aplicativo também não prova que GNOME usa o mesmo driver.

## Diagnóstico seguro

Se `glxinfo`, `eglinfo` ou ferramentas de sessão não estiverem disponíveis, comece por [como encontrar e instalar ferramentas na sua distribuição](../diagnostico/instalar-ferramentas.md). Execute testes gráficos no contexto da sessão que será avaliada. Um erro de `DISPLAY` numa shell SSH sem acesso à sessão é diferente de um erro no driver da GPU.

Comece com uma sessão e perfil de usuário conhecidos; não substitua bibliotecas globais antes dos testes.

```sh
uname -r
ls -l /dev/dri /dev/kgsl-3d0 /dev/ion 2>/dev/null
env | rg '^(LIBGL|MESA|GALLIUM|VK_|EGL|GBM)'
vulkaninfo --summary
glxinfo -B
```

As duas últimas ferramentas precisam estar instaladas. `vulkaninfo` consulta dispositivos Vulkan e ainda pode inicializar driver: pare se o port registra instabilidade nessa operação. `glxinfo` testa o contexto GLX/X11 da sessão atual, possivelmente Xwayland; não identifica por si só o renderer do Mutter. Ausência de `/dev/dri/renderD*` não exclui todas as interfaces GPU vendor.

Registre renderer, API/versão, dispositivo, ICD e variáveis. Para GNOME, consulte seu journal/log de inicialização e bibliotecas/processos usados. Um campo `LIBGL_ALWAYS_SOFTWARE=1` força uma escolha importante, mas retirar essa variável sem stack funcional pode impedir o desktop de iniciar.

No Firefox, `about:support` apresenta Composição, WebGL e decisões/falhas gráficas. No Chromium/Brave, `chrome://gpu` apresenta estado e bloqueios. Não ative flags ignorando bloqueios nem use `--no-sandbox` como ajuste de desempenho.

## Teste controlado e interpretação

Compare a mesma resolução, temperatura, fonte de alimentação e cena leve. Observe CPU/memória, fluidez e registro de GPU fault. Depois teste aplicação real; uma animação WebGL de dez segundos não representa um jogo completo ou uso prolongado.

Se Vulkan funciona e o desktop não, investigue troca de buffers, DMA-BUF/PRIME, formatos, sincronização e KMS. Se WebGL funciona e vídeo segue pesado, investigue codec/driver e suporte do navegador. Se começa rápido e piora, compare [temperatura e energia](energia.md). Misturar todos esses sintomas sob “aceleração não funciona” dificulta a correção.

## Como testar um driver novo sem perder a referência

Use pacotes oficiais compatíveis sempre que possível. Um build experimental deve ficar em prefixo separado, com fonte/tag/commit, flags, hashes, assinatura quando disponível e dependências registradas. Selecioná-lo apenas para o processo de teste permite voltar ao stack do sistema. Não configure globalmente `LD_LIBRARY_PATH` no perfil de todos os usuários.

Antes de integrar ao boot, exija contexto GL/Vulkan real, leitura de pixels correta, teste de exportação/importação quando necessário, sessão física, estabilidade e recuperação. Esse trabalho pertence ao port do dispositivo. Um patch para associar KGSL e controlador vendor num OnePlus não é um “comando para acelerar qualquer Snapdragon”.

Módulos kernel exigem a ABI exata e podem causar panic mesmo se carregarem. Um kernel mais novo não garante suporte do modem, display ou câmera. Avalie o conjunto, preserve boot anterior e consulte [boot/crash](../diagnostico/boot-crash.md).

## Reversão e validação final

Anote a seleção anterior do driver e mantenha um caminho SSH independente. Para voltar, retire somente a seleção experimental e reinicie a sessão pelo gerenciador conhecido, salvando trabalhos antes. Bibliotecas privadas podem permanecer inativas até a análise; apagar Mesa do sistema não é rollback.

Teste boot, compositor, navegador, jogo representativo, monitor hotplug, períodos de carga e tempo prolongado sem faults. Documente funções ainda não validadas, especialmente codec, suspensão e outros monitores. Para um mini-PC cotidiano, menor resolução com renderer estável pode ser melhor que modo máximo experimental.

**Fontes e verificação:** **2026-10-10**; [Freedreno](https://docs.mesa3d.org/drivers/freedreno.html), [Zink](https://docs.mesa3d.org/drivers/zink.html), [variáveis Mesa](https://docs.mesa3d.org/envvars.html), [DMA-BUF](https://docs.kernel.org/driver-api/dma-buf.html). O [caso OnePlus](../dispositivos/oneplus-9-pro.md) tem resultados experimentais de setembro de 2026, com limitações expressas.
