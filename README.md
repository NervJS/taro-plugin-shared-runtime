# taro-plugin-runtime

> 微信小程序多分包、组件共享Taro运行时插件

> 基于Taro 3.5.1、React 18.2.0构建，含有Taro插件和运行时封装

## 版本要求

支持Taro 3.2.0～3.5.1版本

## 安装

在 Taro 项目根目录下安装

```bash
npm i @tarojs/plugin-runtime
```

在原生小程序中安装运行时（如已安装请忽略）

```bash
npm i @tarojs/plugin-runtime
```

安装成功后点击微信开发者工具菜单栏 => 工具 - 构建npm

## 使用

### 引入插件
```js
const config = {
    ...
    plugins: [
        ...
        ...(process.env.NODE_ENV === "development" ? [] : ["@tarojs/plugin-runtime"])
    ]
    ...
}
```

### 注意事项
1、当前不能使用 @tarojs/plugin-inject 等插件注入组件属性，可能导致生成的模版与运行时不匹配，导致渲染异常

2、切换到公共运行时后，dom树结构会多一层根节点，对代码中直接操作dom树的逻辑可能产生影响，需要检查逻辑是否正常

3、因为从原有的单实例变为多实例，应避免直接使用Current.app引用，此值为最新创建的实例，不代表当前实例，如必须使用，可以在初始化时取到此值缓存供后续调用

4、组件区别于页面，实例挂载从Current.app变更到Current.root，如有直接引用Current.app的逻辑需要调整
