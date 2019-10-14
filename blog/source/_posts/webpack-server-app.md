title: 用webpack编译后端app（partII）
tag:
  - webpack
  - watch
  - gulp
  - backend
  - function
  - 模块
  - build
  - 配置
  - task
  - js
date: 2019-10-11 10:36:34
tags:
---
在这个系列的Part I，我们做好了构建后端程序的webpack配置。通过一些诸如不打包所有node_modules的模块的小手段，我们顺利借用了webpack强大的基础架构来管理后端模块，并且更重要的是——使用的是与前端同样系统，不用维护两套独立的构建系统对我们来说就是一种解脱。

这个系列主要是想写给那些已经在前端使用webpack的开发者。你可能发现了babel的[require hook](http://babeljs.io/docs/using-babel/#require-hook) 很适合后端程序（事实上这玩意的确很棒），你可能想用多个loader来处理你的模块，或者是前后端公用代码。最重要的是，你想要用上[模块热替换功能](http://webpack.github.io/docs/hot-module-replacement.html)。这篇文章将会尝试用webpack来实现以上的所有功能。

在这篇博文里面，我们将会致力于更细致地控制webpack，以及如何同时管理前后端代码的构建。我们将通过gulp来驾驭webpack。这套系统对一个实际的项目来说非常实用。

有些开发者在看完Part I后反馈道，webpack实在是太复杂，太不标准了，我们应该用[jspm](https://jspm.io/)和[SystemJS](https://github.com/systemjs/systemjs)。SystemJS是专门基于ES6标准的运行时模块加载器。而jspm的开发者们也非常棒，但我不得不说，他们并没有包含多少webpack使用者所钟爱的特性。一个简单的例子就是模块热替换。我敢肯定接下来的几年内会有基于加载器规范的类似webpack的东西出现，我也很乐意转而使用之。

最重要的是，我们开始写ES6模块了。这对社区的影响比加载器本身大多了，而且幸运的是，通过webpack，我们能轻易用上ES6。首先，你需要一个支持ES6模块规范的编译器（比如babel）。这些编译器可以把ES6模块转化为require声明，那样webpack就能对此进行处理。

我在part1-es6分支中，把[backend-with-webpack](https://github.com/jlongster/backend-with-webpack/tree/part1-es6) repo转换成使用babel的ES6模块，这篇文章接下来的内容也会用ES6模块的形式来呈现。

## Gulp

Gulp是一个很好用的任务执行器，他使得自动化变得简单。即使我们不能用他来转换和打包模块，他仍然是一个很好的webpack的“主遥控器”、测试用例运行器，以及其他任何乱七八糟的任务的执行器。

如果你打算同时在前后端使用webpack，你需要两份独立的配置文件。你当然可以手动用 `--config` 创建所需的配置，然后跑两个独立的watcher，不出所料的话，你很快就会觉得实在是太麻烦了。在两个终端窗口里面跑着两个不同的进程，还要经常去关注两个进程的信息，实在是太蛋疼了。

webpack实际上支持多重配置。只要在配置文件中export一个数组而不是单个对象，webpack就可以同时执行多个进程。即使如此，我还是比较喜欢使用gulp，因为你并不总是想同时运行两个构建。

在gulp中，我们不能用命令行调用webpack，而要通过API调用，并且，我们需要创建一个gulp任务来跑。接下来我们就把我们的webpack配置转换为gulp file吧。

唯一的改动就是，从原有的直接export配置改为把配置传给webpack API。gulpfile会长这样：
``` javascript
var gulp = require('gulp');
var webpack = require('webpack');

var config = {
  ...
};

gulp.task('build-backend', function(done) {
  webpack(config).run(function(err, stats) {
    if(err) {
      console.log('Error', err);
    }
    else {
      console.log(stats.toString());
    }
    done();
  });
});
```

你可以传递一个配置给到webpack方法，然后你就得到了一个compiler。然后你可以通过compiler调用run或者watch，所以如果你需要一个代码改变时能自动重新编译的build-watch任务的话，只要简单地调用watch就好了。

由于gulpfile太大的关系，这里就不把所有内容都在上面展示，你可以在[这里](https://github.com/jlongster/backend-with-webpack/blob/part2a/gulpfile.js)找到完成的gulpfile。这个gulpfile与原来的webpack配置作用是完全一致的。（这里顺便吧babel loader加上了，以便于写ES6语法的模块）

## 多重webpack配置

准备工作都做完了，来点骚操作吧！我们先新建一个任务去构建前端代码，只需要提供一个不一样的webpack配置就ok了。但是，我们并不想管理两份完全独立的配置，毕竟前后端有很多的配置项是共通的。

我们要做的是，先建立一个基本配置，然后去扩展它。就像下面的一样：
``` javascript
var DeepMerge = require('deep-merge');

var deepmerge = DeepMerge(function(target, source, key) {
  if(target instanceof Array) {
    return [].concat(target, source);
  }
  return source;
});

// generic

var defaultConfig = {
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loaders: ['babel'] },
    ]
  }
};

if(process.env.NODE_ENV !== 'production') {
  defaultConfig.devtool = 'source-map';
  defaultConfig.debug = true;
}

function config(overrides) {
  return deepmerge(defaultConfig, overrides || {});
}
```

我们创建了一个深度合并方法去递归合并对象，然后我们就可以用此去改写默认的配置。另外，我们还提供了一个confg方法来创建基于默认配置的新配置。

在这里，你可以跑gulp任务的时候加上 `NODE_ENV=production` 前缀开启生产模式。如果开启了生产模式，sourcemaps就不会生成，而已你可以添加插件去压缩代码。

现在，我们可以创建一个前端配置了
``` javascript
var frontendConfig = config({
  entry: './static/js/main.js',
  output: {
    path: path.join(__dirname, 'static/build'),
    filename: 'frontend.js'
  }
});
```

这个配置会根据入口文件static/js/main.js生成static/build/frontend.js。

我们后端的配置也是一样的：把配置定制化成后端版本。我在此就不赘述了，详细可以看到github的[这里](https://github.com/jlongster/backend-with-webpack/blob/part2b/gulpfile.js#L55)。现在，我们就有两个任务了
``` javascript
function onBuild(done) {
  return function(err, stats) {
    if(err) {
      console.log('Error', err);
    }
    else {
      console.log(stats.toString());
    }

    if(done) {
      done();
    }
  }
}

gulp.task('frontend-build', function(done) {
  webpack(frontendConfig).run(onBuild(done));
});

gulp.task('backend-build', function(done) {
  webpack(backendConfig).run(onBuild(done));
});
```

事实上，我们可以做一万个相互组合的任务
``` javascript
gulp.task('frontend-build', function(done) {
  webpack(frontendConfig).run(onBuild(done));
});

gulp.task('frontend-watch', function() {
  webpack(frontendConfig).watch(100, onBuild());
});

gulp.task('backend-build', function(done) {
  webpack(backendConfig).run(onBuild(done));
});

gulp.task('backend-watch', function() {
  webpack(backendConfig).watch(100, onBuild());
});

gulp.task('build', ['frontend-build', 'backend-build']);
gulp.task('watch', ['frontend-watch', 'backend-watch']);
```

为watch加一个100ms的延时，以防变更频繁触发编译。

然后你只需要跑 `gulp watch` 就可以监视整个代码库的变更了，同时，你也可以只build或watch你想要的特定部分。

## Nodemon

[Nodemon](http://nodemon.io/)是一个对开发很有用的进程管理工具。它用以启动一个进程并提供API去重启。nodemon的目标是监测文件的变化以自动重启。我们这就只关注它的自动重启功能。

用`npm install nodemon`安装好之后，在gulpfile 头部增加引用`var nodemon = require('nodemon')`，我们就能创建一个 `run` 任务去执行编译后端文件了：
``` javascript
gulp.task('run', ['backend-watch', 'frontend-watch'], function() {
  nodemon({
    execMap: {
      js: 'node'
    },
    script: path.join(__dirname, 'build/backend'),
    ignore: ['*'],
    watch: ['foo/'],
    ext: 'noop'
  }).on('restart', function() {
    console.log('Restarted!');
  });
});
```

同时，这个任务指定了对`backend-watch`和`frontedn-watch`任务的依赖，这样两个监视器就能自动启动，当代码修改了的时候就会自动重新编译。

`execMap`和`script`选项指明了如何去把程序跑起来。其他选项都是给nodemon的监视器用的，我们显然不想让监视器监视所有文件。这就是为什么ignore选项是\*、watch是一个不存在的目录，ext是一个不存在的扩展名。开始的时候我只用ext选项，但我还是遇到一个实际问题，nedemon还在监视我项目中的**所有**文件。

所以，我们的项目该如何实现在程序改变的时候自动重启呢？调用modemon.restart()来做这个完成这个小戏法吧，我们可以把这个动作放在backend-watch任务里面：
```javascript
gulp.task('backend-watch', function() {
  webpack(backendConfig).watch(100, function(err, stats) {
    onBuild()(err, stats);
    nodemon.restart();
  });
});
```
现在，只要运行backend-watch，一旦你改变一个文件，项目就会自动重新编译并重启。

我们的gulpfile终于写完了。做完了上面所有工作后，现在只需要一行命令就能启动所有东西：
```
gulp run
```
最后，我们只要敲代码，按保存，所有的代码都会自动rebuild，服务也能自动重启

## 小Tips
### 更好的执行效率
如果你在用sourcemap，不难发现，即使用上增量编译（用watcher），项目里面的文件越多，编译的速度也会越慢。这是因为webpack每次编译都需要重新生成sourcemap，不管是改了一个文件还是很多文件。这个问题能通过修改devtool的值修复
``` javascript
config.devtool = '#eval-source-map';
```
这行配置就是告诉webpack为每个模块单独计算sourcemap，这是通过在运行时实时运算每个模块的sourcemap实现的。

### node 内置变量
我曾经在[用webpack编译后端APP（part I）](http://km.oa.com/group/502/articles/show/342743)提过，但好像有些人并没有注意到。有些node内置变量（比如__dirname）在不同的模块里面的值是不一样的。这个特性在我们使用webpack的时候会造成有些负面影响，因为webpack打包后，node的上下文就改变了，如果我们在模块中使用了这些变量的话，webpack就需要为这些变量填入正确的值

webapck有一个能用上的解决方案。你可以用[node configuration entry](http://webpack.github.io/docs/configuration.html#node)告诉webpack如何处理这些变量。我们最常用的功能就是把 ```__dirname``` 和```__filename```设置为true，让这些值在模块中报错其原本应该有的值。这些配置项的默认值是```mock```，意思就是给这些变量赋一个仿真的值（用于浏览器环境）

## 下期再见
现在我们已经可以为一个大型复杂的项目配好一套配置了，而你现在想要做到前后端同构的话也是轻而易举的，因为前后端都有了同样的基础设置。无论是前端还是后端，我们都有同样的增量编译，而通过```#eval-source-map ``` 配置，再大的项目都可以在200ms里面构建完。

我希望你可以按你自己的心意去修改这份gulpfile。webpack和gulp最好的地方就在于我们可以很轻易地根据自己的需求做修改，所以请尽情享受吧。

这两篇博文实际上都是写如何编译出最终的构建产物。我们现在可以考虑一下怎么用[hot module replacement](http://webpack.github.io/docs/hot-module-replacement.html)（react项目使用[react-hot-loader](http://gaearon.github.io/react-hot-loader/)）去加速我们的开发过程了。在part III，我会跟大家聊一下如何在后端使用这些工具。

感谢[Dan Abramov](http://twitter.com/dan_abramov)审阅本文


