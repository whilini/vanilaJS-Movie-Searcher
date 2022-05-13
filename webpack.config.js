//import
const path = require("path");
const dotenv = require("dotenv");
const HtmlPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

//export
module.exports = (env, options) => {
  dotenv.config();

  return {
    // parcel main.js
    // 파일을 읽어들이기 시작하는 진입점 설정
    entry: "./js/main.js",

    // 결과물(번들)을 반환하는 설정
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "main.js",
      clean: true,
    },

    module: {
      rules: [
        {
          test: /\.s?css$/, // .scss 혹은 .css로 끝나는 확장자를 찾는 정규식
          use: [
            "style-loader", // 순서대로 적어야 함
            "css-loader", // 먼저 해석되는건 css-loader
            "sass-loader",
          ],
        },
      ],
    },

    // 번들링 후 결과물의 처리 방식 등 다양한 플러그인들을 설정
    plugins: [
      new HtmlPlugin({
        template: "./index.html",
      }),
      new CopyPlugin({
        patterns: [
          { from: "static" }, // 'static'이라는 폴더에서 복사하여 'dist'에 삽입하기
        ],
      }),
      new webpack.DefinePlugin({
        "process.env.API_KEY": JSON.stringify(process.env.API_KEY),
      }),
      new webpack.EnvironmentPlugin(["API_KEY"]),
    ],
  };
};
