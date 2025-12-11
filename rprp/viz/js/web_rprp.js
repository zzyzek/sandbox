(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rprp = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//LICENSE: CC0
//

var four_words = [
"abby",
"abel",
"acts",
"adam",
"adan",
"adar",
"aden",
"afro",
"agni",
"agra",
"ahab",
"aida",
"ainu",
"ajax",
"alan",
"alar",
"alba",
"aldo",
"alec",
"alex",
"alma",
"alpo",
"alps",
"alta",
"alva",
"amie",
"amos",
"amur",
"andy",
"anna",
"anne",
"apia",
"arab",
"aral",
"ares",
"argo",
"ariz",
"arno",
"aron",
"ashe",
"asia",
"audi",
"avis",
"avon",
"axum",
"azov",
"baal",
"bach",
"baez",
"baku",
"bali",
"ball",
"barr",
"bart",
"bass",
"batu",
"baum",
"bean",
"beau",
"beck",
"bede",
"bela",
"bell",
"benz",
"berg",
"bern",
"bert",
"bess",
"best",
"beth",
"biko",
"bill",
"bird",
"biro",
"blvd",
"boas",
"boer",
"bohr",
"bond",
"bonn",
"bono",
"borg",
"bork",
"born",
"boru",
"bose",
"boyd",
"brad",
"bran",
"bray",
"bret",
"brie",
"brit",
"brno",
"brut",
"buck",
"burl",
"burr",
"burt",
"bush",
"byrd",
"cage",
"cain",
"cali",
"caph",
"capt",
"cara",
"carl",
"carr",
"cary",
"case",
"cash",
"cato",
"catt",
"cebu",
"celt",
"cerf",
"chad",
"chan",
"chen",
"chou",
"clay",
"clem",
"cleo",
"clio",
"cobb",
"cody",
"coke",
"cole",
"colo",
"colt",
"como",
"cong",
"conn",
"cook",
"cora",
"cory",
"cote",
"cray",
"cree",
"crux",
"cruz",
"cuba",
"curt",
"dada",
"dale",
"dali",
"dana",
"dane",
"dare",
"dave",
"davy",
"dawn",
"dean",
"debs",
"dell",
"dena",
"deng",
"deon",
"depp",
"devi",
"dial",
"diaz",
"dido",
"diem",
"dina",
"dino",
"dion",
"dior",
"dirk",
"doha",
"dole",
"dona",
"donn",
"dora",
"doug",
"drew",
"duke",
"dunn",
"duse",
"dyer",
"earl",
"earp",
"east",
"eben",
"ebro",
"edam",
"edda",
"eddy",
"eden",
"edna",
"eggo",
"eire",
"elam",
"elba",
"elbe",
"ella",
"elma",
"elmo",
"eloy",
"elsa",
"elul",
"elva",
"emil",
"emma",
"emmy",
"enid",
"enif",
"enos",
"eric",
"erie",
"erik",
"erin",
"eris",
"erma",
"erna",
"eros",
"erse",
"esau",
"etna",
"eton",
"etta",
"eula",
"evan",
"eyck",
"eyre",
"ezra",
"fnma",
"fahd",
"faye",
"feds",
"fern",
"fiat",
"fido",
"fiji",
"finn",
"fisk",
"foch",
"ford",
"fran",
"fred",
"frey",
"frye",
"fuji",
"gaea",
"gael",
"gage",
"gail",
"gale",
"gall",
"gary",
"gaul",
"gaza",
"gena",
"gene",
"gere",
"gide",
"gila",
"gill",
"gina",
"gino",
"gish",
"giza",
"glen",
"gobi",
"goff",
"good",
"gore",
"goth",
"goya",
"gray",
"greg",
"grey",
"gris",
"grus",
"guam",
"gwen",
"gwyn",
"hsbc",
"haas",
"hahn",
"hale",
"hall",
"hals",
"hank",
"hans",
"hart",
"hays",
"head",
"heep",
"hell",
"hera",
"hess",
"hill",
"hiss",
"hoff",
"holt",
"hood",
"hope",
"hopi",
"horn",
"howe",
"huck",
"huey",
"huff",
"hugh",
"hugo",
"hull",
"hume",
"hung",
"huns",
"hunt",
"hutu",
"hyde",
"iago",
"igor",
"ikea",
"imus",
"inca",
"indy",
"ines",
"inez",
"inge",
"iowa",
"iran",
"iraq",
"iris",
"irma",
"isis",
"ivan",
"ives",
"iyar",
"izod",
"jack",
"jain",
"jake",
"jame",
"jami",
"jana",
"jane",
"java",
"jean",
"jedi",
"jeep",
"jeff",
"jeri",
"jess",
"jews",
"jill",
"joan",
"jobs",
"jock",
"jodi",
"jody",
"joel",
"joey",
"john",
"joni",
"jose",
"josh",
"jove",
"juan",
"judd",
"jude",
"judy",
"july",
"june",
"jung",
"juno",
"kalb",
"kali",
"kama",
"kane",
"kano",
"kans",
"kant",
"kara",
"kari",
"karl",
"karo",
"kate",
"katy",
"kaye",
"keck",
"kemp",
"kent",
"keri",
"kern",
"kerr",
"khan",
"kidd",
"kiel",
"kiev",
"king",
"kirk",
"klan",
"klee",
"knox",
"kobe",
"koch",
"kohl",
"kong",
"kory",
"kris",
"kroc",
"kuhn",
"kurd",
"kurt",
"kwan",
"kyle",
"lacy",
"lamb",
"lana",
"land",
"lane",
"lang",
"laos",
"lapp",
"lara",
"lars",
"laud",
"laue",
"leah",
"lean",
"lear",
"leda",
"left",
"lego",
"leif",
"lela",
"lena",
"leno",
"lent",
"leon",
"leos",
"lesa",
"leta",
"levi",
"levy",
"lila",
"lily",
"lima",
"lina",
"lind",
"lisa",
"livy",
"liza",
"lodz",
"lois",
"loki",
"lola",
"lome",
"long",
"lora",
"lord",
"lori",
"lott",
"love",
"lowe",
"loyd",
"luce",
"lucy",
"luis",
"luke",
"lula",
"lulu",
"luna",
"lupe",
"luvs",
"lvov",
"lyle",
"lyly",
"lyme",
"lynn",
"lyon",
"lyra",
"mace",
"mach",
"mack",
"macy",
"magi",
"male",
"mali",
"mani",
"mann",
"manx",
"mara",
"marc",
"mari",
"mark",
"mars",
"marx",
"mary",
"mass",
"matt",
"maud",
"maui",
"maya",
"mayo",
"mays",
"mead",
"meir",
"mesa",
"mich",
"mick",
"mike",
"mill",
"milo",
"mimi",
"ming",
"minn",
"mira",
"miro",
"miss",
"moet",
"moho",
"moll",
"mona",
"monk",
"mons",
"mont",
"moog",
"moon",
"moor",
"more",
"moro",
"mort",
"moss",
"mott",
"muir",
"muse",
"myra",
"myst",
"nagy",
"nair",
"nash",
"nate",
"nazi",
"neal",
"neil",
"nell",
"nerf",
"nero",
"neva",
"nice",
"nick",
"nike",
"nile",
"nina",
"nita",
"noah",
"noel",
"nola",
"nome",
"nona",
"nora",
"nova",
"ohsa",
"oahu",
"oder",
"odin",
"odis",
"odom",
"ohio",
"oise",
"okla",
"olaf",
"olav",
"olen",
"olga",
"olin",
"oman",
"omar",
"omsk",
"oort",
"opal",
"opel",
"oran",
"oreo",
"orin",
"orly",
"oslo",
"otis",
"otto",
"ovid",
"owen",
"oxus",
"paar",
"pace",
"page",
"park",
"parr",
"pate",
"paul",
"peck",
"peel",
"pele",
"pena",
"penn",
"perl",
"perm",
"peru",
"pete",
"phil",
"piaf",
"pict",
"pike",
"pisa",
"pitt",
"pius",
"pkwy",
"pogo",
"pole",
"polk",
"polo",
"pooh",
"pope",
"post",
"pres",
"prof",
"prut",
"ptah",
"puck",
"pugh",
"puzo",
"pyle",
"rama",
"rand",
"raul",
"reba",
"reed",
"reid",
"rena",
"rene",
"reno",
"reva",
"rhea",
"rhee",
"rice",
"rich",
"rick",
"rico",
"ride",
"riel",
"riga",
"rios",
"rita",
"ritz",
"robt",
"rock",
"roeg",
"roku",
"rome",
"root",
"rory",
"rosa",
"rose",
"ross",
"roth",
"rove",
"rowe",
"roxy",
"ruby",
"rudy",
"ruhr",
"ruiz",
"rush",
"russ",
"ruth",
"ryan",
"sars",
"saab",
"saar",
"sade",
"sadr",
"saki",
"saks",
"salk",
"sana",
"sand",
"sang",
"sara",
"saul",
"scot",
"scud",
"sean",
"sega",
"sept",
"serb",
"seth",
"shaw",
"shea",
"siam",
"sian",
"sikh",
"sims",
"siva",
"skye",
"slav",
"snow",
"soho",
"sony",
"sosa",
"soto",
"spam",
"stan",
"styx",
"suez",
"sufi",
"sung",
"suva",
"suzy",
"sven",
"taft",
"tami",
"tara",
"tass",
"tate",
"tell",
"teri",
"terr",
"tess",
"thad",
"thai",
"thar",
"thea",
"thor",
"thur",
"tide",
"tina",
"ting",
"tito",
"toby",
"todd",
"togo",
"tojo",
"toni",
"tony",
"tory",
"toto",
"tran",
"trey",
"troy",
"tues",
"tull",
"tums",
"tupi",
"turk",
"tutu",
"tyre",
"ucla",
"ural",
"urdu",
"urey",
"uris",
"ursa",
"utah",
"vang",
"veda",
"vega",
"vela",
"venn",
"vera",
"vern",
"vila",
"visa",
"vito",
"vlad",
"waco",
"wade",
"wake",
"wald",
"wall",
"walt",
"wang",
"ward",
"ware",
"wash",
"wasp",
"watt",
"webb",
"west",
"whig",
"will",
"wise",
"witt",
"wolf",
"wong",
"wood",
"wren",
"wynn",
"xmas",
"yacc",
"yale",
"yalu",
"yang",
"yank",
"ymir",
"yoda",
"yoko",
"yong",
"york",
"yuan",
"yugo",
"yule",
"yuri",
"yves",
"zane",
"zara",
"zeke",
"zeno",
"zens",
"zest",
"zeus",
"zibo",
"zion",
"zola",
"zorn",
"zulu",
"zuni",
"abed",
"abet",
"able",
"ably",
"abut",
"aced",
"aces",
"ache",
"achy",
"acid",
"acme",
"acne",
"acre",
"acts",
"adds",
"adze",
"aeon",
"aery",
"afar",
"agar",
"aged",
"ages",
"agog",
"ague",
"ahem",
"ahoy",
"aide",
"aids",
"ails",
"aims",
"airs",
"airy",
"ajar",
"akin",
"alas",
"albs",
"ales",
"alga",
"alit",
"ally",
"alms",
"aloe",
"also",
"alto",
"alum",
"amen",
"amid",
"amir",
"ammo",
"amok",
"amps",
"anal",
"anew",
"ankh",
"anon",
"ante",
"anti",
"ants",
"anus",
"aped",
"apes",
"apex",
"apse",
"aqua",
"arch",
"arcs",
"area",
"ares",
"aria",
"arid",
"arks",
"arms",
"army",
"arts",
"arty",
"ashy",
"asks",
"asps",
"atom",
"atop",
"auks",
"aunt",
"aura",
"auto",
"aver",
"avid",
"avow",
"away",
"awed",
"awes",
"awls",
"awol",
"awry",
"axed",
"axes",
"axis",
"axle",
"axon",
"ayes",
"baas",
"babe",
"baby",
"back",
"bade",
"bags",
"bail",
"bait",
"bake",
"bald",
"bale",
"balk",
"ball",
"balm",
"band",
"bane",
"bang",
"bani",
"bank",
"bans",
"barb",
"bard",
"bare",
"barf",
"bark",
"barn",
"bars",
"base",
"bash",
"bask",
"bass",
"bast",
"bate",
"bath",
"bats",
"baud",
"bawl",
"bays",
"bead",
"beak",
"beam",
"bean",
"bear",
"beat",
"beau",
"beck",
"beds",
"beef",
"been",
"beep",
"beer",
"bees",
"beet",
"begs",
"bell",
"belt",
"bend",
"bent",
"berg",
"berm",
"best",
"beta",
"bets",
"bevy",
"bias",
"bibs",
"bide",
"bids",
"bier",
"bike",
"bile",
"bilk",
"bill",
"bind",
"bins",
"bird",
"bite",
"bits",
"blab",
"blah",
"bled",
"blew",
"blip",
"blob",
"bloc",
"blog",
"blot",
"blow",
"blue",
"blur",
"boar",
"boas",
"boat",
"bobs",
"bode",
"body",
"bogs",
"bogy",
"boil",
"bola",
"bold",
"bole",
"boll",
"bolt",
"bomb",
"bond",
"bone",
"bong",
"bony",
"book",
"boom",
"boon",
"boor",
"boos",
"boot",
"bops",
"bore",
"born",
"bosh",
"boss",
"both",
"bout",
"bowl",
"bows",
"boys",
"bozo",
"brad",
"brag",
"bran",
"bras",
"brat",
"bray",
"bred",
"brew",
"brig",
"brim",
"brow",
"buck",
"buds",
"buff",
"bugs",
"bulb",
"bulk",
"bull",
"bump",
"bums",
"bung",
"bunk",
"buns",
"bunt",
"buoy",
"burg",
"burn",
"burp",
"burr",
"burs",
"bury",
"bush",
"buss",
"bust",
"busy",
"buts",
"butt",
"buys",
"buzz",
"byes",
"byte",
"cabs",
"cads",
"cage",
"cagy",
"cake",
"calf",
"calk",
"call",
"calm",
"came",
"camp",
"cams",
"cane",
"cans",
"cant",
"cape",
"caps",
"card",
"care",
"carp",
"cars",
"cart",
"case",
"cash",
"cask",
"cast",
"cats",
"cave",
"caws",
"cede",
"cell",
"cent",
"chap",
"char",
"chat",
"chef",
"chew",
"chic",
"chid",
"chin",
"chip",
"chit",
"chop",
"chow",
"chug",
"chum",
"cite",
"city",
"clad",
"clam",
"clan",
"clap",
"claw",
"clay",
"clef",
"clew",
"clip",
"clod",
"clog",
"clop",
"clot",
"cloy",
"club",
"clue",
"coal",
"coat",
"coax",
"cobs",
"coda",
"code",
"cods",
"coed",
"cogs",
"coif",
"coil",
"coin",
"coke",
"cola",
"cold",
"cols",
"colt",
"coma",
"comb",
"come",
"cone",
"conk",
"cons",
"cook",
"cool",
"coop",
"coos",
"coot",
"cope",
"cops",
"copy",
"cord",
"core",
"cork",
"corm",
"corn",
"cost",
"cosy",
"cote",
"cots",
"coup",
"cove",
"cowl",
"cows",
"cozy",
"crab",
"crag",
"cram",
"crap",
"craw",
"crew",
"crib",
"crop",
"crow",
"crud",
"crux",
"cube",
"cubs",
"cuds",
"cued",
"cues",
"cuff",
"cull",
"cult",
"cums",
"cups",
"curb",
"curd",
"cure",
"curl",
"curs",
"curt",
"cusp",
"cuss",
"cute",
"cuts",
"cyst",
"czar",
"dabs",
"dado",
"dads",
"daft",
"dais",
"dale",
"dame",
"damn",
"damp",
"dams",
"dank",
"dare",
"dark",
"darn",
"dart",
"dash",
"data",
"date",
"daub",
"dawn",
"days",
"daze",
"dead",
"deaf",
"deal",
"dean",
"dear",
"debs",
"debt",
"deck",
"deed",
"deem",
"deep",
"deer",
"deft",
"defy",
"deli",
"dell",
"demo",
"dens",
"dent",
"deny",
"desk",
"dewy",
"dial",
"dice",
"died",
"dies",
"diet",
"digs",
"dike",
"dill",
"dime",
"dims",
"dine",
"ding",
"dins",
"dint",
"dips",
"dire",
"dirk",
"dirt",
"disc",
"dish",
"disk",
"diss",
"diva",
"dive",
"dock",
"docs",
"dodo",
"doer",
"does",
"doff",
"dogs",
"dole",
"doll",
"dolt",
"dome",
"done",
"dons",
"doom",
"door",
"dope",
"dopy",
"dork",
"dorm",
"dory",
"dose",
"dote",
"doth",
"dots",
"dour",
"dove",
"down",
"doze",
"drab",
"drag",
"dram",
"draw",
"dray",
"drew",
"drip",
"drop",
"drub",
"drug",
"drum",
"drys",
"dual",
"dubs",
"duck",
"duct",
"dude",
"duds",
"duel",
"dues",
"duet",
"duff",
"duke",
"dull",
"duly",
"dumb",
"dump",
"dune",
"dung",
"dunk",
"duns",
"duos",
"dupe",
"dusk",
"dust",
"duty",
"dyed",
"dyer",
"dyes",
"dyke",
"ebay",
"each",
"earl",
"earn",
"ears",
"ease",
"east",
"easy",
"eats",
"eave",
"ebbs",
"echo",
"ecru",
"eddy",
"edge",
"edgy",
"edit",
"eels",
"eery",
"eggs",
"egis",
"egos",
"eked",
"ekes",
"elks",
"ells",
"elms",
"else",
"emir",
"emit",
"emus",
"ends",
"envy",
"eons",
"epic",
"eras",
"ergo",
"ergs",
"errs",
"espy",
"etch",
"euro",
"even",
"ever",
"eves",
"evil",
"ewer",
"ewes",
"exam",
"exec",
"exes",
"exit",
"expo",
"eyed",
"eyes",
"face",
"fact",
"fade",
"fads",
"fags",
"fail",
"fain",
"fair",
"fake",
"fall",
"fame",
"fang",
"fans",
"fare",
"farm",
"fart",
"fast",
"fate",
"fats",
"faun",
"fawn",
"faze",
"fear",
"feat",
"feds",
"feed",
"feel",
"fees",
"feet",
"fell",
"felt",
"fend",
"fens",
"fern",
"fest",
"feta",
"feud",
"fiat",
"fibs",
"fief",
"fife",
"figs",
"file",
"fill",
"film",
"find",
"fine",
"fink",
"fins",
"fire",
"firm",
"firs",
"fish",
"fist",
"fits",
"five",
"fizz",
"flab",
"flag",
"flak",
"flan",
"flap",
"flat",
"flaw",
"flax",
"flay",
"flea",
"fled",
"flee",
"flew",
"flex",
"flip",
"flit",
"floe",
"flog",
"flop",
"flow",
"flub",
"flue",
"flux",
"foal",
"foam",
"fobs",
"foci",
"foes",
"fogs",
"fogy",
"foil",
"fold",
"folk",
"fond",
"font",
"food",
"fool",
"foot",
"fops",
"fora",
"ford",
"fore",
"fork",
"form",
"fort",
"foul",
"four",
"fowl",
"foxy",
"frat",
"fray",
"free",
"fret",
"frog",
"from",
"fuel",
"full",
"fume",
"fund",
"funk",
"furl",
"furs",
"fury",
"fuse",
"fuss",
"futz",
"fuze",
"fuzz",
"gabs",
"gads",
"gaff",
"gage",
"gags",
"gain",
"gait",
"gala",
"gale",
"gall",
"gals",
"game",
"gamy",
"gang",
"gape",
"gaps",
"garb",
"gash",
"gasp",
"gate",
"gave",
"gawk",
"gays",
"gaze",
"gear",
"geed",
"geek",
"gees",
"geez",
"geld",
"gels",
"gelt",
"gems",
"gene",
"gent",
"germ",
"gets",
"gibe",
"gift",
"gigs",
"gild",
"gill",
"gilt",
"gins",
"gird",
"girl",
"girt",
"gist",
"give",
"glad",
"glee",
"glen",
"glib",
"glob",
"glop",
"glow",
"glue",
"glum",
"glut",
"gnat",
"gnaw",
"gnus",
"goad",
"goal",
"goat",
"gobs",
"gods",
"goes",
"gold",
"golf",
"gone",
"gong",
"good",
"goof",
"goon",
"goop",
"gore",
"gory",
"gosh",
"gout",
"gown",
"grab",
"grad",
"gram",
"gray",
"grew",
"grey",
"grid",
"grim",
"grin",
"grip",
"grit",
"grog",
"grow",
"grub",
"guff",
"gulf",
"gull",
"gulp",
"gums",
"gunk",
"guns",
"guru",
"gush",
"gust",
"guts",
"guys",
"gybe",
"gyms",
"gyro",
"hack",
"haft",
"hags",
"hail",
"hair",
"hake",
"hale",
"half",
"hall",
"halo",
"halt",
"hams",
"hand",
"hang",
"hank",
"hard",
"hare",
"hark",
"harm",
"harp",
"hart",
"hash",
"hasp",
"hate",
"hath",
"hats",
"haul",
"have",
"hawk",
"haws",
"hays",
"haze",
"hazy",
"head",
"heal",
"heap",
"hear",
"heat",
"heck",
"heed",
"heel",
"heft",
"heir",
"held",
"hell",
"helm",
"help",
"hemp",
"hems",
"hens",
"herb",
"herd",
"here",
"hero",
"hers",
"hewn",
"hews",
"hick",
"hide",
"hied",
"hies",
"high",
"hike",
"hill",
"hilt",
"hims",
"hind",
"hint",
"hips",
"hire",
"hiss",
"hits",
"hive",
"hoax",
"hobo",
"hobs",
"hock",
"hods",
"hoed",
"hoes",
"hogs",
"hold",
"hole",
"holy",
"home",
"homy",
"hone",
"honk",
"hood",
"hoof",
"hook",
"hoop",
"hoot",
"hope",
"hops",
"horn",
"hose",
"host",
"hour",
"hove",
"howl",
"hows",
"hubs",
"hued",
"hues",
"huff",
"huge",
"hugs",
"hula",
"hulk",
"hull",
"hump",
"hums",
"hung",
"hunk",
"hunt",
"hurl",
"hurt",
"hush",
"husk",
"huts",
"hymn",
"hype",
"hypo",
"ipad",
"ipod",
"iamb",
"ibex",
"ibis",
"iced",
"ices",
"icky",
"icon",
"idea",
"ides",
"idle",
"idly",
"idol",
"idyl",
"iffy",
"ikon",
"ilks",
"ills",
"imam",
"imps",
"inch",
"info",
"inks",
"inky",
"inns",
"into",
"ions",
"iota",
"iris",
"irks",
"iron",
"isle",
"isms",
"itch",
"item",
"jabs",
"jack",
"jade",
"jags",
"jail",
"jamb",
"jams",
"jape",
"jars",
"jaws",
"jays",
"jazz",
"jeep",
"jeer",
"jeez",
"jell",
"jerk",
"jest",
"jets",
"jibe",
"jibs",
"jigs",
"jilt",
"jinn",
"jinx",
"jive",
"jobs",
"jock",
"jogs",
"john",
"join",
"joke",
"jolt",
"josh",
"jots",
"jowl",
"joys",
"judo",
"jugs",
"jump",
"junk",
"jury",
"just",
"jute",
"juts",
"kale",
"keel",
"keen",
"keep",
"kegs",
"kelp",
"kens",
"kept",
"keys",
"khan",
"kick",
"kids",
"kill",
"kiln",
"kilo",
"kilt",
"kind",
"king",
"kink",
"kiss",
"kite",
"kith",
"kits",
"kiwi",
"knee",
"knew",
"knit",
"knob",
"knot",
"know",
"kook",
"labs",
"lace",
"lack",
"lacy",
"lade",
"lads",
"lady",
"lags",
"laid",
"lain",
"lair",
"lake",
"lama",
"lamb",
"lame",
"lamp",
"lams",
"land",
"lane",
"lank",
"laps",
"lard",
"lark",
"lash",
"lass",
"last",
"late",
"lath",
"lats",
"laud",
"lava",
"lawn",
"laws",
"lays",
"laze",
"lazy",
"lead",
"leaf",
"leak",
"lean",
"leap",
"leas",
"leek",
"leer",
"lees",
"left",
"legs",
"leis",
"lend",
"lens",
"lent",
"lept",
"less",
"lest",
"lets",
"levy",
"lewd",
"liar",
"lice",
"lick",
"lids",
"lied",
"lief",
"lien",
"lies",
"lieu",
"life",
"lift",
"like",
"lilt",
"lily",
"limb",
"lime",
"limn",
"limo",
"limp",
"limy",
"line",
"link",
"lint",
"lion",
"lips",
"lira",
"lire",
"lisp",
"list",
"lite",
"live",
"load",
"loaf",
"loam",
"loan",
"lobe",
"lobs",
"loci",
"lock",
"loco",
"lode",
"loft",
"loge",
"logo",
"logs",
"loin",
"loll",
"lone",
"long",
"look",
"loom",
"loon",
"loop",
"loot",
"lope",
"lops",
"lord",
"lore",
"lorn",
"lose",
"loss",
"lost",
"loth",
"lots",
"loud",
"lout",
"love",
"lows",
"luau",
"lube",
"luck",
"lugs",
"lull",
"lump",
"lung",
"lure",
"lurk",
"lush",
"lust",
"lute",
"lynx",
"lyre",
"mace",
"made",
"mads",
"maid",
"mail",
"maim",
"main",
"make",
"male",
"mall",
"malt",
"mama",
"mane",
"mans",
"many",
"maps",
"mare",
"mark",
"mars",
"mart",
"mash",
"mask",
"mass",
"mast",
"mate",
"math",
"mats",
"matt",
"maul",
"maws",
"mayo",
"maze",
"mead",
"meal",
"mean",
"meat",
"meek",
"meet",
"megs",
"meld",
"melt",
"memo",
"mend",
"menu",
"meow",
"mere",
"mesa",
"mesh",
"mess",
"mete",
"mewl",
"mews",
"mica",
"mice",
"mien",
"miff",
"mike",
"mild",
"mile",
"milk",
"mill",
"mils",
"mime",
"mind",
"mine",
"mini",
"mink",
"mint",
"minx",
"mire",
"miss",
"mist",
"mite",
"mitt",
"moan",
"moat",
"mobs",
"mock",
"mode",
"mods",
"mold",
"mole",
"moll",
"molt",
"moms",
"monk",
"mono",
"mood",
"moon",
"moor",
"moos",
"moot",
"mope",
"mops",
"more",
"morn",
"moss",
"most",
"mote",
"moth",
"move",
"mown",
"mows",
"much",
"muck",
"muff",
"mugs",
"mule",
"mull",
"mums",
"murk",
"muse",
"mush",
"musk",
"muss",
"must",
"mute",
"mutt",
"myna",
"myth",
"nabs",
"nags",
"nail",
"name",
"nape",
"naps",
"narc",
"nark",
"nary",
"nave",
"navy",
"nays",
"near",
"neat",
"neck",
"need",
"neon",
"nerd",
"nest",
"nets",
"news",
"newt",
"next",
"nibs",
"nice",
"nick",
"nigh",
"nine",
"nips",
"nite",
"nits",
"node",
"nods",
"noel",
"noes",
"none",
"nook",
"noon",
"nope",
"norm",
"nose",
"nosh",
"nosy",
"note",
"noun",
"nous",
"nova",
"nubs",
"nude",
"nuke",
"null",
"numb",
"nuns",
"nuts",
"oafs",
"oaks",
"oars",
"oath",
"oats",
"obey",
"obit",
"oboe",
"odds",
"odes",
"odor",
"offs",
"ogle",
"ogre",
"ohms",
"oils",
"oily",
"oink",
"okay",
"okra",
"oleo",
"omen",
"omit",
"once",
"ones",
"only",
"onto",
"onus",
"onyx",
"oops",
"ooze",
"opal",
"open",
"opts",
"opus",
"oral",
"orbs",
"ores",
"orgy",
"ouch",
"ours",
"oust",
"outs",
"oval",
"oven",
"over",
"ovum",
"owed",
"owes",
"owls",
"owns",
"oxen",
"pace",
"pack",
"pact",
"pads",
"page",
"paid",
"pail",
"pain",
"pair",
"pale",
"pall",
"palm",
"pals",
"pane",
"pang",
"pans",
"pant",
"papa",
"paps",
"pare",
"park",
"pars",
"part",
"pass",
"past",
"pate",
"path",
"pats",
"pave",
"pawl",
"pawn",
"paws",
"pays",
"peak",
"peal",
"pear",
"peas",
"peat",
"peck",
"peed",
"peek",
"peel",
"peep",
"peer",
"pees",
"pegs",
"pelt",
"pens",
"pent",
"peon",
"peps",
"perk",
"perm",
"pert",
"peso",
"pest",
"pets",
"pews",
"pica",
"pick",
"pied",
"pier",
"pies",
"pigs",
"pike",
"pile",
"pill",
"pimp",
"pine",
"ping",
"pink",
"pins",
"pint",
"pipe",
"pips",
"pita",
"pith",
"pits",
"pity",
"pixy",
"plan",
"play",
"plea",
"pled",
"plod",
"plop",
"plot",
"plow",
"ploy",
"plug",
"plum",
"plus",
"pock",
"pods",
"poem",
"poet",
"poke",
"poky",
"pole",
"poll",
"polo",
"pols",
"pomp",
"pond",
"pone",
"pony",
"pooh",
"pool",
"poor",
"pope",
"pops",
"pore",
"pork",
"porn",
"port",
"pose",
"posh",
"post",
"posy",
"pots",
"pour",
"pout",
"pram",
"pray",
"prep",
"prey",
"prig",
"prim",
"prod",
"prof",
"prom",
"prop",
"pros",
"prow",
"psst",
"pubs",
"puck",
"puff",
"pugs",
"puke",
"pull",
"pulp",
"puma",
"pump",
"punk",
"puns",
"punt",
"puny",
"pupa",
"pups",
"pure",
"purl",
"purr",
"push",
"puss",
"puts",
"putt",
"pyre",
"quad",
"quay",
"quid",
"quip",
"quit",
"quiz",
"race",
"rack",
"racy",
"raft",
"raga",
"rage",
"rags",
"raid",
"rail",
"rain",
"raja",
"rake",
"ramp",
"rams",
"rang",
"rank",
"rant",
"rape",
"raps",
"rapt",
"rare",
"rash",
"rasp",
"rate",
"rats",
"rave",
"rays",
"raze",
"razz",
"read",
"real",
"ream",
"reap",
"rear",
"redo",
"reds",
"reed",
"reef",
"reek",
"reel",
"refs",
"rein",
"reis",
"rely",
"rend",
"rent",
"reps",
"rest",
"revs",
"rhea",
"ribs",
"rice",
"rich",
"rick",
"ride",
"rids",
"rife",
"riff",
"rift",
"rigs",
"rile",
"rill",
"rime",
"rims",
"rind",
"ring",
"rink",
"riot",
"ripe",
"rips",
"rise",
"risk",
"rite",
"road",
"roam",
"roan",
"roar",
"robe",
"robs",
"rock",
"rode",
"rods",
"roes",
"roil",
"role",
"roll",
"romp",
"rood",
"roof",
"rook",
"room",
"root",
"rope",
"rose",
"rosy",
"rote",
"rots",
"rout",
"rove",
"rows",
"rube",
"rubs",
"ruby",
"rude",
"rued",
"rues",
"ruff",
"rugs",
"ruin",
"rule",
"rump",
"rums",
"rune",
"rung",
"runs",
"runt",
"ruse",
"rush",
"rusk",
"rust",
"ruts",
"sack",
"sacs",
"safe",
"saga",
"sage",
"sago",
"sags",
"said",
"sail",
"sake",
"saki",
"sale",
"salt",
"same",
"sand",
"sane",
"sang",
"sank",
"sans",
"saps",
"sari",
"sash",
"sass",
"sate",
"save",
"sawn",
"saws",
"says",
"scab",
"scad",
"scam",
"scan",
"scar",
"scat",
"scow",
"scud",
"scum",
"seal",
"seam",
"sear",
"seas",
"seat",
"secs",
"sect",
"seed",
"seek",
"seem",
"seen",
"seep",
"seer",
"sees",
"self",
"sell",
"semi",
"send",
"sent",
"sera",
"sere",
"serf",
"sets",
"sewn",
"sews",
"sexy",
"shad",
"shag",
"shah",
"sham",
"shat",
"shed",
"shes",
"shim",
"shin",
"ship",
"shod",
"shoe",
"shoo",
"shop",
"shot",
"show",
"shun",
"shut",
"sick",
"sics",
"side",
"sift",
"sigh",
"sign",
"silk",
"sill",
"silo",
"silt",
"sine",
"sing",
"sink",
"sins",
"sips",
"sire",
"sirs",
"site",
"sits",
"size",
"skew",
"skid",
"skim",
"skin",
"skip",
"skis",
"skit",
"slab",
"slag",
"slam",
"slap",
"slat",
"slaw",
"slay",
"sled",
"slew",
"slid",
"slim",
"slip",
"slit",
"slob",
"sloe",
"slog",
"slop",
"slot",
"slow",
"slue",
"slug",
"slum",
"slur",
"smit",
"smog",
"smug",
"smut",
"snag",
"snap",
"snip",
"snit",
"snob",
"snot",
"snow",
"snub",
"snug",
"soak",
"soap",
"soar",
"sobs",
"sock",
"soda",
"sods",
"sofa",
"soft",
"soil",
"sold",
"sole",
"soli",
"solo",
"sols",
"some",
"song",
"sons",
"soon",
"soot",
"sops",
"sore",
"sort",
"sots",
"soul",
"soup",
"sour",
"sown",
"sows",
"soya",
"span",
"spar",
"spas",
"spat",
"spay",
"spec",
"sped",
"spew",
"spin",
"spit",
"spot",
"spry",
"spud",
"spun",
"spur",
"stab",
"stag",
"star",
"stay",
"stem",
"step",
"stew",
"stir",
"stop",
"stow",
"stub",
"stud",
"stun",
"stye",
"subs",
"such",
"suck",
"suds",
"sued",
"sues",
"suet",
"suit",
"sulk",
"sumo",
"sump",
"sums",
"sung",
"sunk",
"suns",
"sups",
"sure",
"surf",
"swab",
"swag",
"swam",
"swan",
"swap",
"swat",
"sway",
"swig",
"swim",
"swop",
"swum",
"sync",
"tabs",
"tabu",
"tack",
"taco",
"tact",
"tads",
"tags",
"tail",
"take",
"talc",
"tale",
"talk",
"tall",
"tame",
"tamp",
"tams",
"tang",
"tank",
"tans",
"tape",
"taps",
"tare",
"taro",
"tarp",
"tars",
"tart",
"task",
"tats",
"taut",
"taxi",
"teak",
"teal",
"team",
"tear",
"teas",
"teat",
"teed",
"teem",
"teen",
"tees",
"tell",
"temp",
"tend",
"tens",
"tent",
"term",
"tern",
"test",
"text",
"than",
"that",
"thaw",
"thee",
"them",
"then",
"they",
"thin",
"this",
"thou",
"thru",
"thud",
"thug",
"thus",
"tick",
"tics",
"tide",
"tidy",
"tied",
"tier",
"ties",
"tiff",
"tike",
"tile",
"till",
"tilt",
"time",
"tine",
"ting",
"tins",
"tint",
"tiny",
"tipi",
"tips",
"tire",
"tiro",
"toad",
"toed",
"toes",
"tofu",
"toga",
"togs",
"toil",
"toke",
"told",
"toll",
"tomb",
"tome",
"toms",
"tone",
"tong",
"tons",
"tony",
"took",
"tool",
"toot",
"tops",
"tore",
"torn",
"tors",
"tort",
"toss",
"tost",
"tote",
"tots",
"tour",
"tout",
"town",
"tows",
"toys",
"tram",
"trap",
"tray",
"tree",
"trek",
"trig",
"trim",
"trio",
"trip",
"trod",
"trot",
"troy",
"true",
"tsar",
"tuba",
"tube",
"tubs",
"tuck",
"tuft",
"tugs",
"tuna",
"tune",
"tuns",
"turd",
"turf",
"turn",
"tush",
"tusk",
"tutu",
"twee",
"twig",
"twin",
"twit",
"twos",
"tyke",
"type",
"typo",
"tyro",
"tzar",
"ugly",
"ulna",
"umps",
"undo",
"unit",
"unto",
"upon",
"urea",
"urge",
"uric",
"urns",
"used",
"user",
"uses",
"vain",
"vale",
"vamp",
"vane",
"vans",
"vary",
"vase",
"vast",
"vats",
"veal",
"veep",
"veer",
"veil",
"vein",
"veld",
"vend",
"vent",
"verb",
"very",
"vest",
"veto",
"vets",
"vial",
"vibe",
"vice",
"vied",
"vies",
"view",
"vile",
"vine",
"viol",
"visa",
"vise",
"viva",
"void",
"vole",
"volt",
"vote",
"vows",
"wade",
"wadi",
"wads",
"waft",
"wage",
"wags",
"waif",
"wail",
"wait",
"wake",
"wale",
"walk",
"wall",
"wand",
"wane",
"want",
"ward",
"ware",
"warm",
"warn",
"warp",
"wars",
"wart",
"wary",
"wash",
"wasp",
"watt",
"wave",
"wavy",
"waxy",
"ways",
"weak",
"weal",
"wean",
"wear",
"webs",
"weds",
"weed",
"week",
"weep",
"weer",
"wees",
"weft",
"weir",
"weld",
"well",
"welt",
"wend",
"wens",
"went",
"wept",
"were",
"west",
"wets",
"wham",
"what",
"when",
"whet",
"whew",
"whey",
"whim",
"whip",
"whir",
"whit",
"whiz",
"whoa",
"whom",
"whys",
"wick",
"wide",
"wife",
"wigs",
"wiki",
"wild",
"wile",
"will",
"wilt",
"wily",
"wimp",
"wind",
"wine",
"wing",
"wink",
"wino",
"wins",
"wipe",
"wire",
"wiry",
"wise",
"wish",
"wisp",
"wist",
"with",
"wits",
"wive",
"woes",
"woke",
"woks",
"wolf",
"womb",
"wont",
"wood",
"woof",
"wool",
"woos",
"word",
"wore",
"work",
"worm",
"worn",
"wove",
"wows",
"wrap",
"wren",
"writ",
"wuss",
"yack",
"yaks",
"yams",
"yank",
"yaps",
"yard",
"yarn",
"yawl",
"yawn",
"yaws",
"yeah",
"year",
"yeas",
"yell",
"yelp",
"yens",
"yeps",
"yest",
"yeti",
"yews",
"yips",
"yock",
"yoga",
"yogi",
"yoke",
"yolk",
"yore",
"your",
"yous",
"yowl",
"yuck",
"yuks",
"yule",
"yups",
"zany",
"zaps",
"zeal",
"zebu",
"zeds",
"zero",
"zest",
"zeta",
"zinc",
"zing",
"zips",
"zits",
"zone",
"zoom",
"zoos"
];

module.exports["word"] = four_words;

},{}],2:[function(require,module,exports){
/*******************************************************************************
 *                                                                              *
 * Author    :  Angus Johnson                                                   *
 * Version   :  6.4.2                                                           *
 * Date      :  27 February 2017                                                *
 * Website   :  http://www.angusj.com                                           *
 * Copyright :  Angus Johnson 2010-2017                                         *
 *                                                                              *
 * License:                                                                     *
 * Use, modification & distribution is subject to Boost Software License Ver 1. *
 * http://www.boost.org/LICENSE_1_0.txt                                         *
 *                                                                              *
 * Attributions:                                                                *
 * The code in this library is an extension of Bala Vatti's clipping algorithm: *
 * "A generic solution to polygon clipping"                                     *
 * Communications of the ACM, Vol 35, Issue 7 (July 1992) pp 56-63.             *
 * http://portal.acm.org/citation.cfm?id=129906                                 *
 *                                                                              *
 * Computer graphics and geometric modeling: implementation and algorithms      *
 * By Max K. Agoston                                                            *
 * Springer; 1 edition (January 4, 2005)                                        *
 * http://books.google.com/books?q=vatti+clipping+agoston                       *
 *                                                                              *
 * See also:                                                                    *
 * "Polygon Offsetting by Computing Winding Numbers"                            *
 * Paper no. DETC2005-85513 pp. 565-575                                         *
 * ASME 2005 International Design Engineering Technical Conferences             *
 * and Computers and Information in Engineering Conference (IDETC/CIE2005)      *
 * September 24-28, 2005 , Long Beach, California, USA                          *
 * http://www.me.berkeley.edu/~mcmains/pubs/DAC05OffsetPolygon.pdf              *
 *                                                                              *
 *******************************************************************************/
/*******************************************************************************
 *                                                                              *
 * Author    :  Timo                                                            *
 * Version   :  6.4.2.2                                                         *
 * Date      :  8 September 2017                                                 *
 *                                                                              *
 * This is a translation of the C# Clipper library to Javascript.               *
 * Int128 struct of C# is implemented using JSBN of Tom Wu.                     *
 * Because Javascript lacks support for 64-bit integers, the space              *
 * is a little more restricted than in C# version.                              *
 *                                                                              *
 * C# version has support for coordinate space:                                 *
 * +-4611686018427387903 ( sqrt(2^127 -1)/2 )                                   *
 * while Javascript version has support for space:                              *
 * +-4503599627370495 ( sqrt(2^106 -1)/2 )                                      *
 *                                                                              *
 * Tom Wu's JSBN proved to be the fastest big integer library:                  *
 * http://jsperf.com/big-integer-library-test                                   *
 *                                                                              *
 * This class can be made simpler when (if ever) 64-bit integer support comes   *
 * or floating point Clipper is released.                                       *
 *                                                                              *
 *******************************************************************************/
/*******************************************************************************
 *                                                                              *
 * Basic JavaScript BN library - subset useful for RSA encryption.              *
 * http://www-cs-students.stanford.edu/~tjw/jsbn/                               *
 * Copyright (c) 2005  Tom Wu                                                   *
 * All Rights Reserved.                                                         *
 * See "LICENSE" for details:                                                   *
 * http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE                        *
 *                                                                              *
 *******************************************************************************/
(function ()
{
	"use strict";
	var ClipperLib = {};
	ClipperLib.version = '6.4.2.2';

	//UseLines: Enables open path clipping. Adds a very minor cost to performance.
	ClipperLib.use_lines = true;

	//ClipperLib.use_xyz: adds a Z member to IntPoint. Adds a minor cost to performance.
	ClipperLib.use_xyz = false;

	var isNode = false;
	if (typeof module !== 'undefined' && module.exports)
	{
		module.exports = ClipperLib;
		isNode = true;
	}
	else
	{
		if (typeof (document) !== "undefined") window.ClipperLib = ClipperLib;
		else self['ClipperLib'] = ClipperLib;
	}
	var navigator_appName;
	if (!isNode)
	{
		var nav = navigator.userAgent.toString().toLowerCase();
		navigator_appName = navigator.appName;
	}
	else
	{
		var nav = "chrome"; // Node.js uses Chrome's V8 engine
		navigator_appName = "Netscape"; // Firefox, Chrome and Safari returns "Netscape", so Node.js should also
	}
	// Browser test to speedup performance critical functions
	var browser = {};

	if (nav.indexOf("chrome") != -1 && nav.indexOf("chromium") == -1) browser.chrome = 1;
	else browser.chrome = 0;
	if (nav.indexOf("chromium") != -1) browser.chromium = 1;
	else browser.chromium = 0;
	if (nav.indexOf("safari") != -1 && nav.indexOf("chrome") == -1 && nav.indexOf("chromium") == -1) browser.safari = 1;
	else browser.safari = 0;
	if (nav.indexOf("firefox") != -1) browser.firefox = 1;
	else browser.firefox = 0;
	if (nav.indexOf("firefox/17") != -1) browser.firefox17 = 1;
	else browser.firefox17 = 0;
	if (nav.indexOf("firefox/15") != -1) browser.firefox15 = 1;
	else browser.firefox15 = 0;
	if (nav.indexOf("firefox/3") != -1) browser.firefox3 = 1;
	else browser.firefox3 = 0;
	if (nav.indexOf("opera") != -1) browser.opera = 1;
	else browser.opera = 0;
	if (nav.indexOf("msie 10") != -1) browser.msie10 = 1;
	else browser.msie10 = 0;
	if (nav.indexOf("msie 9") != -1) browser.msie9 = 1;
	else browser.msie9 = 0;
	if (nav.indexOf("msie 8") != -1) browser.msie8 = 1;
	else browser.msie8 = 0;
	if (nav.indexOf("msie 7") != -1) browser.msie7 = 1;
	else browser.msie7 = 0;
	if (nav.indexOf("msie ") != -1) browser.msie = 1;
	else browser.msie = 0;
	ClipperLib.biginteger_used = null;

	// Copyright (c) 2005  Tom Wu
	// All Rights Reserved.
	// See "LICENSE" for details.
	// Basic JavaScript BN library - subset useful for RSA encryption.
	// Bits per digit
	var dbits;
	// JavaScript engine analysis
	var canary = 0xdeadbeefcafe;
	var j_lm = ((canary & 0xffffff) == 0xefcafe);
	// (public) Constructor
	/**
	* @constructor
	*/
	function BigInteger(a, b, c)
	{
		// This test variable can be removed,
		// but at least for performance tests it is useful piece of knowledge
		// This is the only ClipperLib related variable in BigInteger library
		ClipperLib.biginteger_used = 1;
		if (a != null)
			if ("number" == typeof a && "undefined" == typeof (b)) this.fromInt(a); // faster conversion
			else if ("number" == typeof a) this.fromNumber(a, b, c);
		else if (b == null && "string" != typeof a) this.fromString(a, 256);
		else this.fromString(a, b);
	}
	// return new, unset BigInteger
	function nbi()
	{
		return new BigInteger(null, undefined, undefined);
	}
	// am: Compute w_j += (x*this_i), propagate carries,
	// c is initial carry, returns final carry.
	// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
	// We need to select the fastest one that works in this environment.
	// am1: use a single mult and divide to get the high bits,
	// max digit bits should be 26 because
	// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
	function am1(i, x, w, j, c, n)
	{
		while (--n >= 0)
		{
			var v = x * this[i++] + w[j] + c;
			c = Math.floor(v / 0x4000000);
			w[j++] = v & 0x3ffffff;
		}
		return c;
	}
	// am2 avoids a big mult-and-extract completely.
	// Max digit bits should be <= 30 because we do bitwise ops
	// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
	function am2(i, x, w, j, c, n)
	{
		var xl = x & 0x7fff,
			xh = x >> 15;
		while (--n >= 0)
		{
			var l = this[i] & 0x7fff;
			var h = this[i++] >> 15;
			var m = xh * l + h * xl;
			l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
			c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
			w[j++] = l & 0x3fffffff;
		}
		return c;
	}
	// Alternately, set max digit bits to 28 since some
	// browsers slow down when dealing with 32-bit numbers.
	function am3(i, x, w, j, c, n)
	{
		var xl = x & 0x3fff,
			xh = x >> 14;
		while (--n >= 0)
		{
			var l = this[i] & 0x3fff;
			var h = this[i++] >> 14;
			var m = xh * l + h * xl;
			l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
			c = (l >> 28) + (m >> 14) + xh * h;
			w[j++] = l & 0xfffffff;
		}
		return c;
	}
	if (j_lm && (navigator_appName == "Microsoft Internet Explorer"))
	{
		BigInteger.prototype.am = am2;
		dbits = 30;
	}
	else if (j_lm && (navigator_appName != "Netscape"))
	{
		BigInteger.prototype.am = am1;
		dbits = 26;
	}
	else
	{ // Mozilla/Netscape seems to prefer am3
		BigInteger.prototype.am = am3;
		dbits = 28;
	}
	BigInteger.prototype.DB = dbits;
	BigInteger.prototype.DM = ((1 << dbits) - 1);
	BigInteger.prototype.DV = (1 << dbits);
	var BI_FP = 52;
	BigInteger.prototype.FV = Math.pow(2, BI_FP);
	BigInteger.prototype.F1 = BI_FP - dbits;
	BigInteger.prototype.F2 = 2 * dbits - BI_FP;
	// Digit conversions
	var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
	var BI_RC = new Array();
	var rr, vv;
	rr = "0".charCodeAt(0);
	for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
	rr = "a".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
	rr = "A".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

	function int2char(n)
	{
		return BI_RM.charAt(n);
	}

	function intAt(s, i)
	{
		var c = BI_RC[s.charCodeAt(i)];
		return (c == null) ? -1 : c;
	}
	// (protected) copy this to r
	function bnpCopyTo(r)
	{
		for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
		r.t = this.t;
		r.s = this.s;
	}
	// (protected) set from integer value x, -DV <= x < DV
	function bnpFromInt(x)
	{
		this.t = 1;
		this.s = (x < 0) ? -1 : 0;
		if (x > 0) this[0] = x;
		else if (x < -1) this[0] = x + this.DV;
		else this.t = 0;
	}
	// return bigint initialized to value
	function nbv(i)
	{
		var r = nbi();
		r.fromInt(i);
		return r;
	}
	// (protected) set from string and radix
	function bnpFromString(s, b)
	{
		var k;
		if (b == 16) k = 4;
		else if (b == 8) k = 3;
		else if (b == 256) k = 8; // byte array
		else if (b == 2) k = 1;
		else if (b == 32) k = 5;
		else if (b == 4) k = 2;
		else
		{
			this.fromRadix(s, b);
			return;
		}
		this.t = 0;
		this.s = 0;
		var i = s.length,
			mi = false,
			sh = 0;
		while (--i >= 0)
		{
			var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
			if (x < 0)
			{
				if (s.charAt(i) == "-") mi = true;
				continue;
			}
			mi = false;
			if (sh == 0)
				this[this.t++] = x;
			else if (sh + k > this.DB)
			{
				this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
				this[this.t++] = (x >> (this.DB - sh));
			}
			else
				this[this.t - 1] |= x << sh;
			sh += k;
			if (sh >= this.DB) sh -= this.DB;
		}
		if (k == 8 && (s[0] & 0x80) != 0)
		{
			this.s = -1;
			if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
		}
		this.clamp();
		if (mi) BigInteger.ZERO.subTo(this, this);
	}
	// (protected) clamp off excess high words
	function bnpClamp()
	{
		var c = this.s & this.DM;
		while (this.t > 0 && this[this.t - 1] == c) --this.t;
	}
	// (public) return string representation in given radix
	function bnToString(b)
	{
		if (this.s < 0) return "-" + this.negate().toString(b);
		var k;
		if (b == 16) k = 4;
		else if (b == 8) k = 3;
		else if (b == 2) k = 1;
		else if (b == 32) k = 5;
		else if (b == 4) k = 2;
		else return this.toRadix(b);
		var km = (1 << k) - 1,
			d, m = false,
			r = "",
			i = this.t;
		var p = this.DB - (i * this.DB) % k;
		if (i-- > 0)
		{
			if (p < this.DB && (d = this[i] >> p) > 0)
			{
				m = true;
				r = int2char(d);
			}
			while (i >= 0)
			{
				if (p < k)
				{
					d = (this[i] & ((1 << p) - 1)) << (k - p);
					d |= this[--i] >> (p += this.DB - k);
				}
				else
				{
					d = (this[i] >> (p -= k)) & km;
					if (p <= 0)
					{
						p += this.DB;
						--i;
					}
				}
				if (d > 0) m = true;
				if (m) r += int2char(d);
			}
		}
		return m ? r : "0";
	}
	// (public) -this
	function bnNegate()
	{
		var r = nbi();
		BigInteger.ZERO.subTo(this, r);
		return r;
	}
	// (public) |this|
	function bnAbs()
	{
		return (this.s < 0) ? this.negate() : this;
	}
	// (public) return + if this > a, - if this < a, 0 if equal
	function bnCompareTo(a)
	{
		var r = this.s - a.s;
		if (r != 0) return r;
		var i = this.t;
		r = i - a.t;
		if (r != 0) return (this.s < 0) ? -r : r;
		while (--i >= 0)
			if ((r = this[i] - a[i]) != 0) return r;
		return 0;
	}
	// returns bit length of the integer x
	function nbits(x)
	{
		var r = 1,
			t;
		if ((t = x >>> 16) != 0)
		{
			x = t;
			r += 16;
		}
		if ((t = x >> 8) != 0)
		{
			x = t;
			r += 8;
		}
		if ((t = x >> 4) != 0)
		{
			x = t;
			r += 4;
		}
		if ((t = x >> 2) != 0)
		{
			x = t;
			r += 2;
		}
		if ((t = x >> 1) != 0)
		{
			x = t;
			r += 1;
		}
		return r;
	}
	// (public) return the number of bits in "this"
	function bnBitLength()
	{
		if (this.t <= 0) return 0;
		return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
	}
	// (protected) r = this << n*DB
	function bnpDLShiftTo(n, r)
	{
		var i;
		for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
		for (i = n - 1; i >= 0; --i) r[i] = 0;
		r.t = this.t + n;
		r.s = this.s;
	}
	// (protected) r = this >> n*DB
	function bnpDRShiftTo(n, r)
	{
		for (var i = n; i < this.t; ++i) r[i - n] = this[i];
		r.t = Math.max(this.t - n, 0);
		r.s = this.s;
	}
	// (protected) r = this << n
	function bnpLShiftTo(n, r)
	{
		var bs = n % this.DB;
		var cbs = this.DB - bs;
		var bm = (1 << cbs) - 1;
		var ds = Math.floor(n / this.DB),
			c = (this.s << bs) & this.DM,
			i;
		for (i = this.t - 1; i >= 0; --i)
		{
			r[i + ds + 1] = (this[i] >> cbs) | c;
			c = (this[i] & bm) << bs;
		}
		for (i = ds - 1; i >= 0; --i) r[i] = 0;
		r[ds] = c;
		r.t = this.t + ds + 1;
		r.s = this.s;
		r.clamp();
	}
	// (protected) r = this >> n
	function bnpRShiftTo(n, r)
	{
		r.s = this.s;
		var ds = Math.floor(n / this.DB);
		if (ds >= this.t)
		{
			r.t = 0;
			return;
		}
		var bs = n % this.DB;
		var cbs = this.DB - bs;
		var bm = (1 << bs) - 1;
		r[0] = this[ds] >> bs;
		for (var i = ds + 1; i < this.t; ++i)
		{
			r[i - ds - 1] |= (this[i] & bm) << cbs;
			r[i - ds] = this[i] >> bs;
		}
		if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
		r.t = this.t - ds;
		r.clamp();
	}
	// (protected) r = this - a
	function bnpSubTo(a, r)
	{
		var i = 0,
			c = 0,
			m = Math.min(a.t, this.t);
		while (i < m)
		{
			c += this[i] - a[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		if (a.t < this.t)
		{
			c -= a.s;
			while (i < this.t)
			{
				c += this[i];
				r[i++] = c & this.DM;
				c >>= this.DB;
			}
			c += this.s;
		}
		else
		{
			c += this.s;
			while (i < a.t)
			{
				c -= a[i];
				r[i++] = c & this.DM;
				c >>= this.DB;
			}
			c -= a.s;
		}
		r.s = (c < 0) ? -1 : 0;
		if (c < -1) r[i++] = this.DV + c;
		else if (c > 0) r[i++] = c;
		r.t = i;
		r.clamp();
	}
	// (protected) r = this * a, r != this,a (HAC 14.12)
	// "this" should be the larger one if appropriate.
	function bnpMultiplyTo(a, r)
	{
		var x = this.abs(),
			y = a.abs();
		var i = x.t;
		r.t = i + y.t;
		while (--i >= 0) r[i] = 0;
		for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
		r.s = 0;
		r.clamp();
		if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
	}
	// (protected) r = this^2, r != this (HAC 14.16)
	function bnpSquareTo(r)
	{
		var x = this.abs();
		var i = r.t = 2 * x.t;
		while (--i >= 0) r[i] = 0;
		for (i = 0; i < x.t - 1; ++i)
		{
			var c = x.am(i, x[i], r, 2 * i, 0, 1);
			if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV)
			{
				r[i + x.t] -= x.DV;
				r[i + x.t + 1] = 1;
			}
		}
		if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
		r.s = 0;
		r.clamp();
	}
	// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
	// r != q, this != m.  q or r may be null.
	function bnpDivRemTo(m, q, r)
	{
		var pm = m.abs();
		if (pm.t <= 0) return;
		var pt = this.abs();
		if (pt.t < pm.t)
		{
			if (q != null) q.fromInt(0);
			if (r != null) this.copyTo(r);
			return;
		}
		if (r == null) r = nbi();
		var y = nbi(),
			ts = this.s,
			ms = m.s;
		var nsh = this.DB - nbits(pm[pm.t - 1]); // normalize modulus
		if (nsh > 0)
		{
			pm.lShiftTo(nsh, y);
			pt.lShiftTo(nsh, r);
		}
		else
		{
			pm.copyTo(y);
			pt.copyTo(r);
		}
		var ys = y.t;
		var y0 = y[ys - 1];
		if (y0 == 0) return;
		var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
		var d1 = this.FV / yt,
			d2 = (1 << this.F1) / yt,
			e = 1 << this.F2;
		var i = r.t,
			j = i - ys,
			t = (q == null) ? nbi() : q;
		y.dlShiftTo(j, t);
		if (r.compareTo(t) >= 0)
		{
			r[r.t++] = 1;
			r.subTo(t, r);
		}
		BigInteger.ONE.dlShiftTo(ys, t);
		t.subTo(y, y); // "negative" y so we can replace sub with am later
		while (y.t < ys) y[y.t++] = 0;
		while (--j >= 0)
		{
			// Estimate quotient digit
			var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
			if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd)
			{ // Try it out
				y.dlShiftTo(j, t);
				r.subTo(t, r);
				while (r[i] < --qd) r.subTo(t, r);
			}
		}
		if (q != null)
		{
			r.drShiftTo(ys, q);
			if (ts != ms) BigInteger.ZERO.subTo(q, q);
		}
		r.t = ys;
		r.clamp();
		if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
		if (ts < 0) BigInteger.ZERO.subTo(r, r);
	}
	// (public) this mod a
	function bnMod(a)
	{
		var r = nbi();
		this.abs().divRemTo(a, null, r);
		if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
		return r;
	}
	// Modular reduction using "classic" algorithm
	/**
	* @constructor
	*/
	function Classic(m)
	{
		this.m = m;
	}

	function cConvert(x)
	{
		if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
		else return x;
	}

	function cRevert(x)
	{
		return x;
	}

	function cReduce(x)
	{
		x.divRemTo(this.m, null, x);
	}

	function cMulTo(x, y, r)
	{
		x.multiplyTo(y, r);
		this.reduce(r);
	}

	function cSqrTo(x, r)
	{
		x.squareTo(r);
		this.reduce(r);
	}
	Classic.prototype.convert = cConvert;
	Classic.prototype.revert = cRevert;
	Classic.prototype.reduce = cReduce;
	Classic.prototype.mulTo = cMulTo;
	Classic.prototype.sqrTo = cSqrTo;
	// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
	// justification:
	//         xy == 1 (mod m)
	//         xy =  1+km
	//   xy(2-xy) = (1+km)(1-km)
	// x[y(2-xy)] = 1-k^2m^2
	// x[y(2-xy)] == 1 (mod m^2)
	// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
	// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
	// JS multiply "overflows" differently from C/C++, so care is needed here.
	function bnpInvDigit()
	{
		if (this.t < 1) return 0;
		var x = this[0];
		if ((x & 1) == 0) return 0;
		var y = x & 3; // y == 1/x mod 2^2
		y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
		y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
		y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
		// last step - calculate inverse mod DV directly;
		// assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
		y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
		// we really want the negative inverse, and -DV < y < DV
		return (y > 0) ? this.DV - y : -y;
	}
	// Montgomery reduction
	/**
	* @constructor
	*/
	function Montgomery(m)
	{
		this.m = m;
		this.mp = m.invDigit();
		this.mpl = this.mp & 0x7fff;
		this.mph = this.mp >> 15;
		this.um = (1 << (m.DB - 15)) - 1;
		this.mt2 = 2 * m.t;
	}
	// xR mod m
	function montConvert(x)
	{
		var r = nbi();
		x.abs().dlShiftTo(this.m.t, r);
		r.divRemTo(this.m, null, r);
		if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
		return r;
	}
	// x/R mod m
	function montRevert(x)
	{
		var r = nbi();
		x.copyTo(r);
		this.reduce(r);
		return r;
	}
	// x = x/R mod m (HAC 14.32)
	function montReduce(x)
	{
		while (x.t <= this.mt2) // pad x so am has enough room later
			x[x.t++] = 0;
		for (var i = 0; i < this.m.t; ++i)
		{
			// faster way of calculating u0 = x[i]*mp mod DV
			var j = x[i] & 0x7fff;
			var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
			// use am to combine the multiply-shift-add into one call
			j = i + this.m.t;
			x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
			// propagate carry
			while (x[j] >= x.DV)
			{
				x[j] -= x.DV;
				x[++j]++;
			}
		}
		x.clamp();
		x.drShiftTo(this.m.t, x);
		if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
	}
	// r = "x^2/R mod m"; x != r
	function montSqrTo(x, r)
	{
		x.squareTo(r);
		this.reduce(r);
	}
	// r = "xy/R mod m"; x,y != r
	function montMulTo(x, y, r)
	{
		x.multiplyTo(y, r);
		this.reduce(r);
	}
	Montgomery.prototype.convert = montConvert;
	Montgomery.prototype.revert = montRevert;
	Montgomery.prototype.reduce = montReduce;
	Montgomery.prototype.mulTo = montMulTo;
	Montgomery.prototype.sqrTo = montSqrTo;
	// (protected) true iff this is even
	function bnpIsEven()
	{
		return ((this.t > 0) ? (this[0] & 1) : this.s) == 0;
	}
	// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
	function bnpExp(e, z)
	{
		if (e > 0xffffffff || e < 1) return BigInteger.ONE;
		var r = nbi(),
			r2 = nbi(),
			g = z.convert(this),
			i = nbits(e) - 1;
		g.copyTo(r);
		while (--i >= 0)
		{
			z.sqrTo(r, r2);
			if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
			else
			{
				var t = r;
				r = r2;
				r2 = t;
			}
		}
		return z.revert(r);
	}
	// (public) this^e % m, 0 <= e < 2^32
	function bnModPowInt(e, m)
	{
		var z;
		if (e < 256 || m.isEven()) z = new Classic(m);
		else z = new Montgomery(m);
		return this.exp(e, z);
	}
	// protected
	BigInteger.prototype.copyTo = bnpCopyTo;
	BigInteger.prototype.fromInt = bnpFromInt;
	BigInteger.prototype.fromString = bnpFromString;
	BigInteger.prototype.clamp = bnpClamp;
	BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
	BigInteger.prototype.drShiftTo = bnpDRShiftTo;
	BigInteger.prototype.lShiftTo = bnpLShiftTo;
	BigInteger.prototype.rShiftTo = bnpRShiftTo;
	BigInteger.prototype.subTo = bnpSubTo;
	BigInteger.prototype.multiplyTo = bnpMultiplyTo;
	BigInteger.prototype.squareTo = bnpSquareTo;
	BigInteger.prototype.divRemTo = bnpDivRemTo;
	BigInteger.prototype.invDigit = bnpInvDigit;
	BigInteger.prototype.isEven = bnpIsEven;
	BigInteger.prototype.exp = bnpExp;
	// public
	BigInteger.prototype.toString = bnToString;
	BigInteger.prototype.negate = bnNegate;
	BigInteger.prototype.abs = bnAbs;
	BigInteger.prototype.compareTo = bnCompareTo;
	BigInteger.prototype.bitLength = bnBitLength;
	BigInteger.prototype.mod = bnMod;
	BigInteger.prototype.modPowInt = bnModPowInt;
	// "constants"
	BigInteger.ZERO = nbv(0);
	BigInteger.ONE = nbv(1);
	// Copyright (c) 2005-2009  Tom Wu
	// All Rights Reserved.
	// See "LICENSE" for details.
	// Extended JavaScript BN functions, required for RSA private ops.
	// Version 1.1: new BigInteger("0", 10) returns "proper" zero
	// Version 1.2: square() API, isProbablePrime fix
	// (public)
	function bnClone()
	{
		var r = nbi();
		this.copyTo(r);
		return r;
	}
	// (public) return value as integer
	function bnIntValue()
	{
		if (this.s < 0)
		{
			if (this.t == 1) return this[0] - this.DV;
			else if (this.t == 0) return -1;
		}
		else if (this.t == 1) return this[0];
		else if (this.t == 0) return 0;
		// assumes 16 < DB < 32
		return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
	}
	// (public) return value as byte
	function bnByteValue()
	{
		return (this.t == 0) ? this.s : (this[0] << 24) >> 24;
	}
	// (public) return value as short (assumes DB>=16)
	function bnShortValue()
	{
		return (this.t == 0) ? this.s : (this[0] << 16) >> 16;
	}
	// (protected) return x s.t. r^x < DV
	function bnpChunkSize(r)
	{
		return Math.floor(Math.LN2 * this.DB / Math.log(r));
	}
	// (public) 0 if this == 0, 1 if this > 0
	function bnSigNum()
	{
		if (this.s < 0) return -1;
		else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
		else return 1;
	}
	// (protected) convert to radix string
	function bnpToRadix(b)
	{
		if (b == null) b = 10;
		if (this.signum() == 0 || b < 2 || b > 36) return "0";
		var cs = this.chunkSize(b);
		var a = Math.pow(b, cs);
		var d = nbv(a),
			y = nbi(),
			z = nbi(),
			r = "";
		this.divRemTo(d, y, z);
		while (y.signum() > 0)
		{
			r = (a + z.intValue()).toString(b).substr(1) + r;
			y.divRemTo(d, y, z);
		}
		return z.intValue().toString(b) + r;
	}
	// (protected) convert from radix string
	function bnpFromRadix(s, b)
	{
		this.fromInt(0);
		if (b == null) b = 10;
		var cs = this.chunkSize(b);
		var d = Math.pow(b, cs),
			mi = false,
			j = 0,
			w = 0;
		for (var i = 0; i < s.length; ++i)
		{
			var x = intAt(s, i);
			if (x < 0)
			{
				if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
				continue;
			}
			w = b * w + x;
			if (++j >= cs)
			{
				this.dMultiply(d);
				this.dAddOffset(w, 0);
				j = 0;
				w = 0;
			}
		}
		if (j > 0)
		{
			this.dMultiply(Math.pow(b, j));
			this.dAddOffset(w, 0);
		}
		if (mi) BigInteger.ZERO.subTo(this, this);
	}
	// (protected) alternate constructor
	function bnpFromNumber(a, b, c)
	{
		if ("number" == typeof b)
		{
			// new BigInteger(int,int,RNG)
			if (a < 2) this.fromInt(1);
			else
			{
				this.fromNumber(a, c);
				if (!this.testBit(a - 1)) // force MSB set
					this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
				if (this.isEven()) this.dAddOffset(1, 0); // force odd
				while (!this.isProbablePrime(b))
				{
					this.dAddOffset(2, 0);
					if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
				}
			}
		}
		else
		{
			// new BigInteger(int,RNG)
			var x = new Array(),
				t = a & 7;
			x.length = (a >> 3) + 1;
			b.nextBytes(x);
			if (t > 0) x[0] &= ((1 << t) - 1);
			else x[0] = 0;
			this.fromString(x, 256);
		}
	}
	// (public) convert to bigendian byte array
	function bnToByteArray()
	{
		var i = this.t,
			r = new Array();
		r[0] = this.s;
		var p = this.DB - (i * this.DB) % 8,
			d, k = 0;
		if (i-- > 0)
		{
			if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
				r[k++] = d | (this.s << (this.DB - p));
			while (i >= 0)
			{
				if (p < 8)
				{
					d = (this[i] & ((1 << p) - 1)) << (8 - p);
					d |= this[--i] >> (p += this.DB - 8);
				}
				else
				{
					d = (this[i] >> (p -= 8)) & 0xff;
					if (p <= 0)
					{
						p += this.DB;
						--i;
					}
				}
				if ((d & 0x80) != 0) d |= -256;
				if (k == 0 && (this.s & 0x80) != (d & 0x80)) ++k;
				if (k > 0 || d != this.s) r[k++] = d;
			}
		}
		return r;
	}

	function bnEquals(a)
	{
		return (this.compareTo(a) == 0);
	}

	function bnMin(a)
	{
		return (this.compareTo(a) < 0) ? this : a;
	}

	function bnMax(a)
	{
		return (this.compareTo(a) > 0) ? this : a;
	}
	// (protected) r = this op a (bitwise)
	function bnpBitwiseTo(a, op, r)
	{
		var i, f, m = Math.min(a.t, this.t);
		for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
		if (a.t < this.t)
		{
			f = a.s & this.DM;
			for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
			r.t = this.t;
		}
		else
		{
			f = this.s & this.DM;
			for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
			r.t = a.t;
		}
		r.s = op(this.s, a.s);
		r.clamp();
	}
	// (public) this & a
	function op_and(x, y)
	{
		return x & y;
	}

	function bnAnd(a)
	{
		var r = nbi();
		this.bitwiseTo(a, op_and, r);
		return r;
	}
	// (public) this | a
	function op_or(x, y)
	{
		return x | y;
	}

	function bnOr(a)
	{
		var r = nbi();
		this.bitwiseTo(a, op_or, r);
		return r;
	}
	// (public) this ^ a
	function op_xor(x, y)
	{
		return x ^ y;
	}

	function bnXor(a)
	{
		var r = nbi();
		this.bitwiseTo(a, op_xor, r);
		return r;
	}
	// (public) this & ~a
	function op_andnot(x, y)
	{
		return x & ~y;
	}

	function bnAndNot(a)
	{
		var r = nbi();
		this.bitwiseTo(a, op_andnot, r);
		return r;
	}
	// (public) ~this
	function bnNot()
	{
		var r = nbi();
		for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
		r.t = this.t;
		r.s = ~this.s;
		return r;
	}
	// (public) this << n
	function bnShiftLeft(n)
	{
		var r = nbi();
		if (n < 0) this.rShiftTo(-n, r);
		else this.lShiftTo(n, r);
		return r;
	}
	// (public) this >> n
	function bnShiftRight(n)
	{
		var r = nbi();
		if (n < 0) this.lShiftTo(-n, r);
		else this.rShiftTo(n, r);
		return r;
	}
	// return index of lowest 1-bit in x, x < 2^31
	function lbit(x)
	{
		if (x == 0) return -1;
		var r = 0;
		if ((x & 0xffff) == 0)
		{
			x >>= 16;
			r += 16;
		}
		if ((x & 0xff) == 0)
		{
			x >>= 8;
			r += 8;
		}
		if ((x & 0xf) == 0)
		{
			x >>= 4;
			r += 4;
		}
		if ((x & 3) == 0)
		{
			x >>= 2;
			r += 2;
		}
		if ((x & 1) == 0) ++r;
		return r;
	}
	// (public) returns index of lowest 1-bit (or -1 if none)
	function bnGetLowestSetBit()
	{
		for (var i = 0; i < this.t; ++i)
			if (this[i] != 0) return i * this.DB + lbit(this[i]);
		if (this.s < 0) return this.t * this.DB;
		return -1;
	}
	// return number of 1 bits in x
	function cbit(x)
	{
		var r = 0;
		while (x != 0)
		{
			x &= x - 1;
			++r;
		}
		return r;
	}
	// (public) return number of set bits
	function bnBitCount()
	{
		var r = 0,
			x = this.s & this.DM;
		for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
		return r;
	}
	// (public) true iff nth bit is set
	function bnTestBit(n)
	{
		var j = Math.floor(n / this.DB);
		if (j >= this.t) return (this.s != 0);
		return ((this[j] & (1 << (n % this.DB))) != 0);
	}
	// (protected) this op (1<<n)
	function bnpChangeBit(n, op)
	{
		var r = BigInteger.ONE.shiftLeft(n);
		this.bitwiseTo(r, op, r);
		return r;
	}
	// (public) this | (1<<n)
	function bnSetBit(n)
	{
		return this.changeBit(n, op_or);
	}
	// (public) this & ~(1<<n)
	function bnClearBit(n)
	{
		return this.changeBit(n, op_andnot);
	}
	// (public) this ^ (1<<n)
	function bnFlipBit(n)
	{
		return this.changeBit(n, op_xor);
	}
	// (protected) r = this + a
	function bnpAddTo(a, r)
	{
		var i = 0,
			c = 0,
			m = Math.min(a.t, this.t);
		while (i < m)
		{
			c += this[i] + a[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		if (a.t < this.t)
		{
			c += a.s;
			while (i < this.t)
			{
				c += this[i];
				r[i++] = c & this.DM;
				c >>= this.DB;
			}
			c += this.s;
		}
		else
		{
			c += this.s;
			while (i < a.t)
			{
				c += a[i];
				r[i++] = c & this.DM;
				c >>= this.DB;
			}
			c += a.s;
		}
		r.s = (c < 0) ? -1 : 0;
		if (c > 0) r[i++] = c;
		else if (c < -1) r[i++] = this.DV + c;
		r.t = i;
		r.clamp();
	}
	// (public) this + a
	function bnAdd(a)
	{
		var r = nbi();
		this.addTo(a, r);
		return r;
	}
	// (public) this - a
	function bnSubtract(a)
	{
		var r = nbi();
		this.subTo(a, r);
		return r;
	}
	// (public) this * a
	function bnMultiply(a)
	{
		var r = nbi();
		this.multiplyTo(a, r);
		return r;
	}
	// (public) this^2
	function bnSquare()
	{
		var r = nbi();
		this.squareTo(r);
		return r;
	}
	// (public) this / a
	function bnDivide(a)
	{
		var r = nbi();
		this.divRemTo(a, r, null);
		return r;
	}
	// (public) this % a
	function bnRemainder(a)
	{
		var r = nbi();
		this.divRemTo(a, null, r);
		return r;
	}
	// (public) [this/a,this%a]
	function bnDivideAndRemainder(a)
	{
		var q = nbi(),
			r = nbi();
		this.divRemTo(a, q, r);
		return new Array(q, r);
	}
	// (protected) this *= n, this >= 0, 1 < n < DV
	function bnpDMultiply(n)
	{
		this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
		++this.t;
		this.clamp();
	}
	// (protected) this += n << w words, this >= 0
	function bnpDAddOffset(n, w)
	{
		if (n == 0) return;
		while (this.t <= w) this[this.t++] = 0;
		this[w] += n;
		while (this[w] >= this.DV)
		{
			this[w] -= this.DV;
			if (++w >= this.t) this[this.t++] = 0;
			++this[w];
		}
	}
	// A "null" reducer
	/**
	* @constructor
	*/
	function NullExp()
	{}

	function nNop(x)
	{
		return x;
	}

	function nMulTo(x, y, r)
	{
		x.multiplyTo(y, r);
	}

	function nSqrTo(x, r)
	{
		x.squareTo(r);
	}
	NullExp.prototype.convert = nNop;
	NullExp.prototype.revert = nNop;
	NullExp.prototype.mulTo = nMulTo;
	NullExp.prototype.sqrTo = nSqrTo;
	// (public) this^e
	function bnPow(e)
	{
		return this.exp(e, new NullExp());
	}
	// (protected) r = lower n words of "this * a", a.t <= n
	// "this" should be the larger one if appropriate.
	function bnpMultiplyLowerTo(a, n, r)
	{
		var i = Math.min(this.t + a.t, n);
		r.s = 0; // assumes a,this >= 0
		r.t = i;
		while (i > 0) r[--i] = 0;
		var j;
		for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
		for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
		r.clamp();
	}
	// (protected) r = "this * a" without lower n words, n > 0
	// "this" should be the larger one if appropriate.
	function bnpMultiplyUpperTo(a, n, r)
	{
		--n;
		var i = r.t = this.t + a.t - n;
		r.s = 0; // assumes a,this >= 0
		while (--i >= 0) r[i] = 0;
		for (i = Math.max(n - this.t, 0); i < a.t; ++i)
			r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
		r.clamp();
		r.drShiftTo(1, r);
	}
	// Barrett modular reduction
	/**
	* @constructor
	*/
	function Barrett(m)
	{
		// setup Barrett
		this.r2 = nbi();
		this.q3 = nbi();
		BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
		this.mu = this.r2.divide(m);
		this.m = m;
	}

	function barrettConvert(x)
	{
		if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
		else if (x.compareTo(this.m) < 0) return x;
		else
		{
			var r = nbi();
			x.copyTo(r);
			this.reduce(r);
			return r;
		}
	}

	function barrettRevert(x)
	{
		return x;
	}
	// x = x mod m (HAC 14.42)
	function barrettReduce(x)
	{
		x.drShiftTo(this.m.t - 1, this.r2);
		if (x.t > this.m.t + 1)
		{
			x.t = this.m.t + 1;
			x.clamp();
		}
		this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
		this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
		while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
		x.subTo(this.r2, x);
		while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
	}
	// r = x^2 mod m; x != r
	function barrettSqrTo(x, r)
	{
		x.squareTo(r);
		this.reduce(r);
	}
	// r = x*y mod m; x,y != r
	function barrettMulTo(x, y, r)
	{
		x.multiplyTo(y, r);
		this.reduce(r);
	}
	Barrett.prototype.convert = barrettConvert;
	Barrett.prototype.revert = barrettRevert;
	Barrett.prototype.reduce = barrettReduce;
	Barrett.prototype.mulTo = barrettMulTo;
	Barrett.prototype.sqrTo = barrettSqrTo;
	// (public) this^e % m (HAC 14.85)
	function bnModPow(e, m)
	{
		var i = e.bitLength(),
			k, r = nbv(1),
			z;
		if (i <= 0) return r;
		else if (i < 18) k = 1;
		else if (i < 48) k = 3;
		else if (i < 144) k = 4;
		else if (i < 768) k = 5;
		else k = 6;
		if (i < 8)
			z = new Classic(m);
		else if (m.isEven())
			z = new Barrett(m);
		else
			z = new Montgomery(m);
		// precomputation
		var g = new Array(),
			n = 3,
			k1 = k - 1,
			km = (1 << k) - 1;
		g[1] = z.convert(this);
		if (k > 1)
		{
			var g2 = nbi();
			z.sqrTo(g[1], g2);
			while (n <= km)
			{
				g[n] = nbi();
				z.mulTo(g2, g[n - 2], g[n]);
				n += 2;
			}
		}
		var j = e.t - 1,
			w, is1 = true,
			r2 = nbi(),
			t;
		i = nbits(e[j]) - 1;
		while (j >= 0)
		{
			if (i >= k1) w = (e[j] >> (i - k1)) & km;
			else
			{
				w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
				if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
			}
			n = k;
			while ((w & 1) == 0)
			{
				w >>= 1;
				--n;
			}
			if ((i -= n) < 0)
			{
				i += this.DB;
				--j;
			}
			if (is1)
			{ // ret == 1, don't bother squaring or multiplying it
				g[w].copyTo(r);
				is1 = false;
			}
			else
			{
				while (n > 1)
				{
					z.sqrTo(r, r2);
					z.sqrTo(r2, r);
					n -= 2;
				}
				if (n > 0) z.sqrTo(r, r2);
				else
				{
					t = r;
					r = r2;
					r2 = t;
				}
				z.mulTo(r2, g[w], r);
			}
			while (j >= 0 && (e[j] & (1 << i)) == 0)
			{
				z.sqrTo(r, r2);
				t = r;
				r = r2;
				r2 = t;
				if (--i < 0)
				{
					i = this.DB - 1;
					--j;
				}
			}
		}
		return z.revert(r);
	}
	// (public) gcd(this,a) (HAC 14.54)
	function bnGCD(a)
	{
		var x = (this.s < 0) ? this.negate() : this.clone();
		var y = (a.s < 0) ? a.negate() : a.clone();
		if (x.compareTo(y) < 0)
		{
			var t = x;
			x = y;
			y = t;
		}
		var i = x.getLowestSetBit(),
			g = y.getLowestSetBit();
		if (g < 0) return x;
		if (i < g) g = i;
		if (g > 0)
		{
			x.rShiftTo(g, x);
			y.rShiftTo(g, y);
		}
		while (x.signum() > 0)
		{
			if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
			if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
			if (x.compareTo(y) >= 0)
			{
				x.subTo(y, x);
				x.rShiftTo(1, x);
			}
			else
			{
				y.subTo(x, y);
				y.rShiftTo(1, y);
			}
		}
		if (g > 0) y.lShiftTo(g, y);
		return y;
	}
	// (protected) this % n, n < 2^26
	function bnpModInt(n)
	{
		if (n <= 0) return 0;
		var d = this.DV % n,
			r = (this.s < 0) ? n - 1 : 0;
		if (this.t > 0)
			if (d == 0) r = this[0] % n;
			else
				for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
		return r;
	}
	// (public) 1/this % m (HAC 14.61)
	function bnModInverse(m)
	{
		var ac = m.isEven();
		if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
		var u = m.clone(),
			v = this.clone();
		var a = nbv(1),
			b = nbv(0),
			c = nbv(0),
			d = nbv(1);
		while (u.signum() != 0)
		{
			while (u.isEven())
			{
				u.rShiftTo(1, u);
				if (ac)
				{
					if (!a.isEven() || !b.isEven())
					{
						a.addTo(this, a);
						b.subTo(m, b);
					}
					a.rShiftTo(1, a);
				}
				else if (!b.isEven()) b.subTo(m, b);
				b.rShiftTo(1, b);
			}
			while (v.isEven())
			{
				v.rShiftTo(1, v);
				if (ac)
				{
					if (!c.isEven() || !d.isEven())
					{
						c.addTo(this, c);
						d.subTo(m, d);
					}
					c.rShiftTo(1, c);
				}
				else if (!d.isEven()) d.subTo(m, d);
				d.rShiftTo(1, d);
			}
			if (u.compareTo(v) >= 0)
			{
				u.subTo(v, u);
				if (ac) a.subTo(c, a);
				b.subTo(d, b);
			}
			else
			{
				v.subTo(u, v);
				if (ac) c.subTo(a, c);
				d.subTo(b, d);
			}
		}
		if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
		if (d.compareTo(m) >= 0) return d.subtract(m);
		if (d.signum() < 0) d.addTo(m, d);
		else return d;
		if (d.signum() < 0) return d.add(m);
		else return d;
	}
	var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
	var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];
	// (public) test primality with certainty >= 1-.5^t
	function bnIsProbablePrime(t)
	{
		var i, x = this.abs();
		if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1])
		{
			for (i = 0; i < lowprimes.length; ++i)
				if (x[0] == lowprimes[i]) return true;
			return false;
		}
		if (x.isEven()) return false;
		i = 1;
		while (i < lowprimes.length)
		{
			var m = lowprimes[i],
				j = i + 1;
			while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
			m = x.modInt(m);
			while (i < j)
				if (m % lowprimes[i++] == 0) return false;
		}
		return x.millerRabin(t);
	}
	// (protected) true if probably prime (HAC 4.24, Miller-Rabin)
	function bnpMillerRabin(t)
	{
		var n1 = this.subtract(BigInteger.ONE);
		var k = n1.getLowestSetBit();
		if (k <= 0) return false;
		var r = n1.shiftRight(k);
		t = (t + 1) >> 1;
		if (t > lowprimes.length) t = lowprimes.length;
		var a = nbi();
		for (var i = 0; i < t; ++i)
		{
			//Pick bases at random, instead of starting at 2
			a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
			var y = a.modPow(r, this);
			if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0)
			{
				var j = 1;
				while (j++ < k && y.compareTo(n1) != 0)
				{
					y = y.modPowInt(2, this);
					if (y.compareTo(BigInteger.ONE) == 0) return false;
				}
				if (y.compareTo(n1) != 0) return false;
			}
		}
		return true;
	}
	// protected
	BigInteger.prototype.chunkSize = bnpChunkSize;
	BigInteger.prototype.toRadix = bnpToRadix;
	BigInteger.prototype.fromRadix = bnpFromRadix;
	BigInteger.prototype.fromNumber = bnpFromNumber;
	BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
	BigInteger.prototype.changeBit = bnpChangeBit;
	BigInteger.prototype.addTo = bnpAddTo;
	BigInteger.prototype.dMultiply = bnpDMultiply;
	BigInteger.prototype.dAddOffset = bnpDAddOffset;
	BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
	BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
	BigInteger.prototype.modInt = bnpModInt;
	BigInteger.prototype.millerRabin = bnpMillerRabin;
	// public
	BigInteger.prototype.clone = bnClone;
	BigInteger.prototype.intValue = bnIntValue;
	BigInteger.prototype.byteValue = bnByteValue;
	BigInteger.prototype.shortValue = bnShortValue;
	BigInteger.prototype.signum = bnSigNum;
	BigInteger.prototype.toByteArray = bnToByteArray;
	BigInteger.prototype.equals = bnEquals;
	BigInteger.prototype.min = bnMin;
	BigInteger.prototype.max = bnMax;
	BigInteger.prototype.and = bnAnd;
	BigInteger.prototype.or = bnOr;
	BigInteger.prototype.xor = bnXor;
	BigInteger.prototype.andNot = bnAndNot;
	BigInteger.prototype.not = bnNot;
	BigInteger.prototype.shiftLeft = bnShiftLeft;
	BigInteger.prototype.shiftRight = bnShiftRight;
	BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
	BigInteger.prototype.bitCount = bnBitCount;
	BigInteger.prototype.testBit = bnTestBit;
	BigInteger.prototype.setBit = bnSetBit;
	BigInteger.prototype.clearBit = bnClearBit;
	BigInteger.prototype.flipBit = bnFlipBit;
	BigInteger.prototype.add = bnAdd;
	BigInteger.prototype.subtract = bnSubtract;
	BigInteger.prototype.multiply = bnMultiply;
	BigInteger.prototype.divide = bnDivide;
	BigInteger.prototype.remainder = bnRemainder;
	BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
	BigInteger.prototype.modPow = bnModPow;
	BigInteger.prototype.modInverse = bnModInverse;
	BigInteger.prototype.pow = bnPow;
	BigInteger.prototype.gcd = bnGCD;
	BigInteger.prototype.isProbablePrime = bnIsProbablePrime;
	// JSBN-specific extension
	BigInteger.prototype.square = bnSquare;
	var Int128 = BigInteger;
	// BigInteger interfaces not implemented in jsbn:
	// BigInteger(int signum, byte[] magnitude)
	// double doubleValue()
	// float floatValue()
	// int hashCode()
	// long longValue()
	// static BigInteger valueOf(long val)
	// Helper functions to make BigInteger functions callable with two parameters
	// as in original C# Clipper
	Int128.prototype.IsNegative = function ()
	{
		if (this.compareTo(Int128.ZERO) == -1) return true;
		else return false;
	};

	Int128.op_Equality = function (val1, val2)
	{
		if (val1.compareTo(val2) == 0) return true;
		else return false;
	};

	Int128.op_Inequality = function (val1, val2)
	{
		if (val1.compareTo(val2) != 0) return true;
		else return false;
	};

	Int128.op_GreaterThan = function (val1, val2)
	{
		if (val1.compareTo(val2) > 0) return true;
		else return false;
	};

	Int128.op_LessThan = function (val1, val2)
	{
		if (val1.compareTo(val2) < 0) return true;
		else return false;
	};

	Int128.op_Addition = function (lhs, rhs)
	{
		return new Int128(lhs, undefined, undefined).add(new Int128(rhs, undefined, undefined));
	};

	Int128.op_Subtraction = function (lhs, rhs)
	{
		return new Int128(lhs, undefined, undefined).subtract(new Int128(rhs, undefined, undefined));
	};

	Int128.Int128Mul = function (lhs, rhs)
	{
		return new Int128(lhs, undefined, undefined).multiply(new Int128(rhs, undefined, undefined));
	};

	Int128.op_Division = function (lhs, rhs)
	{
		return lhs.divide(rhs);
	};

	Int128.prototype.ToDouble = function ()
	{
		return parseFloat(this.toString()); // This could be something faster
	};

	// end of Int128 section
	/*
	// Uncomment the following two lines if you want to use Int128 outside ClipperLib
	if (typeof(document) !== "undefined") window.Int128 = Int128;
	else self.Int128 = Int128;
	*/

	// ---------------------------------------------

	// Here starts the actual Clipper library:
	// Helper function to support Inheritance in Javascript
	var Inherit = function (ce, ce2)
	{
		var p;
		if (typeof (Object.getOwnPropertyNames) === 'undefined')
		{
			for (p in ce2.prototype)
				if (typeof (ce.prototype[p]) === 'undefined' || ce.prototype[p] === Object.prototype[p]) ce.prototype[p] = ce2.prototype[p];
			for (p in ce2)
				if (typeof (ce[p]) === 'undefined') ce[p] = ce2[p];
			ce.$baseCtor = ce2;
		}
		else
		{
			var props = Object.getOwnPropertyNames(ce2.prototype);
			for (var i = 0; i < props.length; i++)
				if (typeof (Object.getOwnPropertyDescriptor(ce.prototype, props[i])) === 'undefined') Object.defineProperty(ce.prototype, props[i], Object.getOwnPropertyDescriptor(ce2.prototype, props[i]));
			for (p in ce2)
				if (typeof (ce[p]) === 'undefined') ce[p] = ce2[p];
			ce.$baseCtor = ce2;
		}
	};

	/**
	* @constructor
	*/
	ClipperLib.Path = function ()
	{
		return [];
	};

	ClipperLib.Path.prototype.push = Array.prototype.push;

	/**
	* @constructor
	*/
	ClipperLib.Paths = function ()
	{
		return []; // Was previously [[]], but caused problems when pushed
	};

	ClipperLib.Paths.prototype.push = Array.prototype.push;

	// Preserves the calling way of original C# Clipper
	// Is essential due to compatibility, because DoublePoint is public class in original C# version
	/**
	* @constructor
	*/
	ClipperLib.DoublePoint = function ()
	{
		var a = arguments;
		this.X = 0;
		this.Y = 0;
		// public DoublePoint(DoublePoint dp)
		// public DoublePoint(IntPoint ip)
		if (a.length === 1)
		{
			this.X = a[0].X;
			this.Y = a[0].Y;
		}
		else if (a.length === 2)
		{
			this.X = a[0];
			this.Y = a[1];
		}
	}; // This is internal faster function when called without arguments
	/**
	* @constructor
	*/
	ClipperLib.DoublePoint0 = function ()
	{
		this.X = 0;
		this.Y = 0;
	};

	ClipperLib.DoublePoint0.prototype = ClipperLib.DoublePoint.prototype;

	// This is internal faster function when called with 1 argument (dp or ip)
	/**
	* @constructor
	*/
	ClipperLib.DoublePoint1 = function (dp)
	{
		this.X = dp.X;
		this.Y = dp.Y;
	};

	ClipperLib.DoublePoint1.prototype = ClipperLib.DoublePoint.prototype;

	// This is internal faster function when called with 2 arguments (x and y)
	/**
	* @constructor
	*/
	ClipperLib.DoublePoint2 = function (x, y)
	{
		this.X = x;
		this.Y = y;
	};

	ClipperLib.DoublePoint2.prototype = ClipperLib.DoublePoint.prototype;

	// PolyTree & PolyNode start
	/**
	* @suppress {missingProperties}
	*/
	ClipperLib.PolyNode = function ()
	{
		this.m_Parent = null;
		this.m_polygon = new ClipperLib.Path();
		this.m_Index = 0;
		this.m_jointype = 0;
		this.m_endtype = 0;
		this.m_Childs = [];
		this.IsOpen = false;
	};

	ClipperLib.PolyNode.prototype.IsHoleNode = function ()
	{
		var result = true;
		var node = this.m_Parent;
		while (node !== null)
		{
			result = !result;
			node = node.m_Parent;
		}
		return result;
	};

	ClipperLib.PolyNode.prototype.ChildCount = function ()
	{
		return this.m_Childs.length;
	};

	ClipperLib.PolyNode.prototype.Contour = function ()
	{
		return this.m_polygon;
	};

	ClipperLib.PolyNode.prototype.AddChild = function (Child)
	{
		var cnt = this.m_Childs.length;
		this.m_Childs.push(Child);
		Child.m_Parent = this;
		Child.m_Index = cnt;
	};

	ClipperLib.PolyNode.prototype.GetNext = function ()
	{
		if (this.m_Childs.length > 0)
			return this.m_Childs[0];
		else
			return this.GetNextSiblingUp();
	};

	ClipperLib.PolyNode.prototype.GetNextSiblingUp = function ()
	{
		if (this.m_Parent === null)
			return null;
		else if (this.m_Index === this.m_Parent.m_Childs.length - 1)
			return this.m_Parent.GetNextSiblingUp();
		else
			return this.m_Parent.m_Childs[this.m_Index + 1];
	};

	ClipperLib.PolyNode.prototype.Childs = function ()
	{
		return this.m_Childs;
	};

	ClipperLib.PolyNode.prototype.Parent = function ()
	{
		return this.m_Parent;
	};

	ClipperLib.PolyNode.prototype.IsHole = function ()
	{
		return this.IsHoleNode();
	};

	// PolyTree : PolyNode
	/**
	 * @suppress {missingProperties}
	 * @constructor
	 */
	ClipperLib.PolyTree = function ()
	{
		this.m_AllPolys = [];
		ClipperLib.PolyNode.call(this);
	};

	ClipperLib.PolyTree.prototype.Clear = function ()
	{
		for (var i = 0, ilen = this.m_AllPolys.length; i < ilen; i++)
			this.m_AllPolys[i] = null;
		this.m_AllPolys.length = 0;
		this.m_Childs.length = 0;
	};

	ClipperLib.PolyTree.prototype.GetFirst = function ()
	{
		if (this.m_Childs.length > 0)
			return this.m_Childs[0];
		else
			return null;
	};

	ClipperLib.PolyTree.prototype.Total = function ()
	{
		var result = this.m_AllPolys.length;
		//with negative offsets, ignore the hidden outer polygon ...
		if (result > 0 && this.m_Childs[0] !== this.m_AllPolys[0]) result--;
		return result;
	};

	Inherit(ClipperLib.PolyTree, ClipperLib.PolyNode);

	// PolyTree & PolyNode end

	ClipperLib.Math_Abs_Int64 = ClipperLib.Math_Abs_Int32 = ClipperLib.Math_Abs_Double = function (a)
	{
		return Math.abs(a);
	};

	ClipperLib.Math_Max_Int32_Int32 = function (a, b)
	{
		return Math.max(a, b);
	};

	/*
	-----------------------------------
	cast_32 speedtest: http://jsperf.com/truncate-float-to-integer/2
	-----------------------------------
	*/
	if (browser.msie || browser.opera || browser.safari) ClipperLib.Cast_Int32 = function (a)
	{
		return a | 0;
	};

	else ClipperLib.Cast_Int32 = function (a)
	{ // eg. browser.chrome || browser.chromium || browser.firefox
		return ~~a;
	};

	/*
	--------------------------
	cast_64 speedtests: http://jsperf.com/truncate-float-to-integer
	Chrome: bitwise_not_floor
	Firefox17: toInteger (typeof test)
	IE9: bitwise_or_floor
	IE7 and IE8: to_parseint
	Chromium: to_floor_or_ceil
	Firefox3: to_floor_or_ceil
	Firefox15: to_floor_or_ceil
	Opera: to_floor_or_ceil
	Safari: to_floor_or_ceil
	--------------------------
	*/
	if (typeof Number.toInteger === "undefined")
		Number.toInteger = null;

	if (browser.chrome) ClipperLib.Cast_Int64 = function (a)
	{
		if (a < -2147483648 || a > 2147483647)
			return a < 0 ? Math.ceil(a) : Math.floor(a);
		else return ~~a;
	};

	else if (browser.firefox && typeof (Number.toInteger) === "function") ClipperLib.Cast_Int64 = function (a)
	{
		return Number.toInteger(a);
	};

	else if (browser.msie7 || browser.msie8) ClipperLib.Cast_Int64 = function (a)
	{
		return parseInt(a, 10);
	};

	else if (browser.msie) ClipperLib.Cast_Int64 = function (a)
	{
		if (a < -2147483648 || a > 2147483647)
			return a < 0 ? Math.ceil(a) : Math.floor(a);
		return a | 0;
	};

	// eg. browser.chromium || browser.firefox || browser.opera || browser.safari
	else ClipperLib.Cast_Int64 = function (a)
	{
		return a < 0 ? Math.ceil(a) : Math.floor(a);
	};

	ClipperLib.Clear = function (a)
	{
		a.length = 0;
	};

	//ClipperLib.MaxSteps = 64; // How many steps at maximum in arc in BuildArc() function
	ClipperLib.PI = 3.141592653589793;
	ClipperLib.PI2 = 2 * 3.141592653589793;
	/**
	* @constructor
	*/
	ClipperLib.IntPoint = function ()
	{
		var a = arguments,
			alen = a.length;
		this.X = 0;
		this.Y = 0;
		if (ClipperLib.use_xyz)
		{
			this.Z = 0;
			if (alen === 3) // public IntPoint(cInt x, cInt y, cInt z = 0)
			{
				this.X = a[0];
				this.Y = a[1];
				this.Z = a[2];
			}
			else if (alen === 2) // public IntPoint(cInt x, cInt y)
			{
				this.X = a[0];
				this.Y = a[1];
				this.Z = 0;
			}
			else if (alen === 1)
			{
				if (a[0] instanceof ClipperLib.DoublePoint) // public IntPoint(DoublePoint dp)
				{
					var dp = a[0];
					this.X = ClipperLib.Clipper.Round(dp.X);
					this.Y = ClipperLib.Clipper.Round(dp.Y);
					this.Z = 0;
				}
				else // public IntPoint(IntPoint pt)
				{
					var pt = a[0];
					if (typeof (pt.Z) === "undefined") pt.Z = 0;
					this.X = pt.X;
					this.Y = pt.Y;
					this.Z = pt.Z;
				}
			}
			else // public IntPoint()
			{
				this.X = 0;
				this.Y = 0;
				this.Z = 0;
			}
		}
		else // if (!ClipperLib.use_xyz)
		{
			if (alen === 2) // public IntPoint(cInt X, cInt Y)
			{
				this.X = a[0];
				this.Y = a[1];
			}
			else if (alen === 1)
			{
				if (a[0] instanceof ClipperLib.DoublePoint) // public IntPoint(DoublePoint dp)
				{
					var dp = a[0];
					this.X = ClipperLib.Clipper.Round(dp.X);
					this.Y = ClipperLib.Clipper.Round(dp.Y);
				}
				else // public IntPoint(IntPoint pt)
				{
					var pt = a[0];
					this.X = pt.X;
					this.Y = pt.Y;
				}
			}
			else // public IntPoint(IntPoint pt)
			{
				this.X = 0;
				this.Y = 0;
			}
		}
	};

	ClipperLib.IntPoint.op_Equality = function (a, b)
	{
		//return a == b;
		return a.X === b.X && a.Y === b.Y;
	};

	ClipperLib.IntPoint.op_Inequality = function (a, b)
	{
		//return a !== b;
		return a.X !== b.X || a.Y !== b.Y;
	};

	/*
  ClipperLib.IntPoint.prototype.Equals = function (obj)
  {
    if (obj === null)
        return false;
    if (obj instanceof ClipperLib.IntPoint)
    {
        var a = Cast(obj, ClipperLib.IntPoint);
        return (this.X == a.X) && (this.Y == a.Y);
    }
    else
        return false;
  };

	*/

	/**
	* @constructor
	*/
	ClipperLib.IntPoint0 = function ()
	{
		this.X = 0;
		this.Y = 0;
		if (ClipperLib.use_xyz)
			this.Z = 0;
	};

	ClipperLib.IntPoint0.prototype = ClipperLib.IntPoint.prototype;

	/**
	* @constructor
	*/
	ClipperLib.IntPoint1 = function (pt)
	{
		this.X = pt.X;
		this.Y = pt.Y;
		if (ClipperLib.use_xyz)
		{
			if (typeof pt.Z === "undefined") this.Z = 0;
			else this.Z = pt.Z;
		}
	};

	ClipperLib.IntPoint1.prototype = ClipperLib.IntPoint.prototype;

	/**
	* @constructor
	*/
	ClipperLib.IntPoint1dp = function (dp)
	{
		this.X = ClipperLib.Clipper.Round(dp.X);
		this.Y = ClipperLib.Clipper.Round(dp.Y);
		if (ClipperLib.use_xyz)
			this.Z = 0;
	};

	ClipperLib.IntPoint1dp.prototype = ClipperLib.IntPoint.prototype;

	/**
	* @constructor
	*/
	ClipperLib.IntPoint2 = function (x, y, z)
	{
		this.X = x;
		this.Y = y;
		if (ClipperLib.use_xyz)
		{
			if (typeof z === "undefined") this.Z = 0;
			else this.Z = z;
		}
	};

	ClipperLib.IntPoint2.prototype = ClipperLib.IntPoint.prototype;

	/**
	* @constructor
	*/
	ClipperLib.IntRect = function ()
	{
		var a = arguments,
			alen = a.length;
		if (alen === 4) // function (l, t, r, b)
		{
			this.left = a[0];
			this.top = a[1];
			this.right = a[2];
			this.bottom = a[3];
		}
		else if (alen === 1) // function (ir)
		{
			var ir = a[0];
			this.left = ir.left;
			this.top = ir.top;
			this.right = ir.right;
			this.bottom = ir.bottom;
		}
		else // function ()
		{
			this.left = 0;
			this.top = 0;
			this.right = 0;
			this.bottom = 0;
		}
	};

	/**
	* @constructor
	*/
	ClipperLib.IntRect0 = function ()
	{
		this.left = 0;
		this.top = 0;
		this.right = 0;
		this.bottom = 0;
	};

	ClipperLib.IntRect0.prototype = ClipperLib.IntRect.prototype;

	/**
	* @constructor
	*/
	ClipperLib.IntRect1 = function (ir)
	{
		this.left = ir.left;
		this.top = ir.top;
		this.right = ir.right;
		this.bottom = ir.bottom;
	};

	ClipperLib.IntRect1.prototype = ClipperLib.IntRect.prototype;

	/**
	* @constructor
	*/
	ClipperLib.IntRect4 = function (l, t, r, b)
	{
		this.left = l;
		this.top = t;
		this.right = r;
		this.bottom = b;
	};

	ClipperLib.IntRect4.prototype = ClipperLib.IntRect.prototype;

	ClipperLib.ClipType = {
		ctIntersection: 0,
		ctUnion: 1,
		ctDifference: 2,
		ctXor: 3
	};

	ClipperLib.PolyType = {
		ptSubject: 0,
		ptClip: 1
	};

	ClipperLib.PolyFillType = {
		pftEvenOdd: 0,
		pftNonZero: 1,
		pftPositive: 2,
		pftNegative: 3
	};

	ClipperLib.JoinType = {
		jtSquare: 0,
		jtRound: 1,
		jtMiter: 2
	};

	ClipperLib.EndType = {
		etOpenSquare: 0,
		etOpenRound: 1,
		etOpenButt: 2,
		etClosedLine: 3,
		etClosedPolygon: 4
	};

	ClipperLib.EdgeSide = {
		esLeft: 0,
		esRight: 1
	};

	ClipperLib.Direction = {
		dRightToLeft: 0,
		dLeftToRight: 1
	};

	/**
	* @constructor
	*/
	ClipperLib.TEdge = function ()
	{
		this.Bot = new ClipperLib.IntPoint0();
		this.Curr = new ClipperLib.IntPoint0(); //current (updated for every new scanbeam)
		this.Top = new ClipperLib.IntPoint0();
		this.Delta = new ClipperLib.IntPoint0();
		this.Dx = 0;
		this.PolyTyp = ClipperLib.PolyType.ptSubject;
		this.Side = ClipperLib.EdgeSide.esLeft; //side only refers to current side of solution poly
		this.WindDelta = 0; //1 or -1 depending on winding direction
		this.WindCnt = 0;
		this.WindCnt2 = 0; //winding count of the opposite polytype
		this.OutIdx = 0;
		this.Next = null;
		this.Prev = null;
		this.NextInLML = null;
		this.NextInAEL = null;
		this.PrevInAEL = null;
		this.NextInSEL = null;
		this.PrevInSEL = null;
	};

	/**
	* @constructor
	*/
	ClipperLib.IntersectNode = function ()
	{
		this.Edge1 = null;
		this.Edge2 = null;
		this.Pt = new ClipperLib.IntPoint0();
	};

	ClipperLib.MyIntersectNodeSort = function () {};

	ClipperLib.MyIntersectNodeSort.Compare = function (node1, node2)
	{
		var i = node2.Pt.Y - node1.Pt.Y;
		if (i > 0) return 1;
		else if (i < 0) return -1;
		else return 0;
	};

	/**
	* @constructor
	*/
	ClipperLib.LocalMinima = function ()
	{
		this.Y = 0;
		this.LeftBound = null;
		this.RightBound = null;
		this.Next = null;
	};

	/**
	* @constructor
	*/
	ClipperLib.Scanbeam = function ()
	{
		this.Y = 0;
		this.Next = null;
	};

	/**
	* @constructor
	*/
	ClipperLib.Maxima = function ()
	{
		this.X = 0;
		this.Next = null;
		this.Prev = null;
	};

	//OutRec: contains a path in the clipping solution. Edges in the AEL will
	//carry a pointer to an OutRec when they are part of the clipping solution.
	/**
	* @constructor
	*/
	ClipperLib.OutRec = function ()
	{
		this.Idx = 0;
		this.IsHole = false;
		this.IsOpen = false;
		this.FirstLeft = null; //see comments in clipper.pas
		this.Pts = null;
		this.BottomPt = null;
		this.PolyNode = null;
	};

	/**
	* @constructor
	*/
	ClipperLib.OutPt = function ()
	{
		this.Idx = 0;
		this.Pt = new ClipperLib.IntPoint0();
		this.Next = null;
		this.Prev = null;
	};

	/**
	* @constructor
	*/
	ClipperLib.Join = function ()
	{
		this.OutPt1 = null;
		this.OutPt2 = null;
		this.OffPt = new ClipperLib.IntPoint0();
	};

	ClipperLib.ClipperBase = function ()
	{
		this.m_MinimaList = null;
		this.m_CurrentLM = null;
		this.m_edges = new Array();
		this.m_UseFullRange = false;
		this.m_HasOpenPaths = false;
		this.PreserveCollinear = false;
		this.m_Scanbeam = null;
		this.m_PolyOuts = null;
		this.m_ActiveEdges = null;
	};

	// Ranges are in original C# too high for Javascript (in current state 2013 september):
	// protected const double horizontal = -3.4E+38;
	// internal const cInt loRange = 0x3FFFFFFF; // = 1073741823 = sqrt(2^63 -1)/2
	// internal const cInt hiRange = 0x3FFFFFFFFFFFFFFFL; // = 4611686018427387903 = sqrt(2^127 -1)/2
	// So had to adjust them to more suitable for Javascript.
	// If JS some day supports truly 64-bit integers, then these ranges can be as in C#
	// and biginteger library can be more simpler (as then 128bit can be represented as two 64bit numbers)
	ClipperLib.ClipperBase.horizontal = -9007199254740992; //-2^53
	ClipperLib.ClipperBase.Skip = -2;
	ClipperLib.ClipperBase.Unassigned = -1;
	ClipperLib.ClipperBase.tolerance = 1E-20;
	ClipperLib.ClipperBase.loRange = 47453132; // sqrt(2^53 -1)/2
	ClipperLib.ClipperBase.hiRange = 4503599627370495; // sqrt(2^106 -1)/2

	ClipperLib.ClipperBase.near_zero = function (val)
	{
		return (val > -ClipperLib.ClipperBase.tolerance) && (val < ClipperLib.ClipperBase.tolerance);
	};

	ClipperLib.ClipperBase.IsHorizontal = function (e)
	{
		return e.Delta.Y === 0;
	};

	ClipperLib.ClipperBase.prototype.PointIsVertex = function (pt, pp)
	{
		var pp2 = pp;
		do {
			if (ClipperLib.IntPoint.op_Equality(pp2.Pt, pt))
				return true;
			pp2 = pp2.Next;
		}
		while (pp2 !== pp)
		return false;
	};

	ClipperLib.ClipperBase.prototype.PointOnLineSegment = function (pt, linePt1, linePt2, UseFullRange)
	{
		if (UseFullRange)
			return ((pt.X === linePt1.X) && (pt.Y === linePt1.Y)) ||
				((pt.X === linePt2.X) && (pt.Y === linePt2.Y)) ||
				(((pt.X > linePt1.X) === (pt.X < linePt2.X)) &&
					((pt.Y > linePt1.Y) === (pt.Y < linePt2.Y)) &&
					(Int128.op_Equality(Int128.Int128Mul((pt.X - linePt1.X), (linePt2.Y - linePt1.Y)),
						Int128.Int128Mul((linePt2.X - linePt1.X), (pt.Y - linePt1.Y)))));
		else
			return ((pt.X === linePt1.X) && (pt.Y === linePt1.Y)) || ((pt.X === linePt2.X) && (pt.Y === linePt2.Y)) || (((pt.X > linePt1.X) === (pt.X < linePt2.X)) && ((pt.Y > linePt1.Y) === (pt.Y < linePt2.Y)) && ((pt.X - linePt1.X) * (linePt2.Y - linePt1.Y) === (linePt2.X - linePt1.X) * (pt.Y - linePt1.Y)));
	};

	ClipperLib.ClipperBase.prototype.PointOnPolygon = function (pt, pp, UseFullRange)
	{
		var pp2 = pp;
		while (true)
		{
			if (this.PointOnLineSegment(pt, pp2.Pt, pp2.Next.Pt, UseFullRange))
				return true;
			pp2 = pp2.Next;
			if (pp2 === pp)
				break;
		}
		return false;
	};

	ClipperLib.ClipperBase.prototype.SlopesEqual = ClipperLib.ClipperBase.SlopesEqual = function ()
	{
		var a = arguments,
			alen = a.length;
		var e1, e2, pt1, pt2, pt3, pt4, UseFullRange;
		if (alen === 3) // function (e1, e2, UseFullRange)
		{
			e1 = a[0];
			e2 = a[1];
			UseFullRange = a[2];
			if (UseFullRange)
				return Int128.op_Equality(Int128.Int128Mul(e1.Delta.Y, e2.Delta.X), Int128.Int128Mul(e1.Delta.X, e2.Delta.Y));
			else
				return ClipperLib.Cast_Int64((e1.Delta.Y) * (e2.Delta.X)) === ClipperLib.Cast_Int64((e1.Delta.X) * (e2.Delta.Y));
		}
		else if (alen === 4) // function (pt1, pt2, pt3, UseFullRange)
		{
			pt1 = a[0];
			pt2 = a[1];
			pt3 = a[2];
			UseFullRange = a[3];
			if (UseFullRange)
				return Int128.op_Equality(Int128.Int128Mul(pt1.Y - pt2.Y, pt2.X - pt3.X), Int128.Int128Mul(pt1.X - pt2.X, pt2.Y - pt3.Y));
			else
				return ClipperLib.Cast_Int64((pt1.Y - pt2.Y) * (pt2.X - pt3.X)) - ClipperLib.Cast_Int64((pt1.X - pt2.X) * (pt2.Y - pt3.Y)) === 0;
		}
		else // function (pt1, pt2, pt3, pt4, UseFullRange)
		{
			pt1 = a[0];
			pt2 = a[1];
			pt3 = a[2];
			pt4 = a[3];
			UseFullRange = a[4];
			if (UseFullRange)
				return Int128.op_Equality(Int128.Int128Mul(pt1.Y - pt2.Y, pt3.X - pt4.X), Int128.Int128Mul(pt1.X - pt2.X, pt3.Y - pt4.Y));
			else
				return ClipperLib.Cast_Int64((pt1.Y - pt2.Y) * (pt3.X - pt4.X)) - ClipperLib.Cast_Int64((pt1.X - pt2.X) * (pt3.Y - pt4.Y)) === 0;
		}
	};

	ClipperLib.ClipperBase.SlopesEqual3 = function (e1, e2, UseFullRange)
	{
		if (UseFullRange)
			return Int128.op_Equality(Int128.Int128Mul(e1.Delta.Y, e2.Delta.X), Int128.Int128Mul(e1.Delta.X, e2.Delta.Y));
		else
			return ClipperLib.Cast_Int64((e1.Delta.Y) * (e2.Delta.X)) === ClipperLib.Cast_Int64((e1.Delta.X) * (e2.Delta.Y));
	};

	ClipperLib.ClipperBase.SlopesEqual4 = function (pt1, pt2, pt3, UseFullRange)
	{
		if (UseFullRange)
			return Int128.op_Equality(Int128.Int128Mul(pt1.Y - pt2.Y, pt2.X - pt3.X), Int128.Int128Mul(pt1.X - pt2.X, pt2.Y - pt3.Y));
		else
			return ClipperLib.Cast_Int64((pt1.Y - pt2.Y) * (pt2.X - pt3.X)) - ClipperLib.Cast_Int64((pt1.X - pt2.X) * (pt2.Y - pt3.Y)) === 0;
	};

	ClipperLib.ClipperBase.SlopesEqual5 = function (pt1, pt2, pt3, pt4, UseFullRange)
	{
		if (UseFullRange)
			return Int128.op_Equality(Int128.Int128Mul(pt1.Y - pt2.Y, pt3.X - pt4.X), Int128.Int128Mul(pt1.X - pt2.X, pt3.Y - pt4.Y));
		else
			return ClipperLib.Cast_Int64((pt1.Y - pt2.Y) * (pt3.X - pt4.X)) - ClipperLib.Cast_Int64((pt1.X - pt2.X) * (pt3.Y - pt4.Y)) === 0;
	};

	ClipperLib.ClipperBase.prototype.Clear = function ()
	{
		this.DisposeLocalMinimaList();
		for (var i = 0, ilen = this.m_edges.length; i < ilen; ++i)
		{
			for (var j = 0, jlen = this.m_edges[i].length; j < jlen; ++j)
				this.m_edges[i][j] = null;
			ClipperLib.Clear(this.m_edges[i]);
		}
		ClipperLib.Clear(this.m_edges);
		this.m_UseFullRange = false;
		this.m_HasOpenPaths = false;
	};

	ClipperLib.ClipperBase.prototype.DisposeLocalMinimaList = function ()
	{
		while (this.m_MinimaList !== null)
		{
			var tmpLm = this.m_MinimaList.Next;
			this.m_MinimaList = null;
			this.m_MinimaList = tmpLm;
		}
		this.m_CurrentLM = null;
	};

	ClipperLib.ClipperBase.prototype.RangeTest = function (Pt, useFullRange)
	{
		if (useFullRange.Value)
		{
			if (Pt.X > ClipperLib.ClipperBase.hiRange || Pt.Y > ClipperLib.ClipperBase.hiRange || -Pt.X > ClipperLib.ClipperBase.hiRange || -Pt.Y > ClipperLib.ClipperBase.hiRange)
				ClipperLib.Error("Coordinate outside allowed range in RangeTest().");
		}
		else if (Pt.X > ClipperLib.ClipperBase.loRange || Pt.Y > ClipperLib.ClipperBase.loRange || -Pt.X > ClipperLib.ClipperBase.loRange || -Pt.Y > ClipperLib.ClipperBase.loRange)
		{
			useFullRange.Value = true;
			this.RangeTest(Pt, useFullRange);
		}
	};

	ClipperLib.ClipperBase.prototype.InitEdge = function (e, eNext, ePrev, pt)
	{
		e.Next = eNext;
		e.Prev = ePrev;
		//e.Curr = pt;
		e.Curr.X = pt.X;
		e.Curr.Y = pt.Y;
		if (ClipperLib.use_xyz) e.Curr.Z = pt.Z;
		e.OutIdx = -1;
	};

	ClipperLib.ClipperBase.prototype.InitEdge2 = function (e, polyType)
	{
		if (e.Curr.Y >= e.Next.Curr.Y)
		{
			//e.Bot = e.Curr;
			e.Bot.X = e.Curr.X;
			e.Bot.Y = e.Curr.Y;
			if (ClipperLib.use_xyz) e.Bot.Z = e.Curr.Z;
			//e.Top = e.Next.Curr;
			e.Top.X = e.Next.Curr.X;
			e.Top.Y = e.Next.Curr.Y;
			if (ClipperLib.use_xyz) e.Top.Z = e.Next.Curr.Z;
		}
		else
		{
			//e.Top = e.Curr;
			e.Top.X = e.Curr.X;
			e.Top.Y = e.Curr.Y;
			if (ClipperLib.use_xyz) e.Top.Z = e.Curr.Z;
			//e.Bot = e.Next.Curr;
			e.Bot.X = e.Next.Curr.X;
			e.Bot.Y = e.Next.Curr.Y;
			if (ClipperLib.use_xyz) e.Bot.Z = e.Next.Curr.Z;
		}
		this.SetDx(e);
		e.PolyTyp = polyType;
	};

	ClipperLib.ClipperBase.prototype.FindNextLocMin = function (E)
	{
		var E2;
		for (;;)
		{
			while (ClipperLib.IntPoint.op_Inequality(E.Bot, E.Prev.Bot) || ClipperLib.IntPoint.op_Equality(E.Curr, E.Top))
				E = E.Next;
			if (E.Dx !== ClipperLib.ClipperBase.horizontal && E.Prev.Dx !== ClipperLib.ClipperBase.horizontal)
				break;
			while (E.Prev.Dx === ClipperLib.ClipperBase.horizontal)
				E = E.Prev;
			E2 = E;
			while (E.Dx === ClipperLib.ClipperBase.horizontal)
				E = E.Next;
			if (E.Top.Y === E.Prev.Bot.Y)
				continue;
			//ie just an intermediate horz.
			if (E2.Prev.Bot.X < E.Bot.X)
				E = E2;
			break;
		}
		return E;
	};

	ClipperLib.ClipperBase.prototype.ProcessBound = function (E, LeftBoundIsForward)
	{
		var EStart;
		var Result = E;
		var Horz;

		if (Result.OutIdx === ClipperLib.ClipperBase.Skip)
		{
			//check if there are edges beyond the skip edge in the bound and if so
			//create another LocMin and calling ProcessBound once more ...
			E = Result;
			if (LeftBoundIsForward)
			{
				while (E.Top.Y === E.Next.Bot.Y) E = E.Next;
				while (E !== Result && E.Dx === ClipperLib.ClipperBase.horizontal) E = E.Prev;
			}
			else
			{
				while (E.Top.Y === E.Prev.Bot.Y) E = E.Prev;
				while (E !== Result && E.Dx === ClipperLib.ClipperBase.horizontal) E = E.Next;
			}
			if (E === Result)
			{
				if (LeftBoundIsForward) Result = E.Next;
				else Result = E.Prev;
			}
			else
			{
				//there are more edges in the bound beyond result starting with E
				if (LeftBoundIsForward)
					E = Result.Next;
				else
					E = Result.Prev;
				var locMin = new ClipperLib.LocalMinima();
				locMin.Next = null;
				locMin.Y = E.Bot.Y;
				locMin.LeftBound = null;
				locMin.RightBound = E;
				E.WindDelta = 0;
				Result = this.ProcessBound(E, LeftBoundIsForward);
				this.InsertLocalMinima(locMin);
			}
			return Result;
		}

		if (E.Dx === ClipperLib.ClipperBase.horizontal)
		{
			//We need to be careful with open paths because this may not be a
			//true local minima (ie E may be following a skip edge).
			//Also, consecutive horz. edges may start heading left before going right.
			if (LeftBoundIsForward) EStart = E.Prev;
			else EStart = E.Next;

			if (EStart.Dx === ClipperLib.ClipperBase.horizontal) //ie an adjoining horizontal skip edge
			{
				if (EStart.Bot.X !== E.Bot.X && EStart.Top.X !== E.Bot.X)
					this.ReverseHorizontal(E);
			}
			else if (EStart.Bot.X !== E.Bot.X)
				this.ReverseHorizontal(E);
		}

		EStart = E;
		if (LeftBoundIsForward)
		{
			while (Result.Top.Y === Result.Next.Bot.Y && Result.Next.OutIdx !== ClipperLib.ClipperBase.Skip)
				Result = Result.Next;
			if (Result.Dx === ClipperLib.ClipperBase.horizontal && Result.Next.OutIdx !== ClipperLib.ClipperBase.Skip)
			{
				//nb: at the top of a bound, horizontals are added to the bound
				//only when the preceding edge attaches to the horizontal's left vertex
				//unless a Skip edge is encountered when that becomes the top divide
				Horz = Result;
				while (Horz.Prev.Dx === ClipperLib.ClipperBase.horizontal)
					Horz = Horz.Prev;
				if (Horz.Prev.Top.X > Result.Next.Top.X)
					Result = Horz.Prev;
			}
			while (E !== Result)
			{
				E.NextInLML = E.Next;
				if (E.Dx === ClipperLib.ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Prev.Top.X)
					this.ReverseHorizontal(E);
				E = E.Next;
			}
			if (E.Dx === ClipperLib.ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Prev.Top.X)
				this.ReverseHorizontal(E);
			Result = Result.Next;
			//move to the edge just beyond current bound
		}
		else
		{
			while (Result.Top.Y === Result.Prev.Bot.Y && Result.Prev.OutIdx !== ClipperLib.ClipperBase.Skip)
				Result = Result.Prev;
			if (Result.Dx === ClipperLib.ClipperBase.horizontal && Result.Prev.OutIdx !== ClipperLib.ClipperBase.Skip)
			{
				Horz = Result;
				while (Horz.Next.Dx === ClipperLib.ClipperBase.horizontal)
					Horz = Horz.Next;
				if (Horz.Next.Top.X === Result.Prev.Top.X || Horz.Next.Top.X > Result.Prev.Top.X)
				{
					Result = Horz.Next;
				}
			}
			while (E !== Result)
			{
				E.NextInLML = E.Prev;
				if (E.Dx === ClipperLib.ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Next.Top.X)
					this.ReverseHorizontal(E);
				E = E.Prev;
			}
			if (E.Dx === ClipperLib.ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Next.Top.X)
				this.ReverseHorizontal(E);
			Result = Result.Prev;
			//move to the edge just beyond current bound
		}

		return Result;
	};

	ClipperLib.ClipperBase.prototype.AddPath = function (pg, polyType, Closed)
	{
		if (ClipperLib.use_lines)
		{
			if (!Closed && polyType === ClipperLib.PolyType.ptClip)
				ClipperLib.Error("AddPath: Open paths must be subject.");
		}
		else
		{
			if (!Closed)
				ClipperLib.Error("AddPath: Open paths have been disabled.");
		}
		var highI = pg.length - 1;
		if (Closed)
			while (highI > 0 && (ClipperLib.IntPoint.op_Equality(pg[highI], pg[0])))
				--highI;
		while (highI > 0 && (ClipperLib.IntPoint.op_Equality(pg[highI], pg[highI - 1])))
			--highI;
		if ((Closed && highI < 2) || (!Closed && highI < 1))
			return false;
		//create a new edge array ...
		var edges = new Array();
		for (var i = 0; i <= highI; i++)
			edges.push(new ClipperLib.TEdge());
		var IsFlat = true;
		//1. Basic (first) edge initialization ...

		//edges[1].Curr = pg[1];
		edges[1].Curr.X = pg[1].X;
		edges[1].Curr.Y = pg[1].Y;
		if (ClipperLib.use_xyz) edges[1].Curr.Z = pg[1].Z;

		var $1 = {
			Value: this.m_UseFullRange
		};

		this.RangeTest(pg[0], $1);
		this.m_UseFullRange = $1.Value;

		$1.Value = this.m_UseFullRange;
		this.RangeTest(pg[highI], $1);
		this.m_UseFullRange = $1.Value;

		this.InitEdge(edges[0], edges[1], edges[highI], pg[0]);
		this.InitEdge(edges[highI], edges[0], edges[highI - 1], pg[highI]);
		for (var i = highI - 1; i >= 1; --i)
		{
			$1.Value = this.m_UseFullRange;
			this.RangeTest(pg[i], $1);
			this.m_UseFullRange = $1.Value;

			this.InitEdge(edges[i], edges[i + 1], edges[i - 1], pg[i]);
		}

		var eStart = edges[0];
		//2. Remove duplicate vertices, and (when closed) collinear edges ...
		var E = eStart,
			eLoopStop = eStart;
		for (;;)
		{
			//console.log(E.Next, eStart);
			//nb: allows matching start and end points when not Closed ...
			if (E.Curr === E.Next.Curr && (Closed || E.Next !== eStart))
			{
				if (E === E.Next)
					break;
				if (E === eStart)
					eStart = E.Next;
				E = this.RemoveEdge(E);
				eLoopStop = E;
				continue;
			}
			if (E.Prev === E.Next)
				break;
			else if (Closed && ClipperLib.ClipperBase.SlopesEqual4(E.Prev.Curr, E.Curr, E.Next.Curr, this.m_UseFullRange) && (!this.PreserveCollinear || !this.Pt2IsBetweenPt1AndPt3(E.Prev.Curr, E.Curr, E.Next.Curr)))
			{
				//Collinear edges are allowed for open paths but in closed paths
				//the default is to merge adjacent collinear edges into a single edge.
				//However, if the PreserveCollinear property is enabled, only overlapping
				//collinear edges (ie spikes) will be removed from closed paths.
				if (E === eStart)
					eStart = E.Next;
				E = this.RemoveEdge(E);
				E = E.Prev;
				eLoopStop = E;
				continue;
			}
			E = E.Next;
			if ((E === eLoopStop) || (!Closed && E.Next === eStart)) break;
		}
		if ((!Closed && (E === E.Next)) || (Closed && (E.Prev === E.Next)))
			return false;
		if (!Closed)
		{
			this.m_HasOpenPaths = true;
			eStart.Prev.OutIdx = ClipperLib.ClipperBase.Skip;
		}
		//3. Do second stage of edge initialization ...
		E = eStart;
		do {
			this.InitEdge2(E, polyType);
			E = E.Next;
			if (IsFlat && E.Curr.Y !== eStart.Curr.Y)
				IsFlat = false;
		}
		while (E !== eStart)
		//4. Finally, add edge bounds to LocalMinima list ...
		//Totally flat paths must be handled differently when adding them
		//to LocalMinima list to avoid endless loops etc ...
		if (IsFlat)
		{
			if (Closed)
				return false;

			E.Prev.OutIdx = ClipperLib.ClipperBase.Skip;

			var locMin = new ClipperLib.LocalMinima();
			locMin.Next = null;
			locMin.Y = E.Bot.Y;
			locMin.LeftBound = null;
			locMin.RightBound = E;
			locMin.RightBound.Side = ClipperLib.EdgeSide.esRight;
			locMin.RightBound.WindDelta = 0;

			for (;;)
			{
				if (E.Bot.X !== E.Prev.Top.X) this.ReverseHorizontal(E);
				if (E.Next.OutIdx === ClipperLib.ClipperBase.Skip) break;
				E.NextInLML = E.Next;
				E = E.Next;
			}
			this.InsertLocalMinima(locMin);
			this.m_edges.push(edges);
			return true;
		}
		this.m_edges.push(edges);
		var leftBoundIsForward;
		var EMin = null;

		//workaround to avoid an endless loop in the while loop below when
		//open paths have matching start and end points ...
		if (ClipperLib.IntPoint.op_Equality(E.Prev.Bot, E.Prev.Top))
			E = E.Next;

		for (;;)
		{
			E = this.FindNextLocMin(E);
			if (E === EMin)
				break;
			else if (EMin === null)
				EMin = E;
			//E and E.Prev now share a local minima (left aligned if horizontal).
			//Compare their slopes to find which starts which bound ...
			var locMin = new ClipperLib.LocalMinima();
			locMin.Next = null;
			locMin.Y = E.Bot.Y;
			if (E.Dx < E.Prev.Dx)
			{
				locMin.LeftBound = E.Prev;
				locMin.RightBound = E;
				leftBoundIsForward = false;
				//Q.nextInLML = Q.prev
			}
			else
			{
				locMin.LeftBound = E;
				locMin.RightBound = E.Prev;
				leftBoundIsForward = true;
				//Q.nextInLML = Q.next
			}
			locMin.LeftBound.Side = ClipperLib.EdgeSide.esLeft;
			locMin.RightBound.Side = ClipperLib.EdgeSide.esRight;
			if (!Closed)
				locMin.LeftBound.WindDelta = 0;
			else if (locMin.LeftBound.Next === locMin.RightBound)
				locMin.LeftBound.WindDelta = -1;
			else
				locMin.LeftBound.WindDelta = 1;
			locMin.RightBound.WindDelta = -locMin.LeftBound.WindDelta;
			E = this.ProcessBound(locMin.LeftBound, leftBoundIsForward);
			if (E.OutIdx === ClipperLib.ClipperBase.Skip)
				E = this.ProcessBound(E, leftBoundIsForward);
			var E2 = this.ProcessBound(locMin.RightBound, !leftBoundIsForward);
			if (E2.OutIdx === ClipperLib.ClipperBase.Skip) E2 = this.ProcessBound(E2, !leftBoundIsForward);
			if (locMin.LeftBound.OutIdx === ClipperLib.ClipperBase.Skip)
				locMin.LeftBound = null;
			else if (locMin.RightBound.OutIdx === ClipperLib.ClipperBase.Skip)
				locMin.RightBound = null;
			this.InsertLocalMinima(locMin);
			if (!leftBoundIsForward)
				E = E2;
		}
		return true;
	};

	ClipperLib.ClipperBase.prototype.AddPaths = function (ppg, polyType, closed)
	{
		//  console.log("-------------------------------------------");
		//  console.log(JSON.stringify(ppg));
		var result = false;
		for (var i = 0, ilen = ppg.length; i < ilen; ++i)
			if (this.AddPath(ppg[i], polyType, closed))
				result = true;
		return result;
	};

	ClipperLib.ClipperBase.prototype.Pt2IsBetweenPt1AndPt3 = function (pt1, pt2, pt3)
	{
		if ((ClipperLib.IntPoint.op_Equality(pt1, pt3)) || (ClipperLib.IntPoint.op_Equality(pt1, pt2)) || (ClipperLib.IntPoint.op_Equality(pt3, pt2)))

			//if ((pt1 == pt3) || (pt1 == pt2) || (pt3 == pt2))
			return false;

		else if (pt1.X !== pt3.X)
			return (pt2.X > pt1.X) === (pt2.X < pt3.X);
		else
			return (pt2.Y > pt1.Y) === (pt2.Y < pt3.Y);
	};

	ClipperLib.ClipperBase.prototype.RemoveEdge = function (e)
	{
		//removes e from double_linked_list (but without removing from memory)
		e.Prev.Next = e.Next;
		e.Next.Prev = e.Prev;
		var result = e.Next;
		e.Prev = null; //flag as removed (see ClipperBase.Clear)
		return result;
	};

	ClipperLib.ClipperBase.prototype.SetDx = function (e)
	{
		e.Delta.X = (e.Top.X - e.Bot.X);
		e.Delta.Y = (e.Top.Y - e.Bot.Y);
		if (e.Delta.Y === 0) e.Dx = ClipperLib.ClipperBase.horizontal;
		else e.Dx = (e.Delta.X) / (e.Delta.Y);
	};

	ClipperLib.ClipperBase.prototype.InsertLocalMinima = function (newLm)
	{
		if (this.m_MinimaList === null)
		{
			this.m_MinimaList = newLm;
		}
		else if (newLm.Y >= this.m_MinimaList.Y)
		{
			newLm.Next = this.m_MinimaList;
			this.m_MinimaList = newLm;
		}
		else
		{
			var tmpLm = this.m_MinimaList;
			while (tmpLm.Next !== null && (newLm.Y < tmpLm.Next.Y))
				tmpLm = tmpLm.Next;
			newLm.Next = tmpLm.Next;
			tmpLm.Next = newLm;
		}
	};

	ClipperLib.ClipperBase.prototype.PopLocalMinima = function (Y, current)
	{
		current.v = this.m_CurrentLM;
		if (this.m_CurrentLM !== null && this.m_CurrentLM.Y === Y)
		{
			this.m_CurrentLM = this.m_CurrentLM.Next;
			return true;
		}
		return false;
	};

	ClipperLib.ClipperBase.prototype.ReverseHorizontal = function (e)
	{
		//swap horizontal edges' top and bottom x's so they follow the natural
		//progression of the bounds - ie so their xbots will align with the
		//adjoining lower edge. [Helpful in the ProcessHorizontal() method.]
		var tmp = e.Top.X;
		e.Top.X = e.Bot.X;
		e.Bot.X = tmp;
		if (ClipperLib.use_xyz)
		{
			tmp = e.Top.Z;
			e.Top.Z = e.Bot.Z;
			e.Bot.Z = tmp;
		}
	};

	ClipperLib.ClipperBase.prototype.Reset = function ()
	{
		this.m_CurrentLM = this.m_MinimaList;
		if (this.m_CurrentLM === null) //ie nothing to process
			return;
		//reset all edges ...
		this.m_Scanbeam = null;
		var lm = this.m_MinimaList;
		while (lm !== null)
		{
			this.InsertScanbeam(lm.Y);
			var e = lm.LeftBound;
			if (e !== null)
			{
				//e.Curr = e.Bot;
				e.Curr.X = e.Bot.X;
				e.Curr.Y = e.Bot.Y;
				if (ClipperLib.use_xyz) e.Curr.Z = e.Bot.Z;
				e.OutIdx = ClipperLib.ClipperBase.Unassigned;
			}
			e = lm.RightBound;
			if (e !== null)
			{
				//e.Curr = e.Bot;
				e.Curr.X = e.Bot.X;
				e.Curr.Y = e.Bot.Y;
				if (ClipperLib.use_xyz) e.Curr.Z = e.Bot.Z;
				e.OutIdx = ClipperLib.ClipperBase.Unassigned;
			}
			lm = lm.Next;
		}
		this.m_ActiveEdges = null;
	};

	ClipperLib.ClipperBase.prototype.InsertScanbeam = function (Y)
	{
		//single-linked list: sorted descending, ignoring dups.
		if (this.m_Scanbeam === null)
		{
			this.m_Scanbeam = new ClipperLib.Scanbeam();
			this.m_Scanbeam.Next = null;
			this.m_Scanbeam.Y = Y;
		}
		else if (Y > this.m_Scanbeam.Y)
		{
			var newSb = new ClipperLib.Scanbeam();
			newSb.Y = Y;
			newSb.Next = this.m_Scanbeam;
			this.m_Scanbeam = newSb;
		}
		else
		{
			var sb2 = this.m_Scanbeam;
			while (sb2.Next !== null && Y <= sb2.Next.Y)
			{
				sb2 = sb2.Next;
			}
			if (Y === sb2.Y)
			{
				return;
			} //ie ignores duplicates
			var newSb1 = new ClipperLib.Scanbeam();
			newSb1.Y = Y;
			newSb1.Next = sb2.Next;
			sb2.Next = newSb1;
		}
	};

	ClipperLib.ClipperBase.prototype.PopScanbeam = function (Y)
	{
		if (this.m_Scanbeam === null)
		{
			Y.v = 0;
			return false;
		}
		Y.v = this.m_Scanbeam.Y;
		this.m_Scanbeam = this.m_Scanbeam.Next;
		return true;
	};

	ClipperLib.ClipperBase.prototype.LocalMinimaPending = function ()
	{
		return (this.m_CurrentLM !== null);
	};

	ClipperLib.ClipperBase.prototype.CreateOutRec = function ()
	{
		var result = new ClipperLib.OutRec();
		result.Idx = ClipperLib.ClipperBase.Unassigned;
		result.IsHole = false;
		result.IsOpen = false;
		result.FirstLeft = null;
		result.Pts = null;
		result.BottomPt = null;
		result.PolyNode = null;
		this.m_PolyOuts.push(result);
		result.Idx = this.m_PolyOuts.length - 1;
		return result;
	};

	ClipperLib.ClipperBase.prototype.DisposeOutRec = function (index)
	{
		var outRec = this.m_PolyOuts[index];
		outRec.Pts = null;
		outRec = null;
		this.m_PolyOuts[index] = null;
	};

	ClipperLib.ClipperBase.prototype.UpdateEdgeIntoAEL = function (e)
	{
		if (e.NextInLML === null)
		{
			ClipperLib.Error("UpdateEdgeIntoAEL: invalid call");
		}
		var AelPrev = e.PrevInAEL;
		var AelNext = e.NextInAEL;
		e.NextInLML.OutIdx = e.OutIdx;
		if (AelPrev !== null)
		{
			AelPrev.NextInAEL = e.NextInLML;
		}
		else
		{
			this.m_ActiveEdges = e.NextInLML;
		}
		if (AelNext !== null)
		{
			AelNext.PrevInAEL = e.NextInLML;
		}
		e.NextInLML.Side = e.Side;
		e.NextInLML.WindDelta = e.WindDelta;
		e.NextInLML.WindCnt = e.WindCnt;
		e.NextInLML.WindCnt2 = e.WindCnt2;
		e = e.NextInLML;
		e.Curr.X = e.Bot.X;
		e.Curr.Y = e.Bot.Y;
		e.PrevInAEL = AelPrev;
		e.NextInAEL = AelNext;
		if (!ClipperLib.ClipperBase.IsHorizontal(e))
		{
			this.InsertScanbeam(e.Top.Y);
		}
		return e;
	};

	ClipperLib.ClipperBase.prototype.SwapPositionsInAEL = function (edge1, edge2)
	{
		//check that one or other edge hasn't already been removed from AEL ...
		if (edge1.NextInAEL === edge1.PrevInAEL || edge2.NextInAEL === edge2.PrevInAEL)
		{
			return;
		}

		if (edge1.NextInAEL === edge2)
		{
			var next = edge2.NextInAEL;
			if (next !== null)
			{
				next.PrevInAEL = edge1;
			}
			var prev = edge1.PrevInAEL;
			if (prev !== null)
			{
				prev.NextInAEL = edge2;
			}
			edge2.PrevInAEL = prev;
			edge2.NextInAEL = edge1;
			edge1.PrevInAEL = edge2;
			edge1.NextInAEL = next;
		}
		else if (edge2.NextInAEL === edge1)
		{
			var next1 = edge1.NextInAEL;
			if (next1 !== null)
			{
				next1.PrevInAEL = edge2;
			}
			var prev1 = edge2.PrevInAEL;
			if (prev1 !== null)
			{
				prev1.NextInAEL = edge1;
			}
			edge1.PrevInAEL = prev1;
			edge1.NextInAEL = edge2;
			edge2.PrevInAEL = edge1;
			edge2.NextInAEL = next1;
		}
		else
		{
			var next2 = edge1.NextInAEL;
			var prev2 = edge1.PrevInAEL;
			edge1.NextInAEL = edge2.NextInAEL;
			if (edge1.NextInAEL !== null)
			{
				edge1.NextInAEL.PrevInAEL = edge1;
			}
			edge1.PrevInAEL = edge2.PrevInAEL;
			if (edge1.PrevInAEL !== null)
			{
				edge1.PrevInAEL.NextInAEL = edge1;
			}
			edge2.NextInAEL = next2;
			if (edge2.NextInAEL !== null)
			{
				edge2.NextInAEL.PrevInAEL = edge2;
			}
			edge2.PrevInAEL = prev2;
			if (edge2.PrevInAEL !== null)
			{
				edge2.PrevInAEL.NextInAEL = edge2;
			}
		}

		if (edge1.PrevInAEL === null)
		{
			this.m_ActiveEdges = edge1;
		}
		else
		{
			if (edge2.PrevInAEL === null)
			{
				this.m_ActiveEdges = edge2;
			}
		}
	};

	ClipperLib.ClipperBase.prototype.DeleteFromAEL = function (e)
	{
		var AelPrev = e.PrevInAEL;
		var AelNext = e.NextInAEL;
		if (AelPrev === null && AelNext === null && e !== this.m_ActiveEdges)
		{
			return;
		} //already deleted
		if (AelPrev !== null)
		{
			AelPrev.NextInAEL = AelNext;
		}
		else
		{
			this.m_ActiveEdges = AelNext;
		}
		if (AelNext !== null)
		{
			AelNext.PrevInAEL = AelPrev;
		}
		e.NextInAEL = null;
		e.PrevInAEL = null;
	}

	// public Clipper(int InitOptions = 0)
	/**
	 * @suppress {missingProperties}
	 */
	ClipperLib.Clipper = function (InitOptions)
	{
		if (typeof (InitOptions) === "undefined") InitOptions = 0;
		this.m_PolyOuts = null;
		this.m_ClipType = ClipperLib.ClipType.ctIntersection;
		this.m_Scanbeam = null;
		this.m_Maxima = null;
		this.m_ActiveEdges = null;
		this.m_SortedEdges = null;
		this.m_IntersectList = null;
		this.m_IntersectNodeComparer = null;
		this.m_ExecuteLocked = false;
		this.m_ClipFillType = ClipperLib.PolyFillType.pftEvenOdd;
		this.m_SubjFillType = ClipperLib.PolyFillType.pftEvenOdd;
		this.m_Joins = null;
		this.m_GhostJoins = null;
		this.m_UsingPolyTree = false;
		this.ReverseSolution = false;
		this.StrictlySimple = false;

		ClipperLib.ClipperBase.call(this);

		this.m_Scanbeam = null;
		this.m_Maxima = null;
		this.m_ActiveEdges = null;
		this.m_SortedEdges = null;
		this.m_IntersectList = new Array();
		this.m_IntersectNodeComparer = ClipperLib.MyIntersectNodeSort.Compare;
		this.m_ExecuteLocked = false;
		this.m_UsingPolyTree = false;
		this.m_PolyOuts = new Array();
		this.m_Joins = new Array();
		this.m_GhostJoins = new Array();
		this.ReverseSolution = (1 & InitOptions) !== 0;
		this.StrictlySimple = (2 & InitOptions) !== 0;
		this.PreserveCollinear = (4 & InitOptions) !== 0;
		if (ClipperLib.use_xyz)
		{
			this.ZFillFunction = null; // function (IntPoint vert1, IntPoint vert2, ref IntPoint intersectPt);
		}
	};

	ClipperLib.Clipper.ioReverseSolution = 1;
	ClipperLib.Clipper.ioStrictlySimple = 2;
	ClipperLib.Clipper.ioPreserveCollinear = 4;

	ClipperLib.Clipper.prototype.Clear = function ()
	{
		if (this.m_edges.length === 0)
			return;
		//avoids problems with ClipperBase destructor
		this.DisposeAllPolyPts();
		ClipperLib.ClipperBase.prototype.Clear.call(this);
	};

	ClipperLib.Clipper.prototype.InsertMaxima = function (X)
	{
		//double-linked list: sorted ascending, ignoring dups.
		var newMax = new ClipperLib.Maxima();
		newMax.X = X;
		if (this.m_Maxima === null)
		{
			this.m_Maxima = newMax;
			this.m_Maxima.Next = null;
			this.m_Maxima.Prev = null;
		}
		else if (X < this.m_Maxima.X)
		{
			newMax.Next = this.m_Maxima;
			newMax.Prev = null;
			this.m_Maxima = newMax;
		}
		else
		{
			var m = this.m_Maxima;
			while (m.Next !== null && X >= m.Next.X)
			{
				m = m.Next;
			}
			if (X === m.X)
			{
				return;
			} //ie ignores duplicates (& CG to clean up newMax)
			//insert newMax between m and m.Next ...
			newMax.Next = m.Next;
			newMax.Prev = m;
			if (m.Next !== null)
			{
				m.Next.Prev = newMax;
			}
			m.Next = newMax;
		}
	};

	// ************************************
	ClipperLib.Clipper.prototype.Execute = function ()
	{
		var a = arguments,
			alen = a.length,
			ispolytree = a[1] instanceof ClipperLib.PolyTree;
		if (alen === 4 && !ispolytree) // function (clipType, solution, subjFillType, clipFillType)
		{
			var clipType = a[0],
				solution = a[1],
				subjFillType = a[2],
				clipFillType = a[3];
			if (this.m_ExecuteLocked)
				return false;
			if (this.m_HasOpenPaths)
				ClipperLib.Error("Error: PolyTree struct is needed for open path clipping.");
			this.m_ExecuteLocked = true;
			ClipperLib.Clear(solution);
			this.m_SubjFillType = subjFillType;
			this.m_ClipFillType = clipFillType;
			this.m_ClipType = clipType;
			this.m_UsingPolyTree = false;
			try
			{
				var succeeded = this.ExecuteInternal();
				//build the return polygons ...
				if (succeeded) this.BuildResult(solution);
			}
			finally
			{
				this.DisposeAllPolyPts();
				this.m_ExecuteLocked = false;
			}
			return succeeded;
		}
		else if (alen === 4 && ispolytree) // function (clipType, polytree, subjFillType, clipFillType)
		{
			var clipType = a[0],
				polytree = a[1],
				subjFillType = a[2],
				clipFillType = a[3];
			if (this.m_ExecuteLocked)
				return false;
			this.m_ExecuteLocked = true;
			this.m_SubjFillType = subjFillType;
			this.m_ClipFillType = clipFillType;
			this.m_ClipType = clipType;
			this.m_UsingPolyTree = true;
			try
			{
				var succeeded = this.ExecuteInternal();
				//build the return polygons ...
				if (succeeded) this.BuildResult2(polytree);
			}
			finally
			{
				this.DisposeAllPolyPts();
				this.m_ExecuteLocked = false;
			}
			return succeeded;
		}
		else if (alen === 2 && !ispolytree) // function (clipType, solution)
		{
			var clipType = a[0],
				solution = a[1];
			return this.Execute(clipType, solution, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);
		}
		else if (alen === 2 && ispolytree) // function (clipType, polytree)
		{
			var clipType = a[0],
				polytree = a[1];
			return this.Execute(clipType, polytree, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);
		}
	};

	ClipperLib.Clipper.prototype.FixHoleLinkage = function (outRec)
	{
		//skip if an outermost polygon or
		//already already points to the correct FirstLeft ...
		if (outRec.FirstLeft === null || (outRec.IsHole !== outRec.FirstLeft.IsHole && outRec.FirstLeft.Pts !== null))
			return;
		var orfl = outRec.FirstLeft;
		while (orfl !== null && ((orfl.IsHole === outRec.IsHole) || orfl.Pts === null))
			orfl = orfl.FirstLeft;
		outRec.FirstLeft = orfl;
	};

	ClipperLib.Clipper.prototype.ExecuteInternal = function ()
	{
		try
		{
			this.Reset();
			this.m_SortedEdges = null;
			this.m_Maxima = null;

			var botY = {},
				topY = {};

			if (!this.PopScanbeam(botY))
			{
				return false;
			}
			this.InsertLocalMinimaIntoAEL(botY.v);
			while (this.PopScanbeam(topY) || this.LocalMinimaPending())
			{
				this.ProcessHorizontals();
				this.m_GhostJoins.length = 0;
				if (!this.ProcessIntersections(topY.v))
				{
					return false;
				}
				this.ProcessEdgesAtTopOfScanbeam(topY.v);
				botY.v = topY.v;
				this.InsertLocalMinimaIntoAEL(botY.v);
			}

			//fix orientations ...
			var outRec, i, ilen;
			//fix orientations ...
			for (i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++)
			{
				outRec = this.m_PolyOuts[i];
				if (outRec.Pts === null || outRec.IsOpen) continue;
				if ((outRec.IsHole ^ this.ReverseSolution) == (this.Area$1(outRec) > 0))
					this.ReversePolyPtLinks(outRec.Pts);
			}

			this.JoinCommonEdges();

			for (i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++)
			{
				outRec = this.m_PolyOuts[i];
				if (outRec.Pts === null)
					continue;
				else if (outRec.IsOpen)
					this.FixupOutPolyline(outRec);
				else
					this.FixupOutPolygon(outRec);
			}

			if (this.StrictlySimple) this.DoSimplePolygons();
			return true;
		}
		//catch { return false; }
		finally
		{
			this.m_Joins.length = 0;
			this.m_GhostJoins.length = 0;
		}
	};

	ClipperLib.Clipper.prototype.DisposeAllPolyPts = function ()
	{
		for (var i = 0, ilen = this.m_PolyOuts.length; i < ilen; ++i)
			this.DisposeOutRec(i);
		ClipperLib.Clear(this.m_PolyOuts);
	};

	ClipperLib.Clipper.prototype.AddJoin = function (Op1, Op2, OffPt)
	{
		var j = new ClipperLib.Join();
		j.OutPt1 = Op1;
		j.OutPt2 = Op2;
		//j.OffPt = OffPt;
		j.OffPt.X = OffPt.X;
		j.OffPt.Y = OffPt.Y;
		if (ClipperLib.use_xyz) j.OffPt.Z = OffPt.Z;
		this.m_Joins.push(j);
	};

	ClipperLib.Clipper.prototype.AddGhostJoin = function (Op, OffPt)
	{
		var j = new ClipperLib.Join();
		j.OutPt1 = Op;
		//j.OffPt = OffPt;
		j.OffPt.X = OffPt.X;
		j.OffPt.Y = OffPt.Y;
		if (ClipperLib.use_xyz) j.OffPt.Z = OffPt.Z;
		this.m_GhostJoins.push(j);
	};

	//if (ClipperLib.use_xyz)
	//{
	ClipperLib.Clipper.prototype.SetZ = function (pt, e1, e2)
	{
		if (this.ZFillFunction !== null)
		{
			if (pt.Z !== 0 || this.ZFillFunction === null) return;
			else if (ClipperLib.IntPoint.op_Equality(pt, e1.Bot)) pt.Z = e1.Bot.Z;
			else if (ClipperLib.IntPoint.op_Equality(pt, e1.Top)) pt.Z = e1.Top.Z;
			else if (ClipperLib.IntPoint.op_Equality(pt, e2.Bot)) pt.Z = e2.Bot.Z;
			else if (ClipperLib.IntPoint.op_Equality(pt, e2.Top)) pt.Z = e2.Top.Z;
			else this.ZFillFunction(e1.Bot, e1.Top, e2.Bot, e2.Top, pt);
		}
	};
	//}

	ClipperLib.Clipper.prototype.InsertLocalMinimaIntoAEL = function (botY)
	{
		var lm = {};

		var lb;
		var rb;
		while (this.PopLocalMinima(botY, lm))
		{
			lb = lm.v.LeftBound;
			rb = lm.v.RightBound;

			var Op1 = null;
			if (lb === null)
			{
				this.InsertEdgeIntoAEL(rb, null);
				this.SetWindingCount(rb);
				if (this.IsContributing(rb))
					Op1 = this.AddOutPt(rb, rb.Bot);
			}
			else if (rb === null)
			{
				this.InsertEdgeIntoAEL(lb, null);
				this.SetWindingCount(lb);
				if (this.IsContributing(lb))
					Op1 = this.AddOutPt(lb, lb.Bot);
				this.InsertScanbeam(lb.Top.Y);
			}
			else
			{
				this.InsertEdgeIntoAEL(lb, null);
				this.InsertEdgeIntoAEL(rb, lb);
				this.SetWindingCount(lb);
				rb.WindCnt = lb.WindCnt;
				rb.WindCnt2 = lb.WindCnt2;
				if (this.IsContributing(lb))
					Op1 = this.AddLocalMinPoly(lb, rb, lb.Bot);
				this.InsertScanbeam(lb.Top.Y);
			}
			if (rb !== null)
			{
				if (ClipperLib.ClipperBase.IsHorizontal(rb))
				{
					if (rb.NextInLML !== null)
					{
						this.InsertScanbeam(rb.NextInLML.Top.Y);
					}
					this.AddEdgeToSEL(rb);
				}
				else
				{
					this.InsertScanbeam(rb.Top.Y);
				}
			}
			if (lb === null || rb === null) continue;
			//if output polygons share an Edge with a horizontal rb, they'll need joining later ...
			if (Op1 !== null && ClipperLib.ClipperBase.IsHorizontal(rb) && this.m_GhostJoins.length > 0 && rb.WindDelta !== 0)
			{
				for (var i = 0, ilen = this.m_GhostJoins.length; i < ilen; i++)
				{
					//if the horizontal Rb and a 'ghost' horizontal overlap, then convert
					//the 'ghost' join to a real join ready for later ...
					var j = this.m_GhostJoins[i];

					if (this.HorzSegmentsOverlap(j.OutPt1.Pt.X, j.OffPt.X, rb.Bot.X, rb.Top.X))
						this.AddJoin(j.OutPt1, Op1, j.OffPt);
				}
			}

			if (lb.OutIdx >= 0 && lb.PrevInAEL !== null &&
				lb.PrevInAEL.Curr.X === lb.Bot.X &&
				lb.PrevInAEL.OutIdx >= 0 &&
				ClipperLib.ClipperBase.SlopesEqual5(lb.PrevInAEL.Curr, lb.PrevInAEL.Top, lb.Curr, lb.Top, this.m_UseFullRange) &&
				lb.WindDelta !== 0 && lb.PrevInAEL.WindDelta !== 0)
			{
				var Op2 = this.AddOutPt(lb.PrevInAEL, lb.Bot);
				this.AddJoin(Op1, Op2, lb.Top);
			}
			if (lb.NextInAEL !== rb)
			{
				if (rb.OutIdx >= 0 && rb.PrevInAEL.OutIdx >= 0 &&
					ClipperLib.ClipperBase.SlopesEqual5(rb.PrevInAEL.Curr, rb.PrevInAEL.Top, rb.Curr, rb.Top, this.m_UseFullRange) &&
					rb.WindDelta !== 0 && rb.PrevInAEL.WindDelta !== 0)
				{
					var Op2 = this.AddOutPt(rb.PrevInAEL, rb.Bot);
					this.AddJoin(Op1, Op2, rb.Top);
				}
				var e = lb.NextInAEL;
				if (e !== null)
					while (e !== rb)
					{
						//nb: For calculating winding counts etc, IntersectEdges() assumes
						//that param1 will be to the right of param2 ABOVE the intersection ...
						this.IntersectEdges(rb, e, lb.Curr);
						//order important here
						e = e.NextInAEL;
					}
			}
		}
	};

	ClipperLib.Clipper.prototype.InsertEdgeIntoAEL = function (edge, startEdge)
	{
		if (this.m_ActiveEdges === null)
		{
			edge.PrevInAEL = null;
			edge.NextInAEL = null;
			this.m_ActiveEdges = edge;
		}
		else if (startEdge === null && this.E2InsertsBeforeE1(this.m_ActiveEdges, edge))
		{
			edge.PrevInAEL = null;
			edge.NextInAEL = this.m_ActiveEdges;
			this.m_ActiveEdges.PrevInAEL = edge;
			this.m_ActiveEdges = edge;
		}
		else
		{
			if (startEdge === null)
				startEdge = this.m_ActiveEdges;
			while (startEdge.NextInAEL !== null && !this.E2InsertsBeforeE1(startEdge.NextInAEL, edge))
				startEdge = startEdge.NextInAEL;
			edge.NextInAEL = startEdge.NextInAEL;
			if (startEdge.NextInAEL !== null)
				startEdge.NextInAEL.PrevInAEL = edge;
			edge.PrevInAEL = startEdge;
			startEdge.NextInAEL = edge;
		}
	};

	ClipperLib.Clipper.prototype.E2InsertsBeforeE1 = function (e1, e2)
	{
		if (e2.Curr.X === e1.Curr.X)
		{
			if (e2.Top.Y > e1.Top.Y)
				return e2.Top.X < ClipperLib.Clipper.TopX(e1, e2.Top.Y);
			else
				return e1.Top.X > ClipperLib.Clipper.TopX(e2, e1.Top.Y);
		}
		else
			return e2.Curr.X < e1.Curr.X;
	};

	ClipperLib.Clipper.prototype.IsEvenOddFillType = function (edge)
	{
		if (edge.PolyTyp === ClipperLib.PolyType.ptSubject)
			return this.m_SubjFillType === ClipperLib.PolyFillType.pftEvenOdd;
		else
			return this.m_ClipFillType === ClipperLib.PolyFillType.pftEvenOdd;
	};

	ClipperLib.Clipper.prototype.IsEvenOddAltFillType = function (edge)
	{
		if (edge.PolyTyp === ClipperLib.PolyType.ptSubject)
			return this.m_ClipFillType === ClipperLib.PolyFillType.pftEvenOdd;
		else
			return this.m_SubjFillType === ClipperLib.PolyFillType.pftEvenOdd;
	};

	ClipperLib.Clipper.prototype.IsContributing = function (edge)
	{
		var pft, pft2;
		if (edge.PolyTyp === ClipperLib.PolyType.ptSubject)
		{
			pft = this.m_SubjFillType;
			pft2 = this.m_ClipFillType;
		}
		else
		{
			pft = this.m_ClipFillType;
			pft2 = this.m_SubjFillType;
		}
		switch (pft)
		{
		case ClipperLib.PolyFillType.pftEvenOdd:
			if (edge.WindDelta === 0 && edge.WindCnt !== 1)
				return false;
			break;
		case ClipperLib.PolyFillType.pftNonZero:
			if (Math.abs(edge.WindCnt) !== 1)
				return false;
			break;
		case ClipperLib.PolyFillType.pftPositive:
			if (edge.WindCnt !== 1)
				return false;
			break;
		default:
			if (edge.WindCnt !== -1)
				return false;
			break;
		}
		switch (this.m_ClipType)
		{
		case ClipperLib.ClipType.ctIntersection:
			switch (pft2)
			{
			case ClipperLib.PolyFillType.pftEvenOdd:
			case ClipperLib.PolyFillType.pftNonZero:
				return (edge.WindCnt2 !== 0);
			case ClipperLib.PolyFillType.pftPositive:
				return (edge.WindCnt2 > 0);
			default:
				return (edge.WindCnt2 < 0);
			}
		case ClipperLib.ClipType.ctUnion:
			switch (pft2)
			{
			case ClipperLib.PolyFillType.pftEvenOdd:
			case ClipperLib.PolyFillType.pftNonZero:
				return (edge.WindCnt2 === 0);
			case ClipperLib.PolyFillType.pftPositive:
				return (edge.WindCnt2 <= 0);
			default:
				return (edge.WindCnt2 >= 0);
			}
		case ClipperLib.ClipType.ctDifference:
			if (edge.PolyTyp === ClipperLib.PolyType.ptSubject)
				switch (pft2)
				{
				case ClipperLib.PolyFillType.pftEvenOdd:
				case ClipperLib.PolyFillType.pftNonZero:
					return (edge.WindCnt2 === 0);
				case ClipperLib.PolyFillType.pftPositive:
					return (edge.WindCnt2 <= 0);
				default:
					return (edge.WindCnt2 >= 0);
				}
			else
				switch (pft2)
				{
				case ClipperLib.PolyFillType.pftEvenOdd:
				case ClipperLib.PolyFillType.pftNonZero:
					return (edge.WindCnt2 !== 0);
				case ClipperLib.PolyFillType.pftPositive:
					return (edge.WindCnt2 > 0);
				default:
					return (edge.WindCnt2 < 0);
				}
		case ClipperLib.ClipType.ctXor:
			if (edge.WindDelta === 0)
				switch (pft2)
				{
				case ClipperLib.PolyFillType.pftEvenOdd:
				case ClipperLib.PolyFillType.pftNonZero:
					return (edge.WindCnt2 === 0);
				case ClipperLib.PolyFillType.pftPositive:
					return (edge.WindCnt2 <= 0);
				default:
					return (edge.WindCnt2 >= 0);
				}
			else
				return true;
		}
		return true;
	};

	ClipperLib.Clipper.prototype.SetWindingCount = function (edge)
	{
		var e = edge.PrevInAEL;
		//find the edge of the same polytype that immediately preceeds 'edge' in AEL
		while (e !== null && ((e.PolyTyp !== edge.PolyTyp) || (e.WindDelta === 0)))
			e = e.PrevInAEL;
		if (e === null)
		{
			var pft = (edge.PolyTyp === ClipperLib.PolyType.ptSubject ? this.m_SubjFillType : this.m_ClipFillType);
			if (edge.WindDelta === 0)
			{
				edge.WindCnt = (pft === ClipperLib.PolyFillType.pftNegative ? -1 : 1);
			}
			else
			{
				edge.WindCnt = edge.WindDelta;
			}
			edge.WindCnt2 = 0;
			e = this.m_ActiveEdges;
			//ie get ready to calc WindCnt2
		}
		else if (edge.WindDelta === 0 && this.m_ClipType !== ClipperLib.ClipType.ctUnion)
		{
			edge.WindCnt = 1;
			edge.WindCnt2 = e.WindCnt2;
			e = e.NextInAEL;
			//ie get ready to calc WindCnt2
		}
		else if (this.IsEvenOddFillType(edge))
		{
			//EvenOdd filling ...
			if (edge.WindDelta === 0)
			{
				//are we inside a subj polygon ...
				var Inside = true;
				var e2 = e.PrevInAEL;
				while (e2 !== null)
				{
					if (e2.PolyTyp === e.PolyTyp && e2.WindDelta !== 0)
						Inside = !Inside;
					e2 = e2.PrevInAEL;
				}
				edge.WindCnt = (Inside ? 0 : 1);
			}
			else
			{
				edge.WindCnt = edge.WindDelta;
			}
			edge.WindCnt2 = e.WindCnt2;
			e = e.NextInAEL;
			//ie get ready to calc WindCnt2
		}
		else
		{
			//nonZero, Positive or Negative filling ...
			if (e.WindCnt * e.WindDelta < 0)
			{
				//prev edge is 'decreasing' WindCount (WC) toward zero
				//so we're outside the previous polygon ...
				if (Math.abs(e.WindCnt) > 1)
				{
					//outside prev poly but still inside another.
					//when reversing direction of prev poly use the same WC
					if (e.WindDelta * edge.WindDelta < 0)
						edge.WindCnt = e.WindCnt;
					else
						edge.WindCnt = e.WindCnt + edge.WindDelta;
				}
				else
					edge.WindCnt = (edge.WindDelta === 0 ? 1 : edge.WindDelta);
			}
			else
			{
				//prev edge is 'increasing' WindCount (WC) away from zero
				//so we're inside the previous polygon ...
				if (edge.WindDelta === 0)
					edge.WindCnt = (e.WindCnt < 0 ? e.WindCnt - 1 : e.WindCnt + 1);
				else if (e.WindDelta * edge.WindDelta < 0)
					edge.WindCnt = e.WindCnt;
				else
					edge.WindCnt = e.WindCnt + edge.WindDelta;
			}
			edge.WindCnt2 = e.WindCnt2;
			e = e.NextInAEL;
			//ie get ready to calc WindCnt2
		}
		//update WindCnt2 ...
		if (this.IsEvenOddAltFillType(edge))
		{
			//EvenOdd filling ...
			while (e !== edge)
			{
				if (e.WindDelta !== 0)
					edge.WindCnt2 = (edge.WindCnt2 === 0 ? 1 : 0);
				e = e.NextInAEL;
			}
		}
		else
		{
			//nonZero, Positive or Negative filling ...
			while (e !== edge)
			{
				edge.WindCnt2 += e.WindDelta;
				e = e.NextInAEL;
			}
		}
	};

	ClipperLib.Clipper.prototype.AddEdgeToSEL = function (edge)
	{
		//SEL pointers in PEdge are use to build transient lists of horizontal edges.
		//However, since we don't need to worry about processing order, all additions
		//are made to the front of the list ...
		if (this.m_SortedEdges === null)
		{
			this.m_SortedEdges = edge;
			edge.PrevInSEL = null;
			edge.NextInSEL = null;
		}
		else
		{
			edge.NextInSEL = this.m_SortedEdges;
			edge.PrevInSEL = null;
			this.m_SortedEdges.PrevInSEL = edge;
			this.m_SortedEdges = edge;
		}
	};

	ClipperLib.Clipper.prototype.PopEdgeFromSEL = function (e)
	{
		//Pop edge from front of SEL (ie SEL is a FILO list)
		e.v = this.m_SortedEdges;
		if (e.v === null)
		{
			return false;
		}
		var oldE = e.v;
		this.m_SortedEdges = e.v.NextInSEL;
		if (this.m_SortedEdges !== null)
		{
			this.m_SortedEdges.PrevInSEL = null;
		}
		oldE.NextInSEL = null;
		oldE.PrevInSEL = null;
		return true;
	};

	ClipperLib.Clipper.prototype.CopyAELToSEL = function ()
	{
		var e = this.m_ActiveEdges;
		this.m_SortedEdges = e;
		while (e !== null)
		{
			e.PrevInSEL = e.PrevInAEL;
			e.NextInSEL = e.NextInAEL;
			e = e.NextInAEL;
		}
	};

	ClipperLib.Clipper.prototype.SwapPositionsInSEL = function (edge1, edge2)
	{
		if (edge1.NextInSEL === null && edge1.PrevInSEL === null)
			return;
		if (edge2.NextInSEL === null && edge2.PrevInSEL === null)
			return;
		if (edge1.NextInSEL === edge2)
		{
			var next = edge2.NextInSEL;
			if (next !== null)
				next.PrevInSEL = edge1;
			var prev = edge1.PrevInSEL;
			if (prev !== null)
				prev.NextInSEL = edge2;
			edge2.PrevInSEL = prev;
			edge2.NextInSEL = edge1;
			edge1.PrevInSEL = edge2;
			edge1.NextInSEL = next;
		}
		else if (edge2.NextInSEL === edge1)
		{
			var next = edge1.NextInSEL;
			if (next !== null)
				next.PrevInSEL = edge2;
			var prev = edge2.PrevInSEL;
			if (prev !== null)
				prev.NextInSEL = edge1;
			edge1.PrevInSEL = prev;
			edge1.NextInSEL = edge2;
			edge2.PrevInSEL = edge1;
			edge2.NextInSEL = next;
		}
		else
		{
			var next = edge1.NextInSEL;
			var prev = edge1.PrevInSEL;
			edge1.NextInSEL = edge2.NextInSEL;
			if (edge1.NextInSEL !== null)
				edge1.NextInSEL.PrevInSEL = edge1;
			edge1.PrevInSEL = edge2.PrevInSEL;
			if (edge1.PrevInSEL !== null)
				edge1.PrevInSEL.NextInSEL = edge1;
			edge2.NextInSEL = next;
			if (edge2.NextInSEL !== null)
				edge2.NextInSEL.PrevInSEL = edge2;
			edge2.PrevInSEL = prev;
			if (edge2.PrevInSEL !== null)
				edge2.PrevInSEL.NextInSEL = edge2;
		}
		if (edge1.PrevInSEL === null)
			this.m_SortedEdges = edge1;
		else if (edge2.PrevInSEL === null)
			this.m_SortedEdges = edge2;
	};

	ClipperLib.Clipper.prototype.AddLocalMaxPoly = function (e1, e2, pt)
	{
		this.AddOutPt(e1, pt);
		if (e2.WindDelta === 0) this.AddOutPt(e2, pt);
		if (e1.OutIdx === e2.OutIdx)
		{
			e1.OutIdx = -1;
			e2.OutIdx = -1;
		}
		else if (e1.OutIdx < e2.OutIdx)
			this.AppendPolygon(e1, e2);
		else
			this.AppendPolygon(e2, e1);
	};

	ClipperLib.Clipper.prototype.AddLocalMinPoly = function (e1, e2, pt)
	{
		var result;
		var e, prevE;
		if (ClipperLib.ClipperBase.IsHorizontal(e2) || (e1.Dx > e2.Dx))
		{
			result = this.AddOutPt(e1, pt);
			e2.OutIdx = e1.OutIdx;
			e1.Side = ClipperLib.EdgeSide.esLeft;
			e2.Side = ClipperLib.EdgeSide.esRight;
			e = e1;
			if (e.PrevInAEL === e2)
				prevE = e2.PrevInAEL;
			else
				prevE = e.PrevInAEL;
		}
		else
		{
			result = this.AddOutPt(e2, pt);
			e1.OutIdx = e2.OutIdx;
			e1.Side = ClipperLib.EdgeSide.esRight;
			e2.Side = ClipperLib.EdgeSide.esLeft;
			e = e2;
			if (e.PrevInAEL === e1)
				prevE = e1.PrevInAEL;
			else
				prevE = e.PrevInAEL;
		}

		if (prevE !== null && prevE.OutIdx >= 0 && prevE.Top.Y < pt.Y && e.Top.Y < pt.Y)
		{
			var xPrev = ClipperLib.Clipper.TopX(prevE, pt.Y);
			var xE = ClipperLib.Clipper.TopX(e, pt.Y);
			if ((xPrev === xE) && (e.WindDelta !== 0) && (prevE.WindDelta !== 0) && ClipperLib.ClipperBase.SlopesEqual5(new ClipperLib.IntPoint2(xPrev, pt.Y), prevE.Top, new ClipperLib.IntPoint2(xE, pt.Y), e.Top, this.m_UseFullRange))
			{
				var outPt = this.AddOutPt(prevE, pt);
				this.AddJoin(result, outPt, e.Top);
			}
		}
		return result;
	};

	ClipperLib.Clipper.prototype.AddOutPt = function (e, pt)
	{
		if (e.OutIdx < 0)
		{
			var outRec = this.CreateOutRec();
			outRec.IsOpen = (e.WindDelta === 0);
			var newOp = new ClipperLib.OutPt();
			outRec.Pts = newOp;
			newOp.Idx = outRec.Idx;
			//newOp.Pt = pt;
			newOp.Pt.X = pt.X;
			newOp.Pt.Y = pt.Y;
			if (ClipperLib.use_xyz) newOp.Pt.Z = pt.Z;
			newOp.Next = newOp;
			newOp.Prev = newOp;
			if (!outRec.IsOpen)
				this.SetHoleState(e, outRec);
			e.OutIdx = outRec.Idx;
			//nb: do this after SetZ !
			return newOp;
		}
		else
		{
			var outRec = this.m_PolyOuts[e.OutIdx];
			//OutRec.Pts is the 'Left-most' point & OutRec.Pts.Prev is the 'Right-most'
			var op = outRec.Pts;
			var ToFront = (e.Side === ClipperLib.EdgeSide.esLeft);
			if (ToFront && ClipperLib.IntPoint.op_Equality(pt, op.Pt))
				return op;
			else if (!ToFront && ClipperLib.IntPoint.op_Equality(pt, op.Prev.Pt))
				return op.Prev;
			var newOp = new ClipperLib.OutPt();
			newOp.Idx = outRec.Idx;
			//newOp.Pt = pt;
			newOp.Pt.X = pt.X;
			newOp.Pt.Y = pt.Y;
			if (ClipperLib.use_xyz) newOp.Pt.Z = pt.Z;
			newOp.Next = op;
			newOp.Prev = op.Prev;
			newOp.Prev.Next = newOp;
			op.Prev = newOp;
			if (ToFront)
				outRec.Pts = newOp;
			return newOp;
		}
	};

	ClipperLib.Clipper.prototype.GetLastOutPt = function (e)
	{
		var outRec = this.m_PolyOuts[e.OutIdx];
		if (e.Side === ClipperLib.EdgeSide.esLeft)
		{
			return outRec.Pts;
		}
		else
		{
			return outRec.Pts.Prev;
		}
	};

	ClipperLib.Clipper.prototype.SwapPoints = function (pt1, pt2)
	{
		var tmp = new ClipperLib.IntPoint1(pt1.Value);
		//pt1.Value = pt2.Value;
		pt1.Value.X = pt2.Value.X;
		pt1.Value.Y = pt2.Value.Y;
		if (ClipperLib.use_xyz) pt1.Value.Z = pt2.Value.Z;
		//pt2.Value = tmp;
		pt2.Value.X = tmp.X;
		pt2.Value.Y = tmp.Y;
		if (ClipperLib.use_xyz) pt2.Value.Z = tmp.Z;
	};

	ClipperLib.Clipper.prototype.HorzSegmentsOverlap = function (seg1a, seg1b, seg2a, seg2b)
	{
		var tmp;
		if (seg1a > seg1b)
		{
			tmp = seg1a;
			seg1a = seg1b;
			seg1b = tmp;
		}
		if (seg2a > seg2b)
		{
			tmp = seg2a;
			seg2a = seg2b;
			seg2b = tmp;
		}
		return (seg1a < seg2b) && (seg2a < seg1b);
	}

	ClipperLib.Clipper.prototype.SetHoleState = function (e, outRec)
	{
		var e2 = e.PrevInAEL;
		var eTmp = null;
		while (e2 !== null)
		{
			if (e2.OutIdx >= 0 && e2.WindDelta !== 0)
			{
				if (eTmp === null)
					eTmp = e2;
				else if (eTmp.OutIdx === e2.OutIdx)
					eTmp = null; //paired
			}
			e2 = e2.PrevInAEL;
		}

		if (eTmp === null)
		{
			outRec.FirstLeft = null;
			outRec.IsHole = false;
		}
		else
		{
			outRec.FirstLeft = this.m_PolyOuts[eTmp.OutIdx];
			outRec.IsHole = !outRec.FirstLeft.IsHole;
		}
	};

	ClipperLib.Clipper.prototype.GetDx = function (pt1, pt2)
	{
		if (pt1.Y === pt2.Y)
			return ClipperLib.ClipperBase.horizontal;
		else
			return (pt2.X - pt1.X) / (pt2.Y - pt1.Y);
	};

	ClipperLib.Clipper.prototype.FirstIsBottomPt = function (btmPt1, btmPt2)
	{
		var p = btmPt1.Prev;
		while ((ClipperLib.IntPoint.op_Equality(p.Pt, btmPt1.Pt)) && (p !== btmPt1))
			p = p.Prev;
		var dx1p = Math.abs(this.GetDx(btmPt1.Pt, p.Pt));
		p = btmPt1.Next;
		while ((ClipperLib.IntPoint.op_Equality(p.Pt, btmPt1.Pt)) && (p !== btmPt1))
			p = p.Next;
		var dx1n = Math.abs(this.GetDx(btmPt1.Pt, p.Pt));
		p = btmPt2.Prev;
		while ((ClipperLib.IntPoint.op_Equality(p.Pt, btmPt2.Pt)) && (p !== btmPt2))
			p = p.Prev;
		var dx2p = Math.abs(this.GetDx(btmPt2.Pt, p.Pt));
		p = btmPt2.Next;
		while ((ClipperLib.IntPoint.op_Equality(p.Pt, btmPt2.Pt)) && (p !== btmPt2))
			p = p.Next;
		var dx2n = Math.abs(this.GetDx(btmPt2.Pt, p.Pt));

		if (Math.max(dx1p, dx1n) === Math.max(dx2p, dx2n) && Math.min(dx1p, dx1n) === Math.min(dx2p, dx2n))
		{
			return this.Area(btmPt1) > 0; //if otherwise identical use orientation
		}
		else
		{
			return (dx1p >= dx2p && dx1p >= dx2n) || (dx1n >= dx2p && dx1n >= dx2n);
		}
	};

	ClipperLib.Clipper.prototype.GetBottomPt = function (pp)
	{
		var dups = null;
		var p = pp.Next;
		while (p !== pp)
		{
			if (p.Pt.Y > pp.Pt.Y)
			{
				pp = p;
				dups = null;
			}
			else if (p.Pt.Y === pp.Pt.Y && p.Pt.X <= pp.Pt.X)
			{
				if (p.Pt.X < pp.Pt.X)
				{
					dups = null;
					pp = p;
				}
				else
				{
					if (p.Next !== pp && p.Prev !== pp)
						dups = p;
				}
			}
			p = p.Next;
		}
		if (dups !== null)
		{
			//there appears to be at least 2 vertices at bottomPt so ...
			while (dups !== p)
			{
				if (!this.FirstIsBottomPt(p, dups))
					pp = dups;
				dups = dups.Next;
				while (ClipperLib.IntPoint.op_Inequality(dups.Pt, pp.Pt))
					dups = dups.Next;
			}
		}
		return pp;
	};

	ClipperLib.Clipper.prototype.GetLowermostRec = function (outRec1, outRec2)
	{
		//work out which polygon fragment has the correct hole state ...
		if (outRec1.BottomPt === null)
			outRec1.BottomPt = this.GetBottomPt(outRec1.Pts);
		if (outRec2.BottomPt === null)
			outRec2.BottomPt = this.GetBottomPt(outRec2.Pts);
		var bPt1 = outRec1.BottomPt;
		var bPt2 = outRec2.BottomPt;
		if (bPt1.Pt.Y > bPt2.Pt.Y)
			return outRec1;
		else if (bPt1.Pt.Y < bPt2.Pt.Y)
			return outRec2;
		else if (bPt1.Pt.X < bPt2.Pt.X)
			return outRec1;
		else if (bPt1.Pt.X > bPt2.Pt.X)
			return outRec2;
		else if (bPt1.Next === bPt1)
			return outRec2;
		else if (bPt2.Next === bPt2)
			return outRec1;
		else if (this.FirstIsBottomPt(bPt1, bPt2))
			return outRec1;
		else
			return outRec2;
	};

	ClipperLib.Clipper.prototype.OutRec1RightOfOutRec2 = function (outRec1, outRec2)
	{
		do {
			outRec1 = outRec1.FirstLeft;
			if (outRec1 === outRec2)
				return true;
		}
		while (outRec1 !== null)
		return false;
	};

	ClipperLib.Clipper.prototype.GetOutRec = function (idx)
	{
		var outrec = this.m_PolyOuts[idx];
		while (outrec !== this.m_PolyOuts[outrec.Idx])
			outrec = this.m_PolyOuts[outrec.Idx];
		return outrec;
	};

	ClipperLib.Clipper.prototype.AppendPolygon = function (e1, e2)
	{
		//get the start and ends of both output polygons ...
		var outRec1 = this.m_PolyOuts[e1.OutIdx];
		var outRec2 = this.m_PolyOuts[e2.OutIdx];
		var holeStateRec;
		if (this.OutRec1RightOfOutRec2(outRec1, outRec2))
			holeStateRec = outRec2;
		else if (this.OutRec1RightOfOutRec2(outRec2, outRec1))
			holeStateRec = outRec1;
		else
			holeStateRec = this.GetLowermostRec(outRec1, outRec2);

		//get the start and ends of both output polygons and
		//join E2 poly onto E1 poly and delete pointers to E2 ...

		var p1_lft = outRec1.Pts;
		var p1_rt = p1_lft.Prev;
		var p2_lft = outRec2.Pts;
		var p2_rt = p2_lft.Prev;
		//join e2 poly onto e1 poly and delete pointers to e2 ...
		if (e1.Side === ClipperLib.EdgeSide.esLeft)
		{
			if (e2.Side === ClipperLib.EdgeSide.esLeft)
			{
				//z y x a b c
				this.ReversePolyPtLinks(p2_lft);
				p2_lft.Next = p1_lft;
				p1_lft.Prev = p2_lft;
				p1_rt.Next = p2_rt;
				p2_rt.Prev = p1_rt;
				outRec1.Pts = p2_rt;
			}
			else
			{
				//x y z a b c
				p2_rt.Next = p1_lft;
				p1_lft.Prev = p2_rt;
				p2_lft.Prev = p1_rt;
				p1_rt.Next = p2_lft;
				outRec1.Pts = p2_lft;
			}
		}
		else
		{
			if (e2.Side === ClipperLib.EdgeSide.esRight)
			{
				//a b c z y x
				this.ReversePolyPtLinks(p2_lft);
				p1_rt.Next = p2_rt;
				p2_rt.Prev = p1_rt;
				p2_lft.Next = p1_lft;
				p1_lft.Prev = p2_lft;
			}
			else
			{
				//a b c x y z
				p1_rt.Next = p2_lft;
				p2_lft.Prev = p1_rt;
				p1_lft.Prev = p2_rt;
				p2_rt.Next = p1_lft;
			}
		}
		outRec1.BottomPt = null;
		if (holeStateRec === outRec2)
		{
			if (outRec2.FirstLeft !== outRec1)
				outRec1.FirstLeft = outRec2.FirstLeft;
			outRec1.IsHole = outRec2.IsHole;
		}
		outRec2.Pts = null;
		outRec2.BottomPt = null;
		outRec2.FirstLeft = outRec1;
		var OKIdx = e1.OutIdx;
		var ObsoleteIdx = e2.OutIdx;
		e1.OutIdx = -1;
		//nb: safe because we only get here via AddLocalMaxPoly
		e2.OutIdx = -1;
		var e = this.m_ActiveEdges;
		while (e !== null)
		{
			if (e.OutIdx === ObsoleteIdx)
			{
				e.OutIdx = OKIdx;
				e.Side = e1.Side;
				break;
			}
			e = e.NextInAEL;
		}
		outRec2.Idx = outRec1.Idx;
	};

	ClipperLib.Clipper.prototype.ReversePolyPtLinks = function (pp)
	{
		if (pp === null)
			return;
		var pp1;
		var pp2;
		pp1 = pp;
		do {
			pp2 = pp1.Next;
			pp1.Next = pp1.Prev;
			pp1.Prev = pp2;
			pp1 = pp2;
		}
		while (pp1 !== pp)
	};

	ClipperLib.Clipper.SwapSides = function (edge1, edge2)
	{
		var side = edge1.Side;
		edge1.Side = edge2.Side;
		edge2.Side = side;
	};

	ClipperLib.Clipper.SwapPolyIndexes = function (edge1, edge2)
	{
		var outIdx = edge1.OutIdx;
		edge1.OutIdx = edge2.OutIdx;
		edge2.OutIdx = outIdx;
	};

	ClipperLib.Clipper.prototype.IntersectEdges = function (e1, e2, pt)
	{
		//e1 will be to the left of e2 BELOW the intersection. Therefore e1 is before
		//e2 in AEL except when e1 is being inserted at the intersection point ...
		var e1Contributing = (e1.OutIdx >= 0);
		var e2Contributing = (e2.OutIdx >= 0);

		if (ClipperLib.use_xyz)
			this.SetZ(pt, e1, e2);

		if (ClipperLib.use_lines)
		{
			//if either edge is on an OPEN path ...
			if (e1.WindDelta === 0 || e2.WindDelta === 0)
			{
				//ignore subject-subject open path intersections UNLESS they
				//are both open paths, AND they are both 'contributing maximas' ...
				if (e1.WindDelta === 0 && e2.WindDelta === 0) return;
				//if intersecting a subj line with a subj poly ...
				else if (e1.PolyTyp === e2.PolyTyp &&
					e1.WindDelta !== e2.WindDelta && this.m_ClipType === ClipperLib.ClipType.ctUnion)
				{
					if (e1.WindDelta === 0)
					{
						if (e2Contributing)
						{
							this.AddOutPt(e1, pt);
							if (e1Contributing)
								e1.OutIdx = -1;
						}
					}
					else
					{
						if (e1Contributing)
						{
							this.AddOutPt(e2, pt);
							if (e2Contributing)
								e2.OutIdx = -1;
						}
					}
				}
				else if (e1.PolyTyp !== e2.PolyTyp)
				{
					if ((e1.WindDelta === 0) && Math.abs(e2.WindCnt) === 1 &&
						(this.m_ClipType !== ClipperLib.ClipType.ctUnion || e2.WindCnt2 === 0))
					{
						this.AddOutPt(e1, pt);
						if (e1Contributing)
							e1.OutIdx = -1;
					}
					else if ((e2.WindDelta === 0) && (Math.abs(e1.WindCnt) === 1) &&
						(this.m_ClipType !== ClipperLib.ClipType.ctUnion || e1.WindCnt2 === 0))
					{
						this.AddOutPt(e2, pt);
						if (e2Contributing)
							e2.OutIdx = -1;
					}
				}
				return;
			}
		}
		//update winding counts...
		//assumes that e1 will be to the Right of e2 ABOVE the intersection
		if (e1.PolyTyp === e2.PolyTyp)
		{
			if (this.IsEvenOddFillType(e1))
			{
				var oldE1WindCnt = e1.WindCnt;
				e1.WindCnt = e2.WindCnt;
				e2.WindCnt = oldE1WindCnt;
			}
			else
			{
				if (e1.WindCnt + e2.WindDelta === 0)
					e1.WindCnt = -e1.WindCnt;
				else
					e1.WindCnt += e2.WindDelta;
				if (e2.WindCnt - e1.WindDelta === 0)
					e2.WindCnt = -e2.WindCnt;
				else
					e2.WindCnt -= e1.WindDelta;
			}
		}
		else
		{
			if (!this.IsEvenOddFillType(e2))
				e1.WindCnt2 += e2.WindDelta;
			else
				e1.WindCnt2 = (e1.WindCnt2 === 0) ? 1 : 0;
			if (!this.IsEvenOddFillType(e1))
				e2.WindCnt2 -= e1.WindDelta;
			else
				e2.WindCnt2 = (e2.WindCnt2 === 0) ? 1 : 0;
		}
		var e1FillType, e2FillType, e1FillType2, e2FillType2;
		if (e1.PolyTyp === ClipperLib.PolyType.ptSubject)
		{
			e1FillType = this.m_SubjFillType;
			e1FillType2 = this.m_ClipFillType;
		}
		else
		{
			e1FillType = this.m_ClipFillType;
			e1FillType2 = this.m_SubjFillType;
		}
		if (e2.PolyTyp === ClipperLib.PolyType.ptSubject)
		{
			e2FillType = this.m_SubjFillType;
			e2FillType2 = this.m_ClipFillType;
		}
		else
		{
			e2FillType = this.m_ClipFillType;
			e2FillType2 = this.m_SubjFillType;
		}
		var e1Wc, e2Wc;
		switch (e1FillType)
		{
		case ClipperLib.PolyFillType.pftPositive:
			e1Wc = e1.WindCnt;
			break;
		case ClipperLib.PolyFillType.pftNegative:
			e1Wc = -e1.WindCnt;
			break;
		default:
			e1Wc = Math.abs(e1.WindCnt);
			break;
		}
		switch (e2FillType)
		{
		case ClipperLib.PolyFillType.pftPositive:
			e2Wc = e2.WindCnt;
			break;
		case ClipperLib.PolyFillType.pftNegative:
			e2Wc = -e2.WindCnt;
			break;
		default:
			e2Wc = Math.abs(e2.WindCnt);
			break;
		}
		if (e1Contributing && e2Contributing)
		{
			if ((e1Wc !== 0 && e1Wc !== 1) || (e2Wc !== 0 && e2Wc !== 1) ||
				(e1.PolyTyp !== e2.PolyTyp && this.m_ClipType !== ClipperLib.ClipType.ctXor))
			{
				this.AddLocalMaxPoly(e1, e2, pt);
			}
			else
			{
				this.AddOutPt(e1, pt);
				this.AddOutPt(e2, pt);
				ClipperLib.Clipper.SwapSides(e1, e2);
				ClipperLib.Clipper.SwapPolyIndexes(e1, e2);
			}
		}
		else if (e1Contributing)
		{
			if (e2Wc === 0 || e2Wc === 1)
			{
				this.AddOutPt(e1, pt);
				ClipperLib.Clipper.SwapSides(e1, e2);
				ClipperLib.Clipper.SwapPolyIndexes(e1, e2);
			}
		}
		else if (e2Contributing)
		{
			if (e1Wc === 0 || e1Wc === 1)
			{
				this.AddOutPt(e2, pt);
				ClipperLib.Clipper.SwapSides(e1, e2);
				ClipperLib.Clipper.SwapPolyIndexes(e1, e2);
			}
		}
		else if ((e1Wc === 0 || e1Wc === 1) && (e2Wc === 0 || e2Wc === 1))
		{
			//neither edge is currently contributing ...
			var e1Wc2, e2Wc2;
			switch (e1FillType2)
			{
			case ClipperLib.PolyFillType.pftPositive:
				e1Wc2 = e1.WindCnt2;
				break;
			case ClipperLib.PolyFillType.pftNegative:
				e1Wc2 = -e1.WindCnt2;
				break;
			default:
				e1Wc2 = Math.abs(e1.WindCnt2);
				break;
			}
			switch (e2FillType2)
			{
			case ClipperLib.PolyFillType.pftPositive:
				e2Wc2 = e2.WindCnt2;
				break;
			case ClipperLib.PolyFillType.pftNegative:
				e2Wc2 = -e2.WindCnt2;
				break;
			default:
				e2Wc2 = Math.abs(e2.WindCnt2);
				break;
			}
			if (e1.PolyTyp !== e2.PolyTyp)
			{
				this.AddLocalMinPoly(e1, e2, pt);
			}
			else if (e1Wc === 1 && e2Wc === 1)
				switch (this.m_ClipType)
				{
				case ClipperLib.ClipType.ctIntersection:
					if (e1Wc2 > 0 && e2Wc2 > 0)
						this.AddLocalMinPoly(e1, e2, pt);
					break;
				case ClipperLib.ClipType.ctUnion:
					if (e1Wc2 <= 0 && e2Wc2 <= 0)
						this.AddLocalMinPoly(e1, e2, pt);
					break;
				case ClipperLib.ClipType.ctDifference:
					if (((e1.PolyTyp === ClipperLib.PolyType.ptClip) && (e1Wc2 > 0) && (e2Wc2 > 0)) ||
						((e1.PolyTyp === ClipperLib.PolyType.ptSubject) && (e1Wc2 <= 0) && (e2Wc2 <= 0)))
						this.AddLocalMinPoly(e1, e2, pt);
					break;
				case ClipperLib.ClipType.ctXor:
					this.AddLocalMinPoly(e1, e2, pt);
					break;
				}
			else
				ClipperLib.Clipper.SwapSides(e1, e2);
		}
	};

	ClipperLib.Clipper.prototype.DeleteFromSEL = function (e)
	{
		var SelPrev = e.PrevInSEL;
		var SelNext = e.NextInSEL;
		if (SelPrev === null && SelNext === null && (e !== this.m_SortedEdges))
			return;
		//already deleted
		if (SelPrev !== null)
			SelPrev.NextInSEL = SelNext;
		else
			this.m_SortedEdges = SelNext;
		if (SelNext !== null)
			SelNext.PrevInSEL = SelPrev;
		e.NextInSEL = null;
		e.PrevInSEL = null;
	};

	ClipperLib.Clipper.prototype.ProcessHorizontals = function ()
	{
		var horzEdge = {}; //m_SortedEdges;
		while (this.PopEdgeFromSEL(horzEdge))
		{
			this.ProcessHorizontal(horzEdge.v);
		}
	};

	ClipperLib.Clipper.prototype.GetHorzDirection = function (HorzEdge, $var)
	{
		if (HorzEdge.Bot.X < HorzEdge.Top.X)
		{
			$var.Left = HorzEdge.Bot.X;
			$var.Right = HorzEdge.Top.X;
			$var.Dir = ClipperLib.Direction.dLeftToRight;
		}
		else
		{
			$var.Left = HorzEdge.Top.X;
			$var.Right = HorzEdge.Bot.X;
			$var.Dir = ClipperLib.Direction.dRightToLeft;
		}
	};

	ClipperLib.Clipper.prototype.ProcessHorizontal = function (horzEdge)
	{
		var $var = {
			Dir: null,
			Left: null,
			Right: null
		};

		this.GetHorzDirection(horzEdge, $var);
		var dir = $var.Dir;
		var horzLeft = $var.Left;
		var horzRight = $var.Right;

		var IsOpen = horzEdge.WindDelta === 0;

		var eLastHorz = horzEdge,
			eMaxPair = null;
		while (eLastHorz.NextInLML !== null && ClipperLib.ClipperBase.IsHorizontal(eLastHorz.NextInLML))
			eLastHorz = eLastHorz.NextInLML;
		if (eLastHorz.NextInLML === null)
			eMaxPair = this.GetMaximaPair(eLastHorz);

		var currMax = this.m_Maxima;
		if (currMax !== null)
		{
			//get the first maxima in range (X) ...
			if (dir === ClipperLib.Direction.dLeftToRight)
			{
				while (currMax !== null && currMax.X <= horzEdge.Bot.X)
				{
					currMax = currMax.Next;
				}
				if (currMax !== null && currMax.X >= eLastHorz.Top.X)
				{
					currMax = null;
				}
			}
			else
			{
				while (currMax.Next !== null && currMax.Next.X < horzEdge.Bot.X)
				{
					currMax = currMax.Next;
				}
				if (currMax.X <= eLastHorz.Top.X)
				{
					currMax = null;
				}
			}
		}
		var op1 = null;
		for (;;) //loop through consec. horizontal edges
		{
			var IsLastHorz = (horzEdge === eLastHorz);
			var e = this.GetNextInAEL(horzEdge, dir);
			while (e !== null)
			{
				//this code block inserts extra coords into horizontal edges (in output
				//polygons) whereever maxima touch these horizontal edges. This helps
				//'simplifying' polygons (ie if the Simplify property is set).
				if (currMax !== null)
				{
					if (dir === ClipperLib.Direction.dLeftToRight)
					{
						while (currMax !== null && currMax.X < e.Curr.X)
						{
							if (horzEdge.OutIdx >= 0 && !IsOpen)
							{
								this.AddOutPt(horzEdge, new ClipperLib.IntPoint2(currMax.X, horzEdge.Bot.Y));
							}
							currMax = currMax.Next;
						}
					}
					else
					{
						while (currMax !== null && currMax.X > e.Curr.X)
						{
							if (horzEdge.OutIdx >= 0 && !IsOpen)
							{
								this.AddOutPt(horzEdge, new ClipperLib.IntPoint2(currMax.X, horzEdge.Bot.Y));
							}
							currMax = currMax.Prev;
						}
					}
				}

				if ((dir === ClipperLib.Direction.dLeftToRight && e.Curr.X > horzRight) || (dir === ClipperLib.Direction.dRightToLeft && e.Curr.X < horzLeft))
				{
					break;
				}

				//Also break if we've got to the end of an intermediate horizontal edge ...
				//nb: Smaller Dx's are to the right of larger Dx's ABOVE the horizontal.
				if (e.Curr.X === horzEdge.Top.X && horzEdge.NextInLML !== null && e.Dx < horzEdge.NextInLML.Dx)
					break;

				if (horzEdge.OutIdx >= 0 && !IsOpen) //note: may be done multiple times
				{
					if (ClipperLib.use_xyz)
					{
						if (dir === ClipperLib.Direction.dLeftToRight)
							this.SetZ(e.Curr, horzEdge, e);
						else this.SetZ(e.Curr, e, horzEdge);
					}

					op1 = this.AddOutPt(horzEdge, e.Curr);
					var eNextHorz = this.m_SortedEdges;
					while (eNextHorz !== null)
					{
						if (eNextHorz.OutIdx >= 0 && this.HorzSegmentsOverlap(horzEdge.Bot.X, horzEdge.Top.X, eNextHorz.Bot.X, eNextHorz.Top.X))
						{
							var op2 = this.GetLastOutPt(eNextHorz);
							this.AddJoin(op2, op1, eNextHorz.Top);
						}
						eNextHorz = eNextHorz.NextInSEL;
					}
					this.AddGhostJoin(op1, horzEdge.Bot);
				}

				//OK, so far we're still in range of the horizontal Edge  but make sure
				//we're at the last of consec. horizontals when matching with eMaxPair
				if (e === eMaxPair && IsLastHorz)
				{
					if (horzEdge.OutIdx >= 0)
					{
						this.AddLocalMaxPoly(horzEdge, eMaxPair, horzEdge.Top);
					}
					this.DeleteFromAEL(horzEdge);
					this.DeleteFromAEL(eMaxPair);
					return;
				}

				if (dir === ClipperLib.Direction.dLeftToRight)
				{
					var Pt = new ClipperLib.IntPoint2(e.Curr.X, horzEdge.Curr.Y);
					this.IntersectEdges(horzEdge, e, Pt);
				}
				else
				{
					var Pt = new ClipperLib.IntPoint2(e.Curr.X, horzEdge.Curr.Y);
					this.IntersectEdges(e, horzEdge, Pt);
				}
				var eNext = this.GetNextInAEL(e, dir);
				this.SwapPositionsInAEL(horzEdge, e);
				e = eNext;
			} //end while(e !== null)

			//Break out of loop if HorzEdge.NextInLML is not also horizontal ...
			if (horzEdge.NextInLML === null || !ClipperLib.ClipperBase.IsHorizontal(horzEdge.NextInLML))
			{
				break;
			}

			horzEdge = this.UpdateEdgeIntoAEL(horzEdge);
			if (horzEdge.OutIdx >= 0)
			{
				this.AddOutPt(horzEdge, horzEdge.Bot);
			}

			$var = {
				Dir: dir,
				Left: horzLeft,
				Right: horzRight
			};

			this.GetHorzDirection(horzEdge, $var);
			dir = $var.Dir;
			horzLeft = $var.Left;
			horzRight = $var.Right;

		} //end for (;;)

		if (horzEdge.OutIdx >= 0 && op1 === null)
		{
			op1 = this.GetLastOutPt(horzEdge);
			var eNextHorz = this.m_SortedEdges;
			while (eNextHorz !== null)
			{
				if (eNextHorz.OutIdx >= 0 && this.HorzSegmentsOverlap(horzEdge.Bot.X, horzEdge.Top.X, eNextHorz.Bot.X, eNextHorz.Top.X))
				{
					var op2 = this.GetLastOutPt(eNextHorz);
					this.AddJoin(op2, op1, eNextHorz.Top);
				}
				eNextHorz = eNextHorz.NextInSEL;
			}
			this.AddGhostJoin(op1, horzEdge.Top);
		}

		if (horzEdge.NextInLML !== null)
		{
			if (horzEdge.OutIdx >= 0)
			{
				op1 = this.AddOutPt(horzEdge, horzEdge.Top);

				horzEdge = this.UpdateEdgeIntoAEL(horzEdge);
				if (horzEdge.WindDelta === 0)
				{
					return;
				}
				//nb: HorzEdge is no longer horizontal here
				var ePrev = horzEdge.PrevInAEL;
				var eNext = horzEdge.NextInAEL;
				if (ePrev !== null && ePrev.Curr.X === horzEdge.Bot.X && ePrev.Curr.Y === horzEdge.Bot.Y && ePrev.WindDelta === 0 && (ePrev.OutIdx >= 0 && ePrev.Curr.Y > ePrev.Top.Y && ClipperLib.ClipperBase.SlopesEqual3(horzEdge, ePrev, this.m_UseFullRange)))
				{
					var op2 = this.AddOutPt(ePrev, horzEdge.Bot);
					this.AddJoin(op1, op2, horzEdge.Top);
				}
				else if (eNext !== null && eNext.Curr.X === horzEdge.Bot.X && eNext.Curr.Y === horzEdge.Bot.Y && eNext.WindDelta !== 0 && eNext.OutIdx >= 0 && eNext.Curr.Y > eNext.Top.Y && ClipperLib.ClipperBase.SlopesEqual3(horzEdge, eNext, this.m_UseFullRange))
				{
					var op2 = this.AddOutPt(eNext, horzEdge.Bot);
					this.AddJoin(op1, op2, horzEdge.Top);
				}
			}
			else
			{
				horzEdge = this.UpdateEdgeIntoAEL(horzEdge);
			}
		}
		else
		{
			if (horzEdge.OutIdx >= 0)
			{
				this.AddOutPt(horzEdge, horzEdge.Top);
			}
			this.DeleteFromAEL(horzEdge);
		}
	};

	ClipperLib.Clipper.prototype.GetNextInAEL = function (e, Direction)
	{
		return Direction === ClipperLib.Direction.dLeftToRight ? e.NextInAEL : e.PrevInAEL;
	};

	ClipperLib.Clipper.prototype.IsMinima = function (e)
	{
		return e !== null && (e.Prev.NextInLML !== e) && (e.Next.NextInLML !== e);
	};

	ClipperLib.Clipper.prototype.IsMaxima = function (e, Y)
	{
		return (e !== null && e.Top.Y === Y && e.NextInLML === null);
	};

	ClipperLib.Clipper.prototype.IsIntermediate = function (e, Y)
	{
		return (e.Top.Y === Y && e.NextInLML !== null);
	};

	ClipperLib.Clipper.prototype.GetMaximaPair = function (e)
	{
		if ((ClipperLib.IntPoint.op_Equality(e.Next.Top, e.Top)) && e.Next.NextInLML === null)
		{
			return e.Next;
		}
		else
		{
			if ((ClipperLib.IntPoint.op_Equality(e.Prev.Top, e.Top)) && e.Prev.NextInLML === null)
			{
				return e.Prev;
			}
			else
			{
				return null;
			}
		}
	};

	ClipperLib.Clipper.prototype.GetMaximaPairEx = function (e)
	{
		//as above but returns null if MaxPair isn't in AEL (unless it's horizontal)
		var result = this.GetMaximaPair(e);
		if (result === null || result.OutIdx === ClipperLib.ClipperBase.Skip ||
			((result.NextInAEL === result.PrevInAEL) && !ClipperLib.ClipperBase.IsHorizontal(result)))
		{
			return null;
		}
		return result;
	};

	ClipperLib.Clipper.prototype.ProcessIntersections = function (topY)
	{
		if (this.m_ActiveEdges === null)
			return true;
		try
		{
			this.BuildIntersectList(topY);
			if (this.m_IntersectList.length === 0)
				return true;
			if (this.m_IntersectList.length === 1 || this.FixupIntersectionOrder())
				this.ProcessIntersectList();
			else
				return false;
		}
		catch ($$e2)
		{
			this.m_SortedEdges = null;
			this.m_IntersectList.length = 0;
			ClipperLib.Error("ProcessIntersections error");
		}
		this.m_SortedEdges = null;
		return true;
	};

	ClipperLib.Clipper.prototype.BuildIntersectList = function (topY)
	{
		if (this.m_ActiveEdges === null)
			return;
		//prepare for sorting ...
		var e = this.m_ActiveEdges;
		//console.log(JSON.stringify(JSON.decycle( e )));
		this.m_SortedEdges = e;
		while (e !== null)
		{
			e.PrevInSEL = e.PrevInAEL;
			e.NextInSEL = e.NextInAEL;
			e.Curr.X = ClipperLib.Clipper.TopX(e, topY);
			e = e.NextInAEL;
		}
		//bubblesort ...
		var isModified = true;
		while (isModified && this.m_SortedEdges !== null)
		{
			isModified = false;
			e = this.m_SortedEdges;
			while (e.NextInSEL !== null)
			{
				var eNext = e.NextInSEL;
				var pt = new ClipperLib.IntPoint0();
				//console.log("e.Curr.X: " + e.Curr.X + " eNext.Curr.X" + eNext.Curr.X);
				if (e.Curr.X > eNext.Curr.X)
				{
					this.IntersectPoint(e, eNext, pt);
					if (pt.Y < topY)
					{
						pt = new ClipperLib.IntPoint2(ClipperLib.Clipper.TopX(e, topY), topY);
					}
					var newNode = new ClipperLib.IntersectNode();
					newNode.Edge1 = e;
					newNode.Edge2 = eNext;
					//newNode.Pt = pt;
					newNode.Pt.X = pt.X;
					newNode.Pt.Y = pt.Y;
					if (ClipperLib.use_xyz) newNode.Pt.Z = pt.Z;
					this.m_IntersectList.push(newNode);
					this.SwapPositionsInSEL(e, eNext);
					isModified = true;
				}
				else
					e = eNext;
			}
			if (e.PrevInSEL !== null)
				e.PrevInSEL.NextInSEL = null;
			else
				break;
		}
		this.m_SortedEdges = null;
	};

	ClipperLib.Clipper.prototype.EdgesAdjacent = function (inode)
	{
		return (inode.Edge1.NextInSEL === inode.Edge2) || (inode.Edge1.PrevInSEL === inode.Edge2);
	};

	ClipperLib.Clipper.IntersectNodeSort = function (node1, node2)
	{
		//the following typecast is safe because the differences in Pt.Y will
		//be limited to the height of the scanbeam.
		return (node2.Pt.Y - node1.Pt.Y);
	};

	ClipperLib.Clipper.prototype.FixupIntersectionOrder = function ()
	{
		//pre-condition: intersections are sorted bottom-most first.
		//Now it's crucial that intersections are made only between adjacent edges,
		//so to ensure this the order of intersections may need adjusting ...
		this.m_IntersectList.sort(this.m_IntersectNodeComparer);
		this.CopyAELToSEL();
		var cnt = this.m_IntersectList.length;
		for (var i = 0; i < cnt; i++)
		{
			if (!this.EdgesAdjacent(this.m_IntersectList[i]))
			{
				var j = i + 1;
				while (j < cnt && !this.EdgesAdjacent(this.m_IntersectList[j]))
					j++;
				if (j === cnt)
					return false;
				var tmp = this.m_IntersectList[i];
				this.m_IntersectList[i] = this.m_IntersectList[j];
				this.m_IntersectList[j] = tmp;
			}
			this.SwapPositionsInSEL(this.m_IntersectList[i].Edge1, this.m_IntersectList[i].Edge2);
		}
		return true;
	};

	ClipperLib.Clipper.prototype.ProcessIntersectList = function ()
	{
		for (var i = 0, ilen = this.m_IntersectList.length; i < ilen; i++)
		{
			var iNode = this.m_IntersectList[i];
			this.IntersectEdges(iNode.Edge1, iNode.Edge2, iNode.Pt);
			this.SwapPositionsInAEL(iNode.Edge1, iNode.Edge2);
		}
		this.m_IntersectList.length = 0;
	};

	/*
	--------------------------------
	Round speedtest: http://jsperf.com/fastest-round
	--------------------------------
	*/
	var R1 = function (a)
	{
		return a < 0 ? Math.ceil(a - 0.5) : Math.round(a)
	};

	var R2 = function (a)
	{
		return a < 0 ? Math.ceil(a - 0.5) : Math.floor(a + 0.5)
	};

	var R3 = function (a)
	{
		return a < 0 ? -Math.round(Math.abs(a)) : Math.round(a)
	};

	var R4 = function (a)
	{
		if (a < 0)
		{
			a -= 0.5;
			return a < -2147483648 ? Math.ceil(a) : a | 0;
		}
		else
		{
			a += 0.5;
			return a > 2147483647 ? Math.floor(a) : a | 0;
		}
	};

	if (browser.msie) ClipperLib.Clipper.Round = R1;
	else if (browser.chromium) ClipperLib.Clipper.Round = R3;
	else if (browser.safari) ClipperLib.Clipper.Round = R4;
	else ClipperLib.Clipper.Round = R2; // eg. browser.chrome || browser.firefox || browser.opera
	ClipperLib.Clipper.TopX = function (edge, currentY)
	{
		//if (edge.Bot == edge.Curr) alert ("edge.Bot = edge.Curr");
		//if (edge.Bot == edge.Top) alert ("edge.Bot = edge.Top");
		if (currentY === edge.Top.Y)
			return edge.Top.X;
		return edge.Bot.X + ClipperLib.Clipper.Round(edge.Dx * (currentY - edge.Bot.Y));
	};

	ClipperLib.Clipper.prototype.IntersectPoint = function (edge1, edge2, ip)
	{
		ip.X = 0;
		ip.Y = 0;
		var b1, b2;
		//nb: with very large coordinate values, it's possible for SlopesEqual() to
		//return false but for the edge.Dx value be equal due to double precision rounding.
		if (edge1.Dx === edge2.Dx)
		{
			ip.Y = edge1.Curr.Y;
			ip.X = ClipperLib.Clipper.TopX(edge1, ip.Y);
			return;
		}
		if (edge1.Delta.X === 0)
		{
			ip.X = edge1.Bot.X;
			if (ClipperLib.ClipperBase.IsHorizontal(edge2))
			{
				ip.Y = edge2.Bot.Y;
			}
			else
			{
				b2 = edge2.Bot.Y - (edge2.Bot.X / edge2.Dx);
				ip.Y = ClipperLib.Clipper.Round(ip.X / edge2.Dx + b2);
			}
		}
		else if (edge2.Delta.X === 0)
		{
			ip.X = edge2.Bot.X;
			if (ClipperLib.ClipperBase.IsHorizontal(edge1))
			{
				ip.Y = edge1.Bot.Y;
			}
			else
			{
				b1 = edge1.Bot.Y - (edge1.Bot.X / edge1.Dx);
				ip.Y = ClipperLib.Clipper.Round(ip.X / edge1.Dx + b1);
			}
		}
		else
		{
			b1 = edge1.Bot.X - edge1.Bot.Y * edge1.Dx;
			b2 = edge2.Bot.X - edge2.Bot.Y * edge2.Dx;
			var q = (b2 - b1) / (edge1.Dx - edge2.Dx);
			ip.Y = ClipperLib.Clipper.Round(q);
			if (Math.abs(edge1.Dx) < Math.abs(edge2.Dx))
				ip.X = ClipperLib.Clipper.Round(edge1.Dx * q + b1);
			else
				ip.X = ClipperLib.Clipper.Round(edge2.Dx * q + b2);
		}
		if (ip.Y < edge1.Top.Y || ip.Y < edge2.Top.Y)
		{
			if (edge1.Top.Y > edge2.Top.Y)
			{
				ip.Y = edge1.Top.Y;
				ip.X = ClipperLib.Clipper.TopX(edge2, edge1.Top.Y);
				return ip.X < edge1.Top.X;
			}
			else
				ip.Y = edge2.Top.Y;
			if (Math.abs(edge1.Dx) < Math.abs(edge2.Dx))
				ip.X = ClipperLib.Clipper.TopX(edge1, ip.Y);
			else
				ip.X = ClipperLib.Clipper.TopX(edge2, ip.Y);
		}
		//finally, don't allow 'ip' to be BELOW curr.Y (ie bottom of scanbeam) ...
		if (ip.Y > edge1.Curr.Y)
		{
			ip.Y = edge1.Curr.Y;
			//better to use the more vertical edge to derive X ...
			if (Math.abs(edge1.Dx) > Math.abs(edge2.Dx))
				ip.X = ClipperLib.Clipper.TopX(edge2, ip.Y);
			else
				ip.X = ClipperLib.Clipper.TopX(edge1, ip.Y);
		}
	};

	ClipperLib.Clipper.prototype.ProcessEdgesAtTopOfScanbeam = function (topY)
	{
		var e = this.m_ActiveEdges;

		while (e !== null)
		{
			//1. process maxima, treating them as if they're 'bent' horizontal edges,
			//   but exclude maxima with horizontal edges. nb: e can't be a horizontal.
			var IsMaximaEdge = this.IsMaxima(e, topY);
			if (IsMaximaEdge)
			{
				var eMaxPair = this.GetMaximaPairEx(e);
				IsMaximaEdge = (eMaxPair === null || !ClipperLib.ClipperBase.IsHorizontal(eMaxPair));
			}
			if (IsMaximaEdge)
			{
				if (this.StrictlySimple)
				{
					this.InsertMaxima(e.Top.X);
				}
				var ePrev = e.PrevInAEL;
				this.DoMaxima(e);
				if (ePrev === null)
					e = this.m_ActiveEdges;
				else
					e = ePrev.NextInAEL;
			}
			else
			{
				//2. promote horizontal edges, otherwise update Curr.X and Curr.Y ...
				if (this.IsIntermediate(e, topY) && ClipperLib.ClipperBase.IsHorizontal(e.NextInLML))
				{
					e = this.UpdateEdgeIntoAEL(e);
					if (e.OutIdx >= 0)
						this.AddOutPt(e, e.Bot);
					this.AddEdgeToSEL(e);
				}
				else
				{
					e.Curr.X = ClipperLib.Clipper.TopX(e, topY);
					e.Curr.Y = topY;
				}

				if (ClipperLib.use_xyz)
				{
					if (e.Top.Y === topY) e.Curr.Z = e.Top.Z;
					else if (e.Bot.Y === topY) e.Curr.Z = e.Bot.Z;
					else e.Curr.Z = 0;
				}

				//When StrictlySimple and 'e' is being touched by another edge, then
				//make sure both edges have a vertex here ...        
				if (this.StrictlySimple)
				{
					var ePrev = e.PrevInAEL;
					if ((e.OutIdx >= 0) && (e.WindDelta !== 0) && ePrev !== null &&
						(ePrev.OutIdx >= 0) && (ePrev.Curr.X === e.Curr.X) &&
						(ePrev.WindDelta !== 0))
					{
						var ip = new ClipperLib.IntPoint1(e.Curr);

						if (ClipperLib.use_xyz)
						{
							this.SetZ(ip, ePrev, e);
						}

						var op = this.AddOutPt(ePrev, ip);
						var op2 = this.AddOutPt(e, ip);
						this.AddJoin(op, op2, ip); //StrictlySimple (type-3) join
					}
				}
				e = e.NextInAEL;
			}
		}
		//3. Process horizontals at the Top of the scanbeam ...
		this.ProcessHorizontals();
		this.m_Maxima = null;
		//4. Promote intermediate vertices ...
		e = this.m_ActiveEdges;
		while (e !== null)
		{
			if (this.IsIntermediate(e, topY))
			{
				var op = null;
				if (e.OutIdx >= 0)
					op = this.AddOutPt(e, e.Top);
				e = this.UpdateEdgeIntoAEL(e);
				//if output polygons share an edge, they'll need joining later ...
				var ePrev = e.PrevInAEL;
				var eNext = e.NextInAEL;

				if (ePrev !== null && ePrev.Curr.X === e.Bot.X && ePrev.Curr.Y === e.Bot.Y && op !== null && ePrev.OutIdx >= 0 && ePrev.Curr.Y === ePrev.Top.Y && ClipperLib.ClipperBase.SlopesEqual5(e.Curr, e.Top, ePrev.Curr, ePrev.Top, this.m_UseFullRange) && (e.WindDelta !== 0) && (ePrev.WindDelta !== 0))
				{
					var op2 = this.AddOutPt(ePrev2, e.Bot);
					this.AddJoin(op, op2, e.Top);
				}
				else if (eNext !== null && eNext.Curr.X === e.Bot.X && eNext.Curr.Y === e.Bot.Y && op !== null && eNext.OutIdx >= 0 && eNext.Curr.Y === eNext.Top.Y && ClipperLib.ClipperBase.SlopesEqual5(e.Curr, e.Top, eNext.Curr, eNext.Top, this.m_UseFullRange) && (e.WindDelta !== 0) && (eNext.WindDelta !== 0))
				{
					var op2 = this.AddOutPt(eNext, e.Bot);
					this.AddJoin(op, op2, e.Top);
				}
			}
			e = e.NextInAEL;
		}
	};

	ClipperLib.Clipper.prototype.DoMaxima = function (e)
	{
		var eMaxPair = this.GetMaximaPairEx(e);
		if (eMaxPair === null)
		{
			if (e.OutIdx >= 0)
				this.AddOutPt(e, e.Top);
			this.DeleteFromAEL(e);
			return;
		}
		var eNext = e.NextInAEL;
		while (eNext !== null && eNext !== eMaxPair)
		{
			this.IntersectEdges(e, eNext, e.Top);
			this.SwapPositionsInAEL(e, eNext);
			eNext = e.NextInAEL;
		}
		if (e.OutIdx === -1 && eMaxPair.OutIdx === -1)
		{
			this.DeleteFromAEL(e);
			this.DeleteFromAEL(eMaxPair);
		}
		else if (e.OutIdx >= 0 && eMaxPair.OutIdx >= 0)
		{
			if (e.OutIdx >= 0) this.AddLocalMaxPoly(e, eMaxPair, e.Top);
			this.DeleteFromAEL(e);
			this.DeleteFromAEL(eMaxPair);
		}
		else if (ClipperLib.use_lines && e.WindDelta === 0)
		{
			if (e.OutIdx >= 0)
			{
				this.AddOutPt(e, e.Top);
				e.OutIdx = ClipperLib.ClipperBase.Unassigned;
			}
			this.DeleteFromAEL(e);
			if (eMaxPair.OutIdx >= 0)
			{
				this.AddOutPt(eMaxPair, e.Top);
				eMaxPair.OutIdx = ClipperLib.ClipperBase.Unassigned;
			}
			this.DeleteFromAEL(eMaxPair);
		}
		else
			ClipperLib.Error("DoMaxima error");
	};

	ClipperLib.Clipper.ReversePaths = function (polys)
	{
		for (var i = 0, len = polys.length; i < len; i++)
			polys[i].reverse();
	};

	ClipperLib.Clipper.Orientation = function (poly)
	{
		return ClipperLib.Clipper.Area(poly) >= 0;
	};

	ClipperLib.Clipper.prototype.PointCount = function (pts)
	{
		if (pts === null)
			return 0;
		var result = 0;
		var p = pts;
		do {
			result++;
			p = p.Next;
		}
		while (p !== pts)
		return result;
	};

	ClipperLib.Clipper.prototype.BuildResult = function (polyg)
	{
		ClipperLib.Clear(polyg);
		for (var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++)
		{
			var outRec = this.m_PolyOuts[i];
			if (outRec.Pts === null)
				continue;
			var p = outRec.Pts.Prev;
			var cnt = this.PointCount(p);
			if (cnt < 2)
				continue;
			var pg = new Array(cnt);
			for (var j = 0; j < cnt; j++)
			{
				pg[j] = p.Pt;
				p = p.Prev;
			}
			polyg.push(pg);
		}
	};

	ClipperLib.Clipper.prototype.BuildResult2 = function (polytree)
	{
		polytree.Clear();
		//add each output polygon/contour to polytree ...
		//polytree.m_AllPolys.set_Capacity(this.m_PolyOuts.length);
		for (var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++)
		{
			var outRec = this.m_PolyOuts[i];
			var cnt = this.PointCount(outRec.Pts);
			if ((outRec.IsOpen && cnt < 2) || (!outRec.IsOpen && cnt < 3))
				continue;
			this.FixHoleLinkage(outRec);
			var pn = new ClipperLib.PolyNode();
			polytree.m_AllPolys.push(pn);
			outRec.PolyNode = pn;
			pn.m_polygon.length = cnt;
			var op = outRec.Pts.Prev;
			for (var j = 0; j < cnt; j++)
			{
				pn.m_polygon[j] = op.Pt;
				op = op.Prev;
			}
		}
		//fixup PolyNode links etc ...
		//polytree.m_Childs.set_Capacity(this.m_PolyOuts.length);
		for (var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++)
		{
			var outRec = this.m_PolyOuts[i];
			if (outRec.PolyNode === null)
				continue;
			else if (outRec.IsOpen)
			{
				outRec.PolyNode.IsOpen = true;
				polytree.AddChild(outRec.PolyNode);
			}
			else if (outRec.FirstLeft !== null && outRec.FirstLeft.PolyNode !== null)
				outRec.FirstLeft.PolyNode.AddChild(outRec.PolyNode);
			else
				polytree.AddChild(outRec.PolyNode);
		}
	};

	ClipperLib.Clipper.prototype.FixupOutPolyline = function (outRec)
	{
		var pp = outRec.Pts;
		var lastPP = pp.Prev;
		while (pp !== lastPP)
		{
			pp = pp.Next;
			if (ClipperLib.IntPoint.op_Equality(pp.Pt, pp.Prev.Pt))
			{
				if (pp === lastPP)
				{
					lastPP = pp.Prev;
				}
				var tmpPP = pp.Prev;
				tmpPP.Next = pp.Next;
				pp.Next.Prev = tmpPP;
				pp = tmpPP;
			}
		}
		if (pp === pp.Prev)
		{
			outRec.Pts = null;
		}
	};

	ClipperLib.Clipper.prototype.FixupOutPolygon = function (outRec)
	{
		//FixupOutPolygon() - removes duplicate points and simplifies consecutive
		//parallel edges by removing the middle vertex.
		var lastOK = null;
		outRec.BottomPt = null;
		var pp = outRec.Pts;
		var preserveCol = this.PreserveCollinear || this.StrictlySimple;
		for (;;)
		{
			if (pp.Prev === pp || pp.Prev === pp.Next)
			{
				outRec.Pts = null;
				return;
			}

			//test for duplicate points and collinear edges ...
			if ((ClipperLib.IntPoint.op_Equality(pp.Pt, pp.Next.Pt)) || (ClipperLib.IntPoint.op_Equality(pp.Pt, pp.Prev.Pt)) || (ClipperLib.ClipperBase.SlopesEqual4(pp.Prev.Pt, pp.Pt, pp.Next.Pt, this.m_UseFullRange) && (!preserveCol || !this.Pt2IsBetweenPt1AndPt3(pp.Prev.Pt, pp.Pt, pp.Next.Pt))))
			{
				lastOK = null;
				pp.Prev.Next = pp.Next;
				pp.Next.Prev = pp.Prev;
				pp = pp.Prev;
			}
			else if (pp === lastOK)
				break;
			else
			{
				if (lastOK === null)
					lastOK = pp;
				pp = pp.Next;
			}
		}
		outRec.Pts = pp;
	};

	ClipperLib.Clipper.prototype.DupOutPt = function (outPt, InsertAfter)
	{
		var result = new ClipperLib.OutPt();
		//result.Pt = outPt.Pt;
		result.Pt.X = outPt.Pt.X;
		result.Pt.Y = outPt.Pt.Y;
		if (ClipperLib.use_xyz) result.Pt.Z = outPt.Pt.Z;
		result.Idx = outPt.Idx;
		if (InsertAfter)
		{
			result.Next = outPt.Next;
			result.Prev = outPt;
			outPt.Next.Prev = result;
			outPt.Next = result;
		}
		else
		{
			result.Prev = outPt.Prev;
			result.Next = outPt;
			outPt.Prev.Next = result;
			outPt.Prev = result;
		}
		return result;
	};

	ClipperLib.Clipper.prototype.GetOverlap = function (a1, a2, b1, b2, $val)
	{
		if (a1 < a2)
		{
			if (b1 < b2)
			{
				$val.Left = Math.max(a1, b1);
				$val.Right = Math.min(a2, b2);
			}
			else
			{
				$val.Left = Math.max(a1, b2);
				$val.Right = Math.min(a2, b1);
			}
		}
		else
		{
			if (b1 < b2)
			{
				$val.Left = Math.max(a2, b1);
				$val.Right = Math.min(a1, b2);
			}
			else
			{
				$val.Left = Math.max(a2, b2);
				$val.Right = Math.min(a1, b1);
			}
		}
		return $val.Left < $val.Right;
	};

	ClipperLib.Clipper.prototype.JoinHorz = function (op1, op1b, op2, op2b, Pt, DiscardLeft)
	{
		var Dir1 = (op1.Pt.X > op1b.Pt.X ? ClipperLib.Direction.dRightToLeft : ClipperLib.Direction.dLeftToRight);
		var Dir2 = (op2.Pt.X > op2b.Pt.X ? ClipperLib.Direction.dRightToLeft : ClipperLib.Direction.dLeftToRight);
		if (Dir1 === Dir2)
			return false;
		//When DiscardLeft, we want Op1b to be on the Left of Op1, otherwise we
		//want Op1b to be on the Right. (And likewise with Op2 and Op2b.)
		//So, to facilitate this while inserting Op1b and Op2b ...
		//when DiscardLeft, make sure we're AT or RIGHT of Pt before adding Op1b,
		//otherwise make sure we're AT or LEFT of Pt. (Likewise with Op2b.)
		if (Dir1 === ClipperLib.Direction.dLeftToRight)
		{
			while (op1.Next.Pt.X <= Pt.X &&
				op1.Next.Pt.X >= op1.Pt.X && op1.Next.Pt.Y === Pt.Y)
				op1 = op1.Next;
			if (DiscardLeft && (op1.Pt.X !== Pt.X))
				op1 = op1.Next;
			op1b = this.DupOutPt(op1, !DiscardLeft);
			if (ClipperLib.IntPoint.op_Inequality(op1b.Pt, Pt))
			{
				op1 = op1b;
				//op1.Pt = Pt;
				op1.Pt.X = Pt.X;
				op1.Pt.Y = Pt.Y;
				if (ClipperLib.use_xyz) op1.Pt.Z = Pt.Z;
				op1b = this.DupOutPt(op1, !DiscardLeft);
			}
		}
		else
		{
			while (op1.Next.Pt.X >= Pt.X &&
				op1.Next.Pt.X <= op1.Pt.X && op1.Next.Pt.Y === Pt.Y)
				op1 = op1.Next;
			if (!DiscardLeft && (op1.Pt.X !== Pt.X))
				op1 = op1.Next;
			op1b = this.DupOutPt(op1, DiscardLeft);
			if (ClipperLib.IntPoint.op_Inequality(op1b.Pt, Pt))
			{
				op1 = op1b;
				//op1.Pt = Pt;
				op1.Pt.X = Pt.X;
				op1.Pt.Y = Pt.Y;
				if (ClipperLib.use_xyz) op1.Pt.Z = Pt.Z;
				op1b = this.DupOutPt(op1, DiscardLeft);
			}
		}
		if (Dir2 === ClipperLib.Direction.dLeftToRight)
		{
			while (op2.Next.Pt.X <= Pt.X &&
				op2.Next.Pt.X >= op2.Pt.X && op2.Next.Pt.Y === Pt.Y)
				op2 = op2.Next;
			if (DiscardLeft && (op2.Pt.X !== Pt.X))
				op2 = op2.Next;
			op2b = this.DupOutPt(op2, !DiscardLeft);
			if (ClipperLib.IntPoint.op_Inequality(op2b.Pt, Pt))
			{
				op2 = op2b;
				//op2.Pt = Pt;
				op2.Pt.X = Pt.X;
				op2.Pt.Y = Pt.Y;
				if (ClipperLib.use_xyz) op2.Pt.Z = Pt.Z;
				op2b = this.DupOutPt(op2, !DiscardLeft);
			}
		}
		else
		{
			while (op2.Next.Pt.X >= Pt.X &&
				op2.Next.Pt.X <= op2.Pt.X && op2.Next.Pt.Y === Pt.Y)
				op2 = op2.Next;
			if (!DiscardLeft && (op2.Pt.X !== Pt.X))
				op2 = op2.Next;
			op2b = this.DupOutPt(op2, DiscardLeft);
			if (ClipperLib.IntPoint.op_Inequality(op2b.Pt, Pt))
			{
				op2 = op2b;
				//op2.Pt = Pt;
				op2.Pt.X = Pt.X;
				op2.Pt.Y = Pt.Y;
				if (ClipperLib.use_xyz) op2.Pt.Z = Pt.Z;
				op2b = this.DupOutPt(op2, DiscardLeft);
			}
		}
		if ((Dir1 === ClipperLib.Direction.dLeftToRight) === DiscardLeft)
		{
			op1.Prev = op2;
			op2.Next = op1;
			op1b.Next = op2b;
			op2b.Prev = op1b;
		}
		else
		{
			op1.Next = op2;
			op2.Prev = op1;
			op1b.Prev = op2b;
			op2b.Next = op1b;
		}
		return true;
	};

	ClipperLib.Clipper.prototype.JoinPoints = function (j, outRec1, outRec2)
	{
		var op1 = j.OutPt1,
			op1b = new ClipperLib.OutPt();
		var op2 = j.OutPt2,
			op2b = new ClipperLib.OutPt();
		//There are 3 kinds of joins for output polygons ...
		//1. Horizontal joins where Join.OutPt1 & Join.OutPt2 are vertices anywhere
		//along (horizontal) collinear edges (& Join.OffPt is on the same horizontal).
		//2. Non-horizontal joins where Join.OutPt1 & Join.OutPt2 are at the same
		//location at the Bottom of the overlapping segment (& Join.OffPt is above).
		//3. StrictlySimple joins where edges touch but are not collinear and where
		//Join.OutPt1, Join.OutPt2 & Join.OffPt all share the same point.
		var isHorizontal = (j.OutPt1.Pt.Y === j.OffPt.Y);
		if (isHorizontal && (ClipperLib.IntPoint.op_Equality(j.OffPt, j.OutPt1.Pt)) && (ClipperLib.IntPoint.op_Equality(j.OffPt, j.OutPt2.Pt)))
		{
			//Strictly Simple join ...
			if (outRec1 !== outRec2) return false;

			op1b = j.OutPt1.Next;
			while (op1b !== op1 && (ClipperLib.IntPoint.op_Equality(op1b.Pt, j.OffPt)))
				op1b = op1b.Next;
			var reverse1 = (op1b.Pt.Y > j.OffPt.Y);
			op2b = j.OutPt2.Next;
			while (op2b !== op2 && (ClipperLib.IntPoint.op_Equality(op2b.Pt, j.OffPt)))
				op2b = op2b.Next;
			var reverse2 = (op2b.Pt.Y > j.OffPt.Y);
			if (reverse1 === reverse2)
				return false;
			if (reverse1)
			{
				op1b = this.DupOutPt(op1, false);
				op2b = this.DupOutPt(op2, true);
				op1.Prev = op2;
				op2.Next = op1;
				op1b.Next = op2b;
				op2b.Prev = op1b;
				j.OutPt1 = op1;
				j.OutPt2 = op1b;
				return true;
			}
			else
			{
				op1b = this.DupOutPt(op1, true);
				op2b = this.DupOutPt(op2, false);
				op1.Next = op2;
				op2.Prev = op1;
				op1b.Prev = op2b;
				op2b.Next = op1b;
				j.OutPt1 = op1;
				j.OutPt2 = op1b;
				return true;
			}
		}
		else if (isHorizontal)
		{
			//treat horizontal joins differently to non-horizontal joins since with
			//them we're not yet sure where the overlapping is. OutPt1.Pt & OutPt2.Pt
			//may be anywhere along the horizontal edge.
			op1b = op1;
			while (op1.Prev.Pt.Y === op1.Pt.Y && op1.Prev !== op1b && op1.Prev !== op2)
				op1 = op1.Prev;
			while (op1b.Next.Pt.Y === op1b.Pt.Y && op1b.Next !== op1 && op1b.Next !== op2)
				op1b = op1b.Next;
			if (op1b.Next === op1 || op1b.Next === op2)
				return false;
			//a flat 'polygon'
			op2b = op2;
			while (op2.Prev.Pt.Y === op2.Pt.Y && op2.Prev !== op2b && op2.Prev !== op1b)
				op2 = op2.Prev;
			while (op2b.Next.Pt.Y === op2b.Pt.Y && op2b.Next !== op2 && op2b.Next !== op1)
				op2b = op2b.Next;
			if (op2b.Next === op2 || op2b.Next === op1)
				return false;
			//a flat 'polygon'
			//Op1 -. Op1b & Op2 -. Op2b are the extremites of the horizontal edges

			var $val = {
				Left: null,
				Right: null
			};

			if (!this.GetOverlap(op1.Pt.X, op1b.Pt.X, op2.Pt.X, op2b.Pt.X, $val))
				return false;
			var Left = $val.Left;
			var Right = $val.Right;

			//DiscardLeftSide: when overlapping edges are joined, a spike will created
			//which needs to be cleaned up. However, we don't want Op1 or Op2 caught up
			//on the discard Side as either may still be needed for other joins ...
			var Pt = new ClipperLib.IntPoint0();
			var DiscardLeftSide;
			if (op1.Pt.X >= Left && op1.Pt.X <= Right)
			{
				//Pt = op1.Pt;
				Pt.X = op1.Pt.X;
				Pt.Y = op1.Pt.Y;
				if (ClipperLib.use_xyz) Pt.Z = op1.Pt.Z;
				DiscardLeftSide = (op1.Pt.X > op1b.Pt.X);
			}
			else if (op2.Pt.X >= Left && op2.Pt.X <= Right)
			{
				//Pt = op2.Pt;
				Pt.X = op2.Pt.X;
				Pt.Y = op2.Pt.Y;
				if (ClipperLib.use_xyz) Pt.Z = op2.Pt.Z;
				DiscardLeftSide = (op2.Pt.X > op2b.Pt.X);
			}
			else if (op1b.Pt.X >= Left && op1b.Pt.X <= Right)
			{
				//Pt = op1b.Pt;
				Pt.X = op1b.Pt.X;
				Pt.Y = op1b.Pt.Y;
				if (ClipperLib.use_xyz) Pt.Z = op1b.Pt.Z;
				DiscardLeftSide = op1b.Pt.X > op1.Pt.X;
			}
			else
			{
				//Pt = op2b.Pt;
				Pt.X = op2b.Pt.X;
				Pt.Y = op2b.Pt.Y;
				if (ClipperLib.use_xyz) Pt.Z = op2b.Pt.Z;
				DiscardLeftSide = (op2b.Pt.X > op2.Pt.X);
			}
			j.OutPt1 = op1;
			j.OutPt2 = op2;
			return this.JoinHorz(op1, op1b, op2, op2b, Pt, DiscardLeftSide);
		}
		else
		{
			//nb: For non-horizontal joins ...
			//    1. Jr.OutPt1.Pt.Y == Jr.OutPt2.Pt.Y
			//    2. Jr.OutPt1.Pt > Jr.OffPt.Y
			//make sure the polygons are correctly oriented ...
			op1b = op1.Next;
			while ((ClipperLib.IntPoint.op_Equality(op1b.Pt, op1.Pt)) && (op1b !== op1))
				op1b = op1b.Next;
			var Reverse1 = ((op1b.Pt.Y > op1.Pt.Y) || !ClipperLib.ClipperBase.SlopesEqual4(op1.Pt, op1b.Pt, j.OffPt, this.m_UseFullRange));
			if (Reverse1)
			{
				op1b = op1.Prev;
				while ((ClipperLib.IntPoint.op_Equality(op1b.Pt, op1.Pt)) && (op1b !== op1))
					op1b = op1b.Prev;

				if ((op1b.Pt.Y > op1.Pt.Y) || !ClipperLib.ClipperBase.SlopesEqual4(op1.Pt, op1b.Pt, j.OffPt, this.m_UseFullRange))
					return false;
			}
			op2b = op2.Next;
			while ((ClipperLib.IntPoint.op_Equality(op2b.Pt, op2.Pt)) && (op2b !== op2))
				op2b = op2b.Next;

			var Reverse2 = ((op2b.Pt.Y > op2.Pt.Y) || !ClipperLib.ClipperBase.SlopesEqual4(op2.Pt, op2b.Pt, j.OffPt, this.m_UseFullRange));
			if (Reverse2)
			{
				op2b = op2.Prev;
				while ((ClipperLib.IntPoint.op_Equality(op2b.Pt, op2.Pt)) && (op2b !== op2))
					op2b = op2b.Prev;

				if ((op2b.Pt.Y > op2.Pt.Y) || !ClipperLib.ClipperBase.SlopesEqual4(op2.Pt, op2b.Pt, j.OffPt, this.m_UseFullRange))
					return false;
			}
			if ((op1b === op1) || (op2b === op2) || (op1b === op2b) ||
				((outRec1 === outRec2) && (Reverse1 === Reverse2)))
				return false;
			if (Reverse1)
			{
				op1b = this.DupOutPt(op1, false);
				op2b = this.DupOutPt(op2, true);
				op1.Prev = op2;
				op2.Next = op1;
				op1b.Next = op2b;
				op2b.Prev = op1b;
				j.OutPt1 = op1;
				j.OutPt2 = op1b;
				return true;
			}
			else
			{
				op1b = this.DupOutPt(op1, true);
				op2b = this.DupOutPt(op2, false);
				op1.Next = op2;
				op2.Prev = op1;
				op1b.Prev = op2b;
				op2b.Next = op1b;
				j.OutPt1 = op1;
				j.OutPt2 = op1b;
				return true;
			}
		}
	};

	ClipperLib.Clipper.GetBounds = function (paths)
	{
		var i = 0,
			cnt = paths.length;
		while (i < cnt && paths[i].length === 0) i++;
		if (i === cnt) return new ClipperLib.IntRect(0, 0, 0, 0);
		var result = new ClipperLib.IntRect();
		result.left = paths[i][0].X;
		result.right = result.left;
		result.top = paths[i][0].Y;
		result.bottom = result.top;
		for (; i < cnt; i++)
			for (var j = 0, jlen = paths[i].length; j < jlen; j++)
			{
				if (paths[i][j].X < result.left) result.left = paths[i][j].X;
				else if (paths[i][j].X > result.right) result.right = paths[i][j].X;
				if (paths[i][j].Y < result.top) result.top = paths[i][j].Y;
				else if (paths[i][j].Y > result.bottom) result.bottom = paths[i][j].Y;
			}
		return result;
	}
	ClipperLib.Clipper.prototype.GetBounds2 = function (ops)
	{
		var opStart = ops;
		var result = new ClipperLib.IntRect();
		result.left = ops.Pt.X;
		result.right = ops.Pt.X;
		result.top = ops.Pt.Y;
		result.bottom = ops.Pt.Y;
		ops = ops.Next;
		while (ops !== opStart)
		{
			if (ops.Pt.X < result.left)
				result.left = ops.Pt.X;
			if (ops.Pt.X > result.right)
				result.right = ops.Pt.X;
			if (ops.Pt.Y < result.top)
				result.top = ops.Pt.Y;
			if (ops.Pt.Y > result.bottom)
				result.bottom = ops.Pt.Y;
			ops = ops.Next;
		}
		return result;
	};

	ClipperLib.Clipper.PointInPolygon = function (pt, path)
	{
		//returns 0 if false, +1 if true, -1 if pt ON polygon boundary
		//See "The Point in Polygon Problem for Arbitrary Polygons" by Hormann & Agathos
		//http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.88.5498&rep=rep1&type=pdf
		var result = 0,
			cnt = path.length;
		if (cnt < 3)
			return 0;
		var ip = path[0];
		for (var i = 1; i <= cnt; ++i)
		{
			var ipNext = (i === cnt ? path[0] : path[i]);
			if (ipNext.Y === pt.Y)
			{
				if ((ipNext.X === pt.X) || (ip.Y === pt.Y && ((ipNext.X > pt.X) === (ip.X < pt.X))))
					return -1;
			}
			if ((ip.Y < pt.Y) !== (ipNext.Y < pt.Y))
			{
				if (ip.X >= pt.X)
				{
					if (ipNext.X > pt.X)
						result = 1 - result;
					else
					{
						var d = (ip.X - pt.X) * (ipNext.Y - pt.Y) - (ipNext.X - pt.X) * (ip.Y - pt.Y);
						if (d === 0)
							return -1;
						else if ((d > 0) === (ipNext.Y > ip.Y))
							result = 1 - result;
					}
				}
				else
				{
					if (ipNext.X > pt.X)
					{
						var d = (ip.X - pt.X) * (ipNext.Y - pt.Y) - (ipNext.X - pt.X) * (ip.Y - pt.Y);
						if (d === 0)
							return -1;
						else if ((d > 0) === (ipNext.Y > ip.Y))
							result = 1 - result;
					}
				}
			}
			ip = ipNext;
		}
		return result;
	};

	ClipperLib.Clipper.prototype.PointInPolygon = function (pt, op)
	{
		//returns 0 if false, +1 if true, -1 if pt ON polygon boundary
		var result = 0;
		var startOp = op;
		var ptx = pt.X,
			pty = pt.Y;
		var poly0x = op.Pt.X,
			poly0y = op.Pt.Y;
		do {
			op = op.Next;
			var poly1x = op.Pt.X,
				poly1y = op.Pt.Y;
			if (poly1y === pty)
			{
				if ((poly1x === ptx) || (poly0y === pty && ((poly1x > ptx) === (poly0x < ptx))))
					return -1;
			}
			if ((poly0y < pty) !== (poly1y < pty))
			{
				if (poly0x >= ptx)
				{
					if (poly1x > ptx)
						result = 1 - result;
					else
					{
						var d = (poly0x - ptx) * (poly1y - pty) - (poly1x - ptx) * (poly0y - pty);
						if (d === 0)
							return -1;
						if ((d > 0) === (poly1y > poly0y))
							result = 1 - result;
					}
				}
				else
				{
					if (poly1x > ptx)
					{
						var d = (poly0x - ptx) * (poly1y - pty) - (poly1x - ptx) * (poly0y - pty);
						if (d === 0)
							return -1;
						if ((d > 0) === (poly1y > poly0y))
							result = 1 - result;
					}
				}
			}
			poly0x = poly1x;
			poly0y = poly1y;
		} while (startOp !== op);

		return result;
	};

	ClipperLib.Clipper.prototype.Poly2ContainsPoly1 = function (outPt1, outPt2)
	{
		var op = outPt1;
		do {
			//nb: PointInPolygon returns 0 if false, +1 if true, -1 if pt on polygon
			var res = this.PointInPolygon(op.Pt, outPt2);
			if (res >= 0)
				return res > 0;
			op = op.Next;
		}
		while (op !== outPt1)
		return true;
	};

	ClipperLib.Clipper.prototype.FixupFirstLefts1 = function (OldOutRec, NewOutRec)
	{
		var outRec, firstLeft;
		for (var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++)
		{
			outRec = this.m_PolyOuts[i];
			firstLeft = ClipperLib.Clipper.ParseFirstLeft(outRec.FirstLeft);
			if (outRec.Pts !== null && firstLeft === OldOutRec)
			{
				if (this.Poly2ContainsPoly1(outRec.Pts, NewOutRec.Pts))
					outRec.FirstLeft = NewOutRec;
			}
		}
	}

	ClipperLib.Clipper.prototype.FixupFirstLefts2 = function (innerOutRec, outerOutRec)
	{
		//A polygon has split into two such that one is now the inner of the other.
		//It's possible that these polygons now wrap around other polygons, so check
		//every polygon that's also contained by OuterOutRec's FirstLeft container
		//(including nil) to see if they've become inner to the new inner polygon ...
		var orfl = outerOutRec.FirstLeft;
		var outRec, firstLeft;
		for (var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++)
		{
			outRec = this.m_PolyOuts[i];
			if (outRec.Pts === null || outRec === outerOutRec || outRec === innerOutRec)
				continue;
			firstLeft = ClipperLib.Clipper.ParseFirstLeft(outRec.FirstLeft);
			if (firstLeft !== orfl && firstLeft !== innerOutRec && firstLeft !== outerOutRec)
				continue;
			if (this.Poly2ContainsPoly1(outRec.Pts, innerOutRec.Pts))
				outRec.FirstLeft = innerOutRec;
			else if (this.Poly2ContainsPoly1(outRec.Pts, outerOutRec.Pts))
				outRec.FirstLeft = outerOutRec;
			else if (outRec.FirstLeft === innerOutRec || outRec.FirstLeft === outerOutRec)
				outRec.FirstLeft = orfl;
		}
	}

	ClipperLib.Clipper.prototype.FixupFirstLefts3 = function (OldOutRec, NewOutRec)
	{
		//same as FixupFirstLefts1 but doesn't call Poly2ContainsPoly1()
		var outRec;
		var firstLeft;
		for (var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++)
		{
			outRec = this.m_PolyOuts[i];
			firstLeft = ClipperLib.Clipper.ParseFirstLeft(outRec.FirstLeft);
			if (outRec.Pts !== null && firstLeft === OldOutRec)
				outRec.FirstLeft = NewOutRec;
		}
	}

	ClipperLib.Clipper.ParseFirstLeft = function (FirstLeft)
	{
		while (FirstLeft !== null && FirstLeft.Pts === null)
			FirstLeft = FirstLeft.FirstLeft;
		return FirstLeft;
	};

	ClipperLib.Clipper.prototype.JoinCommonEdges = function ()
	{
		for (var i = 0, ilen = this.m_Joins.length; i < ilen; i++)
		{
			var join = this.m_Joins[i];
			var outRec1 = this.GetOutRec(join.OutPt1.Idx);
			var outRec2 = this.GetOutRec(join.OutPt2.Idx);
			if (outRec1.Pts === null || outRec2.Pts === null)
				continue;

			if (outRec1.IsOpen || outRec2.IsOpen)
			{
				continue;
			}

			//get the polygon fragment with the correct hole state (FirstLeft)
			//before calling JoinPoints() ...
			var holeStateRec;
			if (outRec1 === outRec2)
				holeStateRec = outRec1;
			else if (this.OutRec1RightOfOutRec2(outRec1, outRec2))
				holeStateRec = outRec2;
			else if (this.OutRec1RightOfOutRec2(outRec2, outRec1))
				holeStateRec = outRec1;
			else
				holeStateRec = this.GetLowermostRec(outRec1, outRec2);

			if (!this.JoinPoints(join, outRec1, outRec2)) continue;

			if (outRec1 === outRec2)
			{
				//instead of joining two polygons, we've just created a new one by
				//splitting one polygon into two.
				outRec1.Pts = join.OutPt1;
				outRec1.BottomPt = null;
				outRec2 = this.CreateOutRec();
				outRec2.Pts = join.OutPt2;
				//update all OutRec2.Pts Idx's ...
				this.UpdateOutPtIdxs(outRec2);

				if (this.Poly2ContainsPoly1(outRec2.Pts, outRec1.Pts))
				{
					//outRec1 contains outRec2 ...
					outRec2.IsHole = !outRec1.IsHole;
					outRec2.FirstLeft = outRec1;
					if (this.m_UsingPolyTree)
						this.FixupFirstLefts2(outRec2, outRec1);
					if ((outRec2.IsHole ^ this.ReverseSolution) == (this.Area$1(outRec2) > 0))
						this.ReversePolyPtLinks(outRec2.Pts);
				}
				else if (this.Poly2ContainsPoly1(outRec1.Pts, outRec2.Pts))
				{
					//outRec2 contains outRec1 ...
					outRec2.IsHole = outRec1.IsHole;
					outRec1.IsHole = !outRec2.IsHole;
					outRec2.FirstLeft = outRec1.FirstLeft;
					outRec1.FirstLeft = outRec2;
					if (this.m_UsingPolyTree)
						this.FixupFirstLefts2(outRec1, outRec2);

					if ((outRec1.IsHole ^ this.ReverseSolution) == (this.Area$1(outRec1) > 0))
						this.ReversePolyPtLinks(outRec1.Pts);
				}
				else
				{
					//the 2 polygons are completely separate ...
					outRec2.IsHole = outRec1.IsHole;
					outRec2.FirstLeft = outRec1.FirstLeft;
					//fixup FirstLeft pointers that may need reassigning to OutRec2
					if (this.m_UsingPolyTree)
						this.FixupFirstLefts1(outRec1, outRec2);
				}
			}
			else
			{
				//joined 2 polygons together ...
				outRec2.Pts = null;
				outRec2.BottomPt = null;
				outRec2.Idx = outRec1.Idx;
				outRec1.IsHole = holeStateRec.IsHole;
				if (holeStateRec === outRec2)
					outRec1.FirstLeft = outRec2.FirstLeft;
				outRec2.FirstLeft = outRec1;
				//fixup FirstLeft pointers that may need reassigning to OutRec1
				if (this.m_UsingPolyTree)
					this.FixupFirstLefts3(outRec2, outRec1);
			}
		}
	};

	ClipperLib.Clipper.prototype.UpdateOutPtIdxs = function (outrec)
	{
		var op = outrec.Pts;
		do {
			op.Idx = outrec.Idx;
			op = op.Prev;
		}
		while (op !== outrec.Pts)
	};

	ClipperLib.Clipper.prototype.DoSimplePolygons = function ()
	{
		var i = 0;
		while (i < this.m_PolyOuts.length)
		{
			var outrec = this.m_PolyOuts[i++];
			var op = outrec.Pts;
			if (op === null || outrec.IsOpen)
				continue;
			do //for each Pt in Polygon until duplicate found do ...
			{
				var op2 = op.Next;
				while (op2 !== outrec.Pts)
				{
					if ((ClipperLib.IntPoint.op_Equality(op.Pt, op2.Pt)) && op2.Next !== op && op2.Prev !== op)
					{
						//split the polygon into two ...
						var op3 = op.Prev;
						var op4 = op2.Prev;
						op.Prev = op4;
						op4.Next = op;
						op2.Prev = op3;
						op3.Next = op2;
						outrec.Pts = op;
						var outrec2 = this.CreateOutRec();
						outrec2.Pts = op2;
						this.UpdateOutPtIdxs(outrec2);
						if (this.Poly2ContainsPoly1(outrec2.Pts, outrec.Pts))
						{
							//OutRec2 is contained by OutRec1 ...
							outrec2.IsHole = !outrec.IsHole;
							outrec2.FirstLeft = outrec;
							if (this.m_UsingPolyTree) this.FixupFirstLefts2(outrec2, outrec);

						}
						else if (this.Poly2ContainsPoly1(outrec.Pts, outrec2.Pts))
						{
							//OutRec1 is contained by OutRec2 ...
							outrec2.IsHole = outrec.IsHole;
							outrec.IsHole = !outrec2.IsHole;
							outrec2.FirstLeft = outrec.FirstLeft;
							outrec.FirstLeft = outrec2;
							if (this.m_UsingPolyTree) this.FixupFirstLefts2(outrec, outrec2);
						}
						else
						{
							//the 2 polygons are separate ...
							outrec2.IsHole = outrec.IsHole;
							outrec2.FirstLeft = outrec.FirstLeft;
							if (this.m_UsingPolyTree) this.FixupFirstLefts1(outrec, outrec2);
						}
						op2 = op;
						//ie get ready for the next iteration
					}
					op2 = op2.Next;
				}
				op = op.Next;
			}
			while (op !== outrec.Pts)
		}
	};

	ClipperLib.Clipper.Area = function (poly)
	{
		if (!Array.isArray(poly))
			return 0;
		var cnt = poly.length;
		if (cnt < 3)
			return 0;
		var a = 0;
		for (var i = 0, j = cnt - 1; i < cnt; ++i)
		{
			a += (poly[j].X + poly[i].X) * (poly[j].Y - poly[i].Y);
			j = i;
		}
		return -a * 0.5;
	};

	ClipperLib.Clipper.prototype.Area = function (op)
	{
		var opFirst = op;
		if (op === null) return 0;
		var a = 0;
		do {
			a = a + (op.Prev.Pt.X + op.Pt.X) * (op.Prev.Pt.Y - op.Pt.Y);
			op = op.Next;
		} while (op !== opFirst); // && typeof op !== 'undefined');
		return a * 0.5;
	}

	ClipperLib.Clipper.prototype.Area$1 = function (outRec)
	{
		return this.Area(outRec.Pts);
	};

	ClipperLib.Clipper.SimplifyPolygon = function (poly, fillType)
	{
		var result = new Array();
		var c = new ClipperLib.Clipper(0);
		c.StrictlySimple = true;
		c.AddPath(poly, ClipperLib.PolyType.ptSubject, true);
		c.Execute(ClipperLib.ClipType.ctUnion, result, fillType, fillType);
		return result;
	};

	ClipperLib.Clipper.SimplifyPolygons = function (polys, fillType)
	{
		if (typeof (fillType) === "undefined") fillType = ClipperLib.PolyFillType.pftEvenOdd;
		var result = new Array();
		var c = new ClipperLib.Clipper(0);
		c.StrictlySimple = true;
		c.AddPaths(polys, ClipperLib.PolyType.ptSubject, true);
		c.Execute(ClipperLib.ClipType.ctUnion, result, fillType, fillType);
		return result;
	};

	ClipperLib.Clipper.DistanceSqrd = function (pt1, pt2)
	{
		var dx = (pt1.X - pt2.X);
		var dy = (pt1.Y - pt2.Y);
		return (dx * dx + dy * dy);
	};

	ClipperLib.Clipper.DistanceFromLineSqrd = function (pt, ln1, ln2)
	{
		//The equation of a line in general form (Ax + By + C = 0)
		//given 2 points (x¹,y¹) & (x²,y²) is ...
		//(y¹ - y²)x + (x² - x¹)y + (y² - y¹)x¹ - (x² - x¹)y¹ = 0
		//A = (y¹ - y²); B = (x² - x¹); C = (y² - y¹)x¹ - (x² - x¹)y¹
		//perpendicular distance of point (x³,y³) = (Ax³ + By³ + C)/Sqrt(A² + B²)
		//see http://en.wikipedia.org/wiki/Perpendicular_distance
		var A = ln1.Y - ln2.Y;
		var B = ln2.X - ln1.X;
		var C = A * ln1.X + B * ln1.Y;
		C = A * pt.X + B * pt.Y - C;
		return (C * C) / (A * A + B * B);
	};

	ClipperLib.Clipper.SlopesNearCollinear = function (pt1, pt2, pt3, distSqrd)
	{
		//this function is more accurate when the point that's GEOMETRICALLY
		//between the other 2 points is the one that's tested for distance.
		//nb: with 'spikes', either pt1 or pt3 is geometrically between the other pts
		if (Math.abs(pt1.X - pt2.X) > Math.abs(pt1.Y - pt2.Y))
		{
			if ((pt1.X > pt2.X) === (pt1.X < pt3.X))
				return ClipperLib.Clipper.DistanceFromLineSqrd(pt1, pt2, pt3) < distSqrd;
			else if ((pt2.X > pt1.X) === (pt2.X < pt3.X))
				return ClipperLib.Clipper.DistanceFromLineSqrd(pt2, pt1, pt3) < distSqrd;
			else
				return ClipperLib.Clipper.DistanceFromLineSqrd(pt3, pt1, pt2) < distSqrd;
		}
		else
		{
			if ((pt1.Y > pt2.Y) === (pt1.Y < pt3.Y))
				return ClipperLib.Clipper.DistanceFromLineSqrd(pt1, pt2, pt3) < distSqrd;
			else if ((pt2.Y > pt1.Y) === (pt2.Y < pt3.Y))
				return ClipperLib.Clipper.DistanceFromLineSqrd(pt2, pt1, pt3) < distSqrd;
			else
				return ClipperLib.Clipper.DistanceFromLineSqrd(pt3, pt1, pt2) < distSqrd;
		}
	}

	ClipperLib.Clipper.PointsAreClose = function (pt1, pt2, distSqrd)
	{
		var dx = pt1.X - pt2.X;
		var dy = pt1.Y - pt2.Y;
		return ((dx * dx) + (dy * dy) <= distSqrd);
	};

	ClipperLib.Clipper.ExcludeOp = function (op)
	{
		var result = op.Prev;
		result.Next = op.Next;
		op.Next.Prev = result;
		result.Idx = 0;
		return result;
	};

	ClipperLib.Clipper.CleanPolygon = function (path, distance)
	{
		if (typeof (distance) === "undefined") distance = 1.415;
		//distance = proximity in units/pixels below which vertices will be stripped.
		//Default ~= sqrt(2) so when adjacent vertices or semi-adjacent vertices have
		//both x & y coords within 1 unit, then the second vertex will be stripped.
		var cnt = path.length;
		if (cnt === 0)
			return new Array();
		var outPts = new Array(cnt);
		for (var i = 0; i < cnt; ++i)
			outPts[i] = new ClipperLib.OutPt();
		for (var i = 0; i < cnt; ++i)
		{
			outPts[i].Pt = path[i];
			outPts[i].Next = outPts[(i + 1) % cnt];
			outPts[i].Next.Prev = outPts[i];
			outPts[i].Idx = 0;
		}
		var distSqrd = distance * distance;
		var op = outPts[0];
		while (op.Idx === 0 && op.Next !== op.Prev)
		{
			if (ClipperLib.Clipper.PointsAreClose(op.Pt, op.Prev.Pt, distSqrd))
			{
				op = ClipperLib.Clipper.ExcludeOp(op);
				cnt--;
			}
			else if (ClipperLib.Clipper.PointsAreClose(op.Prev.Pt, op.Next.Pt, distSqrd))
			{
				ClipperLib.Clipper.ExcludeOp(op.Next);
				op = ClipperLib.Clipper.ExcludeOp(op);
				cnt -= 2;
			}
			else if (ClipperLib.Clipper.SlopesNearCollinear(op.Prev.Pt, op.Pt, op.Next.Pt, distSqrd))
			{
				op = ClipperLib.Clipper.ExcludeOp(op);
				cnt--;
			}
			else
			{
				op.Idx = 1;
				op = op.Next;
			}
		}
		if (cnt < 3)
			cnt = 0;
		var result = new Array(cnt);
		for (var i = 0; i < cnt; ++i)
		{
			result[i] = new ClipperLib.IntPoint1(op.Pt);
			op = op.Next;
		}
		outPts = null;
		return result;
	};

	ClipperLib.Clipper.CleanPolygons = function (polys, distance)
	{
		var result = new Array(polys.length);
		for (var i = 0, ilen = polys.length; i < ilen; i++)
			result[i] = ClipperLib.Clipper.CleanPolygon(polys[i], distance);
		return result;
	};

	ClipperLib.Clipper.Minkowski = function (pattern, path, IsSum, IsClosed)
	{
		var delta = (IsClosed ? 1 : 0);
		var polyCnt = pattern.length;
		var pathCnt = path.length;
		var result = new Array();
		if (IsSum)
			for (var i = 0; i < pathCnt; i++)
			{
				var p = new Array(polyCnt);
				for (var j = 0, jlen = pattern.length, ip = pattern[j]; j < jlen; j++, ip = pattern[j])
					p[j] = new ClipperLib.IntPoint2(path[i].X + ip.X, path[i].Y + ip.Y);
				result.push(p);
			}
		else
			for (var i = 0; i < pathCnt; i++)
			{
				var p = new Array(polyCnt);
				for (var j = 0, jlen = pattern.length, ip = pattern[j]; j < jlen; j++, ip = pattern[j])
					p[j] = new ClipperLib.IntPoint2(path[i].X - ip.X, path[i].Y - ip.Y);
				result.push(p);
			}
		var quads = new Array();
		for (var i = 0; i < pathCnt - 1 + delta; i++)
			for (var j = 0; j < polyCnt; j++)
			{
				var quad = new Array();
				quad.push(result[i % pathCnt][j % polyCnt]);
				quad.push(result[(i + 1) % pathCnt][j % polyCnt]);
				quad.push(result[(i + 1) % pathCnt][(j + 1) % polyCnt]);
				quad.push(result[i % pathCnt][(j + 1) % polyCnt]);
				if (!ClipperLib.Clipper.Orientation(quad))
					quad.reverse();
				quads.push(quad);
			}
		return quads;
	};

	ClipperLib.Clipper.MinkowskiSum = function (pattern, path_or_paths, pathIsClosed)
	{
		if (!(path_or_paths[0] instanceof Array))
		{
			var path = path_or_paths;
			var paths = ClipperLib.Clipper.Minkowski(pattern, path, true, pathIsClosed);
			var c = new ClipperLib.Clipper();
			c.AddPaths(paths, ClipperLib.PolyType.ptSubject, true);
			c.Execute(ClipperLib.ClipType.ctUnion, paths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
			return paths;
		}
		else
		{
			var paths = path_or_paths;
			var solution = new ClipperLib.Paths();
			var c = new ClipperLib.Clipper();
			for (var i = 0; i < paths.length; ++i)
			{
				var tmp = ClipperLib.Clipper.Minkowski(pattern, paths[i], true, pathIsClosed);
				c.AddPaths(tmp, ClipperLib.PolyType.ptSubject, true);
				if (pathIsClosed)
				{
					var path = ClipperLib.Clipper.TranslatePath(paths[i], pattern[0]);
					c.AddPath(path, ClipperLib.PolyType.ptClip, true);
				}
			}
			c.Execute(ClipperLib.ClipType.ctUnion, solution,
				ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
			return solution;
		}
	}

	ClipperLib.Clipper.TranslatePath = function (path, delta)
	{
		var outPath = new ClipperLib.Path();
		for (var i = 0; i < path.length; i++)
			outPath.push(new ClipperLib.IntPoint2(path[i].X + delta.X, path[i].Y + delta.Y));
		return outPath;
	}

	ClipperLib.Clipper.MinkowskiDiff = function (poly1, poly2)
	{
		var paths = ClipperLib.Clipper.Minkowski(poly1, poly2, false, true);
		var c = new ClipperLib.Clipper();
		c.AddPaths(paths, ClipperLib.PolyType.ptSubject, true);
		c.Execute(ClipperLib.ClipType.ctUnion, paths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
		return paths;
	}

	ClipperLib.Clipper.PolyTreeToPaths = function (polytree)
	{
		var result = new Array();
		//result.set_Capacity(polytree.get_Total());
		ClipperLib.Clipper.AddPolyNodeToPaths(polytree, ClipperLib.Clipper.NodeType.ntAny, result);
		return result;
	};

	ClipperLib.Clipper.AddPolyNodeToPaths = function (polynode, nt, paths)
	{
		var match = true;
		switch (nt)
		{
		case ClipperLib.Clipper.NodeType.ntOpen:
			return;
		case ClipperLib.Clipper.NodeType.ntClosed:
			match = !polynode.IsOpen;
			break;
		default:
			break;
		}
		if (polynode.m_polygon.length > 0 && match)
			paths.push(polynode.m_polygon);
		for (var $i3 = 0, $t3 = polynode.Childs(), $l3 = $t3.length, pn = $t3[$i3]; $i3 < $l3; $i3++, pn = $t3[$i3])
			ClipperLib.Clipper.AddPolyNodeToPaths(pn, nt, paths);
	};

	ClipperLib.Clipper.OpenPathsFromPolyTree = function (polytree)
	{
		var result = new ClipperLib.Paths();
		//result.set_Capacity(polytree.ChildCount());
		for (var i = 0, ilen = polytree.ChildCount(); i < ilen; i++)
			if (polytree.Childs()[i].IsOpen)
				result.push(polytree.Childs()[i].m_polygon);
		return result;
	};

	ClipperLib.Clipper.ClosedPathsFromPolyTree = function (polytree)
	{
		var result = new ClipperLib.Paths();
		//result.set_Capacity(polytree.Total());
		ClipperLib.Clipper.AddPolyNodeToPaths(polytree, ClipperLib.Clipper.NodeType.ntClosed, result);
		return result;
	};

	Inherit(ClipperLib.Clipper, ClipperLib.ClipperBase);
	ClipperLib.Clipper.NodeType = {
		ntAny: 0,
		ntOpen: 1,
		ntClosed: 2
	};

	/**
	* @constructor
	*/
	ClipperLib.ClipperOffset = function (miterLimit, arcTolerance)
	{
		if (typeof (miterLimit) === "undefined") miterLimit = 2;
		if (typeof (arcTolerance) === "undefined") arcTolerance = ClipperLib.ClipperOffset.def_arc_tolerance;
		this.m_destPolys = new ClipperLib.Paths();
		this.m_srcPoly = new ClipperLib.Path();
		this.m_destPoly = new ClipperLib.Path();
		this.m_normals = new Array();
		this.m_delta = 0;
		this.m_sinA = 0;
		this.m_sin = 0;
		this.m_cos = 0;
		this.m_miterLim = 0;
		this.m_StepsPerRad = 0;
		this.m_lowest = new ClipperLib.IntPoint0();
		this.m_polyNodes = new ClipperLib.PolyNode();
		this.MiterLimit = miterLimit;
		this.ArcTolerance = arcTolerance;
		this.m_lowest.X = -1;
	};

	ClipperLib.ClipperOffset.two_pi = 6.28318530717959;
	ClipperLib.ClipperOffset.def_arc_tolerance = 0.25;
	ClipperLib.ClipperOffset.prototype.Clear = function ()
	{
		ClipperLib.Clear(this.m_polyNodes.Childs());
		this.m_lowest.X = -1;
	};

	ClipperLib.ClipperOffset.Round = ClipperLib.Clipper.Round;
	ClipperLib.ClipperOffset.prototype.AddPath = function (path, joinType, endType)
	{
		var highI = path.length - 1;
		if (highI < 0)
			return;
		var newNode = new ClipperLib.PolyNode();
		newNode.m_jointype = joinType;
		newNode.m_endtype = endType;
		//strip duplicate points from path and also get index to the lowest point ...
		if (endType === ClipperLib.EndType.etClosedLine || endType === ClipperLib.EndType.etClosedPolygon)
			while (highI > 0 && ClipperLib.IntPoint.op_Equality(path[0], path[highI]))
				highI--;
		//newNode.m_polygon.set_Capacity(highI + 1);
		newNode.m_polygon.push(path[0]);
		var j = 0,
			k = 0;
		for (var i = 1; i <= highI; i++)
			if (ClipperLib.IntPoint.op_Inequality(newNode.m_polygon[j], path[i]))
			{
				j++;
				newNode.m_polygon.push(path[i]);
				if (path[i].Y > newNode.m_polygon[k].Y || (path[i].Y === newNode.m_polygon[k].Y && path[i].X < newNode.m_polygon[k].X))
					k = j;
			}
		if (endType === ClipperLib.EndType.etClosedPolygon && j < 2) return;

		this.m_polyNodes.AddChild(newNode);
		//if this path's lowest pt is lower than all the others then update m_lowest
		if (endType !== ClipperLib.EndType.etClosedPolygon)
			return;
		if (this.m_lowest.X < 0)
			this.m_lowest = new ClipperLib.IntPoint2(this.m_polyNodes.ChildCount() - 1, k);
		else
		{
			var ip = this.m_polyNodes.Childs()[this.m_lowest.X].m_polygon[this.m_lowest.Y];
			if (newNode.m_polygon[k].Y > ip.Y || (newNode.m_polygon[k].Y === ip.Y && newNode.m_polygon[k].X < ip.X))
				this.m_lowest = new ClipperLib.IntPoint2(this.m_polyNodes.ChildCount() - 1, k);
		}
	};

	ClipperLib.ClipperOffset.prototype.AddPaths = function (paths, joinType, endType)
	{
		for (var i = 0, ilen = paths.length; i < ilen; i++)
			this.AddPath(paths[i], joinType, endType);
	};

	ClipperLib.ClipperOffset.prototype.FixOrientations = function ()
	{
		//fixup orientations of all closed paths if the orientation of the
		//closed path with the lowermost vertex is wrong ...
		if (this.m_lowest.X >= 0 && !ClipperLib.Clipper.Orientation(this.m_polyNodes.Childs()[this.m_lowest.X].m_polygon))
		{
			for (var i = 0; i < this.m_polyNodes.ChildCount(); i++)
			{
				var node = this.m_polyNodes.Childs()[i];
				if (node.m_endtype === ClipperLib.EndType.etClosedPolygon || (node.m_endtype === ClipperLib.EndType.etClosedLine && ClipperLib.Clipper.Orientation(node.m_polygon)))
					node.m_polygon.reverse();
			}
		}
		else
		{
			for (var i = 0; i < this.m_polyNodes.ChildCount(); i++)
			{
				var node = this.m_polyNodes.Childs()[i];
				if (node.m_endtype === ClipperLib.EndType.etClosedLine && !ClipperLib.Clipper.Orientation(node.m_polygon))
					node.m_polygon.reverse();
			}
		}
	};

	ClipperLib.ClipperOffset.GetUnitNormal = function (pt1, pt2)
	{
		var dx = (pt2.X - pt1.X);
		var dy = (pt2.Y - pt1.Y);
		if ((dx === 0) && (dy === 0))
			return new ClipperLib.DoublePoint2(0, 0);
		var f = 1 / Math.sqrt(dx * dx + dy * dy);
		dx *= f;
		dy *= f;
		return new ClipperLib.DoublePoint2(dy, -dx);
	};

	ClipperLib.ClipperOffset.prototype.DoOffset = function (delta)
	{
		this.m_destPolys = new Array();
		this.m_delta = delta;
		//if Zero offset, just copy any CLOSED polygons to m_p and return ...
		if (ClipperLib.ClipperBase.near_zero(delta))
		{
			//this.m_destPolys.set_Capacity(this.m_polyNodes.ChildCount);
			for (var i = 0; i < this.m_polyNodes.ChildCount(); i++)
			{
				var node = this.m_polyNodes.Childs()[i];
				if (node.m_endtype === ClipperLib.EndType.etClosedPolygon)
					this.m_destPolys.push(node.m_polygon);
			}
			return;
		}
		//see offset_triginometry3.svg in the documentation folder ...
		if (this.MiterLimit > 2)
			this.m_miterLim = 2 / (this.MiterLimit * this.MiterLimit);
		else
			this.m_miterLim = 0.5;
		var y;
		if (this.ArcTolerance <= 0)
			y = ClipperLib.ClipperOffset.def_arc_tolerance;
		else if (this.ArcTolerance > Math.abs(delta) * ClipperLib.ClipperOffset.def_arc_tolerance)
			y = Math.abs(delta) * ClipperLib.ClipperOffset.def_arc_tolerance;
		else
			y = this.ArcTolerance;
		//see offset_triginometry2.svg in the documentation folder ...
		var steps = 3.14159265358979 / Math.acos(1 - y / Math.abs(delta));
		this.m_sin = Math.sin(ClipperLib.ClipperOffset.two_pi / steps);
		this.m_cos = Math.cos(ClipperLib.ClipperOffset.two_pi / steps);
		this.m_StepsPerRad = steps / ClipperLib.ClipperOffset.two_pi;
		if (delta < 0)
			this.m_sin = -this.m_sin;
		//this.m_destPolys.set_Capacity(this.m_polyNodes.ChildCount * 2);
		for (var i = 0; i < this.m_polyNodes.ChildCount(); i++)
		{
			var node = this.m_polyNodes.Childs()[i];
			this.m_srcPoly = node.m_polygon;
			var len = this.m_srcPoly.length;
			if (len === 0 || (delta <= 0 && (len < 3 || node.m_endtype !== ClipperLib.EndType.etClosedPolygon)))
				continue;
			this.m_destPoly = new Array();
			if (len === 1)
			{
				if (node.m_jointype === ClipperLib.JoinType.jtRound)
				{
					var X = 1,
						Y = 0;
					for (var j = 1; j <= steps; j++)
					{
						this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].X + X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].Y + Y * delta)));
						var X2 = X;
						X = X * this.m_cos - this.m_sin * Y;
						Y = X2 * this.m_sin + Y * this.m_cos;
					}
				}
				else
				{
					var X = -1,
						Y = -1;
					for (var j = 0; j < 4; ++j)
					{
						this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].X + X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].Y + Y * delta)));
						if (X < 0)
							X = 1;
						else if (Y < 0)
							Y = 1;
						else
							X = -1;
					}
				}
				this.m_destPolys.push(this.m_destPoly);
				continue;
			}
			//build m_normals ...
			this.m_normals.length = 0;
			//this.m_normals.set_Capacity(len);
			for (var j = 0; j < len - 1; j++)
				this.m_normals.push(ClipperLib.ClipperOffset.GetUnitNormal(this.m_srcPoly[j], this.m_srcPoly[j + 1]));
			if (node.m_endtype === ClipperLib.EndType.etClosedLine || node.m_endtype === ClipperLib.EndType.etClosedPolygon)
				this.m_normals.push(ClipperLib.ClipperOffset.GetUnitNormal(this.m_srcPoly[len - 1], this.m_srcPoly[0]));
			else
				this.m_normals.push(new ClipperLib.DoublePoint1(this.m_normals[len - 2]));
			if (node.m_endtype === ClipperLib.EndType.etClosedPolygon)
			{
				var k = len - 1;
				for (var j = 0; j < len; j++)
					k = this.OffsetPoint(j, k, node.m_jointype);
				this.m_destPolys.push(this.m_destPoly);
			}
			else if (node.m_endtype === ClipperLib.EndType.etClosedLine)
			{
				var k = len - 1;
				for (var j = 0; j < len; j++)
					k = this.OffsetPoint(j, k, node.m_jointype);
				this.m_destPolys.push(this.m_destPoly);
				this.m_destPoly = new Array();
				//re-build m_normals ...
				var n = this.m_normals[len - 1];
				for (var j = len - 1; j > 0; j--)
					this.m_normals[j] = new ClipperLib.DoublePoint2(-this.m_normals[j - 1].X, -this.m_normals[j - 1].Y);
				this.m_normals[0] = new ClipperLib.DoublePoint2(-n.X, -n.Y);
				k = 0;
				for (var j = len - 1; j >= 0; j--)
					k = this.OffsetPoint(j, k, node.m_jointype);
				this.m_destPolys.push(this.m_destPoly);
			}
			else
			{
				var k = 0;
				for (var j = 1; j < len - 1; ++j)
					k = this.OffsetPoint(j, k, node.m_jointype);
				var pt1;
				if (node.m_endtype === ClipperLib.EndType.etOpenButt)
				{
					var j = len - 1;
					pt1 = new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[j].X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[j].Y * delta));
					this.m_destPoly.push(pt1);
					pt1 = new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X - this.m_normals[j].X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y - this.m_normals[j].Y * delta));
					this.m_destPoly.push(pt1);
				}
				else
				{
					var j = len - 1;
					k = len - 2;
					this.m_sinA = 0;
					this.m_normals[j] = new ClipperLib.DoublePoint2(-this.m_normals[j].X, -this.m_normals[j].Y);
					if (node.m_endtype === ClipperLib.EndType.etOpenSquare)
						this.DoSquare(j, k);
					else
						this.DoRound(j, k);
				}
				//re-build m_normals ...
				for (var j = len - 1; j > 0; j--)
					this.m_normals[j] = new ClipperLib.DoublePoint2(-this.m_normals[j - 1].X, -this.m_normals[j - 1].Y);
				this.m_normals[0] = new ClipperLib.DoublePoint2(-this.m_normals[1].X, -this.m_normals[1].Y);
				k = len - 1;
				for (var j = k - 1; j > 0; --j)
					k = this.OffsetPoint(j, k, node.m_jointype);
				if (node.m_endtype === ClipperLib.EndType.etOpenButt)
				{
					pt1 = new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].X - this.m_normals[0].X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].Y - this.m_normals[0].Y * delta));
					this.m_destPoly.push(pt1);
					pt1 = new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].X + this.m_normals[0].X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].Y + this.m_normals[0].Y * delta));
					this.m_destPoly.push(pt1);
				}
				else
				{
					k = 1;
					this.m_sinA = 0;
					if (node.m_endtype === ClipperLib.EndType.etOpenSquare)
						this.DoSquare(0, 1);
					else
						this.DoRound(0, 1);
				}
				this.m_destPolys.push(this.m_destPoly);
			}
		}
	};

	ClipperLib.ClipperOffset.prototype.Execute = function ()
	{
		var a = arguments,
			ispolytree = a[0] instanceof ClipperLib.PolyTree;
		if (!ispolytree) // function (solution, delta)
		{
			var solution = a[0],
				delta = a[1];
			ClipperLib.Clear(solution);
			this.FixOrientations();
			this.DoOffset(delta);
			//now clean up 'corners' ...
			var clpr = new ClipperLib.Clipper(0);
			clpr.AddPaths(this.m_destPolys, ClipperLib.PolyType.ptSubject, true);
			if (delta > 0)
			{
				clpr.Execute(ClipperLib.ClipType.ctUnion, solution, ClipperLib.PolyFillType.pftPositive, ClipperLib.PolyFillType.pftPositive);
			}
			else
			{
				var r = ClipperLib.Clipper.GetBounds(this.m_destPolys);
				var outer = new ClipperLib.Path();
				outer.push(new ClipperLib.IntPoint2(r.left - 10, r.bottom + 10));
				outer.push(new ClipperLib.IntPoint2(r.right + 10, r.bottom + 10));
				outer.push(new ClipperLib.IntPoint2(r.right + 10, r.top - 10));
				outer.push(new ClipperLib.IntPoint2(r.left - 10, r.top - 10));
				clpr.AddPath(outer, ClipperLib.PolyType.ptSubject, true);
				clpr.ReverseSolution = true;
				clpr.Execute(ClipperLib.ClipType.ctUnion, solution, ClipperLib.PolyFillType.pftNegative, ClipperLib.PolyFillType.pftNegative);
				if (solution.length > 0)
					solution.splice(0, 1);
			}
			//console.log(JSON.stringify(solution));
		}
		else // function (polytree, delta)
		{
			var solution = a[0],
				delta = a[1];
			solution.Clear();
			this.FixOrientations();
			this.DoOffset(delta);
			//now clean up 'corners' ...
			var clpr = new ClipperLib.Clipper(0);
			clpr.AddPaths(this.m_destPolys, ClipperLib.PolyType.ptSubject, true);
			if (delta > 0)
			{
				clpr.Execute(ClipperLib.ClipType.ctUnion, solution, ClipperLib.PolyFillType.pftPositive, ClipperLib.PolyFillType.pftPositive);
			}
			else
			{
				var r = ClipperLib.Clipper.GetBounds(this.m_destPolys);
				var outer = new ClipperLib.Path();
				outer.push(new ClipperLib.IntPoint2(r.left - 10, r.bottom + 10));
				outer.push(new ClipperLib.IntPoint2(r.right + 10, r.bottom + 10));
				outer.push(new ClipperLib.IntPoint2(r.right + 10, r.top - 10));
				outer.push(new ClipperLib.IntPoint2(r.left - 10, r.top - 10));
				clpr.AddPath(outer, ClipperLib.PolyType.ptSubject, true);
				clpr.ReverseSolution = true;
				clpr.Execute(ClipperLib.ClipType.ctUnion, solution, ClipperLib.PolyFillType.pftNegative, ClipperLib.PolyFillType.pftNegative);
				//remove the outer PolyNode rectangle ...
				if (solution.ChildCount() === 1 && solution.Childs()[0].ChildCount() > 0)
				{
					var outerNode = solution.Childs()[0];
					//solution.Childs.set_Capacity(outerNode.ChildCount);
					solution.Childs()[0] = outerNode.Childs()[0];
					solution.Childs()[0].m_Parent = solution;
					for (var i = 1; i < outerNode.ChildCount(); i++)
						solution.AddChild(outerNode.Childs()[i]);
				}
				else
					solution.Clear();
			}
		}
	};

	ClipperLib.ClipperOffset.prototype.OffsetPoint = function (j, k, jointype)
	{
		//cross product ...
		this.m_sinA = (this.m_normals[k].X * this.m_normals[j].Y - this.m_normals[j].X * this.m_normals[k].Y);

		if (Math.abs(this.m_sinA * this.m_delta) < 1.0)
		{
			//dot product ...
			var cosA = (this.m_normals[k].X * this.m_normals[j].X + this.m_normals[j].Y * this.m_normals[k].Y);
			if (cosA > 0) // angle ==> 0 degrees
			{
				this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[k].X * this.m_delta),
					ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[k].Y * this.m_delta)));
				return k;
			}
			//else angle ==> 180 degrees
		}
		else if (this.m_sinA > 1)
			this.m_sinA = 1.0;
		else if (this.m_sinA < -1)
			this.m_sinA = -1.0;
		if (this.m_sinA * this.m_delta < 0)
		{
			this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[k].X * this.m_delta),
				ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[k].Y * this.m_delta)));
			this.m_destPoly.push(new ClipperLib.IntPoint1(this.m_srcPoly[j]));
			this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[j].X * this.m_delta),
				ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[j].Y * this.m_delta)));
		}
		else
			switch (jointype)
			{
			case ClipperLib.JoinType.jtMiter:
				{
					var r = 1 + (this.m_normals[j].X * this.m_normals[k].X + this.m_normals[j].Y * this.m_normals[k].Y);
					if (r >= this.m_miterLim)
						this.DoMiter(j, k, r);
					else
						this.DoSquare(j, k);
					break;
				}
			case ClipperLib.JoinType.jtSquare:
				this.DoSquare(j, k);
				break;
			case ClipperLib.JoinType.jtRound:
				this.DoRound(j, k);
				break;
			}
		k = j;
		return k;
	};

	ClipperLib.ClipperOffset.prototype.DoSquare = function (j, k)
	{
		var dx = Math.tan(Math.atan2(this.m_sinA,
			this.m_normals[k].X * this.m_normals[j].X + this.m_normals[k].Y * this.m_normals[j].Y) / 4);
		this.m_destPoly.push(new ClipperLib.IntPoint2(
			ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_delta * (this.m_normals[k].X - this.m_normals[k].Y * dx)),
			ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_delta * (this.m_normals[k].Y + this.m_normals[k].X * dx))));
		this.m_destPoly.push(new ClipperLib.IntPoint2(
			ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_delta * (this.m_normals[j].X + this.m_normals[j].Y * dx)),
			ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_delta * (this.m_normals[j].Y - this.m_normals[j].X * dx))));
	};

	ClipperLib.ClipperOffset.prototype.DoMiter = function (j, k, r)
	{
		var q = this.m_delta / r;
		this.m_destPoly.push(new ClipperLib.IntPoint2(
			ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + (this.m_normals[k].X + this.m_normals[j].X) * q),
			ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + (this.m_normals[k].Y + this.m_normals[j].Y) * q)));
	};

	ClipperLib.ClipperOffset.prototype.DoRound = function (j, k)
	{
		var a = Math.atan2(this.m_sinA,
			this.m_normals[k].X * this.m_normals[j].X + this.m_normals[k].Y * this.m_normals[j].Y);

		var steps = Math.max(ClipperLib.Cast_Int32(ClipperLib.ClipperOffset.Round(this.m_StepsPerRad * Math.abs(a))), 1);

		var X = this.m_normals[k].X,
			Y = this.m_normals[k].Y,
			X2;
		for (var i = 0; i < steps; ++i)
		{
			this.m_destPoly.push(new ClipperLib.IntPoint2(
				ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + X * this.m_delta),
				ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + Y * this.m_delta)));
			X2 = X;
			X = X * this.m_cos - this.m_sin * Y;
			Y = X2 * this.m_sin + Y * this.m_cos;
		}
		this.m_destPoly.push(new ClipperLib.IntPoint2(
			ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[j].X * this.m_delta),
			ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[j].Y * this.m_delta)));
	};

	ClipperLib.Error = function (message)
	{
		try
		{
			throw new Error(message);
		}
		catch (err)
		{
			alert(err.message);
		}
	};

	// ---------------------------------------------

	// JS extension by Timo 2013
	ClipperLib.JS = {};

	ClipperLib.JS.AreaOfPolygon = function (poly, scale)
	{
		if (!scale) scale = 1;
		return ClipperLib.Clipper.Area(poly) / (scale * scale);
	};

	ClipperLib.JS.AreaOfPolygons = function (poly, scale)
	{
		if (!scale) scale = 1;
		var area = 0;
		for (var i = 0; i < poly.length; i++)
		{
			area += ClipperLib.Clipper.Area(poly[i]);
		}
		return area / (scale * scale);
	};

	ClipperLib.JS.BoundsOfPath = function (path, scale)
	{
		return ClipperLib.JS.BoundsOfPaths([path], scale);
	};

	ClipperLib.JS.BoundsOfPaths = function (paths, scale)
	{
		if (!scale) scale = 1;
		var bounds = ClipperLib.Clipper.GetBounds(paths);
		bounds.left /= scale;
		bounds.bottom /= scale;
		bounds.right /= scale;
		bounds.top /= scale;
		return bounds;
	};

	// Clean() joins vertices that are too near each other
	// and causes distortion to offsetted polygons without cleaning
	ClipperLib.JS.Clean = function (polygon, delta)
	{
		if (!(polygon instanceof Array)) return [];
		var isPolygons = polygon[0] instanceof Array;
		var polygon = ClipperLib.JS.Clone(polygon);
		if (typeof delta !== "number" || delta === null)
		{
			ClipperLib.Error("Delta is not a number in Clean().");
			return polygon;
		}
		if (polygon.length === 0 || (polygon.length === 1 && polygon[0].length === 0) || delta < 0) return polygon;
		if (!isPolygons) polygon = [polygon];
		var k_length = polygon.length;
		var len, poly, result, d, p, j, i;
		var results = [];
		for (var k = 0; k < k_length; k++)
		{
			poly = polygon[k];
			len = poly.length;
			if (len === 0) continue;
			else if (len < 3)
			{
				result = poly;
				results.push(result);
				continue;
			}
			result = poly;
			d = delta * delta;
			//d = Math.floor(c_delta * c_delta);
			p = poly[0];
			j = 1;
			for (i = 1; i < len; i++)
			{
				if ((poly[i].X - p.X) * (poly[i].X - p.X) +
					(poly[i].Y - p.Y) * (poly[i].Y - p.Y) <= d)
					continue;
				result[j] = poly[i];
				p = poly[i];
				j++;
			}
			p = poly[j - 1];
			if ((poly[0].X - p.X) * (poly[0].X - p.X) +
				(poly[0].Y - p.Y) * (poly[0].Y - p.Y) <= d)
				j--;
			if (j < len)
				result.splice(j, len - j);
			if (result.length) results.push(result);
		}
		if (!isPolygons && results.length) results = results[0];
		else if (!isPolygons && results.length === 0) results = [];
		else if (isPolygons && results.length === 0) results = [
			[]
		];
		return results;
	}
	// Make deep copy of Polygons or Polygon
	// so that also IntPoint objects are cloned and not only referenced
	// This should be the fastest way
	ClipperLib.JS.Clone = function (polygon)
	{
		if (!(polygon instanceof Array)) return [];
		if (polygon.length === 0) return [];
		else if (polygon.length === 1 && polygon[0].length === 0) return [
			[]
		];
		var isPolygons = polygon[0] instanceof Array;
		if (!isPolygons) polygon = [polygon];
		var len = polygon.length,
			plen, i, j, result;
		var results = new Array(len);
		for (i = 0; i < len; i++)
		{
			plen = polygon[i].length;
			result = new Array(plen);
			for (j = 0; j < plen; j++)
			{
				result[j] = {
					X: polygon[i][j].X,
					Y: polygon[i][j].Y
				};

			}
			results[i] = result;
		}
		if (!isPolygons) results = results[0];
		return results;
	};

	// Removes points that doesn't affect much to the visual appearance.
	// If middle point is at or under certain distance (tolerance) of the line segment between
	// start and end point, the middle point is removed.
	ClipperLib.JS.Lighten = function (polygon, tolerance)
	{
		if (!(polygon instanceof Array)) return [];
		if (typeof tolerance !== "number" || tolerance === null)
		{
			ClipperLib.Error("Tolerance is not a number in Lighten().")
			return ClipperLib.JS.Clone(polygon);
		}
		if (polygon.length === 0 || (polygon.length === 1 && polygon[0].length === 0) || tolerance < 0)
		{
			return ClipperLib.JS.Clone(polygon);
		}
		var isPolygons = polygon[0] instanceof Array;
		if (!isPolygons) polygon = [polygon];
		var i, j, poly, k, poly2, plen, A, B, P, d, rem, addlast;
		var bxax, byay, l, ax, ay;
		var len = polygon.length;
		var toleranceSq = tolerance * tolerance;
		var results = [];
		for (i = 0; i < len; i++)
		{
			poly = polygon[i];
			plen = poly.length;
			if (plen === 0) continue;
			for (k = 0; k < 1000000; k++) // could be forever loop, but wiser to restrict max repeat count
			{
				poly2 = [];
				plen = poly.length;
				// the first have to added to the end, if first and last are not the same
				// this way we ensure that also the actual last point can be removed if needed
				if (poly[plen - 1].X !== poly[0].X || poly[plen - 1].Y !== poly[0].Y)
				{
					addlast = 1;
					poly.push(
					{
						X: poly[0].X,
						Y: poly[0].Y
					});
					plen = poly.length;
				}
				else addlast = 0;
				rem = []; // Indexes of removed points
				for (j = 0; j < plen - 2; j++)
				{
					A = poly[j]; // Start point of line segment
					P = poly[j + 1]; // Middle point. This is the one to be removed.
					B = poly[j + 2]; // End point of line segment
					ax = A.X;
					ay = A.Y;
					bxax = B.X - ax;
					byay = B.Y - ay;
					if (bxax !== 0 || byay !== 0) // To avoid Nan, when A==P && P==B. And to avoid peaks (A==B && A!=P), which have lenght, but not area.
					{
						l = ((P.X - ax) * bxax + (P.Y - ay) * byay) / (bxax * bxax + byay * byay);
						if (l > 1)
						{
							ax = B.X;
							ay = B.Y;
						}
						else if (l > 0)
						{
							ax += bxax * l;
							ay += byay * l;
						}
					}
					bxax = P.X - ax;
					byay = P.Y - ay;
					d = bxax * bxax + byay * byay;
					if (d <= toleranceSq)
					{
						rem[j + 1] = 1;
						j++; // when removed, transfer the pointer to the next one
					}
				}
				// add all unremoved points to poly2
				poly2.push(
				{
					X: poly[0].X,
					Y: poly[0].Y
				});
				for (j = 1; j < plen - 1; j++)
					if (!rem[j]) poly2.push(
					{
						X: poly[j].X,
						Y: poly[j].Y
					});
				poly2.push(
				{
					X: poly[plen - 1].X,
					Y: poly[plen - 1].Y
				});
				// if the first point was added to the end, remove it
				if (addlast) poly.pop();
				// break, if there was not anymore removed points
				if (!rem.length) break;
				// else continue looping using poly2, to check if there are points to remove
				else poly = poly2;
			}
			plen = poly2.length;
			// remove duplicate from end, if needed
			if (poly2[plen - 1].X === poly2[0].X && poly2[plen - 1].Y === poly2[0].Y)
			{
				poly2.pop();
			}
			if (poly2.length > 2) // to avoid two-point-polygons
				results.push(poly2);
		}
		if (!isPolygons)
		{
			results = results[0];
		}
		if (typeof (results) === "undefined")
		{
			results = [];
		}
		return results;
	}

	ClipperLib.JS.PerimeterOfPath = function (path, closed, scale)
	{
		if (typeof (path) === "undefined") return 0;
		var sqrt = Math.sqrt;
		var perimeter = 0.0;
		var p1, p2, p1x = 0.0,
			p1y = 0.0,
			p2x = 0.0,
			p2y = 0.0;
		var j = path.length;
		if (j < 2) return 0;
		if (closed)
		{
			path[j] = path[0];
			j++;
		}
		while (--j)
		{
			p1 = path[j];
			p1x = p1.X;
			p1y = p1.Y;
			p2 = path[j - 1];
			p2x = p2.X;
			p2y = p2.Y;
			perimeter += sqrt((p1x - p2x) * (p1x - p2x) + (p1y - p2y) * (p1y - p2y));
		}
		if (closed) path.pop();
		return perimeter / scale;
	};

	ClipperLib.JS.PerimeterOfPaths = function (paths, closed, scale)
	{
		if (!scale) scale = 1;
		var perimeter = 0;
		for (var i = 0; i < paths.length; i++)
		{
			perimeter += ClipperLib.JS.PerimeterOfPath(paths[i], closed, scale);
		}
		return perimeter;
	};

	ClipperLib.JS.ScaleDownPath = function (path, scale)
	{
		var i, p;
		if (!scale) scale = 1;
		i = path.length;
		while (i--)
		{
			p = path[i];
			p.X = p.X / scale;
			p.Y = p.Y / scale;
		}
	};

	ClipperLib.JS.ScaleDownPaths = function (paths, scale)
	{
		var i, j, p;
		if (!scale) scale = 1;
		i = paths.length;
		while (i--)
		{
			j = paths[i].length;
			while (j--)
			{
				p = paths[i][j];
				p.X = p.X / scale;
				p.Y = p.Y / scale;
			}
		}
	};

	ClipperLib.JS.ScaleUpPath = function (path, scale)
	{
		var i, p, round = Math.round;
		if (!scale) scale = 1;
		i = path.length;
		while (i--)
		{
			p = path[i];
			p.X = round(p.X * scale);
			p.Y = round(p.Y * scale);
		}
	};

	ClipperLib.JS.ScaleUpPaths = function (paths, scale)
	{
		var i, j, p, round = Math.round;
		if (!scale) scale = 1;
		i = paths.length;
		while (i--)
		{
			j = paths[i].length;
			while (j--)
			{
				p = paths[i][j];
				p.X = round(p.X * scale);
				p.Y = round(p.Y * scale);
			}
		}
	};

	/**
	* @constructor
	*/
	ClipperLib.ExPolygons = function ()
	{
		return [];
	}
	/**
	* @constructor
	*/
	ClipperLib.ExPolygon = function ()
	{
		this.outer = null;
		this.holes = null;
	};

	ClipperLib.JS.AddOuterPolyNodeToExPolygons = function (polynode, expolygons)
	{
		var ep = new ClipperLib.ExPolygon();
		ep.outer = polynode.Contour();
		var childs = polynode.Childs();
		var ilen = childs.length;
		ep.holes = new Array(ilen);
		var node, n, i, j, childs2, jlen;
		for (i = 0; i < ilen; i++)
		{
			node = childs[i];
			ep.holes[i] = node.Contour();
			//Add outer polygons contained by (nested within) holes ...
			for (j = 0, childs2 = node.Childs(), jlen = childs2.length; j < jlen; j++)
			{
				n = childs2[j];
				ClipperLib.JS.AddOuterPolyNodeToExPolygons(n, expolygons);
			}
		}
		expolygons.push(ep);
	};

	ClipperLib.JS.ExPolygonsToPaths = function (expolygons)
	{
		var a, i, alen, ilen;
		var paths = new ClipperLib.Paths();
		for (a = 0, alen = expolygons.length; a < alen; a++)
		{
			paths.push(expolygons[a].outer);
			for (i = 0, ilen = expolygons[a].holes.length; i < ilen; i++)
			{
				paths.push(expolygons[a].holes[i]);
			}
		}
		return paths;
	}
	ClipperLib.JS.PolyTreeToExPolygons = function (polytree)
	{
		var expolygons = new ClipperLib.ExPolygons();
		var node, i, childs, ilen;
		for (i = 0, childs = polytree.Childs(), ilen = childs.length; i < ilen; i++)
		{
			node = childs[i];
			ClipperLib.JS.AddOuterPolyNodeToExPolygons(node, expolygons);
		}
		return expolygons;
	};

})();
},{}],3:[function(require,module,exports){
(function (process){(function (){
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

// The main structure is the graph_ctx:
//
// {
//   C : <array of boundary points in ccw order>
//   Ct : <array of types of boundary bounts>
//     'c' : convex (relative inward)
//     'r' : reflex (concave, relative inward)
//
//   X : <array of x coordinates of grid points (domain)>
//   Y : <array of y coordinates of grid points (domain)>
//     note that some combinations of points from X,Y will not be valid grid points
//
//   B : <array of [i,j] border points>
//   Bt : <array of border type>
//     'c' : convex
//     'r' : reflex
//     'b' : border
//   Bxy : <array of border xy points>
//   Bij : <2d array [j,i]>
//     values map to B index, -1 if not a border point
//
//   G : <array of grid points>
//   Gt : <array of grid point types>
//     'c' : original boundary point
//     'b' : point on edge, on boundary but not in C
//     'i' : interior point
//   Gxy : <array of grid xy points>
//   Gij : <2d array [j,i]>
//      values map to G index, -1 if invalid grid point
//
//   Js : <3d array, [idir,j,i]>
//     entries map to first general border index point, -1 if invalid
// }
//

// Currently, the scoring function tallies the perimeter of each
// rectangle. This double counts the inteior edges but only
// single counts the exterior.
// Some numbers below are using this double counting.
//
// To get the real value:
//
// * Call the (singly counted) perimeter $S_P$
// * Call the (double interior) counted total $S_R$
// * To get the actual ink value:
//   - $S_I = (S_R - S_P)/2 + S_P = (S_P + S_R) / 2$
//

var fasslib = require("./fasslib.js");
var fw = require("./4w.js");

//FOR TESTING, PLEASE DON'T KEEP IN FINAL VERSION
//
var clip = require("./clipper.js");
//
//FOR TESTING, PLEASE DON'T KEEP IN FINAL VERSION

var norm2_v = fasslib.norm2_v;
var v_sub = fasslib.v_sub;
var v_add = fasslib.v_add;
var v_mul = fasslib.v_mul;
var dot_v = fasslib.dot_v;
var cross3 = fasslib.cross3;
var v_delta = fasslib.v_delta;
var abs_sum_v = fasslib.abs_sum_v;
var cmp_v = fasslib.cmp_v;

var pgon = [
  [0,0], [0,2], [1,2], [1,3], [3,3],
  [3,1], [2,1], [2,0]
];

var pgn_ell = [
  [0,0], [12,0], [12,3], [4,3],
  [4,13], [0,13],
];

// opt. 52
//
var pgn_z = [
  [0,0], [7,0], [7,6], [12,6],
  [12,9], [1,9], [1,2], [0,2],
];

var pgon_pinwheel = [
  [1,-1], [1,1], [0,1], [0,5], [2,5], [2,6],
  [4,6], [4,3], [5,3], [5,0], [3,0], [3,-1],
];

// opt. 96 (w/ double counting)
//
var pgn_pinwheel1 = [
  [0,6], [4,6], [4,0], [9,0],
  [9,4], [14,4], [14,9], [11,9],
  [11,15], [6,15], [6,11], [0,11]
];

// opt. 98
var pgn_pinwheel_sym = [
  [0,6], [4,6], [4,0], [9,0],
  [9,4], [15,4], [15,9], [11,9],
  [11,15], [6,15], [6,11], [0,11]
];

// example that can have quarry endpoints floating over
// the sides.
// Used to show various rejection conditions for cleave
// cuts eminating from corners of quarry rectangle.
//
var pgn_balance = [
  [0,6], [5,6], [5,8], [9,8],
  [9,11], [12,11], [12,6], [15,6],
  [15,0], [21,0], [21,9], [19,9],
  [19,17], [14,17], [14,21], [7,21],
  [7,19], [3,19], [3,14], [0,14]
];

// can choose quarry so that it's perched wholly
// on the top of a 2cut
//
var pgn_quarry_share_2cut = [
  [0,8], [7,8], [7,7], [10,7],
  [10,12], [13,12], [13,9], [15,9],
  [15,5], [18,5], [18,2], [22,2],
  [22,0], [27,0], [27,18], [20,18],
  [20,23], [4,23], [4,17], [1,17],
  [1,14], [0,14]
];

var pgn_spiral = [
  [0,0], [35,0], [35,10], [32,10],
  [32,2], [2,2], [2,26], [28,26],
  [28,21], [30,21], [30,17], [27,17],
  [27,6], [6,6], [6,22], [21,22],
  [21,11], [10,11], [10,18], [15,18],
  [15,14], [18,14], [18,20], [9,20],
  [9,8], [25,8], [25,24], [4,24],
  [4,4], [30,4], [30,15], [33,15],
  [33,28], [11,28], [11,29], [0,29]
];

var pgn_spiral1 = [
  [0,0], [11,0], [11,12], [9,12],
  [9,15], [3,15], [3,19], [8,19],
  [8,26], [27,26], [27,10], [16,10],
  [16,20], [19,20], [19,22], [20,22],
  [20,16], [19,16], [19,14], [22,14],
  [22,23], [10,23], [10,15], [13,15],
  [13,8], [31,8], [31,23], [33,23],
  [33,29], [5,29], [5,21], [0,21],
  [0,6], [5,6], [5,10], [3,10],
  [3,13], [7,13], [7,3], [0,3]
];


var pgon_fig1 = [
  [0,3], [0,9], [7,9], [7,10], [10,10],
  [10,8], [12,8],
  [12,4], [11,4],
  [11,1], [8,1], [8,5], [4,5],
  [4,7], [3,7], [3,3]
];

var pgon_fig11 = [
  [ 0, 0],[ 0, 3],[ 3, 3],[ 3, 5],
  [ 5, 5],[ 5, 8],[ 7, 8],[ 7, 4],
  [ 8, 4],[ 8, 6],[10, 6],[10, 0],
  [ 6, 0],[ 6, 1],[ 1, 1],[ 1, 0]
];

var pgon_fig9 = [
  [0,13], [4,13], [4,8], [8,8],
  [8,3], [14,3], [14,13], [23,13],
  [23,10], [16,10], [16,0], [19,0],
  [19,7], [26,7], [26,3], [31,3],
  [31,10], [33,10], [33,8], [37,8],
  [37,17], [34,17], [34,19], [32,19],
  [32,22], [36,22], [36,25], [34,25],
  [34,29], [33,29], [33,27], [31,27],
  [31,28], [28,28], [28,26], [25,26],
  [25,27], [21,27], [21,30], [16,30],
  [16,29], [6,29], [6,26], [12,26],
  [12,20], [10,20], [10,24], [0,24],
  [0,23], [7,23], [7,21], [4,21],
  [4,18], [0,18],
];

var pgon_fig10 = [
  [0,14], [11,14], [11,8], [19,8],
  [19,0], [22,0], [22,5], [25,5],
  [25,19], [28,19], [28,23], [22,23],
  [22,28], [3,28], [3,17], [0,17],
];

var pgon_fig11d = [
  [0,12], [4,12], [4,14], [9,14],
  [9,12], [12,12], [12,8], [2,8],
  [2,5], [12,5], [12,3], [8,3],
  [8,0], [20,0], [20,10], [26,10],
  [26,8], [30,8], [30,14], [28,14],
  [28,16], [20,16], [20,18], [26,18],
  [26,25], [17,25], [17,27], [4,27],
  [4,25], [14,25], [14,21], [12,21],
  [12,20], [4,20], [4,17], [8,17],
  [8,18], [12,18], [12,15], [2,15],
  [2,20], [0,20],
];

let pgn_custom0 = [
  [0,9], [0,13], [3,13], [3,18],
  [6,18], [6,15], [9,15], [9,19],
  [18,19], [18,10], [13,10], [13,4],
  [7,4], [7,0], [3,0], [3,9]
];

var pgn_custom1 = [
    [0,5], [8,5], [8,0], [11,0],
    [11,2], [15,2], [15,8], [11,8],
    [11,16], [6,16], [6,19], [0,19],
    [0,15], [3,15], [3,8], [0,8],
];

let pgn_clover = [
  [0,2], [10,2], [10,6], [17,6],
  [17,0], [31,0], [31,4], [23,4],
  [23,12], [30,12], [30,27], [20,27],
  [20,19], [8,19], [8,24], [3,24],
  [3,14], [10,14], [10,10], [0,10]
];

var pgn_clover1 = [
  [0,2], [10,2], [10,6], [17,6],
  [17,0], [31,0], [31,4], [23,4],
  [23,12], [30,12], [30,27], [20,27],
  [20,19], [10,19], [10,24], [3,24],
  [3,14], [10,14], [10,10], [0,10],
];

var pgn_clover2 = [
  [0,12], [5,12], [5,9], [2,9],
  [2,1], [10,1], [10,5], [13,5],
  [13,0], [20,0], [20,7], [17,7],
  [17,13], [23,13], [23,19], [15,19],
  [15,16], [8,16], [8,20], [0,20],
];

var pgn_clover3 = [
    [0,2], [10,2], [10,4], [17,4],
    [17,0], [31,0], [31,4], [23,4],
    [23,12], [30,12], [30,27], [20,27],
    [20,19], [8,19], [8,24], [3,24],
    [3,14], [10,14], [10,10], [0,10],
];

var pgn_double_edge_cut = [
  [0,9], [5,9], [5,10], [8,10],
  [8,3], [14,3], [14,0], [19,0],
  [19,6], [16,6], [16,12], [10,12],
  [10,17], [8,17], [8,19], [2,19],
  [2,12], [0,12],
];

var pgn_quarry_corner_convex = [
  [0,6], [5,6], [5,3], [13,3],
  [13,0], [18,0], [18,5], [15,5],
  [15,10], [10,10], [10,17], [5,17],
  [5,10], [0,10],
];


var pgn_left_run = [
  [0,9], [6,9], [6,7], [2,7],
  [2,5], [6,5], [6,3], [10,3],
  [10,0], [13,0], [13,3], [16,3],
  [16,18], [12,18], [12,22], [6,22],
  [6,18], [3,18], [3,15], [6,15],
  [6,11], [0,11],
];

var pgn_bottom_guillotine = [
  [0,0], [3,0], [3,6], [5,6],
  [5,4], [7,4], [7,6], [9,6],
  [9,3], [11,3], [11,6], [13,6],
  [13,2], [16,2], [16,6], [19,6],
  [19,4], [21,4], [21,6], [25,6],
  [25,12], [20,12], [20,15], [14,15],
  [14,10], [8,10], [8,12], [1,12],
  [1,4], [0,4],
];

var pgn_cavity = [
  [0,11], [6,11], [6,0], [19,0],
  [19,3], [31,3], [31,26], [20,26],
  [20,21], [25,21], [25,17], [28,17],
  [28,13], [24,13], [24,7], [18,7],
  [18,5], [9,5], [9,8], [7,8],
  [7,12], [4,12], [4,15], [7,15],
  [7,18], [9,18], [9,20], [11,20],
  [11,28], [8,28], [8,21], [0,21]
];

var pgn_dragon = [
  [0,4], [19,4], [19,0], [27,0],
  [27,2], [31,2], [31,9], [27,9],
  [27,17], [24,17], [24,19], [21,19],
  [21,17], [18,17], [18,19], [15,19],
  [15,17], [12,17], [12,19], [9,19],
  [9,17], [6,17], [6,21], [0,21],
  [0,12], [4,12], [4,9], [0,9],
];

// testing cleave enumerating when a quarry corner has a border
// and open slot available.
//
var pgn_horseshoe = [
  [0,0], [5,0], [5,3], [9,3],
  [9,5], [13,5], [13,0], [17,0],
  [17,3], [20,3], [20,8], [17,8],
  [17,18], [7,18], [7,20], [2,20],
  [2,15], [5,15], [5,11], [2,11],
  [2,8], [0,8],
];

var pgn_bb_test = [
  [0,13], [2,13], [2,9], [1,9],
  [1,7], [3,7], [3,0], [11,0],
  [11,7], [16,7], [16,13], [13,13],
  [13,16], [8,16], [8,15], [5,15],
  [5,17], [0,17]
];


// testing bridge in well
//
var pgn_bb_test1= [
  [0,8], [3,8], [3,0], [8,0],
  [8,8], [12,8], [12,11], [15,11],
  [15,2], [17,2], [17,13], [12,13],
  [12,16], [6,16], [6,20], [0,20],
  [0,14], [3,14], [3,11], [0,11],
];

function _write_data(ofn, data) {
  var fs = require("fs");
  return fs.writeFileSync(ofn, JSON.stringify(data, undefined, 2));
}

function _ERROR(s) {
  console.log("ERROR:", s);
}

// human readable debug identifiers
// 'four character words' js with array of 4 character words
//
function _debid() {
  let n = 2;
  let m = fw.word.length;
  let a = [];
  for (let i=0; i<n; i++) {
    let idx = Math.floor( Math.random()*m );
    a.push( fw.word[idx] );
  }
  return a.join("-");
}

function _ifmt(v, s) {
  s = ((typeof s === "undefined") ? 0 : s);
  let t = v.toString();

  let a = [];

  for (let i=0; i<(s-t.length); i++) {
    a.push(' ');
  }
  a.push(t);

  return a.join("");
}

function _sfmt(v, s, ws_lr) {
  s = ((typeof s === "undefined") ? 0 : s);
  lr = ((typeof lr === "undefined") ? 'l' : ws_lr);
  let a = [];

  if (ws_lr != 'l') { a.push(v); }
  for (let i=0; i<(s - v.length); i++) { a.push(" "); }
  if (ws_lr == 'l') { a.push(v); }

  return a.join("");
}

function _print_pgon(p, pt) {
  pt = ((typeof pt === "undefined") ? [] : pt);
  for (let i=0; i<p.length; i++) {

    if (i < pt.length) { console.log("#", i, pt[i]); }
    console.log(p[i][0], p[i][1]);
  }

  if (p.length > 0) {
    console.log(p[0][0], p[0][1]);
  }
}


/*
function _print_dual(dualG, pfx) {
  pfx = ((typeof pfx === "undefined") ? "" : pfx);
  for (let j=(dualG.length-1); j>=0; j--) {
    let pl = [];
    for (let i=0; i<dualG[j].length; i++) {

      let v = dualG[j][i].id;
      if (v < 0) { v = '   .'; }
      else { v = _ifmt(v, 4); }

      pl.push( v );
    }
    console.log( pfx + pl.join(" ") );
  }
}
*/

function cmp_dp_key(_a,_b) {

  let v_a = _a.split(";");
  let v_b = _b.split(";");

  let a_se = v_a[0].split(":");
  let b_se = v_b[0].split(":");

  let a_adit = v_b[1].split(",");
  let b_adit = v_b[1].split(",");

  if ( parseInt(a_se[0]) < parseInt(b_se[0])) { return -1; }
  if ( parseInt(a_se[0]) > parseInt(b_se[0])) { return  1; }
  if ( parseInt(a_se[1]) < parseInt(b_se[1])) { return -1; }
  if ( parseInt(a_se[1]) > parseInt(b_se[1])) { return  1; }

  if ( parseInt(a_adit[0]) < parseInt(b_adit[0])) { return -1; }
  if ( parseInt(a_adit[0]) > parseInt(b_adit[0])) { return  1; }

  if ( parseInt(a_adit[1]) < parseInt(b_adit[1])) { return -1; }
  if ( parseInt(a_adit[1]) > parseInt(b_adit[1])) { return  1; }

  return 0;
}

function _print_dp(ctx) {
  let X = ctx.X;
  let Y = ctx.Y;

  let key_a = [];
  for (let key in ctx.DP_cost) { key_a.push(key); }
  key_a.sort( cmp_dp_key );

  for (let i=0; i<key_a.length; i++) {
    let dp_idx = key_a[i];
    if (ctx.DP_cost[dp_idx] >= 0) {
      console.log( dp_idx, ":", ctx.DP_cost[dp_idx]);
      console.log("  R:", JSON.stringify(ctx.DP_rect[dp_idx][0]), JSON.stringify(ctx.DP_rect[dp_idx][1]));
      console.log("  P.1cut:", JSON.stringify(ctx.DP_partition[dp_idx][0]));
      console.log("  P.2cut:", JSON.stringify(ctx.DP_partition[dp_idx][1]));
    }
  }

  if ("partition" in ctx) {
    let plist = ctx.partition;

    for (let i=0; i<plist.length; i++) {
      console.log(plist[i]);
    }
  }

}

function __print_dp(ctx) {
  let X = ctx.X;
  let Y = ctx.Y;


  for (let dp_idx=0; dp_idx < ctx.DP_cost.length; dp_idx++) {
    if (ctx.DP_cost[dp_idx] >= 0) {
      console.log( dp_idx, ":", ctx.DP_cost[dp_idx]);
      console.log("  R:", JSON.stringify(ctx.DP_rect[dp_idx][0]), JSON.stringify(ctx.DP_rect[dp_idx][1]));
      console.log("  P.1cut:", JSON.stringify(ctx.DP_partition[dp_idx][0]));
      console.log("  P.2cut:", JSON.stringify(ctx.DP_partition[dp_idx][1]));
    }
  }

  if ("partition" in ctx) {
    let plist = ctx.partition;

    for (let i=0; i<plist.length; i++) {
      console.log(plist[i]);
    }
  }
}

function _print1da(A, hdr, ws, line_pfx, fold) {
  hdr = ((typeof hdr === "undefined") ? "" : hdr);
  ws = ((typeof ws === "undefined") ? 8 : ws);
  line_pfx = ((typeof line_pfx === "undefined") ? "" : line_pfx);
  fold = ((typeof fold === "undefined") ? 12 : fold);
  console.log(hdr);

  let row_s = [ line_pfx ];
  for (let i=0; i<A.length; i++) {
    if (row_s.length == fold) {
      console.log( row_s.join("") );
      row_s = [ line_pfx ];
    }

    let v = _ifmt( JSON.stringify(A[i]), ws );
    row_s.push(v);
  }
  if (row_s.length > 0) {
    console.log( row_s.join("") );
  }
}

function _print2da(A, hdr, ws, line_pfx) {
  hdr = ((typeof hdr === "undefined") ? "" : hdr);
  ws = ((typeof ws === "undefined") ? 3 : ws);
  line_pfx = ((typeof line_pfx === "undefined") ? "  " : line_pfx);
  console.log(hdr);
  for (let j=(A.length-1); j>=0; j--) {
    let row_s = [line_pfx];
    for (let i=0; i<A[j].length; i++) {
      let v = _ifmt( JSON.stringify(A[j][i]), ws );
      let s = ( (v < 0) ? "  ." : _ifmt(v, 3) );
      row_s.push( s );
    }
    console.log(row_s.join(" "));
  }
  console.log("");
}

function _print_rprp(ctx) {

  _print1da(ctx.Cxy, "\n## Cxy:");
  _print1da(ctx.Ct, "\n## Ct:");

  _print1da(ctx.Gxy,   "\n## Gxy:");
  _print1da(ctx.G,  "\n## G:");
  _print1da(ctx.Gt,    "\n## Gt:");
  _print2da(ctx.Gij,   "\n## Gij:");

  _print1da(ctx.Bxy,  "\n## Bxy:");
  _print1da(ctx.B,    "\n## B:");
  _print1da(ctx.Bt,   "\n## Bt:");
  _print2da(ctx.Bij,  "\n## Bij:");

  let idir_descr = [ "+x", "-x", "+y", "-y" ];
  for (let idir=0; idir<4; idir++) {
    _print2da(ctx.Js[idir],   "\n## Js[" + idir_descr[idir] + "]:");
  }

  for (let idir=0; idir<4; idir++) {
    _print2da(ctx.Je[idir],   "\n## Je[" + idir_descr[idir] + "]:");
  }

  for (let idir=0; idir<4; idir++) {
    _print2da(ctx.Jf[idir],   "\n## Jf[" + idir_descr[idir] + "]:");
  }

}

function _print_cleave(cleave) {

  let g = [];
  for (let i=0; i<cleave.length; i+=2) {
    g.push( cleave[i] + cleave[i+1] );
  }
  return g.join(" ");

}

// helper functions
//

function _BBInit(BB,x,y) {
  BB[0][0] = x;
  BB[1][0] = x;

  BB[0][1] = y;
  BB[1][1] = y;
}

function _BBUpdate(BB,x,y) {
  BB[0][0] = Math.min( BB[0][0], x );
  BB[0][1] = Math.min( BB[0][1], y );

  BB[1][0] = Math.max( BB[1][0], x );
  BB[1][1] = Math.max( BB[1][1], y );
}

function _ijkey(p) {
  return p[0].toString() + "," + p[1].toString();
}

function _to_idir(dv) {
  if (dv[0] >  0.5) { return 0; }
  if (dv[0] < -0.5) { return 1; }
  if (dv[1] >  0.5) { return 2; }
  if (dv[1] < -0.5) { return 3; }
  return -1;
}

function dxy2idir( dxy ) {
  if (dxy[0] ==  1) { return 0; }
  if (dxy[0] == -1) { return 1; }
  if (dxy[1] ==  1) { return 2; }
  if (dxy[1] == -1) { return 3; }
  return -1;
}

function _xyKey(xy) {
  return xy[0].toString() + "," + xy[1].toString();
}

function _icmp(a,b) {
  if (a < b) { return -1; }
  if (a > b) { return  1; }
  return 0;
}

function clockwise(pgn) {
  let s = 0;

  for (let i=0; i<pgn.length; i++) {
    let j = (i+1+pgn.length)%pgn.length;
    let u = pgn[i];
    let v = pgn[j];
    s += (v[0]-u[0])*(v[1]+u[1]);
  }

  if (s > 0) { return true; }
  return false;
}

function orderCounterclockwise(pgn) {
  if (!clockwise(pgn)) { return pgn; }
  let ccw = [ pgn[0] ];
  for (let i=(pgn.length-1); i>0; i--) {
    ccw.push( pgn[i] );
  }
  return ccw;
}

// https://jeffe.cs.illinois.edu/teaching/comptop/2023/notes/02-winding-number.html
//
function winding(u, pgn) {
  let w = 0;
  let n = pgn.length;

  for (let i=0; i<n; i++) {
    let p = pgn[i];
    let q = pgn[(i+1)%n];

    let d = ((p[0] - u[0])*(q[1] - u[1])) - ((p[1] - u[1])*(q[0] - u[0]));

    if      ((p[0] <= u[0]) && (u[0] < q[0]) && (d > 0)) { w ++; }
    else if ((q[0] <= u[0]) && (u[0] < p[0]) && (d < 0)) { w --; }

  }

  return w;
}

function windingA(pgn) {
  let n = pgn.length;
  let s = 0;
  for (let i=0; i<n; i++) {
    let p = pgn[i];
    let q = pgn[(i+1)%n];
    s += (q[0] - p[0])*(q[1] + p[1]);
  }
  return s;
}

//
// helper functions

// Returns true if p on boundary of pgn,
// false if not.
//
// slightly modified from:
// https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Vector_formulation
//
// take projection of p onto line segment made from (i,i+1) (ccw ordered)
// boundary points.
// If the the distance of the projected point is within eps and the point
// lies within the line segment (0 <= t <= dl), it's on the boundary.
//
//
function onBoundary(p, pgn) {
  let _eps = (1/1024);
  let n = pgn.length;

  for (let i=0; i<n; i++) {
    let a = [ pgn[i][0], pgn[i][1] ];
    let dn = [ pgn[(i+1)%n][0] - a[0], pgn[(i+1)%n][1] - a[1] ];
    let dl = norm2_v(dn);
    dn[0] /= dl;
    dn[1] /= dl;

    let p_m_a = v_sub(p,a);
    let t = dot_v( p_m_a , dn );
    let u = v_sub( p_m_a, v_mul(t, dn) );

    let dist = norm2_v( u );

    if ((t < (-_eps)) ||
        (t > (dl+_eps))) { continue; }

    if (dist < _eps) { return true; }
  }

  return false;
}

//---

function _rprp_sanity( rl_pgon ) {

  let n = rl_pgon.length;

  // sanity
  //
  for (let cur_idx=0; cur_idx<rl_pgon.length; cur_idx++) {
    let prv_idx = (cur_idx+n-1)%n;
    let dxy = v_sub( rl_pgon[cur_idx], rl_pgon[prv_idx] );
    let adx = Math.abs(dxy[0]);
    let ady = Math.abs(dxy[1]);

    if (((adx == 0) && (ady == 0)) ||
        ((adx != 0) && (ady != 0))) { return 1; }
  }
  //
  // sanity

  return 0;
}

// refactored RPRP
//
// returns context
//
function RPRPInit(_rl_pgon, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : 1);
  let _eps = (1/(1024));

  let Cxy = [],
      Ct = [];

  let G = [],
      Gt = [],
      Gij = [],
      Gxy = [];

  let B = [],
      Bt = [],
      Bij = [],
      Bxy = [];

  let X = [],
      Y = [];

  let Js = [ [], [], [], [] ],
      Je = [ [], [], [], [] ],
      Jf = [ [], [], [], [] ];

  let idir_dxy = [ [1,0], [-1,0], [0,1], [0,-1] ];

  let x_dup = [],
      y_dup = [];

  let pnt_map = {};
  let corner_type = [];

  if (_rl_pgon.length == 0) { return []; }
  Cxy = orderCounterclockwise( _rl_pgon );
  if ( Cxy.length == 0) { return {}; }
  if (_rprp_sanity( Cxy )) { return {}; }

  for (let i=0; i<Cxy.length; i++) {
    x_dup.push(Cxy[i][0]);
    y_dup.push(Cxy[i][1]);

    let p_prv = [ Cxy[(i+Cxy.length-1)%Cxy.length][0], Cxy[(i+Cxy.length-1)%Cxy.length][1], 0 ];
    let p_cur = [ Cxy[i][0], Cxy[i][1], 0 ];
    let p_nxt = [ Cxy[(i+1)%Cxy.length][0], Cxy[(i+1)%Cxy.length][1], 0 ];

    let v0 = v_sub( p_prv, p_cur );
    let v1 = v_sub( p_nxt, p_cur );

    let _c = cross3( v0, v1 );

    let corner_code = 'X';

    if      (_c[2] < _eps) { corner_code = 'r'; }
    else if (_c[2] > _eps) { corner_code = 'c'; }

    Ct.push(corner_code);
  }

  x_dup.sort( _icmp );
  y_dup.sort( _icmp );

  // X and Y dedup
  //
  X.push( x_dup[0] );
  Y.push( y_dup[0] );

  for (let i=1; i<x_dup.length; i++) {
    if (x_dup[i] == x_dup[i-1]) { continue; }
    X.push(x_dup[i]);
  }

  for (let i=1; i<y_dup.length; i++) {
    if (y_dup[i] == y_dup[i-1]) { continue; }
    Y.push(y_dup[i]);
  }

  // init Gij, Bij, Js
  //

  if (_debug) {
    _print1da(Cxy, "\n## Cxy:");
    _print1da(Ct, "\n## Ct:");
  }

  for (let j=0; j<Y.length; j++) {
    Gij.push([]);
    Bij.push([]);
    for (let idir=0; idir<4; idir++) {
      Js[idir].push([]);
      Je[idir].push([]);
      Jf[idir].push([]);
    }
    for (let i=0; i<X.length; i++) {
      Gij[j].push(-1);
      Bij[j].push(-1);
      for (let idir=0; idir<4; idir++) {
        Js[idir][j].push(-1);
        Je[idir][j].push(-1);
        Jf[idir][j].push(-1);
      }
    }
  }

  // populate Bij
  //
  // Bij is a 2d index grid whose entries hold
  // the index of the general border points, if they exist (-1 otherwise).
  // To populate, start at a primitive Cxy border point, map it to the
  // ij grid, find the direction of change and start walking the ij
  // grid, populating Bij as we go until we hig the next primitive border point.
  //
  // Keep the general border point index to ij and xy mapping in B, Bxy respectively.
  //

  let XY = [ X, Y ];

  let xy = Cxy[0];
  let ij = [-1,-1];

  for (let i=0; i<X.length; i++) { if (X[i] == xy[0]) { ij[0] = i; } }
  for (let j=0; j<Y.length; j++) { if (Y[j] == xy[1]) { ij[1] = j; } }

  let b_idx = 0;
  for (let c_idx=0; c_idx < Cxy.length; c_idx++) {
    let c_nxt = (c_idx+1)%Cxy.length;

    let dC = v_sub( Cxy[c_nxt], Cxy[c_idx] );
    let xyd = ( (Math.abs(dC[0]) < _eps) ? 1 : 0 );
    let dij = v_delta( dC );
    let d_idx = ( ((dij[0] + dij[1]) > _eps) ? 1 : -1 );
    for (let idx=ij[xyd], t=0; (idx >= 0) && (idx<XY[xyd].length); idx += d_idx, t++) {

      if (Cxy[c_nxt][xyd] == XY[xyd][idx]) { break; }

      Bij[ ij[1] ][ ij[0] ] = b_idx;
      Bxy.push( [ X[ij[0]], Y[ij[1]] ] );
      B.push( [ ij[0], ij[1] ] );
      Bt.push( (t==0) ? Ct[c_idx] : 'b' );

      b_idx++;

      ij = v_add( ij, dij );
    }

  }

  if (_debug) {
    _print1da(Bxy,  "\n## Bxy:");
    _print1da(B,    "\n## B:");
    _print1da(Bt,   "\n## Bt:");
    _print2da(Bij,  "\n## Bij:");
  }


  // populate Js ("border jump" structure)
  //
  // Js has four 2d entries, one for each idir (0 +x, 1 -x, 2 +y, 3 -y).
  // Each 2d Js entry holds the index of the first border point
  // encountered if a ray were to start at the ij point and shoot out
  // in the entries direction.
  // If a point starts out of bounds or shoots in a direction that is
  // out of bounds, the entry is -1.
  // By convention, if the starting point is on a border and the ray
  // is in line to the same border, the entry is the index of the
  // first border point encountered after leaving the in line border
  // or the concave (inner corner) if the line border doesn't deposit
  // in an open region.
  //
  // For each direction, we shoot a ray until we hit the border.
  // This should be O(n^2), as we're only touching each entry O(1)
  // times.
  //

  // Below is a lookup table of when to update the near and afar
  // indices.
  // The `idir` is the counterclockwise direction of the border
  // segment encountered (e.g. 2,2 -> up up).
  // `B` means update border index, 1/0 means update indicator,
  // -1 means intialize with special value -1 and `.` means no change.
  //
  // So, for example, if we're populating the Js[+x] structure,
  // we're sweeping from right to left and say
  // we encounter a 2,0 (up, right) border segment, the `B` code
  // indicates update the current index (we don't update
  // the Je[+x] current index).
  //

  //-----------------------------------------------------
  // I - interior, a - afar, n - near
  //
  //        idir      +x        -x        +y        -y
  // idx  prv nxt   I  a  n   I  a  n   I  a  n   I  a  n
  //  0    0   0    .  .  .   .  .  .   0 -1 -1   1  B  B
  //  1    1   1    .  .  .   .  .  .   1  B  B   0 -1 -1
  //  2    2   2    1  B  B   0 -1 -1   .  .  .   .  .  .
  //  3    3   3    0 -1 -1   1  B  B   .  .  .   .  .  .
  //  4    0   2    1  B  B   0 -1 -1   0 -1 -1   1  B  B
  //  5    0   3    .  .  .   .  .  B   .  .  .   .  .  B
  //  6    1   2    .  .  B   .  .  .   .  .  B   .  .  .
  //  7    1   3    0 -1 -1   1  B  B   1  B  B   0 -1 -1
  //  8    2   0    .  .  B   .  .  .   .  .  .   .  .  B
  //  9    2   1    1  B  B   0 -1 -1   1  B  B   0 -1 -1
  //  10   3   0    0 -1 -1   1  B  B   0 -1 -1   1  B  B
  //  11   3   1    .  .  .   .  .  B   .  .  B   .  .  .
  //

  // Note that the walk is in the opposite direction of the ray,
  // so +x above is indicating the ray is shooting in the +x direction
  // but we look at transitions walking from right to left.
  //
  // Whenever we change from exterior to interior, we need to update
  // the near and far saved indices.
  // There are only a few other cases where the near index needs
  // to be updated.
  //

  // An additional "jump flip" structure is created that records
  // the the next change from border to interior or interior to
  // border.
  //
  // 0 - set distance to 0 for current point then increment distance
  // R - update current point with distance but reset distance to 0
  //     afterwards (and increment, setting it to 1 for next round).
  // . - update current point with distance and update distance (increment)
  //
  //
  //-----------------------------------------------------
  //        idir   +x -x +y -y
  // idx  prv nxt   f  f  f  f
  //  0    0   0    .  .  0  0
  //  1    1   1    .  .  0  0
  //  2    2   2    0  0  .  .
  //  3    3   3    0  0  .  .
  //
  //  4    0   2    0  R  R  0
  //  5    0   3    0  R  0  R
  //  6    1   2    R  0  R  0
  //  7    1   3    R  0  0  R
  //  8    2   0    R  0  0  R
  //  9    2   1    0  R  0  R
  //  10   3   0    R  0  R  0
  //  11   3   1    0  R  R  0
  //


  // Consider updating the Js structure for the +x direction.
  // We are walking from right to left, so in the opposite of the +x
  // Js portion we're filling out.
  // We start with a near index as -1, representing the outside.
  // As we walk from right to left, we update the point with
  // whatever our current near index is.
  // We update the near index (after the Js entry update) depending on what 
  // point it is:
  //   - if it's a border with outside on right and inside on left,
  //     reset near index to the current border index
  //   - if it's a a border corner with border on the right and
  //     interior or non-contiguous border on left, update the near
  //     index
  //   - otherwise no change to near index
  //
  // In some sense this is a state machine that updates the
  // near index to populate the Js entries with depending on the
  // three-point/two-line-segments we see if the current point
  // is a border.
  //
  // The interior state is unused but kept in case we might
  // want it for the future.
  //
  //-----------------------------------------------------

  // idir to lookup
  //
  let _idir2lu = [
    [  0, -1,  4,  5 ],
    [ -1,  1,  6,  7 ],
    [  8,  9,  2, -1 ],
    [ 10, 11, -1,  3 ]
  ];

  /*
  // lookup to Interior, afar, near
  //
  let _lu_Ian = [

    // idir_prv, idir_nxt
    // e.g. 21 y-up (+y) followed by x-left (-x)
    // note that the cleave can't go back on itself, so e.g. 01 isn't represented
    //
    //  00     11     22     33     02     03     12     13     20     21     30     31
    //
    [ "...", "...", "1BB", "0--", "1BB", "...", "..B", "0--", "..B", "1BB", "0--", "..." ],
    [ "...", "...", "0--", "1BB", "0--", "..B", "...", "1BB", "...", "0--", "1BB", "..B" ],

    [ "0--", "1BB", "...", "...", "0--", "...", "..B", "1BB", "...", "1BB", "0--", "..B" ],
    [ "1BB", "0--", "...", "...", "1BB", "..B", "...", "0--", "..B", "0--", "1BB", "..." ]

  ];
  */

  //  idx:                0   1   2   3   4   5   6   7   8   9  10  11
  //  idir_prv,idir_nxt: 00  11  22  33  02  03  12  13  20  21  30  31

  // Interior code lookup
  //
  let _lu_I = [
    "..101..0.10.",
    "..010..1.01.",
    "01..0..1.10.",
    "10..1..0.01."
  ];

  // afar code lookup
  //
  let _lu_afar = [
    "..B-B..-.B-.",
    "..-B-..B.-B.",
    "-B..-..B.B-.",
    "B-..B..-.-B."
  ];

  // near code lookup
  //
  let _lu_near = [
    "..B-B.B-BB-.",
    "..-B-B.B.-BB",
    "-B..-.BB.B-B",
    "B-..BB.-B-B."
  ];

  // flip code lookup
  //
  let _lu_f = [
    "..0000RRR0R0",
    "..00RR000R0R",
    "00..R0R000RR",
    "00..0R0RRR00"
  ];

  // begin, end, delta for X and Y directions
  //
  let _ibound = [
    [ [X.length-1, -1, -1], [0,Y.length,1] ],
    [ [0, X.length, 1],     [0,Y.length,1] ],
    [ [0, X.length, 1],     [Y.length-1,-1,-1] ],
    [ [0, X.length, 1],     [0,Y.length,1] ]
  ];

  for (let idir=0; idir<4; idir++) {

    let _interior = 0;
    let afar_B_idx = -1,
        near_B_idx = -1,
        dist_B = -1;

    if (idir < 2) {

      for (let j = _ibound[idir][1][0]; j != _ibound[idir][1][1]; j += _ibound[idir][1][2]) {

        afar_B_idx = -1;
        near_B_idx = -1;
        dist_B = -1;

        let f_reset = 0;

        for (let i = _ibound[idir][0][0]; i != _ibound[idir][0][1]; i += _ibound[idir][0][2]) {

          Je[idir][j][i] = afar_B_idx;
          Js[idir][j][i] = near_B_idx;

          if (Bij[j][i] >= 0) {

            let cur_B_idx = Bij[j][i];
            let cur_B_ij = B[cur_B_idx];
            let prv_B_ij = B[(cur_B_idx-1 + B.length) % B.length];
            let nxt_B_ij = B[(cur_B_idx+1) % B.length];

            let _dprv = v_sub( cur_B_ij, prv_B_ij );
            let _dnxt = v_sub( nxt_B_ij, cur_B_ij );

            let _idir_prv = dxy2idir( _dprv );
            let _idir_nxt = dxy2idir( _dnxt );

            let __c = cur_B_idx;
            let __p = (cur_B_idx-1 + B.length) % B.length ;

            let _lu = _idir2lu[ _idir_prv ][ _idir_nxt ];

            let _I_code = _lu_I[idir][_lu];
            let _afar_code = _lu_afar[idir][_lu];
            let _near_code = _lu_near[idir][_lu];

            if      (_I_code == '0') { _interior = 0; }
            else if (_I_code == '1') { _interior = 1; }

            if      (_afar_code == 'B') { afar_B_idx = cur_B_idx; }
            else if (_afar_code == '-') { afar_B_idx = -1; }

            if      (_near_code == 'B') { near_B_idx = cur_B_idx; }
            else if (_near_code == '-') { near_B_idx = -1; }

            /*
            let _code = _lu_Ian[idir][ _idir2lu[ _idir_prv ][ _idir_nxt ] ];

            if      (_code[0] == '0') { _interior = 0; }
            else if (_code[0] == '1') { _interior = 1; }

            if      (_code[1] == 'B') { afar_B_idx = cur_B_idx; }
            else if (_code[1] == '-') { afar_B_idx = -1; }

            if      (_code[2] == 'B') { near_B_idx = cur_B_idx; }
            else if (_code[2] == '-') { near_B_idx = -1; }
            */


            let _f_code = _lu_f[idir][ _idir2lu[ _idir_prv ][ _idir_nxt ] ];

            if      (_f_code == '0') { dist_B = 0; }
            else if (_f_code == 'R') { f_reset = 1; }
          }

          Jf[idir][j][i] = dist_B;

          if (f_reset) { dist_B = 0; }
          f_reset = 0;

          dist_B++;

        }

      }

    }

    else {

      for (let i = _ibound[idir][0][0]; i != _ibound[idir][0][1]; i += _ibound[idir][0][2]) {

        afar_B_idx = -1;
        near_B_idx = -1;
        dist_B = -1;

        let f_reset = 0;

        for (let j = _ibound[idir][1][0]; j != _ibound[idir][1][1]; j += _ibound[idir][1][2]) {

          Je[idir][j][i] = afar_B_idx;
          Js[idir][j][i] = near_B_idx;

          if (Bij[j][i] >= 0) {

            let cur_B_idx = Bij[j][i];
            let cur_B_ij = B[cur_B_idx];
            let prv_B_ij = B[(cur_B_idx-1 + B.length) % B.length];
            let nxt_B_ij = B[(cur_B_idx+1) % B.length];

            let _dprv = v_sub( cur_B_ij, prv_B_ij );
            let _dnxt = v_sub( nxt_B_ij, cur_B_ij );

            let _idir_prv = dxy2idir( _dprv );
            let _idir_nxt = dxy2idir( _dnxt );

            let _lu = _idir2lu[ _idir_prv ][ _idir_nxt ];

            let _I_code = _lu_I[idir][_lu];
            let _afar_code = _lu_afar[idir][_lu];
            let _near_code = _lu_near[idir][_lu];

            if      (_I_code == '0') { _interior = 0; }
            else if (_I_code == '1') { _interior = 1; }

            if      (_afar_code == 'B') { afar_B_idx = cur_B_idx; }
            else if (_afar_code == '-') { afar_B_idx = -1; }

            if      (_near_code == 'B') { near_B_idx = cur_B_idx; }
            else if (_near_code == '-') { near_B_idx = -1; }

            /*
            let _code = _lu_Ian[idir][ _idir2lu[ _idir_prv ][ _idir_nxt ] ];

            if      (_code[0] == '0') { _interior = 0; }
            else if (_code[0] == '1') { _interior = 1; }

            if      (_code[1] == 'B') { afar_B_idx = cur_B_idx; }
            else if (_code[1] == '-') { afar_B_idx = -1; }

            if      (_code[2] == 'B') { near_B_idx = cur_B_idx; }
            else if (_code[2] == '-') { near_B_idx = -1; }
            */

            let _f_code = _lu_f[idir][ _idir2lu[ _idir_prv ][ _idir_nxt ] ];

            if      (_f_code == '0') { dist_B = 0; }
            else if (_f_code == 'R') { f_reset = 1; }
          }

          Jf[idir][j][i] = dist_B;

          if (f_reset) { dist_B = 0; }
          f_reset = 0;

          dist_B++;

        }

      }

    }


  }

  if (_debug) {
    let idir_descr = [ "+x", "-x", "+y", "-y" ];
    for (let idir=0; idir<4; idir++) {
      _print2da(Js[idir],   "\n## Js[" + idir_descr[idir] + "]:");
    }
  }


  // 0000 0001 0010 0011
  //
  //   x    ?    ?    =
  //
  // 0100 0101 0110 0111
  //
  //   ?    L    J   _|_
  //
  // 1000 1001 1010 1011
  //
  //   ?    r    7   T
  //
  // 1100 1101 1110 1111
  //
  //   |    F    -|  .
  //

  let gt_lu = [
    'x', '?', '?', '=',
    '?', 'L', 'J', 't',
    '?', 'r', '7', 'T',
    '|', 'F', 'd', 'i'
  ];

  let g_idx = 0;
  for (let j=0; j<Y.length; j++) {
    for (let i=0; i<X.length; i++) {
      if ( (Js[0][j][i] < 0) &&
           (Js[1][j][i] < 0) &&
           (Js[2][j][i] < 0) &&
           (Js[3][j][i] < 0) ) { continue; }

      let t =
        ((Js[0][j][i] < 0) ? 0 : 1) +
        ((Js[1][j][i] < 0) ? 0 : 2) +
        ((Js[2][j][i] < 0) ? 0 : 4) +
        ((Js[3][j][i] < 0) ? 0 : 8);

      G.push( [i,j] );
      Gxy.push( [X[i], Y[j]] );
      Gt.push( gt_lu[t] );
      Gij[j][i] = g_idx;

      g_idx++;

    }
  }

  for (let j=0; j<Y.length; j++) {
    for (let i=0; i<X.length; i++) {

      for (let idir=0; idir<4; idir++) {
        if (Gij[j][i] < 0) { Jf[idir][j][i] = -1; }
      }

    }
  }

  let DP_cost = {},
      DP_partition = {},
      DP_bower = {},
      DP_rect = {};

  /*
  let DP_cost = [],
      DP_partition = [],
      DP_bower = [],
      DP_rect = [];

  for (let i=0; i<(2*B.length*B.length); i++) {
    DP_cost.push(-1);
    DP_partition.push("XXXXXXXXXXXX");
    DP_bower.push(-1);
    DP_rect.push(-1);
  }
  */

  // RPRP context
  //
  return {
    "X" : X,
    "Y" : Y,

    "Cxy": Cxy,
    "Ct" : Ct,

    "G"  : G,
    "Gt" : Gt,
    "Gij": Gij,
    "Gxy": Gxy,

    "B"  : B,
    "Bt" : Bt,
    "Bxy": Bxy,
    "Bij": Bij,

    "Js" : Js,
    "Je" : Je,
    "Jf" : Jf,

    "DP_root_key": "",
    "DP_partition": DP_partition,
    "DP_bower": DP_bower,
    "DP_rect": DP_rect,

    "DP_cost" : DP_cost
  };

}

// By convention, border indices are in counterclockwise order.
//
// Is idx in the interval [idx_s, idx_e] (inclusive) or,
// if idx_e < idx_s one of the two intervals [0,idx_e] [idx_s, N-1]
// (inclusive)?
//
// 0 if not in inclusive interval
// 1 if in inclusive interval
//
// In the special case that idx_s == idx_e, return 1 (considered
// in interval)
//
function wrapped_range_contain( idx, idx_s, idx_e ) {
  if (idx < 0) { return 0; }
  if (idx_e > idx_s ) {
    if ((idx >= idx_s) && (idx <= idx_e)) { return 1; }
    return 0;
  }
  if ((idx > idx_e) && (idx < idx_s)) { return 0; }
  return 1;
}

function _ivec_incr(v,b) {
  b = ((typeof b === "undefined") ? 2 : b);
  let carry = 1;

  for (let i=0; (i<v.length) && (carry > 0); i++) {
    carry = 0;
    v[i]++;
    if (v[i] >= b) {
      v[i] = 0;
      carry = 1;
    }
  }

  return carry;
}

function _ivec0(v) {
  for (let i=0; i<v.length; i++) {
    if (v[i] != 0) { return false; }
  }
  return true;
}

// Test for cleave on border.
// That is, cleave is inline with a boundary edge.
//
// Return:
//
// 0 cleave not on boundary edge (oob, inside, etc.)
// 1 cleave is on edge
//
function RPRP_cleave_border(ctx, g, idir) {

  // cleave oob
  //
  if ( ctx.Js[idir][ g[1] ][ g[0] ] < 0 ) { return 0; }

  let dg = [ [1,0], [-1,0], [0,1], [0,-1] ];

  let g_nei = [
    g[0] + dg[idir][0],
    g[1] + dg[idir][1]
  ];

  let _bb = ctx.Bij[g[1]][g[0]]
  let _be = ctx.Bij[g_nei[1]][g_nei[0]]

  // boundary index is within 1 of each other
  //
  if ((_bb < 0) || (_be < 0) ||
      (Math.abs(_be-_bb) != 1)) {
    return 0;
  }

  return 1;
}

// Input:
//
// ctx  - rprp context
// g_s  - border grid point (ij) start of region (ccw)
// g_e  - border grid point (ij) end of region
// g_a  - origin of quarry rectangle (adit)
// g_b  - end of quarry rectangle (bower)
//
//
// Output:
//
// [ q0, q1, ... , q11 ]
//
// 12 element array of indicating what type of ray it is:
//
// 'x' - out of bounds of the rectilinear polygon
// 'X' - out of bounds of the region
// 'c' - corner border point
// 'b' - flat edge border
// '.' - open (cleave cut potenteially allowed)
//
// The cleave profile is meant to be used in the cleave enumeration step.
//
// Create a cleave cut profile, an array of character codes indicating
// whether a cleave cut off of the quarry rectangle endpoints is possible
// and, if not, what type of ray it is.
//
// Note that if it's a 2-cut, g_a is the intersection point of the lines
// eminating from g_s and g_e.
// If it's a 1-cut, then g_a should be g_s or g_e.
//
// No checks are done to see if the rectangle is valid, whether g_a
// is a valid endpoint, etc.
//
function RPRPCleaveProfile(ctx, g_s, g_e, g_a, g_b) {
  let X = ctx.X,
      Y = ctx.Y;
  let Bij = ctx.Bij;

  // boundary start and end index
  //
  let b_idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let b_idx_e = Bij[ g_e[1] ][ g_e[0] ];

  if ((b_idx_s < 0) || (b_idx_e < 0)) { return []; }

  // grid rectangle corners
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let cleave_idir = [ 0, 3,  3, 1,  1, 2,  2, 0 ];

  let cleave_profile = [ '~', '~', '~', '~', '~', '~', '~', '~' ];

  for (let i=0; i<cleave_idir.length; i++) {
    let g = Rg[ Math.floor(i/2) ];

    let b_c_idx = ctx.Js[ cleave_idir[i] ][ g[1] ][ g[0] ];

    // cleave oob
    //
    if (b_c_idx < 0) {
      cleave_profile[i] = 'x';
      continue;
    }

    // cleave is within polygon but not in considered region
    //
    if ( ! wrapped_range_contain( b_c_idx, b_idx_s, b_idx_e ) ) {
      cleave_profile[i] = 'X';
      continue;
    }

    // cleave inline with boundary edge
    //
    if ( RPRP_cleave_border(ctx, g, cleave_idir[i] ) ) {
      cleave_profile[i] = 'b';
      continue;
    }

    // cleave on corner
    //
    if ((b_c_idx == b_idx_s) || (b_c_idx == b_idx_e)) {
      cleave_profile[i] = 'c';
      continue;
    }

    // cleave open
    //
    cleave_profile[i] = '.';
    continue;

  }

  return cleave_profile;
}

// Cleave cut index around the quarry rectangle:
//
//   5     6
// 4 ._____. 7
//   |     |
// 3 ._____. 0
//   2     1
//
//

// Input:
//
// rprp_info      - rprp context
// grid_quarry    - grid points of quarry rectangle, in standard order (idx 0 lower right, idx 3 upper right)
// cleave_choice  - character indicator for each cleave choice (aka cleave profile)
//                `-` open
//                `*` cleave cut
//                `x` invalid direction (out of bounds)
//                `X` invalid direction (out of bounds in other region)
// cleave_border_type - character indicator for each cleave choice what type of general grid point it
//                      ends on for the rectilinear polygon border
//                      `b` border (flat)
//                      `*` corner (convex or concave)
//
// Output:
//
//  1 - cleave_choice is valid
//  0 - otherwise
//
// This checks to see if the cleave_choice is valid given a quarry rectangle and current state.
// The main checks are:
//
// Bridge   - make sure a cleave cut isn't in between two lines (it can move otherwise)
// Float    - make sure each cleave cut, when extended, ends on a convex border corner
// Parallel - make sure no two cleave cuts are parallel (quarry edge can move otherwise)
//
// Parallel tests are easy as it's wholly embedded in the cleave_choice.
// Bridge tests are easy enough because we can see if the end of the cleave cut
//   ends on a flat border and if there's a cleave cut perpendicular to where the cleave cut starts.
// Float tests are harder as we need to look in the other direction, both from potential cleave
//   cuts shooting off of the quarry rectangle in the other direction or look to see if the border
//   intersects the quarry rectangle on the side of the cleave cut. See below for a discussion of
//   the test.
//

function RPRP_valid_cleave(ctx, quarry, cleave_choice, cleave_border_type, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let R = quarry;

  let Js = ctx.Js;
  let Jf = ctx.Jf;

  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let quarry_point_type = ['~', '~', '~', '~'];

  for (let i=0; i<4; i++) {
    let b_id = Bij[ R[i][1] ][ R[i][0] ];

    if (b_id < 0) {
      quarry_point_type[i] = '.';
      continue;
    }

    quarry_point_type[i] = Bt[b_id];
  }

  if (_debug > 1) { console.log("#vc.cp0"); }

  let redux = [];
  for (let i=0; i<cleave_choice.length; i++) {
    let _code = '^';
    if      (cleave_choice[i] == '-') { _code = '-'; }
    else if (cleave_choice[i] == '*') { _code = '*'; }
    else if (cleave_choice[i] == 'c') { _code = '*'; }
    else if (cleave_choice[i] == 'b') { _code = '*'; }
    //else if (cleave_choice[i] == 'b') { _code = 'b'; }
    else if (cleave_choice[i] == 'x') { _code = 'x'; }
    else if (cleave_choice[i] == 'X') { _code = 'x'; }
    //else { console.log("!!!!", i, cleave_choice[i]); }

    redux.push( _code );
  }

  // quarry rectangle edge is 'undocked', not
  // buffetted by a border perimeter
  //

  let oppo_idir  = [1,0, 3,2];
  let cleave_idir = [ 0,3, 3,1, 1,2, 2,0 ];

  let R_idir_B = [
    [-1,-1,-1,-1],
    [-1,-1,-1,-1],
    [-1,-1,-1,-1],
    [-1,-1,-1,-1]
  ];

  let R_B = [
    Bij[ R[0][1] ][ R[0][0] ],
    Bij[ R[1][1] ][ R[1][0] ],
    Bij[ R[2][1] ][ R[2][0] ],
    Bij[ R[3][1] ][ R[3][0] ]
  ];

  let R_Bt = [
    ((R_B[0] < 0) ? '.' : Bt[ R_B[0] ]),
    ((R_B[1] < 0) ? '.' : Bt[ R_B[1] ]),
    ((R_B[2] < 0) ? '.' : Bt[ R_B[2] ]),
    ((R_B[3] < 0) ? '.' : Bt[ R_B[3] ])
  ];

  let Rl = [
    R[0][0] - R[1][0],
    R[2][1] - R[1][1],
    R[3][0] - R[2][0],
    R[3][1] - R[0][1]
  ];

  // We're testing to see if there's a portion of the boundary
  // that butts up against the quarry rectangle (without piercing through).
  // If the quarry side is free floating, we call it 'undocked' (dock == 1).
  //
  // The bridge tests, seeing if two cleave cuts are parallel and thus
  // allowing the quarry rectangle side to move, relies on the quarry rectangle
  // side being undocked.
  // If there was a portion of the boundary that butted up against the quarry
  // rectangle side, this doesn't invalidate parallel cleave cuts on that side.
  //
  for (let idx=0; idx < 8; idx++) {
    let r_idx = Math.floor(idx/2);
    let idir = cleave_idir[idx];
    let rdir = oppo_idir[idir];

    let B = Js[ idir ][ R[r_idx][1] ][ R[r_idx][0] ];
    if (B < 0) { B = Bij[ R[r_idx][1] ][ R[r_idx][0] ]; }

    let b = Js[ rdir ][ R[r_idx][1] ][ R[r_idx][0] ];
    if (b < 0) { b = Bij[ R[r_idx][1] ][ R[r_idx][0] ]; }

    //let B = B = Bij[ R[r_idx][1] ][ R[r_idx][0] ];
    //if (B < 0) { Js[ idir ][ R[r_idx][1] ][ R[r_idx][0] ]; }

    //let b = Bij[ R[r_idx][1] ][ R[r_idx][0] ];
    //if (b < 0) { b = Js[ rdir ][ R[r_idx][1] ][ R[r_idx][0] ]; }

    R_idir_B[r_idx][idir] = B;
    R_idir_B[r_idx][rdir] = b;
  }

  // Check to see border jump values match in the two
  // in-line directions of each of the quarry rectangle edges.
  //
  // If they don't, there's a border buffetting them, and
  // the side is lablled as docked.
  //

  //let _undock = [ 1, 1, 1, 1 ];
  //let _dock = [ 0, 0, 0, 0 ];

  let _rcur = -1,
      _rnxt = -1;

  //-----
  //-----
  //-----
  let _dock = [-1,-1,-1,-1];

  // bottom edge of quarry rectangle
  //
  _rcur = 0; _rnxt = 1;

  //let idir_sched = [ 0, 3, 1, 2 ];
  let idir_sched = [ 1, 2, 0, 3 ];

  for (let r_idx=0; r_idx<4; r_idx++) {

    let _rcur = r_idx;
    let _rnxt = (r_idx+1)%4;

    let _idir = idir_sched[r_idx];
    let _rdir = oppo_idir[_idir];

    if (R_Bt[_rcur] == '.') {

      _dock[r_idx] = 1;

      if (Jf[_idir][ R[_rcur][1] ][ R[_rcur][0] ] >= Rl[r_idx]) {

        if (_debug) { console.log("#qi.dock.a.0 (R line", r_idx, "undocked)"); }

        _dock[r_idx] = 0;
      }
      else  {
        if (_debug) { console.log("#qi.dock.a.1 (R line", r_idx, "docked)"); }
      }

    }

    // quarry endpoint on boundary
    //
    else {

      _dock[r_idx] = 1;

      // If the quarry endpoint is on a boundary in-line with
      // the quarry edge, then automatically docked.
      //
      if (Jf[_idir][ R[_rcur][1] ][ R[_rcur][0] ] > 0) {

        if (_debug) { console.log("#qi.dock.b.1 (R line", r_idx, "docked",
            "R_B[", _rcur, "]:", R_B[_rcur],
            "Jf:", Jf[_idir][R[_rcur][1] ][ R[_rcur][0] ],
            ")"); }

        _dock[r_idx] = 1;
      }

      // otherwise the quarry endpoint is on the boundary but quarry
      // edge is at least partially not on the boundary as it starts
      // from _rcur going in _idir direction.
      //
      // If the border jump point from _rcur is either the boundary point
      // of _rnxt or _rcur and _rnxt have the same border jump point,
      // the quarry edge must be undocked.
      //
      else if ( (R_idir_B[_rcur][_idir] == R_B[_rnxt]) ||
                (R_idir_B[_rcur][_idir] == R_idir_B[_rnxt][_idir]) ) {

        if (_debug) { console.log("#qi.dock.b.0 (R line", r_idx, "undocked)"); }

        _dock[r_idx] = 0;
      }

      else {

        if (_debug) { console.log("#qi.dock.c.1 (R line", r_idx, "docked)"); }

      }


    }

  }

  //-----
  //-----
  //-----

  /*


  _rcur = 0; _rnxt = 1;
  if ( (R_idir_B[_rcur][0] != R_idir_B[_rnxt][0]) ||
       (R_idir_B[_rcur][1] != R_idir_B[_rnxt][1]) ) {
    //_undock[0] = 0;
    _dock[0] = 1;
  }

  if ( ((R_Bt[_rcur] == 'c') && (R_idir_B[_rnxt][0] == R_Bt[_rcur])) ||
       ((R_Bt[_rnxt] == 'c') && (R_idir_B[_rcur][1] == R_Bt[_rnxt])) ) {
    _dock[0] = 1;
  }

  // STILL BUGGY
  // working on it.
  // If either corner is on a border, it's docked
  // If either has a corner facing inwoards, then its docked
  // else, it's undocked.


  if ( ((R_Bt[_rcur] == 'c') && (R_idir_B[_rnxt][0] == R_B[_rcur])) ||
       ((R_Bt[_rnxt] == 'c') && (R_idir_B[_rcur][1] == R_B[_rnxt])) ) { 
    _dock[0] = 0;
  }


  _rcur = 1; _rnxt = 2;
  if ( (R_idir_B[_rcur][2] != R_idir_B[_rnxt][2]) ||
       (R_idir_B[_rcur][3] != R_idir_B[_rnxt][3]) ) {
    //_undock[1] = 0;
    _dock[1] = 1;
  }

  if ( ((R_Bt[_rcur] == 'c') && (R_idir_B[_rnxt][3] == R_B[_rcur])) ||
       ((R_Bt[_rnxt] == 'c') && (R_idir_B[_rcur][2] == R_B[_rnxt])) ) { 
    _dock[1] = 0;
  }


  _rcur = 2; _rnxt = 3;
  if ( (R_idir_B[_rcur][0] != R_idir_B[_rnxt][0]) ||
       (R_idir_B[_rcur][1] != R_idir_B[_rnxt][1]) ) {
    //_undock[2] = 0;
    _dock[2] = 1;
  }

  if ( ((R_Bt[_rcur] == 'c') && (R_idir_B[_rnxt][1] == R_B[_rcur])) ||
       ((R_Bt[_rnxt] == 'c') && (R_idir_B[_rcur][0] == R_B[_rnxt])) ) { 
    _dock[2] = 0;
  }


  _rcur = 3; _rnxt = 0;
  if ( (R_idir_B[_rcur][2] != R_idir_B[_rnxt][2]) ||
       (R_idir_B[_rcur][3] != R_idir_B[_rnxt][3]) ) {
    //_undock[3] = 0;
    _dock[3] = 1;
  }

  if ( ((R_Bt[_rcur] == 'c') && (R_idir_B[_rnxt][3] == R_B[_rcur])) ||
       ((R_Bt[_rnxt] == 'c') && (R_idir_B[_rcur][2] == R_B[_rnxt])) ) { 
    _dock[3] = 0;
  }

  */

  //---






  //if (_debug > 1) { console.log("#vc.cp1:", cleave_choice.join(""), redux.join(""), JSON.stringify(_undock) ); }
  if (_debug > 1) {
    console.log("#vc.cp1:", cleave_choice.join(""), redux.join(""), JSON.stringify(_dock) );
    console.log("#vc.cp1.1:", "R_idir_B:", JSON.stringify(R_idir_B), "R_B:", JSON.stringify(R_B), "R_Bt:", R_Bt.join(""));
  }

  // each corner needs at least one cleave cut
  //
  if ((redux[0] == '-') && (redux[1] == '-')) { return 0; }
  if ((redux[2] == '-') && (redux[3] == '-')) { return 0; }
  if ((redux[4] == '-') && (redux[5] == '-')) { return 0; }
  if ((redux[6] == '-') && (redux[7] == '-')) { return 0; }

  if (_debug > 1) { console.log("#vc.cp2"); }

  // parallel cleave cuts means middle billet is moveable
  //
  //if ((_undock[3] == 1) && (redux[0] == '*') && (redux[7] == '*')) { return 0; }
  //if ((_undock[0] == 1) && (redux[1] == '*') && (redux[2] == '*')) { return 0; }
  //if ((_undock[1] == 1) && (redux[3] == '*') && (redux[4] == '*')) { return 0; }
  //if ((_undock[2] == 1) && (redux[5] == '*') && (redux[6] == '*')) { return 0; }

  if ((_dock[3] == 0) && (redux[0] == '*') && (redux[7] == '*')) { return 0; }
  if ((_dock[0] == 0) && (redux[1] == '*') && (redux[2] == '*')) { return 0; }
  if ((_dock[1] == 0) && (redux[3] == '*') && (redux[4] == '*')) { return 0; }
  if ((_dock[2] == 0) && (redux[5] == '*') && (redux[6] == '*')) { return 0; }


  if (_debug > 1) { console.log("#vc.cp3, redux:", redux.join(""), "cbt:", cleave_border_type.join("") ); }

  // bridge tests
  // cleave line bridges two borders, so is moveable, invalidating choice
  //
  // if there's a cleave line that ends on a flat boundary edge
  // and there's a cleave line going orthogonal, it's a bridge (-> invalid)
  //
  // These set of tests look only at the cleave line to see if it itself is
  // moveable.
  //
  if ((redux[0] == '*') && (redux[1] == '*') && (cleave_border_type[0] == 'b')) { return 0; }
  if ((redux[1] == '*') && (redux[0] == '*') && (cleave_border_type[1] == 'b')) { return 0; }

  if ((redux[2] == '*') && (redux[3] == '*') && (cleave_border_type[2] == 'b')) { return 0; }
  if ((redux[3] == '*') && (redux[2] == '*') && (cleave_border_type[3] == 'b')) { return 0; }

  if ((redux[4] == '*') && (redux[5] == '*') && (cleave_border_type[4] == 'b')) { return 0; }
  if ((redux[5] == '*') && (redux[4] == '*') && (cleave_border_type[5] == 'b')) { return 0; }

  if ((redux[6] == '*') && (redux[7] == '*') && (cleave_border_type[6] == 'b')) { return 0; }
  if ((redux[7] == '*') && (redux[6] == '*') && (cleave_border_type[7] == 'b')) { return 0; }


  // We also need to test if the cleave line then makes the quarry rectangle edge moveable
  //
  //if ((redux[0] == '*') && 

  if (_debug > 1) { console.log("#vc.cp4, redux:", redux.join(""), "cbt:", cleave_border_type.join("") ); }


  // float tests
  // at least one end must be on a corner
  //

  // we'll use cleave 5 (upper left corner, pointing upwards) as an example:
  //
  // IF   cleave_5 is present and ends on a border (upwards) (that is, it doesn't end on a corner)
  // AND  opposite of cleave_5 (cleave_2) exists and ends on a border or
  //        cleave_2 doesn't exist at all
  // AND  origin point of cleave_5 (quarry_point_2) has the same endpoint as
  //        origin of clave_2 (quarry_point_1)
  // AND  cleave_5 doesn't start on an original corner border
  // THEN cleave cut is floating
  //
  // It's verbose but the idea is that if cleave 5 ends on a border
  // then either there must be a corner butting the quarry rectangle
  // (determined from the endpoint tests) or the opposive cleave 2 has
  // to end on a corner.
  //


  if (_debug > 1) { console.log("#vc.cp5"); }

  //let cleave_idir = [ 0, 3,  3, 1,  1, 2,  2, 0 ];
  let oppo_cleave = [ 3, 6, 5, 0,
                      7, 2, 1, 4 ];
  //let oppo_idir = [ 1,0, 3,2 ];

  // These tests are still pretty janky.
  // I'm nervous that these are too ad-hoc, don't account for every case and/or
  // mark some configurations as floats when they're not.
  //

  // FLOAT TEST
  // FLOAT TEST
  let _float_test = false;
  if (_float_test) {

  if (_debug > 2) {
    console.log("#vc cc:", cleave_choice.join(""),
      "cbt:", cleave_border_type.join(""),
      "redux:", redux.join("") );
  }

  // trying to simplify the float cleave tests
  //
  for (cleave_idx = 0; cleave_idx < 8; cleave_idx++) {
    let r_idx = Math.floor(cleave_idx/2);
    let rev_cleave_idx = oppo_cleave[cleave_idx];
    let rev_r_idx = Math.floor(rev_cleave_idx/2);
    let idir = cleave_idir[cleave_idx];
    let rdir = oppo_idir[idir];

    let l_idx_lu = [ 0,3, 1,0, 2,1, 3,2 ];
    let l_idx = l_idx_lu[cleave_idx];

    let cleave_endpoint = [-1,-1];

    // If the cleave position isn't a constructed line or a cleave choice,
    // we can ignore it.
    //
    if ((cleave_choice[cleave_idx] != '*') &&
        (cleave_choice[cleave_idx] != 'c')) {

      if (_debug > 2) { console.log("#vc.skip.0 (not a cleave/constructed line, cc[", cleave_idx, "] =", cleave_choice[cleave_idx], ")"); }

      continue;
    }

    if ( Bij[ R[r_idx][1] ][ R[r_idx][0] ] >= 0 ) {

      if (_debug > 2) { console.log("#vc.skip.1 (on border/corner, B:", Bij[ R[r_idx][1] ][ R[r_idx][0] ],")"); }

      continue;
    }

    cleave_endpoint[0] = B[ Js[idir][ R[r_idx][1] ][ R[r_idx][0] ] ];

    if ((cleave_choice[rev_cleave_idx] == '*') ||
        (cleave_choice[rev_cleave_idx] == 'c') ||
        (Jf[rdir][ R[r_idx][1] ][ R[r_idx][0] ] <= Rl[l_idx])) {
      cleave_endpoint[1] = B[ Js[rdir][ R[r_idx][1] ][ R[r_idx][0] ] ];
    }

    else {
      cleave_endpoint[1] = R[rev_r_idx];
    }

    let _corner_count = 0;

    let _b0 = Bij[ cleave_endpoint[0][1] ][ cleave_endpoint[0][0] ];
    let _b1 = Bij[ cleave_endpoint[1][1] ][ cleave_endpoint[1][0] ];

    if ( (_b0 >= 0) && (Bt[_b0] == 'c') ) { _corner_count++; }
    if ( (_b1 >= 0) && (Bt[_b1] == 'c') ) { _corner_count++; }

    if (_corner_count == 0) {
      if (_debug > 2) { console.log("#vc.float! (cleave_endpoint:", JSON.stringify(cleave_endpoint)); }
      return 0;
    }

  }

  }
  // FLOAT TEST
  // FLOAT TEST

  if (_debug > 1) { console.log("#vc.cp6"); }

  return 1;
}


// go through all possibilities of cleave cuts from quarry rectangle (end points).
// Maximum is 2^8 = 256 but this is reduced by only considering cleave cuts for
// '.' entries of the cleave profile.
//
// This function returns a list of cleave cuts that pass tests,
// where a cleave cut realization can be removed from consideration if it has:
//
// * bridges:   cleave cut has endpoints on flat borders, so is moveable
// * floats:    maximum edge of cleave cut does not end on a primitive convex border point
// * parallel:  there is another cleave cut parallel to it
//
// cleave cuts will also not be chosen the go outside of the region, as defined
// by the counterclockwise trace of the general border grid point g_s to the general
// border grid point g_e.
//
// This function takes as input grid points, as opposed to `enumerateCleaveCutPoint`, which
// takes in general points.
//
function RPRP_cleave_enumerate(ctx, g_s, g_e, g_a, g_b, cleave_profile, _debug) {

  //let _debug = false;
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  //DEBUG
  //DEBUG
  //DEBUG
  //_debug=1;
  //DEBUG
  //DEBUG
  //DEBUG

  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let Js = ctx.Js;

  // boundary start and end index
  //
  let b_idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let b_idx_e = Bij[ g_e[1] ][ g_e[0] ];

  if (_debug > 1) {
    console.log("#ce.beg:s,e,g_s,g_e,g_a,g_b:", b_idx_s, b_idx_e, g_s, g_e, g_a, g_b);
  }

  if ((b_idx_s < 0) || (b_idx_e < 0)) { return []; }

  let cleave_a = [];

  // grid rectangle corners
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let cleave_nei = [ 1,0, 3,2, 5,4, 7,6 ];

  let cleave_idir = [ 0, 3,  3, 1,  1, 2,  2, 0 ];

  let bvec = [],
      bvec_idx = [];
  for (let i=0; i<cleave_profile.length; i++) {
    if (cleave_profile[i] == '.') {
      bvec.push(0);
      bvec_idx.push(i);
    }
  }

  if (_debug > 1) {
    console.log("#ce.profile:", cleave_profile.join(""));
  }

  let cleave_border_type = [ '~', '~', '~', '~', '~', '~', '~', '~' ];

  for (let i=0; i<cleave_profile.length; i++) {

    if ((cleave_profile[i] == 'x') || (cleave_profile[i] == 'X')) {
      cleave_border_type[i] = 'x';
      continue;
    }

    if (cleave_profile[i] == 'b') {
      cleave_border_type[i] = 'b';
      continue;
    }

    if (cleave_profile[i] == 'c') {
      cleave_border_type[i] = '*';
      continue;
    }

    if (cleave_profile[i] == '.') {
      let r_idx = Math.floor(i/2);
      let b_idx = Js[ cleave_idir[i] ][ Rg[r_idx][1] ][ Rg[r_idx][0] ];

      let _type = Bt[b_idx];

      if      (_type == 'b') { cleave_border_type[i] = 'b'; }
      else if (_type == 'c') { cleave_border_type[i] = '*'; }
    }

  }

  let cleave_choices = [];

  do {

    let b_idx = 0;
    let cleave_choice = [];
    for (let i=0; i<cleave_profile.length; i++) {
      cleave_choice.push( cleave_profile[i] );
      if (cleave_profile[i] == '.') {
        cleave_choice[i] = ( bvec[b_idx] ? '*' : '-' );
        b_idx++;
      }
      else if (cleave_profile[i] == 'c') {
        cleave_choice[i] = '*';
      }

    }

    if (_debug > 1) {
      console.log("#ce.enum:bvec,cc,valid:", JSON.stringify(bvec), cleave_choice.join(""),
        RPRP_valid_cleave( ctx, Rg, cleave_choice, cleave_border_type, _debug ) );
    }

    if (RPRP_valid_cleave( ctx, Rg, cleave_choice, cleave_border_type )) {
      cleave_choices.push(cleave_choice);
    }

    _ivec_incr(bvec);
  } while ( !_ivec0(bvec) );

  return cleave_choices;
}

function _cleave_cmp(a,b) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return  1; }
  return 0;
}

// return an array of arrays representing the available cuts
// for the quarry rectangle.
//
// Example:
//
// [
//   [[3,15,[2,3]],[28,3,[2,3]]],
//   [[28,30,[2,3]],[30,15,[2,3]]],
//   [[3,15,[2,3]],[28,30,[2,3]],[30,3,[2,3]]]
// ]
//
// * Find the cleave profile
// * Use the cleave profile to enumerate valid cleave choices
// * Find border points implied by clave choices to create cut
//   schedule
//
// Finding fence portions for the cuts can get a little complicated
// so it's easier to add two cuts per cleave in the cleave enumeration
// and remove duplicates at the end.
//
// In more detail:
//
// w.l.o.g., consider the bottom right endpoint of Rg (Rg_0).
// We say the 'even' cleave, if it exists, is the one shooting out to the right
// and the 'odd' cleave, if it exists, is the one shooting down.
//
// If the even cleave exists, add the two-cut (Js[0][Rg_0], Js[2][Rg_0], Rg_0).
// If the odd cleave cut next to it (clockwise) exists, add an additional
// two-cut of (Js[0][Rg_0], Js[3][Rg_0], Rg_0), otherwise add a 1-cut
// (Js[0][Rg_0], Js[1][Rg_0], Rg_0).
//
// If the odd cleave cut exists, add the two-cut of (Js[3][Rg_0], Js[1][Rg_0], Rg_0).
// If the previouse (counterclockwise) even cleave exists, add the two-cut
// (Js[0][Rg_0], Js[3][Rg_0], Rg_0), otherwise add the one-cut (Js[3][Rg_0], Js[2][Rg_0], Rg_0).
//
// Do this for all endpoints around Rg, rotating the idirs etc clockwise by pi/2 at endpoint
// location.
//
// ---
//
// At the end, remove duplicate one-cut and two-cuts and put them in a cleave cut schedule.
//
// ---
//
// Discussion:
//
// All one-cut and two-cuts should be non-overlapping (besides shared endpoints), so the
// deduplication sort that orders by first border index should be sufficient.
//
// Cleave cuts should only ever be on quarry rectangle (Rg) endpoints that are proper interior grid points.
// If a quarry rectangle endpoint has an open grid line in one direction and a border edge in the other,
// it is an error (I believe) for a cleave cut to be present on the open grid line.
// Should the minimum cut involve a cleave cut at this grid line, the cleave will be discovered
// during the recursion when processing the sub-region.
//
//
/*
function RPRPQuarryCleaveCuts(ctx, g_s, g_e, g_a, g_b, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);
  let Js = ctx.Js;
  let Bij = ctx.Bij;
  let B = ctx.B;

  //
  //  5    6    7
  //     2---3
  //  4  |   |  0
  //     1---0
  //  3    2    1
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let oppo = [ 1,0, 3,2 ];

  let cleave_sched = [];

  // Cleave profile is the pattern (e.g. b...XXxx),
  // Cleave choice is an enumeration of those patterns, choosing a cleave if valid
  //   (e.g. b-*-XXxx, b--*XXxx, b-**XXxx)
  // Side cleave cuts are guillotine cuts that are shaved off of the quarry rectangle
  //   side whose regions don't include the quarry rectangle endpoints..
  //
  // The cleave_choices is the one we use to create the actual two-cut border points and
  // quarry adit point.
  // For every cleave_choice (deduplicated) realization, we add all the side_cleve_cuts to it
  //   and put it in the schedule.
  //
  let cleave_profile = RPRPCleaveProfile( ctx, g_s, g_e, g_a, g_b );
  let cleave_choices = RPRP_cleave_enumerate( ctx, g_s, g_e, g_a, g_b, cleave_profile );
  let side_cleave_cuts = RPRP_enumerate_quarry_side_region( ctx, g_s, g_e, g_a, g_b );

  // lookup tables for even/odd idirs along with their perpendicular directions.
  //
  let lu_e_idir = [ 0, 3, 1, 2 ];
  let lu_e_tdir = [ 2, 0, 3, 1 ];

  let lu_o_idir = [ 3, 1, 2, 0 ];

  for (let cci=0; cci < cleave_choices.length; cci++) {
    let cc = cleave_choices[cci];

    if (_debug) { console.log("qcc"); }

    let cleave_cuts = [];
    for (let i=0; i<4; i++) {
      let even_cleave_idx = 2*i;
      let odd_cleave_idx = (2*i)+1;

      let e_idir = lu_e_idir[i];
      let e_tdir = lu_e_tdir[i];

      let o_idir = lu_o_idir[i];
      let o_tdir = oppo[e_idir];

      // An even cleave cut implies at least one two-cut with one cut in
      // the even cleave direction and another in the orthogonal direction
      // counterclockwise.
      //
      if (cc[even_cleave_idx] == '*') {
        cleave_cuts.push([
          Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
          Js[ e_tdir ][ Rg[i][1] ][ Rg[i][0] ],
          [ Rg[i][0], Rg[i][1] ]
        ]);

        if (_debug) { console.log("qcc: cci:", cci, "i:", i, "e.0:", cleave_cuts[ cleave_cuts.length-1] ); }

        // if the clockwise neighbor (the 'odd' cleave cut) exists,
        // add another two-cut.
        //
        if (cc[odd_cleave_idx] == '*') {
          cleave_cuts.push([
            Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
            [ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug) { console.log("qcc: cci:", cci, "i:", i, "e.1a:", cleave_cuts[ cleave_cuts.length-1] ); }
        }

        // Otherwise add a one-cut in-line with the quarry edge and the even cleave line,
        // taking the adit point as one of the 1-cut endpoints.
        //
        else {

          let _a = B[ Js[ oppo[e_idir] ][ Rg[i][1] ][ Rg[i][0] ] ];

          cleave_cuts.push([
            Js[ oppo[e_idir] ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
            [ _a[0], _a[1] ]
            //[ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug) { console.log("qcc: cci:", cci, "i:", i, "e.1b:", cleave_cuts[ cleave_cuts.length-1] ); }
        }

      }

      // An odd cleave cut implies at least one two-cut with one constructed
      // line in the direction of the odd cleave cut and the other in orthogonal
      // direction clockwise.
      //
      if (cc[odd_cleave_idx] == '*') {

        cleave_cuts.push([
          Js[ o_tdir ][ Rg[i][1] ][ Rg[i][0] ],
          Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
          [ Rg[i][0], Rg[i][1] ]
        ]);

        if (_debug) { console.log("qcc: cci:", cci, "i:", i, "o.0:", cleave_cuts[ cleave_cuts.length-1] ); }

        // if the previous counterclockwise neighbor (the 'even' cleave cut) exists,
        // add another two cut with both the even and odd constructed lines.
        //
        if (cc[even_cleave_idx] == '*') {
          cleave_cuts.push([
            Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
            [ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug) { console.log("qcc: cci:", cci, "i:", i, "o.1a:", cleave_cuts[ cleave_cuts.length-1] ); }

        }

        // Otherwise add a one-cut in-line with the Rectangle edge and odd cleave cut,
        // taking the adit poitn as one of the endpoints.
        //
        else {
          let _a = B[ Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ] ];

          cleave_cuts.push([
            Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ oppo[o_idir] ][ Rg[i][1] ][ Rg[i][0] ],
            [ _a[0], _a[1] ]
            //[ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug) { console.log("qcc: cci:", cci, "i:", i, "o.1b:", cleave_cuts[ cleave_cuts.length-1] ); }
        }

      }

    }

    // add side cleave cuts
    //
    for (let i=0; i<side_cleave_cuts.length; i++) {
      let cc = [ side_cleave_cuts[i][0], side_cleave_cuts[i][1], ctx.B[side_cleave_cuts[i][0]] ];
      cleave_cuts.push( cc );
    }

    if (cleave_cuts.length == 0) { continue; }

    // sort and deduplicate
    //
    let dedup_cleave_cuts = [];
    cleave_cuts.sort( _cleave_cmp );

    dedup_cleave_cuts.push( cleave_cuts[0] );
    for (let i=1; i<cleave_cuts.length; i++) {
      if (cleave_cuts[i-1][0] != cleave_cuts[i][0]) {
        dedup_cleave_cuts.push( cleave_cuts[i] );
      }
    }

    cleave_sched.push( dedup_cleave_cuts );

  }

  return cleave_sched;
};
*/

//WIP!!!
//UNTESTED!!!

// enumerate *docked* border edges to quarry edge by border index pairs
//
function RPRP_quarry_edge_ranges(ctx, g_a, g_b, g_s, g_e, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let X = ctx.X,
      Y = ctx.Y,
      Gij = ctx.Gij,
      B = ctx.B,
      Bij = ctx.Bij,
      Js = ctx.Js,
      Je = ctx.Je,
      Jf = ctx.Jf;

  if ( (typeof g_s === "undefined") ||
       (typeof g_e === "undefined") ) {
    g_s = B[0];
    g_e = B[0];
  }

  //
  //  5    6    7
  //     2->-3
  //     |   |
  //  4  ^   v  0
  //     |   |
  //     1-<-0
  //  3    2    1
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let oppo_idir = [ 1,0, 3,2 ];

  let r_edge_idir = [1,2,0,3];
  let idir_ij = [ [1,0], [-1,0], [0,1], [0,-1] ];

  let perim_range = [];

  for (let r_idx=0; r_idx<4; r_idx++) {
    let r_nxt = (r_idx+1)%4;
    let idir = r_edge_idir[r_idx];
    let rdir = oppo_idir[idir];

    let u = Rg[r_idx];
    let v = Rg[r_nxt];

    if (_debug > 1) {
      console.log("\nr_idx:", r_idx, "u:", u, "v:", v);
    }

    // b0 start of pit
    // b1 end of pit
    //

    // We're enumerating docked border edges to quarry rectangle.
    // b1 represents the *last* grid point on a border for this
    // edge,
    // b0 represents the *first* grid point on a border for
    // this edge

    let b1 = Bij[ u[1] ][ u[0] ];
    if (b1 < 0) {
      let w = v_add( u, v_mul( Jf[idir][ u[1] ][ u[0] ], idir_ij[idir] ) );
      let _d = dot_v( v_sub( v, w ), idir_ij[idir] );

      if (_debug > 2) {
        console.log("  _d1:", _d, "v-w:", v_sub(v,w), "idir[", idir, "]:", idir_ij[idir]);
      }

      if (_d < 0) { continue; }
      b1 = Bij[ w[1] ][ w[0] ];
    }
    let b1_ij = B[b1];

    // If b0 isn't already on a border,
    // skip ahead to border.
    // Once on the border, skip ahead to transition
    // point for start of iteration.
    //
    let b0 = Bij[ v[1] ][ v[0] ];
    if (b0 < 0) {

      let w = v_add( v, v_mul( Jf[rdir][ v[1] ][ v[0] ], idir_ij[rdir] ) );
      let _d = dot_v( v_sub( u, w ), idir_ij[rdir] );

      if (_debug > 2) {
        console.log("  _d0:", _d, "u-w:", v_sub(u,w), "rdir[", rdir, "]:", idir_ij[rdir]);
      }

      if (_d < 0) { continue; }
      b0 = Bij[ w[1] ][ w[0] ];
    }
    let b0_ij = B[b0];

    if (_debug > 2) {
      console.log("r_idx:", r_idx, "b0:", b0, "b1:", b1);
    }

    let max_iter = Math.max( X.length, Y.length ),
        iter = 0;

    let cur_b = b0;
    while ( wrapped_range_contain(cur_b, b0, b1) &&
            (cur_b != b1) ) {

      let _g = B[ cur_b ];


      // record flip distance to next transition,
      // add it to create _h (if 0, _h will just be _g),
      // and get the next border index point
      //
      let _dj = Jf[ rdir ][ _g[1] ][ _g[0] ];
      let _h = v_add( _g, v_mul( _dj, idir_ij[rdir] ) );
      let nxt_b = Bij[ _h[1] ][ _h[0] ];

      if (_debug > 1) {
        console.log("  r_idx:", r_idx, "_g:", JSON.stringify(_g), "cur_b:", cur_b, "dj[", rdir, "]:", _dj);
      }


      // if the flip extends past the quarry corner, clamp
      // nxt_b to b1, re-use _d below to indicate termination
      //
      let _d = dot_v( v_sub( b1_ij, _h ), idir_ij[rdir] );
      if (_d <= 0) { nxt_b = b1; }

      // Make sure to add non-trivial dock ranges and, if so,
      // add our range.
      // Break if we've shot past
      //
      if (cur_b != nxt_b) {

        if (_debug > 1) {
          console.log("  perim:", cur_b, nxt_b);
        }

        perim_range.push( [cur_b, nxt_b] );
      }
      if (_d <= 0) { break; }

      // increment, check oob
      //
      _h = v_add( _h, idir_ij[rdir] );
      if ( (_h[0] < 0) || (_h[1] < 0) ||
           (_h[0] >= X.length) || (_h[1] >= Y.length) ) {
        break;
      }
      nxt_b = Bij[ _h[1] ][ _h[0] ];

      // advance to first border point
      //
      //if (Bij[ _h[1] ][ _h[0] ] < 0) {
      if (nxt_b  < 0) {
        let _dhj = Jf[rdir][ _h[1] ][ _h[0] ];
        _h = v_add( _h, v_mul( _dhj, idir_ij[rdir] ) );
        nxt_b = Bij[ _h[1] ][ _h[0] ];

        if (_debug > 2) {
          console.log("  ##advance h>>:", JSON.stringify(_h), "nxt_b:", nxt_b, "(_dhj:", _dhj, ")");
        }

      }

      cur_b = nxt_b;

      iter++;
      if (iter >  max_iter) {
        console.log("SANITY ERROR: quarry_edge_ranges, exceeded max_iter:", iter, ">", max_iter );
        return undefined;
      }

      continue;

    }

  }

  if (perim_range.length == 0) { return []; }

  perim_range.sort( _cleave_cmp );
  let merged_perim = [ [perim_range[0][0], perim_range[0][1]] ];
  for (let i=1; i<perim_range.length; i++) {
    if (perim_range[i][0] == perim_range[i-1][1]) {
      merged_perim[ merged_perim.length-1 ][1] = perim_range[i][1];
    }
    else {
      merged_perim.push( [perim_range[i][0], perim_range[i][1]] );
    }

  }

  return merged_perim;
}


function __RPRP_quarry_edge_ranges(ctx, g_a, g_b, g_s, g_e, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let X = ctx.X,
      Y = ctx.Y,
      Gij = ctx.Gij,
      B = ctx.B,
      Bij = ctx.Bij,
      Js = ctx.Js,
      Je = ctx.Je,
      Jf = ctx.Jf;

  if ( (typeof g_s === "undefined") ||
       (typeof g_e === "undefined") ) {
    g_s = B[0];
    g_e = B[0];
  }

  //
  //  5    6    7
  //     2->-3
  //     |   |
  //  4  ^   v  0
  //     |   |
  //     1-<-0
  //  3    2    1
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let oppo_idir = [ 1,0, 3,2 ];

  let r_edge_idir = [1,2,0,3];
  let idir_ij = [ [1,0], [-1,0], [0,1], [0,-1] ];

  let perim_range = [];

  for (let r_idx=0; r_idx<4; r_idx++) {
    let r_nxt = (r_idx+1)%4;
    let idir = r_edge_idir[r_idx];
    let rdir = oppo_idir[idir];

    let u = Rg[r_idx];
    let v = Rg[r_nxt];

    console.log("\nr_idx:", r_idx, "u:", u, "v:", v);

    // b0 start of pit
    // b1 end of pit
    //
    // b0 and b1 denote start and end of sequence.
    // At each point in the iteration, we want to
    // add a cut segment which we'll do by
    // adding the current boundary point and the next
    // one.
    // After addition, current will be set to next
    // then jumped forward until b1 is reached.
    //

    let b1 = Bij[ u[1] ][ u[0] ];
    if (b1 < 0) {
      let w = v_add( u, v_mul( Jf[idir][ u[1] ][ u[0] ], idir_ij[idir] ) );
      let _d = dot_v( v_sub( v, w ), idir_ij[idir] );

      console.log("  _d1:", _d, "v-w:", v_sub(v,w), "idir[", idir, "]:", idir_ij[idir]);

      if (_d < 0) { continue; }
      b1 = Bij[ w[1] ][ w[0] ];
    }

    let b1_ij = B[b1];
    b1_ij = v_add( b1_ij, v_mul( Jf[idir][ b1_ij[1] ][ b1_ij[0] ], idir_ij[idir] ) );
    b1 = Bij[ b1_ij[1] ][ b1_ij[0] ];

    /*
    if (b1 >= 0) {

      // Skip to transition point (towards next Rg point).
      // If we've skipped past it, nothing to be done.
      //
      let w = v_add( u, v_mul( Jf[idir][ u[1] ][ u[0] ], idir_ij[idir] ) );

      let _d = dot_v( v_sub( v, w ), idir_ij[idir] );

      console.log("  _d1:", _d, "v-w:", v_sub(v,w), "idir[", idir, "]:", idir_ij[idir]);

      if (_d < 0) { continue; }
      b1 = Bij[ w[1] ][ w[0] ];
    }
    */

    // If b0 isn't already on a border,
    // skip ahead to border.
    // Once on the border, skip ahead to transition
    // point for start of iteration.
    //
    let b0 = Bij[ v[1] ][ v[0] ];
    if (b0 < 0) {

      let w = v_add( v, v_mul( Jf[rdir][ v[1] ][ v[0] ], idir_ij[rdir] ) );
      let _d = dot_v( v_sub( u, w ), idir_ij[rdir] );

      console.log("  _d0:", _d, "u-w:", v_sub(u,w), "rdir[", rdir, "]:", idir_ij[rdir]);

      if (_d < 0) { continue; }
      b0 = Bij[ w[1] ][ w[0] ];
    }

    let b0_ij = B[b0];
    b0_ij = v_add( b0_ij, v_mul( Jf[rdir][ b0_ij[1] ][ b0_ij[0] ], idir_ij[rdir] ) );
    b0 = Bij[ b0_ij[1] ][ b0_ij[0] ];

    console.log("r_idx:", r_idx, "b0:", b0, "b1:", b1);

    let max_iter = Math.max( X.length, Y.length ),
        iter = 0;


    // cur_b holds *end* of border
    // nxt_b holds *Beginning* of next border
    //

    //let b1_ij = B[b1];

    let cur_b = b0;
    while ( wrapped_range_contain(cur_b, b0, b1) &&
            (cur_b != b1) ) {

      let _g = B[ cur_b ];
      let _h = v_add( _g, idir_ij[rdir] );
      if ( (_h[0] < 0) || (_h[1] < 0) ||
           (_h[0] >= X.length) || (_h[1] >= Y.length) ) {
        break;
      }

      if (Bij[ _h[1] ][ _h[0] ] < 0) {
        _h = v_add( _h, v_mul( Jf[rdir][ _h[1] ][ _h[0] ], idir_ij[rdir] ) );
      }

      let _d = dot_v( v_sub( b1_ij, _h ), idir_ij[rdir] );
      if (_d < 0) { break; }

      let nxt_b = Bij[ _h[1] ][ _h[0] ];


      console.log("[", r_idx, "]: adding perim", cur_b, nxt_b);

      perim_range.push( [cur_b, nxt_b] );

      _g = v_add( B[ nxt_b ], v_mul( Jf[rdir][ _h[1] ][ _h[0] ], idir_ij[rdir] ) );
      cur_b = Bij[ _g[1] ][ _g[0] ];

      iter++;
      if (iter >  max_iter) {
        console.log("SANITY ERROR: quarry_edge_ranges, exceeded max_iter:", iter, ">", max_iter );
        return undefined;
      }

      continue;

      /*

      let _dj = Jf[rdir][ _g[1] ][ _g[0] ];

      let _h = [-1,-1];
      if (_dj == 0) {

        // _g is on a border but a 0 Jf indicates it's at a
        // transition.
        // Move ahead one in rdir direction.
        // If it's on a border, we're done, as it repreesents the
        // beginning of the border.
        // If not, we're in an open region and we need to shoot ahead
        // till where the border transitions.
        //

        _h = v_add( _g, idir_ij[rdir] );
        if (Bij[_h[1]][_h[0]] < 0) {
          _h = v_add( _h, v_mul( Jf[rdir][ _h[1] ][ _h[0] ], idir_ij[rdir] ) )
        }
      }
      else {

        // If _g is already on the border, move ahead to
        // where the current border line ends or turns.
        //
        _h = v_add( _g, v_mul( _dj, idir_ij[rdir] ) );
      }

      console.log("_h:", _h, "cur_b:", cur_b, "b0:", b0, "b1:", b1,
        "(dj:", _dj, ", Jf[", rdir, "][", _g[1], "][", _g[0], "]:", Jf[rdir][ _g[1] ][ _g[0] ], ")");

      let nxt_b = Bij[ _h[1] ][ _h[0] ];
      if (nxt_b != cur_b) {

        console.log(" perim.add:", "[", cur_b, nxt_b, "]");

        perim_range.push( [cur_b, nxt_b] );
      }

      _h = v_add( _h, idir_ij[rdir] );
      if ( (_h[0] < 0) || (_h[1] < 0) ||
           (_h[0] >= X.length) || (_h[1] >= Y.length) ) {
        break;
      }

      if ( Gij[ _h[1] ][ _h[0] ] < 0 ) { break; }

      cur_b = nxt_b;

      */

    }

  }

  return perim_range;
}



// next attempt at doing the validation and getting relevant information
// for quarry choice
//
// To avoid a combinatorial explosion, one-cuts are returned with a [-1,-1]
// adit placeholder.
//
// Return:
//
// {
//   valid    : 0 invalid, 1 valid
//   side_cut     : array of tuples representing start and end general boundary
//                  indices of guillotine cut
//   corner_cuts  : array of array of triples, where each triple consists of
//                  the start general boundary index, the end general boundary index
//                  and the adit grid point
//                  If it's a 1-cut, adit point is [-1,-1] with the assumption that
//                  the adit point will be iterated over at a higher level.
//   b_s      : general boundary start index
//   b_e      : general boundary end index
//   g_s      : general boundary start grid point
//   g_e      : general boundary end grid point
//   g_a      : adit point of quarry rectangle
//   g_b      : bower point of quarry rectangle
// }
//

function RPRPQuarryInfo(ctx, g_s, g_e, g_a, g_b, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);
  let oppo = [ 1,0, 3,2 ];

  let B = ctx.B;
  let Js = ctx.Js,
      Je = ctx.Je,
      Jf = ctx.Jf;
  let Bij = ctx.Bij;

  let quarry_info = {
    "valid": 0,
    "side_cut": [],
    "corner_cuts": [],
    "b_s" : -1,   "b_e" : -1,
    "g_s" : g_s,  "g_e" : g_e,
    "g_a" : g_a,  "g_b" : g_b,
    "comment": ""
  };

  let candidate_corner_cuts = [];


  /*
  // trakcing down error focusing in on fail point
    // for mirp_fail1.json
    // The issue is that there's a 2-cut at the below
    // points that's identified as float.
    // In isolation, it's true, but the 2-cut has
    // a part of a constructed line that extends beyond
    // the current sub-region. Specifically
    // the (36,53) line, makes the ([13,7],53) constructed
    // line valid.
  //
  //DEBUG
  //DEBUG
  //DEBUG
  //DEBUG
  if ( (g_s[0] == 13) && (g_s[1] == 18) &&
       (g_e[0] == 10) && (g_e[1] == 7) &&
       (g_a[0] == 13) && (g_a[1] == 7) &&
       (g_b[0] == 6) && (g_b[1] == 10) ) {
    _debug = 5;
  }
  //DEBUG
  //DEBUG
  //DEBUG
  //DEBUG
  */



  //
  //  5    6    7
  //     2---3
  //  4  |   |  0
  //     1---0
  //  3    2    1
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  if (!RPRP_valid_R(ctx, g_a, g_b)) {
    quarry_info.comment = "invalid quarry rectangle";
    return quarry_info;
  }

  // quarry rectangle could be wholly contained in the rectilinear polygon
  // but not contained in the region we're considering.
  // It suffices to test each endpoint of the potentialy quarry rectangle
  // to be in the region.
  //
  for (let i=0; i<Rg.length; i++) {
    if (RPRP_point_in_region(ctx, Rg[i], g_s, g_e, g_a, _debug) == 0) {
      quarry_info.comment = "endpoint outside of fenced region (Rg[" + i.toString() + ":" + JSON.stringify(Rg[i]) + ")";
      return quarry_info;
    }
  }


  // If it's a 1cut,
  // make sure the quarry rectangle shares a non-degenerate edge
  // with the cut.
  // Exclude the special case when g_s == g_e, which should only
  // happen for the initial pick.
  //
  if ( ((g_s[0] == g_e[0]) ||
        (g_s[1] == g_e[1])) &&
       ((g_s[0] != g_e[0]) ||
        (g_s[1] != g_e[1])) ) {

    // free dimension for 1cut
    //
    let c_xy = ((g_s[0] == g_e[0]) ? 1 : 0);

    // order (g_s, g_e) line segment
    //
    let cut_ls = [
      [ Math.min(g_s[0], g_e[0]), Math.min(g_s[1], g_e[1]) ],
      [ Math.max(g_s[0], g_e[0]), Math.max(g_s[1], g_e[1]) ]
    ];


    let overlap = false;

    for (let r_idx=0; r_idx<Rg.length; r_idx++) {

      // free dimension for Rg line segment
      //
      let rl_xy = ((r_idx%2) ? 1 : 0);
      if (rl_xy != c_xy) { continue; }

      let r0 = Rg[r_idx];
      let r1 = Rg[(r_idx+1)%Rg.length];

      // order edge Rg line segment
      //
      let R_l = [
        [ Math.min(r0[0], r1[0]), Math.min(r0[1], r1[1]) ],
        [ Math.max(r0[0], r1[0]), Math.max(r0[1], r1[1]) ]
      ];

      // if line segments don't non-degeneratiely intersect, skip
      //
      // if ( A _ right <= B _ left ) or
      //    ( B _ right <= A _ left ) then
      //   line segments non-overlapping
      //
      if ( (cut_ls[0][c_xy] >= R_l[1][rl_xy]) ||
           (R_l[0][rl_xy] >= cut_ls[1][c_xy]) ) {
        continue;
      }

      overlap = true;
      break;
    }

    // if it's a 1-cut and the quarry edge doesn't non-degenerately share 
    // an edge with the cut, invalid choice, early return.
    //
    if (!overlap) {
      quarry_info.comment = "quarry doesn't share non-degenerate 1cut edge";
      return quarry_info;
    }

  }

  //---

  let idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let idx_e = Bij[ g_e[1] ][ g_e[0] ];

  let cleave_sched = [];

  // Cleave profile is the pattern (e.g. b...XXxx),
  // Cleave choice is an enumeration of those patterns, choosing a cleave if valid
  //   (e.g. b-*-XXxx, b--*XXxx, b-**XXxx)
  // Side cleave cuts are guillotine cuts that are shaved off of the quarry rectangle
  //   side whose regions don't include the quarry rectangle endpoints..
  //
  // The cleave_choices is the one we use to create the actual two-cut border points and
  // quarry adit point.
  // For every cleave_choice (deduplicated) realization, we add all the side_cleve_cuts to it
  //   and put it in the schedule.
  //
  let cleave_profile = RPRPCleaveProfile( ctx, g_s, g_e, g_a, g_b, _debug );

  for (let i=0; i<cleave_profile.length; i++) {
    let cur_tok = cleave_profile[i];
    let nei_tok = ((i%2) ? cleave_profile[(i+1)%8] : cleave_profile[(i+8-1)%8]);

    if (((cur_tok == 'b') || (cur_tok == 'c') || (cur_tok == '*')) &&
        ((nei_tok == 'b') || (nei_tok == 'c') || (nei_tok == '*'))) {
      quarry_info.comment = "cleave profile has bridge";
      return quarry_info;
    }
  }

  let cleave_choices = RPRP_cleave_enumerate( ctx, g_s, g_e, g_a, g_b, cleave_profile, _debug );
  let side_cleave_cuts = RPRP_enumerate_quarry_side_region( ctx, g_s, g_e, g_a, g_b, _debug );

  if (_debug > 1) {
    console.log("qci: profile:", cleave_profile.join(""));
    console.log("qci: cc:", JSON.stringify(cleave_choices));
    console.log("qci: scc:", JSON.stringify(side_cleave_cuts));
  }

  let forced_corner = false;
  for (let r_idx=0; r_idx<4; r_idx++) {
    if ((cleave_profile[2*r_idx] == '.') &&
        (cleave_profile[2*r_idx+1] == '.')) {
      forced_corner = true;
    }
  }

  if (forced_corner && (cleave_choices.length == 0)) {
    quarry_info.comment = "forced corner but no possible cleave cuts";
    return quarry_info;
  }

  // lookup tables for even/odd idirs along with their perpendicular directions.
  //
  let lu_e_idir = [ 0, 3, 1, 2 ];
  let lu_e_tdir = [ 2, 0, 3, 1 ];

  let lu_o_idir = [ 3, 1, 2, 0 ];

  for (let cci=0; cci < cleave_choices.length; cci++) {
    let cc = cleave_choices[cci];

    let cleave_cuts = [];
    for (let i=0; i<4; i++) {
      let even_cleave_idx = 2*i;
      let odd_cleave_idx = (2*i)+1;

      let e_idir = lu_e_idir[i];
      let e_tdir = lu_e_tdir[i];

      let o_idir = lu_o_idir[i];
      let o_tdir = oppo[e_idir];

      // An even cleave cut implies at least one two-cut with one cut in
      // the even cleave direction and another in the orthogonal direction
      // counterclockwise.
      // We know the orthogonal direction must be a cut, either a quarry edge
      // that runs into a border or a quarry edge that turns into a cleave cut,
      // otherwise it wouldn't be a valid cleave choice.
      //
      if (cc[even_cleave_idx] == '*') {
        cleave_cuts.push([
          Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
          Js[ e_tdir ][ Rg[i][1] ][ Rg[i][0] ],
          [ Rg[i][0], Rg[i][1] ]
        ]);

        if (_debug > 1) { console.log("qci: cci:", cci, "i:", i, "e.0:", cleave_cuts[ cleave_cuts.length-1] ); }

        // if the clockwise neighbor (the 'odd' cleave cut) exists,
        // add another two-cut.
        //
        if (cc[odd_cleave_idx] == '*') {
          cleave_cuts.push([
            Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
            [ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug > 1) { console.log("qci: cci:", cci, "i:", i, "e.1a:", cleave_cuts[ cleave_cuts.length-1] ); }
        }

        // Otherwise add a one-cut in-line with the quarry edge and the even cleave line,
        // taking the adit point as one of the 1-cut endpoints.
        //
        else {

          let _a = B[ Js[ oppo[e_idir] ][ Rg[i][1] ][ Rg[i][0] ] ];

          let ipp = (even_cleave_idx + 2) % 8;
          let ip3 = (even_cleave_idx + 3) % 8;

          let is_one_cut = false;

          if ( (cc[ipp] != '*') &&
               (cleave_profile[ip3] != 'X') ) {
            is_one_cut = true;
          }

          let cw_i = (i+1)%4;

          if ( Js[ oppo[e_idir] ][ Rg[i][1] ][ Rg[i][0] ] !=
               Js[ oppo[e_idir] ][ Rg[cw_i][1] ][ Rg[cw_i][0] ] ) {
            is_one_cut = true;
          }


          if (is_one_cut) {

            // we'll be enumerating adit points for the 1-cut, so use
            // a placeholder adit the invalid point [-1,-1]
            //
            cleave_cuts.push([
                Js[ oppo[e_idir] ][ Rg[i][1] ][ Rg[i][0] ],
                Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
                [ -1, -1 ]
                //[ _a[0], _a[1] ]
              ]);

            if (_debug > 1) {console.log("qci: cci:", cci, "i:", i, "e.1b:", cleave_cuts[ cleave_cuts.length-1] ); }

          }
        }

      }

      // An odd cleave cut implies at least one two-cut with one constructed line.
      // If a cleave cut exists in an odd direction, 90 deg. clockwise has a
      // quarry boundary, so makes up the other constructed line cut of a 2-cut.
      //
      // If the even cleave cut exists (in the counterclockwise 90 deg. direction),
      // then we adda nother 2-cut.
      //
      // If the even cleave cut doesn't exist, we have a 1-cut in the counterclockwise
      // 180 deg. direction.
      //
      //
      //
      if (cc[odd_cleave_idx] == '*') {

        cleave_cuts.push([
          Js[ o_tdir ][ Rg[i][1] ][ Rg[i][0] ],
          Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
          [ Rg[i][0], Rg[i][1] ]
        ]);

        if (_debug > 1) { console.log("qci: cci:", cci, "i:", i, "o.0:", cleave_cuts[ cleave_cuts.length-1] ); }

        // if the previous counterclockwise neighbor (the 'even' cleave cut) exists,
        // add another two cut with both the even and odd constructed lines.
        //
        if (cc[even_cleave_idx] == '*') {
          cleave_cuts.push([
            Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
            Js[ e_idir ][ Rg[i][1] ][ Rg[i][0] ],
            [ Rg[i][0], Rg[i][1] ]
          ]);

          if (_debug > 1) { console.log("qci: cci:", cci, "i:", i, "o.1a:", cleave_cuts[ cleave_cuts.length-1] ); }

        }

        // Otherwise add a one-cut in-line with the Rectangle edge and odd cleave cut,
        // taking the adit poitn as one of the endpoints.
        //
        else {
          let _a = B[ Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ] ];

          let imm = (odd_cleave_idx + 8 - 2) % 8;
          let im3 = (odd_cleave_idx + 8 - 3) % 8;

          let is_one_cut = false;

          if ( (cc[imm] != '*') &&
               (cleave_profile[im3] != 'X') ) {
            is_one_cut = true;
          }

          let cc_i = (i+4-1)%4;

          if ( Js[ oppo[o_idir] ][ Rg[i][1] ][ Rg[i][0] ] !=
               Js[ oppo[o_idir] ][ Rg[cc_i][1] ][ Rg[cc_i][0] ] ) {
            is_one_cut = true;
          }

          if (is_one_cut) {

            // we'll be enumerating adit points for the 1-cut, so use
            // a placeholder adit the invalid point [-1,-1]
            //
            cleave_cuts.push([
              Js[ o_idir ][ Rg[i][1] ][ Rg[i][0] ],
              Js[ oppo[o_idir] ][ Rg[i][1] ][ Rg[i][0] ],
              [ -1, -1 ]
              //[ _a[0], _a[1] ]
            ]);

            if (_debug > 1) { console.log("qci: cci:", cci, "i:", i, "o.1b:", cleave_cuts[ cleave_cuts.length-1] ); }
          }

        }

      }

    }

    if (cleave_cuts.length == 0) { continue; }

    if (_debug > 1) {
      // we should put a sanity here to make sure the
      // deduplication is removing actual duplicates...
      //
      console.log("dup cleave cut(", cleave_cuts.length, ")");
      for (let _i=0; _i<cleave_cuts.length; _i++) {
        console.log("  [", _i, "]:", cleave_cuts[_i]);
      }
    }

    // sort and deduplicate
    //
    let dedup_cleave_cuts = [];
    cleave_cuts.sort( _cleave_cmp );

    // Hack for now, remove cleave cut that has whole exterior range.
    // two cut choice doesn't do region bounds testing, so this filters
    // out regions that cross into the excluded region.
    //
    let _cleave_cuts = [];
    for (let i=0; i<cleave_cuts.length; i++) {
      let cc = cleave_cuts[i];
      if (((cc[0] == idx_e) && (cc[1] == idx_s)) ) { continue; }
      _cleave_cuts.push( cleave_cuts[i] );
    }
    cleave_cuts = _cleave_cuts;

    // sanity checks
    //

    for (let i=0; i<cleave_cuts.length; i++) {

      let cc = cleave_cuts[i];

      if ( (wrapped_range_contain( cc[0], idx_s, idx_e ) == 0) ||
           (wrapped_range_contain( cc[1], idx_s, idx_e ) == 0) ||
           ((cc[0] == idx_e) && (cc[1] == idx_s)) ) {
        quarry_info.valid = -1;
        quarry_info.comment = "SANITY ERROR: nonsense cleave cut:" + cc.toString();
        return quarry_info;
      }

      if (i>0) {
        if ( (cleave_cuts[i-1][0] == cc[0]) &&
             (cleave_cuts[i-1][1] != cc[1]) ) {
          quarry_info.valid = -1;
          quarry_info.comment = "SANITY ERROR: nonsense cleave cut:" + cleave_cuts[i-1].toString() + " " + cc.toString();
          return quarry_info;
        }
      }

    }

    dedup_cleave_cuts.push( cleave_cuts[0] );
    for (let i=1; i<cleave_cuts.length; i++) {
      if (cleave_cuts[i-1][0] != cleave_cuts[i][0]) {
        dedup_cleave_cuts.push( cleave_cuts[i] );
      }
    }

    //quarry_info.two_cuts.push( dedup_cleave_cuts );
    //quarry_info.corner_cuts.push( dedup_cleave_cuts );
    candidate_corner_cuts.push( dedup_cleave_cuts );

  }

  // since the above batch cuts need to enumerate the adit points in the
  // main MIRP recursion, we're going to try only adding the one-cuts
  // here and let the adit enumeration happen in MIRP.
  //
  for (let i=0; i<side_cleave_cuts.length; i++) {

    //quarry_info.one_cuts.push([ side_cleave_cuts[i][0],
    //                            side_cleave_cuts[i][1],
    //                            [-1,-1] ]);
    quarry_info.side_cut.push([ side_cleave_cuts[i][0],
                                side_cleave_cuts[i][1],
                                [-1,-1] ]);
  }



  // We need to check that the cleave cuts yield a valid result.
  // For example, if there must be a cleave cut but there aren't
  // returned, this is an invalid quarry.
  //
  // To test for this, we catalogue all one-cuts, cleave cuts
  // and docked border ranges on the border of the quarry rectangle.
  // This should sweep out the entire perimeter of the rectilinear
  // polygon.
  // If not, some are missed and it's not a valid quarry.
  //

  let border_range = RPRP_quarry_edge_ranges(ctx, g_a, g_b, g_s, g_e, _debug);
  border_range.push( [idx_e, idx_s] );

  if (_debug > 1) {
    console.log("raw border_range:", JSON.stringify(border_range));
  }

  // consolidate/merge border ranges
  //
  let _tmp_br = [ [ border_range[0][0], border_range[0][1] ] ];
  for (let i=1; i<border_range.length; i++) {

    if ( border_range[i][0] == border_range[i-1][1] ) {
      _tmp_br[ _tmp_br.length-1 ][1] = border_range[i][1];
    }
    else {
      _tmp_br.push( [border_range[i][0], border_range[i][1]] );
    }

  }
  border_range = _tmp_br;


  /*
  if ((border_range.length == 1) &&
      (candidate_corner_cuts.length == 0)) {
    if (border_range[0][0] != border_range[0][1]) {
      quarry_info.comment = "non-sweeping border cut";
      return quarry_info;
    }

    // quarry is rectangle with no cuts?
    //
    quarry_info.valid = 1;
    return quarry_info;
  }
  */


  //console.log("border_range:", JSON.stringify(border_range));

  // one final check to make sure all partition ranges have been
  // accounted for.
  //
  let idx_range = [];
  let fin_corner_idx = [];

  if (_debug > 1) {
    console.log("seab:", JSON.stringify([g_s, g_e, g_a,g_b]));
  }

  let _found_partition = false;

  // maybe we can walk the boundary of the quarry to catalogue the
  // docked border and as them as ranges
  //
  let _n = ((candidate_corner_cuts.length==0) ? 1 : candidate_corner_cuts.length);
  //for (let sched_idx=0; sched_idx<candidate_corner_cuts.length; sched_idx++) {
  for (let sched_idx=0; sched_idx<_n; sched_idx++) {

    let _range = [];
    for (let i=0; i<quarry_info.side_cut.length; i++) {
      _range.push( [quarry_info.side_cut[i][0], quarry_info.side_cut[i][1] ] );
    }

    if (sched_idx < candidate_corner_cuts.length) {
      let corner_cut_batch = candidate_corner_cuts[sched_idx];
      for (let i=0; i<corner_cut_batch.length; i++) {
        _range.push( [corner_cut_batch[i][0], corner_cut_batch[i][1] ] );
      }
    }

    for (let i=0; i<border_range.length; i++) {
      _range.push( [border_range[i][0], border_range[i][1]] );
    }

    _range.sort( _cleave_cmp );

    if (_debug > 2) {
      console.log("  sched_idx:", sched_idx, "_range:", JSON.stringify(_range));
    }

    let _range_valid = true;
    //let se_found = [ false, false ];

    for (let i=0; i<_range.length; i++) {

      //if ( (_range[i][0] <= idx_s) && (idx_s <= _range[i][1]) ) { se_found[0] = true; }
      //if ( (_range[i][0] <= idx_e) && (idx_e <= _range[i][1]) ) { se_found[1] = true; }

      /*
      for (let b=_range[i][0]; b != _range[i][1]; b = ((b+1)%B.length) ) {
        if (!wrapped_range_contain(b, idx_s, idx_e)) {
          if (_debug > 1) { console.log("RANGE INVALID:", b, idx_s, idx_e, i); }
          _range_valid = false;
        }
      }
      */

      if ((i > 0) && (_range[i][0] != _range[i-1][1])) {

        if (_debug > 1) {
          console.log("RANGE INVALID.1:[", i, "]:",_range[i-1], _range[i], JSON.stringify( quarry_info.side_cut), JSON.stringify(candidate_corner_cuts));
        }

        _range_valid = false;
      }
    }

    if ( (!_range_valid) || (_range.length==0) ) {

      //console.log("_range invalid:", JSON.stringify(_range));

      continue;
    }

    let _fin_range = [ [_range[0][0], _range[0][1] ] ];
    for (let i=1; i<_range.length; i++) {
      if ( _range[i][0] == _range[i-1][1] ) {
        _fin_range[ _fin_range.length-1 ][1] = _range[i][1];
      }
      else {
        _fin_range.push( [ _range[i][0], _range[i][1] ] );
      }
    }

    if ( (_fin_range.length == 1) &&
         (_fin_range[0][0] == _fin_range[0][1]) ) {

      _found_partition = true;

      if (sched_idx < candidate_corner_cuts.length) {
        fin_corner_idx.push(sched_idx);
      }
    }
    else {
      //console.log("NOT adding sched_idx:", sched_idx, "(fin_range:", JSON.stringify(_fin_range), ")");
    }


    //if ( _range_valid && se_found[0] && se_found[1]) { fin_corner_idx.push(sched_idx); }

  }

  //if (fin_corner_idx.length == 0) {
  if (!_found_partition) {


    //DEBUG
    //DEBUG
    //DEBUG
    console.log("no valid cuts?? candidate_corner_cuts:", JSON.stringify(candidate_corner_cuts));
    console.log("  >>> cleave_profile:", cleave_profile.join(""));
    console.log("  >>> cleave_choices:", JSON.stringify(cleave_choices));
    console.log("  >>> side_cleave_cuts:", side_cleave_cuts);
    //DEBUG
    //DEBUG
    //DEBUG

    quarry_info.comment = "no valid cuts";
    return quarry_info;
  }

  for (let i=0; i<fin_corner_idx.length; i++) {
    quarry_info.corner_cuts.push( candidate_corner_cuts[ fin_corner_idx[i] ] );
  }

  quarry_info.valid = 1;
  return quarry_info;
};



//------
//------
//------

// Take line segment from g_s to g_e and return all grid
// points within interior on the line.
// Meant for g_s and g_e to be on boundary but this isn't nceessary.
//
function RPRP_enumerate_one_cut_adit_points(ctx, g_s, g_e, _debug) {
  _debug = ((typeof _debug === "undefined") ? false : _debug);

  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let Js = ctx.Js,
      Je = ctx.Je;

  let oppo_idir = [ 1,0, 3,2 ];

  let adit_points = [];

  if ((g_s[0] != g_e[0]) &&
      (g_s[1] != g_e[1])) { return []; }

  let _m = [ Math.min(g_s[0], g_e[0]), Math.min(g_s[1], g_e[1]) ];
  let _M = [ Math.max(g_s[0], g_e[0]), Math.max(g_s[1], g_e[1]) ];

	let dij = v_delta( v_sub(_M, _m) );

	let idir = dxy2idir(dij);
	let rdir = oppo_idir[idir];

	let b_M = Je[idir][ _M[1] ][ _M[0] ];
	let b_m = Je[rdir][ _m[1] ][ _m[0] ];

	let g_M = _M,
			g_m = _m;
	if (b_M >= 0) { g_M = B[b_M]; }
	if (b_m >= 0) { g_m = B[b_m]; }

	// If we have a 1-cut, we know there's going to be at least one adit point at either
	// end of the 1-cut to consider.
	// So we can add it and then iterate through the rest.
	//
	let cur_ij = [ g_m[0], g_m[1] ];
	adit_points.push( [cur_ij[0], cur_ij[1] ] );
	do {
		cur_ij = v_add(cur_ij, dij );

    adit_points.push( [cur_ij[0], cur_ij[1] ] );
	} while (cmp_v(cur_ij, g_M) != 0);

  return adit_points;
}

// We want to enumerate boundary pairs that define a tab guillotine cut that
// are made from the sides of the quarry rectangle.
// That is, we want to return all boundary regions that starts and end on one side
// of a quarry rectangle.
//
// The cleave cuts will be handled elsewhere.
//
// We walk each side of the quarry rectangle, using the `Js` structure in one
// direction to find the next general boundary point and then using it in the other direction
// to find the origin general boundary point.
//
// Return a list of general boundary index points enumerating the tab guillotine cuts
// implied by the quarry rectangle.
//
function RPRP_enumerate_quarry_side_region(ctx, g_s, g_e, g_a, g_b, _debug) {
  _debug = ((typeof _debug === "undefined") ? false : _debug);

  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let Js = ctx.Js;

  let guillotine_list = [];

  // grid rectangle corners (cw)
  //
  //  2-->--3
  //  |     |
  //  ^     v
  //  |     |
  //  1--<--0
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let s_idx = Bij[ g_s[1] ][ g_s[0] ];
  let e_idx = Bij[ g_e[1] ][ g_e[0] ];

  let oppo = [1,0, 3,2];
  let billet_idir = [ 1, 2, 0, 3 ];
  let ltgt_f = [ -1, 1, 1, -1 ];

  // We start from Rg_0 (lower right) and go clockwise around.
  //
  // From the start point Rg_i, we take the current base point, g_cur,
  // as the first non interior grid point from Rg_i, where Rg_i
  // could itself be the first non-interior point.
  // We then advance to the next border point and then look backwards.
  // This gives us a candidate 1-cut.
  // If the candidate 1-cut is within the bounds of the quarry rectangle
  // side *and* it's advanced past our current base point, we add it
  // to the guillotine list.
  //
  // If we're still within bounds, advance the current base point, g_cur,
  // to the next border corner (by using the border jump structure, Js)
  // and continue.
  //
  // The quarry rectangle is always ordered in clockwise order so
  // the order should be correct.
  // Additional checks need to be done to make sure the 1-cuts
  // are within the fenced region.
  //

  for (let r_idx=0; r_idx < Rg.length; r_idx++) {

    let r_nxt = (r_idx + 1) % Rg.length;
    let idir = billet_idir[r_idx];
    let rdir = oppo[idir];

    // See if our current base point is on the border already and,
    // if it is, take it.
    // If not, we're on an interior point so advance to the first
    // border point in the appropriate direction.
    //
    let b_idx_cur = Bij[ Rg[r_idx][1] ][ Rg[r_idx][0] ];
    if (b_idx_cur < 0) {
      b_idx_cur = Js[idir][ Rg[r_idx][1] ][ Rg[r_idx][0] ];
    }

    let g_cur = [ B[ b_idx_cur ][0], B[ b_idx_cur ][1] ];

    // xy is the axis dimension we're iterating towards.
    // _c is the factor so that we can do the less than or greater
    // than tests below.
    //

    let xy = r_idx % 2;
    let _c = ltgt_f[r_idx];

    if (_debug > 1) {
      console.log("\nqsr: Rg:", Rg, "r_idx:", r_idx);
      console.log("b_idx_cur:", b_idx_cur, "g_cur:", g_cur, "xy:", xy, "_c:", _c, "idir:", idir, "rdir:", rdir);
    }

    while ((b_idx_cur >= 0) &&
           ( (_c*(g_cur[ xy ] - Rg[r_nxt][ xy ])) < 0)) {

      // shoot ahead to next border point
      //
      let b_idx_nxt = Js[idir][ g_cur[1] ][ g_cur[0] ];
      if (b_idx_nxt < 0) { break; }
      let g_nxt = [ B[ b_idx_nxt ][0], B[ b_idx_nxt ][1] ];

      // then look back to see border point behind us
      //
      let b_idx_prv = Js[rdir][ g_nxt[1] ][ g_nxt[0] ];
      let g_prv = [ B[ b_idx_prv ][0], B[ b_idx_prv ][1] ];

      if (_debug > 1) {
        console.log("  b_idx_[prv|cur|nxt]:", b_idx_prv, b_idx_cur, b_idx_nxt, ", g_[prv|cur|nxt]:", g_prv, g_cur, g_nxt);
      }

      // make sure 1-cut is within bounds of quarry rectangle side and
      // has made progress past the current g_cur pointer.
      //
      if ( ((_c*(g_prv[xy] - Rg[r_idx][xy])) >= 0) &&
           ((_c*(g_nxt[xy] - Rg[r_nxt][xy])) <= 0) &&
           ((_c*(g_prv[xy] - g_cur[xy])) >= 0) ) {

        let se = [
          Math.min(s_idx, e_idx),
          Math.max(s_idx, e_idx)
        ];

        let np = [
          Math.min(b_idx_prv, b_idx_nxt),
          Math.max(b_idx_prv, b_idx_nxt)
        ];

        // We don't take sides that are borders and
        // we dont' want to go where we came from
        //
        let _d = abs_sum_v( v_sub(B[b_idx_prv], B[b_idx_nxt]) );

        if (_debug > 1) {
          console.log("    _d:", _d, "|d idx|:", Math.abs(b_idx_nxt - b_idx_prv),
            "se:", se, "np:", np, "wrc:",
            wrapped_range_contain( b_idx_nxt, e_idx, s_idx ),
            wrapped_range_contain( b_idx_prv, e_idx, s_idx ));

        }

        // I'm having bounds dyslexia.
        // b_idx_nxt is the **start**, b_idx_prv is the **end**
        // Find fnence distance from **start** to **end**.
        // If **end** is less than start, add B.length
        //
        let __s = b_idx_nxt;
        let __e = b_idx_prv;

        let border_diff = __e - __s;
        if (border_diff < 0) { border_diff += B.length; }
        //if (__e < __s) { border_diff = __e + B.length - __s; }

        if (_debug > 1) {
          console.log(">>>>border_diff:", border_diff, "(prv:", b_idx_prv, "nxt:", b_idx_nxt, ")");
        }

        //if ((_d != Math.abs(b_idx_nxt - b_idx_prv)) &&
        if ((_d != border_diff) &&
            ( ((se[0] != np[0]) || (se[1] != np[1])) ) &&
            wrapped_range_contain( b_idx_nxt, s_idx, e_idx ) &&
            wrapped_range_contain( b_idx_prv, s_idx, e_idx ) ) {
          guillotine_list.push( [b_idx_nxt, b_idx_prv] );

          if (_debug > 1) {
            console.log("  qsr.ADD(guillotine):", b_idx_nxt, b_idx_prv, "(se:", s_idx, e_idx,
              "contain(i,e,s):",
              wrapped_range_contain( b_idx_nxt, e_idx, s_idx ),
              wrapped_range_contain( b_idx_prv, e_idx, s_idx ),
              ")");
          }

        }

      }

      // advance and repeat
      //
      g_cur = g_nxt;
      b_idx_cur = b_idx_nxt;

    }

  }

  return guillotine_list;
}


// lightly tested
//
// ctx - RPRP context
// ij  - point being tested
// g_s - grid general border start point (counterclockwise)
// g_e - grid general border end point
// g_a - intersection of constructed lines if 2-cut, g_s or g_e if 1-cut
//
// If the grid point ij has one or non border jump points within
//   the border start and end region, it must be outside.
//
// If the grid point ij has three or four border jump points within
//   the border start and end regoin, it must be inside.
//
// If the grid point ij has exactly two shared border jump points,
//   it can be inside or outside but the rays eminating from the origin ij
//   point must cross the constructed edge cuts.
//   They further must not be inline
//
function RPRP_point_in_region(ctx, ij, g_s, g_e, g_a, _debug) {
  let Bij = ctx.Bij;
  let Js = ctx.Js;

  // degenerate
  //
  if ( ((ij[0] == g_a[0]) && (ij[1] == g_a[1])) ||
       ((ij[0] == g_s[0]) && (ij[1] == g_s[1])) ||
       ((ij[0] == g_e[0]) && (ij[1] == g_e[1])) ) {
    return 1;
  }

  // ij OOB
  //
  if ((Js[0][ ij[1] ][ ij[0] ] < 0) &&
      (Js[1][ ij[1] ][ ij[0] ] < 0) &&
      (Js[2][ ij[1] ][ ij[0] ] < 0) &&
      (Js[3][ ij[1] ][ ij[0] ] < 0)) {

    if (_debug > 2) { console.log("#pir.0"); }

    return 0;
  }

  if (typeof g_s === "undefined") {

    if (_debug > 2) { console.log("#pir.1 t"); }

    return 1;
  }

  // sanity
  //
  let idx_s = Bij[ g_s[1] ][ g_s[0] ],
      idx_e = Bij[ g_e[1] ][ g_e[0] ];
  if ((idx_s < 0) || (idx_e < 0)) {

    if (_debug > 2) { console.log("#pir.2 error"); }

    return -1;
  }

  //---

  // If ij is already on border, we can do a wrapped range test
  //
  let ij_b_idx = Bij[ ij[1] ][ ij[0] ];
  if (ij_b_idx >= 0) {

    if (_debug > 2) { console.log("#pir.3 boundary"); }

    return wrapped_range_contain( ij_b_idx, idx_s, idx_e );
  }

  let b_count = 0;
  for (let idir=0; idir<4; idir++)  {
    b_count += wrapped_range_contain( Js[idir][ ij[1] ][ ij[0] ], idx_s, idx_e );
  }

  if (b_count < 2) {

    if (_debug > 2) { console.log("#pir.4 b_count", b_count); }

    return 0;
  }
  if (b_count > 2) {

    if (_debug > 2) { console.log("#pir.5 b_count", b_count); }

    return 1;
  }

  // degenerate if ij is on (g_s, g_a) or (g_a, g_e) constructed
  // line.
  //
  for (let xy=0; xy<2; xy++) {
    let yx = 1-xy;
    if ((ij[xy] == g_s[xy]) && (ij[xy] == g_a[xy])) {
      let mM = [ Math.min(g_s[yx], g_a[yx]), Math.max(g_s[yx], g_a[yx]) ];
      if ( (ij[yx] >= mM[0]) && (ij[yx] <= mM[1]) ) {
        return 1;
      }
    }

    if ((ij[xy] == g_a[xy]) && (ij[xy] == g_e[xy])) {
      let mM = [ Math.min(g_a[yx], g_e[yx]), Math.max(g_a[yx], g_e[yx]) ];
      if ( (ij[yx] >= mM[0]) && (ij[yx] <= mM[1]) ) {
        return 1;
      }
    }
  }


  let ij3 = [ ij[0], ij[1], 0 ];
  let a3 = [ g_a[0], g_a[1], 0 ];
  let s3 = [ g_s[0], g_s[1], 0 ];
  let e3 = [ g_e[0], g_e[1], 0 ];

  // ij to the right of (g_s -> g_a) and (g_a -> g_e)
  // then inside (return 1)
  // else outside (return 0)
  //
  let zsa = cross3( v_sub( a3, s3 ), v_sub( ij3, s3 ) );
  let zae = cross3( v_sub( e3, a3 ), v_sub( ij3, a3 ) );

  if (_debug > 2) { console.log("#pir.6 zsa", zsa, "zae", zae); }

  if ((zsa[2] < 0) && (zae[2] < 0)) { return 1; }
  return 0;
}

// lightly tested
//
// Input
//   g_a and g_b are grid endpoints of the rectangle R_g (in any order)
//
// Return:
//
//   1 - if rectangle is wholly contained in the rectilinear polygon
//   0 - otherwise
//
// If the area is 0, we can immediately return 0.
//
// Consider two endpoints from a rectangle side, R_g[p] and R_g[q].
//
// R_g is ordered clockwise with the first point in the lower right:
//
//   2---3
//   |   |
//   1---0
//
// For a cardinal direction, if R_g[p] and R_g[q] agree on the last
// general border index point, then they must have an unbroken line
// segment between them that lies completely within the original polygon.
//
// For example, if R_g[0] shoots right and hits the last general border endpoint b,
// and R_g[1] shoots right to hit the same last general border endpoint b, then
// there must be a an unbroken line between them.
// If R_g[1] had a different endpoint, the rectilinear polygon must have had
// a portion of it's boundary jutting through the area between them.
//
// We do this for all neighboring pairs of R_g in each of the appropriate directions.
//
// Note that this must be the last endpoint, so using the Je structure and not the Js,
// beacuse using the first general border endpoint would give corners for borders
// that are colinear with the R_g side.
//
// If the R_g point is the last general border endpoint in the appropriate
// direction, we lookup the endpoint from the Bij structure instead of the Je.
// If the point is the last point on the boundary, the Js and Je structures
// take the ray starting from the point in the cardinal direction which, in
// this case, goes out of bounds.
//
// If all endpoints match up and the area is non-zero, we have a valid rectangle.
// 
//
function RPRP_valid_R(ctx, g_a, g_b) {
  let Je = ctx.Je;
  let Bij = ctx.Bij;

  // 2---3
  // |   |
  // 1---0
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  let pq_idir = [
    [ 0, 1, 0 ], [ 0, 1, 1 ],
    [ 1, 2, 2 ], [ 1, 2, 3 ],
    [ 2, 3, 0 ], [ 2, 3, 1 ],
    [ 3, 0, 2 ], [ 3, 0, 3 ]
  ];

  let area = abs_sum_v( v_sub(Rg[0], Rg[1]) ) * abs_sum_v( v_sub(Rg[1], Rg[2]) );

  //console.log("## valid_R area =", area, "g_a:", g_a, "g_b:", g_b);

  if (area == 0) { return 0; }

  for (let idx=0; idx<pq_idir.length; idx++) {
    let p = pq_idir[idx][0];
    let q = pq_idir[idx][1];
    let idir = pq_idir[idx][2];

    // If the ray endpoint is out of bounds, we could be on the
    // border.
    // If we aren't on a border, we know it's not a valid rectangle
    // (we're in a dead-zone).
    // Otherwise, compare the endpoints to make sure they match up.
    //
    let p_b_idx = Je[idir][ Rg[p][1] ][ Rg[p][0] ];
    if (p_b_idx < 0) { p_b_idx = Bij[ Rg[p][1] ][ Rg[p][0] ]; }

    let q_b_idx = Je[idir][ Rg[q][1] ][ Rg[q][0] ];
    if (q_b_idx < 0) { q_b_idx = Bij[ Rg[q][1] ][ Rg[q][0] ]; }

    if ((p_b_idx < 0) || (q_b_idx < 0)) { return 0; }
    if (p_b_idx != q_b_idx) { return 0; }
  }

  return 1;
}


// WIP!!!
// still has bug...
// ???
// this might be cruft at this point, consider removing

// Test for valid quarry rectangle.
//
// The rectangle is defined by g_a and g_b, must be wholly contained
// in the region defined by the 1-cut or 2-cut defined by
// g_s, g_e, g_a.
//
//
// Input:
//
//   g_s - start region point on general border point (counterclockwise order)
//   g_e - end region point on general border point
//   g_a - adit point of cut and quarry rectangle
//   g_b - bower point of quarry rectangle
//
// Output:
//
//   1 - valid quarry rectangle
//   0 - otherwise
//
// Test for valid rectangle in addition to making sure all endoints of quarry
// rectangle fall within the region.
//
function RPRP_valid_quarry(ctx, g_s, g_e, g_a, g_b) {

  if (RPRP_valid_R(ctx, g_a, g_b) == 0) {

    //console.log("### vq.0:", g_s, g_e, g_a, g_b, " valid_R==0!");

    return 0;
  }

  // 2---3
  // |   |
  // 1---0
  //
  let Rg = [
    [ Math.max( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.min( g_a[1], g_b[1] ) ],
    [ Math.min( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ],
    [ Math.max( g_a[0], g_b[0] ), Math.max( g_a[1], g_b[1] ) ]
  ];

  for (let i=0; i<Rg.length; i++) {
    if (RPRP_point_in_region(ctx, Rg[i], g_s, g_e, g_a) == 0) {

      //console.log("### vq.1:", g_s, g_e, g_a, g_b, "Rg[", i, "]:", Rg[i], " pir==0!");

      return 0;
    }
  }

  let cleave_profile = RPRPCleaveProfile(ctx, g_s, g_e, g_a, g_b);

  if ((cleave_profile[0] == 'b') && (cleave_profile[7] == 'b')) { return 0; }
  if ((cleave_profile[1] == 'b') && (cleave_profile[2] == 'b')) { return 0; }
  if ((cleave_profile[3] == 'b') && (cleave_profile[4] == 'b')) { return 0; }
  if ((cleave_profile[5] == 'b') && (cleave_profile[6] == 'b')) { return 0; }

  return 1;
}

// reverse index to get border cut points and 't' value
// (which corner the quarry adit point is)
//
function RPRP_DPidx2b(ctx, dp_idx) {
  let n = ctx.B.length;
  let _idx = dp_idx;

  let t = _idx % 2;
  _idx = Math.floor( _idx / 2 );

  let idx_s = _idx % n;
  _idx = Math.floor( _idx / n );

  let idx_e = _idx % n;

  return [ idx_s, idx_e, t ];
}

// lightly tested
//
function RPRP_DPidx2g(ctx, dp_idx) {

  let s_e_t = RPRP_DPidx2b(ctx, dp_idx);

  let g_s = ctx.B[ s_e_t[0] ];
  let g_e = ctx.B[ s_e_t[1] ];

  let g_a = [-1,-1];

  // g_s in line with g_e (1-cut)
  //
  if ((g_s[0] == g_e[0]) ||
      (g_s[1] == g_e[1])) {

    if (s_e_t[2] == 0) {
      g_a[0] = g_s[0];
      g_a[1] = g_e[1];
    }

    else {
      g_a[0] = g_e[0];
      g_a[1] = g_s[1];
    }

    return [ g_s, g_e, g_a ];
  }

  // g_s diagonal to g-e
  //

  let g_a0 = [ g_s[0], g_e[1] ];
  let g_a1 = [ g_e[0], g_s[1] ];

  let s_3 = [g_s[0], g_s[1], 0];
  let e_3 = [g_e[0], g_e[1], 0];
  let a0_3 = [g_a0[0], g_a0[1], 0];
  let a1_3 = [g_a1[0], g_a1[1], 0];

  let v0 = cross3( v_sub(a0_3, s_3), v_sub(e_3, s_3) );
  let v1 = cross3( v_sub(a1_3, s_3), v_sub(e_3, s_3) );

  let t0 = ((v0[2] > 0) ? 0 : 1);
  let t1 = ((v1[2] > 0) ? 0 : 1);

  g_a = g_a0;
  if (s_e_t[2] == t1) { g_a = g_a1; }


  return [ g_s, g_e, g_a ];
}

// The one-cuts need to take the adit point in-line with
// the cut line, exploding the number of adit points
// available for the DP array.
// Instead, we use a DP hash with a custom key.
//
function RPRP_DP_idx(ctx, g_s, g_e, g_a) {
  let B = ctx.B;
  let Bij = ctx.Bij;

  let idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let idx_e = Bij[ g_e[1] ][ g_e[0] ];

  let key = idx_s.toString() + ":" +
            idx_e.toString() + ";" +
            g_a[0].toString() + "," + g_a[1].toString();

  return key;
}

// The dynamic programming array is of size |B| x |B| x 2.
// Here it's giving back a single index, so it's considering
// a flattened array, but it can be thought of as the
// first dimension of the start general border point, g_s,
// the end general border point, g_e, and what corner the
// adit point, g_a, is on.
//
// If a 1-cut, the adit index is 0 if on g_s or 1 if on g_e.
// For a 2-cut, g_s and g_e are not inline, so the adit
// index is taken to be 0 if to the right of the (g_s,g_e) line
// and 1 otherwise.
//
function _RPRP_DP_idx(ctx, g_s, g_e, g_a) {
  let B = ctx.B;
  let Bij = ctx.Bij;

  let n = B.length;

  let idx_s = Bij[ g_s[1] ][ g_s[0] ];
  let idx_e = Bij[ g_e[1] ][ g_e[0] ];

  //....

  let t = -1;
  if      ((g_a[0] == g_s[0]) && (g_a[1] == g_s[1])) { t=0; }
  else if ((g_a[0] == g_e[0]) && (g_a[1] == g_e[1])) { t=1; }
  else {

    let s3 = [g_s[0], g_s[1], 0];
    let e3 = [g_e[0], g_e[1], 0];
    let a3 = [g_a[0], g_a[1], 0];

    let v = cross3( v_sub(a3,s3), v_sub(e3,s3) );

    if (v[2] > 0) { t = 0; }
    else          { t = 1; }

  }

  if (t<0) { return -1; }

  let dp_idx = (2*idx_s) + (2*n*idx_e) + t;

  return dp_idx;
}

function _Ink(g_a, g_b) {
  let dx = Math.abs(g_b[0] - g_a[0]);
  let dy = Math.abs(g_b[1] - g_a[1]);

  return 2*(dx+dy);
}

function _ws(n, s, pfx) {
  n = ((typeof n === "undefined") ? 0 : n);
  s = ((typeof s === "undefined") ? ' ' : s);
  pfx = ((typeof pfx === "undefined") ? "" : pfx);
  let a = [];
  for (let i=0; i<n; i++) { a.push(s); }
  return pfx + a.join("");
}

// try to separate out bower list for future optimizations.
//
//
function RPRP_candidate_bower(ctx, g_s, g_e, g_a, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let X = ctx.X,
      Y = ctx.Y;

  let candidate_bower = [];

  for (let j=0; j<Y.length; j++) {
    for (let i=0; i<X.length; i++) {
      candidate_bower.push([i,j]);
    }
  }

  return candidate_bower;
}

//WIP!!

function _dbg_mirp_beg(_debug, _pfx,  g_s, g_e, b_s, b_e, g_a) {
  if (_debug) {
    console.log("\n" + _pfx + ".beg:",
      "g_s:", JSON.stringify(g_s), "(" + b_s.toString() + ")",
      "g_e:", JSON.stringify(g_e), "(" + b_e.toString() + ")",
      "g_a:", g_a);
  }
}

function _dbg_mirp_dp(_debug, _pfx, ctx, dp_idx, g_s, g_e, g_a) {
  if (_debug) {
    console.log( _pfx + ".memz: DP_cost[", dp_idx, "] ->", ctx.DP_cost[dp_idx],
      "(g_s:", JSON.stringify(g_s), "g_e:", JSON.stringify(g_e), "g_a:", JSON.stringify(g_a), ")");
  }
}

function _dbg_mirp_bower(_debug, _pfx, candidate_bower) {
  if (_debug > 0) {
    console.log( _pfx + "bower:", JSON.stringify(candidate_bower));
  }
}

function _dbg_mirp_quarry_skip(_debug, _pfx, g_s, g_e, g_a, g_b, comment) {
  if (_debug > 1) {
    //console.log( _ws(2*lvl), "skipping", g_s, g_e, g_a, g_b, "(", qi.comment, ")");
    console.log( _pfx, "skipping", g_s, g_e, g_a, g_b, "(", comment, ")");
  }
}


function _dbg_mirp_quarry_info(_debug, _pfx, lvl, g_s, g_e, g_a, g_b, qi, a_pnt, b_pnt, quarry_rect_cost) {
  if (_debug) {
    console.log( _pfx, "considering:", "(g_s:", g_s, "g_e:", g_e, "g_a:", g_a, "g_b:", g_b, ")",
      "(#side:", qi.side_cut.length, "#corner:", qi.corner_cuts.length, ")");
    console.log( _pfx, "side_cut:", JSON.stringify(qi.side_cut));

    let cc_a = [];
    for (let i=0; i<qi.corner_cuts.length; i++) {
      cc_a.push( JSON.stringify(qi.corner_cuts[i]) );
    }

    //console.log( _pfx, "corner_cuts:", JSON.stringify(qi.corner_cuts));
    console.log( _pfx, "corner_cuts:", cc_a.join(" "));

    console.log( _pfx, "mirp." + lvl.toString(),
      "ink:", quarry_rect_cost, _Ink(a_pnt, b_pnt), "(g_ab:", g_a, g_b, "ab_pnt:", a_pnt, b_pnt, ")");
  }
}


function RPRP_MIRP(ctx, g_s, g_e, g_a, lvl, _debug, _debug_str) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);
  _debug_str = ((typeof _debug_str === "undefined") ? "" : _debug_str);
  lvl = ((typeof lvl === "undefined") ? 0 : lvl);

  let _debug_id = _debid();
  let _pfx = _ws(2*lvl) + "mirp." + lvl.toString() + "(" + _debug_str + " -> " + _debug_id + ")";
  _debug_str = _debug_id;

  let B = ctx.B,
      Bt = ctx.Bt,
      Bij = ctx.Bij,
      Bxy = ctx.Bxy,
      G = ctx.G,
      Gt = ctx.Gt,
      Gij = ctx.Gij,
      Gxy = ctx.Gxy,
      X = ctx.X,
      Y = ctx.Y,
      Js = ctx.Js;

  let _min_cost = -1,
      _min_partition = [],
      _min_bower = [-1,-1],
      _min_rect = [];

  let _init = false;
  if (typeof g_s === "undefined") {
    g_s = B[0];
    g_e = B[0];
    g_a = B[0];
    _init = true;
  }

  let b_s = Bij[ g_s[1] ][ g_s[0] ];
  let b_e = Bij[ g_e[1] ][ g_e[0] ];

  _dbg_mirp_beg(_debug, _pfx, g_s, g_e, b_s, b_e, g_a);

  // default to first entry on border.
  //
  if (_init) { ctx.DP_root_key = [0,0,[g_a[0],g_a[1]]]; }

  // See if it's already memoized, if so, return it
  //
  let dp_idx = RPRP_DP_idx(ctx, g_s, g_e, g_a);
  if ( (dp_idx in ctx.DP_cost) && (ctx.DP_cost[dp_idx] >= 0) ) {

    _dbg_mirp_dp(_debug, _pfx, ctx, dp_idx, g_s, g_e, g_a);

    return ctx.DP_cost[dp_idx];
  }

  // We get a list of bower points, check for a valid rectangle
  // and quarry and, if valid:
  //
  // * store the result if it's a simple rectangle
  // * recur on all side cuts, enumerating through each potential adit point
  // * recur on all corner cuts, either taking the two cuts as is
  //   or enumerating adit cuts
  //
  let candidate_bower = RPRP_candidate_bower(ctx, g_s, g_e, g_a);

  _dbg_mirp_bower(_debug, _pfx, candidate_bower );

  for (let bower_idx = 0; bower_idx < candidate_bower.length; bower_idx++) {
    let g_b = candidate_bower[bower_idx];

    let qi = RPRPQuarryInfo(ctx, g_s, g_e, g_a, g_b, _debug);
    if (qi.valid == 0) {

      if (_debug > 0) { console.log( _pfx, "skip [", JSON.stringify(g_a), JSON.stringify(g_b), "]", "(", qi.comment, ")"); }

      _dbg_mirp_quarry_skip(_debug, _pfx, g_s, g_e, g_a, g_b, qi.comment);
      continue;
    }

    if (_debug) {
      console.log( _pfx, "considering quarry: [", JSON.stringify(g_a), JSON.stringify(g_b), "]");
    }


    let a_pnt = Gxy[ Gij[ g_a[1] ][ g_a[0] ] ];
    let b_pnt = Gxy[ Gij[ g_b[1] ][ g_b[0] ] ];

    let quarry_rect_cost = _Ink(a_pnt, b_pnt);

    let _min_corner_cut_cost = 0;
    let _min_corner_cut_sched_idx = -1;

    let _min_side_cut_cost = 0;
    let _min_side_cut = [];

    _dbg_mirp_quarry_info(_debug, _pfx, lvl, g_s, g_e, g_a, g_b, qi, a_pnt, b_pnt, quarry_rect_cost);

    for (let sched_idx=0; sched_idx < qi.side_cut.length; sched_idx++) {
      let one_cut = qi.side_cut[sched_idx];

      let candidate_adit = RPRP_enumerate_one_cut_adit_points(ctx, B[one_cut[0]], B[one_cut[1]], _debug);

      if (_debug) {
        console.log( _pfx, "adit:", JSON.stringify(candidate_adit));
      }

      let _min_idx = -1;
      let _min_g_a = [-1,-1];

      let one_cut_cost = 0;
      for (let adit_idx=0; adit_idx < candidate_adit.length; adit_idx++) {
        let g_a = candidate_adit[adit_idx];

        let _cost = RPRP_MIRP(ctx, B[one_cut[0]], B[one_cut[1]], g_a, lvl+1, _debug, _debug_str);

        if (_debug) {
          console.log( _pfx, "cost of ", one_cut[0], one_cut[1], JSON.stringify(g_a), ":", _cost);
        }

        if ( (_cost > 0) &&
             ((_min_idx < 0) ||
              (_cost < one_cut_cost)) ) {
          one_cut_cost = _cost;
          _min_idx = adit_idx;
          _min_g_a = [ g_a[0], g_a[1] ];

          if (_debug) {
            console.log( _pfx, "updating side_cut, current min cost (", _cost, ", _min_idx:", adit_idx, ", g_a:", JSON.stringify(g_a), ")");
          }

        }

        if (_debug) {
          console.log( _pfx, "side_cut[", sched_idx, "]", "_cost:", _cost,
            "one_cut_cost:", one_cut_cost, "min_idx:", _min_idx, "g_a:", JSON.stringify(_min_g_a) );
        }

      }

      //ERROR
      if (_min_idx < 0) {
        _ERROR("MIRP." + lvl.toString() + ": no valid side one cut found: " +
               "sched[" + sched_idx.toString() + "]: " + JSON.stringify(qi.side_cut[sched_idx]));
        return -1;
      }

      //if (one_cut_cost >= 0) {

      if (_debug > 0) {
        console.log(_pfx, "ADDING one_cut_cost:", one_cut_cost, "one_cut[", one_cut[0], one_cut[1], JSON.stringify(_min_g_a), "]");
      }

        _min_side_cut_cost += one_cut_cost;
        //_min_one_cut.push( one_cut[_min_idx] );
        _min_side_cut.push( [ one_cut[0], one_cut[1], _min_g_a ] );
      //}

      if (_debug) {
        console.log( _pfx, "one_cut[", sched_idx, "] (#", candidate_adit.length, "):", one_cut_cost, ", _min_side_cut_cost:", _min_side_cut_cost);
      }

    }

    // take min of sched....
    //
    for (let sched_idx=0; sched_idx<qi.corner_cuts.length; sched_idx++) {
      let cut_batch = qi.corner_cuts[sched_idx];

      //console.log(_pfx, "corner>>>>", sched_idx, JSON.stringify(cut_batch));

      let cur_cut_cost = 0;
      for (let ci=0; ci<cut_batch.length; ci++) {

        let cut = cut_batch[ci];

        let _g_s = B[cut[0]];
        let _g_e = B[cut[1]];
        let _g_a = cut[2];


        if ( (_g_s[0] != _g_e[0]) &&
             (_g_s[1] != _g_e[1]) ) {

          // two-cut
          //
          cur_cut_cost += RPRP_MIRP(ctx, _g_s, _g_e, _g_a, lvl+1, _debug, _debug_str);
          continue;
        }

        //else one-cut
        //
        let _min_one_cut_cost = -1;
        let candidate_adit = RPRP_enumerate_one_cut_adit_points(ctx, _g_s, _g_e, _debug);

        //console.log(">>> candidate_adit:", JSON.stringify(candidate_adit));

        for (let adit_idx=0; adit_idx < candidate_adit.length; adit_idx++) {

          let _cost = RPRP_MIRP(ctx, _g_s, _g_e, candidate_adit[adit_idx], lvl+1, _debug, _debug_str);
          if (_cost < 0) { continue; }

          // update min cost and update adit point used
          // inside of the actual corner cut schedule.
          // The adit point will be used to construct the key
          // in the DP array/structure.
          //
          if ( (_min_one_cut_cost < 0) ||
               (_cost < _min_one_cut_cost) ) {
            _min_one_cut_cost = _cost;
            qi.corner_cuts[sched_idx][ci][2][0] = candidate_adit[adit_idx][0];
            qi.corner_cuts[sched_idx][ci][2][1] = candidate_adit[adit_idx][1];
          }
        }

        // sanity
        //
        if (_min_one_cut_cost < 0) {
          if (_debug) {
            console.log(_pfx, "SANITY ERROR: _min_one_cut_cost < 0! cut_batch[", sched_idx, "]:", JSON.stringify(cut_batch));
          }
          return -1;
        }

        cur_cut_cost += _min_one_cut_cost;
      }

      if (_debug) {
        console.log( _pfx, "cur_cut_cost:", cur_cut_cost, "(sched_idx:", sched_idx, ")");
      }

      if ((_min_corner_cut_sched_idx < 0) ||
          (cur_cut_cost < _min_corner_cut_cost)) {
        _min_corner_cut_cost = cur_cut_cost;
        _min_corner_cut_sched_idx = sched_idx;
      }

    }

    if ((_min_cost < 0) ||
        ((quarry_rect_cost + _min_side_cut_cost + _min_corner_cut_cost) < _min_cost) ) {

      let _corner_cut_batch  = [];
      if (_min_corner_cut_sched_idx >= 0) {
        _corner_cut_batch = qi.corner_cuts[_min_corner_cut_sched_idx];
      }

      _min_cost = quarry_rect_cost + _min_side_cut_cost + _min_corner_cut_cost;
      _min_rect = [ [ g_a[0], g_a[1] ], [ g_b[0], g_b[1] ] ];
      _min_partition = [ _min_side_cut, _corner_cut_batch ];
      //_min_partition = [ min_side_cut, min_corner_cuts ];

      if (_debug) {
        console.log(_pfx, "updating min: _min_cost:", _min_cost, "_min_rect:", _min_rect,
          "_min_part:", JSON.stringify(_min_partition), "(_min_core_cut_sched_idx:", _min_corner_cut_sched_idx,")");
      }

    }

    if (_debug) {
      //console.log( _ws(2*lvl), "_min_cost:", _min_cost, "scost:", quarry_rect_cost + _min_side_cut_cost + _min_corner_cut_cost,
      console.log( _pfx, "_min_cost:", _min_cost, "scost:", quarry_rect_cost + _min_side_cut_cost + _min_corner_cut_cost,
      "(", quarry_rect_cost, "+", _min_side_cut_cost, "+", _min_corner_cut_cost, ")");
    }

  }

  if (_min_cost >= 0) {
    ctx.DP_cost[dp_idx]       = _min_cost;
    ctx.DP_rect[dp_idx]       = _min_rect;
    ctx.DP_bower[dp_idx]      = _min_bower;
    ctx.DP_partition[dp_idx]  = _min_partition;


    if (_debug) {
      console.log(_pfx, "DPCOST[", dp_idx, "]:", _min_cost, JSON.stringify(_min_rect), JSON.stringify(_min_bower), JSON.stringify(_min_partition));
    }

  }

  if (_debug) {
    //console.log( _ws(2*lvl), "mirp." + lvl.toString(), "<<<", "(_min_cost:", _min_cost, ")");
    console.log( _pfx, "<<<", "(_min_cost:", _min_cost, ")");
  }


  //_init = false;
  if (_init) {
    let plist = [];
    let Qkey = [ ctx.DP_root_key ];

    while (Qkey.length > 0) {
      let p = Qkey.pop();
      plist.push(p);

      let key = RPRP_DP_idx(ctx, B[p[0]], B[p[1]], p[2]);


      //console.log("???", key, ctx.DP_partition);
      //_print_dp(ctx);

      if (key in ctx.DP_partition) {

        let one_cut = ctx.DP_partition[key][0];
        let two_cut = ctx.DP_partition[key][1];

        for (let i=0; i<one_cut.length; i++) { Qkey.push( one_cut[i] ); }
        for (let i=0; i<two_cut.length; i++) { Qkey.push( two_cut[i] ); }
      }

      else {
        console.log("KEY ERROR:", key, "not found in DP_partition");
      }
    }

    ctx["partition"] = plist;

    /*
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    _print_dp(ctx);
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    console.log("===============================");
    */

  }

  return _min_cost;
}



//------
//------
//------
//------
//------
//------
//------


function _main_example() {
  //let grid_info = RPRPInit(pgn_pinwheel1);
  let grid_info = RPRPInit(pgn_bottom_guillotine);
  _print_rprp(grid_info);
}

function _main_checks() {

  let grid_info_0 = RPRPInit(pgn_pinwheel1);
  let cp_0 = RPRPCleaveProfile(grid_info_0, [3,1], [1,2], [3,2], [2,4]);
  let cc_0 = RPRP_cleave_enumerate(grid_info_0,  [3,1], [1,2], [3,2], [2,4], cp_0);
  let v_0 = _expect( cc_0, [], _sfmt("pgn_pinwheel_0", 16, 'r') );

  let grid_info_1 = RPRPInit(pgn_pinwheel1);
  let cp_1 = RPRPCleaveProfile(grid_info_1, [3,1], [1,2], [3,2], [2,3]);
  let cc_1 = RPRP_cleave_enumerate(grid_info_1,  [3,1], [1,2], [3,2], [2,3], cp_1);
  let v_1 = _expect( cc_1,
    //[ ['-','c','X','c','-','*','-','*'] ],
    [ ['-','*','X','*','-','*','-','*'] ],
    _sfmt("pgn_pinwheel_1", 16, 'r') );


  let grid_info_2 = RPRPInit(pgn_balance);
  let cp_2 = RPRPCleaveProfile(grid_info_2, [7,1], [5,4], [7,4], [2,5]);
  let cc_2 = RPRP_cleave_enumerate(grid_info_2, [7,1], [5,4], [7,4], [2,5], cp_2);
  let v_2 = _expect( cc_2, 
    //[ ["-","c","*","-","*","-","*","-"],
    //  ["-","c","*","-","*","-","-","*"]],
    [ ["-","*","*","-","*","-","*","-"],
      ["-","*","*","-","*","-","-","*"]],
    _sfmt("pgn_balance_2", 16,'r') );

  if (!v_2) {
    let _e = [ ["-","*","*","-","*","-","*","-"],
            ["-","*","*","-","*","-","-","*"]];

    for (let i=0; i<cc_2.length; i++) {
      console.log("got:", cc_2[i].join(""));
    }
    for (let i=0; i<_e.length; i++) {
      console.log("xct:", _e[i].join(""));
    }
  }

  let grid_info_3 = RPRPInit(pgn_clover);
  let cp_3 = RPRPCleaveProfile(grid_info_3, [5,7], [6,5], [6,7], [3,3]);
  let cc_3 = RPRP_cleave_enumerate(grid_info_3, [5,7], [6,5], [6,7], [3,3], cp_3);
  let v_3 = _expect( cc_3,
    [ ['x','b','b','-','b','x','X','X'] ],
    _sfmt("pgn_clover_3", 16, 'r') );

  /*
  let grid_info_3a = RPRPInit(pgn_clover3);
  let cp_3a = RPRPCleaveProfile(grid_info_3a, [5,7], [6,5], [6,7], [3,3]);
  let cc_3a = RPRP_cleave_enumerate(grid_info_3a, [5,7], [6,5], [6,7], [3,3], cp_3a);
  let v_3a = _expect( cc_3a,
    [ ['x','b','b','-','b','x','X','X'] ],
    _sfmt("pgn_clover_3a", 16, 'r') );
  */

  let grid_info_4 = RPRPInit(pgn_clover);
  let cp_4 = RPRPCleaveProfile(grid_info_4, [3,3], [3,4], [3,3], [6,7]);
  let cc_4 = RPRP_cleave_enumerate(grid_info_4, [3,3], [3,4], [3,3], [6,7], cp_4);
  let v_4 = _expect( cc_4,
    [ ['x','b','X','X','b','x','*','-'],
      ['x','b','X','X','b','x','-','*'] ],
    _sfmt("pgn_clover_4", 16, 'r') );

  let grid_info_5 = RPRPInit(pgn_clover1);
  let cp_5 = RPRPCleaveProfile(grid_info_5, [2,3], [2,4], [2,3], [5,7]);
  let cc_5 = RPRP_cleave_enumerate(grid_info_5, [2,3], [2,4], [2,3], [5,7], cp_5);
  let v_5 = _expect( cc_5,
    [ ['x','b','X','X','-','b','*','-'],
      ['x','b','X','X','-','b','-','*'] ],
    _sfmt("pgn_clover_5", 16, 'r') );

  let grid_info_6 = RPRPInit(pgn_clover2);
  let cp_6 = RPRPCleaveProfile(grid_info_6, [4,2], [2,4], [2,2], [7,7]);
  let cc_6 = RPRP_cleave_enumerate(grid_info_6, [4,2], [2,4], [2,2], [7,7], cp_6);
  let v_6 = _expect( cc_6,
    [ ['*','-','X','X','*','-','*','-'],
      ['-','*','X','X','*','-','*','-'],
      ['*','-','X','X','-','*','*','-'],
      ['-','*','X','X','-','*','*','-'],
      ['*','-','X','X','*','-','-','*'],
      ['-','*','X','X','*','-','-','*'],
      ['*','-','X','X','-','*','-','*'],
      ['-','*','X','X','-','*','-','*'] ],
    _sfmt("pgn_clover_6", 16, 'r') );

  let grid_info_7 = RPRPInit(pgn_double_edge_cut);
  let cp_7 = RPRPCleaveProfile(grid_info_7, [6,2], [5,1], [6,1], [3,5]);
  let cc_7 = RPRP_cleave_enumerate(grid_info_7, [6,2], [5,1], [6,1], [3,5], cp_7);
  let v_7 = _expect( cc_7,
    [ ['X','X','x','x','*','-','x','x'],
      ['X','X','x','x','-','*','x','x'],
      ['X','X','x','x','*','*','x','x'] ],
    _sfmt("pgn_clover_7", 16, 'r') );


  let grid_info_8 = RPRPInit(pgn_quarry_corner_convex);
  let cp_8 = RPRPCleaveProfile(grid_info_8, [4,2], [3,1], [4,1], [1,4]);
  let cc_8 = RPRP_cleave_enumerate(grid_info_8, [4,2], [3,1], [4,1], [1,4], cp_8);
  let v_8 = _expect( cc_8, [], _sfmt("pgn_corner_8", 16, 'r') );

  let grid_info_9 = RPRPInit(pgn_left_run);
  let cp_9 = RPRPCleaveProfile(grid_info_9, [6,1], [4,1], [6,1], [3,7]);
  let cc_9 = RPRP_cleave_enumerate(grid_info_9, [6,1], [4,1], [6,1], [3,7], cp_9);
  let v_9 = _expect( cc_9, [], _sfmt("pgn_corner_9", 16, 'r') );

  //----
  // guillotine tests
  //
  let grid_info_10 = RPRPInit(pgn_bottom_guillotine);

  let g_s = [-1,-1], g_e = [-1,-1], g_a = [-1,-1], g_b = [-1, -1];

  g_s = [2,4]; g_e = [1,4];
  g_a = [1,4]; g_b = [5,5];

  //let cp_10 = RPRPCleaveProfile(grid_info_10, g_s, g_e, g_a, g_b);
  let cut_10 = RPRP_enumerate_quarry_side_region(grid_info_10, g_s, g_e, g_a, g_b);
  let v_10 = _expect( cut_10,
     //[[7,10],[53,6],[46,52],[11,46]],
     [[7,10],[46,52],[11,46]],
    _sfmt("pgn_guillotine_10", 16, 'r') );

  g_s = [2,4]; g_e = [1,4];
  g_a = [1,4]; g_b = [4,5];

  //let cp_11 = RPRPCleaveProfile(grid_info_10, g_s, g_e, g_a, g_b);
  let cut_11 = RPRP_enumerate_quarry_side_region(grid_info_10, g_s, g_e, g_a, g_b);
  let v_11 = _expect( cut_11,
    //[[7,10],[53,6]],
    [[7,10]],
    _sfmt("pgn_guillotine_11", 16, 'r') );


  g_s = [2,4]; g_e = [1,4];
  g_a = [1,4]; g_b = [13,5];

  //let cp_12  = RPRPCleaveProfile(grid_info_10, g_s, g_e, g_a, g_b);
  let cut_12 = RPRP_enumerate_quarry_side_region(grid_info_10, g_s, g_e, g_a, g_b);
  let v_12 = _expect( cut_12,
    //[[27,31],[18,26],[12,17],[7,10],[53,6],[46,52]],
    [[27,31],[18,26],[12,17],[7,10],[46,52]],
    _sfmt("pgn_guillotine_12", 16, 'r') );


  g_s = [2,4]; g_e = [1,4];
  g_a = [1,4]; g_b = [12,5];

  //let cp_13 = RPRPCleaveProfile(grid_info_10, g_s, g_e, g_a, g_b);
  let cut_13 = RPRP_enumerate_quarry_side_region(grid_info_10, g_s, g_e, g_a, g_b);
  let v_13 = _expect( cut_13,
    //[[18,26],[12,17],[7,10],[53,6],[46,52]],
    [[18,26],[12,17],[7,10],[46,52]],
    _sfmt("pgn_guillotine_13", 16, 'r') );

  g_s = [2,4]; g_e = [1,4];
  g_a = [1,4]; g_b = [9,5];

  //let cp_14 = RPRPCleaveProfile(grid_info_10, g_s, g_e, g_a, g_b);
  let cut_14 = RPRP_enumerate_quarry_side_region(grid_info_10, g_s, g_e, g_a, g_b);
  let v_14 = _expect( cut_14,
    //[[12,17],[7,10],[53,6],[46,52]],
    [[12,17],[7,10],[46,52]],
    _sfmt("pgn_guillotine_14", 16, 'r') );

  /*
  let grid_info_15 = RPRPInit(pgn_clover3);
  let cp_15 = RPRPCleaveProfile(grid_info_15, [5,7], [6,5], [6,7], [3,3]);
  let cc_15 = RPRP_cleave_enumerate(grid_info_15, [5,7], [6,5], [6,7], [3,3], cp_15);
  let v_15 = _expect( cc_15,
    [ ],
    _sfmt("pgn_clover_15", 16, 'r') );
    */

}

function _expect( q, v, _verbose ) {
  _verbose = ((typeof _verbose === "undefined") ? "" : _verbose);
  if (JSON.stringify(q) != JSON.stringify(v)) {
    if (_verbose.length) { console.log(_verbose + ":", "EXPECT FAILED: got:", JSON.stringify(q), ", expected:", JSON.stringify(v)); }
    return false;
  }
  if (_verbose) { console.log(_verbose + ":", "expect pass"); }
  return true;
}

function _main_rprpinit_test() {
  //RPRPInit( pgn_pinwheel1 );
  //RPRPInit( pgn_spiral1, 1 );
  RPRPInit( pgn_balance, 1 );
}

function _main_pir_test() {
  let ctx = RPRPInit( pgn_pinwheel1 );

  let g_s = ctx.G[0],
      g_e = ctx.G[0],
      g_a = ctx.G[0];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }

  console.log("\n");

  g_s = [2,4];
  g_e = [4,3];
  g_a = [2,3];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }
  console.log("\n");

  g_s = [1,2];
  g_e = [4,3];
  g_a = [1,3];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }
  console.log("\n");

  g_s = [4,3];
  g_e = [1,2];
  g_a = [1,3];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }
  console.log("\n");

  g_s = [1,1];
  g_e = [3,1];
  g_a = [3,1];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }
  console.log("\n");

  g_s = [3,1];
  g_e = [1,1];
  g_a = [1,1];

  console.log("\n");
  console.log("# g_s:", g_s, "g_e:", g_e, "g_a:", g_a);
  for (let j=(ctx.Y.length-1); j>=0; j--) {
    let row_s = [];
    for (let i=0; i<ctx.X.length; i++) {
      let v = RPRP_point_in_region(ctx, [i,j], g_s, g_e, g_a);
      row_s.push( (v>0) ? '*' : '.' );
    }
    console.log(row_s.join(""));
  }
  console.log("\n");

}

function _main_custom() {

  let g_s = [1,4],
      g_e = [2,5],
      g_a = [1,5],
      g_b = [4,3];

  let grid_info_x = RPRPInit(pgn_custom1);

  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, 1);

  console.log(cp_x.join(""));
  for (let i=0; i<cc_x.length; i++) {
    console.log(cc_x[i].join(""));
  }

  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, 1);

  console.log(cc_x);
  console.log(cs_x);


  //let v_x = _expect( cc_x, [], _sfmt("pgn_corner_x", 16, 'r') );


}

function _main_custom_1() {

  let g_s = [1,4],
      g_e = [2,5],
      g_a = [1,5],
      g_b = [10,3];

  let grid_info_x = RPRPInit(pgn_dragon);

  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, 1);

  console.log(cp_x.join(""));
  for (let i=0; i<cc_x.length; i++) {
    console.log(cc_x[i].join(""));
  }

  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, 1);

  console.log(cc_x);
  console.log(cs_x);


  //let v_x = _expect( cc_x, [], _sfmt("pgn_corner_x", 16, 'r') );


}

function _main_custom_2() {

  console.log("NO");

  /*
  let _debug = 0;

  let g_s = [2,5],
      g_e = [3,6],
      g_a = [2,6],
      g_b = [6,3];

  let grid_info_x = RPRPInit(pgn_horseshoe);

  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);

  //console.log(cp_x.join(""));
  //for (let i=0; i<cc_x.length; i++) { console.log(cc_x[i].join("")); }

  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, _debug);

  //console.log(cc_x);
  //console.log(cs_x);

  let cic = RPRPQuarryCleaveCuts(grid_info_x, g_s, g_e, g_a, g_b);

  for (let i=0; i<cic.length; i++) {
    console.log( "cleave_sched[", i, "]:", _print_cleave(cc_x[i]), JSON.stringify(cic[i]));
  }


  //let v_x = _expect( cc_x, [], _sfmt("pgn_corner_x", 16, 'r') );
  */


}

function _main_custom_3() {
  let _debug = 1;

  let g_s = [0,2],
      g_e = [0,2],
      g_a = [0,2],
      g_b = [1,3];

  let grid_info_x = RPRPInit(pgn_pinwheel1);
  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);

}

// BUG
// degenerate error where thinks there's a 1-cut that falls out of bounds (1,0) (3,0) line
//
// fixed?
//
function _main_custom_4() {
  let _debug = 1;

  let g_s = [1,1],
      g_e = [3,1],
      g_a = [1,1],
      g_b = [3,0];

  let grid_info_x = RPRPInit(pgn_pinwheel1);
  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);
  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, _debug);

  console.log("profile:", cp_x);
  console.log("cleave_enum:", cc_x);
  console.log("cleave_side:", cs_x);

}

//
//
function _main_custom_5() {
  let _debug = 1;

  let g_s = [3,0],
      g_e = [3,0],
      g_a = [3,0],
      g_b = [1,1];

  let grid_info_x = RPRPInit(pgn_pinwheel1);
  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);
  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, _debug);

  console.log("profile:", cp_x);
  console.log("cleave_enum:", cc_x);
  console.log("cleave_side:", cs_x);

}

//
//
function _main_custom_6() {
  let _debug = 1;

  let g_s = [1,2],
      g_e = [4,3],
      g_a = [1,3],
      g_b = [4,1];

  let grid_info_x = RPRPInit(pgn_pinwheel1);
  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);
  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, _debug);

  console.log("profile:", cp_x);
  console.log("cleave_enum:", cc_x);
  console.log("cleave_side:", cs_x);

}

//
//
function _main_custom_7() {
  let _debug = 1;

  let g_s = [3,1],
      g_e = [4,4],
      g_a = [3,4],
      g_b = [6,1];

  let grid_info_x = RPRPInit(pgn_bb_test);
  _print_rprp(grid_info_x);

  let cp_x = RPRPCleaveProfile(grid_info_x, g_s, g_e, g_a, g_b);
  let cc_x = RPRP_cleave_enumerate(grid_info_x, g_s, g_e, g_a, g_b, cp_x, _debug);
  let cs_x = RPRP_enumerate_quarry_side_region(grid_info_x, g_s, g_e, g_a, g_b, _debug);

  console.log("valid:", RPRP_valid_quarry(grid_info_x, g_s, g_e, g_a, g_b));

  console.log("profile:", cp_x);
  console.log("cleave_enum:", cc_x);
  console.log("cleave_side:", cs_x);

}

//
//
function _main_custom_8() {
  let _debug = 1;

  let g_s = [1,5],
      g_e = [2,6],
      g_a = [1,6],
      g_b = [3,2];

  let grid_info_x = RPRPInit(pgn_bb_test1);
  _print_rprp(grid_info_x);

  let qi = RPRPQuarryInfo(grid_info_x, g_s, g_e, g_a, g_b);
  console.log("valid:", qi.valid, "(", qi.comment,")");
  console.log("one_cut:", JSON.stringify(qi.one_cut));
  console.log("two_cuts:", JSON.stringify(qi.two_cuts));

}

// This has a bridge ([1,1] to [3,1])
// but we've decided to let it go.
// It's a special case that should get subsumed by
// the recursion.
// It's not an error to recur from this quarry rectangle
// but it means the calculation won't be optimal.
//
// Intead of mkaing a special heuristic to optimize away
// this case, we let it be and know that if the recursion
// is working properly, it won't be considered as optimal.
//
function _main_custom_9() {
  let _debug = 1;

  let g_s = [1,5],
      g_e = [2,6],
      g_a = [1,6],
      g_b = [3,1];

  let grid_info_x = RPRPInit(pgn_bb_test1);
  _print_rprp(grid_info_x);

  let qi = RPRPQuarryInfo(grid_info_x, g_s, g_e, g_a, g_b);
  console.log("valid:", qi.valid, "(", qi.comment,")");
  console.log("one_cut:", JSON.stringify(qi.one_cut));
  console.log("two_cuts:", JSON.stringify(qi.two_cuts));

}

function _main_custom_10() {
  let _debug = 1;

  let g_s = [0,1],
      g_e = [1,1],
      g_a = [0,1],
      g_b = [1,2];

  let g_a1 = [1,1];

  let grid_info_x = RPRPInit(pgn_ell);
  _print_rprp(grid_info_x);

  let l_idx = RPRP_DP_idx(grid_info_x, g_s, g_e, g_a);
  let r_idx = RPRP_DP_idx(grid_info_x, g_s, g_e, g_a1);


  console.log("g_s:", g_s, "g_e:", g_e, "g_a0:", g_a, "g_a1:", g_a1, "g_b:", g_b);

  console.log("l_idx:", l_idx, "r_idx:", r_idx);

  console.log(RPRP_DPidx2b(grid_info_x, l_idx), RPRP_DPidx2b(grid_info_x, r_idx));
  console.log(RPRP_DPidx2g(grid_info_x, l_idx), RPRP_DPidx2g(grid_info_x, r_idx));
}

function _main_custom_11() {
  let _debug = 1;

  let g_s = [0,0],
      g_e = [0,0],
      g_a = [0,0],
      g_b = [1,1];


  let ctx = RPRPInit(pgn_ell);
  _print_rprp(ctx);

  let qi = RPRPQuarryInfo(ctx, g_s, g_e, g_a, g_b);

  console.log(JSON.stringify(qi, undefined, 2));

}

function _main_mirp_square() {
  let ctx_sq = RPRPInit( [[0,0], [10,0], [10,10], [0,10]] );
  let v_sq = RPRP_MIRP(ctx_sq);
  console.log("mirp.sq:", v_sq);
  return;
}


function _main_mirp_L() {

  let _u = undefined;

  let ctx_L = RPRPInit( pgn_ell );
  let v_L = RPRP_MIRP(ctx_L, _u, _u, _u, 0, 2);
  _print_dp(ctx_L);
  console.log("mirp.L:", v_L);
  return;
}

function _main_mirp_z() {
  let ctx_z = RPRPInit( pgn_z );

  //let v_z = RPRP_MIRP(ctx_z);
  let _u = undefined;
  let v_z = RPRP_MIRP(ctx_z, _u, _u, _u, 0, 2);

  _print_dp(ctx_z);
  console.log("mirp.z:", v_z);
  return;
}

function _main_mirp_pinwheel() {
  let ctx = RPRPInit( pgn_pinwheel_sym );
  let _u = undefined;
  let v = RPRP_MIRP(ctx, _u, _u, _u, 0, 2);

  _print_dp(ctx);

  console.log("mirp:", v);
  return;
}

function _main_mirp_test() {
  let ctx = RPRPInit( pgn_pinwheel1 );
  let _u = undefined;
  let v = RPRP_MIRP(ctx, _u, _u, _u, 0, 2);

  _print_dp(ctx);

  console.log("mirp:", v);
  return;

  let ctx_1 = RPRPInit( pgn_pinwheel1 );
  RPRP_MIRP(ctx_1, [3,1], [1,2], [3,2]);

  let ctx_2 = RPRPInit( pgn_cavity );
  RPRP_MIRP(ctx_2, [8,1], [7,2], [7,1]);

  let ctx_3 = RPRPInit( pgn_cavity );
  RPRP_MIRP(ctx_3, [7,2], [8,1], [7,1]);

  let ctx_4 = RPRPInit( pgn_bottom_guillotine );
  RPRP_MIRP(ctx_4, [1,4], [2,4], [1,4]);

  let ctx_5 = RPRPInit( pgn_bottom_guillotine );
  RPRP_MIRP(ctx_5, [2,4], [1,4], [1,4]);

  let ctx_6 = RPRPInit( pgn_bottom_guillotine );
  RPRP_MIRP(ctx_6, [2,4], [1,4], [2,4]);

  //console.log(">>> 9,2", RPRP_point_in_region( ctx_2, [9,2], [8,1], [7,2], [7,1]  ));
  //console.log(">>> 7,1", RPRP_point_in_region( ctx_2, [7,1], [8,1], [7,2], [7,1] ,  1) );
  //console.log(">>> 6,0", RPRP_point_in_region( ctx_2, [6,0], [8,1], [7,2], [7,1]  ));
}

//----
//----
//----

function _irnd(a,b) {
  if (typeof a === "undefined") {
    return Math.floor(Math.random()*2);
  }

  if (typeof b === "undefined") {
    return Math.floor(Math.random()*a);
  }

  return Math.floor(a + ((b-a)*Math.random()));
}

function random_rprp(n_it) {
  n_it = ((typeof n_it === "undefined") ? 1 : n_it);
  if (n_it <= 0) { n_it = 1; }

  let W = 10;
  let H = 10;

  let nX = 30,
      nY = 30;

  let sgg = [],
      tgg = [];
  for (let j=0; j<nY; j++) {
    sgg.push([]);
    tgg.push([]);
    for (let i=0; i<nX; i++) {
      sgg[j].push(-1);
      tgg[j].push(-1);
    }
  }

  for (let it=0; it<n_it; it++) {

    let w = _irnd(1,W);
    let h = _irnd(1,H);

    let sx = _irnd(0, nX-w-1);
    let sy = _irnd(0, nY-h-1);

    for (let ty=0; ty<h; ty++) {
      for (let tx=0; tx<w; tx++) {
        sgg[ sy + ty ][ sx + tx] = 1;
      }
    }

  }

  let ij_idir = [
    [1,0], [-1,0],
    [0,1], [0,-1]
  ];

  for (let j=0; j<nY; j++) {
    for (let i=0; i<nX; i++) {

      tgg[j][i] = sgg[j][i];

      if (sgg[j][i] < 0) { continue; }

      let _count = 0;
      for (let idir=0; idir<4; idir++) {
        let y = j + ij_idir[idir][1];
        let x = i + ij_idir[idir][0];

        let code = 'x';

        if ( (y<0) || (y>=nY) ||
             (x<0) || (x>=nX) ) {
          code = '.';
        }
        else {
          code = ((sgg[y][x] < 0) ? '.' : '*');
        }

        if (code == '*') { _count++; }
      }

      if (_count == 4) { tgg[j][i] = -1; }
      else { tgg[j][i] = sgg[j][i]; }


    }
  }

  sgg = tgg;

  for (let j=0; j<nY; j++) {
    let l = [];
    for (let i=0; i<nX; i++) {
      l.push( (sgg[j][i] < 0) ? '.' : '*' );
    }
    console.log(l.join(""));
  }

}

function _main_rand(argv) {
  console.log(random_rprp(20));
}


//       ___ 
//  ____/ (_)
// / __/ / / 
// \__/_/_/  
//           

function _main_cli(argv) {
  let pgn_a = JSON.parse(argv[0]);
  //let g_s = JSON.parse(argv[1]);
  //let g_e = JSON.parse(argv[2]);
  //let g_a = JSON.parse(argv[3]);
  //let g_b = JSON.parse(argv[4]);

  let ctx = RPRPInit( pgn_a );
  _print_rprp(ctx);

}

async function _main_data(argv) {

  let _debug = 0;

  let data = "";
  for await (let chunk of process.stdin) {
    data += chunk;
  }

  let data_info = JSON.parse(data);

  if ("debug" in data_info) { _debug = data_info.debug; }

  if (data_info.op == "QuarryInfo") {

    let ctx = RPRPInit(data_info.C);
    let qi = RPRPQuarryInfo( ctx,
                             data_info.g_s, 
                             data_info.g_e, 
                             data_info.g_a, 
                             data_info.g_b, _debug);
    console.log("{");
    console.log('  "valid":', qi.valid, ",");

    if (qi.side_cut.length == 0) { console.log('  "side_cut": [],'); }
    else {
      console.log('  "side_cut": [');
      for (let i=0; i<qi.side_cut.length; i++) {
        let sfx = ((i == (qi.side_cut.length-1)) ? "" : ",");
        console.log( JSON.stringify(qi.side_cut[i]) + sfx );
      }
      console.log('  ],');
    }

    if (qi.corner_cuts.length == 0) { console.log('  "corner_cuts": [],'); }
    else {
      console.log('  "corner_cuts": [');
      for (let i=0; i<qi.corner_cuts.length; i++) {
        let sfx = ((i == (qi.corner_cuts.length-1)) ? "" : ",");
        console.log( "    " + JSON.stringify(qi.corner_cuts[i]) + sfx );
      }
      console.log('  ],');
    }

    console.log('  "b_s": ' + JSON.stringify(qi.b_s) + ', "b_e": ' + JSON.stringify(qi.b_e) + ',');
    console.log('  "g_s": ' + JSON.stringify(qi.g_s) + ', "g_e": ' + JSON.stringify(qi.g_e) + ',');
    console.log('  "g_a": ' + JSON.stringify(qi.g_a) + ', "g_b": ' + JSON.stringify(qi.g_b) + ',');
    console.log('  "comment": ' + JSON.stringify(qi.comment) );

    console.log("}");
  }

  else if (data_info.op == "MIRP") {
    let ctx = RPRPInit(data_info.C);
    let _u = undefined;
    let v = RPRP_MIRP(ctx, _u, _u, _u, 0, _debug);

    _print_dp(ctx);

    console.log("mirp:", v);

    if (("expect" in data_info) &&
        ("return" in data_info.expect)) {
      if (v == data_info.expect.return) { console.log("pass"); }
      else { console.log("FAIL: got:", v, "expect:", data_info.expect.return); }
    }
    return;
  }

  else if (data_info.op == "quarry_edge_ranges") {
    let ctx = RPRPInit(data_info.C);
    _print_rprp(ctx);

    let res = RPRP_quarry_edge_ranges(ctx,
                                    data_info.g_a,
                                    data_info.g_b,
                                    data_info.g_s,
                                    data_info.g_e, _debug);

    if (_debug) { console.log(res); }

    if (("expect" in data_info) &&
        ("return" in data_info.expect)) {
      let result_str = JSON.stringify(res);
      let expect_str = JSON.stringify(data_info.expect.return);
      if (result_str == expect_str) { console.log("pass"); }
      else { console.log("FAIL: got:", result_str, "expect:", expect_str); }
    }
    return;

  }

  else if (data_info.op == "print") {
    let ctx = RPRPInit(data_info.C);
    _print_rprp(ctx);
  }

}


if ((typeof require !== "undefined") &&
    (require.main === module)) {

  let op = "check";

  if (process.argv.length > 2) {
    op = process.argv[2];
  }

  if      (op == 'check')   { _main_checks(process.argv.slice(2)); }
  else if (op == 'example') { _main_example(process.argv.slice(2)); }
  else if (op == 'rprpi')   { _main_rprpinit_test(); }
  else if (op == 'pir')     { _main_pir_test(); }

  else if (op == 'mirp')    { _main_mirp_test(); }
  else if (op == 'mirp.sq')    { _main_mirp_square(); }
  else if (op == 'mirp.L')    { _main_mirp_L(); }
  else if (op == 'mirp.z')    { _main_mirp_z(); }
  else if (op == 'mirp.pinwheel')    { _main_mirp_pinwheel(); }

  else if (op == "cli") { _main_cli(process.argv.slice(3)); }
  else if (op == "data") { _main_data(process.argv.slice(3)); }
  else if (op == "rand") { _main_rand(process.argv.slice(3)); }

  else if (op == 'custom')  { _main_custom(); }
  else if (op == 'custom.1')  { _main_custom_1(); }
  else if (op == 'custom.2')  { _main_custom_2(); }
  else if (op == 'custom.3')  { _main_custom_3(); }
  else if (op == 'custom.4')  { _main_custom_4(); }
  else if (op == 'custom.5')  { _main_custom_5(); }
  else if (op == 'custom.6')  { _main_custom_6(); }
  else if (op == 'custom.7')  { _main_custom_7(); }
  else if (op == 'custom.8')  { _main_custom_8(); }
  else if (op == 'custom.9')  { _main_custom_9(); }
  else if (op == 'custom.10')  { _main_custom_10(); }
  else if (op == 'custom.11')  { _main_custom_11(); }
}

//                          __    
//  _____ __ ___  ___  ____/ /____
// / -_) \ // _ \/ _ \/ __/ __(_-<
// \__/_\_\/ .__/\___/_/  \__/___/
//        /_/                     

if (typeof module !== "undefined") {
  let func_name_map = {
    "winding" : winding,
    "windingA" : windingA,
    "init" : RPRPInit,
    "fasslib": fasslib,
    "mirp": RPRP_MIRP,
    "QuarryInfo": RPRPQuarryInfo
  };

  for (let key in func_name_map) {
    module.exports[key] = func_name_map[key];
  }
}



}).call(this)}).call(this,require('_process'))
},{"./4w.js":1,"./clipper.js":2,"./fasslib.js":4,"_process":6,"fs":5}],4:[function(require,module,exports){
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var FASSLIB_VERSION = "0.2.0";
var FASSLIB_VERBOSE = 0;

// round to zero version
//
function d2e(_v) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let v2 = Math.floor(v/2);
  if (v==0) { return 0; }
  if ((v2%2)==0) { return m*v2; }
  return m*(v2+1);
}

// round to zero version
//
function d2u(_v) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let v2 = Math.floor(v/2);
  if (v==0) { return 0; }
  if ((v2%2)==1) { return m*v2; }
  return m*(v2+1);
}

// round to zero version
//
function dqe(_v,q) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let vq = Math.floor(v/q);
  if ((vq%2)==0) { return m*vq; }
  return m*(vq+1);
}


// round to zero
// divide by q, force odd
//
function dqu(_v,q) {
  let v = Math.abs(_v);
  let m = ((_v<0)? -1 : 1);
  let vq = Math.floor(v/q);
  if (v==0) { return 0; }
  if ((vq%2)==1) { return m*vq; }
  return m*(vq+1);
}

// round to zero version
//
function v_divq(v,q) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    let _v = Math.abs(v[i]);
    let m = ((v[i]<0) ? -1 : 1);
    u.push( m*Math.floor(_v / q) );
  }
  return u;
}

function v_div2(v) { return v_divq(v,2); }

function _sgn(v) {
  if (v>0) { return  1; }
  if (v<0) { return -1; }
  return 0;
}

function v_neg(v) {
  if (v.length==2) { return [-v[0], -v[1]]; }
  return [ -v[0], -v[1], -v[2] ];
}

function v_add() {
  if (arguments.length == 0) { return []; }
  let u = v_clone(arguments[0]);

  for (let i=1; i<arguments.length; i++) {
    let v = arguments[i];
    let m = Math.min( u.length, v.length );
    for (let j=0; j<m; j++) { u[j] += v[j]; }
  }

  return u;
}


function v_sub() {
  if (arguments.length == 0) { return []; }
  let u = v_clone(arguments[0]);

  for (let i=1; i<arguments.length; i++) {
    let v = arguments[i];
    let m = Math.min( u.length, v.length );
    for (let j=0; j<m; j++) { u[j] -= v[j]; }
  }

  return u;
}


function v_mul(c,v) {
  if (v.length == 2) {
    return [ c*v[0], c*v[1] ];
  }
  return [ c*v[0], c*v[1], c*v[2] ];
}

function dot_v(u,v) {
  if ((u.length == 2) || (v.length == 2)) {
    return  (u[0]*v[0]) + (u[1]*v[1]);
  }
  return (u[0]*v[0]) + (u[1]*v[1]) + (u[2]*v[2]);
}

function abs_sum_v(v) {
  let s = 0;
  for (let i=0; i<v.length; i++) {
    s += Math.abs(v[i]);
  }
  return s;
}

function v_delta(v) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push( _sgn(v[i]) );
  }
  return u;
}

function v_print(v) {
  if (v.length == 2)  { console.log(v[0], v[1]); }
  else                { console.log(v[0], v[1], v[2]); }
}

function v_clone(v) {
  let u = [];
  for (let i=0; i<v.length; i++) {
    u.push(v[i]);
  }
  return u;
}

// Test to see if q is within bounds of volume
// whose corner is at p and volume defined by a,b,g
//
// If volume coordinate is positive, the corresponding p
// coordinate is taken to be lower bound.
// Otherwise, if the volume coordinate is negative,
// corresponding p coordinate is taken to be the
// upper bound.
//
// Works in 2 and 3 dimensions.
// Assumes q,p,a,b,g are all simple arrays (of length 2 or 3)
//
// q - query point
// p - corner point
// a - width like dimension
// b - height like dimension
// g - depth like dimension
//
function _inBounds(q, p, a, b, g) {
  let _a = [0,0,0],
      _b = [0,0,0],
      _g = [0,0,0];

  let _p = [0,0,0],
      _q = [0,0,0];

  _a[0] = a[0];
  _a[1] = a[1];
  _a[2] = ((a.length > 2) ? a[2] : 0);

  _b[0] = b[0];
  _b[1] = b[1];
  _b[2] = ((b.length > 2) ? b[2] : 0);

  _q[0] = q[0];
  _q[1] = q[1];
  _q[2] = ((q.length > 2) ? q[2] : 0);

  _p[0] = p[0];
  _p[1] = p[1];
  _p[2] = ((p.length > 2) ? p[2] : 0);

  if (typeof g === "undefined") {
    if      ((_a[0] == 0) && (_b[0] == 0)) { _g[0] = 1; }
    else if ((_a[1] == 0) && (_b[1] == 0)) { _g[1] = 1; }
    else if ((_a[2] == 0) && (_b[2] == 0)) { _g[2] = 1; }
  }
  else { _g = g; }

  let _d = [
    _a[0] + _b[0] + _g[0],
    _a[1] + _b[1] + _g[1],
    _a[2] + _b[2] + _g[2]
  ];

  for (let xyz=0; xyz<3; xyz++) {
    if ( _d[xyz] < 0 ) {
      if ((q[xyz] >  p[xyz]) ||
          (q[xyz] <= (p[xyz] + _d[xyz]))) { return false; }
    }
    else {
      if ((q[xyz] <  p[xyz]) ||
          (q[xyz] >= (p[xyz] + _d[xyz]))) { return false; }
    }
  }

  return true;

}

function cross3(p,q) {
  let c0 = ((p[1]*q[2]) - (p[2]*q[1])),
      c1 = ((p[2]*q[0]) - (p[0]*q[2])),
      c2 = ((p[0]*q[1]) - (p[1]*q[0]));

  return [c0,c1,c2];
}

// compare vectors a,b
//
// return:
//
//   -1 : a lex < b
//    1 : a lex > b
//    0 : a == b
//
function _cmp_v(a,b) {
  let n = ( (a.length < b.length) ? b.length : a.length );
  for (let i=0; i<n; i++) {
    if (a[i] < b[i]) { return -1; }
    if (a[i] > b[i]) { return  1; }
  }
  return 0;
}

// compare vectors a,b using direction axis d_alpha, d_beta, d_gamma
//
// lexigraphical ordering, ordered by the delta alpha, beta and gamma
// vectors.
//
// -1 : a lex < b
//  1 : a lex > b
//  0 : a == b
//
function _cmp_v_d(u,v, d_alpha, d_beta, d_gamma) {
  d_alpha = ((typeof d_alpha == "undefined") ? [1,0,0] : d_alpha);
  d_beta  = ((typeof d_beta  == "undefined") ? [0,1,0] : d_beta);
  d_gamma = ((typeof d_gamma == "undefined") ? [0,0,1] : d_gamma);
  let n = ( (u.length < v.length) ? v.length : u.length );

  let d_abg = [ d_alpha, d_beta, d_gamma ];

  for (let i=0; i<n; i++) {
    let u_val = dot_v(u, d_abg[i]);
    let v_val = dot_v(v, d_abg[i]);

    if (u_val < v_val) { return -1; }
    if (u_val > v_val) { return  1; }
  }

  return 0;
}

function v_lift(v, dim) {
  let u = v_clone(v);
  if (u.length == dim) { return u; }
  if (u.length > dim) { return u.slice(0,dim) }
  for (let i=v.length; i<dim; i++) { u.push(0); }
  return u;
}

function norm2_v(_v) {
  let _eps = (1.0 / (1024.0*1024.));
  let v = ((_v.length == 2) ? [_v[0], _v[1], 0] : _v );
  let s = (v[0]*v[0]) + (v[1]*v[1]) + (v[2]*v[2]);
  if (s < _eps) { return 0; }
  return Math.sqrt(s);
}


// euler rotation or olinde rodrigues
// https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
//
// rotate point v0 around vector vr by radian theta
//
function rodrigues(_v0, _vr, theta) {
  let c = Math.cos(theta);
  let s = Math.sin(theta);

  let v0 = v_lift(_v0, 3);
  let v_r = v_mul( 1 / norm2_v(_vr), _vr );

  return v_add(
    v_mul(c, v0),
    v_add(
      v_mul( s, cross3(v_r,v0)),
      v_mul( (1-c) * dot_v(v_r, v0), v_r )
    )
  );
}



if (typeof module !== "undefined") {

  let func_name_map = {
    "d2e": d2e,
    "d2u": d2u,
    "dqe": dqe,
    "dqu": dqu,
    "v_divq": v_divq,
    "v_div2": v_div2,
    "sgn": _sgn,
    "v_neg": v_neg,
    "v_add": v_add,
    "v_sub": v_sub,
    "v_mul": v_mul,
    "dot_v": dot_v,
    "abs_sum_v": abs_sum_v,
    "v_delta": v_delta,
    "v_print": v_print,
    "v_clone": v_clone,
    "inBounds": _inBounds,
    "cross3": cross3,
    "cmp_v" : _cmp_v,
    "cmp_v_d" : _cmp_v_d,
    "v_lift" : v_lift,
    "norm2_v" : norm2_v,
		"rodrigues": rodrigues
  };

  for (let key in func_name_map) {
    module.exports[key] = func_name_map[key];
  }
}


},{}],5:[function(require,module,exports){

},{}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[3])(3)
});
