const path = require("path");
const currencyFormatter = require('currency-formatter');
const fs = require('fs').promises;
const moment = require('moment-timezone');

const paramConfig = require('../config/parameters.json');
const planConfig = require('../config/planning.json');
const retConfig = require('../config/retirement.json');
const expConfig = require('../config/expenses.json');
const investConfig = require('../config/investments.json');


const dateNow = moment().tz('America/Sao_Paulo').format('YYYYMMDDTHHmmss');
const jsonFileName = `json/resultPlanning_${paramConfig.CURRENT_MONTH}-${paramConfig.CURRENT_YEAR}_${dateNow}.json`;
const textFileName = `text/resultPlanning_${paramConfig.CURRENT_MONTH}-${paramConfig.CURRENT_YEAR}_${dateNow}.txt`;

const jsonFile = {
    baseSalary: paramConfig.BASE_SALARY,
    currentDate: `${paramConfig.CURRENT_MONTH}-${paramConfig.CURRENT_YEAR}`,
    currentSalary: paramConfig.CURRENT_SALARY
};


let realBaseSalary = 0;
let realCurrSalary = 0;

let sumBaseFixExpenses = 0;
let sumBaseFixCardExpenses = 0;
let sumBaseCardExpenses = 0;
let sumCurrFixExpenses = 0;
let sumCurrFixCardExpenses = 0;
let sumCurrCardExpenses = 0;

let totalBaseExpenses = 0;
let percentBaseExpenses = 0;
let totalCurrExpenses = 0;
let percentCurrExpenses = 0;

let totalBaseCardExpenses = 0;
let percentBaseCardExpenses = 0;
let totalCurrCardExpenses = 0;
let percentCurrCardExpenses = 0;

let totalBaseRemaining = 0;
let percentBaseRemaining = 0;
let totalCurrRemaining = 0;
let percentCurrRemaining = 0;



const writeFileResult = async function() {
    try {
        await fs.writeFile(path.resolve(__dirname, "../result/".concat(jsonFileName)), JSON.stringify(jsonFile, null, 4));
    } catch (error) {
        console.error(`Got an error trying to write to a file: ${error.message}`);
        throw error;
    }
}



const appendFileResult = async function(text) {
    try {
        await fs.appendFile(path.resolve(__dirname, "../result/".concat(textFileName)), text);
    } catch (error) {
        console.error(`Got an error trying to write to a file: ${error.message}`);
        throw error;
    }
}



const financialPlanning = async (plans) => {
    const plannList = [];
    console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
    console.log('\x1b[31m%s\x1b[0m', '-------------------------MODELO DE PLANEJAMENTO FINANCEIRO--------------------------------');
    console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------\n');
    
    await appendFileResult('------------------------------------------------------------------------------------------\n-------------------------MODELO DE PLANEJAMENTO FINANCEIRO--------------------------------\n------------------------------------------------------------------------------------------\n');

    for (const idx in plans) {
        if (plans[idx]) {
            const obj = {
                name: plans[idx].NAME,
                percent: plans[idx].PERCENT,
                variable: plans[idx].VARIABLE
            }
            plannList.push(obj);
            
            console.log(plans[idx].NAME.concat(':').padEnd(18), plans[idx].PERCENT.toString().concat('% (').concat(plans[idx].VARIABLE).concat(')'));
            
            await appendFileResult('\n'.concat(plans[idx].NAME).concat(':').padEnd(19).concat(plans[idx].PERCENT.toString()).concat('% (').concat(plans[idx].VARIABLE).concat(')'));
        }
    }
    jsonFile.planning = plannList;
};



