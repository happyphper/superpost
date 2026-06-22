<template>
  <main class="workspace-shell">
    <header class="app-header">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <img src="/superpost-mark.svg?v=purple" alt="" />
        </div>
        <div>
          <h1>SuperPost</h1>
          <p>把 Markdown 一键排成公众号好文</p>
        </div>
      </div>

      <div class="header-actions">
        <el-button
          class="ai-assistant-button"
          type="primary"
          :disabled="!activeFormattedHtml"
          @click="copyFormattedHtml"
        >
          <el-icon><DocumentCopy /></el-icon>
          复制
        </el-button>
      </div>
    </header>

    <section class="content formatter-content">
      <section class="formatter-layout">
        <section ref="editorPanel" class="panel formatter-editor-panel glass-panel">
          <div class="panel-heading">
            <div class="panel-title">
              <div class="preview-switch editor-switch" role="group" aria-label="编辑器模式">
                <button
                  v-for="option in editorModeOptions"
                  :key="option.value"
                  :class="{ 'is-active': activeEditorTab === option.value }"
                  type="button"
                  @click="switchEditorTab(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
            <div class="panel-meta editor-tools">
              <button
                class="option-chip"
                :class="{ 'is-active': showGridBackground }"
                type="button"
                :aria-pressed="showGridBackground"
                @click="showGridBackground = !showGridBackground"
              >
                格子背景
              </button>
              <button
                class="option-chip"
                :class="{ 'is-active': showFigureNumbers }"
                type="button"
                :aria-pressed="showFigureNumbers"
                @click="showFigureNumbers = !showFigureNumbers"
              >
                图表序号
              </button>
              <button
                class="option-chip"
                :class="{ 'is-active': showSectionNumbers }"
                type="button"
                :aria-pressed="showSectionNumbers"
                @click="showSectionNumbers = !showSectionNumbers"
              >
                章节序号
              </button>
              <div class="editor-meta">
                <span>{{ activeMarkdownStats.words }} 字</span>
                <span>{{ activeMarkdownStats.lines }} 行</span>
              </div>
            </div>
          </div>

          <el-tabs v-model="activeEditorTab" class="editor-tabs" @tab-change="handleEditorTabChange">
            <el-tab-pane label="编辑" name="write">
              <div class="editor-code-shell">
                <div class="line-number-gutter" aria-hidden="true">
                  <span v-for="line in markdownLineNumbers" :key="line">{{ line }}</span>
                </div>
                <el-input
                  ref="markdownEditor"
                  v-model="markdownText"
                  type="textarea"
                  resize="none"
                  placeholder="在这里粘贴 Markdown，或选择 .md 文件"
                  @input="handleMarkdownInput"
                  @paste="handleEditorPaste"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="示例" name="example">
              <div class="editor-code-shell">
                <div class="line-number-gutter" aria-hidden="true">
                  <span v-for="line in exampleLineNumbers" :key="line">{{ line }}</span>
                </div>
                <el-input
                  v-model="exampleMarkdownText"
                  type="textarea"
                  resize="none"
                  class="example-source-input"
                  @input="handleMarkdownInput"
                  @paste="handleEditorPaste"
                />
              </div>
            </el-tab-pane>
          </el-tabs>

        </section>

        <section class="panel formatter-preview-panel glass-panel">
          <div class="panel-heading">
            <div class="panel-title">
              <div class="preview-switch" role="group" aria-label="预览模式">
                <button
                  v-for="option in previewModeOptions"
                  :key="option.value"
                  :class="{ 'is-active': previewMode === option.value }"
                  type="button"
                  @click="previewMode = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
            <div class="panel-meta"></div>
          </div>
          <div
            v-if="activeFormattedHtml"
            class="wechat-preview-stage"
            :class="`wechat-preview--${previewMode}`"
          >
            <div class="device-frame" :class="`device-frame--${previewMode}`">
              <div
                ref="wechatPreview"
                class="wechat-preview-scroll"
                @scroll="handlePreviewScroll"
              >
                <article
                  class="wechat-preview-device"
                  v-html="activeFormattedHtml"
                ></article>
              </div>
            </div>
          </div>
          <el-empty v-else description="生成后显示公众号排版预览" />
        </section>
      </section>

    </section>

    <footer class="app-footer">
      <p class="app-footer-text">
        <span>©2026 SuperPost All Rights Reserved 码龙</span>
        <a
          class="footer-record-link"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
        >
          京ICP备2023017370号-1
        </a>
      </p>
      <nav class="footer-socials" aria-label="页脚链接">
        <a
          class="footer-social footer-social--github"
          href="https://github.com/happyphper/superpost"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.2a10 10 0 0 0-3.16 19.49c.5.09.68-.21.68-.48v-1.7c-2.78.61-3.37-1.19-3.37-1.19-.45-1.15-1.1-1.46-1.1-1.46-.9-.61.07-.6.07-.6 1 .07 1.53 1.04 1.53 1.04.88 1.51 2.32 1.07 2.88.82.09-.64.35-1.07.63-1.32-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.24c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2.2Z" />
          </svg>
          <span>GitHub</span>
        </a>
        <div class="footer-wechat-entry">
          <button
            class="footer-social footer-social--wechat"
            type="button"
            aria-label="微信公众号"
            @click.stop="toggleFooterQr('official')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.3 5.16c-3.7 0-6.72 2.43-6.72 5.44 0 1.73 1 3.27 2.56 4.26l-.58 1.78 2.13-1.04c.78.28 1.66.44 2.61.44.31 0 .61-.02.91-.05a5.06 5.06 0 0 1-.18-1.35c0-2.88 2.76-5.22 6.17-5.22.24 0 .47.01.7.04-.64-2.46-3.74-4.3-7.6-4.3Zm-2.19 3.16c.52 0 .94.39.94.86 0 .48-.42.87-.94.87s-.94-.39-.94-.87c0-.47.42-.86.94-.86Zm4.43 0c.52 0 .94.39.94.86 0 .48-.42.87-.94.87s-.94-.39-.94-.87c0-.47.42-.86.94-.86Zm4.66 2.22c-3 0-5.43 1.94-5.43 4.34s2.43 4.34 5.43 4.34c.72 0 1.41-.11 2.04-.31l1.7.85-.45-1.46c1.29-.78 2.14-2.02 2.14-3.42 0-2.4-2.43-4.34-5.43-4.34Zm-1.77 2.61c.42 0 .77.32.77.72 0 .39-.35.71-.77.71s-.76-.32-.76-.71c0-.4.34-.72.76-.72Zm3.6 0c.43 0 .77.32.77.72 0 .39-.34.71-.77.71s-.76-.32-.76-.71c0-.4.34-.72.76-.72Z" />
            </svg>
            <span>公众号</span>
          </button>
          <div v-if="activeFooterQr === 'official'" class="wechat-qr-popover" @click.stop>
            <img src="/wechat-official-account.jpg" alt="SuperPost 微信公众号二维码" />
            <p>扫码关注微信公众号</p>
          </div>
        </div>
        <div class="footer-wechat-entry">
          <button
            class="footer-social footer-social--wechat-group"
            type="button"
            aria-label="微信群"
            @click.stop="toggleFooterQr('group')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.9 4.4a4.05 4.05 0 0 1 3.82 5.4 5.95 5.95 0 0 0-2.36 2.05 5.45 5.45 0 0 1-1.46.2 3.85 3.85 0 0 1-1.07-.14 5.91 5.91 0 0 0-3.8 2.35.82.82 0 0 1-1.46-.52 6.34 6.34 0 0 1 3.1-4.98A4.05 4.05 0 0 1 8.9 4.4Zm6.16 6.34a3.56 3.56 0 0 1 3.34 4.77 5.6 5.6 0 0 1 2.65 4.39.78.78 0 0 1-1.4.49 5.2 5.2 0 0 0-3.33-2.06 3.84 3.84 0 0 1-2.52 0 5.2 5.2 0 0 0-3.33 2.06.78.78 0 0 1-1.4-.49 5.6 5.6 0 0 1 2.65-4.39 3.56 3.56 0 0 1 3.34-4.77Z" />
            </svg>
            <span>微信群</span>
          </button>
          <div v-if="activeFooterQr === 'group'" class="wechat-qr-popover wechat-qr-popover--group" @click.stop>
            <img src="/wechat-group.jpg" alt="码龙技术合作变现群二维码" />
            <p>扫码加入微信群</p>
          </div>
        </div>
        <a
          class="footer-social footer-social--website"
          href="https://www.longbao.wang"
          target="_blank"
          rel="noreferrer"
          aria-label="个人网站"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5Zm6.96 8.39h-3.2a14.37 14.37 0 0 0-1.13-5.02 7.5 7.5 0 0 1 4.33 5.02Zm-5.2 0h-3.52c.11-2.1.63-4.01 1.48-5.44.1-.17.19-.31.28-.43.09.12.18.26.28.43.85 1.43 1.37 3.34 1.48 5.44Zm-5.52 0h-3.2a7.5 7.5 0 0 1 4.33-5.02 14.37 14.37 0 0 0-1.13 5.02Zm-3.2 1.72h3.2c.1 1.9.53 3.65 1.18 5.02a7.5 7.5 0 0 1-4.38-5.02Zm5.2 0h3.52c-.11 2.1-.63 4.01-1.48 5.44-.1.17-.19.31-.28.43-.09-.12-.18-.26-.28-.43-.85-1.43-1.37-3.34-1.48-5.44Zm4.34 5.02c.65-1.37 1.08-3.12 1.18-5.02h3.2a7.5 7.5 0 0 1-4.38 5.02Z" />
          </svg>
          <span>个人网站</span>
        </a>
      </nav>
    </footer>

  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  DocumentCopy
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  applyWechatFontSize,
  formatMarkdownForWechat,
  wechatThemeOptions
} from '@/utils/wechatFormatter'

