import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';


export default [
    {
        input: 'es/index.js',
        output: {
            sourcemap: true,
            name: 'VuexUp',
            file: pkg.browser,
            format: 'umd'
        },
        plugins: [
            resolve(),
            commonjs()
        ]
    },

    {
        input: 'es/index.js',
        output: [
            {file: pkg.main, format: 'cjs', sourcemap: true},
            {file: pkg.module, format: 'esm', sourcemap: true}
        ],
        plugins: [
            resolve(),
            commonjs()
        ]
    }
];
