const path = require('path');
const fs = require('fs');
const ejs = require('ejs')
const babylon = require('babylon');
const t = require('@babel/types');
const traverse = require('@babel/traverse').default; // ES6模块默认导出default
const generator = require('@babel/generator').default;
module.exports = class Compiler {
  constructor(config) {
    // 获取配置
    this.config = config;
    // 保存入口文件的路径
    this.entryId = '';
    // 保存所有模块的依赖
    this.modules = {};
    // 入口路径
    this.entry = config.entry ;
    // 工作路径
    this.root = process.cwd();
  }
  // 获取模块内容
  getSource(modulePath) {
    return fs.readFileSync(modulePath, 'utf8');
  }
  /**
   * 解析源码
   * @param {*} sourceCode 
   * @param {*} parentsPath 
   * 需要三个插件辅助
   * babylon -> 转化成AST语法树
   * @babel/traverse -> 遍历节点
   * @babel/types -> 替换节点
   * @babel/generator -> 生成
   */
  parse(source, parentsPath) {
    // 转换
    const ast = babylon.parse(source);
    const dependencies = [];
    traverse(ast, {
      CallExpression(p) {
        let node = p.node; // 获取节点
        if (node.callee.name === 'require') { // 找到require方法
          node.callee.name = '__webpack_require__'; // 改造require方法名称
          let moduleName = node.arguments[0].value; // 拿到模块引用时的名称
          moduleName = `${moduleName}${path.extname(moduleName) ? '' : '.js'}`; // 扩展名处理
          moduleName = `./${path.join(parentsPath, moduleName)}`; // src/a.js
          dependencies.push(moduleName); // 存放依赖
          node.arguments = [t.stringLiteral(moduleName)];
        }
      }
    })
    const sourceCode = generator(ast).code;
    return { sourceCode, dependencies }
  }
  // 构建模块
  bindModule(modulePath, isEntry) {
    let source = this.getSource(modulePath);
    let moduleName = './' + path.relative(this.root, modulePath);
    if (isEntry) {
      this.entryId = moduleName // 保存入口文件名称
    }
    // 解析、改造源码，返回依赖列表
    // path.dirname(moduleName) -> 父路径 拿到 ./src
    const { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName));
    this.modules[moduleName] = sourceCode; // 存入模块组 
    // 递归加载依赖
    dependencies.forEach(dep => {
      this.bindModule(path.join(this.root, dep), false) // 非主模块
    })
  }
  // 发射文件
  emitFile() {
    // 拿到数据输出到配置目录
    const main = path.join(this.config.output.path, this.config.output.filename);
    const ejsTemplate = this.getSource(path.join(__dirname, 'main.ejs'));
    // 渲染
    const code = ejs.render(ejsTemplate, { entryId: this.entryId, modules: this.modules })
    // 输出文件
    fs.writeFileSync(main, code)
  }
  start() {
    // 执行并创建模块的依赖关键
    this.bindModule(path.resolve(this.root, this.entry), true);
    console.log(this.modules)
    // 发射文件 创建打包后的文件
    this.emitFile();
  }
}