const formattingMarkdown = ref(false)
const editorPanel = ref<HTMLElement>()
const markdownEditor = ref<unknown>()
const wechatPreview = ref<HTMLElement>()
const syncingScroll = ref(false)
let formatTimer: number | undefined
const MARKDOWN_STORAGE_KEY = 'superpost.markdown'
const IMAGE_UPLOAD_ENDPOINT = 'https://img.scdn.io/api/v1.php'

const pinnedTheme = wechatThemeOptions[wechatThemeOptions.length - 1] || {
  label: 'Agent Builder 日报',
  value: 'agent_builder_daily'
}
const formatterTheme = ref(pinnedTheme.value)
const formatterFontSize = ref(16)
const showGridBackground = ref(true)
const showFigureNumbers = ref(false)
const showSectionNumbers = ref(false)
const activeFooterQr = ref<'official' | 'group' | null>(null)
const previewMode = ref('mobile')
const activeEditorTab = ref<'write' | 'example'>('write')
const previewModeOptions = [
  { label: '手机', value: 'mobile' },
  { label: '桌面', value: 'desktop' }
]
const editorModeOptions: Array<{ label: string; value: 'write' | 'example' }> = [
  { label: '编辑', value: 'write' },
  { label: '示例', value: 'example' }
]
const EXAMPLE_MARKDOWN = `:::header
DAILY SHARE / 2026.06.17
:::

![](https://edgeoneimg.cdn1.vip/i/6a3259b8dbf9c_1781684664.webp)

:::label:left
MORNING SHARE · 2026年6月16日
:::

:::title
SuperPost Markdown 公众号排版完整示例
:::

这是一份可以直接复制、修改、预览的 Markdown 示例。前半部分展示常见 Markdown 语法，后半部分集中展示 SuperPost 为微信公众号排版扩展的自定义语法。

[TOC]

## 一、标题

Markdown 使用 \`#\` 表示标题层级。公众号文章里建议主要使用一级、二级、三级标题，层级过深会影响移动端阅读。

如果希望使用带 SHARE 文案和渐变下划线的主视觉标题，可以使用 SuperPost 的 \`:::title\` 组件：

:::label:left
EVENING SHARE · 2026年6月16日
:::

:::title
这是一个主视觉标题
:::

# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

## 二、段落与换行

这是一个普通段落。段落之间建议保留清晰的语义分隔，而不是只依赖大量空行。

这是第二个段落。SuperPost 会尽量把文本转换成适合微信公众号编辑器粘贴的富文本结构。

如果需要在同一段中换行，可以在句尾保留两个空格。  
这是同一段里的下一行。

## 三、强调、斜体、删除线与行内代码

**这是粗体文字**

*这是斜体文字*

***这是粗体加斜体文字***

~~这是删除线文字~~

你也可以在正文中插入 \`inline code\`，适合展示变量名、命令、配置项或短代码。

## 四、链接

普通链接写法：[SuperPost GitHub](https://github.com/happyphper/superpost)

自动链接写法：https://www.longbao.wang

建议在公众号正文中给链接补充上下文，避免读者不知道点击后会去哪里。

## 五、引用

> 这是普通引用，适合放一段补充说明、摘要、金句或资料来源。

> 多个连续引用会自动合并到同一个引用块里。
> 这样更适合展示一组相关观点。

## 六、无序列表

- 先把问题讲清楚
- 再给出明确判断
- 最后给读者一个行动建议

嵌套列表示例：

- 内容选题
  - 读者痛点
  - 传播角度
- 文章结构
  - 开头钩子
  - 核心观点
  - 行动建议

## 七、有序列表

1. 明确读者是谁
2. 写出读者正在遇到的问题
3. 给出可执行的解决方案

嵌套有序列表示例：

1. 准备素材
   1. 标题
   2. 封面图
   3. 正文大纲
2. 开始排版
   1. 复制 Markdown
   2. 检查预览
   3. 粘贴到公众号后台

## 八、任务列表

- [x] 完成选题
- [x] 写好初稿
- [ ] 检查错别字
- [ ] 粘贴到公众号后台

## 九、表格

表格可以使用冒号控制对齐方式：

| 模块 | 作用 | 状态 |
| :--- | :---: | ---: |
| 选题 | 找到值得写的主题 | 已完成 |
| 排版 | 让文章适合移动端阅读 | 进行中 |
| 发布 | 复制富文本到公众号后台 | 待处理 |

## 十、图片

普通图片写法如下：

![示例配图](https://edgeoneimg.cdn1.vip/i/6a3259b8dbf9c_1781684664.webp)

图片建议使用稳定可访问的 HTTPS 链接。你也可以直接复制图片到编辑器中，SuperPost 会尝试自动上传并插入 Markdown 图片语法。

### 图床上传说明

SuperPost 已接入图床上传。你可以直接从剪贴板复制图片，然后粘贴到编辑器里，系统会自动上传图片，并在当前位置插入类似下面这样的 Markdown：

\`\`\`md
![](https://img.scdn.io/i/your-image-id.webp)
\`\`\`

上传完成前会显示上传状态；上传成功后，图片会自动出现在右侧预览中。公众号文章建议优先使用 HTTPS 图片地址，避免粘贴到公众号后台后图片失效。

## 十一、分割线

下面是一条分割线：

---

分割线适合用于切换段落节奏，但不建议在短文中频繁使用。

## 十二、代码块

行内代码适合短内容，例如 \`pnpm run build\`。

多行代码可以使用代码块：

\`\`\`js
// FileName: hello.js
function sayHello(name) {
  console.log(\`hello \${name}\`)
}

sayHello('wechat')
\`\`\`

\`\`\`java
// FileName: HelloWorld.java
public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
\`\`\`

## 十三、HTML

支持少量内联 HTML。复制到公众号前，建议尽量使用简单、稳定、微信编辑器支持的样式。

<span style="display:block;text-align:center;color:#4f46e5;font-weight:700;">这是一段居中的 HTML 文本</span>

<span style="display:block;text-align:right;color:orangered;">这是一段右对齐的 HTML 文本</span>

## 十四、数学公式

行内公式示例：$E = mc^2$

块级公式示例：

$$
D_{KL}(P||Q)=\\sum_i P(i)\\log\\frac{P(i)}{Q(i)}
$$

矩阵示例：

$$
\\begin{pmatrix}
1 & 2 & 3 \\\\
4 & 5 & 6 \\\\
7 & 8 & 9
\\end{pmatrix}
$$

## 十五、Mermaid 图表

\`\`\`mermaid
graph TD
  A[开始] --> B{是否支持公众号}
  B -->|支持| C[直接复制富文本]
  B -->|不支持 JS| D[生成静态 SVG]
  D --> E[粘贴到公众号]
  C --> E
\`\`\`

## 十六、横屏滑动图片

横屏滑动适合展示多张同主题图片，语法如下：

<![蓝图](https://markdown.com.cn/images/blue.jpg),![绿图](https://markdown.com.cn/images/green.jpg),![红图](https://markdown.com.cn/images/red.jpg)>

---

## 十七、SuperPost 自定义语法完整示例

下面这些语法是 SuperPost 为微信公众号排版扩展的能力。

### 1. 标签说明 label

\`:::label:left\`、\`:::label:center\`、\`:::label:right\` 可以为上方或下方的内容添加说明文字，位置以你写在 Markdown 中的位置为准。

:::label:left
图1 左对齐标签示例
:::

![示例配图](https://edgeoneimg.cdn1.vip/i/6a3259b8dbf9c_1781684664.webp)

:::label:center
表1 居中标签示例
:::

| 模块 | 作用 |
| :--- | :--- |
| label | 给图片、表格、引用等内容添加说明 |
| card | 创建强调卡片 |

:::label:right
右对齐标签也可以用于补充说明
:::

### 2. 卡片 card

:::card
这是一个信息卡片。适合放补充背景、温和提醒、操作提示，或者不需要强警告但希望读者留意的信息。

卡片支持多行内容。连续内容会被包裹在同一个卡片里。
:::

### 3. 彩色引用

> [primary] 适合放核心提示、主线判断、重要观点。

> [success]
> 适合放正向反馈、完成状态、推荐动作。

> [info] 适合放背景说明、阅读提示、补充信息。

> [warning]
> 适合提示风险、限制条件，或者需要读者特别注意的判断。

> [danger] 适合放错误风险、强警告、不可忽略的问题。

### 4. 图片行动卡片 img:card

:::img:card
![](https://edgeoneimg.cdn1.vip/i/6a3259b8dbf9c_1781684664.webp)
扫码获取《企业私域知识库和智能体构建白皮书》
立即扫码，免费下载深信服独家落地指南
:::

### 5. 页脚 footer

:::footer
@2026 AGENT BUILDER CO. DATA GOVERNANCE PROTOCOL
:::

### 6. TOC 目录

在文章任意位置写入 \`[TOC]\`，即可自动生成目录。公众号场景下建议目录不要过深，二级、三级标题最适合移动端阅读。

### 7. 图表序号与章节序号

顶部的“图表序号”开关可以自动为图片、表格标签补全图1、表1等序号。

顶部的“章节序号”开关可以自动为二级标题添加中文大写序号。

### 8. 格子背景

顶部的“格子背景”开关可以控制公众号文章是否展示网格底纹。关闭后文章会更接近纯白公众号正文；开启后更适合日、周报或技术分析类视觉风格。

### 9. 顶部头图信息 header

\`:::header\` 用于渲染文章顶部的 Daily Share 区域。留空时会自动使用当前日期；写入内容时会展示自定义内容。

:::header
DAILY SHARE / 2026.06.17
:::

### 10. 主视觉标题 title

\`:::title\` 会渲染为大号衬线标题和渐变下划线，不会默认显示 Morning / Evening Share。若需要标题上方标签，可在前面紧跟 \`:::label:left\` 自定义；若需要顶部 Daily Share 区域，请使用 \`:::header\`。

:::title
不写 label 时只展示标题
:::
`
const DEFAULT_MARKDOWN = EXAMPLE_MARKDOWN
const markdownText = ref(loadSavedMarkdown())
const exampleMarkdownText = ref(EXAMPLE_MARKDOWN)
const formattedHtml = ref('')
const exampleFormattedHtml = ref('')
const markdownStats = computed(() => ({
  lines: markdownText.value.split('\n').length,
  words: markdownText.value.replace(/\s/g, '').length
}))
const exampleMarkdownStats = computed(() => ({
  lines: exampleMarkdownText.value.split('\n').length,
  words: exampleMarkdownText.value.replace(/\s/g, '').length
}))
const markdownLineNumbers = computed(() =>
  Array.from({ length: markdownStats.value.lines }, (_, index) => index + 1)
)
const exampleLineNumbers = computed(() =>
  Array.from({ length: exampleMarkdownStats.value.lines }, (_, index) => index + 1)
)
const activeMarkdownText = computed(() =>
  activeEditorTab.value === 'example' ? exampleMarkdownText.value : markdownText.value
)
const activeFormattedHtml = computed(() =>
  activeEditorTab.value === 'example' ? exampleFormattedHtml.value : formattedHtml.value
)
const activeMarkdownStats = computed(() =>
  activeEditorTab.value === 'example' ? exampleMarkdownStats.value : markdownStats.value
)
function loadSavedMarkdown() {
  try {
    return window.localStorage.getItem(MARKDOWN_STORAGE_KEY) || DEFAULT_MARKDOWN
  } catch {
    return DEFAULT_MARKDOWN
  }
}

