const source = require('@tarojs/plugin-shared-runtime/taro').default

const taro = {
    ...source
};

function taroInterceptor(chain) {
    return source.request(chain.requestParams)
}
const link = new taro.Link(taroInterceptor)
taro.request = link.request.bind(link)
taro.addInterceptor = link.addInterceptor.bind(link)
taro.cleanInterceptors = link.cleanInterceptors.bind(link)

taro.eventCenter = new taro.Events()

module.exports = taro
module.exports.default = module.exports
