把你的 HTML 资料文件放在这个目录里。

文件名要和 lib/config.ts 里 htmlResources 配置的 file 字段【完全一致】。

例如配置里写了:
  { file: 'hypothesis_testing.html', title: 'Hypothesis Testing', section: 'stats' }
那就把 hypothesis_testing.html 放到这里(public/docs/hypothesis_testing.html)。

放好后重新 build,对应 section 页面底部就会出现这张卡片,点击在新标签打开。

以后加新 HTML:
1. 文件丢进这个目录
2. 在 lib/config.ts 的 htmlResources 数组加一行
3. 重新 build / 触发部署
