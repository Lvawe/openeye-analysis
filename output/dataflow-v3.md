# OpenEye 数据流分析报告

生成时间: 2025/11/24 00:28:23

---

## 📊 总览

- **总数据流**: 627 条
- **生命周期方法**: 60 个
- **涉及方法**: 55 个

## 🔝 数据流最多的方法 (Top 20)

| 排名 | 方法 | 数据流数量 |
|------|------|------------|
| 1 | CommonDialog.build | 67 |
| 2 | CommonTopBar.build | 60 |
| 3 | FocusItemComponent.build | 54 |
| 4 | MinePage.build | 48 |
| 5 | CoordinatePage.build | 42 |
| 6 | MainPage.build | 39 |
| 7 | FindPage.build | 38 |
| 8 | LoadingDialog.build | 30 |
| 9 | VideoComponent.build | 27 |
| 10 | HotPage.build | 18 |
| 11 | CategoryDetailPage.build | 17 |
| 12 | RefreshFooter.build | 15 |
| 13 | DetailPage.build | 14 |
| 14 | HomePage.build | 14 |
| 15 | TopicDetailPage.build | 14 |
| 16 | SplashPage.build | 11 |
| 17 | ContainerPage.build | 10 |
| 18 | VideoBottomComponent.build | 8 |
| 19 | StateComponent.build | 8 |
| 20 | CommonSkeleton.build | 7 |

## 📋 详细数据流

### CommonDialog.build

**数据流**: 67 条

| 目标方法 | 调用次数 | 示例行号 |
|----------|----------|----------|
| create | 10 | 32 |
| pop | 10 | 34 |
| textAlign | 4 | 34 |
| fontColor | 3 | 34 |
| staticinvoke <@%unk/%unk: .$r()>('app.color.color_f5f5f5') | 3 | 43 |
| color | 3 | 43 |
| visibility | 3 | 55 |
| constructor | 2 | 33 |
| staticinvoke <@%unk/%unk: .$r()>('app.color.color_red') | 2 | 34 |
| fontSize | 2 | 34 |

### CommonTopBar.build

**数据流**: 60 条

| 目标方法 | 调用次数 | 示例行号 |
|----------|----------|----------|
| create | 9 | 51 |
| pop | 9 | 52 |
| height | 6 | 56 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.size_50') | 5 | 55 |
| constructor | 4 | 55 |
| width | 4 | 56 |
| staticinvoke <@%unk/%unk: .$r()>('app.color.color_red') | 2 | 52 |
| backgroundColor | 2 | 52 |
| opacity | 2 | 52 |
| align | 2 | 62 |

### FocusItemComponent.build

**数据流**: 54 条

| 目标方法 | 调用次数 | 示例行号 |
|----------|----------|----------|
| create | 8 | 10 |
| pop | 8 | 12 |
| constructor | 7 | 11 |
| width | 3 | 12 |
| height | 3 | 12 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.size_50') | 2 | 12 |
| fontSize | 2 | 17 |
| fontColor | 2 | 17 |
| maxLines | 2 | 17 |
| textOverflow | 2 | 17 |

### MinePage.build

**数据流**: 48 条

| 目标方法 | 调用次数 | 示例行号 |
|----------|----------|----------|
| instanceinvoke this.<@HarmoneyOpenEye/ets/pages/mine/MinePag | 8 | 46 |
| create | 5 | 28 |
| pop | 5 | 31 |
| staticinvoke <@%unk/%unk: .$r()>('app.media.icon_topic') | 5 | 52 |
| height | 3 | 31 |
| constructor | 2 | 31 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.size_70') | 2 | 31 |
| width | 2 | 31 |
| justifyContent | 2 | 30 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.size_250') | 1 | 30 |

### CoordinatePage.build

**数据流**: 42 条

| 目标方法 | 调用次数 | 示例行号 |
|----------|----------|----------|
| create | 8 | 30 |
| pop | 8 | 31 |
| constructor | 5 | 30 |
| width | 3 | 33 |
| zIndex | 2 | 31 |
| instanceinvoke %3.<@HarmoneyOpenEye/ets/views/CommonTopBar.e | 1 | 31 |
| instanceinvoke %7.<@HarmoneyOpenEye/ets/views/CustomTabLayou | 1 | 33 |
| position | 1 | 33 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.size_300') | 1 | 45 |
| staticinvoke <@%unk/%unk: .$r()>('app.media.back_mine') | 1 | 45 |

