---
title: Wi-Fi, firmware, endereço e acesso estável
description: Diagnostique interface, associação, DHCP, rota, DNS e perda de conexão.
sidebar_position: 5
last_verified: '2026-10-10'
---

Um ícone de Wi-Fi ou a descoberta de uma rede não comprovam acesso IP. Para manutenção do mini-PC, uma conexão estável é essencial: com a única porta USB ocupada pelo hub, ela pode ser o único meio de ler registros sem alterar a montagem.

**Escopo:** Linux nativo com NetworkManager ou outra pilha identificada. **Dificuldade:** básica a intermediária. **Resultado:** conexão persistente e diagnóstico separado de driver, autenticação, DHCP, roteamento e DNS. **Materiais:** credenciais de uma rede autorizada, acesso local ou USB de manutenção e terminal. Não publique SSID pessoal, senha, MAC ou endereço de rede dos registros.

## Identifique quem administra a rede

**Primeira vez?** Faça primeiro o [roteiro visual de Wi-Fi no GNOME](../desktop/primeira-configuracao.md). Se vai usar terminal, siga a [instalação das ferramentas de diagnóstico](../diagnostico/instalar-ferramentas.md) para `ip`, `nmcli`, `rfkill` e `rg`. Não confunda instalar um cliente de consulta com substituir o gerenciador que já controla a rede.

```sh
ip -br link
ip -br address
nmcli --version
nmcli device status
rfkill list
```

`ip` mostra interfaces e endereços; `nmcli` conversa com NetworkManager. Se ele não existir ou o daemon não estiver ativo, identifique `iwd`, `wpa_supplicant`, ConnMan ou configuração específica do port. Não inicie simultaneamente dois gerenciadores na mesma interface. No PRoot, o ambiente usa a rede Android; instalar NetworkManager no guest não transfere o controle do chip Wi-Fi.

## Conectar sem expor a senha

No NetworkManager, prefira o painel GNOME ou:

```sh
nmcli radio wifi
nmcli device wifi list
nmcli --ask device wifi connect 'NOME_DA_REDE'
```

Troque o nome pelo SSID real. `--ask` solicita credenciais sem incluí-las no histórico do shell. O comando modifica o estado e cria/ativa um perfil; faça-o pela interface de manutenção que não será derrubada. Confira:

```sh
nmcli connection show --active
ip route
```

Uma conexão compartilhada no sistema pode requerer autenticação Polkit. Falhas de autorização não são falhas do rádio. Em redes de faculdade/empresa com 802.1X, siga a configuração institucional de EAP, identidade e certificado CA; **não desative validação do servidor** para fazer conectar. Rede com portal cativo também exige autenticação além do Wi-Fi.

## Teste cada etapa

1. **Interface ausente:** procure driver/firmware com `sudo dmesg | rg -i 'wifi|wlan|ath|brcm|firmware'`. Identifique o chip pela documentação, DT e driver associado. O firmware exigido pode não ser o mesmo arquivo usado por outro aparelho com SoC semelhante.
2. **Interface presente, rede ausente:** confira bloqueio, bandas suportadas, região regulatória legítima e proximidade. Não force país incorreto ou potência maior. `iw dev` e `iw phy` consultam recursos quando a ferramenta e driver usam cfg80211.
3. **Associação falha:** leia motivo de autenticação. Verifique senha e método WPA/Enterprise, sem publicá-los. Uma rede WPA3 pode exigir suporte do driver/firmware que não existe no port.
4. **Conectou sem endereço:** `ip -br address` deve mostrar endereço atribuído. Consulte registros de DHCP no gerenciador. Não escolha um IP fixo aleatório: pode colidir com outro cliente.
5. **Endereço sem rota:** `ip route` deve ter rota apropriada para o destino. Confirme gateway fornecido pela rede; roteadores podem bloquear comunicação entre clientes.
6. **Rota sem nomes:** `getent hosts example.org` consulta resolução. Confira `/etc/resolv.conf` e quem o administra, sem sobrescrevê-lo por um DNS público como primeira medida.

Um teste HTTP autorizado, por exemplo `curl -I https://example.org`, ajuda a verificar DNS/TCP/TLS. Ele não garante velocidade, ausência de portal cativo ou conectividade de todas as aplicações. Ping pode ser bloqueado mesmo com HTTP funcionando.

## Perdas, economia e SSH

Registre horário e uptime das quedas, proximidade do roteador, banda, bateria e atividade térmica. Falha ao desligar tela pode ser economia de energia, suspensão ou reset do firmware. Compare logs antes de desativar recursos. NetworkManager expõe propriedades por perfil: consulte `nmcli connection show 'PERFIL'` e a documentação da sua versão antes de alterar `802-11-wireless.powersave`.

Para manutenção previsível, uma reserva DHCP no roteador evita depender de endereço escolhido pelo cliente. mDNS com `.local` depende de serviço e rede que permitam multicast. SSH não atravessa automaticamente redes domésticas/faculdade ou NAT; acesso pela internet requer um caminho protegido, como VPN, e não simplesmente abrir a porta 22.

## Persistência e reversão

Perfis do NetworkManager podem ativar automaticamente. Confira essa propriedade no perfil, não crie cron jobs repetindo senha. Faça backup privado dos arquivos de configuração antes de editar. Use ferramentas do gerenciador para remover **apenas o perfil de teste** se precisar reverter; preservar um perfil funcional é crucial com tela quebrada.

Teste boot, ociosidade, monitor ligado/desligado e recuperação após reiniciar o ponto de acesso, quando autorizado. Confirme SSH e uso cotidiano. Se o driver ainda falha, documente logs e limites; adaptador USB Wi-Fi compatível pode ser uma alternativa, consumindo porta e energia.

**Fontes e verificação:** **2026-10-10**; [nmcli](https://networkmanager.dev/docs/api/latest/nmcli.html), [perfis de conexão](https://networkmanager.dev/docs/api/latest/nm-settings-nmcli.html), [NetworkManager.conf](https://networkmanager.dev/docs/api/latest/NetworkManager.conf.html), [Linux wireless](https://wireless.docs.kernel.org/en/latest/). Nenhuma credencial do projeto original é incluída.
