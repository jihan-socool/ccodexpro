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
BODY_LIMIT=10mb

ADMIN_USERNAME=admin
ADMIN_PASSWORD=强密码
ADMIN_SESSION_SECRET=随机长字符串

PAYMENT_MODE=mock
```

正式支付时再配置支付宝、微信、USDT 环境变量。

`BODY_LIMIT` 控制 Express 接收 JSON / 表单请求体的最大大小。后台二维码上传会把图片转成 base64 字符串后随 JSON 提交，图片较大时需要调高这个值，例如 `10mb` 或 `20mb`。修改后执行：

```bash
pm2 restart nexai20x --update-env
```

## 后台检查更新

如果你希望在后台“系统设置”里直接检查更新并触发升级，需要额外配置：

```env
ADMIN_UPDATE_ENABLED=1
ADMIN_UPDATE_REMOTE=origin
ADMIN_UPDATE_BRANCH=main
ADMIN_UPDATE_ALLOW_DIRTY=0
ADMIN_UPDATE_SHELL=/bin/bash
ADMIN_UPDATE_COMMAND=git pull --ff-only origin main && sudo APP_DIR=/opt/nexai20x DATA_DIR=/opt/nexai20x-data bash scripts/install-linux.sh
```

注意：

- `ADMIN_UPDATE_COMMAND` 是后台点击“执行更新”时真正运行的命令，应当包含 `git pull`、依赖安装和服务重启。
- 如果当前 Node/PM2 运行用户执行 `sudo ... bash scripts/install-linux.sh` 需要密码，这个后台更新会失败。
- 生产环境通常需要在 `sudoers` 里只对白名单命令放开 `NOPASSWD`，不要直接给全量免密 sudo。
- 如果服务器不是用 PM2 + `scripts/install-linux.sh` 部署，改成你自己的升级脚本即可。

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
