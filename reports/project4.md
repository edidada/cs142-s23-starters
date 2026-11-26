# CS142 Project4：React 页面与路由

来源：https://web.stanford.edu/class/cs142/project4-react.html ，Spring2023官方starter ZIP镜像，不是官方fork或2026新版。独立分支edidada/project4及project4.yml工作流。

五项功能：Example从model读取edidada姓名与初始短motto，受控输入实时编辑；States从原始model读取并复制排序，以忽略大小写的字面子串过滤，显示当前输入与无结果信息；共享Header使用原创CSS轨道图形、渐变与三步叙事，四个应用均引用；p4按钮在两组件间切换；p5使用官方已依赖的React Router HashRouter/Route/Link，支持可分享深链与刷新保留路由。界面不直接操作DOM，没有新增应用运行库。

原package及ESLint配置保留。首次CI发现原lock缺少Airbnb所需react-hooks peer依赖，单独用package-lock-only补齐依赖记录，不执行安装脚本。原lint命令含`|| exit 0`会掩盖失败，因此Actions直接调用原配置ESLint，零warning为门槛，随后原webpack构建。真实Chromium检查全州列表、多组子串/大小写/无结果/字面标点、motto修改、四页Header、双向按钮、URL深链/刷新/前进后退和窄屏溢出，保存截图及checks.json。这里只描述验收范围，最终结果以langnote验收记录为准；不代表校内私有评分。本地不编译或执行课程。
