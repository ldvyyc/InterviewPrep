/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  optimizeFonts: false,
  // 关键:关掉构建多线程,强制单线程,避免并发请求触发 Notion 429
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // 单个静态页生成超时放宽到 5 分钟(默认 60s,我们限流后会更慢)
  staticPageGenerationTimeout: 300,
}
module.exports = nextConfig
