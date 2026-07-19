# AI Learning

AI 学习课程材料网站，按课程日期整理互动页面、学生材料和相关资源。

## 在线访问

仓库启用 GitHub Pages 后，可通过以下地址访问：

<https://aw-best.github.io/AI-Learning/>

## 课程内容

| 日期 | 内容 |
| --- | --- |
| 2026.06.14 | 学生材料、Falcon Timeline、Museum Edition |
| 2026.06.21 | 学生材料与配套图片 |
| 2026.06.28 | 学生材料 |
| 2026.07.12 | Prompt 调试课 |
| 2026.07.19 | 学生材料 |

## 使用方法

直接打开根目录的 `index.html`，然后选择相应日期和课程。也可以启动本地静态文件服务器：

```bash
python -m http.server 8000
```

随后访问 <http://localhost:8000>。

## 项目结构

```text
AI-Learning/
├── index.html       # 网站首页
├── 2026.06.14/      # 按日期整理的课程材料
├── 2026.6.21/
├── 2026.6.28/
├── 2026.7.12/
└── 2026.7.19/
```

## 发布到 GitHub Pages

在仓库的 **Settings → Pages** 中，将来源设置为 **Deploy from a branch**，选择 `main` 分支和根目录 `/ (root)`，保存后等待部署完成。
