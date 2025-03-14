export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "工具箱",
  description: "实用的在线工具集合",
  navItems: [
    {
      label: "工具列表",
      href: "/",
    },
    {
      label: "黄金计算器",
      href: "/gold-calculator",
    },
  ],
  navMenuItems: [
    {
      label: "工具列表",
      href: "/",
    },
    {
      label: "黄金计算器",
      href: "/gold-calculator",
    },
  ],
  links: {
    github: "https://github.com/frontio-ai/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