function saveMarkdownDraft(value: string) {
  try {
    window.localStorage.setItem(MARKDOWN_STORAGE_KEY, value)
  } catch {
    // Ignore storage failures so editing stays uninterrupted.
  }
}

function getEditorTextarea() {
  const textareas = Array.from(editorPanel.value?.querySelectorAll('textarea') || [])
  return textareas.find((textarea) => textarea.offsetParent !== null) || null
}

function getLineNumberGutter() {
  const gutters = Array.from(editorPanel.value?.querySelectorAll<HTMLElement>('.line-number-gutter') || [])
  return gutters.find((gutter) => gutter.offsetParent !== null) || null
}

function syncLineNumberGutter() {
  const editor = getEditorTextarea()
  const gutter = getLineNumberGutter()
  if (!editor || !gutter) return
  gutter.scrollTop = editor.scrollTop
}

function syncScroll(source: HTMLElement, target: HTMLElement) {
  const sourceMax = source.scrollHeight - source.clientHeight
  const targetMax = target.scrollHeight - target.clientHeight
  if (sourceMax <= 0 || targetMax <= 0) return
  target.scrollTop = (source.scrollTop / sourceMax) * targetMax
}

function handleEditorScroll() {
  if (syncingScroll.value) return
  const editor = getEditorTextarea()
  const preview = wechatPreview.value
  if (!editor || !preview) return
  syncingScroll.value = true
  syncLineNumberGutter()
  syncScroll(editor, preview)
  requestAnimationFrame(() => {
    syncingScroll.value = false
  })
}

