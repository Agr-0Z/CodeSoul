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
        "HTML",
        "Sass",
        "PostCSS",
        "CSS Modules",
        "MDX",
        "Redux",
        "React Router",
        "响应式",
        "SEO",
      ],
    },
    {
      name: "后端",
      tags: ["Node.js", "Python", "REST API", "MySQL", "Redis", "WebSocket"],
    },
    {
      name: "代码管理",
      tags: ["Git", "GitHub", "GitLab", "Pull Request", "Code Review"],
    },
    {
      name: "工程化",
      tags: ["Markdown", "ESLint", "Prettier", "npm", "pnpm", "yarn", "tsconfig"],
    },
    {
      name: "测试",
      tags: ["Jest", "Storybook"],
    },
    {
      name: "部署上线",
      tags: ["Vercel", "Docker"],
    },
  ] satisfies Skill[],
  projects: [
    {
      name: "Ascend",
      summary:
        "本地优先的 AI 公考学习工作台。单用户、无账号，计划、时政、考点与模块打卡已可用；数据/统计仍为占位。目前完成第一期。",
      tags: ["TypeScript", "Next.js", "Prisma", "SQLite"],
      url: "https://github.com/Agr-0Z/ascend",
    },
    {
      name: "灵枢·智搜",
      summary: "本地优先的典籍方剂检索器。无后端，语料来自仓库 data/，检索不依赖网络。",
      tags: ["TypeScript", "Vite", "Vitest", "Python"],
      url: "https://github.com/Agr-0Z/LingShuOracle",
    },
  ] satisfies Project[],
  resume: {
    title: "简历",
    subtitle: "PDF 预览，也可下载。",
    download: "下载 PDF",
    loading: "正在加载简历…",
    error: "预览加载失败，请下载 PDF 查看。",
    missing: "简历文件还没放进来。把 PDF 放到下面这个路径，刷新即可。",
    fileHint: "public/resume.pdf",
  },
  contact: {
    title: "打个招呼",
    subtitle: "GitHub 或邮箱即可。",
    body: ["GitHub：Agr-0Z", "邮箱：Mr_ZouDingGuo@163.com"],
  },
};
