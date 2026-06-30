# 项目结构

```
gpt20x-inspired-site/
├── server.js                    # Express 服务器入口
├── package.json                 # 项目依赖配置
├── .env.example                 # 环境变量模板
├── .gitignore                   # Git 忽略文件
├── README.md                    # 项目说明
├── index.html                   # 前端主页面
├── app.js                       # 前端逻辑
├── styles.css                   # 前端样式
├── start.sh                     # 启动脚本
│
├── src/
│   ├── config/
│   │   └── products.js          # 商品配置
│   │
│   ├── controllers/
│   │   ├── orderController.js   # 订单控制器
│   │   └── paymentController.js # 支付控制器
│   │
│   ├── services/
│   │   ├── orderService.js      # 订单服务层
│   │   └── paymentService.js    # 支付服务层
│   │
│   ├── routes/
│   │   ├── orderRoutes.js       # 订单路由
│   │   └── paymentRoutes.js     # 支付路由
│   │
│   ├── middleware/
│   │   ├── errorHandler.js      # 错误处理中间件
│   │   └── rawBody.js           # 原始请求体中间件
│   │
│   ├── utils/                   # 工具函数（预留）
│   │
│   └── payment-adapters.js      # 支付网关适配器
│
├── data/
│   └── orders.json              # 订单数据存储
│
└── assets/
    ├── qr-alipay.svg            # 支付宝二维码
    ├── qr-wechat.svg            # 微信二维码
    └── qr-usdt.svg              # USDT 二维码
```

## 架构说明

### 分层架构

1. **Routes（路由层）**
   - 定义 API 端点
   - 路由到对应的控制器

2. **Controllers（控制器层）**
   - 处理 HTTP 请求和响应
   - 调用服务层处理业务逻辑
   - 数据验证

3. **Services（服务层）**
   - 核心业务逻辑
   - 数据访问和操作
   - 可复用的业务功能

4. **Middleware（中间件层）**
   - 请求预处理
   - 错误处理
   - 日志记录

### 主要模块

#### 订单模块
- 订单创建
- 订单查询
- 订单状态更新
- 数据持久化（JSON 文件）

#### 支付模块
- 支付创建
- 支付回调处理
- 多渠道支付适配（支付宝、微信、USDT）
- Mock 模式和 Live 模式切换

## API 端点

### 健康检查
- `GET /api/health` - 服务健康状态

### 订单管理
- `GET /api/orders` - 查询订单列表
- `POST /api/orders` - 创建新订单
- `POST /api/orders/:orderId/mark-paid` - 标记订单已支付

### 支付管理
- `POST /api/payments/create` - 创建支付
- `POST /api/payments/callback/:provider` - 支付回调（支付宝/微信）