function handlePreviewScroll() {
  if (syncingScroll.value) return
  const editor = getEditorTextarea()
  const preview = wechatPreview.value
  if (!editor || !preview) return
  syncingScroll.value = true
  syncScroll(preview, editor)
  syncLineNumberGutter()
  requestAnimationFrame(() => {
    syncingScroll.value = false
  })
}

function bindEditorScroll() {
  const editor = getEditorTextarea()
  if (!editor) return
  editor.removeEventListener('scroll', handleEditorScroll)
  editor.addEventListener('scroll', handleEditorScroll)
  syncLineNumberGutter()
}

function handleMarkdownInput() {
  if (formatTimer) window.clearTimeout(formatTimer)
  const target = activeEditorTab.value
  formatTimer = window.setTimeout(() => {
    handleFormatMarkdown(target)
  }, 120)
}

async function handleEditorTabChange() {
  await nextTick()
  bindEditorScroll()
  handleEditorScroll()
}

async function switchEditorTab(value: 'write' | 'example') {
  activeEditorTab.value = value
  await handleEditorTabChange()
}

async function handleEditorPaste(event: ClipboardEvent) {
  const imageFiles = getPastedImageFiles(event)
  if (!imageFiles.length) return

  event.preventDefault()
  let uploadingMessage = ElMessage({
    message: `正在上传 ${imageFiles.length} 张图片，请稍候...`,
    type: 'info',
    duration: 0,
    showClose: true
  })

  try {
    const urls: string[] = []
    for (const [index, file] of imageFiles.entries()) {
      uploadingMessage.close()
      uploadingMessage = ElMessage({
        message: `正在上传图片 ${index + 1}/${imageFiles.length}，请稍候...`,
        type: 'info',
        duration: 0,
        showClose: true
      })
      urls.push(await uploadImageToHost(file))
    }
    await insertMarkdownAtCursor(urls.map((url) => `![](${url})`).join('\n\n'))
    ElMessage.success('图片上传成功，已插入 Markdown')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '图片上传失败')
  } finally {
    uploadingMessage.close()
  }
}

