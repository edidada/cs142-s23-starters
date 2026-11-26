# CS142 Project3：JavaScript 与 DOM

采用 Stanford 官方 Spring 2023 starter（发行包镜像，不是官方 Git fork），要求来源：https://web.stanford.edu/class/cs142/project3.html 。独立分支 edidada/project3，独立工作流 project3.yml。没有宣称取得 2026 新版。

DatePicker 使用原生 DOM，周日到周六排列，按月生成4至6行；跨月日期显示真实日期数字、置灰、禁用且没有回调监听器。导航使用当月1日避免月末日期溢出，两个实例独立。按钮支持键盘，日期回调给出原容器id和1基月份/日/年。没有使用第三方运行库。

TableTemplate 复用 Project2 的模板处理器：先处理全部表头，再用处理后的列名选列，未给列名则处理全部单元格，列名不匹配时正文不变。缺失属性替换为空串，使用 textContent 防止替换值变成HTML；兼容浏览器自动插入的tbody。处理后把hidden表格变为visible。两个官方HTML、原ESLint配置、原package及lock保持不变。

远端验收计划：原 npm ci/lint 零警告；真实 Chromium 对72个月逐格独立UTC日期oracle、闰年1900/2000/2100、4/5/6周、点击与跨年导航、实例独立验证；原页面3个表格逐格对照示例答案；缺属性/未知列/HTML文本安全。截图与checks.json留存工件。原npm test仅输出人工打开网页说明，不把它当自动功能测试。CI与图像核验结论另记langnote台账；本报告编写时尚未取得运行结论，不宣称实验完成。
