import { componentConfig } from "@tarojs/mini-runner/dist/template/component";
import { Weapp } from "@tarojs/plugin-platform-weapp";

const toDashed = (input) => {
    return input.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

const plugin = (ctx, options) => {
    ctx.modifyWebpackChain(({ chain }) => {
        const name = "TaroComponentCollectPlugin";
        chain.plugin(name).use({
            apply(compiler) {
                compiler.hooks.thisCompilation.tap(name, (compilation) => {
                    compilation.hooks.afterOptimizeModules.tap(name, (modules) => {
                        modules.some((module) => {
                            if (module.userRequest === "@tarojs/components") {
                                const includes = componentConfig.includes;
                                if (Array.isArray(module.usedExports)) {
                                    module.usedExports.map(toDashed).map(includes.add.bind(includes));
                                } else {
                                    componentConfig.includeAll = true;
                                }
                                return true;
                            }
                            return false;
                        })
                    });
                });
            }
        });

        chain.merge({
            resolve: {
                alias: {
                    '@tarojs/taro': "@tarojs/plugin-runtime/plugin/taro-proxy"
                }
            },
            externals: [
                (_context, request, callback) => {
                    const mapping = {
                        "@tarojs/runtime": "@tarojs/plugin-runtime/runtime",
                        "@tarojs/shared": "@tarojs/plugin-runtime/shared",
                        "@tarojs/api": "@tarojs/plugin-runtime/api",
                        "@tarojs/plugin-runtime/taro": "@tarojs/plugin-runtime/taro",
                        "@tarojs/components": "@tarojs/plugin-runtime/components",
                        "react-dom": "@tarojs/plugin-runtime/react-dom",
                        "react-is": "@tarojs/plugin-runtime/react-is",
                        "react$": "@tarojs/plugin-runtime/react",
                        "react/jsx-runtime$": "@tarojs/plugin-runtime/react-jsx-runtime",
                        "regenerator-runtime": "@tarojs/plugin-runtime/regenerator-runtime",
                        "@tarojs/plugin-framework-react/dist/runtime": "@tarojs/plugin-runtime/framework-runtime",
                        "@tarojs/plugin-platform-weapp/dist/runtime": "@tarojs/plugin-runtime/platform-runtime"
                    }

                    const key = Object.keys(mapping).find(key => new RegExp(key).test(request));

                    if (key) {
                        return callback(null, `commonjs ${mapping[key]}`);
                    }

                    callback();
                },
            ]
        });

        const origin = chain.merge;
        chain.merge = function (data, ...rest) {
            if (data?.externals) {
                const externals = chain.get("externals") || [];
                data.externals = [
                    ...(Array.isArray(externals) ? externals : [externals]),
                    ...(Array.isArray(data.externals) ? data.externals : [data.externals])
                ];
            }
            return origin.call(this, data, ...rest);
        }
    });

    if (ctx.helper.DEFAULT_TEMPLATE_SRC.indexOf("3.5") !== -1) {
        return;
    }

    ctx.helper.printLog("modify", '@tarojs/plugin-runtime', "replace platform");

    const name = "weapp";
    const registered = ctx.platforms.has(name);

    ctx.ctx.hooks.delete(name);
    ctx.platforms.delete(name);
    ctx.registerPlatform({
        name,
        useConfigName: 'mini',
        async fn({ config }) {
            await new Weapp(ctx, config, options || {}).start();
        }
    });

    if (!registered) {
        let pass = false;
        ctx.ctx.platforms = new Proxy(ctx.ctx.platforms, {
            get: (target, method) => {
                return (...rest) => {
                    if (method === "has" && rest[0] === name && !pass) {
                        pass = true;
                        return false;
                    }
                    if (method === "set" && rest[0] === name) {
                        return;
                    }
                    return target[method](...rest);
                };
            }
        });

        ctx.ctx.hooks = new Proxy(ctx.ctx.hooks, {
            get: (target, method) => {
                return (...rest) => {
                    if (method === "set" && rest[0] === name) {
                        return;
                    }
                    return target[method](...rest);
                };
            }
        });
    }
}

export default plugin;
