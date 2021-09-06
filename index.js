const prompts = require('prompts');
const invest = require('./source/investment');
const plann = require('./source/planning');


(async () => {
  const responseSelect = await prompts([
    {
      type: 'select',
      name: 'execMode',
      message: 'Qual o modelo de execução ?',
      choices: [
        { title: 'Planejamento', value: 'Planning' },
        { title: 'Investimento', value: 'Investment' }
      ],
    }
  ]);

  //console.log(responseSelect);

  if (responseSelect.execMode === 'Planning') {
    console.log('Planning');
    await plann.start();
  }
  else {
    console.log('Investment');
    const responseValor = await prompts([
      {
        type: 'number',
        name: 'investVal',
        message: 'Informar o valor para investimento:',
        initial: 0,
        style: 'default',
        float: true
      }
    ]); 
    await invest.start(responseValor.investVal);
  }
})();