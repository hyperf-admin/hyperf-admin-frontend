export const testJson = [
  {
    logicName: '',
    name: '1',
    fuhao: '<',
    value: 1.0,
    children: [{
      logicName: '&&',
      name: '1',
      fuhao: '>',
      value: 1.1
    }, {
      logicName: '&&',
      name: '1',
      fuhao: '>',
      value: 1.2
    }]
  },
  {
    logicName: '||',
    name: '2',
    fuhao: '',
    value: ''
  },
  {
    logicName: '&&',
    name: '3',
    fuhao: '<=',
    value: 4.6
  },
  {
    logicName: '&&',
    name: '4',
    fuhao: '<=',
    value: 4.6,
    children: [{
      logicName: '&&',
      name: '1',
      fuhao: '>',
      value: 4.4
    }]
  }
]