const retirement = async (parameters, retConf) => {
    const retList = [];
    const retirements = retConf.RETIREMENTS;
    console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
    console.log('\x1b[31m%s\x1b[0m', '--------------------------------------APOSENTADORIA---------------------------------------');
    console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------\n');

    await appendFileResult('\n\n\n\n\n\n------------------------------------------------------------------------------------------\n--------------------------------------APOSENTADORIA---------------------------------------\n------------------------------------------------------------------------------------------\n');

    const percentValue = retConf.PERCENT_VALUE / 100;

    const totalBaseValue = parameters.BASE_SALARY * percentValue;
    const totalCurrValue = parameters.CURRENT_SALARY * percentValue;

    realBaseSalary = parameters.BASE_SALARY - totalBaseValue;
    realCurrSalary = parameters.CURRENT_SALARY - totalCurrValue;

    const retire = {
        percent: retConf.PERCENT_VALUE,
        totalBaseValue: parseFloat((totalBaseValue).toFixed(2)),
        totalCurrentValue: parseFloat((totalCurrValue).toFixed(2))
    }

    console.log('A porcentagem para Aposentadoria é: ' + (percentValue * 100).toFixed(2) + '% do valor referente ao salário.\n');
    console.log('O valor de base para Aposentadoria é: ', currencyFormatter.format(totalBaseValue, { code: parameters.CURRENCY }));
    console.log('O valor atual para Aposentadoria é: ', currencyFormatter.format(totalCurrValue, { code: parameters.CURRENCY }));
    
    await appendFileResult('\nA porcentagem para Aposentadoria é: '.concat((percentValue * 100).toFixed(2)).concat('% do valor referente ao salário.\n')
        .concat('\nO valor de base para Aposentadoria é: ').concat(currencyFormatter.format(totalBaseValue, { code: parameters.CURRENCY }))
        .concat('\nO valor atual para Aposentadoria é: ').concat(currencyFormatter.format(totalCurrValue, { code: parameters.CURRENCY })).concat('\n'));
    
    for (var v in retirements) {
        if (retirements[v].PERCENT > 0) {
            const retBaseValue = (totalBaseValue * retirements[v].PERCENT) / 100;
            const retCurrValue = (totalCurrValue * retirements[v].PERCENT) / 100;
            const obj = {
                name: retirements[v].NAME,
                percent: retirements[v].PERCENT,
                baseValue: parseFloat((retBaseValue).toFixed(2)),
                currentValue: parseFloat((retCurrValue).toFixed(2))
            }
            retList.push(obj);
            console.log('\n');
            console.log('\x1b[33m%s\x1b[0m', retirements[v].NAME.concat(':'));
            console.log('Valor Base'.concat(':').padEnd(15), currencyFormatter.format(retBaseValue, { code: parameters.CURRENCY }));
            console.log('Valor Atual'.concat(':').padEnd(15), currencyFormatter.format(retCurrValue, { code: parameters.CURRENCY }));

            await appendFileResult('\n'.concat(retirements[v].NAME).concat(':'));
            await appendFileResult('\nValor Base'.concat(':').padEnd(15).concat(currencyFormatter.format(retBaseValue, { code: parameters.CURRENCY })));
            await appendFileResult('\nValor Atual'.concat(':').padEnd(15).concat(currencyFormatter.format(retCurrValue, { code: parameters.CURRENCY })));
        }
    }
    retire.approachList = retList;
    jsonFile.retirement = retire;
    jsonFile.realBaseSalary = parseFloat((realBaseSalary).toFixed(2));
    jsonFile.realCurrentSalary = parseFloat((realCurrSalary).toFixed(2));
};



