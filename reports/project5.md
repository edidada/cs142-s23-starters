# CS142 Project5：照片应用与 AJAX

来源：https://web.stanford.edu/class/cs142/project5-react.html ，Spring2023官方ZIP镜像，不是官方fork或2026新版。独立edidada/project5分支与project5.yml。

两项必做实现：MUI侧栏用户导航、详情及照片链接、全部照片及对应时间和评论/作者链接；TopBar显示edidada、当前详情/照片上下文和实际/test/info版本。原生XMLHttpRequest返回Promise的data属性，HTTP/网络/超时/中止/JSON错误拒绝为status/statusText；每次独立XHR支持并发。组件只读HTTP模型，移除HTML的DOM模型脚本。共享hook按URL隔离响应并清理旧请求回调，避免切换用户后慢响应覆盖新页面，加载和失败均有明确显示。

原package/ESLint/后台模型与webServer保留，CI直接原ESLint配置，避免原lint命令吞失败，再做原webpack与真实浏览器。验证遍历原用户/照片/评论、图片实际解码、路由与刷新、并发HTTP及无效JSON、旧响应竞态和窄屏，截图/JSON工件保留。最终验收以langnote记录为准，本地不构建课程。

可选Advanced Features已补实现：每次应用加载默认关闭，勾选后显示单照片stepper；照片ID进入hash URL，可复制链接，前后按钮按边界禁用，浏览器历史决定当前照片。直接打开照片深链仍遵循默认关闭，启用后显示该URL选中的照片；刷新重新关闭开关但保留照片URL，再启用可恢复选中。关闭时恢复原完整照片列表，未知/其他用户照片ID在高级模式给出错误，不悄悄显示错误照片。该功能的最终运行证据另记台账，不用实现提交冒充通过。
