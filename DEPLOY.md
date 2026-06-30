# Linux 云服务器部署方案

## 推荐配置

- Ubuntu 22.04 / Debian 12
- 1 核 1G 起步
- Node.js 20 LTS
- PM2 守护 Node 进程
- Caddy 自动 HTTPS
- SQLite 存储：`DATA_STORE=sqlite`
- 持久化数据目录独立：默认 `/opt/nexai20x-data`

## 一键部署

把项目上传到服务器后，在项目目录执行：

```bash
sudo DOMAIN=你的域名.com ADMIN_PASSWORD='强密码' bash scripts/install-linux.sh
```

可选参数：

```bash
sudo \
  DOMAIN=example.com \
  APP_DIR=/opt/nexai20x \
  APP_NAME=nexai20x \
  PORT=4173 \
  ADMIN_USERNAME=admin \
  ADMIN_PASSWORD='强密码' \
  DATA_STORE=sqlite \
  bash scripts/install-linux.sh
```

部署后访问：

```text
https://你的域名.com
https://你的域名.com/father
```

`/admin.html` 已不可作为后台入口。

## .env 关键配置

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=4173

DATA_STORE=sqlite
SQLITE_PATH=/opt/nexai20x-data/app.sqlite

ADMIN_USERNAME=admin
ADMIN_PASSWORD=强密码
ADMIN_SESSION_SECRET=随机长字符串

PAYMENT_MODE=mock
```

正式支付时再配置支付宝、微信、USDT 环境变量。

## 常用命令

```bash
pm2 status
pm2 logs nexai20x
pm2 restart nexai20x --update-env
pm2 stop nexai20x
```

## 备份

脚本会生成：

```bash
/opt/nexai20x/backup.sh
```

手动备份：

```bash
bash /opt/nexai20x/backup.sh
```

添加每日备份：

```bash
sudo crontab -e
```

加入：

```cron
0 3 * * * /bin/bash /opt/nexai20x/backup.sh
```

## 防火墙

只开放：

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

不要开放 `4173`。

## SQLite 说明

设置：

```env
DATA_STORE=sqlite
SQLITE_PATH=/opt/nexai20x-data/app.sqlite
```

首次启动时会自动创建 SQLite 文件，并从现有 `data/*.json` 种子数据导入：

- `orders.json`
- `products.json`
- `content.json`
- `site-config.json`
- `visitors.json`

如果你已经在生产跑了一段时间，切换 SQLite 前先备份 `data/`。

## 后续升级

推荐方式：

```bash
cd /opt/nexai20x
git pull origin main
sudo APP_DIR=/opt/nexai20x DATA_DIR=/opt/nexai20x-data bash scripts/install-linux.sh
```

这个升级路径会：

- 覆盖代码
- 保留现有 `.env`
- 保留项目内 `data/`
- 保留项目外 SQLite 与其他持久化文件
- 重新安装依赖并重启 PM2

如果你的 `.env` 里已经设置了自定义 `SQLITE_PATH`，脚本不会改写它。

脚本已经兼容“在项目目录内直接执行”的场景。也就是说，`git pull` 完后直接执行上面的命令即可，不会把当前目录再错误同步到自己身上。
