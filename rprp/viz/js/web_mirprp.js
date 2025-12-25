(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mirprp = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
//   Cxy : <array of boundary xy points in ccw order>
//   Ct  : <array of types of boundary bounts>
//     'c' : convex (relative inward)
//     'r' : reflex (concave, relative inward)
//
//   X : <array of x coordinates of grid points (ij) (domain)>
//   Y : <array of y coordinates of grid points (ij) (domain)>
//     note that some combinations of points from X,Y will not be valid grid points
//
//   B : <2d array [j,i]>
//     values map to B index, -1 if not a border point
//   Bt : <array of border type>
//     'c' : convex
//     'r' : reflex
//     'b' : border
//   Bxy : <array of border xy points>
//   Bij : <array of grid ij points> 
//
//   G : <2d array [j,i]>
//      values map to G index, -1 if invalid grid point
//   Gt : <array of grid point types>
//     'c' : original boundary convex point
//     'r' : original boundary reflex point
//     'b' : point on edge, on boundary but not in C
//     'i' : interior point
//   Gxy : <array of grid xy points>
//   Gij : <array of grid ij points>
//
//   Js : <3d array, [idir,j,i]>
//   Je : <3d array, [idir,j,i]>
//   Jf : <3d array, [idir,j,i]>
//     entries map to first general border index point, -1 if invalid
//
//   DP_cost : cost
//   DP_rect : rectangle cost
//   DP_partition : children
//     [0] : side cuts
//     [1] : corner cuts
//   DP_adit  : adit point
//   DP_bower : bower point
//
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

var norm2_v = fasslib.norm2_v;
var v_sub = fasslib.v_sub;
var v_add = fasslib.v_add;
var v_mul = fasslib.v_mul;
var dot_v = fasslib.dot_v;
var cross3 = fasslib.cross3;
var v_delta = fasslib.v_delta;
var abs_sum_v = fasslib.abs_sum_v;
var cmp_v = fasslib.cmp_v;


//============================
//    __       __            
//   / /  ___ / /__  ___ ____
//  / _ \/ -_) / _ \/ -_) __/
// /_//_/\__/_/ .__/\__/_/   
//           /_/             

function _write_data(ofn, data) {
  var fs = require("fs");
  return fs.writeFileSync(ofn, JSON.stringify(data, undefined, 2));
}

function _ERROR(s) { console.log("ERROR:", s); }

// human readable debug identifiers
// 'four character words' js with array of 4 character words
//
function _debug_id() {
  let n = 2;
  let m = fw.word.length;
  let a = [];
  for (let i=0; i<n; i++) {
    let idx = Math.floor( Math.random()*m );
    a.push( fw.word[idx] );
  }
  return a.join("-");
}

// whitespace helper
//
function _ws(n, s, pfx) {
  n = ((typeof n === "undefined") ? 0 : n);
  s = ((typeof s === "undefined") ? ' ' : s);
  pfx = ((typeof pfx === "undefined") ? "" : pfx);
  let a = [];
  for (let i=0; i<n; i++) { a.push(s); }
  return pfx + a.join("");
}

// integer format
//
function _ifmt(v, s) {
  s = ((typeof s === "undefined") ? 0 : s);
  let t = v.toString();
  let a = [];
  for (let i=0; i<(s-t.length); i++) { a.push(' '); }
  a.push(t);
  return a.join("");
}

// string format
//
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
  if (p.length > 0) { console.log(p[0][0], p[0][1]); }
}


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

  _print1da(ctx.Gxy,  "\n## Gxy:");
  _print1da(ctx.Gij,  "\n## Gij:");
  _print1da(ctx.Gt,   "\n## Gt:");
  _print2da(ctx.G,    "\n## G:");

  _print1da(ctx.Bxy,  "\n## Bxy:");
  _print1da(ctx.Bij,  "\n## Bij:");
  _print1da(ctx.Bt,   "\n## Bt:");
  _print2da(ctx.B,    "\n## B:");

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

// helper functions
//

