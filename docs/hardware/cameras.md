---
title: Câmera, V4L2, libcamera, PipeWire e navegador
description: Entenda por que o sensor do Android não aparece automaticamente como webcam Linux.
sidebar_position: 7
last_verified: '2026-10-10'
---

Uma câmera de smartphone é um pipeline: sensor, alimentação, clocks, barramento, ISP, firmware, alocação de buffers, processamento e configuração. No Android, HALs e bibliotecas vendor coordenam partes desse pipeline. Um kernel Linux iniciar não significa que uma aplicação Linux consiga capturar imagem.

**Dificuldade:** básica para webcam USB compatível; avançada para port do sensor interno. **Resultado:** identificar a API disponível, testar imagem real e distinguir captura local de disponibilidade no navegador. **Materiais:** cena iluminada, terminal, aplicação de captura, documentação do port. **Riscos:** privacidade, consumo/temperatura e crash em drivers incompletos. Feche chamadas e não filme pessoas sem consentimento.

## APIs que não são equivalentes

| Camada | Função | Limite |
|---|---|---|
| V4L2 | Interface kernel para dispositivos de vídeo | Um `videoN` pode ser codec ou saída, não câmera |
| Media Controller | Descreve entidades e links de pipelines | Exige suporte e configuração do hardware |
| libcamera | Coordena pipelines de câmera suportados | Não implementa HAL vendor desconhecido automaticamente |
| HAL Android | Interface entre framework Android e implementação vendor | Bibliotecas dependem de ABI, serviços, firmware e kernel |
| PipeWire | Publica/transporta nós de mídia | Não substitui driver/ISP |
| Portal de câmera | Media acesso de aplicações compatíveis | Permissão não cria uma câmera ausente |

Veja [API de mídia do kernel](https://docs.kernel.org/userspace-api/media/v4l/v4l2.html), [libcamera](https://docs.libcamera.org/master/) e [portal PipeWire](https://docs.pipewire.org/page_portal.html). Drivers presentes no Android podem usar interfaces privadas incompatíveis com V4L2/libcamera.

## 1. Inventário sem captura

```sh
ls -l /dev/video* /dev/media* /dev/v4l-subdev* 2>/dev/null
v4l2-ctl --list-devices
cam -l
pw-cli list-objects Node
```

`v4l2-ctl` vem de v4l-utils; `cam` do pacote de ferramentas libcamera, quando fornecido pela distribuição. `pw-cli` lista nós da instância PipeWire atual; execute na sessão do usuário. Ausência de uma ferramenta não é ausência de hardware.

Para um nó identificado como captura, substitua `/dev/videoN` pelo correto:

```sh
v4l2-ctl --device=/dev/videoN --all
v4l2-ctl --device=/dev/videoN --list-formats-ext
```

Isso consulta capacidades, formatos, tamanhos e cadências. Não faça scan indiscriminado abrindo todos os nós de um driver experimental. Compare o driver com a documentação do port. `Permission denied` requer investigar ACL/sessão; não tornar todos os dispositivos `0666`.

## 2. Prove imagem, não só um nó

Abra uma aplicação compatível com a API encontrada, escolha sensor e um modo anunciado, começando por resolução moderada. Aponte para uma cena iluminada e mova um objeto. Confirme quadros diferentes, cores razoáveis, foco quando suportado e fechamento limpo. Uma imagem preta pode ser lente coberta, exposição, buffer inválido ou pipeline travado; o nó aparecer na lista não diferencia essas causas.

Registre dimensões **capturadas**, dimensões após rotação, taxa medida e custo de CPU. Megapixels comerciais podem envolver foto RAW ou modo diferente do fluxo YUV usado na prévia. Não chame upscale de captura na resolução máxima.

## 3. Disponibilize ao navegador

O navegador precisa de backend/API suportado, permissão da página e origem segura. Normalmente HTTPS ou `localhost` é necessário para `getUserMedia`. Verifique a lista de câmeras na configuração do navegador e use uma página local de teste antes de entrar em reunião.

O exemplo abaixo pode ser salvo como `camera-teste.html`, servido localmente com `python3 -m http.server 8000 --bind 127.0.0.1` no diretório desse arquivo e aberto em `http://localhost:8000/camera-teste.html`. Execute no telefone e feche o servidor após o teste; o diretório servido não deve conter arquivos privados.

```html
<!doctype html>
<html lang="pt-BR">
<meta charset="utf-8">
<title>Teste local da câmera</title>
<button id="start">Iniciar</button><button id="stop">Parar</button>
<video id="preview" autoplay playsinline muted></video><pre id="result"></pre>
<script>
let stream;
const preview = document.getElementById('preview');
document.getElementById('start').onclick = async () => {
  try {
    stream?.getTracks().forEach(track => track.stop());
    stream = await navigator.mediaDevices.getUserMedia({
      video: {width: {ideal: 1280}, height: {ideal: 720}}, audio: false
    });
    preview.srcObject = stream;
    document.getElementById('result').textContent =
      JSON.stringify(stream.getVideoTracks()[0].getSettings(), null, 2);
  } catch (error) {
    document.getElementById('result').textContent = error.name + ': ' + error.message;
  }
};
document.getElementById('stop').onclick = () => {
  stream?.getTracks().forEach(track => track.stop());
  preview.srcObject = null;
};
</script>
</html>
```

`ideal` é preferência, não garantia. A captura não inclui microfone. Pare explicitamente após verificar. Se aparecer `NotAllowedError`, revise permissão/origem; `NotFoundError` aponta para fonte indisponível; erros de leitura podem envolver dispositivo ocupado. A aplicação de chamada pode selecionar outra resolução e limitar transmissão independentemente do sensor.

## Pontes e alternativas

Uma fonte PipeWire pode funcionar em aplicativos compatíveis e não aparecer para programas que só abrem `/dev/videoN`. Uma ponte V4L2 adicional, por exemplo com módulo virtual, depende de suporte do kernel e ABI correspondente; não distribua um módulo de outro aparelho. Webcams USB UVC podem ser alternativa, exigindo host, energia e driver UVC.

Adaptar HAL vendor é desenvolvimento específico: identificar firmware legítimo do próprio aparelho, dependências Bionic/VNDK, serviços, layout ABI, fences, formato dos buffers, isolamento e encerramento. Não copie blobs proprietários para este repositório nem use firmware de origem duvidosa. O [caso OnePlus](../dispositivos/oneplus-9-pro.md) demonstra uma ponte experimental, não um instalador genérico de câmeras.

## Reversão e aceitação

Faça backup antes de habilitar autostart. A câmera deve ficar ociosa sem consumidor, respeitar permissão e encerrar captura ao fechar a aplicação. Não use `rmmod` de driver vendor experimental como procedimento rotineiro: houve CrashDump no histórico do projeto durante limpeza envolvendo o módulo.

Teste iniciar/parar repetidamente, alternar sensor se implementado, imagem real, permissão negada, aplicação ocupando câmera e boot. Só declare webcam funcional depois de testar o cliente pretendido; teste local não valida automaticamente Google Meet, gravação, HDR ou todos os sensores.

**Fontes e verificação:** **2026-10-10**; [AOSP câmera](https://source.android.com/docs/core/camera), [libcamera](https://docs.libcamera.org/master/), [V4L2](https://docs.kernel.org/userspace-api/media/v4l/v4l2.html), [PipeWire portal](https://docs.pipewire.org/page_portal.html), [WebRTC: acesso à câmera](https://webrtc.org/getting-started/media-devices). Evidências específicas do projeto são de setembro de 2026.
