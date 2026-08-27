const env = {
  dev: {
    baseUrl: 'http://127.0.0.1:8080/api'
  },
  prod: {
    baseUrl: 'https://xxx.com/api'
  }
}
// 老项目：process.env.NODE_ENV
const mode = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'
export const baseUrl = env[mode].baseUrl
