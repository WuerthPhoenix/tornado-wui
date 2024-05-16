module.exports = {
  publicPath: "./",
  devServer: {
    https: true,
    public: "localhost:8081",
    proxy: {
      "/neteye/tornado/backend": {
        target: "https://httpd.neteyelocal",
        ws: true,
        changeOrigin: true,
      },
      "/neteye/tornado/user": {
        target: "https://httpd.neteyelocal",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "src/assets/scss/main.scss";`,
      },
    },
  },
};
