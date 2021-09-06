const currencyFormatter = require('currency-formatter');
const paramConfig = require('../config/parameters.json');
const investConfig = require('../config/investments.json');



const investment = (parameters, investments, investValue) => {
    console.log("------------------------------------------------------------------------------------------");
    console.log("--------------------------------------INVESTIMENTO----------------------------------------");
    console.log("------------------------------------------------------------------------------------------\n");

    console.log("O valor para investimento é: ", currencyFormatter.format(investValue, { code: parameters.CURRENCY }));
    console.log("\n\n");
    for (const idx in investments) {
        if (investments[idx].PERCENT > 0) {
            const valueInv = (investValue * investments[idx].PERCENT) / 100;
            console.log(investments[idx].NAME.concat(' (').concat(investments[idx].TYPE).concat(' - ').concat(investments[idx].PERCENT).concat('%):').padEnd(48), currencyFormatter.format(valueInv, { code: parameters.CURRENCY }));
        }
    }
};



const start = (investValue) => {
    console.log("\n\n");
    if (investValue <= 0) {
        console.log("------------------------------------------------------------------------------------------");
        console.log("-------------------------------NÃO HÁ VALOR PARA INVESTIMENTO---------------------------------");
        console.log("------------------------------------------------------------------------------------------\n");
    }
    else
        investment(paramConfig, investConfig.INVESTMENTS, investValue);
    console.log("\n\n");
};


module.exports =  {
    start
}