# CS142 Project1 HTML/CSS（待最终CI）

官方 https://web.stanford.edu/class/cs142/project1.html ，Spring2023。纯静态XHTML无应用JavaScript或外部CSS库，同一index.html仅切换stylesheet实现A/B，C用渐变/阴影/过渡。测试脚本在项目之外由Actions执行，不随页面加载。

A采用flex纵向space-between，600px最小高度避免矮窗口重叠，100x100外框含边框；B不换行flex、100x150外框含左虚线/内边距，F固定右下。尺寸统一按border-box解释；字母离内容边界10px，左侧另有10px虚线。原文未明确盒模型，显式记录该解释。

独立project1.yml：W3C XHTML1.0 Strict DTD本地验证（远端Actions），Chromium四组A窗口/两组B窗口几何、间距、颜色/悬停、F固定、C渐变/阴影截图。尚未声称W3C在线服务提交或私有评分。无本地课程浏览器执行。
