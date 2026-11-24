import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { detalle, importar, loteDesdeHash, reintentar, tieneTareasActivas, validarArchivo } from './usuariosApi.js'
const originalFetch=globalThis.fetch
afterEach(() => { globalThis.fetch=originalFetch })
test('valida extensión, tamaño, ausencia y vacío sin intentar parsear el Excel', () => {
  assert.ok(validarArchivo(null)); assert.ok(validarArchivo({ name:'u.xls',size:10 }))
  assert.ok(validarArchivo({ name:'u.xlsx',size:0 })); assert.ok(validarArchivo({ name:'u.xlsx',size:5*1024*1024+1 }))
  assert.equal(validarArchivo({ name:'u.XLSX',size:5*1024*1024 }),'')
})
test('solo sigue consultando mientras existan correos activos', () => {
  assert.equal(tieneTareasActivas({ correos:{ PENDIENTE:1 } }),true)
  assert.equal(tieneTareasActivas({ correos:{ ENVIANDO:1 } }),true)
  assert.equal(tieneTareasActivas({ correos:{ ENVIADO:8,FALLIDO:1 } }),false)
  assert.equal(tieneTareasActivas(null),false)
})
test('restaura únicamente números de lote válidos desde el fragmento', () => {
  assert.equal(loteDesdeHash('#/dashboard/usuarios?lote=8'),'8')
  for(const hash of ['#/dashboard/usuarios','?lote=-1','?lote=0','?lote=1abc','?lote=2147483648']) assert.equal(loteDesdeHash(hash),'')
})
test('importa multipart con archivo y autentica detalle y reintento', async () => {
  const calls=[]
  globalThis.fetch=async(url,options) => { calls.push({url,options}); return Response.json({ id:8,totalUsuarios:2 }) }
  await importar(new File(['excel'],'u.xlsx'),'jwt'); await detalle(8,'jwt'); await reintentar(8,'jwt')
  assert.ok(calls[0].options.body instanceof FormData);assert.equal(calls[0].options.body.get('archivo').name,'u.xlsx')
  assert.equal(calls[0].options.headers['Content-Type'],undefined)
  assert.ok(calls[1].url.endsWith('/importaciones/8'));assert.ok(calls[2].url.endsWith('/importaciones/8/reintentar-correos'))
  assert.equal(calls[2].options.method,'POST')
  for(const call of calls) assert.equal(call.options.headers.Authorization,'Bearer jwt')
})
