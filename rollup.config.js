import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import replace from '@rollup/plugin-replace';
import {
    terser
} from 'rollup-plugin-terser';
import path from 'path';

const pkg = require(path.resolve('package.json'));

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const dependencies = Object.keys({
    ...pkg.dependencies
});

const replaceCoder = () => {
    return {
        name: "rollup-plugin-replace-coder",
        transform: (code, id) => {
            if (id.indexOf("@tarojs/runtime") !== -1) {
                return code.replace(
                    new RegExp("Current.app.mount", "gm"),
                    "app.mount"
                ).replace(
                    new RegExp("Current.app.unmount", "gm"),
                    "app.unmount"
                ).replace(
                    "let componentElement = null;",
                    "let componentElement = null;\nconst app = Current.app;"
                ).replace(
                    "let hasLoaded;",
                    "let hasLoaded;\nconst app = Current.app;"
                );
            }
        }
    }
}

export default [{
    input: {
        'api': '@tarojs/api',
        'components': '@tarojs/plugin-platform-weapp/dist/components-react',
        'react-dom': '@tarojs/react',
        'react': 'react',
        'react-jsx-runtime': 'react/jsx-runtime',
        'react-is': 'react-is',
        'runtime': 'src/runtime',
        'shared': 'src/shared',
        'taro': '@tarojs/taro',
        'framework-runtime': 'src/framework-runtime',
        'platform-runtime': '@tarojs/plugin-platform-weapp/dist/runtime',
        'regenerator-runtime': 'regenerator-runtime'
    },
    output: {
        dir: 'dist',
        format: 'cjs'
    },
    external: (name) => {
        return !!dependencies.find(item => name.indexOf(item) === 0);
    },
    watch: {
        include: 'src/**',
    },
    plugins: [
        eslint({
            throwOnError: true,
            include: ['src/**/*.ts', 'src/**/*.tsx']
        }),
        json(),
        commonjs(),
        replaceCoder(),
        babel({
            babelHelpers: 'bundled',
            presets: [
                '@babel/preset-env',
                '@babel/preset-typescript',
                '@babel/preset-react'
            ],
            extensions
        }),
        resolve({
            extensions
        }),
        terser({
            safari10: true
        }),
        replace({
            'react-reconciler': 'react-reconciler/cjs/react-reconciler.production.min.js',
            'process.env.NODE_ENV': "'production'",
            'process.env.TARO_ENV': "'weapp'",
            'ENABLE_INNER_HTML': true,
            'ENABLE_ADJACENT_HTML': false,
            'ENABLE_SIZE_APIS': false,
            'ENABLE_TEMPLATE_CONTENT': false,
            'ENABLE_CLONE_NODE': false,
            'ENABLE_CONTAINS': false,
            'ENABLE_MUTATION_OBSERVER': false,
            '__TARO_FRAMEWORK__': "'react'"
        })
    ]
}, {
    input: 'src/index.ts',
    output: [{
            file: pkg.main,
            format: 'cjs',
            sourcemap: false
        },
        {
            file: pkg.module,
            format: 'esm',
            sourcemap: false
        }
    ],
    external: (name) => {
        return [
            '@tarojs/mini-runner',
            '@tarojs/service',
            'webpack-sources'
        ].find(item => name.indexOf(item) !== -1);
    },
    watch: {
        include: 'src/**',
    },
    plugins: [
        eslint({
            throwOnError: true,
            include: ['src/**/*.ts', 'src/**/*.tsx']
        }),
        json(),
        commonjs(),
        babel({
            babelHelpers: 'bundled',
            presets: [
                '@babel/preset-env',
                '@babel/preset-typescript',
                '@babel/preset-react'
            ],
            extensions
        }),
        resolve({
            extensions
        })
    ]
}, {
    input: 'src/taro-proxy.ts',
    output: {
        dir: 'plugin',
        format: 'cjs'
    },
    external: (name) => {
        return [
            '@tarojs/plugin-shared-runtime/taro'
        ].find(item => name.indexOf(item) !== -1);
    },
    watch: {
        include: 'src/**',
    },
    plugins: [
        eslint({
            throwOnError: true,
            include: ['src/**/*.ts', 'src/**/*.tsx']
        }),
        json(),
        commonjs(),
        babel({
            babelHelpers: 'bundled',
            presets: [
                '@babel/preset-env',
                '@babel/preset-typescript',
                '@babel/preset-react'
            ],
            extensions
        }),
        resolve({
            extensions
        })
    ]
}]
