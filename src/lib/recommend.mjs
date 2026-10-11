export const paths = {
  inventory: {title: 'Investigue a compatibilidade primeiro', href: '/docs/compatibilidade/inventario/'},
  termux: {title: 'Termux: terminal Linux mantendo Android', href: '/docs/android/termux/'},
  proot: {title: 'Linux sobre Android com PRoot', href: '/docs/android/proot-distro/'},
  chroot: {title: 'Chroot com root: caminho avançado', href: '/docs/android/chroot/'},
  native: {title: 'Avalie uma instalação Linux nativa documentada', href: '/docs/nativo/visao-geral/'},
  existing: {title: 'Configure o Linux nativo que já está acessível', href: '/docs/desktop/gnome-nativo/'},
  containers: {title: 'Avalie os requisitos para containers reais', href: '/docs/projetos/containers/'},
  recovery: {title: 'Recupere primeiro um meio de controle', href: '/docs/diagnostico/tela-quebrada/'},
};

// Este mecanismo NÃO é um catálogo de compatibilidade. As respostas são declarações
// do leitor; até uma recomendação nativa exige validar o guia exato antes de escrever.
export function recommend(a = {}) {
  const reasons = [], warnings = [], next = [];
  let primary = 'inventory';
  const androidReady = a.androidAccess === 'yes';
  const wantsNative = a.intent === 'replace';
  const controlReady = androidReady || a.adb === 'authorized' || ['ssh', 'boot'].includes(a.alternateAccess);
  const identityReady = Boolean(a.model?.trim()) && ['arm64', 'arm32', 'x86'].includes(a.arch);
  const nativeReady = identityReady && controlReady && a.support === 'documented' && a.unlock === 'yes'
    && a.kernel === 'documented' && a.requiredHardware === 'yes'
    && a.backup === 'yes' && a.recovery === 'yes';
  if (!identityReady) warnings.push('Falta identificar o modelo/variante exatos e a arquitetura do sistema. O processador sozinho não basta.');
  if (!controlReady) {
    primary = 'recovery';
    reasons.push('Ainda não há um meio de controle confirmado: Android acessível, ADB autorizado, SSH no Linux nativo ou modo de manutenção validado.');
  } else if (wantsNative) {
    if (nativeReady) {
      primary = 'native';
      reasons.push('Você declarou suporte publicado ao modelo e versão, bootloader desbloqueável, kernel/hardware necessários e recuperação preparada.');
      warnings.push('Isto permite avaliar o guia do port; não certifica suporte nem autoriza um comando de flash. Confira variantes, firmware exigido e partições na fonte.');
    } else {
      primary = 'inventory';
      reasons.push('Substituir o Android exige evidências que ainda não foram confirmadas. A instalação nativa não foi recomendada.');
      if (a.support !== 'documented') warnings.push('Não há um port documentado confirmado. Um SoC parecido ou uma imagem ARM64 genérica não são substitutos.');
      if (a.unlock !== 'yes') warnings.push('Desbloqueio do bootloader não confirmado: root e ADB não removem essa restrição.');
      if (a.kernel !== 'documented' || a.requiredHardware !== 'yes') warnings.push('Confirme kernel, drivers e as funções indispensáveis ao seu uso no port escolhido.');
      if (a.backup !== 'yes' || a.recovery !== 'yes') warnings.push('Prepare backup externo e restauração documentada antes de alterar o boot.');
      if (androidReady) next.push('termux', a.goal === 'containers' ? 'containers' : 'proot');
    }
  } else if (androidReady) {
    primary = a.goal === 'containers' ? 'containers' : a.goal === 'terminal' || a.goal === 'server' ? 'termux' : 'proot';
    reasons.push('Android permanece responsável pelo kernel e pelos drivers. Este caminho não exige desbloquear o bootloader.');
    if (primary === 'proot') warnings.push('PRoot não substitui o Android, não fornece um kernel próprio e não equivale ao isolamento de Docker.');
    if (a.root === 'yes') next.push('chroot');
    if (nativeReady && a.intent === 'explore') next.push('native');
  } else if (a.alternateAccess === 'ssh' && !wantsNative) {
    primary = a.goal === 'containers' ? 'containers' : 'existing';
    reasons.push('Você declarou SSH funcional num Linux nativo já instalado. Identifique a distribuição e seus serviços antes de preparar outra instalação.');
  } else {
    primary = 'recovery';
    reasons.push('Recupere o acesso ao Android ou confirme outro canal antes de instalar aplicativos ou preparar uma migração.');
  }
  if (a.video !== 'documented') warnings.push('Saída de vídeo USB-C não confirmada. Considere a tela do aparelho ou acesso remoto; USB-C e USB 3 não comprovam DisplayPort.');
  if (a.screen === 'broken') warnings.push('Teste uma forma alternativa de controle e recuperação que continue funcionando após reiniciar, sem depender de aprovar algo na tela quebrada.');
  if (a.touch === 'no') warnings.push('Touchscreen indisponível: valide mouse/teclado, acessibilidade ou controle remoto antes de mudar o sistema.');
  if (a.adb !== 'authorized') warnings.push('ADB ainda não autorizado. Ativar a depuração pode exigir confirmação visível no Android.');
  if (a.goal === 'containers') warnings.push('Containers reais dependem de namespaces, cgroups, rede e suporte do kernel. Root, ARM64 ou PRoot não comprovam esses requisitos.');
  if (a.goal === 'ai') warnings.push('Modelos de IA exigem memória disponível, suporte ARM e controle térmico; NPU/GPU Android podem não ter backend Linux compatível.');
  if (a.intent === 'keep' && primary === 'native') throw new Error('Invariante: preservar Android não recomenda substituir o sistema');
  return {primary: {...paths[primary], key: primary}, reasons, warnings: [...new Set(warnings)], alternatives: [...new Set(next)].map(k => ({...paths[k], key: k})), readyForNativeEvaluation: nativeReady, checkedAt: '2026-10-10'};
}
