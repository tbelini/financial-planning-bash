const prompts = require('prompts');

(async () => {
  const response = await prompts([
    {
      type: 'select',
      name: 'execMode',
      message: 'What execution mode ?',
      choices: [
        { title: 'Planning', value: 'Planning' },
        { title: 'Investment', value: 'Investment' }
      ],
    }
  ]);

  console.log(response);

  if (response.execMode === 'Planning')
    console.log('Planning');
  else {
    console.log('Investment');
    const response2 = await prompts([
      {
        type: 'number',
        name: 'investVal',
        message: 'Inform de investment value:',
        initial: 0,
        style: 'default',
        float: true
      }
    ]); 

    console.log('O Valor para investimento informado é: ', response2.investVal);
  }
})();