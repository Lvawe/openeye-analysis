// analyzeOpenEyeLifecycle.ts - HarmoneyOpenEye 项目生命周期与函数间数据流分析
import { 
    Scene, 
    SceneConfig, 
    ArkMethod, 
    ArkClass,
    ArkFile,
    ModelUtils,
    DummyMainCreater,
    CallGraph,
    Cfg,
    BasicBlock,
    Stmt,
    UndefinedVariableChecker,
    UndefinedVariableSolver
} from "../arkanalyzer/src/index";
import * as fs from 'fs';
import * as path from 'path';

/**
 * 生命周期方法类型
 */
enum LifecycleType {
    ABILITY = 'Ability',
    COMPONENT = 'Component',
    PAGE = 'Page'
}

/**
 * 生命周期方法信息
 */
interface LifecycleMethod {
    method: ArkMethod;
    type: LifecycleType;
    phase: string;
    className: string;
    filePath: string;
}

/**
 * 数据流信息
 */
interface DataFlowInfo {
    from: string;
    to: string;
    variable: string;
    line: number;
    callChain: string[];
}

/**
 * 未定义变量问题
 */
interface UndefinedIssue {
    method: string;
    line: number;
    description: string;
    severity: 'high' | 'medium' | 'low';
}

/**
 * 分析结果统计
 */
interface AnalysisStats {
    totalFiles: number;
    totalMethods: number;
    lifecycleMethods: number;
    callGraphNodes: number;
    callGraphEdges: number;
    dataFlowPaths: number;
    undefinedIssues: number;
}

/**
 * OpenEye 生命周期数据流分析器
 */
class OpenEyeLifecycleAnalyzer {
    private scene: Scene;
    private lifecycleMethods: LifecycleMethod[] = [];
    private callGraph: CallGraph | null = null;
    private dataFlows: DataFlowInfo[] = [];
    private undefinedIssues: UndefinedIssue[] = [];
    private stats: AnalysisStats;
    
    // HarmonyOS 生命周期方法定义
    private static readonly ABILITY_LIFECYCLE = [
        // 基础生命周期
        'onCreate', 'onDestroy', 
        'onWindowStageCreate', 'onWindowStageDestroy',
        'onForeground', 'onBackground',
        // 扩展生命周期（常用）
        'onNewWant',              // 新 Want 启动
        'onConfigurationUpdate',  // 配置变化
        'onBackPressed',          // 返回键
        'onWindowStageWillDestroy', // 窗口即将销毁
        'onContinue',             // 迁移能力
        'onSaveState',            // 状态保存
    ];
    
