---
title: Use Linux no notebook por pendrive, sem instalar
description: Prepare uma sessão live Ubuntu para conhecer Linux e avaliar o ambiente de preparação sem substituir o sistema do computador.
sidebar_position: 9
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Este tutorial é para quem usa Windows e precisa de um **computador Linux** para uma ferramenta como pmbootstrap. Ele inicia Ubuntu pelo pendrive e escolhe experimentar, preservando o sistema instalado no disco. **Não instala Ubuntu no telefone.** Dificuldade: iniciante/intermediária; entrar no menu de boot depende do fabricante do notebook.

## Requisitos e riscos

Use um computador compatível com a ISO escolhida, internet, um pendrive vazio com capacidade maior que a imagem e backup dos arquivos importantes do computador. Confira os [requisitos atuais Ubuntu Desktop](https://ubuntu.com/download/desktop). Algumas imagens atuais ultrapassam 4 GB; um pendrive de 8 GB pode acomodar a imagem, mas não garante espaço persistente para grandes compilações.

**A gravação apaga o pendrive selecionado.** Desconecte discos externos que não serão usados e confira fabricante/capacidade do destino. O disco interno não deve ser selecionado pelo gravador. Para experimentar Linux não é necessário escolher “apagar disco” no instalador Ubuntu.

Se o computador é administrado por faculdade/empresa, o boot externo pode ser bloqueado. Use um computador em que você tenha autorização para alterar essa inicialização. Não altere criptografia, TPM ou Secure Boot sem entender as consequências e ter as chaves de recuperação do sistema original.

## 1. Baixe os dois arquivos no Windows

Abra [Ubuntu Desktop](https://ubuntu.com/download/desktop). Escolha a ISO para **o processador do computador**; num notebook Intel/AMD de 64 bits, é a opção Intel/AMD/amd64. Uma ISO ARM para placa diferente não é alternativa de boot nesse notebook. Salve em Downloads e confira integridade pelo [método oficial Ubuntu](https://ubuntu.com/tutorials/how-to-verify-ubuntu).

Abra [Rufus oficial](https://rufus.ie/pt_BR/) e baixe o executável Windows da arquitetura apropriada. Guarde ambos na sua pasta de downloads. Não precisa copiar a ISO manualmente para o pendrive: o gravador prepara os arquivos e a inicialização.

**Verificação:** você tem uma ISO completa e um Rufus `.exe`, não dois arquivos incompletos nem um download de anúncio. Anote versão da ISO e confira seu tamanho no Explorador.

## 2. Grave o pendrive, revisando o destino

Siga o [tutorial Ubuntu para Rufus](https://ubuntu.com/tutorials/create-a-usb-stick-on-windows). A sequência de interface é: abrir Rufus, escolher o **dispositivo pendrive**, selecionar a ISO, revisar as opções recomendadas para o computador e iniciar. Se surgir uma pergunta de modo de escrita, use o recomendado pelo tutorial para aquela imagem.

Antes de aceitar o aviso de apagar, leia o nome e a capacidade do dispositivo. Se aparecem várias unidades ou a capacidade é a do seu disco de trabalho, cancele e identifique fisicamente o pendrive. Não use um `/dev/sdX` genérico ou comandos `dd` como atalho para este exercício.

Espere o gravador terminar e informar estado pronto. Não remova durante a escrita. Esse processo prepara a mídia; ainda não modificou o telefone nem o sistema do disco do computador.

## 3. Entre no menu de boot temporário

Salve seu trabalho no Windows e desligue/reinicie pelo procedimento normal. Com o pendrive conectado, use a tecla do **menu de inicialização temporário** descrita no manual do modelo do computador. Teclas como F12 ou Esc são exemplos, não uma combinação universal. Procure na página do fabricante por “boot menu” e o modelo exato.

Escolha a entrada USB/UEFI correspondente ao pendrive. Se volta direto ao Windows, o pendrive pode não ter sido selecionado ou o boot externo pode estar indisponível; consulte o manual antes de mudar parâmetros do firmware.

**Verificação:** surge o ambiente de boot Ubuntu, e não Android/Fastboot. Estamos trabalhando no notebook. A forma do menu Ubuntu varia por versão; o [guia oficial de instalação](https://ubuntu.com/tutorials/install-ubuntu-desktop) mostra o caminho de inicialização.

## 4. Escolha experimentar, não instalar no disco

Ao chegar à escolha inicial, selecione **Experimentar Ubuntu / Try Ubuntu**, conforme idioma/versão. Não avance para particionamento nem escolha “Erase disk”. Se a versão abre uma janela de boas-vindas/instalador sobre o desktop, procure a opção de experimentar e encerre o instalador quando apropriado.

Conecte Wi-Fi pela área de rede da interface. Abra Terminal/Console pela pesquisa de aplicativos. Execute estas consultas no notebook:

```bash
cat /etc/os-release
uname -m
df -h "$HOME"
free -h
```

Você deve ver identificação Ubuntu, arquitetura, espaço e memória disponíveis. O espaço na sessão live pode ser sustentado por memória; o tamanho do SSD não significa que a pasta de trabalho da sessão tenha esse espaço livre. **Não** escolha outro disco como destino sem conferir onde ele está montado e se pode receber esses dados.

## 5. Instale somente as ferramentas da próxima página

Na sessão live com internet, uma primeira preparação possível é:

```bash
sudo apt update
sudo apt install git adb fastboot usbutils
```

`apt update` busca o índice; `apt install` mostra os pacotes e pede confirmação quando necessário. Escolha dependências adicionais no tutorial [pmbootstrap](../nativo/postmarketos-pmbootstrap.md), se esse for o próximo passo. Se a sessão pede uma senha que você não conhece, consulte o modo/versão utilizada; não adote uma “senha Linux” encontrada em fórum.

Confirme instalações:

```bash
git --version
adb version
fastboot --version
lsusb
```

Consultas não gravam o telefone. A configuração de regras USB pode exigir acesso de grupo/sessão conforme [ADB](../preparacao/adb-fastboot.md). Recarregar regras não concede autorização na tela do Android.

## 6. Entenda o limite antes de gerar uma imagem

Sessão live comum não é armazenamento persistente. Programas instalados, downloads, chaves e arquivos podem desaparecer ao reiniciar. pmbootstrap exige espaço para ambientes de construção, rootfs e exportações; confirme os requisitos do manual e reserve **armazenamento persistente suficiente** para essa etapa. Não prometa construir uma imagem grande só com a memória livre de um notebook pequeno.

Guarde anotações, backups e artefatos conferidos em uma unidade externa claramente identificada ou outro destino persistente. Uma instalação permanente de Linux ou uma mídia persistente bem preparada pode ser mais apropriada para desenvolvimento prolongado; isso é outra operação, com planejamento de discos próprio.

## Erros comuns

| Situação | Verificação e alternativa |
| --- | --- |
| ISO não cabe no pendrive | Confira tamanho e capacidade; use mídia maior |
| USB não aparece no menu | Confira gravação e política/manual do notebook |
| Linux inicia sem Wi-Fi | Suporte do adaptador pode faltar; use conexão compatível ou outro computador |
| Falta espaço durante preparação | Pare antes de flash; mova trabalho por procedimento documentado para armazenamento persistente |
| ADB encontra, Fastboot não | Os modos apresentam interfaces USB diferentes; veja guia ADB |
| Configuração sumiu após reiniciar | Sessão não era persistente; restaure arquivos guardados externamente |

## Volte ao sistema original e confira

Feche os programas, copie os dados que pretende conservar e desligue o Ubuntu pela interface. Retire o pendrive e ligue o computador. Ele deve voltar ao sistema do disco se você não alterou a instalação ou a ordem permanente de boot.

Você concluiu o teste quando consegue iniciar a sessão live, consultar sua versão, usar a rede e voltar ao Windows. Isso confirma **o computador de preparação**, não a compatibilidade Linux do telefone. Continue no tutorial escolhido com seu inventário e plano de recuperação.

## Fontes e verificação

Revisão documental em **11/10/2026**; não houve boot físico de pendrive nesta rodada. Fontes: [download/requisitos Ubuntu](https://ubuntu.com/download/desktop), [Rufus](https://rufus.ie/pt_BR/), [gravador com Windows](https://ubuntu.com/tutorials/create-a-usb-stick-on-windows), [instalação/experiência Ubuntu](https://ubuntu.com/tutorials/install-ubuntu-desktop) e [autenticidade da ISO](https://ubuntu.com/tutorials/how-to-verify-ubuntu). O menu de boot precisa do manual do seu computador.
