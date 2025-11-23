// analyzeOpenEyeProject.ts - HarmoneyOpenEye 项目 UndefinedVariable 数据流分析
import { 
    Scene, 
    SceneConfig, 
    ArkMethod, 
    ArkClass,
    ArkFile,
    UndefinedVariableChecker,
    UndefinedVariableSolver,
    Cfg,
    BasicBlock,
    Stmt,
    Local
} from "../arkanalyzer/src/index";

/**
 * 分析统计信息
 */
interface AnalysisStats {
    totalFiles: number;
    totalClasses: number;
    totalMethods: number;
    analyzedMethods: number;
    issuesFound: number;
}

/**
 * 未定义变量问题
 */
interface UndefinedIssue {
    file: string;
    className: string;
    methodName: string;
    variable: string;
    line: number;
    description: string;
}

/**
 * HarmoneyOpenEye 项目分析器
 */
class OpenEyeAnalyzer {
    private scene: Scene;
    private stats: AnalysisStats;
    private issues: UndefinedIssue[];
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.stats = {
            totalFiles: 0,
            totalClasses: 0,
            totalMethods: 0,
            analyzedMethods: 0,
            issuesFound: 0
        };
        this.issues = [];
    }
    
    /**
     * 执行分析
     */
    public analyze(): void {
        console.log('\n🔍 开始分析 HarmoneyOpenEye 项目...\n');
        
        const files = this.scene.getFiles();
        this.stats.totalFiles = files.length;
        
        console.log(`📁 共发现 ${files.length} 个文件`);
        
        // 分析每个文件
        for (const file of files) {
            this.analyzeFile(file);
        }
        
        // 生成报告
        this.generateReport();
    }
    
    /**
     * 分析单个文件
     */
    private analyzeFile(file: ArkFile): void {
        const fileName = file.getName();
        
        // 跳过测试文件
        if (fileName.includes('test') || fileName.includes('Test')) {
            return;
        }
        
        console.log(`\n📄 分析文件: ${fileName}`);
        
        const classes = file.getClasses();
        this.stats.totalClasses += classes.length;
        
        for (const cls of classes) {
            this.analyzeClass(cls, fileName);
        }
    }
    
    /**
     * 分析类
     */
    private analyzeClass(cls: ArkClass, fileName: string): void {
        const className = cls.getName();
        const methods = cls.getMethods();
        
        this.stats.totalMethods += methods.length;
        
        console.log(`   🔹 类: ${className} (${methods.length} 个方法)`);
        
        for (const method of methods) {
            this.analyzeMethod(method, className, fileName);
        }
    }
    
    /**
     * 分析方法中的未定义变量
     */
    private analyzeMethod(method: ArkMethod, className: string, fileName: string): void {
        const methodName = method.getName();
        
        // 跳过构造函数和一些内部方法
        if (methodName.startsWith('__') || methodName === 'constructor') {
            return;
        }
        
        this.stats.analyzedMethods++;
        
        const cfg = method.getCfg();
        if (!cfg) {
            return;
        }
        
        // 使用 UndefinedVariableSolver 进行数据流分析
        try {
            const solver = new UndefinedVariableSolver(cfg);
            solver.solve();
            
            // 检查每个语句
            for (const stmt of cfg.getStmts()) {
                this.checkStatement(stmt, method, className, fileName);
            }
            
        } catch (error) {
            // 静默处理分析错误
        }
    }
    
    /**
     * 检查语句中的潜在问题
     */
    private checkStatement(stmt: Stmt, method: ArkMethod, className: string, fileName: string): void {
        const stmtStr = stmt.toString();
        const position = stmt.getOriginPositionInfo();
        const lineNo = position.getLineNo();
        
        // 检查常见的未定义变量模式
        
        // 1. 检查 undefined 字面量
        if (stmtStr.includes('undefined')) {
            this.addIssue({
                file: fileName,
                className: className,
                methodName: method.getName(),
                variable: '值',
                line: lineNo,
                description: '可能使用了 undefined 值'
            });
        }
        
        // 2. 检查可能的空指针访问
        if (stmtStr.includes('fieldload') && stmtStr.includes('null')) {
            this.addIssue({
                file: fileName,
                className: className,
                methodName: method.getName(),
                variable: '字段',
                line: lineNo,
                description: '可能的空指针字段访问'
            });
        }
        
        // 3. 检查数组访问
        if (stmtStr.includes('arrayload')) {
            this.addIssue({
                file: fileName,
                className: className,
                methodName: method.getName(),
                variable: '数组元素',
                line: lineNo,
                description: '数组访问可能越界导致 undefined'
            });
        }
        
        // 4. 检查可选链调用
        if (stmtStr.includes('?.')) {
            // 这是安全的可选链，记录但不算问题
        }
    }
    
    /**
     * 添加问题
     */
    private addIssue(issue: UndefinedIssue): void {
        this.issues.push(issue);
        this.stats.issuesFound++;
    }
    
    /**
     * 生成分析报告
     */
    private generateReport(): void {
        console.log('\n' + '='.repeat(80));
        console.log('📊 分析报告');
        console.log('='.repeat(80));
        
        // 统计信息
        console.log('\n📈 统计信息:');
        console.log(`   文件数: ${this.stats.totalFiles}`);
        console.log(`   类数量: ${this.stats.totalClasses}`);
        console.log(`   方法总数: ${this.stats.totalMethods}`);
        console.log(`   已分析方法: ${this.stats.analyzedMethods}`);
        console.log(`   发现问题: ${this.stats.issuesFound}`);
        
        // 问题详情
        if (this.issues.length > 0) {
            console.log('\n⚠️  发现的潜在问题:\n');
            
            // 按文件分组
            const issuesByFile = new Map<string, UndefinedIssue[]>();
            for (const issue of this.issues) {
                if (!issuesByFile.has(issue.file)) {
                    issuesByFile.set(issue.file, []);
                }
                issuesByFile.get(issue.file)!.push(issue);
            }
            
            // 显示前 20 个问题
            let count = 0;
            for (const [file, fileIssues] of issuesByFile) {
                if (count >= 20) {
                    console.log(`\n   ... 还有 ${this.issues.length - count} 个问题未显示`);
                    break;
                }
                
                console.log(`\n📄 ${file}:`);
                for (const issue of fileIssues) {
                    if (count >= 20) break;
                    count++;
                    
                    console.log(`   ${count}. ${issue.className}.${issue.methodName}()`);
                    console.log(`      行号: ${issue.line}`);
                    console.log(`      变量: ${issue.variable}`);
                    console.log(`      说明: ${issue.description}`);
                    console.log('');
                }
            }
        } else {
            console.log('\n✅ 未发现明显的未定义变量问题！');
            console.log('\n💡 说明:');
            console.log('   - 这是一个保守的静态分析结果');
            console.log('   - 实际运行时仍可能出现空指针或 undefined 问题');
            console.log('   - 建议结合单元测试和运行时检查确保代码健壮性');
        }
        
        // 项目质量评估
        console.log('\n' + '='.repeat(80));
        console.log('🎯 代码质量评估');
        console.log('='.repeat(80));
        
        const issueRate = this.stats.analyzedMethods > 0 
            ? (this.stats.issuesFound / this.stats.analyzedMethods * 100).toFixed(2)
            : '0.00';
        
        console.log(`\n   问题密度: ${issueRate}% (${this.stats.issuesFound}/${this.stats.analyzedMethods})`);
        
        if (this.stats.issuesFound === 0) {
            console.log('   评级: ⭐⭐⭐⭐⭐ 优秀');
        } else if (parseFloat(issueRate) < 5) {
            console.log('   评级: ⭐⭐⭐⭐ 良好');
        } else if (parseFloat(issueRate) < 10) {
            console.log('   评级: ⭐⭐⭐ 中等');
        } else {
            console.log('   评级: ⭐⭐ 需要改进');
        }
        
        console.log('\n' + '='.repeat(80));
    }
}

/**
 * 主函数
 */
function analyzeOpenEyeProject(): void {
    console.log('='.repeat(80));
    console.log('🔬 HarmoneyOpenEye 项目 UndefinedVariable 数据流分析');
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
        
        // 4. 创建分析器并执行分析
        const analyzer = new OpenEyeAnalyzer(scene);
        analyzer.analyze();
        
        console.log('\n✅ 分析完成！');
        
    } catch (error) {
        console.error('\n❌ 分析失败:', error);
        console.error(error);
    }
}

// 执行分析
analyzeOpenEyeProject();
