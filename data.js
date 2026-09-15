// Curriculum data for Kana — Japanese learning PWA
// Kana lessons, sentence patterns, vocabulary tiers, set phrases.
window.DATA = (() => {

const H = [ // hiragana lessons
  { id:'h1', name:'Vowels', kana:[
    ['あ','a','Looks like an Antenna on a roof'],
    ['い','i','Two Eels swimming side by side'],
    ['う','u','A person punched in the gut going "Ugh"'],
    ['え','e','An Exotic bird with a long tail'],
    ['お','o','A golfer yelling "Oh!" at a ball'] ]},
  { id:'h2', name:'K row', kana:[
    ['か','ka','A Kite with its string'],
    ['き','ki','A Key'],
    ['く','ku','A bird beak going "Coo"'],
    ['け','ke','A Keg on its side'],
    ['こ','ko','Two Cords lying next to each other'] ]},
  { id:'h3', name:'S row', kana:[
    ['さ','sa','A Sock hanging on a line'],
    ['し','shi','A fishing hook — "She" is fishing'],
    ['す','su','A Swing hanging from a bar'],
    ['せ','se','A Set of teeth'],
    ['そ','so','A Sewing zigzag stitch'] ]},
  { id:'h4', name:'T row', kana:[
    ['た','ta','Looks like "ta" written in Latin letters'],
    ['ち','chi','A Cheerleader\'s pom-pom'],
    ['つ','tsu','A Tsunami wave'],
    ['て','te','A Telephone pole with a wire'],
    ['と','to','A Toe with a splinter'] ]},
  { id:'h5', name:'N row', kana:[
    ['な','na','A Nun kneeling next to a cross'],
    ['に','ni','A Knee next to a wall'],
    ['ぬ','nu','Noodles curling on chopsticks'],
    ['ね','ne','A cat (neko) with its tail curled'],
    ['の','no','A "No" sign — one stroke through a circle'] ]},
  { id:'h6', name:'H row', kana:[
    ['は','ha','A person laughing "Ha" with arms up'],
    ['ひ','hi','A smile — "He" is smiling'],
    ['ふ','fu','Mount Fuji with clouds'],
    ['へ','he','A Hay stack / mountain'],
    ['ほ','ho','Ho ho ho — Santa\'s chimney with two crosses'] ]},
  { id:'h7', name:'M row', kana:[
    ['ま','ma','Mama\'s twisted braid'],
    ['み','mi','The number 21 — "Me" turning 21'],
    ['む','mu','A cow saying "Moo" with its tail'],
    ['め','me','An eye (me) — a curl with a stroke through it'],
    ['も','mo','A fish hook catching More fish'] ]},
  { id:'h8', name:'Y, R, W rows and ん', kana:[
    ['や','ya','A Yak with its horns'],
    ['ゆ','yu','A U-turn — the fish swimming "You-turn"'],
    ['よ','yo','A Yo-yo on a string'],
    ['ら','ra','A Rabbit running'],
    ['り','ri','Two Reeds in the river'],
    ['る','ru','A Loop at the bottom — "Ru" has a loop'],
    ['れ','re','A Racer leaning forward'],
    ['ろ','ro','Same as る but no loop — a Road'],
    ['わ','wa','A Wasp with a stinger'],
    ['を','wo','An Old man carrying a load — only used as particle "o"'],
    ['ん','n','An N written in cursive'] ]},
  { id:'h9', name:'Dakuten: G, Z, D', kana:[
    ['が','ga',''],['ぎ','gi',''],['ぐ','gu',''],['げ','ge',''],['ご','go',''],
    ['ざ','za',''],['じ','ji',''],['ず','zu',''],['ぜ','ze',''],['ぞ','zo',''],
    ['だ','da',''],['ぢ','ji','(rare — same sound as じ)'],['づ','zu','(rare — same sound as ず)'],['で','de',''],['ど','do',''] ]},
  { id:'h10', name:'Dakuten: B, P', kana:[
    ['ば','ba',''],['び','bi',''],['ぶ','bu',''],['べ','be',''],['ぼ','bo',''],
    ['ぱ','pa','Small circle = P'],['ぴ','pi',''],['ぷ','pu',''],['ぺ','pe',''],['ぽ','po',''] ]},
  { id:'h11', name:'Combos (small ゃゅょ)', combo:true, kana:[
    ['きゃ','kya',''],['きゅ','kyu',''],['きょ','kyo',''],
    ['しゃ','sha',''],['しゅ','shu',''],['しょ','sho',''],
    ['ちゃ','cha',''],['ちゅ','chu',''],['ちょ','cho',''],
    ['にゃ','nya',''],['にゅ','nyu',''],['にょ','nyo',''],
    ['ひゃ','hya',''],['ひゅ','hyu',''],['ひょ','hyo',''],
    ['みゃ','mya',''],['みゅ','myu',''],['みょ','myo',''],
    ['りゃ','rya',''],['りゅ','ryu',''],['りょ','ryo',''],
    ['ぎゃ','gya',''],['ぎゅ','gyu',''],['ぎょ','gyo',''],
    ['じゃ','ja',''],['じゅ','ju',''],['じょ','jo',''],
    ['びゃ','bya',''],['びゅ','byu',''],['びょ','byo',''],
    ['ぴゃ','pya',''],['ぴゅ','pyu',''],['ぴょ','pyo',''] ]},
];

const K = [ // katakana lessons
  { id:'k1', name:'Vowels', kana:[
    ['ア','a','An Axe'],['イ','i','An Eagle\'s beak / the letter i leaning'],['ウ','u','A hat with a bump — like う with a roof'],['エ','e','An Elevator between two floors'],['オ','o','An Opera singer with arms out'] ]},
  { id:'k2', name:'K row', kana:[
    ['カ','ka','Same as か without the tick'],['キ','ki','Same as き without the bottom curl'],['ク','ku','A Cook\'s hat'],['ケ','ke','A K missing a leg'],['コ','ko','A Corner of a box'] ]},
  { id:'k3', name:'S row', kana:[
    ['サ','sa','A Salad bowl with two sticks'],['シ','shi','Three strokes, drawn upward from the left — "She" smiles'],['ス','su','A Skier on a slope'],['セ','se','Same as せ'],['ソ','so','Two strokes, drawn downward — one Sewing needle'] ]},
  { id:'k4', name:'T row', kana:[
    ['タ','ta','A Tap dancer / ク with a dot inside'],['チ','chi','A Cheerful chick with a stick'],['ツ','tsu','Three strokes drawn downward — Tsunami wave (compare シ)'],['テ','te','A Telephone pole'],['ト','to','A Totem pole'] ]},
  { id:'k5', name:'N row', kana:[
    ['ナ','na','A Knife'],['ニ','ni','Two lines — "Ni" is 2 in Japanese'],['ヌ','nu','Noodles with chopsticks'],['ネ','ne','A Necktie'],['ノ','no','One stroke — "No"'] ]},
  { id:'k6', name:'H row', kana:[
    ['ハ','ha','Two Hairs falling'],['ヒ','hi','A Heel'],['フ','fu','A Fuji hook'],['ヘ','he','Same as へ'],['ホ','ho','Holy cross with drops'] ]},
  { id:'k7', name:'M row', kana:[
    ['マ','ma','A Map marker / Mama pointing'],['ミ','mi','Three lines — "Mi" like a Mini stack'],['ム','mu','A Moo cow\'s nose'],['メ','me','An X — Me marks the spot'],['モ','mo','More lines than ミ, with a hook'] ]},
  { id:'k8', name:'Y, R, W rows, ン and ー', kana:[
    ['ヤ','ya','A Yak\'s horn'],['ユ','yu','A U-shaped box'],['ヨ','yo','A Yo-yo — E backwards'],['ラ','ra','A Radio antenna over フ'],['リ','ri','Same as り, straighter'],['ル','ru','Roots of a tree'],['レ','re','A Ledge'],['ロ','ro','A square Road sign'],['ワ','wa','A Wa-shaped hat'],['ヲ','wo','(almost never used)'],['ン','n','One dot + one upward stroke (compare ソ)'],['ー','long vowel','Long vowel mark: コーヒー = koohii'] ]},
  { id:'k9', name:'Dakuten: G, Z, D', kana:[
    ['ガ','ga',''],['ギ','gi',''],['グ','gu',''],['ゲ','ge',''],['ゴ','go',''],
    ['ザ','za',''],['ジ','ji',''],['ズ','zu',''],['ゼ','ze',''],['ゾ','zo',''],
    ['ダ','da',''],['ヂ','ji','(rare)'],['ヅ','zu','(rare)'],['デ','de',''],['ド','do',''] ]},
  { id:'k10', name:'Dakuten: B, P', kana:[
    ['バ','ba',''],['ビ','bi',''],['ブ','bu',''],['ベ','be',''],['ボ','bo',''],
    ['パ','pa',''],['ピ','pi',''],['プ','pu',''],['ペ','pe',''],['ポ','po',''] ]},
  { id:'k11', name:'Combos and loanword sounds', combo:true, kana:[
    ['キャ','kya',''],['キュ','kyu',''],['キョ','kyo',''],
    ['シャ','sha',''],['シュ','shu',''],['ショ','sho',''],
    ['チャ','cha',''],['チュ','chu',''],['チョ','cho',''],
    ['ニャ','nya',''],['ヒャ','hya',''],['ミャ','mya',''],['リャ','rya',''],
    ['ジャ','ja',''],['ジュ','ju',''],['ジョ','jo',''],
    ['ファ','fa',''],['フィ','fi',''],['フェ','fe',''],['フォ','fo',''],
    ['ティ','ti',''],['ディ','di',''],['ウィ','wi',''],['ウェ','we',''],['ヴ','vu',''] ]},
];

// ---------- Sentence patterns ----------
// jp uses {X} as the slot. slot = vocabulary types that fit. ex = one example fill (id of vocab).
const PATTERNS = [
  // Tier 1 — identity
  { id:'p1', tier:1, jp:'{X} です。', ro:'{X} desu.', en:'It is {X}. / I am {X}.', slot:['noun','person','food','object','place','job'], ex:'gakusei',
    note:'です is the polite "is". Japanese drops the subject when it is obvious.' },
  { id:'p2', tier:1, jp:'{X} ですか？', ro:'{X} desu ka?', en:'Is it {X}?', slot:['noun','person','food','object','place','job'], ex:'nihonjin',
    note:'Add か to turn any statement into a question. Intonation rises.' },
  { id:'p3', tier:1, jp:'{X} じゃないです。', ro:'{X} ja nai desu.', en:'It is not {X}.', slot:['noun','person','food','object','place','job'], ex:'gakusei',
    note:'じゃないです = casual-polite negative of です.' },
  { id:'p4', tier:1, jp:'これは {X} です。', ro:'kore wa {X} desu.', en:'This is {X}.', slot:['noun','food','object'], ex:'mizu',
    note:'これ = this (near me). は is the topic marker, pronounced "wa".' },
  { id:'p5', tier:1, jp:'わたしは {X} です。', ro:'watashi wa {X} desu.', en:'I am {X}.', slot:['person','job'], ex:'doitsujin',
    note:'わたし = I. Often dropped once the topic is clear.' },
  { id:'p6', tier:1, jp:'これは なんですか？', ro:'kore wa nan desu ka?', en:'What is this?', slot:[], ex:null,
    note:'なん / なに = what.' },

  // Tier 2 — wants and needs
  { id:'p7', tier:2, jp:'{X} が ほしいです。', ro:'{X} ga hoshii desu.', en:'I want {X}.', slot:['food','object'], ex:'koohii',
    note:'ほしい = want (for things). が marks the thing wanted.' },
  { id:'p8', tier:2, jp:'{X} が いります。', ro:'{X} ga irimasu.', en:'I need {X}.', slot:['food','object'], ex:'jikan',
    note:'いります = need. いりません = don\'t need (useful for refusing a bag at the konbini).' },
  { id:'p9', tier:2, jp:'{X} を ください。', ro:'{X} o kudasai.', en:'{X}, please. (give me)', slot:['food','object'], ex:'mizu',
    note:'を marks the object. ください = please give me. The most useful ordering phrase.' },
  { id:'p10', tier:2, jp:'{X} は ありますか？', ro:'{X} wa arimasu ka?', en:'Do you have {X}? / Is there {X}?', slot:['food','object','place'], ex:'toire',
    note:'あります = exists (for things). Ask this in any shop.' },
  { id:'p11', tier:2, jp:'{X} を おねがいします。', ro:'{X} o onegaishimasu.', en:'{X}, please. (request)', slot:['food','object'], ex:'okaikei',
    note:'More formal than ください. Use for services: the bill, a reservation.' },
  { id:'p12', tier:2, jp:'{X} は いりません。', ro:'{X} wa irimasen.', en:'I don\'t need {X}.', slot:['food','object'], ex:'fukuro',
    note:'The polite refusal. ふくろは いりません — no bag, thanks.' },

  // Tier 3 — likes and opinions
  { id:'p13', tier:3, jp:'{X} が すきです。', ro:'{X} ga suki desu.', en:'I like {X}.', slot:['food','object','place','activity'], ex:'sushi',
    note:'すき is an adjective: "X is liked". が, not を.' },
  { id:'p14', tier:3, jp:'{X} は あまり すきじゃないです。', ro:'{X} wa amari suki ja nai desu.', en:'I don\'t really like {X}.', slot:['food','object','place','activity'], ex:'natto',
    note:'あまり + negative = not very. Softer than a flat "no".' },
  { id:'p15', tier:3, jp:'{X} と おもいます。', ro:'{X} to omoimasu.', en:'I think that {X}.', slot:['iadj','clause'], ex:'oishii',
    note:'と quotes the thought. Plain form goes before と: おいしい と おもいます.' },
  { id:'p16', tier:3, jp:'{X} だと おもいます。', ro:'{X} da to omoimasu.', en:'I think it is {X}.', slot:['noun','naadj','person','place'], ex:'daijoubu',
    note:'Nouns and な-adjectives need だ before と.' },
  { id:'p17', tier:3, jp:'{X} が わかります。', ro:'{X} ga wakarimasu.', en:'I understand {X}.', slot:['noun','language'], ex:'nihongo',
    note:'わかりません = I don\'t understand. Say it early and often.' },
  { id:'p18', tier:3, jp:'{X} は ちょっと…', ro:'{X} wa chotto...', en:'{X} is a bit... (no thanks)', slot:['food','object','activity','time'], ex:'ashita',
    note:'Trailing off with ちょっと is how Japanese people say no.' },

  // Tier 4 — places and travel
  { id:'p19', tier:4, jp:'{X} は どこですか？', ro:'{X} wa doko desu ka?', en:'Where is {X}?', slot:['place','object'], ex:'eki',
    note:'どこ = where.' },
  { id:'p20', tier:4, jp:'{X} に いきたいです。', ro:'{X} ni ikitai desu.', en:'I want to go to {X}.', slot:['place'], ex:'kyouto',
    note:'に marks the destination. ～たい = want to (verb stem + たい).' },
  { id:'p21', tier:4, jp:'{X} に いきます。', ro:'{X} ni ikimasu.', en:'I go / will go to {X}.', slot:['place'], ex:'toukyou',
    note:'Japanese has no future tense; ます covers present and future.' },
  { id:'p22', tier:4, jp:'{X} は いくらですか？', ro:'{X} wa ikura desu ka?', en:'How much is {X}?', slot:['food','object'], ex:'kore',
    note:'いくら = how much (money).' },
  { id:'p23', tier:4, jp:'{X} まで おねがいします。', ro:'{X} made onegaishimasu.', en:'To {X}, please. (taxi)', slot:['place'], ex:'kuukou',
    note:'まで = until / as far as.' },
  { id:'p24', tier:4, jp:'{X} から きました。', ro:'{X} kara kimashita.', en:'I came from {X}.', slot:['place','country'], ex:'doitsu',
    note:'から = from. きました = came (past of きます).' },

  // Tier 5 — doing and being able
  { id:'p25', tier:5, jp:'{X} が できます。', ro:'{X} ga dekimasu.', en:'I can do {X}.', slot:['language','activity'], ex:'eigo',
    note:'できます = can do / is possible. Also: できません.' },
  { id:'p26', tier:5, jp:'{X} を たべます。', ro:'{X} o tabemasu.', en:'I eat {X}.', slot:['food'], ex:'raamen',
    note:'たべました = ate. たべません = don\'t eat.' },
  { id:'p27', tier:5, jp:'{X} を のみます。', ro:'{X} o nomimasu.', en:'I drink {X}.', slot:['drink'], ex:'ocha',
    note:'Same verb pattern as たべます.' },
  { id:'p28', tier:5, jp:'{X} を しっていますか？', ro:'{X} o shitte imasu ka?', en:'Do you know {X}?', slot:['place','person','noun'], ex:'berurin',
    note:'しっています = know (ongoing state). Answer: しりません = I don\'t know.' },
  { id:'p29', tier:5, jp:'{X} を おしえてください。', ro:'{X} o oshiete kudasai.', en:'Please tell / teach me {X}.', slot:['noun','language'], ex:'namae',
    note:'て-form + ください = please do. おしえて = tell / teach.' },
  { id:'p30', tier:5, jp:'{X} を しました。', ro:'{X} o shimashita.', en:'I did {X}.', slot:['activity'], ex:'benkyou',
    note:'します = do. Attach to activity nouns: べんきょう を します.' },

  // Tier 6 — permission, feelings, time
  { id:'p31', tier:6, jp:'{X} も いいですか？', ro:'{X} mo ii desu ka?', en:'May I {X}?', slot:['vte'], ex:'suwatte',
    note:'て-form + も いいですか = is it okay if I...? Answer: どうぞ.' },
  { id:'p32', tier:6, jp:'{X} は なんじですか？', ro:'{X} wa nanji desu ka?', en:'What time is {X}?', slot:['event'], ex:'kaigi',
    note:'なんじ = what time.' },
  { id:'p33', tier:6, jp:'{X} が いたいです。', ro:'{X} ga itai desu.', en:'My {X} hurts.', slot:['body'], ex:'atama',
    note:'いたい = painful.' },
  { id:'p34', tier:6, jp:'{X} が たのしみです。', ro:'{X} ga tanoshimi desu.', en:'I\'m looking forward to {X}.', slot:['event','activity','place'], ex:'ryokou',
    note:'たのしみ = something looked forward to.' },
  { id:'p35', tier:6, jp:'{X} は {Y} より すきです。', ro:'{X} wa {Y} yori suki desu.', en:'I like {X} more than {Y}.', slot:['food','drink','place','activity'], slot2:['food','drink','place','activity'], ex:'ocha', ex2:'koohii',
    note:'より = than. Two slots: fill both.' },
  { id:'p36', tier:6, jp:'{X} と {Y} を ください。', ro:'{X} to {Y} o kudasai.', en:'{X} and {Y}, please.', slot:['food','drink','object'], slot2:['food','drink','object'], ex:'biiru', ex2:'mizu',
    note:'と = and (between nouns).' },
];

// ---------- Vocabulary ----------
// [id, jp (kana), romaji, en, type, tier]
const VOCAB = [
  // Tier 1
  ['gakusei','がくせい','gakusei','student','job',1],
  ['sensei','せんせい','sensei','teacher','job',1],
  ['nihonjin','にほんじん','nihonjin','Japanese person','person',1],
  ['doitsujin','どいつじん','doitsujin','German person','person',1],
  ['amerikajin','あめりかじん','amerikajin','American person','person',1],
  ['tomodachi','ともだち','tomodachi','friend','person',1],
  ['mizu','みず','mizu','water','food',1],
  ['ocha','おちゃ','ocha','tea (green)','drink',1],
  ['koohii','コーヒー','koohii','coffee','drink',1],
  ['hon','ほん','hon','book','object',1],
  ['pen','ペン','pen','pen','object',1],
  ['denwa','でんわ','denwa','phone','object',1],
  ['kore','これ','kore','this','object',1],
  ['sore','それ','sore','that','object',1],
  ['are','あれ','are','that over there','object',1],
  ['hai','はい','hai','yes','word',1],
  ['iie','いいえ','iie','no','word',1],
  // Tier 2
  ['biiru','ビール','biiru','beer','drink',2],
  ['raamen','ラーメン','raamen','ramen','food',2],
  ['sushi','すし','sushi','sushi','food',2],
  ['pan','パン','pan','bread','food',2],
  ['gohan','ごはん','gohan','rice / meal','food',2],
  ['jikan','じかん','jikan','time','object',2],
  ['okane','おかね','okane','money','object',2],
  ['fukuro','ふくろ','fukuro','bag (plastic)','object',2],
  ['okaikei','おかいけい','okaikei','the bill','object',2],
  ['menyuu','メニュー','menyuu','menu','object',2],
  ['toire','トイレ','toire','toilet','place',2],
  ['kippu','きっぷ','kippu','ticket','object',2],
  ['heya','へや','heya','room','object',2],
  ['kagi','かぎ','kagi','key','object',2],
  ['resiito','レシート','reshiito','receipt','object',2],
  // Tier 3
  ['natto','なっとう','nattou','natto','food',3],
  ['sakana','さかな','sakana','fish','food',3],
  ['niku','にく','niku','meat','food',3],
  ['yasai','やさい','yasai','vegetables','food',3],
  ['ongaku','おんがく','ongaku','music','activity',3],
  ['eiga','えいが','eiga','movies','activity',3],
  ['ryokou','りょこう','ryokou','travel','activity',3],
  ['nihongo','にほんご','nihongo','Japanese (language)','language',3],
  ['eigo','えいご','eigo','English','language',3],
  ['doitsugo','どいつご','doitsugo','German','language',3],
  ['oishii','おいしい','oishii','delicious','iadj',3],
  ['takai','たかい','takai','expensive / tall','iadj',3],
  ['yasui','やすい','yasui','cheap','iadj',3],
  ['ii','いい','ii','good','iadj',3],
  ['muzukashii','むずかしい','muzukashii','difficult','iadj',3],
  ['omoshiroi','おもしろい','omoshiroi','interesting','iadj',3],
  ['daijoubu','だいじょうぶ','daijoubu','okay / fine','naadj',3],
  ['taihen','たいへん','taihen','tough / a big deal','naadj',3],
  ['ashita','あした','ashita','tomorrow','time',3],
  ['kyou','きょう','kyou','today','time',3],
  // Tier 4
  ['eki','えき','eki','station','place',4],
  ['kuukou','くうこう','kuukou','airport','place',4],
  ['hoteru','ホテル','hoteru','hotel','place',4],
  ['konbini','コンビニ','konbini','convenience store','place',4],
  ['resutoran','レストラン','resutoran','restaurant','place',4],
  ['byouin','びょういん','byouin','hospital','place',4],
  ['ginkou','ぎんこう','ginkou','bank','place',4],
  ['toukyou','とうきょう','toukyou','Tokyo','place',4],
  ['kyouto','きょうと','kyouto','Kyoto','place',4],
  ['berurin','ベルリン','berurin','Berlin','place',4],
  ['doitsu','ドイツ','doitsu','Germany','country',4],
  ['amerika','アメリカ','amerika','America','country',4],
  ['nihon','にほん','nihon','Japan','country',4],
  ['takushii','タクシー','takushii','taxi','object',4],
  ['densha','でんしゃ','densha','train','object',4],
  // Tier 5
  ['benkyou','べんきょう','benkyou','studying','activity',5],
  ['shigoto','しごと','shigoto','work','activity',5],
  ['undou','うんどう','undou','exercise','activity',5],
  ['ryouri','りょうり','ryouri','cooking','activity',5],
  ['namae','なまえ','namae','name','noun',5],
  ['michi','みち','michi','the way / road','noun',5],
  ['imi','いみ','imi','meaning','noun',5],
  ['sake','さけ','sake','sake / alcohol','drink',5],
  ['wain','ワイン','wain','wine','drink',5],
  ['juusu','ジュース','juusu','juice','drink',5],
  ['tamago','たまご','tamago','egg','food',5],
  ['kudamono','くだもの','kudamono','fruit','food',5],
  ['nihonryouri','にほんりょうり','nihonryouri','Japanese food','food',5],
  // Tier 6
  ['suwatte','すわって','suwatte','sit (て-form)','vte',6],
  ['tabete','たべて','tabete','eat (て-form)','vte',6],
  ['nonde','のんで','nonde','drink (て-form)','vte',6],
  ['mite','みて','mite','look (て-form)','vte',6],
  ['tsukatte','つかって','tsukatte','use (て-form)','vte',6],
  ['haitte','はいって','haitte','enter (て-form)','vte',6],
  ['shashin_o_totte','しゃしんを とって','shashin o totte','take a photo (て-form)','vte',6],
  ['kaigi','かいぎ','kaigi','meeting','event',6],
  ['paatii','パーティー','paatii','party','event',6],
  ['shuppatsu','しゅっぱつ','shuppatsu','departure','event',6],
  ['atama','あたま','atama','head','body',6],
  ['onaka','おなか','onaka','stomach','body',6],
  ['nodo','のど','nodo','throat','body',6],
  ['ashi','あし','ashi','leg / foot','body',6],
  ['shuumatsu','しゅうまつ','shuumatsu','weekend','event',6],
];

// ---------- Set phrases (fixed, tier 1 onward) ----------
const PHRASES = [
  ['ph1',1,'おはようございます','ohayou gozaimasu','Good morning'],
  ['ph2',1,'こんにちは','konnichiwa','Hello / good afternoon'],
  ['ph3',1,'こんばんは','konbanwa','Good evening'],
  ['ph4',1,'ありがとうございます','arigatou gozaimasu','Thank you'],
  ['ph5',1,'すみません','sumimasen','Excuse me / sorry'],
  ['ph6',1,'はじめまして','hajimemashite','Nice to meet you'],
  ['ph7',1,'よろしくおねがいします','yoroshiku onegaishimasu','Please treat me well (after introductions)'],
  ['ph8',2,'わかりません','wakarimasen','I don\'t understand'],
  ['ph9',2,'もういちど おねがいします','mou ichido onegaishimasu','Once more, please'],
  ['ph10',2,'だいじょうぶです','daijoubu desu','It\'s fine / I\'m okay'],
  ['ph11',2,'いただきます','itadakimasu','(before eating)'],
  ['ph12',2,'ごちそうさまでした','gochisousama deshita','(after eating) thank you for the meal'],
  ['ph13',3,'おねがいします','onegaishimasu','Please'],
  ['ph14',3,'ちょっと まってください','chotto matte kudasai','Please wait a moment'],
  ['ph15',3,'えいごが はなせますか？','eigo ga hanasemasu ka?','Can you speak English?'],
  ['ph16',3,'ゆっくり おねがいします','yukkuri onegaishimasu','Slowly, please'],
  ['ph17',4,'おつかれさまです','otsukaresama desu','Good work / thanks for your effort (work greeting)'],
  ['ph18',4,'しつれいします','shitsurei shimasu','Excuse me (entering / leaving a room)'],
  ['ph19',4,'おやすみなさい','oyasuminasai','Good night'],
  ['ph20',4,'さようなら','sayounara','Goodbye'],
];

const CREDITS = 'Stroke data: KanjiVG (kanjivg.tagaini.net), CC BY-SA 3.0.';

return { H, K, PATTERNS, VOCAB, PHRASES, CREDITS };
})();
