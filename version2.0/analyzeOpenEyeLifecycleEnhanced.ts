// analyzeOpenEyeLifecycleEnhanced.ts - 增强版生命周期分析
// 区分：定义的生命周期 vs 实际使用的生命周期

import { Scene } from '../../arkanalyzer/src/Scene';
import { SceneConfig } from '../../arkanalyzer/src/Config';
import { ArkClass } from '../../arkanalyzer/src/core/model/ArkClass';
import { ArkMethod } from '../../arkanalyzer/src/core/model/ArkMethod';
import { 
    LIFECYCLE_METHOD_NAME,
    COMPONENT_LIFECYCLE_METHOD_NAME 
} from '../../arkanalyzer/src/utils/entryMethodUtils';

/**
 * 生命周期方法类型
 */
enum LifecycleType {
    ABILITY = 'Ability',
    COMPONENT = 'Component'
}

/**
 * 生命周期方法信息
 */
interface LifecycleMethodInfo {
    method: ArkMethod;
    type: LifecycleType;
    phase: string;
    className: string;
    filePath: string;
    lineNumber: number;
}

/**
 * 生命周期覆盖统计
 */
interface CoverageStats {
    methodName: string;
    isDefined: boolean;      // 是否在定义列表中
    isUsed: boolean;         // 项目中是否实际使用
    usageCount: number;      // 使用次数
    classes: string[];       // 使用该方法的类
}

/**
 * 增强版 OpenEye 生命周期分析器
 */
