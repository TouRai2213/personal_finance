# Claude Code Documentation

## 服务器部署和管理

### 连接服务器
```bash
ssh private
```

### 项目结构
- **前端**: `/root/personal_finance/` (Next.js)
- **后端**: `/root/finance-backend/` (Python Flask)

### 虚拟环境管理

#### 激活Node.js环境 (前端)
```bash
source ~/.nvm/nvm.sh
```

#### 激活Python虚拟环境 (后端)
```bash
cd /root/finance-backend
source venv/bin/activate
```

### PM2 进程管理

#### 查看所有进程
```bash
source ~/.nvm/nvm.sh
pm2 list
```

#### 重启服务
```bash
# 重启前端
pm2 restart finance-app-dev

# 重启后端
pm2 restart finance-backend
```

#### 查看日志
```bash
# 查看前端日志
pm2 logs finance-app-dev

# 查看后端日志
pm2 logs finance-backend
```

### 代码部署流程

#### 上传前端代码
```bash
scp -r components/ private:/root/personal_finance/
```

#### 上传后端代码
```bash
scp app.py private:/root/finance-backend/
```

#### 完整部署步骤
1. 上传修改的文件
2. 连接服务器: `ssh private`
3. 激活环境: `source ~/.nvm/nvm.sh`
4. 重启相应服务: `pm2 restart [service-name]`

### 常用命令

#### 文件上传
```bash
# 单个文件
scp "/local/path/file.tsx" private:/root/personal_finance/components/

# 整个目录
scp -r "/local/path/components/" private:/root/personal_finance/
```

#### 服务器文件操作
```bash
# 查看目录结构
ssh private "ls -la /root/personal_finance/"

# 查看进程状态
ssh private "source ~/.nvm/nvm.sh && pm2 list"

# 重启服务
ssh private "source ~/.nvm/nvm.sh && pm2 restart finance-backend"
```

## 项目技术栈

### 前端 (Next.js)
- **框架**: Next.js 14 with TypeScript
- **UI组件**: Tailwind CSS + shadcn/ui
- **图表**: Recharts
- **状态管理**: React hooks

### 后端 (Python Flask)
- **框架**: Flask with CORS
- **数据源**: yfinance API
- **时区处理**: pytz
- **数据存储**: JSON文件

## 功能特性

### 多交易记录支持
- 支持每只股票多次买入/卖出交易
- 自动计算平均成本和P/L
- 图表上显示交易点位

### 日股支持
- 输入4位数字自动添加`.T`后缀
- 正确的JST时区显示
- 日股交易时间过滤 (9:00-15:00 JST)

### 实时数据更新
- 不同时间段的自动刷新频率
- 1D: 2分钟, 1W: 5分钟, 30D: 1小时

## 开发注意事项

### 类型安全
- 严格使用TypeScript类型定义
- 避免使用spread operator语法错误，使用concat()替代

### 状态管理
- 使用useEffect依赖数组时避免循环依赖
- 初始化状态时防止覆盖新添加的数据

### API设计
- 所有API支持CORS
- 错误处理返回适当的HTTP状态码
- 数据持久化到JSON文件