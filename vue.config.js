const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.module
      .rule("cpp")
      .test(/\.(c|cpp)$/)
      .use("wasm-loader")
      .loader("wasm-loader")
      .end()
      .use("c-cpp-modules-webpack-loader")
      .loader("c-cpp-modules-webpack-loader")
      .options({
        compiller: "-Os -s WASM=1 -s SIDE_MODULE=1",
      })
      .end();
  },
});
