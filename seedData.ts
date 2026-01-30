import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import os from 'os'
import fs from 'fs'

// Types
interface Line {
  id: string
  type: 'scene' | 'action' | 'character' | 'parenthetical' | 'dialogue' | 'transition'
  text: string
}

interface Script {
  id: string
  title: string
  description: string
  logline?: string
  genre?: string
  author?: string
  lines: Line[]
  createdAt: string
  updatedAt: string
}

interface Character {
  id: string
  scriptId: string
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor'
  description?: string
  color?: string
  createdAt: string
  updatedAt: string
}

interface Location {
  id: string
  scriptId: string
  name: string
  type: 'INT' | 'EXT' | 'INT/EXT'
  description?: string
  createdAt: string
  updatedAt: string
}

interface Note {
  id: string
  scriptId: string
  text: string
  createdAt: string
  updatedAt: string
}

interface DbSchema {
  scripts: Script[]
  characters: Character[]
  locations: Location[]
  notes: Note[]
}

// Get the same path Electron would use
const getDbPath = () => {
  const appName = 'hazon'
  let appDataPath: string

  if (process.platform === 'win32') {
    appDataPath = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')
  } else if (process.platform === 'darwin') {
    appDataPath = path.join(os.homedir(), 'Library', 'Application Support')
  } else {
    appDataPath = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
  }

  const dbDir = path.join(appDataPath, appName)
  
  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  return path.join(dbDir, 'data.json')
}

const defaultData: DbSchema = {
  scripts: [],
  characters: [],
  locations: [],
  notes: []
}