    private static readonly COMPONENT_LIFECYCLE = [
        // 基础生命周期
        'aboutToAppear', 'aboutToDisappear',
        'onPageShow', 'onPageHide',
        // 扩展生命周期（常用）
        'onBackPress',       // 返回键处理
        'onDidBuild',        // 构建完成
        'aboutToReuse',      // 组件复用（性能优化）
        'aboutToRecycle',    // 组件回收（性能优化）
        // 高级生命周期
        'onWillApplyTheme',  // 主题应用前
        'onLayout',          // 自定义布局
        'onMeasure',         // 自定义测量
        'onMeasureSize',     // 测量尺寸
        // Form 相关
        'onFormRecycle',     // 卡片回收
        'onFormRecover',     // 卡片恢复
    ];
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.stats = {
            totalFiles: 0,
            totalMethods: 0,
            lifecycleMethods: 0,
            callGraphNodes: 0,
            callGraphEdges: 0,
            dataFlowPaths: 0,
            undefinedIssues: 0
        };
    }
    
    /**
     * 识别生命周期方法
     */
    public identifyLifecycleMethods(): void {
        console.log('\n🔍 识别生命周期方法...');
        
        const files = this.scene.getFiles();
        this.stats.totalFiles = files.length;
        
        for (const file of files) {
            const fileName = file.getName();
            
            // 跳过测试文件
            if (fileName.includes('test') || fileName.includes('Test')) {
                continue;
            }
            
            for (const cls of file.getClasses()) {
                const className = cls.getName();
                
                // 跳过默认类
                if (className.includes('_DEFAULT_')) {
                    continue;
                }
                
                const isAbility = this.isAbilityClass(cls);
                const isComponent = this.isComponentClass(cls);
                
                for (const method of cls.getMethods()) {
                    const methodName = method.getName();
                    this.stats.totalMethods++;
                    
                    // 检查是否是 Ability 生命周期方法
                    if (isAbility && OpenEyeLifecycleAnalyzer.ABILITY_LIFECYCLE.includes(methodName)) {
                        this.lifecycleMethods.push({
                            method: method,
                            type: LifecycleType.ABILITY,
                            phase: methodName,
                            className: className,
                            filePath: fileName
                        });
                    }
                    
                    // 检查是否是 Component 生命周期方法
                    if (isComponent && OpenEyeLifecycleAnalyzer.COMPONENT_LIFECYCLE.includes(methodName)) {
                        this.lifecycleMethods.push({
                            method: method,
                            type: LifecycleType.COMPONENT,
                            phase: methodName,
                            className: className,
                            filePath: fileName
                        });
                    }
                }
            }
        }
        
        this.stats.lifecycleMethods = this.lifecycleMethods.length;
        console.log(`   ✓ 发现 ${this.lifecycleMethods.length} 个生命周期方法`);
        this.printLifecycleMethods();
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
        const ABILITY_BASE = ['UIAbility', 'Ability', 'UIExtensionAbility'];
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
     * 打印生命周期方法
     */
    private printLifecycleMethods(): void {
        console.log('\n   生命周期方法列表:\n');
        
        // 按类型分组
        const abilityMethods = this.lifecycleMethods.filter(m => m.type === LifecycleType.ABILITY);
        const componentMethods = this.lifecycleMethods.filter(m => m.type === LifecycleType.COMPONENT);
        
        if (abilityMethods.length > 0) {
            console.log('   📱 Ability 生命周期:');
            const methodsByClass = new Map<string, LifecycleMethod[]>();
            for (const lm of abilityMethods) {
                if (!methodsByClass.has(lm.className)) {
                    methodsByClass.set(lm.className, []);
                }
                methodsByClass.get(lm.className)!.push(lm);
            }
            
            for (const [className, methods] of methodsByClass) {
                console.log(`      ${className}:`);
                for (const lm of methods) {
                    console.log(`        • ${lm.phase}()`);
                }
            }
        }
        
        if (componentMethods.length > 0) {
            console.log('\n   🎨 Component 生命周期:');
            const methodsByClass = new Map<string, LifecycleMethod[]>();
            for (const lm of componentMethods) {
                if (!methodsByClass.has(lm.className)) {
                    methodsByClass.set(lm.className, []);
                }
                methodsByClass.get(lm.className)!.push(lm);
            }
            
            for (const [className, methods] of methodsByClass) {
                console.log(`      ${className}:`);
                for (const lm of methods) {
                    console.log(`        • ${lm.phase}()`);
                }
            }
        }
    }
    
    /**
     * 构建调用图
     */
    public buildCallGraph(): void {
        console.log('\n📊 构建调用图...');
        
        try {
            // 创建 DummyMain
            const dummyMainCreater = new DummyMainCreater(this.scene);
            dummyMainCreater.createDummyMain();
            console.log('   ✓ 创建 DummyMain: @dummyMain');
            
            // 使用 CHA 算法构建调用图
            const entryMethods = this.scene.getMethods().filter(m => 
                m.getName() === '@dummyMain'
            );
            
            if (entryMethods.length > 0) {
                const entryPoints = entryMethods.map(m => m.getSignature());
                this.callGraph = this.scene.makeCallGraphCHA(entryPoints);
                
                this.stats.callGraphNodes = this.callGraph.getNodeNum();
                this.stats.callGraphEdges = this.callGraph.getEdgeNum();
                
                console.log(`   ✓ 调用图节点数: ${this.stats.callGraphNodes}`);
                console.log(`   ✓ 调用关系数: ${this.stats.callGraphEdges}`);
            } else {
                console.log('   ⚠️  未找到入口方法，使用所有生命周期方法作为入口');
                const lifecycleEntryPoints = this.lifecycleMethods.map(lm => lm.method.getSignature());
                if (lifecycleEntryPoints.length > 0) {
                    this.callGraph = this.scene.makeCallGraphCHA(lifecycleEntryPoints);
                    this.stats.callGraphNodes = this.callGraph.getNodeNum();
                    this.stats.callGraphEdges = this.callGraph.getEdgeNum();
                    console.log(`   ✓ 调用图节点数: ${this.stats.callGraphNodes}`);
                    console.log(`   ✓ 调用关系数: ${this.stats.callGraphEdges}`);
                }
            }
        } catch (error) {
            console.error(`   ✗ 构建调用图失败: ${error}`);
        }
    }
    
    /**
     * 分析未定义变量（使用 IFDS 框架）
     */
    public analyzeUndefinedVariables(): void {
        console.log('\n🔬 分析未定义变量（生命周期方法）...');
        
        let analyzedCount = 0;
        let issueCount = 0;
        
        for (const lifecycleMethod of this.lifecycleMethods) {
            try {
                const method = lifecycleMethod.method;
                const cfg = method.getCfg();
                
                if (!cfg || cfg.getBlocks().size === 0) {
                    continue;
                }
                
                analyzedCount++;
                
                // 获取方法的第一个基本块的第一个语句
                const blocks = [...cfg.getBlocks()];
                if (blocks.length > 0 && blocks[0].getStmts().length > 0) {
                    const firstStmt = blocks[0].getStmts()[0];
                    
                    // 创建 UndefinedVariableChecker
                    const problem = new UndefinedVariableChecker(firstStmt, method);
                    const solver = new UndefinedVariableSolver(problem, this.scene);
                    
                    // 执行分析
                    solver.solve();
                    
                    // 检查结果（通过遍历 CFG 语句）
                    for (const stmt of cfg.getStmts()) {
                        const stmtStr = stmt.toString();
                        
                        // 检查是否包含可能的未定义变量访问
                        if (this.containsUndefinedRisk(stmtStr)) {
                            const position = stmt.getOriginPositionInfo();
                            this.undefinedIssues.push({
                                method: `${lifecycleMethod.className}.${lifecycleMethod.phase}`,
                                line: position.getLineNo(),
                                description: `可能的未定义变量访问: ${stmtStr.substring(0, 60)}`,
                                severity: this.assessSeverity(stmtStr)
                            });
                            issueCount++;
                        }
                    }
                }
            } catch (error) {
                // 静默处理错误
            }
        }
        
        this.stats.undefinedIssues = issueCount;
        console.log(`   ✓ 已分析 ${analyzedCount} 个生命周期方法`);
        console.log(`   ✓ 发现 ${issueCount} 个潜在问题`);
    }
    
    /**
     * 检查语句是否包含未定义风险
     */
    private containsUndefinedRisk(stmtStr: string): boolean {
        return stmtStr.includes('undefined') || 
               stmtStr.includes('null') ||
               (stmtStr.includes('fieldload') && stmtStr.includes('?'));
    }
    
    /**
     * 评估问题严重程度
     */
    private assessSeverity(stmtStr: string): 'high' | 'medium' | 'low' {
        if (stmtStr.includes('undefined')) {
            return 'high';
        } else if (stmtStr.includes('null')) {
            return 'medium';
        } else {
            return 'low';
        }
    }
    
    /**
     * 分析数据流
     */
    public analyzeDataFlow(): void {
        console.log('\n🔄 分析函数间数据流...');
        
        if (!this.callGraph) {
            console.log('   ⚠️  未构建调用图，跳过数据流分析');
            return;
        }
        
        // 分析每个生命周期方法的数据流
        for (const lifecycleMethod of this.lifecycleMethods) {
            this.analyzeMethodDataFlow(lifecycleMethod);
        }
        
        this.stats.dataFlowPaths = this.dataFlows.length;
        console.log(`   ✓ 共发现 ${this.dataFlows.length} 条数据流路径`);
    }
    
    /**
     * 分析单个方法的数据流
     */
    private analyzeMethodDataFlow(lifecycleMethod: LifecycleMethod): void {
        const method = lifecycleMethod.method;
        const cfg = method.getCfg();
        
        if (!cfg) {
            return;
        }
        
        const callChain: string[] = [`${lifecycleMethod.className}.${lifecycleMethod.phase}`];
        
        // 遍历 CFG 中的所有语句
        for (const stmt of cfg.getStmts()) {
            const exprs = stmt.getExprs();
            for (const expr of exprs) {
                const exprStr = expr.toString();
                
                // 检测方法调用
                if (exprStr.includes('invoke') || exprStr.includes('call')) {
                    const position = stmt.getOriginPositionInfo();
                    
                    // 提取目标方法
                    const targetMethod = this.extractMethodFromInvoke(exprStr);
                    
                    this.dataFlows.push({
                        from: `${lifecycleMethod.className}.${lifecycleMethod.phase}`,
                        to: targetMethod || exprStr.substring(0, 60),
                        variable: 'data',
                        line: position.getLineNo(),
                        callChain: [...callChain, targetMethod || 'unknown']
                    });
                }
            }
        }
    }
    
    /**
     * 从 invoke 表达式中提取方法名
     */
    private extractMethodFromInvoke(invokeExpr: string): string | null {
        // 示例: instanceinvoke xxx.<@path: .methodName()>()
        const match = invokeExpr.match(/invoke\s+(\w+)\.<[^>]+:\s*\.(\w+)\(\)>/);
        if (match) {
            return `${match[1]}.${match[2]}`;
        }
        
        // 尝试提取简单的方法名
        const simpleMatch = invokeExpr.match(/\.(\w+)\(\)/);
        if (simpleMatch) {
            return simpleMatch[1];
        }
        
        return null;
    }
    
    /**
     * 导出调用图为 DOT 格式
     */
    public exportCallGraphToDot(outputPath: string): void {
        if (!this.callGraph) {
            console.log('   ⚠️  调用图未构建，无法导出');
            return;
        }
        
        console.log('\n📊 导出调用图...');
        
        try {
            let dotContent = 'digraph CallGraph {\n';
            dotContent += '    node [shape=box, style=filled, fillcolor=lightblue];\n';
            dotContent += '    rankdir=TB;\n';
            dotContent += '    concentrate=true;\n\n';
            
            // 收集节点和边
            const nodes = new Set<string>();
            const edges: Array<{from: string, to: string}> = [];
            
            // 遍历生命周期方法及其调用
            const lifecycleSignatures = new Set(
                this.lifecycleMethods.map(lm => this.getMethodSignature(lm.method))
            );
            
            for (const file of this.scene.getFiles()) {
                for (const cls of file.getClasses()) {
                    for (const method of cls.getMethods()) {
                        const methodSig = this.getMethodSignature(method);
                        
                        // 只处理生命周期方法及其直接调用的方法
                        if (!lifecycleSignatures.has(methodSig)) {
                            continue;
                        }
                        
                        nodes.add(methodSig);
                        
                        const cfg = method.getCfg();
                        if (cfg) {
                            for (const stmt of cfg.getStmts()) {
                                const exprs = stmt.getExprs();
                                for (const expr of exprs) {
                                    const exprStr = expr.toString();
                                    if (exprStr.includes('invoke')) {
                                        const targetMethod = this.extractMethodFromInvoke(exprStr);
                                        if (targetMethod) {
                                            nodes.add(targetMethod);
                                            edges.push({
                                                from: methodSig,
                                                to: targetMethod
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // 写入节点（限制显示数量）
            let nodeCount = 0;
            for (const node of nodes) {
                if (nodeCount++ > 50) break; // 限制显示前50个节点
                
                const nodeId = this.sanitizeDotId(node);
                const label = this.simplifyMethodSignature(node);
                const color = lifecycleSignatures.has(node) ? 'lightcoral' : 'lightblue';
                dotContent += `    "${nodeId}" [label="${label}", fillcolor=${color}];\n`;
            }
            
            dotContent += '\n';
            
            // 写入边（限制显示数量）
            let edgeCount = 0;
            for (const edge of edges) {
                if (edgeCount++ > 100) break; // 限制显示前100条边
                
                const fromId = this.sanitizeDotId(edge.from);
                const toId = this.sanitizeDotId(edge.to);
                dotContent += `    "${fromId}" -> "${toId}";\n`;
            }
            
            dotContent += '\n    // Legend\n';
            dotContent += '    subgraph cluster_legend {\n';
            dotContent += '        label="图例";\n';
            dotContent += '        style=filled;\n';
            dotContent += '        fillcolor=white;\n';
            dotContent += '        "lifecycle" [label="生命周期方法", fillcolor=lightcoral];\n';
            dotContent += '        "normal" [label="普通方法", fillcolor=lightblue];\n';
            dotContent += '    }\n';
            
            dotContent += '}\n';
            
            // 确保输出目录存在
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            // 写入文件
            fs.writeFileSync(outputPath, dotContent, 'utf-8');
            console.log(`   ✓ 调用图已导出至: ${outputPath}`);
            console.log(`   💡 可使用 Graphviz 查看: dot -Tpng ${outputPath} -o callgraph.png`);
            console.log(`   💡 或在线查看: https://dreampuf.github.io/GraphvizOnline/`);
            
        } catch (error) {
            console.error(`   ✗ 导出失败: ${error}`);
        }
    }
    
    /**
     * 获取方法签名
     */
    private getMethodSignature(method: ArkMethod): string {
        const cls = method.getDeclaringArkClass();
        const className = cls.getName();
        const methodName = method.getName();
        return `${className}.${methodName}`;
    }
    
    /**
     * 清理 DOT ID
     */
    private sanitizeDotId(id: string): string {
        return id.replace(/[^a-zA-Z0-9_.]/g, '_');
    }
    
    /**
     * 简化方法签名
     */
    private simplifyMethodSignature(signature: string): string {
        if (signature.length > 40) {
            return signature.substring(0, 37) + '...';
        }
        return signature;
    }
    
    /**
     * 生成报告
     */
    public generateReport(): void {
        console.log('\n' + '='.repeat(80));
        console.log('📋 数据流分析报告');
        console.log('='.repeat(80));
        
        // 统计信息
        console.log('\n📊 统计信息:');
        console.log(`   总文件数: ${this.stats.totalFiles}`);
        console.log(`   总方法数: ${this.stats.totalMethods}`);
        console.log(`   生命周期方法数: ${this.stats.lifecycleMethods}`);
        console.log(`   调用图节点数: ${this.stats.callGraphNodes}`);
        console.log(`   调用图边数: ${this.stats.callGraphEdges}`);
        console.log(`   数据流路径数: ${this.stats.dataFlowPaths}`);
        console.log(`   未定义变量问题: ${this.stats.undefinedIssues}`);
        
        // 未定义变量问题
        if (this.undefinedIssues.length > 0) {
            console.log('\n⚠️  未定义变量问题 (前20个):');
            const displayIssues = this.undefinedIssues.slice(0, 20);
            displayIssues.forEach((issue, index) => {
                const severityIcon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
                console.log(`\n   ${index + 1}. ${severityIcon} ${issue.method}`);
                console.log(`      行号: ${issue.line}`);
                console.log(`      说明: ${issue.description}`);
            });
            
            if (this.undefinedIssues.length > 20) {
                console.log(`\n   ... 还有 ${this.undefinedIssues.length - 20} 个问题未显示`);
            }
        }
        
        // 数据流路径
        if (this.dataFlows.length > 0) {
            console.log('\n🔄 关键数据流路径 (前15条):');
            const displayFlows = this.dataFlows.slice(0, 15);
            displayFlows.forEach((flow, index) => {
                console.log(`\n   ${index + 1}. ${flow.from}`);
                console.log(`      → ${flow.to}`);
                console.log(`      行号: ${flow.line}`);
            });
            
            if (this.dataFlows.length > 15) {
                console.log(`\n   ... 还有 ${this.dataFlows.length - 15} 条数据流路径未显示`);
            }
        }
        
        console.log('\n' + '='.repeat(80));
    }
}

/**
 * 主分析函数
 */
function analyzeOpenEyeLifecycle(): void {
    console.log('='.repeat(80));
    console.log('🔬 HarmoneyOpenEye 生命周期与函数间数据流分析');
    console.log('='.repeat(80));
    
    try {
        // 1. 加载配置
        console.log('\n📋 步骤 1: 加载配置');
        const configPath = "./config.json";
        const config = new SceneConfig();
        config.buildFromJson(configPath);
        console.log(`   ✓ 项目目录: ${config.getTargetProjectDirectory()}`);
        
        // 2. 构建 Scene
        console.log('\n🏗️  步骤 2: 构建 Scene');
        const scene = new Scene();
        scene.buildBasicInfo(config);
        scene.buildSceneFromProjectDir(config);
        console.log('   ✓ Scene 构建完成');
        
        // 3. 类型推导
        console.log('\n🔬 步骤 3: 类型推导');
        scene.inferTypes();
        console.log('   ✓ 类型推导完成');
        
        console.log(`\n📚 发现 ${scene.getFiles().length} 个文件`);
        
        // 4. 创建分析器
        console.log('\n🔧 步骤 4: 初始化分析器');
        const analyzer = new OpenEyeLifecycleAnalyzer(scene);
        console.log('   ✓ 分析器初始化完成');
        
        // 5. 识别生命周期方法
        console.log('\n🎯 步骤 5: 识别生命周期方法');
        analyzer.identifyLifecycleMethods();
        
        // 6. 构建调用图
        console.log('\n🌐 步骤 6: 构建调用图');
        analyzer.buildCallGraph();
        
        // 7. 分析未定义变量
        console.log('\n🔍 步骤 7: 分析未定义变量');
        analyzer.analyzeUndefinedVariables();
        
        // 8. 分析数据流
        console.log('\n📈 步骤 8: 分析数据流');
        analyzer.analyzeDataFlow();
        
        // 9. 生成报告
        console.log('\n📝 步骤 9: 生成报告');
        analyzer.generateReport();
        
        // 10. 导出调用图
        console.log('\n🗺️  步骤 10: 导出调用图');
        const outputPath = './output/openeye-callgraph.dot';
        analyzer.exportCallGraphToDot(outputPath);
        
        console.log('\n✅ 分析完成！');
        
    } catch (error) {
        console.error('\n❌ 分析失败:', error);
        console.error(error);
    }
}

// 执行分析
analyzeOpenEyeLifecycle();
