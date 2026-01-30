import { addCharacter } from './characterService'

addCharacter({
  name: 'Elara Voss',
  role: 'Commander',
  age: 38,
  gender: 'Female',
  bio: 'A brilliant and battle-hardened spaceship commander.',
  appearances: ['scene-001'],
}).then(character => {
  console.log('Character added:', character)
})