const expenses = async (parameters, expenses) => {
    const expFixList = [];
    const expCrdList = [];
    const fixedAccount = expenses.FIXED_ACCOUNT;
    const fixedCard = expenses.FIXED_CARD;
    const card = expenses.CARD;

    console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
    console.log('\x1b[31m%s\x1b[0m', '---------------------------------DESPESAS FIXAS-------------------------------------------');
    console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');

    await appendFileResult('\n\n\n\n\n\n------------------------------------------------------------------------------------------\n---------------------------------DESPESAS FIXAS-------------------------------------------\n------------------------------------------------------------------------------------------');
    
    const expense = {};
    
    for (const idxExp in fixedAccount) {
        if (fixedAccount[idxExp].BASE_VALUE > 0 || fixedAccount[idxExp].CURRENT_VALUE > 0) {
            console.log('\n');
            console.log('\x1b[33m%s\x1b[0m', fixedAccount[idxExp].NAME.concat(':'));
            console.log('Valor Base'.concat(':').padEnd(25), currencyFormatter.format(fixedAccount[idxExp].BASE_VALUE, { code: parameters.CURRENCY }));
            console.log('Valor Atual'.concat(':').padEnd(25), currencyFormatter.format(fixedAccount[idxExp].CURRENT_VALUE, { code: parameters.CURRENCY }));
            
            await appendFileResult('\n\n'.concat(fixedAccount[idxExp].NAME).concat(':'));
            await appendFileResult('\nValor Base'.concat(':').padEnd(25).concat(currencyFormatter.format(fixedAccount[idxExp].BASE_VALUE, { code: parameters.CURRENCY })));
            await appendFileResult('\nValor Atual'.concat(':').padEnd(25).concat(currencyFormatter.format(fixedAccount[idxExp].CURRENT_VALUE, { code: parameters.CURRENCY })));
            
            sumBaseFixExpenses += fixedAccount[idxExp].BASE_VALUE;
            sumCurrFixExpenses += fixedAccount[idxExp].CURRENT_VALUE;
            const obj = {
                name: fixedAccount[idxExp].NAME,
                baseValue: fixedAccount[idxExp].BASE_VALUE,
                currentValue: fixedAccount[idxExp].CURRENT_VALUE
            }
            expFixList.push(obj);
        }
    }
    for (const idxCrd in fixedCard) {
        if (fixedCard[idxCrd].BASE_VALUE > 0 || fixedCard[idxCrd].CURRENT_VALUE > 0) {
            console.log('\n');
            console.log('\x1b[33m%s\x1b[0m', fixedCard[idxCrd].NAME.concat(':'));
            console.log('Valor Base'.concat(':').padEnd(25), currencyFormatter.format(fixedCard[idxCrd].BASE_VALUE, { code: parameters.CURRENCY }));
            console.log('Valor Atual'.concat(':').padEnd(25), currencyFormatter.format(fixedCard[idxCrd].CURRENT_VALUE, { code: parameters.CURRENCY }));
            
            await appendFileResult('\n\n'.concat(fixedCard[idxCrd].NAME).concat(':'));
            await appendFileResult('\nValor Base'.concat(':').padEnd(25).concat(currencyFormatter.format(fixedCard[idxCrd].BASE_VALUE, { code: parameters.CURRENCY })));
            await appendFileResult('\nValor Atual'.concat(':').padEnd(25).concat(currencyFormatter.format(fixedCard[idxCrd].CURRENT_VALUE, { code: parameters.CURRENCY })));
            
            sumBaseFixCardExpenses += fixedCard[idxCrd].BASE_VALUE;
            sumCurrFixCardExpenses += fixedCard[idxCrd].CURRENT_VALUE;
            const obj = {
                name: fixedCard[idxCrd].NAME,
                baseValue: fixedCard[idxCrd].BASE_VALUE,
                currentValue: fixedCard[idxCrd].CURRENT_VALUE
            }
            expFixList.push(obj);
        }
    }

    console.log('\n\n');
    totalBaseExpenses = sumBaseFixExpenses + sumBaseFixCardExpenses;
    totalCurrExpenses = sumCurrFixExpenses + sumCurrFixCardExpenses;
    
    percentBaseExpenses = totalBaseExpenses / realBaseSalary;
    percentCurrExpenses = totalCurrExpenses / realCurrSalary;

    expense.fixed = {
        baseAmount: {
            totalValue: parseFloat((totalBaseExpenses).toFixed(2)),
            percent: parseFloat((percentBaseExpenses * 100).toFixed(2))
        },
        currentAmount: {
            totalValue: parseFloat((totalCurrExpenses).toFixed(2)),
            percent: parseFloat((percentCurrExpenses * 100).toFixed(2))
        },
        detailList: expFixList
    };

    console.log('O valor de despesas fixas Base é: ', currencyFormatter.format(totalBaseExpenses, { code: parameters.CURRENCY }));
    console.log('A porcentagem de despesas fixas Base é: ' + (percentBaseExpenses * 100).toFixed(2) + '%');
    console.log('\n');
    console.log('O valor de despesas fixas Atual é: ', currencyFormatter.format(totalCurrExpenses, { code: parameters.CURRENCY }));
    console.log('A porcentagem de despesas fixas Atual é: ' + (percentCurrExpenses * 100).toFixed(2) + '%');


    await appendFileResult('\n\n\nO valor de despesas fixas Base é: '.concat(currencyFormatter.format(totalBaseExpenses, { code: parameters.CURRENCY }))
        .concat('\nA porcentagem de despesas fixas Base é: ').concat((percentBaseExpenses * 100).toFixed(2)).concat('%\n\n')
        .concat('\nO valor de despesas fixas Atual é: ').concat(currencyFormatter.format(totalCurrExpenses, { code: parameters.CURRENCY }))
        .concat('\nA porcentagem de despesas fixas Atual é: ').concat((percentCurrExpenses * 100).toFixed(2)).concat('%\n'));


    console.log('\n\n\n\n');
    console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
    console.log('\x1b[31m%s\x1b[0m', '---------------------------------DESPESAS DO CARTÃO---------------------------------------');
    console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');

    await appendFileResult('\n\n\n\n\n------------------------------------------------------------------------------------------\n---------------------------------DESPESAS DO CARTÃO---------------------------------------\n------------------------------------------------------------------------------------------');

    for (const idx in card) {
        if (card[idx].BASE_VALUE > 0 || card[idx].CURRENT_VALUE > 0) {
            console.log('\n');
            console.log('\x1b[33m%s\x1b[0m', card[idx].BANK.concat(' (').concat(card[idx].BRAND).concat('):'));
            console.log('Valor Base'.concat(':').padEnd(25), currencyFormatter.format(card[idx].BASE_VALUE, { code: parameters.CURRENCY }));
            console.log('Valor Atual'.concat(':').padEnd(25), currencyFormatter.format(card[idx].CURRENT_VALUE, { code: parameters.CURRENCY }));
            
            await appendFileResult('\n\n'.concat(card[idx].BANK).concat(' (').concat(card[idx].BRAND).concat('):'));
            await appendFileResult('\nValor Base'.concat(':').padEnd(25).concat(currencyFormatter.format(card[idx].BASE_VALUE, { code: parameters.CURRENCY })));
            await appendFileResult('\nValor Atual'.concat(':').padEnd(25).concat(currencyFormatter.format(card[idx].CURRENT_VALUE, { code: parameters.CURRENCY })));
            
            sumBaseCardExpenses += card[idx].BASE_VALUE;
            sumCurrCardExpenses += card[idx].CURRENT_VALUE;
            const obj = {
                bank: card[idx].BANK,
                brand: card[idx].BRAND,
                baseValue: card[idx].BASE_VALUE,
                currentValue: card[idx].CURRENT_VALUE
            }
            expCrdList.push(obj);
        }
    }

    console.log('\n\n');
    totalBaseCardExpenses = sumBaseCardExpenses - sumBaseFixCardExpenses;
    totalCurrCardExpenses = sumCurrCardExpenses - sumCurrFixCardExpenses;

    percentBaseCardExpenses = totalBaseCardExpenses / realBaseSalary;
    percentCurrCardExpenses = totalCurrCardExpenses / realCurrSalary;

    expense.card = {
        baseAmount: {
            totalValue: parseFloat((totalBaseCardExpenses).toFixed(2)),
            percent: parseFloat((percentBaseCardExpenses * 100).toFixed(2))
        },
        currentAmount: {
            totalValue: parseFloat((totalCurrCardExpenses).toFixed(2)),
            percent: parseFloat((percentCurrCardExpenses * 100).toFixed(2))
        },
        detailList: expCrdList
    };

    console.log('O valor de despesas no cartão Base é: ', currencyFormatter.format(totalBaseCardExpenses, { code: parameters.CURRENCY }));
    console.log('A porcentagem de despesas no cartão Base é: ' + (percentBaseCardExpenses * 100).toFixed(2) + '%');
    console.log('\n');
    console.log('O valor de despesas no cartão Atual é: ', currencyFormatter.format(totalCurrCardExpenses, { code: parameters.CURRENCY }));
    console.log('A porcentagem de despesas no cartão Atual é: ' + (percentCurrCardExpenses * 100).toFixed(2) + '%');

    await appendFileResult('\n\n\nO valor de despesas no cartão Base é: '.concat(currencyFormatter.format(totalBaseCardExpenses, { code: parameters.CURRENCY }))
        .concat('\nA porcentagem de despesas no cartão Base é: ').concat((percentBaseCardExpenses * 100).toFixed(2)).concat('%\n\n')
        .concat('\nO valor de despesas no cartão Atual é: ').concat(currencyFormatter.format(totalCurrCardExpenses, { code: parameters.CURRENCY }))
        .concat('\nA porcentagem de despesas no cartão Atual é: ').concat((percentCurrCardExpenses * 100).toFixed(2)).concat('%'));

    jsonFile.expenses = expense;
};