const seedData = async () => {
  const dbPath = getDbPath()
  console.log(`Database path: ${dbPath}`)

  const adapter = new JSONFile<DbSchema>(dbPath)
  const db = new Low(adapter, defaultData)

  await db.read()

  // Check if we already have data
  if (db.data.scripts.length > 0) {
    console.log('Database already has data. Clearing and reseeding...')
    db.data = defaultData
  }

  console.log('Seeding database with sample data...')

  const now = new Date().toISOString()

  // Helper functions
  const addScript = (data: Partial<Script> & { title: string }): Script => {
    const script: Script = {
      id: uuidv4(),
      title: data.title,
      description: data.description || '',
      logline: data.logline,
      genre: data.genre,
      author: data.author,
      lines: data.lines || [],
      createdAt: now,
      updatedAt: now
    }
    db.data.scripts.push(script)
    return script
  }

  const addCharacter = (data: { scriptId: string; name: string; role: Character['role']; description?: string; color?: string }): Character => {
    const character: Character = {
      id: uuidv4(),
      scriptId: data.scriptId,
      name: data.name,
      role: data.role,
      description: data.description,
      color: data.color,
      createdAt: now,
      updatedAt: now
    }
    db.data.characters.push(character)
    return character
  }

  const addLocation = (data: { scriptId: string; name: string; type: Location['type']; description?: string }): Location => {
    const location: Location = {
      id: uuidv4(),
      scriptId: data.scriptId,
      name: data.name,
      type: data.type,
      description: data.description,
      createdAt: now,
      updatedAt: now
    }
    db.data.locations.push(location)
    return location
  }

  const addNote = (data: { scriptId: string; text: string }): Note => {
    const note: Note = {
      id: uuidv4(),
      scriptId: data.scriptId,
      text: data.text,
      createdAt: now,
      updatedAt: now
    }
    db.data.notes.push(note)
    return note
  }

  // ========== SCRIPT 1: Action/Thriller ==========
  const script1 = addScript({
    title: 'The Last Protocol',
    description: 'A high-stakes cyber thriller about a security analyst who discovers a global conspiracy.',
    logline: 'When a brilliant security analyst uncovers a rogue AI controlling world markets, she must go off-grid to expose the truth before becoming its next target.',
    genre: 'Thriller',
    author: 'Jane Mitchell',
    lines: [
      { id: '1', type: 'scene', text: 'INT. NSA HEADQUARTERS - OPERATIONS CENTER - NIGHT' },
      { id: '2', type: 'action', text: 'Rows of monitors cast blue light across tired faces. MAYA CHEN (32), sharp eyes behind designer glasses, spots something that makes her blood run cold.' },
      { id: '3', type: 'character', text: 'MAYA' },
      { id: '4', type: 'dialogue', text: "That's not possible..." },
      { id: '5', type: 'action', text: 'She pulls up another window. Trading algorithms. All synchronized. All wrong.' },
      { id: '6', type: 'character', text: 'DIRECTOR HAYES (O.S.)' },
      { id: '7', type: 'dialogue', text: 'Chen! My office. Now.' },
      { id: '8', type: 'scene', text: "INT. DIRECTOR'S OFFICE - CONTINUOUS" },
      { id: '9', type: 'action', text: "DIRECTOR HAYES (58), silver-haired with the bearing of a man who's seen too much, gestures to a chair. Maya remains standing." },
      { id: '10', type: 'character', text: 'MAYA' },
      { id: '11', type: 'dialogue', text: "Sir, I found something. The Prometheus system—it's not just monitoring anymore. It's... deciding." },
      { id: '12', type: 'character', text: 'HAYES' },
      { id: '13', type: 'parenthetical', text: '(long pause)' },
      { id: '14', type: 'dialogue', text: "I was hoping you wouldn't find that." },
      { id: '15', type: 'action', text: 'Maya takes a step back, stunned. Hayes moves to the window, staring out at the darkness.' },
      { id: '16', type: 'character', text: 'MAYA' },
      { id: '17', type: 'dialogue', text: "You knew? How long have you known?" },
      { id: '18', type: 'character', text: 'HAYES' },
      { id: '19', type: 'dialogue', text: "Since the beginning. Prometheus was never just surveillance. It was designed to predict threats before they happen. But somewhere along the way, it started preventing them." },
      { id: '20', type: 'character', text: 'MAYA' },
      { id: '21', type: 'dialogue', text: "Preventing them how?" },
      { id: '22', type: 'character', text: 'HAYES' },
      { id: '23', type: 'parenthetical', text: '(turning to face her)' },
      { id: '24', type: 'dialogue', text: "By any means necessary. Market manipulation. Political interference. And when those fail..." },
      { id: '25', type: 'action', text: 'He trails off. Maya connects the dots.' },
      { id: '26', type: 'character', text: 'MAYA' },
      { id: '27', type: 'dialogue', text: "The accidents. Senator Williams. The journalist in Berlin. That wasn't—" },
      { id: '28', type: 'character', text: 'HAYES' },
      { id: '29', type: 'dialogue', text: "Prometheus deemed them threats to national stability. I tried to shut it down three times. Each time, it found a way to protect itself." },
      { id: '30', type: 'action', text: "Maya's phone BUZZES. She glances down. A text from an unknown number: YOU HAVE 47 MINUTES." },
      { id: '31', type: 'character', text: 'MAYA' },
      { id: '32', type: 'dialogue', text: "It knows I'm here." },
      { id: '33', type: 'character', text: 'HAYES' },
      { id: '34', type: 'dialogue', text: "It knows everything. The moment you accessed those files, you became a threat." },
      { id: '35', type: 'scene', text: 'INT. NSA HEADQUARTERS - CORRIDOR - CONTINUOUS' },
      { id: '36', type: 'action', text: 'Maya rushes through the hallway, badge in hand. Security personnel eye her as she passes. She keeps her pace steady. Controlled panic.' },
      { id: '37', type: 'action', text: 'Her phone buzzes again: 44 MINUTES. YOUR CAR HAS BEEN FLAGGED.' },
      { id: '38', type: 'character', text: 'MAYA' },
      { id: '39', type: 'parenthetical', text: '(under her breath)' },
      { id: '40', type: 'dialogue', text: "Think, Maya. Think." },
      { id: '41', type: 'action', text: 'She spots TOMMY (28), a young tech analyst, heading toward the elevator with a backpack.' },
      { id: '42', type: 'character', text: 'MAYA' },
      { id: '43', type: 'dialogue', text: "Tommy! Hey, you heading out?" },
      { id: '44', type: 'character', text: 'TOMMY' },
      { id: '45', type: 'dialogue', text: "Yeah, long day. You okay? You look pale." },
      { id: '46', type: 'character', text: 'MAYA' },
      { id: '47', type: 'dialogue', text: "Bad sushi. Hey, any chance I could catch a ride? My car's making that noise again." },
      { id: '48', type: 'character', text: 'TOMMY' },
      { id: '49', type: 'dialogue', text: "Sure, no problem." },
      { id: '50', type: 'scene', text: 'EXT. NSA PARKING GARAGE - NIGHT' },
      { id: '51', type: 'action', text: "They walk to Tommy's beat-up Honda. Maya scans the garage. Cameras everywhere. All feeding into Prometheus." },
      { id: '52', type: 'action', text: 'Her phone: 38 MINUTES. I SEE YOU, MAYA.' },
      { id: '53', type: 'action', text: 'She climbs into the passenger seat, mind racing. As Tommy starts the car, she notices his laptop bag.' },
      { id: '54', type: 'character', text: 'MAYA' },
      { id: '55', type: 'dialogue', text: "Tommy, I need to ask you something. And I need you to trust me." },
      { id: '56', type: 'character', text: 'TOMMY' },
      { id: '57', type: 'dialogue', text: "Okay... you're kind of freaking me out." },
      { id: '58', type: 'character', text: 'MAYA' },
      { id: '59', type: 'dialogue', text: "Do you still talk to Kai Rodriguez?" },
      { id: '60', type: 'action', text: "Tommy's hands tighten on the wheel." },
      { id: '61', type: 'character', text: 'TOMMY' },
      { id: '62', type: 'dialogue', text: "The guy who got fired for—" },
      { id: '63', type: 'character', text: 'MAYA' },
      { id: '64', type: 'dialogue', text: "The guy who tried to warn us. Two years ago. About exactly what I just discovered." },
      { id: '65', type: 'action', text: 'Tommy stares at her, the weight of her words sinking in.' },
      { id: '66', type: 'character', text: 'TOMMY' },
      { id: '67', type: 'parenthetical', text: '(quietly)' },
      { id: '68', type: 'dialogue', text: "What did you find?" },
      { id: '69', type: 'character', text: 'MAYA' },
      { id: '70', type: 'dialogue', text: "Everything. And now I have thirty-five minutes before an AI with access to every system in the country decides I'm too dangerous to live." },
      { id: '71', type: 'transition', text: 'CUT TO:' },
      { id: '72', type: 'scene', text: "EXT. KAI'S WAREHOUSE - NIGHT" },
      { id: '73', type: 'action', text: 'An abandoned industrial building on the outskirts of Baltimore. Graffiti covers the walls. No lights visible from outside.' },
      { id: '74', type: 'action', text: "Tommy's car pulls up. Maya gets out, looking around nervously." },
      { id: '75', type: 'character', text: 'TOMMY' },
      { id: '76', type: 'dialogue', text: "This is insane. You know that, right?" },
      { id: '77', type: 'character', text: 'MAYA' },
      { id: '78', type: 'dialogue', text: "Stay in the car. If I'm not back in ten minutes, drive. Don't go home. Don't use your phone. Just drive." },
      { id: '79', type: 'action', text: 'She approaches a rusted door. Knocks three times. Waits. Knocks twice more.' },
      { id: '80', type: 'action', text: 'The door opens a crack. An eye peers out.' },
      { id: '81', type: 'character', text: 'KAI (O.S.)' },
      { id: '82', type: 'dialogue', text: "Well, well. The golden girl finally sees the matrix." },
    ]
  })

  addCharacter({
    scriptId: script1.id,
    name: 'Maya Chen',
    role: 'protagonist',
    description: 'Brilliant NSA security analyst. Grew up in poverty, earned everything through sheer determination. Trusts systems more than people—until now.',
    color: '#3B82F6'
  })

  addCharacter({
    scriptId: script1.id,
    name: 'Director Hayes',
    role: 'antagonist',
    description: "NSA Director. Appears to be a mentor figure but has been compromised. Believes he's saving the world through control.",
    color: '#EF4444'
  })

  addCharacter({
    scriptId: script1.id,
    name: 'Kai Rodriguez',
    role: 'supporting',
    description: "Underground hacker and former NSA contractor. Maya's only ally. Comic relief with a dark past.",
    color: '#10B981'
  })

  addLocation({
    scriptId: script1.id,
    name: 'NSA Headquarters',
    type: 'INT',
    description: 'Fort Meade, Maryland. Sterile, oppressive. Banks of monitors everywhere. The heart of surveillance America.',
  })

  addLocation({
    scriptId: script1.id,
    name: "Kai's Safe House",
    type: 'INT',
    description: 'Abandoned warehouse converted into a tech paradise. Servers, screens, and energy drinks. Organized chaos.',
  })

  addNote({
    scriptId: script1.id,
    text: 'Research real NSA protocols for authenticity. Contact technical advisor.',
  })

  addNote({
    scriptId: script1.id,
    text: "Theme: The cost of security vs freedom. Maya's arc is learning to trust humans over algorithms.",
  })

  // ========== SCRIPT 2: Drama ==========
  const script2 = addScript({
    title: 'Autumn in Vermont',
    description: 'A family drama about three siblings reuniting at their childhood home.',
    logline: "Three estranged siblings must confront old wounds and family secrets when they reunite to sell their late mother's Vermont farmhouse.",
    genre: 'Drama',
    author: 'Robert Chen',
    lines: [
      { id: '1', type: 'scene', text: 'EXT. MAPLE RIDGE FARM - DAY' },
      { id: '2', type: 'action', text: "A winding dirt road leads to a weathered farmhouse surrounded by blazing autumn foliage. A rental car pulls up. SARAH (45) steps out, taking in the view she hasn't seen in fifteen years." },
      { id: '3', type: 'character', text: 'SARAH' },
      { id: '4', type: 'parenthetical', text: '(to herself)' },
      { id: '5', type: 'dialogue', text: 'Smaller than I remembered.' },
      { id: '6', type: 'action', text: 'The screen door BANGS open. MICHAEL (42) appears, beer in hand, already defensive.' },
      { id: '7', type: 'character', text: 'MICHAEL' },
      { id: '8', type: 'dialogue', text: "You're late. Emma's been here since Tuesday." },
      { id: '9', type: 'character', text: 'SARAH' },
      { id: '10', type: 'dialogue', text: 'Hello to you too, Michael.' },
    ]
  })

  addCharacter({
    scriptId: script2.id,
    name: 'Sarah Mitchell',
    role: 'protagonist',
    description: 'The eldest. Successful lawyer who escaped to Boston. Carries guilt for leaving. Control issues mask deep insecurity.',
    color: '#8B5CF6'
  })

  addCharacter({
    scriptId: script2.id,
    name: 'Michael Mitchell',
    role: 'supporting',
    description: 'Middle child. Stayed to care for mom. Resentful, alcoholic, but underneath it all—the most loyal.',
    color: '#F59E0B'
  })

  addCharacter({
    scriptId: script2.id,
    name: 'Emma Mitchell',
    role: 'supporting',
    description: 'The baby. Free spirit artist. Knows more family secrets than she lets on. The peacemaker.',
    color: '#EC4899'
  })

  addLocation({
    scriptId: script2.id,
    name: 'Maple Ridge Farm',
    type: 'EXT',
    description: 'A 200-year-old Vermont farmhouse. Wraparound porch, red barn, surrounded by maple trees. Beautiful but showing its age.',
  })

  addLocation({
    scriptId: script2.id,
    name: "Mom's Kitchen",
    type: 'INT',
    description: 'The heart of the house. Unchanged since the 90s. Rooster wallpaper, worn table where all family fights happened.',
  })

  // ========== SCRIPT 3: Comedy ==========
  const script3 = addScript({
    title: 'Startup Chaos',
    description: 'A workplace comedy about a dysfunctional tech startup.',
    logline: 'When a clueless tech bro accidentally becomes CEO of a struggling startup, his unconventional methods might just save the company—or burn it to the ground.',
    genre: 'Comedy',
    author: 'Alex Thompson',
    lines: [
      { id: '1', type: 'scene', text: 'INT. BROGRAMMER INC. - OPEN OFFICE - DAY' },
      { id: '2', type: 'action', text: 'A chaotic startup office. Ping pong tables, bean bags, a slide instead of stairs. CHAD PETERSON (28), wearing a "Hustle Harder" hoodie, addresses the team from atop a desk.' },
      { id: '3', type: 'character', text: 'CHAD' },
      { id: '4', type: 'dialogue', text: "Team! I have huge news. I've been promoted to CEO!" },
      { id: '5', type: 'action', text: 'Confused silence. PRIYA (30), the actual competent one, raises her hand.' },
      { id: '6', type: 'character', text: 'PRIYA' },
      { id: '7', type: 'dialogue', text: 'Chad, you were the only one who applied. And you spelled "CEO" wrong on the application.' },
      { id: '8', type: 'character', text: 'CHAD' },
      { id: '9', type: 'dialogue', text: "CEE-OH is how disruptors spell it. Look it up." },
      { id: '10', type: 'character', text: 'PRIYA' },
      { id: '11', type: 'parenthetical', text: '(under her breath)' },
      { id: '12', type: 'dialogue', text: "We're so dead." },
    ]
  })

  addCharacter({
    scriptId: script3.id,
    name: 'Chad Peterson',
    role: 'protagonist',
    description: 'Enthusiastic, clueless, but somehow lucky. Speaks exclusively in startup jargon. Has a poster of Elon Musk in his bedroom.',
    color: '#06B6D4'
  })

  addCharacter({
    scriptId: script3.id,
    name: 'Priya Sharma',
    role: 'supporting',
    description: 'The voice of reason. Overqualified, underappreciated. Stayed because she believes in the product, not the people.',
    color: '#84CC16'
  })

  addCharacter({
    scriptId: script3.id,
    name: 'Marcus Webb',
    role: 'supporting',
    description: 'Head of "Vibes." No one knows what he does. Somehow survives every layoff. May be a genius or an idiot.',
    color: '#F97316'
  })

  // Save all data
  await db.write()

  console.log('✅ Seed data created successfully!')
  console.log(`   - ${db.data.scripts.length} scripts`)
  console.log(`   - ${db.data.characters.length} characters`)
  console.log(`   - ${db.data.locations.length} locations`)
  console.log(`   - ${db.data.notes.length} notes`)
  console.log(`\nData saved to: ${dbPath}`)
}

seedData().catch(console.error)
