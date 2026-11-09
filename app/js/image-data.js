/*
 * app/js/image-data.js
 * Dados de mapeamento: nome do arquivo de imagem -> textos do card.
 * Edite somente este arquivo ao trocar fotos ou corrigir textos.
 */
window.IMAGE_META = {
  /*
   * Padrão do nome SEM extensão. Exemplo de nome aceito:
   *   nike_air-force-1_branco_38-44_299-90.webp
   * Ajuste a ordem dos grupos ou o separador "_" se os nomes forem diferentes.
   */
  pattern: /^(?<marca>[^_]+)_(?<modelo>[^_]+)_(?<cor>[^_]+)_(?<tamanhos>[^_]+)_(?<preco>[^_]+)$/i,

  /*
   * Correções manuais por nome de arquivo (sem extensão, em minúsculas).
   * Valores aqui têm prioridade sobre o que o padrão extrai.
   * Preço e tamanhos devem ser escritos já formatados.
   *
   * Exemplo:
   * "nike_air-force-1_branco_38-44_299-90": {
   *   marca: "Nike",
   *   modelo: "Air Force 1",
   *   cor: "Branco",
   *   tamanhos: "Tamanhos 38 ao 44",
   *   preco: "R$ 299,90"
   * }
   */ 
  overrides: {}/*
 * app/js/image-data.js
 * Lista de arquivos, nomes de marcas/cores e correções manuais.
 * Ao adicionar uma foto nova em app/img/otimizadas/, inclua o nome aqui.
 */
window.IMAGE_META = {
  // Pasta das imagens otimizadas no GitHub (usada para montar o link de cada card)
  baseUrl: 'https://raw.githubusercontent.com/yaknayshvydshe/newtenistore/refs/heads/main/app/img/otimizadas/',

  // Nomes de marca que não podem ser só "capitalizados"
  brands: {
    'cocacola': 'Coca-Cola',
    'newbalance': 'New Balance',
    "d'matias": "D'Matias",
    'santalolla': 'Santa Lolla'
  },

  // Palavras que indicam início das cores (separam modelo de cor)
  colorWords: [
    'branco', 'branca', 'preto', 'preta', 'cinza', 'nude', 'rosa', 'rose', 'pink',
    'azul', 'marinho', 'ouro', 'dourado', 'caramelo', 'nozes', 'creme', 'palha',
    'jeans', 'jeansdenim', 'denim', 'holografico', 'offwhite', 'champagne',
    'tobacco', 'onca', 'danoninho', 'bb', 'purple', 'arcoiris', 'camurcadulce',
    'verde', 'vermelho'
  ],

  // Nomes de exibição para cores que não são só capitalizadas
  colorNames: {
    'offwhite': 'Off-white',
    'jeansdenim': 'Jeans Denim',
    'arcoiris': 'Arco-íris',
    'camurcadulce': 'Camurça Dulce',
    'holografico': 'Holográfico',
    'onca': 'Onça',
    'bb': 'BB',
    'danoninho': 'Danoninho'
  },

  /*
   * Correções por nome de arquivo (sem extensão, minúsculas).
   * Exemplo para trocar a ordem das cores:
   * "veja-v023-branco-preto-35-36-37-129'90": { cor: "Preto e Branco" }
   * Campos aceitos: marca, modelo, cor (texto), tamanhos (array de texto), preco (número)
   */
  overrides: {},

  files: [
    "addan-mocassin-branco-39-99'90.webp",
    "adidas-4run-branco-34-35-36-149'90.webp",
    "adidas-add01-branco-40-42-139'90.webp",
    "adidas-adwhite-branco-ouro-light-34-37-149'90.webp",
    "adidas-campus00s-nude-branco-35-36-37-38-149'90.webp",
    "adidas-futurecraft4d-pink-35-37-99'90.webp",
    "adidas-futurecraft4d-preto-38-39-40-41-99'90.webp",
    "adidas-kids-preto-branco-27-28-29-30-31-32-33-89'90.webp",
    "adidas-samba-branco-azul-36-149'90.webp",
    "adidas-samba-cinza-preto-34-35-37-129'90.webp",
    "adidas-slipon-preto-34-35-36-37-99'90.webp",
    "adidas-superstar-branco-34-35-36-37-39-149'90.webp",
    "arezzo-casual-branco-onca-39-99'90.webp",
    "boots-botas-meias-preto-35-99'90.webp",
    "boots-botas-ziper-preta-34-36-99'90.webp",
    "boots-coturno-pelucia-preto-34-36-99'90.webp",
    "cocacola-chinelo-pink-33-34-35-36-19'90.webp",
    "cocacola-chinelo-preto-33-34-19'90.webp",
    "cocacola-chinelo-purple-33-34-24'90.webp",
    "colcci-bolsa-rosa-69'90.webp",
    "converse-allstar-branco-36-99'90.webp",
    "converse-allstar-branco-37-109'90.webp",
    "converse-allstar-caramelo-35-37-109'90.webp",
    "converse-allstar-danoninho-35-36-37-38-109'90.webp",
    "converse-allstar-nozes-34-35-39-109'90.webp",
    "converse-allstar-preto-36-37-38-39-41-42-109'90.webp",
    "converse-allstar-preto-36-99'90.webp",
    "d'matias-slipon-preto-36-79'90.webp",
    "fila-running-pink-34-99'90.webp",
    "futurewear-tad4-champagne-offwhite-35-36-37-38-149'90.webp",
    "ipanema-chinelo-preto-41-42-29'90.webp",
    "lacoste-noruega-branco-39-40-42-43-129'90.webp",
    "lacoste-social-preto-40-99'90.webp",
    "newbalance-casual-branco-36-37-149'90.webp",
    "nike-7001ink-preto-42-199'90.webp",
    "nike-7099kill-branco-35-37-38-39-40-139'90.webp",
    "nike-7099kill-creme-nude-37-38-139'90.webp",
    "nike-air-force-branco-34-35-36-37-38-39-42-129'90.webp",
    "nike-air-force-branco-holografico-37-149'90.webp",
    "nike-air-force-caramelo-40-41-43-199'90.webp",
    "nike-air-force-jeans-branco-34-99'90.webp",
    "nike-air-force-jeans-preto-branco-37-38-139'90.webp",
    "nike-air-force-jeans-rose-branco-35-36-37-39-139'90.webp",
    "nike-air-force-nude-branco-dourado-37-149'90.webp",
    "nike-air-force-preto-35-36-37-38-39-42-43-129'90.webp",
    "nike-dunk-low-branco-34-139'90.webp",
    "nike-dunk-low-cinza-hidra-laminate-36-37-149'90.webp",
    "nike-dunk-low-dourado-35-149'90.webp",
    "nike-dunk-low-palha-36-149'90.webp",
    "nike-kids-air-force-cinza-27-28-30-32-33-89'90.webp",
    "nike-kids-air-force-pink-26-27-29-32-33-99'90.webp",
    "nike-kids-air-force-preto-28-29-30-31-32-89'90.webp",
    "nike-x4zoom-marinho-pink-36-39-99'90.webp",
    "nike-x4zoom-preto-pink-36-99'90.webp",
    "puma-casual-branco-35-36-119'90.webp",
    "puma-casual-rose-36-99'90.webp",
    "redley-shoe-preto-35-36-39-99'90.webp",
    "reserva-slipon-preto-41-42-139'90.webp",
    "running-slipon-pink-35-37-39-49'90.webp",
    "santalolla-slipon-34-36-37-38-39-99'90.webp",
    "santalolla-slipon-azul-bb-34-35-79'90.webp",
    "santalolla-slipon-palha-34-79'90.webp",
    "santalolla-slipon-preto-37-38-39-89'90.webp",
    "soultz-sophya-offwhite-34-49'90.webp",
    "vans-1144vs-preto-35-36-37-119'90.webp",
    "vans-kids-preto-branco-26-28-29-30-31-33-89'90.webp",
    "vans-oldskool-1300kni-35-36-149'90.webp",
    "vans-oldskool-azul-37-43-119'90.webp",
    "vans-oldskool-nude-34-35-36-37-114'90.webp",
    "vans-oldskool-preto-35-37-39-41-124'90.webp",
    "vans-oldskool-preto-branco-34-35-36-38-41-42-109'90.webp",
    "vans-oldskool-tobacco-35-36-40-41-119'90.webp",
    "vans-ultrarange-marinho-branco-35-36-37-38-39-99'90.webp",
    "vans-ultrarange-preto-38-41-99'90.webp",
    "veja-8002voi-35-36-37-38-39-40-129'90.webp",
    "veja-casual-preto-branco-35-37-39-149'90.webp",
    "veja-v023-branco-preto-35-36-37-129'90.webp",
    "veja-v023-offwhite-jeansdenim-34-36-39-129'90.webp",
    "veja-x180-10-camurcadulce-offwhite-35-36-39-149'90.webp",
    "walking-papete-nude-38-79'90.webp",
    "walking-rasteirinha-arco-iris-34-37-49'90.webp",
    "walking-rasteirinha-nude-34-35-36-37-38-39-79'90.webp"
  ]
},
}