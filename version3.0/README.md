# Version 3.0 - OpenEye 生命周期深度分析

## 🚀 核心改进

### 1. 使用框架完整的生命周期定义
- ✅ Ability 生命周期: **26 种** (完整)
- ✅ Component 生命周期: **17 种** (完整)
- ✅ 总计: **43 种** (与 DummyMainCreater 完全一致)

### 2. 与 DummyMainCreater 的关系
```typescript
// Version 3.0 直接使用框架定义
import { 
    LIFECYCLE_METHOD_NAME,           // 26 种
    COMPONENT_LIFECYCLE_METHOD_NAME  // 17 种
} from "../../arkanalyzer/src/utils/entryMethodUtils";

// DummyMainCreater 也使用相同定义
// 确保完全一致
```

### 3. 新增功能
- 📊 详细的覆盖率统计
- 🎯 区分"定义的" vs "实际使用的"
- 💡 智能推荐未使用但重要的生命周期
- 📋 更清晰的报告格式
- ✓/○ 区分有实现 vs 仅声明的方法

## 📦 文件结构

```
version3.0/
├── analyzeOpenEyeLifecycle.ts    # 主分析脚本
├── README.md                      # 本文件
└── tsconfig.json                  # TypeScript 配置
```

## 🚀 使用方法

```bash
# 进入 version3.0 目录
cd version3.0

# 运行分析
npx ts-node analyzeOpenEyeLifecycle.ts
```

## 📊 输出示例

```
📊 基础统计:
   文件数: 74
   类数量: 113
   方法总数: 505
   Ability 类: 1
   Component 类: 27
   生命周期方法实例: 60 个

📈 生命周期覆盖情况:
   📱 Ability 生命周期:
      框架定义: 26 种
      实际使用: 6 种 (23.1%)
      使用实例: 6 个

   🎨 Component 生命周期:
      框架定义: 17 种
      实际使用: 5 种 (29.4%)
      使用实例: 54 个

⚪ 未使用的生命周期方法:
   📱 Ability (20 种)
   🎨 Component (12 种)

💡 推荐关注的生命周期方法:
   🎨 onBackPress         - 处理返回键，提升用户体验
   🎨 aboutToReuse        - 组件复用优化，提升性能
   🎨 aboutToRecycle      - 组件回收优化，提升性能
   📱 onNewWant           - 处理新 Intent，支持应用唤起
   📱 onConfigurationUpdate - 响应系统配置变化
```

## 🎯 Version 对比

| 特性 | v2.0 | v3.0 |
|-----|------|------|
| Ability 生命周期定义 | 12 种 | 26 种 ✅ |
| Component 生命周期定义 | 14 种 | 17 种 ✅ |
| 与 DummyMainCreater 一致 | ❌ | ✅ |
| 覆盖率分析 | 基础 | 详细 ✅ |
| 推荐功能 | 无 | 有 ✅ |
| 实现标识 | 无 | ✓/○ ✅ |

## 📋 完整的生命周期列表

### Ability 生命周期 (26 种)

#### 核心生命周期
1. `onCreate` - Ability 实例创建
2. `onDestroy` - Ability 实例销毁
3. `onWindowStageCreate` - 窗口创建
4. `onWindowStageDestroy` - 窗口销毁
5. `onForeground` - 应用进入前台
6. `onBackground` - 应用进入后台

#### 窗口相关
7. `onWindowStageRestore` - 窗口恢复
8. `onWindowStageWillDestroy` - 窗口即将销毁

#### 状态管理
9. `onNewWant` - 新 Want 启动
10. `onConfigurationUpdate` - 配置变化
11. `onSaveState` - 保存状态
12. `onRestore` - 恢复状态

#### 交互相关
13. `onBackPressed` - 返回键
14. `onInactive` - 窗口失去焦点
15. `onActive` - 窗口获得焦点

#### 高级功能
16. `onContinue` - 迁移能力
17. `onShare` - 分享数据
18. `onPrepareToTerminate` - 即将终止
19. `onMemoryLevel` - 内存不足