### MainPage.build

**数据流**: 39 条

| 目标方法 | 调用次数 | 示例行号 |
|----------|----------|----------|
| create | 10 | 49 |
| pop | 10 | 55 |
| instanceinvoke this.<@HarmoneyOpenEye/ets/pages/MainPage.ets | 4 | 54 |
| tabBar | 4 | 54 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.tab_bar_height') | 1 | 50 |
| constructor | 1 | 50 |
| instanceinvoke %9.<@HarmoneyOpenEye/ets/pages/home/HomePage. | 1 | 55 |
| instanceinvoke %15.<@HarmoneyOpenEye/ets/pages/find/FindPage | 1 | 60 |
| instanceinvoke %21.<@HarmoneyOpenEye/ets/pages/hot/HotPage.e | 1 | 65 |
| instanceinvoke %27.<@HarmoneyOpenEye/ets/pages/mine/MinePage | 1 | 70 |

### FindPage.build

**数据流**: 38 条

| 目标方法 | 调用次数 | 示例行号 |
|----------|----------|----------|
| create | 10 | 30 |
| pop | 10 | 31 |
| instanceinvoke this.<@HarmoneyOpenEye/ets/pages/find/FindPag | 3 | 34 |
| tabBar | 3 | 34 |
| constructor | 2 | 31 |
| instanceinvoke %2.<@HarmoneyOpenEye/ets/views/CommonTopBar.e | 1 | 31 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.size_50') | 1 | 33 |
| instanceinvoke %14.<@HarmoneyOpenEye/ets/pages/find/focus/Fo | 1 | 35 |
| instanceinvoke %21.<@HarmoneyOpenEye/ets/pages/find/category | 1 | 39 |
| instanceinvoke %28.<@HarmoneyOpenEye/ets/pages/find/topic/To | 1 | 43 |

### LoadingDialog.build

**数据流**: 30 条

| 目标方法 | 调用次数 | 示例行号 |
|----------|----------|----------|
| create | 4 | 19 |
| constructor | 4 | 20 |
| pop | 4 | 21 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.size_150') | 2 | 20 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.size_50') | 2 | 21 |
| height | 2 | 21 |
| width | 2 | 21 |
| staticinvoke <@%unk/%unk: .$r()>('app.color.color_white') | 1 | 20 |
| staticinvoke <@%unk/%unk: .$r()>('app.media.common_loading') | 1 | 21 |
| rotate | 1 | 21 |

### VideoComponent.build

**数据流**: 27 条

| 目标方法 | 调用次数 | 示例行号 |
|----------|----------|----------|
| create | 3 | 20 |
| pop | 3 | 21 |
| width | 3 | 21 |
| height | 3 | 21 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.size_50') | 2 | 57 |
| constructor | 1 | 21 |
| autoPlay | 1 | 21 |
| controls | 1 | 21 |
| onStart | 1 | 21 |
| onPause | 1 | 21 |

### HotPage.build

**数据流**: 18 条

| 目标方法 | 调用次数 | 示例行号 |
|----------|----------|----------|
| create | 5 | 15 |
| pop | 5 | 17 |
| constructor | 2 | 17 |
| instanceinvoke %3.<@HarmoneyOpenEye/ets/views/CommonTopBar.e | 1 | 17 |
| staticinvoke <@%unk/%unk: .$r()>('app.float.size_50') | 1 | 18 |
| barHeight | 1 | 18 |
| barWidth | 1 | 18 |
| barMode | 1 | 18 |
| onChange | 1 | 18 |

## 📈 数据流统计

### 按生命周期类型

- **Ability 生命周期**: 8 条数据流
- **Component 生命周期**: 619 条数据流

### 平均数据流

每个生命周期方法平均: **11.40** 条数据流

### 调用深度

- **最大深度**: 2 层
- **平均深度**: 2.00 层

---

*报告生成于 Version 3.0*