const remainingValue = async (parameters) => {
    console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
    console.log('\x1b[31m%s\x1b[0m', '-------------------------------------VALOR RESTANTE---------------------------------------');
    console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');

    await appendFileResult('\n\n\n\n\n\n------------------------------------------------------------------------------------------\n-------------------------------------VALOR RESTANTE---------------------------------------\n------------------------------------------------------------------------------------------\n');

    totalBaseRemaining = realBaseSalary - (totalBaseExpenses + totalBaseCardExpenses);
    percentBaseRemaining = totalBaseRemaining <= 0 ? 0 : 1 - (percentBaseExpenses + percentBaseCardExpenses);

    totalCurrRemaining = realCurrSalary - (totalCurrExpenses + totalCurrCardExpenses);
    percentCurrRemaining = totalCurrRemaining <= 0 ? 0 : 1 - (percentCurrExpenses + percentCurrCardExpenses);
    
    const remaining = {
        baseAmount: {
            totalValue: parseFloat((totalBaseRemaining).toFixed(2)),
            percent: parseFloat((percentBaseRemaining * 100).toFixed(2))
        },
        currentAmount: {
            totalValue: parseFloat((totalCurrRemaining).toFixed(2)),
            percent: parseFloat((percentCurrRemaining * 100).toFixed(2))
        }
    };

    console.log('\n');
    console.log('O valor Base restante é: ', totalBaseRemaining <= 0 ? 'NEGATIVO ' : '', currencyFormatter.format(totalBaseRemaining, { code: parameters.CURRENCY }));
    console.log('A porcentagem Base restante é: ' + (percentBaseRemaining * 100).toFixed(2) + '%');
    console.log('\n');
    console.log('O valor Atual restante é: ', totalCurrRemaining <= 0 ? 'NEGATIVO ' : '', currencyFormatter.format(totalCurrRemaining, { code: parameters.CURRENCY }));
    console.log('A porcentagem Atual restante é: ' + (percentCurrRemaining * 100).toFixed(2) + '%');

    
    await appendFileResult('\n\nO valor Base restante é: '.concat(totalBaseRemaining <= 0 ? 'NEGATIVO ' : '').concat(currencyFormatter.format(totalBaseRemaining, { code: parameters.CURRENCY }))
        .concat('\nA porcentagem Base restante é: ').concat((percentBaseRemaining * 100).toFixed(2)).concat('%\n\n')
        .concat('\nO valor Atual restante é: ').concat(totalCurrRemaining <= 0 ? 'NEGATIVO ' : '').concat(currencyFormatter.format(totalCurrRemaining, { code: parameters.CURRENCY }))
        .concat('\nA porcentagem Atual restante é: ').concat((percentCurrRemaining * 100).toFixed(2)).concat('%'));

    jsonFile.remainingBalance = remaining;
};