class EnhancedOpenEyeLifecycleAnalyzer {
    private scene: Scene;
    private lifecycleMethods: LifecycleMethodInfo[] = [];
    private abilityLifecycleStats: Map<string, CoverageStats> = new Map();
    private componentLifecycleStats: Map<string, CoverageStats> = new Map();
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.initializeStats();
    }
    
    /**
     * 初始化统计数据结构
     */
    private initializeStats(): void {
        // 初始化 Ability 生命周期统计
        for (const methodName of LIFECYCLE_METHOD_NAME) {
            this.abilityLifecycleStats.set(methodName, {
                methodName,
                isDefined: true,
                isUsed: false,
                usageCount: 0,
                classes: []
            });
        }
        
        // 初始化 Component 生命周期统计
        for (const methodName of COMPONENT_LIFECYCLE_METHOD_NAME) {
            this.componentLifecycleStats.set(methodName, {
                methodName,
                isDefined: true,
                isUsed: false,
                usageCount: 0,
                classes: []
            });
        }
    }
    
    /**
     * 识别生命周期方法
     */
    public identifyLifecycleMethods(): void {
        console.log('\n🔍 扫描项目中的生命周期方法...');
        
        const files = this.scene.getFiles();
        let totalClasses = 0;
        let abilityClasses = 0;
        let componentClasses = 0;
        
        for (const file of files) {
            const fileName = file.getName();
            
            // 跳过测试文件
            if (fileName.includes('test') || fileName.includes('Test')) {
                continue;
            }
            
            for (const cls of file.getClasses()) {
                const className = cls.getName();
                
                // 跳过默认类
                if (className.includes('_DEFAULT_') || className.includes('%')) {
                    continue;
                }
                
                totalClasses++;
                const isAbility = this.isAbilityClass(cls);
                const isComponent = this.isComponentClass(cls);
                
                if (isAbility) abilityClasses++;
                if (isComponent) componentClasses++;
                
                for (const method of cls.getMethods()) {
                    const methodName = method.getName();
                    const lineCol = method.getLineCol();
                    
                    // 检查 Ability 生命周期
                    if (isAbility && LIFECYCLE_METHOD_NAME.includes(methodName)) {
                        this.lifecycleMethods.push({
                            method: method,
                            type: LifecycleType.ABILITY,
                            phase: methodName,
                            className: className,
                            filePath: fileName,
                            lineNumber: lineCol
                        });
                        
                        const stat = this.abilityLifecycleStats.get(methodName)!;
                        stat.isUsed = true;
                        stat.usageCount++;
                        stat.classes.push(className);
                    }
                    
                    // 检查 Component 生命周期
                    if (isComponent && COMPONENT_LIFECYCLE_METHOD_NAME.includes(methodName)) {
                        this.lifecycleMethods.push({
                            method: method,
                            type: LifecycleType.COMPONENT,
                            phase: methodName,
                            className: className,
                            filePath: fileName,
                            lineNumber: lineCol
                        });
                        
                        const stat = this.componentLifecycleStats.get(methodName)!;
                        stat.isUsed = true;
                        stat.usageCount++;
                        stat.classes.push(className);
                    }
                }
            }
        }
        
        console.log(`   ✓ 扫描完成`);
        console.log(`   📦 总类数: ${totalClasses}`);
        console.log(`   📱 Ability 类: ${abilityClasses}`);
        console.log(`   🎨 Component 类: ${componentClasses}`);
        console.log(`   ✅ 发现生命周期方法: ${this.lifecycleMethods.length} 个`);
    }
    
    /**
     * 检查是否是组件类
     */
    private isComponentClass(cls: ArkClass): boolean {
        const COMPONENT_BASE = ['CustomComponent', 'ViewPU'];
        if (COMPONENT_BASE.includes(cls.getSuperClassName())) {
            return true;
        }
        if (cls.hasDecorator('Component')) {
            return true;
        }
        return false;
    }
    
    /**
     * 检查是否是 Ability 类
     */
    private isAbilityClass(cls: ArkClass): boolean {
        const ABILITY_BASE = ['UIAbility', 'Ability', 'UIExtensionAbility', 
                             'FormExtensionAbility', 'BackupExtensionAbility'];
        if (ABILITY_BASE.includes(cls.getSuperClassName())) {
            return true;
        }
        let superClass = cls.getSuperClass();
        while (superClass) {
            if (ABILITY_BASE.includes(superClass.getSuperClassName())) {
                return true;
            }
            superClass = superClass.getSuperClass();
        }
        return false;
    }
    
    /**
     * 生成覆盖率报告
     */
    public generateCoverageReport(): void {
        console.log('\n' + '='.repeat(80));
        console.log('📊 生命周期方法覆盖分析报告');
        console.log('='.repeat(80));
        
        this.printAbilityLifecycleCoverage();
        this.printComponentLifecycleCoverage();
        this.printDetailedUsage();
        this.printSummary();
    }
    
    /**
     * 打印 Ability 生命周期覆盖情况
     */
    private printAbilityLifecycleCoverage(): void {
        console.log('\n📱 Ability 生命周期覆盖情况\n');
        console.log('   方法名'.padEnd(30) + ' 状态  使用次数  使用的类');
        console.log('   ' + '-'.repeat(75));
        
        const stats = Array.from(this.abilityLifecycleStats.values());
        const usedStats = stats.filter(s => s.isUsed);
        const unusedStats = stats.filter(s => !s.isUsed);
        
        // 先显示使用的
        for (const stat of usedStats) {
            const status = '✅ 已使用';
            const classesStr = stat.classes.join(', ');
            console.log(`   ${stat.methodName.padEnd(30)} ${status}  ${stat.usageCount.toString().padStart(4)}      ${classesStr}`);
        }
        
        // 再显示未使用的
        if (unusedStats.length > 0) {
            console.log('');
            for (const stat of unusedStats) {
                const status = '⚪ 未使用';
                console.log(`   ${stat.methodName.padEnd(30)} ${status}  ${stat.usageCount.toString().padStart(4)}      -`);
            }
        }
        
        console.log(`\n   📊 统计: ${usedStats.length}/${stats.length} 种方法被使用 (${Math.round(usedStats.length/stats.length*100)}%)`);
    }
    
    /**
     * 打印 Component 生命周期覆盖情况
     */
    private printComponentLifecycleCoverage(): void {
        console.log('\n🎨 Component 生命周期覆盖情况\n');
        console.log('   方法名'.padEnd(30) + ' 状态  使用次数  使用的组件数');
        console.log('   ' + '-'.repeat(75));
        
        const stats = Array.from(this.componentLifecycleStats.values());
        const usedStats = stats.filter(s => s.isUsed);
        const unusedStats = stats.filter(s => !s.isUsed);
        
        // 按使用次数排序
        usedStats.sort((a, b) => b.usageCount - a.usageCount);
        
        // 先显示使用的
        for (const stat of usedStats) {
            const status = '✅ 已使用';
            const componentCount = new Set(stat.classes).size;
            console.log(`   ${stat.methodName.padEnd(30)} ${status}  ${stat.usageCount.toString().padStart(4)}      ${componentCount} 个组件`);
        }
        
        // 再显示未使用的
        if (unusedStats.length > 0) {
            console.log('');
            for (const stat of unusedStats) {
                const status = '⚪ 未使用';
                console.log(`   ${stat.methodName.padEnd(30)} ${status}  ${stat.usageCount.toString().padStart(4)}      -`);
            }
        }
        
        console.log(`\n   📊 统计: ${usedStats.length}/${stats.length} 种方法被使用 (${Math.round(usedStats.length/stats.length*100)}%)`);
    }
    
    /**
     * 打印详细使用情况
     */
    private printDetailedUsage(): void {
        console.log('\n📋 详细使用情况\n');
        
        // 按类型和使用频率分组
        const abilityMethods = this.lifecycleMethods.filter(m => m.type === LifecycleType.ABILITY);
        const componentMethods = this.lifecycleMethods.filter(m => m.type === LifecycleType.COMPONENT);
        
        if (abilityMethods.length > 0) {
            console.log('   📱 Ability 生命周期使用详情:\n');
            const methodsByClass = new Map<string, LifecycleMethodInfo[]>();
            for (const method of abilityMethods) {
                if (!methodsByClass.has(method.className)) {
                    methodsByClass.set(method.className, []);
                }
                methodsByClass.get(method.className)!.push(method);
            }
            
            for (const [className, methods] of methodsByClass) {
                console.log(`      ${className}:`);
                for (const method of methods) {
                    const filePath = method.filePath.split('/').slice(-2).join('/');
                    console.log(`        • ${method.phase}()  [${filePath}:${method.lineNumber}]`);
                }
                console.log('');
            }
        }
        
        if (componentMethods.length > 0) {
            console.log('   🎨 Component 生命周期使用详情 (按方法类型):\n');
            const methodsByPhase = new Map<string, LifecycleMethodInfo[]>();
            for (const method of componentMethods) {
                if (!methodsByPhase.has(method.phase)) {
                    methodsByPhase.set(method.phase, []);
                }
                methodsByPhase.get(method.phase)!.push(method);
            }
            
            // 按使用频率排序
            const sortedPhases = Array.from(methodsByPhase.entries())
                .sort((a, b) => b[1].length - a[1].length);
            
            for (const [phase, methods] of sortedPhases) {
                console.log(`      ${phase}() - ${methods.length} 个使用:`);
                for (const method of methods.slice(0, 5)) {  // 只显示前5个
                    console.log(`        • ${method.className}`);
                }
                if (methods.length > 5) {
                    console.log(`        ... 还有 ${methods.length - 5} 个组件`);
                }
                console.log('');
            }
        }
    }
    
    /**
     * 打印总结
     */
    private printSummary(): void {
        console.log('='.repeat(80));
        console.log('📈 总结\n');
        
        const totalAbilityDefined = this.abilityLifecycleStats.size;
        const totalAbilityUsed = Array.from(this.abilityLifecycleStats.values())
            .filter(s => s.isUsed).length;
        const totalAbilityUsages = Array.from(this.abilityLifecycleStats.values())
            .reduce((sum, s) => sum + s.usageCount, 0);
        
        const totalComponentDefined = this.componentLifecycleStats.size;
        const totalComponentUsed = Array.from(this.componentLifecycleStats.values())
            .filter(s => s.isUsed).length;
        const totalComponentUsages = Array.from(this.componentLifecycleStats.values())
            .reduce((sum, s) => sum + s.usageCount, 0);
        
        console.log(`   📱 Ability 生命周期:`);
        console.log(`      框架定义: ${totalAbilityDefined} 种`);
        console.log(`      项目使用: ${totalAbilityUsed} 种 (${Math.round(totalAbilityUsed/totalAbilityDefined*100)}%)`);
        console.log(`      使用实例: ${totalAbilityUsages} 个`);
        
        console.log(`\n   🎨 Component 生命周期:`);
        console.log(`      框架定义: ${totalComponentDefined} 种`);
        console.log(`      项目使用: ${totalComponentUsed} 种 (${Math.round(totalComponentUsed/totalComponentDefined*100)}%)`);
        console.log(`      使用实例: ${totalComponentUsages} 个`);
        
        console.log(`\n   ✅ 总生命周期方法实例: ${this.lifecycleMethods.length} 个`);
        
        // 推荐未使用但重要的方法
        this.printRecommendations();
        
        console.log('\n' + '='.repeat(80));
    }
    
    /**
     * 打印推荐信息
     */
    private printRecommendations(): void {
        const importantUnused = [
            { name: 'onBackPress', reason: '处理返回键，提升用户体验' },
            { name: 'aboutToReuse', reason: '组件复用优化，提升性能' },
            { name: 'aboutToRecycle', reason: '组件回收优化，提升性能' },
            { name: 'onNewWant', reason: '处理新 Intent，支持应用唤起' },
            { name: 'onConfigurationUpdate', reason: '响应系统配置变化' },
        ];
        
        const unusedInProject = importantUnused.filter(item => {
            const componentStat = this.componentLifecycleStats.get(item.name);
            const abilityStat = this.abilityLifecycleStats.get(item.name);
            return (componentStat && !componentStat.isUsed) || (abilityStat && !abilityStat.isUsed);
        });
        
        if (unusedInProject.length > 0) {
            console.log(`\n   💡 推荐关注的生命周期方法:`);
            for (const item of unusedInProject) {
                console.log(`      • ${item.name.padEnd(25)} - ${item.reason}`);
            }
        }
    }
}

