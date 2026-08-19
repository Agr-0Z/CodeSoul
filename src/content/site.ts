export type Stat = {
  value: string;
  label: string;
};

export type Skill = {
  name: string;
  tags: string[];
};

export type Project = {
  name: string;
  summary: string;
  tags: string[];
  url: string;
};

export const site = {
  name: "CodeSoul",
  description: "技术、设计，介于两者之间的一切",
  about: {
    chip: "关于我",
    title: "了解一下我",
    subtitle: "技术、设计，介于两者之间的一切",
    welcomeTitle: "欢迎来到我的博客网站",
    welcome: [
      "我是程序员，更在意把事情做干净：代码能读，界面也能读。CodeSoul 是个人站点，用来放实现笔记、工具选择，以及一些对「少即是多」的实践。",
      ,
    ],
  },
  stats: [
    { value: "5+", label: "年经验" },
    { value: "5", label: "项目构建" },
    { value: "100K+", label: "行代码" },
    { value: "10+", label: "技术栈" },
  ] satisfies Stat[],
  skills: [
    {
      name: "前端",
      tags: [
        "React",
        "TypeScript",
        "JavaScript",
        "CSS",
        "Next.js",
        "Tailwind CSS",
        "Webpack",
        "Html",
      ],
    },
    {
      name: "后端",
      tags: ["Node.js", "Python"],
    },
    {
      name: "代码管理",
      tags: ["Git", "GitHub", "GitLab"],
    },
    {
      name: "工程化",
      tags: ["Next.js", "Markdown", "Vercel", "Docker"],
    },
  ] satisfies Skill[],
  projects: [
    {
      name: "灵枢·智搜",
      summary: "本地优先的典籍方剂检索器。无后端，语料来自仓库 data/，检索不依赖网络。",
      tags: ["TypeScript", "Vite", "Vitest", "Python"],
      url: "https://github.com/Agr-0Z/LingShuOracle",
    },
  ] satisfies Project[],
  contact: {
    title: "打个招呼",
    subtitle: "GitHub 或邮箱即可。",
    body: [
      "GitHub：Agr-0Z",
      "邮箱：Mr_ZouDingGuo@163.com"
    ],
  },
};
