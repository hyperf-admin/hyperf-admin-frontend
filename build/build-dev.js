const shell = require('shelljs')

var inquirer = require('inquirer')
let unit = ''
let smp = ''
let bundleAnlyze = ''
const handleChooseList = async() => {
    await inquirer.prompt([{
        name: 'unit',
        message: '请选择准备测试的模块',
        type: 'list',
        default: 'default',
        choices: ['default', 'system']
    }]).then(function (answers){
        unit = answers.unit
    });
    await inquirer.prompt([{
        name: 'smp',
        message: '是否需要对子项目的打包速度进行输出',
        type: 'confirm',
    }]).then(function (answers){
        smp = answers.smp ? 'samp' : ''
    });
    await inquirer.prompt([{
        name: 'bundleAnlyze',
        message: '是否需要生成bundle的可视化分析图表',
        type: 'confirm',
    }]).then(function (answers){
        bundleAnlyze = answers.bundleAnlyze ? 'BNDAL' : ''
    });
    var cmd = `cross-env BUILD_UNIT="${unit}" BUILD_SMP=${smp} BUILD_BNDAL=${bundleAnlyze} vue-cli-service serve`

    console.log()
    console.log('   $ ' + cmd)
    console.log()
    console.log('   building...')

    shell.exec(cmd)
}
handleChooseList()