function dxy2idir( dxy ) {
  if (dxy[0] ==  1) { return 0; }
  if (dxy[0] == -1) { return 1; }
  if (dxy[1] ==  1) { return 2; }
  if (dxy[1] == -1) { return 3; }
  return -1;
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

function _uniq(a, _cmp) {
  _cmp = ((typeof _cmp === "undefined") ? _icmp : _cmp);
  let b = [];
  if (a.length == 0) { return []; }
  b.push(a[0]);
  for (let i=1; i<a.length; i++) {
    if (_cmp(a[i], a[i-1]) == 0) { continue; }
    b.push(a[i]);
  }
  return b;
}

//    __       __            
//   / /  ___ / /__  ___ ____
//  / _ \/ -_) / _ \/ -_) __/
// /_//_/\__/_/ .__/\__/_/   
//           /_/             
//============================

// make sure delta moves are only in cardinal directions.
// 
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

// returns context
//
function MIRPRP_init(_rl_pgon, _debug) {
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

  X = _uniq(x_dup);
  Y = _uniq(y_dup);

  // init Gij, Bij, Js
  //

  for (let j=0; j<Y.length; j++) {
    G.push([]);
    B.push([]);
    for (let idir=0; idir<4; idir++) {
      Js[idir].push([]);
      Je[idir].push([]);
      Jf[idir].push([]);
    }
    for (let i=0; i<X.length; i++) {
      G[j].push(-1);
      B[j].push(-1);
      for (let idir=0; idir<4; idir++) {
        Js[idir][j].push(-1);
        Je[idir][j].push(-1);
        Jf[idir][j].push(-1);
      }
    }
  }

  // populate B
  //
  // B is a 2d index grid whose entries hold
  // the index of the general border points, if they exist (-1 otherwise).
  // To populate, start at a primitive Cxy border point, map it to the
  // ij grid, find the direction of change and start walking the ij
  // grid, populating B as we go until we hig the next primitive border point.
  //
  // Keep the general border point index to ij and xy mapping in Bij, Bxy respectively.
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

      B[ ij[1] ][ ij[0] ] = b_idx;
      Bij.push( [ ij[0], ij[1] ] );
      Bxy.push( [ X[ij[0]], Y[ij[1]] ] );
      Bt.push( (t==0) ? Ct[c_idx] : 'b' );

      b_idx++;

      ij = v_add( ij, dij );
    }

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

          if (B[j][i] >= 0) {

            let cur_B_idx = B[j][i];
            let cur_B_ij = Bij[cur_B_idx];
            let prv_B_ij = Bij[(cur_B_idx-1 + Bij.length) % Bij.length];
            let nxt_B_ij = Bij[(cur_B_idx+1) % Bij.length];

            let _dprv = v_sub( cur_B_ij, prv_B_ij );
            let _dnxt = v_sub( nxt_B_ij, cur_B_ij );

            let _idir_prv = dxy2idir( _dprv );
            let _idir_nxt = dxy2idir( _dnxt );

            let __c = cur_B_idx;
            let __p = (cur_B_idx-1 + Bij.length) % Bij.length ;

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

          if (B[j][i] >= 0) {

            let cur_B_idx = B[j][i];
            let cur_B_ij = Bij[cur_B_idx];
            let prv_B_ij = Bij[(cur_B_idx-1 + Bij.length) % Bij.length];
            let nxt_B_ij = Bij[(cur_B_idx+1) % Bij.length];

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


  // This is mostly unused but these
  // are single character codes deonting
  // what the grid looks like.
  //
  // The four binary digits correspond to
  // +x, -x, +y, -y respectively.
  //
  // I'm not sure this is so well thought out
  // but if the Js is non-zero, then the bit
  // is set and character code is put in the ij
  // grid cell.
  // `?` denotes an invalid state.
  //

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

      G[j][i] = g_idx;
      Gij.push( [i,j] );
      Gxy.push( [X[i], Y[j]] );
      Gt.push( gt_lu[t] );

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

  let _perim = 0;
  for (let b_idx=0; b_idx<Bxy.length; b_idx++) {
    _perim += abs_sum_v( v_sub( Bxy[(b_idx+1)%Bxy.length], Bxy[b_idx] ) );
  }

  let DP_cost = {},
      DP_partition = {},
      DP_adit = {},
      DP_bower = {},
      DP_rect = {};

  // MIRPRP context
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

    "B_perim": _perim,

    "DP_root_key": "",
    "DP_partition": DP_partition,
    "DP_adit": DP_adit,
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

// integer vector increment, with carry
//
// return carry.
//
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

// integer vector 0 comparison
//
// returns true if 0
// false otherwise
//
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
function MIRPRP_cleave_border(ctx, g, idir) {

  // cleave oob
  //
  if ( ctx.Js[idir][ g[1] ][ g[0] ] < 0 ) { return 0; }

  let dg = [ [1,0], [-1,0], [0,1], [0,-1] ];

  let g_nei = [
    g[0] + dg[idir][0],
    g[1] + dg[idir][1]
  ];

  let _bb = ctx.B[g[1]][g[0]]
  let _be = ctx.B[g_nei[1]][g_nei[0]]

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
// 'c' - cleave in-line with constructed cut line
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
// If it's a 1-cut, then g_a should be a point in line with g_s and g_e.
//
// Enumeration needs the `.` code to know that this is a potential
// cleave cut.
// The `c` code is needed to make sure we don't choose an illegal
// cut as the constructed line acts as a cleave cut but it's forced,
// since it's already part of a previous cut.
// I don't think differentiation of the `b`, `x` and `X` is necessary,
// but acts as an extra code and doesn't hurt to have more information
// that can be discarded later.
//
// No checks are done to see if the rectangle is valid, whether g_a
// is a valid endpoint, etc.
//
function MIRPRP_cleave_profile(ctx, g_s, g_e, g_a, g_b) {
  let X = ctx.X,
      Y = ctx.Y;
  let Bij = ctx.Bij,
      Bt = ctx.Bt,
      B = ctx.B;

  // boundary start and end index
  //
  let b_idx_s = B[ g_s[1] ][ g_s[0] ];
  let b_idx_e = B[ g_e[1] ][ g_e[0] ];

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
    if ( MIRPRP_cleave_border(ctx, g, cleave_idir[i] ) ) {
      cleave_profile[i] = 'b';
      continue;
    }

    // cleave in-line with constructed cut line
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

// Simplified cleave validity testing.
//
// Input:
//
// ctx            - rprp context
// quarry         - grid points of quarry rectangle, in standard order (idx 0 lower right, idx 3 upper right)
// cleave_choice  - character indicator for each cleave choice (aka cleave profile)
//                `-` open
//                `*` cleave cut
//                `x` invalid direction (out of bounds)
//                `X` invalid direction (out of bounds in other region)
//
// This checks to see if the cleave_choice is valid given a quarry rectangle and current state.
//
// The checks are:
//
// Forced Cleave  - make sure if a corner has two open cleave options, there is at least one cleave cut
// Parallel       - make sure no two cleave cuts are parallel (quarry edge can move otherwise)
//
// return:
//
//  1 - cleave_choice is valid
//  0 - otherwise
//
function MIRPRP_valid_cleave(ctx, quarry, cleave_choice, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let R = quarry;

  let Js = ctx.Js,
      Jf = ctx.Jf;

  let B = ctx.B,
      Bt = ctx.Bt;
      //Bij = ctx.Bij;

  if (_debug > 1) { console.log("#vc.cp0"); }

  let redux = [];
  for (let i=0; i<cleave_choice.length; i++) {
    let _code = '^';
    if      (cleave_choice[i] == '-') { _code = '-'; }
    else if (cleave_choice[i] == '*') { _code = '*'; }
    else if (cleave_choice[i] == 'c') { _code = '*'; }
    //else if (cleave_choice[i] == 'b') { _code = '*'; }
    else if (cleave_choice[i] == 'b') { _code = 'b'; }
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
  let idir_Redge_sched = [ 1, 2, 0, 3 ];

  let R_idir_B = [
    [-1,-1,-1,-1],
    [-1,-1,-1,-1],
    [-1,-1,-1,-1],
    [-1,-1,-1,-1]
  ];

  let R_B = [
    B[ R[0][1] ][ R[0][0] ],
    B[ R[1][1] ][ R[1][0] ],
    B[ R[2][1] ][ R[2][0] ],
    B[ R[3][1] ][ R[3][0] ]
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

  // Potential cleave comes out of a reflex vertex.
  // If allowed, would produce two 1-cuts both with the
  // the same border point.
  // Or is it two 1-cuts and a 2-cut that overlap?
  // What a mess.
  //
  // o--o-
  // |  :
  // o--o ~?~
  //    |
  //
  for (let c_idx=0; c_idx < cleave_choice.length; c_idx++) {
    let r_idx = Math.floor(c_idx/2);
    if ((cleave_choice[c_idx] == '*') &&
        (R_B[r_idx] >= 0)) { return 0; }
  }

  // We're testing to see if there's a portion of the boundary
  // that butts up against the quarry rectangle (without piercing through).
  // If the quarry side is free floating, we call it 'undocked' (dock == 1).
  //
  // Two cleave cuts can be parallel if there's a dock between them,
  // as the dock splits them up and creates at least two partitions.
  // Any side cuts from the dock will be handled later.
  //
  // Here, we catalogue the first border point, in the cardinal
  // directions, that each of the quarry endpoints see.
  // We'll use these as tests for some type of test that I've now forgotten.
  //
  for (let idx=0; idx < 8; idx++) {
    let r_idx = Math.floor(idx/2);
    let idir = cleave_idir[idx];
    let rdir = oppo_idir[idir];

    let b0 = Js[ idir ][ R[r_idx][1] ][ R[r_idx][0] ];
    if (b0 < 0) { b0 = B[ R[r_idx][1] ][ R[r_idx][0] ]; }

    let b1 = Js[ rdir ][ R[r_idx][1] ][ R[r_idx][0] ];
    if (b1 < 0) { b1 = B[ R[r_idx][1] ][ R[r_idx][0] ]; }

    R_idir_B[r_idx][idir] = b0;
    R_idir_B[r_idx][rdir] = b1;
  }

  let _dock = [-1,-1,-1,-1];

  for (let r_idx=0; r_idx<4; r_idx++) {

    let _rcur = r_idx;
    let _rnxt = (r_idx+1)%4;

    let _idir = idir_Redge_sched[r_idx];
    let _rdir = oppo_idir[_idir];

    // if the quarry corner is an interior point and the first
    // flip it sees is at or goes beyond the next quarry corner point,
    // then its undocked (otherwise docked).
    //
    if (R_Bt[_rcur] == '.') {
      _dock[r_idx] = 1;
      if (Jf[_idir][ R[_rcur][1] ][ R[_rcur][0] ] >= Rl[r_idx]) {
        _dock[r_idx] = 0;
      }
    }

    // otherwise, the quarry endpoint is on boundary
    //
    else {

      _dock[r_idx] = 1;

      // If the quarry endpoint is on a boundary in-line with
      // the quarry edge, then automatically docked.
      //
      if (Jf[_idir][ R[_rcur][1] ][ R[_rcur][0] ] > 0) {
        _dock[r_idx] = 1;
      }

      // Otherwise quarry corner is on a corner of a boundary
      // with polygon interior in the direction of _idir.
      // If first jump border point in _idir direction from _rcur
      // is the same as the border that the next quarry corner
      // sits on or if the next quarry corner has the same
      // jump border point, then space between _rcur and _rnxt
      // is all interior, so edge is undocked.
      //
      else if ( (R_idir_B[_rcur][_idir] == R_B[_rnxt]) ||
                (R_idir_B[_rcur][_idir] == R_idir_B[_rnxt][_idir]) ) {
        _dock[r_idx] = 0;
      }

    }

  }

  // each corner needs at least one cleave cut
  //
  if ((redux[0] == '-') && (redux[1] == '-')) { return 0; }
  if ((redux[2] == '-') && (redux[3] == '-')) { return 0; }
  if ((redux[4] == '-') && (redux[5] == '-')) { return 0; }
  if ((redux[6] == '-') && (redux[7] == '-')) { return 0; }

  if (_debug > 1) { console.log("#vc.cp2"); }

  // parallel tests.
  // If there are cleave cuts opposite each other and in the same direction
  // on an undocked quarry edge, this represents an illegal state.
  //
  if ((_dock[3] == 0) && (redux[0] == '*') && (redux[7] == '*')) { return 0; }
  if ((_dock[0] == 0) && (redux[1] == '*') && (redux[2] == '*')) { return 0; }
  if ((_dock[1] == 0) && (redux[3] == '*') && (redux[4] == '*')) { return 0; }
  if ((_dock[2] == 0) && (redux[5] == '*') && (redux[6] == '*')) { return 0; }

  // otherwise we'll be pretty liberal in what we accept.
  // There still could be valid but obviously non-optimal configurations
  // in terms of bridges or floating constructed lines, but these can
  // still yield valid partitions and should be subsumed by the search
  // for the minimum.
  //

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
function MIRPRP_cleave_enumerate(ctx, g_s, g_e, g_a, g_b, cleave_profile) {
  let B = ctx.B;
  let Bt = ctx.Bt;
  let Bij = ctx.Bij;

  let Js = ctx.Js;

  // boundary start and end index
  //
  let b_idx_s = B[ g_s[1] ][ g_s[0] ];
  let b_idx_e = B[ g_e[1] ][ g_e[0] ];

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

    if (MIRPRP_valid_cleave( ctx, Rg, cleave_choice )) {
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

function _merge_ranges(perim_range) {

  if (perim_range.length <= 1) { return perim_range; }
  perim_range.sort( _cleave_cmp );

  let n = perim_range.length;
  let merged_perim = [ [perim_range[0][0], perim_range[0][1]] ];
  for (let i=1; i<n; i++) {
    if (perim_range[i][0] == perim_range[i-1][1]) {
      merged_perim[ merged_perim.length-1 ][1] = perim_range[i][1];
    }
    else {
      merged_perim.push( [perim_range[i][0], perim_range[i][1]] );
    }
  }

  if (merged_perim.length <= 1) { return merged_perim; }

  // special consideration in case last element loops around to first
  //
  let m = merged_perim.length;
  if ( merged_perim[0][0] == merged_perim[ m-1 ][1] ) {
    merged_perim[0][0] = merged_perim[m-1][0];
    merged_perim.pop();
  }

  return merged_perim;
}

// enumerate *docked* border edges to quarry edge by border index pairs
//
function MIRPRP_quarry_edge_ranges(ctx, g_a, g_b, merge_ranges, _debug) {
  merge_ranges = ((typeof merge_ranges === "undefined") ? false : merge_ranges);
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);

  let X = ctx.X,
      Y = ctx.Y,
      Gij = ctx.Gij,
      B = ctx.B,
      Bij = ctx.Bij,
      Js = ctx.Js,
      Je = ctx.Je,
      Jf = ctx.Jf;

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

    let b1 = B[ u[1] ][ u[0] ];
    if (b1 < 0) {
      let w = v_add( u, v_mul( Jf[idir][ u[1] ][ u[0] ], idir_ij[idir] ) );
      let _d = dot_v( v_sub( v, w ), idir_ij[idir] );

      if (_debug > 2) {
        console.log("  _d1:", _d, "v-w:", v_sub(v,w), "idir[", idir, "]:", idir_ij[idir]);
      }

      if (_d < 0) { continue; }
      b1 = B[ w[1] ][ w[0] ];
    }
    let b1_ij = Bij[b1];

    // If b0 isn't already on a border,
    // skip ahead to border.
    // Once on the border, skip ahead to transition
    // point for start of iteration.
    //
    let b0 = B[ v[1] ][ v[0] ];
    if (b0 < 0) {

      let w = v_add( v, v_mul( Jf[rdir][ v[1] ][ v[0] ], idir_ij[rdir] ) );
      let _d = dot_v( v_sub( u, w ), idir_ij[rdir] );

      if (_debug > 2) {
        console.log("  _d0:", _d, "u-w:", v_sub(u,w), "rdir[", rdir, "]:", idir_ij[rdir]);
      }

      if (_d < 0) { continue; }
      b0 = B[ w[1] ][ w[0] ];
    }
    let b0_ij = Bij[b0];

    if (_debug > 2) {
      console.log("r_idx:", r_idx, "b0:", b0, "b1:", b1);
    }

    let max_iter = Math.max( X.length, Y.length ),
        iter = 0;

    let cur_b = b0;
    while ( wrapped_range_contain(cur_b, b0, b1) &&
            (cur_b != b1) ) {

      let _g = Bij[ cur_b ];


      // record flip distance to next transition,
      // add it to create _h (if 0, _h will just be _g),
      // and get the next border index point
      //
      let _dj = Jf[ rdir ][ _g[1] ][ _g[0] ];
      let _h = v_add( _g, v_mul( _dj, idir_ij[rdir] ) );
      let nxt_b = B[ _h[1] ][ _h[0] ];

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
      nxt_b = B[ _h[1] ][ _h[0] ];

      // advance to first border point
      //
      if (nxt_b  < 0) {
        let _dhj = Jf[rdir][ _h[1] ][ _h[0] ];
        _h = v_add( _h, v_mul( _dhj, idir_ij[rdir] ) );
        nxt_b = B[ _h[1] ][ _h[0] ];

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
  if (!merge_ranges) { return perim_range; }

  return _merge_ranges(perim_range);
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

function MIRPRP_quarry_info(ctx, g_s, g_e, g_a, g_b, _debug) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);
  let oppo = [ 1,0, 3,2 ];

  let B = ctx.B,
      Bt = ctx.Bt,
      Bij = ctx.Bij;
  let Js = ctx.Js,
      Je = ctx.Je,
      Jf = ctx.Jf;

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

  if (!MIRPRP_valid_R(ctx, g_a, g_b)) {
    quarry_info.comment = "invalid quarry rectangle";
    return quarry_info;
  }

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


  // quarry rectangle could be wholly contained in the rectilinear polygon
  // but not contained in the region we're considering.
  // It suffices to test each endpoint of the potentialy quarry rectangle
  // to be in the region.
  //
  for (let i=0; i<Rg.length; i++) {
    if (MIRPRP_point_in_region(ctx, Rg[i], g_s, g_e, g_a, _debug) == 0) {
      quarry_info.comment = "endpoint outside of fenced region (Rg[" + i.toString() + ":" + JSON.stringify(Rg[i]) + ")";
      return quarry_info;
    }
  }


  let oppo_idir  = [1,0, 3,2];
  let cleave_idir = [ 0,3, 3,1, 1,2, 2,0 ];
  let idir_Redge_sched = [ 1, 2, 0, 3 ];

  // We need to know if the cleave cuts on the corners of the quarry
  // rectangle are 1-cuts or 2-cuts.
  // One test is to see if the border index points are the same
  // for the directions of the edges, where, at each endpoint of the
  // quarry rectangle, we take it to be the border index if it sits on
  // the border or the nearest border point in each of the cardinal directions.
  //
  // If the border points line up for a cardinal direction in-line with
  // the quarry edge, we know there's a straight shot from one corner to the
  // other.
  // If not, it's docked and we can use it to create the 1-cut.
  //
  // This code block is similar to the one in `valid_cleave`
  //
  let R_idir_B = [
    [-1,-1,-1,-1],
    [-1,-1,-1,-1],
    [-1,-1,-1,-1],
    [-1,-1,-1,-1]
  ];

  let R_B = [
    B[ Rg[0][1] ][ Rg[0][0] ],
    B[ Rg[1][1] ][ Rg[1][0] ],
    B[ Rg[2][1] ][ Rg[2][0] ],
    B[ Rg[3][1] ][ Rg[3][0] ]
  ];

  let R_Bt = [
    ((R_B[0] < 0) ? '.' : Bt[ R_B[0] ]),
    ((R_B[1] < 0) ? '.' : Bt[ R_B[1] ]),
    ((R_B[2] < 0) ? '.' : Bt[ R_B[2] ]),
    ((R_B[3] < 0) ? '.' : Bt[ R_B[3] ])
  ];

  let Rl = [
    Rg[0][0] - Rg[1][0],
    Rg[2][1] - Rg[1][1],
    Rg[3][0] - Rg[2][0],
    Rg[3][1] - Rg[0][1]
  ];

  for (let idx=0; idx < 8; idx++) {
    let r_idx = Math.floor(idx/2);
    let idir = cleave_idir[idx];
    let rdir = oppo_idir[idir];

    let b0  = Js[ idir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ];
    if (b0 < 0) { b0 = B[ Rg[r_idx][1] ][ Rg[r_idx][0] ]; }

    let b1  = Js[ rdir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ];
    if (b1 < 0) { b1 = B[ Rg[r_idx][1] ][ Rg[r_idx][0] ]; }

    R_idir_B[r_idx][idir] = b0;
    R_idir_B[r_idx][rdir] = b1;
  }

  let _dock = [-1,-1,-1,-1];

  for (let r_idx=0; r_idx<4; r_idx++) {

    let _rcur = r_idx;
    let _rnxt = (r_idx+1)%4;

    let _idir = idir_Redge_sched[r_idx];
    let _rdir = oppo_idir[_idir];

    // if the quarry corner is an interior point and the first
    // flip it sees is at or goes beyond the next quarry corner point,
    // then its undocked (otherwise docked).
    //
    if (R_Bt[_rcur] == '.') {
      _dock[r_idx] = 1;
      if (Jf[_idir][ Rg[_rcur][1] ][ Rg[_rcur][0] ] >= Rl[r_idx]) {
        _dock[r_idx] = 0;
      }
    }

    // otherwise, the quarry endpoint is on boundary
    //
    else {

      _dock[r_idx] = 1;

      // If the quarry endpoint is on a boundary in-line with
      // the quarry edge, then automatically docked.
      //
      if (Jf[_idir][ Rg[_rcur][1] ][ Rg[_rcur][0] ] > 0) {
        _dock[r_idx] = 1;
      }

      // Otherwise quarry corner is on a corner of a boundary
      // with polygon interior in the direction of _idir.
      // If first jump border point in _idir direction from _rcur
      // is the same as the border that the next quarry corner
      // sits on or if the next quarry corner has the same
      // jump border point, then space between _rcur and _rnxt
      // is all interior, so edge is undocked.
      //
      else if ( (R_idir_B[_rcur][_idir] == R_B[_rnxt]) ||
                (R_idir_B[_rcur][_idir] == R_idir_B[_rnxt][_idir]) ) {
        _dock[r_idx] = 0;
      }

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
      let R_edge_len = [
        [ Math.min(r0[0], r1[0]), Math.min(r0[1], r1[1]) ],
        [ Math.max(r0[0], r1[0]), Math.max(r0[1], r1[1]) ]
      ];

      // if line segments doesn't non-degeneratiely intersect, skip
      //
      // if ( A _ right <= B _ left ) or
      //    ( B _ right <= A _ left ) then
      //   line segments non-overlapping
      //
      if ( (cut_ls[0][c_xy] >= R_edge_len[1][rl_xy]) ||
           (R_edge_len[0][rl_xy] >= cut_ls[1][c_xy]) ) {
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

  let idx_s = B[ g_s[1] ][ g_s[0] ];
  let idx_e = B[ g_e[1] ][ g_e[0] ];

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
  let cleave_profile = MIRPRP_cleave_profile( ctx, g_s, g_e, g_a, g_b, _debug );

  for (let i=0; i<cleave_profile.length; i++) {
    let cur_tok = cleave_profile[i];
    let nei_tok = ((i%2) ? cleave_profile[(i+1)%8] : cleave_profile[(i+8-1)%8]);

    // ERROR: if one of the wuarry endpoints ends on an inward corner,
    // this test will incorrectly call it a bridge.
    //
    let _cleave_profile_bridge_test = false;
    if (_cleave_profile_bridge_test) {
    if (((cur_tok == 'b') || (cur_tok == 'c') || (cur_tok == '*')) &&
        ((nei_tok == 'b') || (nei_tok == 'c') || (nei_tok == '*'))) {
      quarry_info.comment = "cleave profile has bridge (" + cleave_profile.join("") + ")";
      return quarry_info;
    }
    }

  }

  let cleave_choices = MIRPRP_cleave_enumerate( ctx, g_s, g_e, g_a, g_b, cleave_profile, _debug );
  let side_cleave_cuts = MIRPRP_enumerate_quarry_side_region( ctx, g_s, g_e, g_a, g_b, _debug );

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

    //DEBUG
    //console.log("cci:", cci, "cleave_choices[", cci, "]:", cleave_choices[cci].join(""));

    let cleave_cuts = [];
    for (let r_idx=0; r_idx<4; r_idx++) {
      let even_cleave_idx = 2*r_idx;
      let odd_cleave_idx = (2*r_idx)+1;

      let e_idir = lu_e_idir[r_idx];
      let e_tdir = lu_e_tdir[r_idx];

      let o_idir = lu_o_idir[r_idx];
      let o_tdir = oppo[e_idir];

      //console.log("eci:", even_cleave_idx, "oci:", odd_cleave_idx);

      // An even cleave cut implies at least one two-cut with a constructed line in
      // the even cleave direction and another constructed line in the orthogonal direction
      // counterclockwise.
      // We know the orthogonal direction must be a cut, either a quarry edge
      // that runs into a border or a quarry edge that turns into a cleave cut,
      // otherwise it wouldn't be a valid cleave choice.
      //
      if (cc[even_cleave_idx] == '*') {

        if (R_B[r_idx] >= 0) {
          cleave_cuts.push([
            Js[ e_idir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
            R_B[r_idx],
            [-1,-1]
          ]);
        }
        else {
          cleave_cuts.push([
            Js[ e_idir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
            Js[ e_tdir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
            [ Rg[r_idx][0], Rg[r_idx][1] ]
          ]);
        }

        if (_debug > 1) { console.log("qci: cci:", cci, "r_idx:", r_idx, "e.0:", cleave_cuts[ cleave_cuts.length-1] ); }

        // if the clockwise neighbor (the 'odd' cleave cut) exists,
        // add another two-cut.
        //
        //    :
        //    :
        // ~~~o==(even)==
        //    |
        //    odd  2-cut
        //    |
        //
        if (cc[odd_cleave_idx] == '*') {
          cleave_cuts.push([
            Js[ o_idir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
            Js[ e_idir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
            [ Rg[r_idx][0], Rg[r_idx][1] ]
          ]);

          if (_debug > 1) { console.log("qci: cci:", cci, "r_idx:", r_idx, "e.1a:", cleave_cuts[ cleave_cuts.length-1] ); }
        }

        // Otherwise add a one-cut in-line with the quarry edge and the even cleave line.
        //
        //        :                             :
        //        :                             :
        //    o~~~o==(even)==      ==(ip3)==o~~~o==(even)==
        //    |
        //    ipp
        //    |
        //
        else {
          let ipp = (even_cleave_idx + 2) % 8;
          let ip3 = (even_cleave_idx + 3) % 8;

          let is_one_cut = false;
          let r_nxt = (r_idx+1)%4;

          if      (_dock[r_idx])    { is_one_cut = true; }
          else if (R_B[r_nxt] >= 0) { is_one_cut = true; }
          else if (cc[ipp] == '*')  { is_one_cut = false; }

          // R_B[r_nxt] must be interior, so suffice to check
          // if there's a constructed line exteinding in-line
          //
          else if (cc[ip3] != '*')  { is_one_cut = false; }
          else { is_one_cut = true; }

          if (is_one_cut) {

            // we'll be enumerating adit points for the 1-cut, so use
            // a placeholder adit, the invalid point [-1,-1]
            //
            cleave_cuts.push([
                Js[ oppo[e_idir] ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
                Js[ e_idir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
                [ -1, -1 ]
              ]);

            if (_debug > 1) {console.log("qci: cci:", cci, "r_idx:", r_idx, "e.1b:", cleave_cuts[ cleave_cuts.length-1] ); }

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
          Js[ o_tdir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
          Js[ o_idir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
          [ Rg[r_idx][0], Rg[r_idx][1] ]
        ]);

        if (_debug > 1) { console.log("qci: cci:", cci, "r_idx:", r_idx, "o.0:", cleave_cuts[ cleave_cuts.length-1] ); }

        // if the previous counterclockwise neighbor (the 'even' cleave cut) exists,
        // add another two cut with both the even and odd constructed lines.
        //
        if (cc[even_cleave_idx] == '*') {
          cleave_cuts.push([
            Js[ o_idir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
            Js[ e_idir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
            [ Rg[r_idx][0], Rg[r_idx][1] ]
          ]);

          if (_debug > 1) { console.log("qci: cci:", cci, "r_idx:", r_idx, "o.1a:", cleave_cuts[ cleave_cuts.length-1] ); }

        }

        // Otherwise we look past the last even index, back further to see
        // if we need to add a 1-cut.
        // If the index 2 previous is set as a cut, then we don't need to do anything
        // as that'll be picked up later.
        //
        //
        // Otherwise add a one-cut in-line with the Rectangle edge and odd cleave cut,
        // taking the adit point as one of the endpoints.
        //
        else {
          let imm = (odd_cleave_idx + 8 - 2) % 8;
          let im3 = (odd_cleave_idx + 8 - 3) % 8;

          let is_one_cut = false;

          let r_prv = (r_idx+4-1)%4;

          if      (_dock[r_prv])    { is_one_cut = true; }
          else if (R_B[r_prv] >= 0) { is_one_cut = true; }
          else if (cc[imm] == '*')  { is_one_cut = false; }

          // R_B[r_prv] must be interior, so suffice to check
          // if there's a constructed line exteinding in-line
          //
          else if (cc[im3] != '*')  { is_one_cut = false; }

          else { is_one_cut = true; }

          if (is_one_cut) {

            // we'll be enumerating adit points for the 1-cut, so use
            // a placeholder adit the invalid point [-1,-1]
            //
            cleave_cuts.push([
              Js[ o_idir ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
              Js[ oppo[o_idir] ][ Rg[r_idx][1] ][ Rg[r_idx][0] ],
              [ -1, -1 ]
            ]);

            if (_debug > 1) {
              console.log("qci: cci:", cci, "r_idx:", r_idx, "o.1b:", cleave_cuts[ cleave_cuts.length-1],
                "dock[", r_prv, "]:", _dock[r_prv], "cc[imm]:", cc[imm]  ); }
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

          //DEBUG
          quarry_info.comment = quarry_info.comment + " (" + JSON.stringify(cleave_cuts) + ")";

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

    candidate_corner_cuts.push( dedup_cleave_cuts );

  }

  // since the above batch cuts need to enumerate the adit points in the
  // main MIRP recursion, we're going to try only adding the one-cuts
  // here and let the adit enumeration happen in MIRP.
  //
  for (let i=0; i<side_cleave_cuts.length; i++) {

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

  let border_range = MIRPRP_quarry_edge_ranges(ctx, g_a, g_b, true, _debug);
  if (idx_e != idx_s) { border_range.push( [idx_e, idx_s] ); }
  border_range = _merge_ranges( border_range );

  if (_debug > 1) {
    console.log("consolidated border_range:", JSON.stringify(border_range));
  }

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

    for (let i=0; i<_range.length; i++) {

      if ((i > 0) && (_range[i][0] != _range[i-1][1])) {

        if (_debug > 1) {
          console.log("RANGE INVALID.1:[", i, "]:",_range[i-1], _range[i], JSON.stringify( quarry_info.side_cut), JSON.stringify(candidate_corner_cuts));
        }

        _range_valid = false;
      }
    }

    if ( (!_range_valid) || (_range.length==0) ) {
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
function MIRPRP_enumerate_one_cut_adit_points(ctx, g_s, g_e, _debug) {
  _debug = ((typeof _debug === "undefined") ? false : _debug);

  let Bij = ctx.Bij;
  let Je = ctx.Je;

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
  if (b_M >= 0) { g_M = Bij[b_M]; }
  if (b_m >= 0) { g_m = Bij[b_m]; }

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
function MIRPRP_enumerate_quarry_side_region(ctx, g_s, g_e, g_a, g_b, _debug) {
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

  let s_idx = B[ g_s[1] ][ g_s[0] ];
  let e_idx = B[ g_e[1] ][ g_e[0] ];

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
    let b_idx_cur = B[ Rg[r_idx][1] ][ Rg[r_idx][0] ];
    if (b_idx_cur < 0) {
      b_idx_cur = Js[idir][ Rg[r_idx][1] ][ Rg[r_idx][0] ];
    }

    let g_cur = [ Bij[ b_idx_cur ][0], Bij[ b_idx_cur ][1] ];

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
      let g_nxt = [ Bij[ b_idx_nxt ][0], Bij[ b_idx_nxt ][1] ];

      // then look back to see border point behind us
      //
      let b_idx_prv = Js[rdir][ g_nxt[1] ][ g_nxt[0] ];
      let g_prv = [ Bij[ b_idx_prv ][0], Bij[ b_idx_prv ][1] ];

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
        let _d = abs_sum_v( v_sub(Bij[b_idx_prv], Bij[b_idx_nxt]) );

        if (_debug > 1) {
          console.log("    _d:", _d, "|d idx|:", Math.abs(b_idx_nxt - b_idx_prv),
            "se:", se, "np:", np, "wrc:",
            wrapped_range_contain( b_idx_nxt, e_idx, s_idx ),
            wrapped_range_contain( b_idx_prv, e_idx, s_idx ));

        }

        // I'm having bounds dyslexia.
        // b_idx_nxt is the **start**, b_idx_prv is the **end**
        // Find fnence distance from **start** to **end**.
        // If **end** is less than start, add Bij.length
        //
        let __s = b_idx_nxt;
        let __e = b_idx_prv;

        let border_diff = __e - __s;
        if (border_diff < 0) { border_diff += Bij.length; }

        if (_debug > 1) {
          console.log(">>>>border_diff:", border_diff, "(prv:", b_idx_prv, "nxt:", b_idx_nxt, ")");
        }

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
function MIRPRP_point_in_region(ctx, ij, g_s, g_e, g_a, _debug) {
  let B = ctx.B;
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
  let idx_s = B[ g_s[1] ][ g_s[0] ],
      idx_e = B[ g_e[1] ][ g_e[0] ];
  if ((idx_s < 0) || (idx_e < 0)) {

    if (_debug > 2) { console.log("#pir.2 error"); }

    return -1;
  }

  //---

  // If ij is already on border, we can do a wrapped range test
  //
  let ij_b_idx = B[ ij[1] ][ ij[0] ];
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
function MIRPRP_valid_R(ctx, g_a, g_b) {
  let Je = ctx.Je;
  let B = ctx.B;

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
    if (p_b_idx < 0) { p_b_idx = B[ Rg[p][1] ][ Rg[p][0] ]; }

    let q_b_idx = Je[idir][ Rg[q][1] ][ Rg[q][0] ];
    if (q_b_idx < 0) { q_b_idx = B[ Rg[q][1] ][ Rg[q][0] ]; }

    if ((p_b_idx < 0) || (q_b_idx < 0)) { return 0; }
    if (p_b_idx != q_b_idx) { return 0; }
  }

  return 1;
}


// reverse index to get border cut points and 't' value
// (which corner the quarry adit point is)
//
function __RPRP_DPidx2b(ctx, dp_idx) {
  let n = ctx.Bij.length;
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
function __RPRP_DPidx2g(ctx, dp_idx) {

  let s_e_t = RPRP_DPidx2b(ctx, dp_idx);

  let g_s = ctx.Bij[ s_e_t[0] ];
  let g_e = ctx.Bij[ s_e_t[1] ];

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
function MIRPRP_DP_idx(ctx, g_s, g_e, g_a) {
  let B = ctx.B;

  let idx_s = B[ g_s[1] ][ g_s[0] ];
  let idx_e = B[ g_e[1] ][ g_e[0] ];

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
// It turns out the adit point can be one of a point on a line
// for a 1-cut, so, naively, this method won't work.
// This flattened array can still be recovered if the adit
// point is assumed to be the minimum and the adit point
// is stored in an auxiliarry array.
//
// The above MIRPRP_DP_idx is used but keeping here in
// the hopes it will be used in the future.
// Note: for future use, need to check to see if g_s, g_e
// is a 1-cut and force t index to be 0.
//
function _MIRPRP_DP_idx(ctx, g_s, g_e, g_a) {
  let B = ctx.B,
      Bij = ctx.Bij;

  let n = Bij.length;

  let idx_s = B[ g_s[1] ][ g_s[0] ];
  let idx_e = B[ g_e[1] ][ g_e[0] ];

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

// "Ink" cost of rectangle (sum of sides).
//
function _Ink(g_a, g_b) {
  let dx = Math.abs(g_b[0] - g_a[0]);
  let dy = Math.abs(g_b[1] - g_a[1]);

  return 2*(dx+dy);
}

// try to separate out bower list for future optimizations.
//
//
function MIRPRP_candidate_bower_naive(ctx, g_s, g_e, g_a, _debug) {
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

function MIRPRP_candidate_bower_opt(ctx, g_s, g_e, g_a, _debug) {
  let X = ctx.X,
      Y = ctx.Y;


  let k_cut = 2;

  if (cmp_v(g_s, g_e) == 0) { k_cut = 0; }
  else if ( (g_s[0] == g_e[0]) ||
            (g_s[1] == g_e[1]) ) {
    k_cut = 1;
  }

  if (k_cut == 0) {
  }

  else if (k_cut == 1) {
  }

  else if (k_cut == 2) {
  }

}

function MIRPRP_candidate_bower(ctx, g_s, g_e, g_a, _debug) {
  return MIRPRP_candidate_bower_naive(ctx, g_s, g_e, g_a, _debug);
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

function MIRPRP_cut_cost(ctx, key) {
  if (typeof key == "undefined") {

    console.log(">>>>", ctx.DP_root_key);

    let b_s = ctx.DP_root_key[0];
    let b_e = ctx.DP_root_key[1];
    let g_a = ctx.DP_root_key[2];

    key = MIRPRP_DP_idx(ctx, ctx.Bij[b_s], ctx.Bij[b_e], g_a);
  }

  let raw_cost = ctx.DP_cost[key];
  return (raw_cost - ctx.B_perim) / 2;
}

function MIRPRP(ctx, g_s, g_e, g_a, lvl, _debug, _debug_str) {
  _debug = ((typeof _debug === "undefined") ? 0 : _debug);
  _debug_str = ((typeof _debug_str === "undefined") ? "" : _debug_str);
  lvl = ((typeof lvl === "undefined") ? 0 : lvl);

  let _did = _debug_id();
  let _pfx = _ws(2*lvl) + "mirp." + lvl.toString() + "(" + _debug_str + " -> " + _did + ")";
  _debug_str = _did;

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
      Js = ctx.Js,
      Je = ctx.Je,
      Jf = ctx.Jf;

  let _min_cost = -1,
      _min_partition = [],
      _min_adit = [-1,-1],
      _min_bower = [-1,-1],
      _min_rect = [];

  let _init = false;
  if (typeof g_s === "undefined") {
    g_s = Bij[0];
    g_e = Bij[0];
    g_a = Bij[0];
    _init = true;
  }

  let b_s = B[ g_s[1] ][ g_s[0] ];
  let b_e = B[ g_e[1] ][ g_e[0] ];

  _dbg_mirp_beg(_debug, _pfx, g_s, g_e, b_s, b_e, g_a);

  // default to first entry on border.
  //
  if (_init) { ctx.DP_root_key = [0,0,[g_a[0],g_a[1]]]; }

  // See if it's already memoized, if so, return it
  //
  let dp_idx = MIRPRP_DP_idx(ctx, g_s, g_e, g_a);
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
  let candidate_bower = MIRPRP_candidate_bower(ctx, g_s, g_e, g_a);

  _dbg_mirp_bower(_debug, _pfx, candidate_bower );

  for (let bower_idx = 0; bower_idx < candidate_bower.length; bower_idx++) {
    let g_b = candidate_bower[bower_idx];

    let qi = MIRPRP_quarry_info(ctx, g_s, g_e, g_a, g_b, _debug);
    if (qi.valid == 0) {

      if (_debug > 0) { console.log( _pfx, "skip [", JSON.stringify(g_a), JSON.stringify(g_b), "]", "(", qi.comment, ")"); }

      _dbg_mirp_quarry_skip(_debug, _pfx, g_s, g_e, g_a, g_b, qi.comment);
      continue;
    }

    if (_debug) {
      console.log( _pfx, "considering quarry: [", JSON.stringify(g_a), JSON.stringify(g_b), "]");
    }


    let a_pnt = Gxy[ G[ g_a[1] ][ g_a[0] ] ];
    let b_pnt = Gxy[ G[ g_b[1] ][ g_b[0] ] ];

    let quarry_rect_cost = _Ink(a_pnt, b_pnt);

    let _min_corner_cut_cost = 0;
    let _min_corner_cut_sched_idx = -1;

    let _min_side_cut_cost = 0;
    let _min_side_cut = [];

    _dbg_mirp_quarry_info(_debug, _pfx, lvl, g_s, g_e, g_a, g_b, qi, a_pnt, b_pnt, quarry_rect_cost);

    for (let sched_idx=0; sched_idx < qi.side_cut.length; sched_idx++) {
      let one_cut = qi.side_cut[sched_idx];

      let candidate_adit = MIRPRP_enumerate_one_cut_adit_points(ctx, Bij[one_cut[0]], Bij[one_cut[1]], _debug);

      if (_debug) {
        console.log( _pfx, "adit:", JSON.stringify(candidate_adit));
      }

      let _min_idx = -1;
      let _min_g_a = [-1,-1];

      let one_cut_cost = 0;
      for (let adit_idx=0; adit_idx < candidate_adit.length; adit_idx++) {
        let g_a = candidate_adit[adit_idx];


        if ( MIRPRP_point_in_region(ctx, g_a, Bij[one_cut[0]], Bij[one_cut[1]], Bij[one_cut[0]]) == 0 ) {
          if (_debug) { console.log( _pfx, "skipping adit.1:", g_a); }
          continue;
        }

        let _cost = MIRPRP(ctx, Bij[one_cut[0]], Bij[one_cut[1]], g_a, lvl+1, _debug, _debug_str);

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

        let _g_s = Bij[cut[0]];
        let _g_e = Bij[cut[1]];
        let _g_a = cut[2];


        if ( (_g_s[0] != _g_e[0]) &&
             (_g_s[1] != _g_e[1]) ) {

          // two-cut
          //
          cur_cut_cost += MIRPRP(ctx, _g_s, _g_e, _g_a, lvl+1, _debug, _debug_str);
          continue;
        }

        //else one-cut
        //
        let _min_one_cut_cost = -1;
        let candidate_adit = MIRPRP_enumerate_one_cut_adit_points(ctx, _g_s, _g_e, _debug);

        //console.log(">>> candidate_adit:", JSON.stringify(candidate_adit));

        for (let adit_idx=0; adit_idx < candidate_adit.length; adit_idx++) {

          if ( MIRPRP_point_in_region(ctx, candidate_adit[adit_idx], _g_s, _g_e, _g_s) == 0 ) {
            if (_debug) { console.log( _pfx, "skipping adit.2:", g_a); }
            continue;
          }

          let _cost = MIRPRP(ctx, _g_s, _g_e, candidate_adit[adit_idx], lvl+1, _debug, _debug_str);
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

  if (_init) {
    let plist = [];
    let Qkey = [ ctx.DP_root_key ];

    while (Qkey.length > 0) {
      let p = Qkey.pop();
      plist.push(p);

      let key = MIRPRP_DP_idx(ctx, Bij[p[0]], Bij[p[1]], p[2]);

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


function _expect( q, v, _verbose ) {
  _verbose = ((typeof _verbose === "undefined") ? "" : _verbose);
  if (JSON.stringify(q) != JSON.stringify(v)) {
    if (_verbose.length) { console.log(_verbose + ":", "EXPECT FAILED: got:", JSON.stringify(q), ", expected:", JSON.stringify(v)); }
    return false;
  }
  if (_verbose) { console.log(_verbose + ":", "expect pass"); }
  return true;
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

  let ctx = MIRPRP_init( pgn_a );
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

  if (data_info.op == "quarry_info") {

    let ctx = MIRPRP_init(data_info.C);
    let qi = MIRPRP_quarry_info( ctx,
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

    _expect_helper( data_info, qi );

  }

  else if (data_info.op == "MIRP") {
    let ctx = MIRPRP_init(data_info.C);
    let _u = undefined;
    let v = MIRPRP(ctx, _u, _u, _u, 0, _debug);

    _print_dp(ctx);

    console.log("mirp:", v, "(", MIRPRP_cut_cost(ctx), ")");

    if (("expect" in data_info) &&
        ("return" in data_info.expect)) {
      if (v == data_info.expect.return) { console.log("pass"); }
      else { console.log("FAIL: got:", v, "expect:", data_info.expect.return); }
    }
    return;
  }

  else if (data_info.op == "quarry_edge_ranges") {
    let ctx = MIRPRP_init(data_info.C);
    _print_rprp(ctx);

    let res = MIRPRP_quarry_edge_ranges(ctx,
                                        data_info.g_a,
                                        data_info.g_b, true, _debug);

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
    let ctx = MIRPRP_init(data_info.C);
    _print_rprp(ctx);
  }

  else if (data_info.op == "cleave_profile") {
    let ctx = MIRPRP_init(data_info.C);
    let res = MIRPRP_cleave_profile(ctx, data_info.g_s, data_info.g_e, data_info.g_a, data_info.g_b)
    console.log("got:", res.join(""));
    _expect_helper( data_info, res );
  }

  else if (data_info.op == "valid_cleave") {
    let ctx = MIRPRP_init(data_info.C);

    let res = MIRPRP_valid_cleave(ctx, data_info.quarry, data_info.cleave_choice );
    console.log("got:", res);
    _expect_helper( data_info, res );
  }

  else if (data_info.op == "cleave_enumerate") {
    let ctx = MIRPRP_init(data_info.C);

    let cleave_profile = [];
    if ("cleave_profile" in data_info) {
      cleave_profile = data_info.cleave_profile;
    }
    else {
      cleave_profile = MIRPRP_cleave_profile(ctx, data_info.g_s, data_info.g_e, data_info.g_a, data_info.g_b)
    }

    console.log("cleave_profile:", cleave_profile.join(""));

    let res = MIRPRP_cleave_enumerate(ctx, data_info.g_s, data_info.g_e, data_info.g_a, data_info.g_b, cleave_profile)
    console.log("got:", JSON.stringify(res));
    for (let i=0; i<res.length; i++) {
      console.log("  ", res[i].join(""));
    }
    _expect_helper( data_info, res );
  }

}

function _expect_helper( data_info, res ) {
  if (("expect" in data_info) &&
      ("return" in data_info.expect)) {
    let result_str = JSON.stringify(res);
    let expect_str = JSON.stringify(data_info.expect.return);
    if (result_str == expect_str) { console.log("pass"); }
    else { console.log("FAIL: got:", result_str, "expect:", expect_str); }
  }
}

function _main_help(argv) {
  console.log("\nusage:\n");
  console.log("  mirprp.js [help|cli|data|rand]");
  console.log("\n");
}


if ((typeof require !== "undefined") &&
    (require.main === module)) {

  let op = "help";

  if (process.argv.length > 2) {
    op = process.argv[2];
  }

  if      (op == 'help')   { _main_help(process.argv.slice(3)); }

  else if (op == "cli") { _main_cli(process.argv.slice(3)); }
  else if (op == "data") { _main_data(process.argv.slice(3)); }
  else if (op == "rand") { _main_rand(process.argv.slice(3)); }

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
    "init" : MIRPRP_init,
    "fasslib": fasslib,
    "mirp": MIRPRP,
    "quarry_info": MIRPRP_quarry_info,
  };

  for (let key in func_name_map) {
    module.exports[key] = func_name_map[key];
  }
}



}).call(this)}).call(this,require('_process'))
},{"./4w.js":1,"./fasslib.js":3,"_process":5,"fs":4}],3:[function(require,module,exports){
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


},{}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
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

},{}]},{},[2])(2)
});
