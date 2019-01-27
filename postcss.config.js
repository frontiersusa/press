module.exports = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss")("./tailwind.js"),
    require("postcss-preset-env"),
    require("postcss-pxtorem")({
      rootValue: 16,
      propList: ["*"],
      replace: true,
      mediaQuery: false
    }),
    require("postcss-fixie"),
    require("postcss-flexbugs-fixes"),
    require("postcss-font-magician"),
    require("postcss-focus"),
    require("postcss-responsive-type")
  ]
};