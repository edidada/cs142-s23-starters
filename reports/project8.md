# CS142 Project8 实现中

官方Spring2023 Google文档来源见langnote CS142-project8-source-20261126.json。继承Project7盐化密码最终版，选择#1资料摘要3点/#4活动流4点/#6点赞4点/#8自动侧栏3点，合计14点。独立edidada/project8分支与project8.yml，暂无验收结论。

服务端计算摘要/点赞排序；$addToSet/$pull幂等更新本人赞。Activity持久化五类事件，前五倒序和每用户最新活动独立接口；侧栏2秒轮询。新loader清理Activity。评论/注册/上传/登录动作与活动日志未使用多文档事务，失败一致性仍有边界。没有实现未选故事，不宣称全部九故事。

Actions原Project7三个Mocha文件保持原样（36项），独立浏览器必做回归+14点故事专项，多用户与20次并发重复点赞、本人状态持久化、摘要oracle、侧栏另一会话上传自动缩略图、前五与刷新、全部五活动类型。尚待真实执行与截图核验。

submission.txt提供点数、操作路径和测试账号。带讲解视频URL仍PENDING，正式提交未完成；不能把功能通过称为视频已交付。全部课程执行在Actions，本地仅源码与语法检查。
