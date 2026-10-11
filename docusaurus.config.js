const {themes} = require('prism-react-renderer');
const repository = process.env.GITHUB_REPOSITORY;
const [owner, repo] = (repository || '').split('/');
const baseUrl = process.env.DOCUSAURUS_BASE_URL || '/';
if (!baseUrl.startsWith('/') || !baseUrl.endsWith('/')) {
  throw new Error('DOCUSAURUS_BASE_URL precisa começar e terminar com /');
}
module.exports = {
  title: 'Celular → Linux',
  tagline: 'Um novo trabalho para o seu smartphone.',
  url: process.env.DOCUSAURUS_URL || 'http://localhost:3000',
  baseUrl,
  favicon: 'img/logo.svg',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {mermaid: true, hooks: {onBrokenMarkdownLinks: 'throw'}},
  i18n: {defaultLocale: 'pt-BR', locales: ['pt-BR']},
  presets: [['classic', {
    docs: {
      sidebarPath: require.resolve('./sidebars.js'),
      showLastUpdateTime: false,
      editUrl: repository ? `https://github.com/${owner}/${repo}/edit/main/` : undefined,
    },
    blog: false,
    theme: {customCss: require.resolve('./src/css/custom.css')},
  }]],
  themes: [
    '@docusaurus/theme-mermaid',
    ['@easyops-cn/docusaurus-search-local', {
      hashed: 'filename', language: ['pt', 'en'], indexBlog: false, indexPages: true,
      highlightSearchTermsOnTargetPage: true, searchResultLimits: 10,
      searchBarShortcutHint: true,
    }],
  ],
  themeConfig: {
    image: 'img/social-card.svg',
    colorMode: {defaultMode: 'light', respectPrefersColorScheme: true},
    navbar: {
      title: 'Celular → Linux', logo: {alt: '', src: 'img/logo.svg'},
      items: [
        {type: 'docSidebar', sidebarId: 'guide', position: 'left', label: 'Documentação'},
        {to: '/docs/comece-aqui/do-zero/', label: 'Do zero', position: 'left'},
        {to: '/docs/comece-aqui/minha-trilha/', label: 'Minha trilha', position: 'left'},
        {to: '/docs/aulas/biblioteca/', label: 'Aulas', position: 'left'},
        {to: '/docs/escolha/', label: 'Escolha seu caminho', position: 'left'},
        {to: '/docs/comunidade/contribuir/', label: 'Contribua', position: 'right'},
        ...(repository ? [{href: `https://github.com/${repository}`, label: 'GitHub', position: 'right'}] : []),
      ],
    },
    footer: {style: 'dark', links: [
      {title: 'Comece', items: [{label: 'Trilha do zero', to: '/docs/comece-aqui/do-zero/'}, {label: 'Downloads e ferramentas', to: '/docs/comece-aqui/downloads/'}, {label: 'Assistente de decisão', to: '/docs/escolha/'}]},
      {title: 'Aprenda', items: [{label: 'Biblioteca de aulas', to: '/docs/aulas/biblioteca/'}, {label: 'Ficha de bancada', to: '/docs/diagnostico/ficha-evidencias/'}, {label: 'Conceitos fundamentais', to: '/docs/fundamentos/linux-android/'}, {label: 'Perguntas frequentes', to: '/docs/faq/'}]},
      {title: 'Construa junto', items: [{label: 'Contribuições', to: '/docs/comunidade/contribuir/'}, {label: 'Fontes e critérios', to: '/docs/comunidade/fontes/'}]},
    ], copyright: 'Conteúdo CC BY-SA 4.0 · Código MIT · Sem telemetria própria'},
    prism: {theme: themes.github, darkTheme: themes.dracula, additionalLanguages: ['bash', 'powershell', 'json', 'python', 'cpp', 'ini', 'yaml', 'docker', 'diff', 'nginx']},
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 3},
    mermaid: {theme: {light: 'neutral', dark: 'dark'}},
    metadata: [{name: 'theme-color', content: '#167867'}],
  },
};
