export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: '工具箱',
  description: '实用的在线工具集合',
  navItems: [
    {
      label: '工具箱',
      href: '/',
      icon: '/toolbox.svg',
    },
    {
      label: '黄金计算器',
      href: '/gold-calculator',
      icon: '/gold.svg',
    },
  ],
  links: {
    github: 'https://github.com/sakuraNouta/prompt-tools',
    docs: 'https://heroui.com',
  },
};
