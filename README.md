# 构建自定义命令
> 此处案例是实现一个简易的webpack打包工具。
  - 在```package.json```中添加bin配置配置需要执行的文件。如：我需要配置一个pack命令，并且使用node环境默认运行当前目录下的```pack.js```文件。
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
  - 链接文件
    terminal
    ```
    // 在pack.js同级目录下
    sudo npm link // 将package.json配置抛到全局
    sudo npm link ypack.js // 链接文件
    ```
  - 运行文件
    terminal
    ```
    ypack // pack is start!
    npx ypack // pack is start!
    ```
