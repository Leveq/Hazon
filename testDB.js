import db from './db.js'

db.data.characters.push({
  id: 'char-001',
  name: 'John Doe',
  bio: 'Mysterious writer with a dark past.',
})

await db.write()

console.log(db.data.characters)