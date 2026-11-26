# CS142 Project6：MongoDB 与 Axios

来源：https://web.stanford.edu/class/cs142/project6-react.html ，Spring2023官方ZIP镜像。依要求先继承已实现Project5前端，再保留Project6官方server/schema/loader/tests/package作为基线。独立edidada/project6分支和project6.yml工作流。

后端/user/list只投影姓名与ID；/user/:id限制详情字段；/photosOfUser/:id并发查询用户存在性与照片，再一次批量读取评论作者并构造仅含指定字段的普通对象。无cs142models依赖，不修改官方schema，不逐条串行查询作者。无效/不存在用户返回400，有效用户零照片返回空数组，查询故障500。前端共享hook改用axios.get，原生fetchModel文件不再被引用；保留URL竞态保护、完整照片与Project5 stepper。

Actions用隔离MongoDB6.0、官方loadDatabase及原Mocha测试，再做严格原ESLint/webpack、API字段投影/非法ID/数据库实增用户与零照片/浏览器全用户图片评论和刷新检查。新增测试用户在finally中按自己ID清理；不操作共享数据库。执行结论与图片核验另记langnote最终台账。本地不运行MongoDB/课程构建。Project6可选评论统计气泡/评论视图尚未实现，不把必做范围称为可选项完成。