function getPastedImageFiles(event: ClipboardEvent) {
  const items = Array.from(event.clipboardData?.items || [])
  const files = items
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file))

  if (files.length) return files

  return Array.from(event.clipboardData?.files || []).filter((file) =>
    file.type.startsWith('image/')
  )
}

async function uploadImageToHost(file: File) {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('cdn_domain', 'img.scdn.io')

  const response = await fetch(IMAGE_UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData
  })
  const result = await response.json().catch(() => null)
  const url = result?.url || result?.data?.url || result?.image?.url || result?.result?.url
  if (!response.ok || !url) {
    throw new Error(result?.message || result?.error || '图片上传失败')
  }
  return url
}

async function insertMarkdownAtCursor(markdown: string) {
  const isExample = activeEditorTab.value === 'example'
  const targetText = isExample ? exampleMarkdownText : markdownText
  const target = isExample ? 'example' : 'write'
  const editor = getEditorTextarea() as HTMLTextAreaElement | null
  if (!editor) {
    targetText.value = `${targetText.value}\n\n${markdown}`
    await handleFormatMarkdown(target)
    return
  }

  const start = editor.selectionStart ?? targetText.value.length
  const end = editor.selectionEnd ?? start
  const before = targetText.value.slice(0, start)
  const after = targetText.value.slice(end)
  const prefix = before && !before.endsWith('\n') ? '\n' : ''
  const suffix = after && !after.startsWith('\n') ? '\n' : ''
  const insertion = `${prefix}${markdown}${suffix}`
  targetText.value = `${before}${insertion}${after}`

  await nextTick()
  const cursor = before.length + insertion.length
  editor.focus()
  editor.setSelectionRange(cursor, cursor)
  await handleFormatMarkdown(target)
}