#### 服务相关
20. `onConnect` - 服务连接
21. `onDisconnect` - 服务断开
22. `onRequest` - 服务请求

#### 调试相关
23. `onDump` - 转储信息
24. `onWantParam` - 启动参数
25. `onSceneCreated` - 场景创建
26. `onSceneDestroyed` - 场景销毁

### Component 生命周期 (17 种)

#### 核心生命周期
1. `aboutToAppear` - 组件即将出现
2. `aboutToDisappear` - 组件即将消失
3. `build` - 构建 UI (自动分析)

#### 页面生命周期
4. `onPageShow` - 页面显示
5. `onPageHide` - 页面隐藏
6. `onBackPress` - 返回键处理

#### 构建相关
7. `onDidBuild` - 构建完成

#### 性能优化
8. `aboutToReuse` - 组件复用前
9. `aboutToRecycle` - 组件回收前

#### 主题相关
10. `onWillApplyTheme` - 主题应用前

#### 自定义布局
11. `onLayout` - 自定义布局
12. `onMeasure` - 自定义测量
13. `onPlaceChildren` - 放置子组件
14. `onMeasureSize` - 测量尺寸

#### 区域变化
15. `onAreaChange` - 组件区域变化
16. `onVisibleAreaChange` - 可见区域变化

#### 卡片相关
17. `onFormRecycle` - 卡片回收
18. `onFormRecover` - 卡片恢复

## 🔧 技术细节

### DummyMainCreater 集成

```typescript
// Version 3.0 与 DummyMainCreater 的关系

// 1. DummyMainCreater 构造虚拟入口
const dummyMainCreater = new DummyMainCreater(this.scene);
dummyMainCreater.createDummyMain();
// 生成: @dummyMain 方法，包含所有生命周期调用

// 2. 使用 @dummyMain 构建调用图
const entryMethods = this.scene.getMethods().filter(m => 
    m.getName() === '@dummyMain'
);
this.callGraph = this.scene.makeCallGraphCHA(entryPoints);

// 3. Version 3.0 使用相同的生命周期定义进行统计
// 确保分析结果与调用图完全一致
```

### 覆盖率计算

```typescript
// 初始化所有 43 种生命周期的统计结构
for (const methodName of LIFECYCLE_METHOD_NAME) {
    this.abilityLifecycleStats.set(methodName, {
        isDefined: true,   // 框架定义
        isUsed: false,     // 项目使用
        usageCount: 0,     // 使用次数
        classes: [],       // 使用的类
        files: []          // 使用的文件
    });
}

// 扫描项目代码，标记实际使用的方法
// 计算覆盖率 = 使用的方法数 / 定义的方法数
```

## 🎯 适用场景

### 适合 Version 3.0 的场景
- ✅ 需要全面了解项目的生命周期使用情况
- ✅ 想知道哪些生命周期方法未被使用
- ✅ 性能优化，关注复用相关的生命周期
- ✅ 代码审查，确保生命周期使用规范
- ✅ 学习 HarmonyOS 完整的生命周期体系

### Version 2.0 vs Version 3.0
- **Version 2.0**: 关注常用生命周期，快速分析
- **Version 3.0**: 完整覆盖，深度分析，与框架保持一致

## 💡 使用建议

1. **首次分析**: 使用 Version 3.0 全面了解项目
2. **日常开发**: Version 2.0 快速检查常用生命周期
3. **性能优化**: 关注 Version 3.0 推荐的 `aboutToReuse` 等方法
4. **代码审查**: 使用 Version 3.0 的详细报告

## 📈 未来改进

- [ ] 支持自定义生命周期筛选
- [ ] 生成 HTML 可视化报告
- [ ] 生命周期调用链分析
- [ ] 性能热点分析
- [ ] 与 CI/CD 集成

---

**Version**: 3.0  
**日期**: 2025年11月24日  
**作者**: OpenEye Analysis Team