const investmentSimulation = async (parameters, investments) => {
    const investList = [];
    const invest = {};

    if (totalBaseRemaining <= 0 && totalCurrRemaining <= 0) {
        console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
        console.log('\x1b[31m%s\x1b[0m', '-------------------------------NÃO HÁ VALOR PARA INVESTIMENTO-----------------------------');
        console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------\n');

        await appendFileResult('\n\n\n\n\n\n------------------------------------------------------------------------------------------\n-------------------------------NÃO HÁ VALOR PARA INVESTIMENTO-----------------------------\n------------------------------------------------------------------------------------------\n');
    }
    else{
        console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');
        console.log('\x1b[31m%s\x1b[0m', '---------------------------------SIMULAÇÃO INVESTIMENTO-----------------------------------');
        console.log('\x1b[31m%s\x1b[0m', '------------------------------------------------------------------------------------------');

        await appendFileResult('\n\n\n\n\n\n------------------------------------------------------------------------------------------\n---------------------------------SIMULAÇÃO INVESTIMENTO-----------------------------------\n------------------------------------------------------------------------------------------\n');

        for (const idx in investments) {
            if (investments[idx].PERCENT > 0) {
                const valueBaseInv = (totalBaseRemaining * investments[idx].PERCENT) / 100;
                const valueCurrInv = (totalCurrRemaining * investments[idx].PERCENT) / 100;
                const obj = {
                    name: investments[idx].NAME,
                    type: investments[idx].TYPE,
                    percent: investments[idx].PERCENT,
                    baseValue: valueBaseInv > 0 ? parseFloat((valueBaseInv).toFixed(2)) : 0,
                    currentValue: valueCurrInv > 0 ? parseFloat((valueCurrInv).toFixed(2)) : 0
                };
                investList.push(obj);
                console.log('\n');
                console.log('\x1b[33m%s\x1b[0m', investments[idx].NAME.concat(' (').concat(investments[idx].TYPE).concat(' - ').concat(investments[idx].PERCENT).concat('%):'));
                console.log('Valor Base'.concat(':').padEnd(48), currencyFormatter.format(valueBaseInv > 0 ? valueBaseInv : 0, { code: parameters.CURRENCY }));
                console.log('Valor Atual'.concat(':').padEnd(48), currencyFormatter.format(valueCurrInv > 0 ? valueCurrInv : 0, { code: parameters.CURRENCY }));

                await appendFileResult('\n'.concat(investments[idx].NAME).concat(' (').concat(investments[idx].TYPE).concat(' - ').concat(investments[idx].PERCENT).concat('%):'));
                await appendFileResult('\nValor Base'.concat(':').padEnd(48).concat(currencyFormatter.format(valueBaseInv > 0 ? valueBaseInv : 0, { code: parameters.CURRENCY })));
                await appendFileResult('\nValor Atual'.concat(':').padEnd(48).concat(currencyFormatter.format(valueCurrInv > 0 ? valueCurrInv : 0, { code: parameters.CURRENCY })).concat('\n'));
            }
        }
    }
    invest.approachList = investList;
    jsonFile.investment = invest;
};


const start = async () => {
    console.log('\n\n');
    await financialPlanning(planConfig.PLANNING);
    console.log('\n\n\n\n\n\n');

    await retirement(paramConfig, retConfig);
    console.log('\n\n\n\n\n\n');

    await expenses(paramConfig, expConfig);
    console.log('\n\n\n\n\n\n');

    await remainingValue(paramConfig);
    console.log('\n\n\n\n\n\n');
    
    await investmentSimulation(paramConfig, investConfig.INVESTMENTS);
    console.log('\n\n');

    try {
        await writeFileResult();        
    } catch (error) {
        throw error;
    }
};


module.exports =  {
    start
}