watch(markdownText, (value) => {
  saveMarkdownDraft(value)
})

watch(showGridBackground, () => {
  void handleFormatMarkdown('all')
})

watch(showFigureNumbers, () => {
  void handleFormatMarkdown('all')
})

watch(showSectionNumbers, () => {
  void handleFormatMarkdown('all')
})

async function handleFormatMarkdown(target: 'write' | 'example' | 'all' = 'all') {
  formattingMarkdown.value = true
  try {
    if (target === 'write' || target === 'all') {
      formattedHtml.value = markdownText.value.trim() ? await renderMarkdown(markdownText.value) : ''
    }
    if (target === 'example' || target === 'all') {
      exampleFormattedHtml.value = await renderMarkdown(exampleMarkdownText.value)
    }
    await nextTick()
    bindEditorScroll()
    handleEditorScroll()
  } catch {
    ElMessage.error('Markdown 排版失败')
  } finally {
    formattingMarkdown.value = false
  }
}

async function renderMarkdown(markdown: string) {
  const result = await formatMarkdownForWechat(markdown, formatterTheme.value, {
    showGridBackground: showGridBackground.value,
    showFigureNumbers: showFigureNumbers.value,
    showSectionNumbers: showSectionNumbers.value
  })
  return applyWechatFontSize(result.html, formatterFontSize.value)
}

