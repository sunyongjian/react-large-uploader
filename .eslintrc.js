module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "parser": "babel-eslint",
    "env": {
      "browser": true,
      "node": true
    },
    "settings" : {
        "import/resolver": {
            "webpack": {
                "config": "webpack.config.js"
            }
        }
    },
     "rules": {
        "no-underscore-dangle": ["off"],
        "no-undef": 0,
        "arrow-parens": ["off", "as-needed"],
        "react/forbid-prop-types": [0, { "forbid": ["any", "array", "object"] }],
        "jsx-a11y/href-no-hash": 0,
        "global-require": 0,
        "jsx-a11y/no-noninteractive-element-interactions": 0,
        "jsx-a11y/no-static-element-interactions": 0,
    }
};