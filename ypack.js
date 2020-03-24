#! /usr/bin/env node
// console.log('pack is start!')
const path = require('path');
// 1.拿到配置文件
const config = require(path.resolve('webpack.config.js'));
// 2.解析配置文件
const Compiler = require('./lib/Compiler.js');
const compiler = new Compiler(config);
// 3.编译配置文件
compiler.start();