async function copyFormattedHtml() {
  const previewHtml =
    wechatPreview.value?.querySelector('.wechat-preview-device')?.innerHTML || activeFormattedHtml.value
  if (!previewHtml) return
  try {
    await copyRichHtml(previewHtml, activeMarkdownText.value)
    ElMessage.success('复制成功，可直接粘贴到公众号编辑器')
  } catch {
    ElMessage.error('复制失败，请检查浏览器剪贴板权限')
  }
}

async function copyRichHtml(html: string, plainText: string) {
  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    const htmlBlob = new Blob([html], { type: 'text/html' })
    const textBlob = new Blob([plainText], { type: 'text/plain' })
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      })
    ])
    return
  }

  if (copyRichHtmlWithSelection(html)) return

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(html)
    return
  }

  throw new Error('Clipboard API unavailable')
}

function copyRichHtmlWithSelection(html: string) {
  const container = document.createElement('div')
  container.contentEditable = 'true'
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.innerHTML = html
  document.body.appendChild(container)

  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(container)
  selection?.removeAllRanges()
  selection?.addRange(range)

  let copied = false
  try {
    copied = document.execCommand('copy')
  } finally {
    selection?.removeAllRanges()
    document.body.removeChild(container)
  }
  return copied
}

function toggleFooterQr(type: 'official' | 'group') {
  activeFooterQr.value = activeFooterQr.value === type ? null : type
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target
  if (target instanceof Element && target.closest('.footer-wechat-entry')) return
  activeFooterQr.value = null
}

onMounted(async () => {
  document.addEventListener('click', handleDocumentClick)
  await handleFormatMarkdown('all')
  await nextTick()
  bindEditorScroll()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>
