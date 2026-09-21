/* ===================== KATEGORIJE I IKONICE ===================== */
const CATS = [
  {id:'arh', name:'Arhitektura i zgrade', icon:'building'},
  {id:'ulice', name:'Ulice i trgovi', icon:'street'},
  {id:'vrbas', name:'Vrbas i mostovi', icon:'bridge'},
  {id:'kastel', name:'Kastel', icon:'castle'},
  {id:'vjera', name:'Vjerski objekti', icon:'church'},
  {id:'zeljeznica', name:'Željeznica i saobraćaj', icon:'train'},
  {id:'parkovi', name:'Parkovi i priroda', icon:'tree'},
  {id:'naselja', name:'Naselja', icon:'houses'},
  {id:'panorame', name:'Panorame grada', icon:'panorama'},
  {id:'zivot', name:'Život u gradu', icon:'people'},
];
const ICONS = {
  building:'<path d="M4 21V6l8-3 8 3v15" stroke-linejoin="round"/><path d="M9 21v-6h6v6" /><path d="M9 10h.01M9 14h.01M15 10h.01M15 14h.01"/>',
  street:'<path d="M6 3L3 21M18 3l3 18M11 8h2M10 13h4M9 18h6"/>',
  bridge:'<path d="M2 16c3-4 6-4 10-4s7 0 10 4M4 16v4M20 16v4M9 12v-3M15 12v-3M12 9V6"/>',
  castle:'<path d="M4 21V10h3V7h3V4h4v3h3v3h3v11z" stroke-linejoin="round"/><path d="M4 10h16M9 21v-5h6v5"/>',
  church:'<path d="M12 3v3M10 5h4M6 21V11L12 6l6 5v10z" stroke-linejoin="round"/><path d="M6 21h12M12 21v-6h0"/>',
  train:'<rect x="5" y="4" width="14" height="12" rx="2"/><path d="M5 12h14M8 20l-2 2M16 20l2 2M8 8h2M14 8h2"/>',
  tree:'<path d="M12 3l5 7h-3l4 5h-4v6h-4v-6H6l4-5H7z" stroke-linejoin="round"/>',
  houses:'<path d="M3 21V11l5-4 5 4v10M13 21v-7l4-3 4 3v7" stroke-linejoin="round"/>',
  panorama:'<path d="M3 18l5-7 4 5 3-4 6 6" stroke-linejoin="round"/><circle cx="7" cy="8" r="1.6"/>',
  people:'<circle cx="9" cy="8" r="2.4"/><circle cx="17" cy="9" r="2"/><path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M14 20c.3-2 1.8-3.6 4-3.6s3.7 1.6 4 3.6"/>',
};
function iconSvg(name,size=22){return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">${ICONS[name]||ICONS.building}</svg>`;}
function catInfo(id){return CATS.find(c=>c.id===id) || {id:id,name:id||'Nekategorisano',icon:'building'};}

const PALETTES = [
  {beforeA:'#C9AD7C',beforeB:'#8B6239',afterA:'#B9C7C0',afterB:'#3E6E63'},
  {beforeA:'#D3B98F',beforeB:'#9C6B3B',afterA:'#AEC2CB',afterB:'#2E5C66'},
  {beforeA:'#CBB081',beforeB:'#7C5430',afterA:'#C3CBB4',afterB:'#4C6640'},
];
function placeholderArt(pc,mode){
  const pal = PALETTES[(pc.palette||0)%PALETTES.length];
  const ic = catInfo(pc.cat).icon;
  if(mode==='back'){
    return `<svg class="postcard-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill="#F6F1E6"/>
      <line x1="200" y1="20" x2="200" y2="280" stroke="#2B2620" stroke-width="1" opacity="0.35"/>
      <line x1="30" y1="60" x2="180" y2="60" stroke="#2B2620" stroke-width="1" opacity="0.25"/>
      <line x1="30" y1="90" x2="180" y2="90" stroke="#2B2620" stroke-width="1" opacity="0.25"/>
      <line x1="30" y1="120" x2="150" y2="120" stroke="#2B2620" stroke-width="1" opacity="0.25"/>
      <rect x="300" y="30" width="60" height="45" fill="none" stroke="#9C3B2E" stroke-width="1.4" opacity="0.6"/>
      <text x="330" y="56" font-size="9" text-anchor="middle" fill="#9C3B2E" opacity="0.6" font-family="Georgia">marka</text>
      <text x="200" y="150" font-size="12" text-anchor="middle" fill="#5B5347" font-family="Georgia" font-style="italic">poleđina razglednice</text>
    </svg>`;
  }
  const bgA = mode==='after'?pal.afterA:pal.beforeA;
  const bgB = mode==='after'?pal.afterB:pal.beforeB;
  const uid = (pc.id||'x')+mode+Math.random().toString(36).slice(2,7);
  return `<svg class="postcard-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="g${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#g${uid})"/>
    <g transform="translate(200,150)" stroke="${mode==='after'?'#1F3D37':'#4A3418'}" stroke-width="2" fill="none" opacity="0.85">
      <g transform="translate(-24,-24) scale(2)">${ICONS[ic]}</g>
    </g>
    <rect width="400" height="300" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="10"/>
  </svg>`;
}
function mediaFor(pc,mode){
  const key = (mode==='before'||mode==='front')?'frontImg':(mode==='after'?'todayImg':'backImg');
  const src = pc[key];
  if(src) return `<img src="${src}" alt="">`;
  return placeholderArt(pc,mode);
}

const DEFAULT_POSTCARDS = [
  {id:'BL-0001',title:'Gospodska ulica',cat:'ulice',loc:'Gospodska ulica',year:'oko 1935.',period:'1920–1940',izdavac:'Nepoznat izdavač',postmark:'',opis:'Pogled na glavnu gradsku ulicu sa promenaderima i izlozima tadašnjih dućana.',transcript:'"Pozdrav iz Banjaluke — stigli srećno, vidimo se uskoro."',tags:['centar','ulica'],prava:'nepoznato',public:true,featured:true,nd:true,palette:0,gps:{lat:'',lng:''},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0002',title:'Stari most na Vrbasu',cat:'vrbas',loc:'Vrbas, centar grada',year:'1928.',period:'1920–1940',izdavac:'Izdanje M. Kabiljo',postmark:'',opis:'Kameni most koji je decenijama povezivao obale Vrbasa u samom centru grada.',transcript:'',tags:['Vrbas','most'],prava:'javna domena',public:true,featured:true,nd:true,palette:1,gps:{lat:'44.7745',lng:'17.1912'},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0003',title:'Kastel — tvrđava',cat:'kastel',loc:'Kastel',year:'oko 1910.',period:'1900–1920',izdavac:'Nepoznat izdavač',postmark:'',opis:'Srednjovjekovna tvrđava na obali Vrbasa, jedan od simbola grada.',transcript:'',tags:['Kastel','tvrđava'],prava:'javna domena',public:true,featured:true,nd:false,palette:2,gps:{lat:'44.7695',lng:'17.1897'},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0004',title:'Saborna crkva',cat:'vjera',loc:'Centar grada',year:'1938.',period:'1920–1940',izdavac:'Foto Radenković',postmark:'',opis:'Pravoslavna saborna crkva prije rušenja u Drugom svjetskom ratu.',transcript:'"Šaljem ti sliku naše crkve, lijepa je zar ne?"',tags:['crkva','centar'],prava:'nepoznato',public:true,featured:true,nd:false,palette:0,gps:{lat:'',lng:''},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0005',title:'Željeznička stanica',cat:'zeljeznica',loc:'Željeznička stanica',year:'oko 1950.',period:'1940–1960',izdavac:'Turistički savez',postmark:'',opis:'Zgrada željezničke stanice u periodu poslije Drugog svjetskog rata.',transcript:'',tags:['stanica','voz'],prava:'nepoznato',public:true,featured:false,nd:true,palette:1,gps:{lat:'',lng:''},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0006',title:'Gradski park',cat:'parkovi',loc:'Gradski park',year:'1962.',period:'1960–1980',izdavac:'Foto Vrbas',postmark:'',opis:'Šetalište i drvored u gradskom parku, omiljeno mjesto građana.',transcript:'',tags:['park','priroda'],prava:'poznato',public:true,featured:false,nd:true,palette:2,gps:{lat:'',lng:''},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0007',title:'Panorama sa Kastela',cat:'panorame',loc:'Kastel',year:'1958.',period:'1940–1960',izdavac:'Nepoznat izdavač',postmark:'',opis:'Pogled na grad i rijeku Vrbas sa zidina Kastela.',transcript:'"Pogledaj kako izgleda naš grad odozgo."',tags:['panorama','Kastel'],prava:'nepoznato',public:true,featured:true,nd:true,palette:0,gps:{lat:'',lng:''},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0008',title:'Naselje Obilićevo',cat:'naselja',loc:'Obilićevo',year:'1978.',period:'1960–1980',izdavac:'NIP Glas',postmark:'',opis:'Novoizgrađeno naselje kao simbol poslijeratne obnove i razvoja grada.',transcript:'',tags:['naselje','stanovi'],prava:'poznato',public:true,featured:false,nd:false,palette:1,gps:{lat:'',lng:''},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0009',title:'Pijaca i trgovci',cat:'zivot',loc:'Gradska pijaca',year:'1933.',period:'1920–1940',izdavac:'Nepoznat izdavač',postmark:'',opis:'Svakodnevni život na gradskoj pijaci sa štandovima i kupcima.',transcript:'',tags:['pijaca','ljudi'],prava:'nepoznato',public:true,featured:false,nd:false,palette:2,gps:{lat:'',lng:''},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0010',title:'Ferhat-pašina džamija',cat:'vjera',loc:'Ferhadija',year:'1912.',period:'1900–1920',izdavac:'K.u.K. Militär-Geographisches Institut',postmark:'',opis:'Ferhadija u periodu austrougarske uprave, jedna od najstarijih fotografija u kolekciji.',transcript:'',tags:['džamija','Ferhadija'],prava:'javna domena',public:true,featured:false,nd:true,palette:0,gps:{lat:'44.7739',lng:'17.1897'},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0011',title:'Zgrada Banjalučke berze',cat:'arh',loc:'Centar grada',year:'1936.',period:'1920–1940',izdavac:'Foto atelje Braća Bijelić',postmark:'',opis:'Reprezentativna zgrada u centru, primjer arhitekture međuratnog perioda.',transcript:'',tags:['zgrada','centar'],prava:'nepoznato',public:true,featured:false,nd:false,palette:1,gps:{lat:'',lng:''},frontImg:null,backImg:null,todayImg:null},
  {id:'BL-0012',title:'Autobuska stanica',cat:'zeljeznica',loc:'Centar grada',year:'1985.',period:'1980–2000',izdavac:'Turist biro',postmark:'',opis:'Gradski saobraćajni čvor u drugoj polovini XX vijeka.',transcript:'',tags:['saobraćaj','autobus'],prava:'poznato',public:true,featured:false,nd:true,palette:2,gps:{lat:'',lng:''},frontImg:null,backImg:null,todayImg:null},
];
