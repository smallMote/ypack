# 手写webpack
## 构建自定义命令
> 此处案例是实现一个简易的webpack打包工具。
### 配置命令
  在```package.json```中添加bin配置配置需要执行的文件。如：我需要配置一个pack命令，并且使用node环境默认运行当前目录下的```pack.js```文件。
  package.json
  ```
  "bin": {
    "ypack": "./ypack.js"
  }
  ```
  ypack.js
  ```
  #! /usr/bin/env node // 指明运行的环境
  console.log('ypack is start!')
  ```
### 链接文件
  terminal
  ```
  // 在pack.js同级目录下
  sudo npm link // 将package.json配置抛到全局
  sudo npm link ypack.js // 链接文件
  ```
### 运行文件
  terminal
  ```
  ypack // pack is start!
  npx ypack // pack is start!
  ```
## 处理loader
  loader使用来处理源码的辅助插件，所以我们在获取源码的时候作处理。
  ```
  getSource(modulePath) {
    let content = fs.readFileSync(modulePath, 'utf8');
    let rules = this.config.module.rules; // 拿到所有规则
    for(let i = 0; i < rules.length; i++) {
      let rule = rules[i];
      const { test, use } = rule;
      let len = use.length - 1
      if (test.test(modulePath)) { // 匹配文件
        function loopLoader() {
          let loader = require(use[len--]); // 拿到loader函数，从右到左执行 
          content = loader(content); // 使用loader转换匹配文件的源码
          if (len >= 0) {
            loopLoader(); // 递归调用所有loader
          }
        }
        loopLoader()
      }
    }
    return content
  }
  ```
