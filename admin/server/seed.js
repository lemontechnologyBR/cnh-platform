import { createCnh, getAllCnhs } from './db.js'

const DIEGO = {
  nome:          'DIEGO ARRIEIRA DE OLIVEIRA',
  nascimento:    '25/10/1988',
  localNascimento: 'SÃO PAULO, SP',
  cpf:           '369.065.548-08',
  docIdentidade: '47526376 DETRAN SP',
  registro:      '0404473756',
  catHab:        'AB',
  primeiraHab:   '26/02/2007',
  emissao:       '16/12/2025',
  validade:      '13/11/2035',
  nacionalidade: 'BRASILEIRO(A)',
  filiacao1:     'DIRCEU DE OLIVEIRA JUNIOR',
  filiacao2:     'DENISE ARRIEIRA DE OLIVEIRA',
  numero:        '5117172437',
  local:         'SÃO PAULO, SP',
  certA:         '36906554808',
  certB:         'SP040447375',
  mrz1:          'I<BRA0404473756<8<<<<<<<<<<<<<<',
  mrz2:          '8810254M3511135BRA<<<<<<<<<<<0',
  mrz3:          'DIEGO<<ARRIEIRA<DE<OLIVEIRA<<<',
}

const all = await getAllCnhs()
const exists = all.some(c => c.cpf === DIEGO.cpf)
if (exists) {
  console.log('Diego já cadastrado no banco.')
} else {
  const cnh = await createCnh(DIEGO)
  console.log('Diego cadastrado com ID:', cnh.id)
}