/**
 * 主分析函数
 */
function analyzeEnhanced(): void {
    console.log('='.repeat(80));
    console.log('🔬 HarmoneyOpenEye 生命周期增强分析');
    console.log('='.repeat(80));
    
    try {
        // 1. 加载配置
        console.log('\n📋 加载配置...');
        const configPath = "./config.json";
        const config = new SceneConfig();
        config.buildFromJson(configPath);
        console.log(`   ✓ 项目目录: ${config.getTargetProjectDirectory()}`);
        
        // 2. 构建 Scene
        console.log('\n🏗️  构建 Scene...');
        const scene = new Scene();
        scene.buildBasicInfo(config);
        scene.buildSceneFromProjectDir(config);
        console.log('   ✓ Scene 构建完成');
        
        // 3. 类型推导
        console.log('\n🔬 类型推导...');
        scene.inferTypes();
        console.log('   ✓ 类型推导完成');
        
        console.log(`\n📚 发现 ${scene.getFiles().length} 个文件`);
        
        // 4. 创建增强分析器
        console.log('\n🔧 初始化增强分析器...');
        const analyzer = new EnhancedOpenEyeLifecycleAnalyzer(scene);
        console.log('   ✓ 分析器初始化完成');
        
        // 5. 识别生命周期方法
        analyzer.identifyLifecycleMethods();
        
        // 6. 生成覆盖率报告
        analyzer.generateCoverageReport();
        
        console.log('\n✅ 增强分析完成！');
        
    } catch (error) {
        console.error('\n❌ 分析失败:', error);
        console.error(error);
    }
}

// 执行分析
analyzeEnhanced();
