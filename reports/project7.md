# CS142 Project7：会话与输入（实现中）

来源：https://web.stanford.edu/class/cs142/project7-react.html ，Spring2023官方ZIP镜像。独立分支edidada/project7，继承Project6最终实现并覆盖Project7原始loader及测试。未宣称最新2026期次或官方fork。

实现四项必做：服务端session登录/注销与API授权；本人评论；随机唯一文件名上传；注册与密码确认及登录校验。只返回公开用户字段，拒绝空字段、重复用户名、非法照片ID和空评论，上传最大10MiB；注销销毁session，登录重建session防固定。注册允许匿名访问，其余数据API与图片需要session。刷新通过/session恢复服务端身份，不在浏览器存储密码。前端有登录失败提示、深链重定向、Hi问候、注销、评论表单、上传、注册成功清空及确认密码校验。

独立project7.yml在隔离MongoDB上运行原始Mocha及Chromium全栈流程、严格原ESLint与webpack。新增脚本scripts/verify-project7.cjs；执行结果尚待登记。原测试未修改。本地仅依赖锁文件生成及源码检查，不运行课程。

边界：密码暂按必做要求存储明文，盐化密码可选项尚未实现，不用于真实账号；内存session/课程静态文件服务器非生产部署。可选Project6气泡继承，统计可能在当前会话新增评论后需刷新，不宣称Project7完整验收；正式私有评分未执行。
