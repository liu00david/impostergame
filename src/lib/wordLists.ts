import { Category } from '@/types/game'

export const WORD_LISTS: Record<Category, string[]> = {
  Food: [
    'Pizza', 'Sushi', 'Burger', 'Tacos', 'Pasta', 'Ramen', 'Steak', 'Salad',
    'Pancakes', 'Waffles', 'Curry', 'Dumplings', 'Nachos', 'Lasagna', 'Paella',
    'Croissant', 'Mochi', 'Falafel', 'Risotto', 'Baklava'
  ],
  Movies: [
    'Inception', 'Titanic', 'Avatar', 'Jaws', 'Alien', 'Rocky', 'Grease',
    'Psycho', 'Gladiator', 'Braveheart', 'Clueless', 'Spotlight', 'Parasite',
    'Interstellar', 'Memento', 'Whiplash', 'Tenet', 'Arrival', 'Hereditary', 'Joker'
  ],
  Animals: [
    'Elephant', 'Octopus', 'Penguin', 'Platypus', 'Narwhal', 'Axolotl', 'Capybara',
    'Meerkat', 'Flamingo', 'Mantis', 'Pangolin', 'Tapir', 'Okapi', 'Wombat',
    'Quokka', 'Aye-Aye', 'Blobfish', 'Sunfish', 'Tardigrade', 'Cassowary'
  ],
  Travel: [
    'Passport', 'Luggage', 'Airport', 'Hostel', 'Layover', 'Customs', 'Itinerary',
    'Backpack', 'Visa', 'Compass', 'Landmark', 'Souvenir', 'Guidebook', 'Phrasebook',
    'Jetlag', 'Currency', 'Sunscreen', 'Mosquito', 'Hammock', 'Snorkeling'
  ],
  Sports: [
    'Basketball', 'Soccer', 'Tennis', 'Baseball', 'Hockey', 'Rugby', 'Volleyball',
    'Gymnastics', 'Wrestling', 'Archery', 'Fencing', 'Bobsled', 'Curling', 'Lacrosse',
    'Badminton', 'Surfing', 'Skateboarding', 'Polo', 'Squash', 'Triathlon'
  ],
  Music: [
    'Guitar', 'Drums', 'Piano', 'Violin', 'Trumpet', 'Saxophone', 'Banjo',
    'Harp', 'Cello', 'Clarinet', 'Trombone', 'Flute', 'Accordion', 'Mandolin',
    'Ukulele', 'Oboe', 'Sitar', 'Didgeridoo', 'Theremin', 'Marimba'
  ],
  Nature: [
    'Volcano', 'Glacier', 'Waterfall', 'Canyon', 'Geyser', 'Tundra', 'Rainforest',
    'Coral', 'Stalactite', 'Dune', 'Fjord', 'Mangrove', 'Peat', 'Lagoon',
    'Atoll', 'Estuary', 'Moraine', 'Steppe', 'Taiga', 'Cenote'
  ],
  Tech: [
    'Blockchain', 'Compiler', 'Algorithm', 'Bandwidth', 'Firewall', 'Kernel',
    'Router', 'Pixel', 'Cache', 'Debug', 'Firmware', 'Latency', 'Protocol',
    'Encryption', 'Transistor', 'Mainframe', 'Sandbox', 'Touchscreen', 'Haptics', 'Drone'
  ],
}
