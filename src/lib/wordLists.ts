import { Category } from '@/types/game'

export const WORD_LISTS: Record<Category, string[]> = {
  Animals: [
    "Alligator", "Antelope", "Axolotl", "Baboon", "Badger", "Beagle", "Beaver", "Buffalo",
    "Capybara", "Cheetah", "Chicken", "Coyote", "Dolphin", "Donkey", "Eagle", "Elephant",
    "Falcon", "Ferret", "Fox", "Giraffe", "Gorilla", "Hamster", "Hippo", "Horse",
    "Jaguar", "Jellyfish", "Kangaroo", "Koala", "Leopard", "Lion", "Lizard", "Monkey",
    "Ostrich", "Panda", "Penguin", "Rabbit", "Raccoon", "Shark", "Sloth", "Tiger"
  ],
  AsianFood: [
    "Bibimbap", "Bulgogi", "Buldak", "Chow Mein", "Dimsum", "Dumpling", "Edamame", "Gyoza",
    "Japchae", "Kimchi", "Kimbap", "Mochi", "Naan", "Nigiri",
    "Onigiri", "Pad Thai", "Peking Duck", "Pho", "Ramen", "Sashimi", "Satay",
    "Samosa", "Sichuan", "Sushi", "Takoyaki", "Tandoori",
    "Tempura", "Teriyaki", "Tteokbokki", "Udon", "Wasabi", "Wonton", "Yakitori"
  ],
  Celebrities: ["Adele", "Ariana Grande", "Bad Bunny", "Beyonce", "Billie Eilish", 
    "Bruno Mars", "Chappell Roan", "Chris Rock", "Doja Cat", "Drake", "Dua Lipa", 
    "Ed Sheeran", "Eminem", "Harry Styles", "Ice Spice", "Jack Harlow",
    "Jenna Ortega", "Justin Bieber", "Kanye West", "Kylie Jenner", "Lady Gaga", "LeBron James", 
    "Lionel Messi", "Lizzo", "Madonna", "MrBeast", "Nicki Minaj", "Olivia Rodrigo", "Pedro Pascal", 
    "Post Malone", "Rihanna", "Snoop Dogg", "SZA", "Taylor Swift", "The Weeknd", "Timothee Chalamet", 
    "Tom Holland", "Travis Scott", "Zendaya"],
  Cities: [
    "Amsterdam", "Athens", "Austin", "Bangkok", "Barcelona", "Beijing", "Berlin", "Boston",
    "Chicago", "Dallas", "Denver", "Dubai", "Dublin", "Istanbul", "Lisbon", "London",
    "Madrid", "Manila", "Miami", "Milan", "Moscow", "Mumbai", "Munich", "Nashville",
    "Osaka", "Paris", "Prague", "Rome", "Seattle", "Seoul", "Sydney", "Taipei",
    "Tokyo", "Toronto", "Venice", "Vienna", "Wuhan", "Zurich"
  ],
  FictionalCharacter: ["Ash Ketchum", "Batman", "Black Widow", "Bugs Bunny", "Deadpool", 
    "Darth Vader", "Elsa", "Frodo", "Gandalf", "Goku", "Harry Potter", "Homer Simpson", 
    "Iron Man", "Jack Sparrow", "James Bond", "Joker", "Katniss", "Kirby", "Lara Croft", 
    "Luke Skywalker", "Mario", "Mickey Mouse", "Naruto", "Pac-Man", "Peter Griffin",
    "Pikachu", "Popeye", "Rick Sanchez", "Sherlock Holmes", "Shrek", "Snoopy", "Sonic", "Spider-Man",
    "SpongeBob", "Superman", "Thanos", "Winnie-the-Pooh", "Yoda", "Zelda"],
  Food: [
    "Apple", "Avocado", "Bagel", "Banana", "Burger", "Burrito", "Cheese", "Cherry",
    "Chicken", "Cookie", "Crisp", "Croissant", "Curry", "Donut", "Falafel", "Garlic",
    "Grapes", "Hummus", "Lasagna", "Lemon", "Mango", "Matcha", "Melon", "Nachos", 
    "Onion", "Orange", "Pasta", "Peach", "Pizza", "Potato", "Salad", "Salmon", 
    "Sorbet", "Steak", "Tacos", "Toast", "Waffle", "Yogurt", "Zucchini", "Omelette"
  ],
  Hobbies: [
    "Archery", "Baking", "Bowling", "Camping", "Chess", "Coding", "Cooking", "Cycling",
    "Dancing", "Drawing", "Fishing", "Gaming", "Gardening", "Hiking", "Hunting", "Jogging",
    "Karate", "Knitting", "Origami", "Painting", "Pilates", "Poker", "Pottery", "Puzzle",
    "Reading", "Rowing", "Running", "Sailing", "Sewing", "Singing", "Skating", "Skiing",
    "Soccer", "Squash", "Surfing", "Tennis", "Travel", "Typing", "Writing", "Yoga"
  ],
  Internet: [
    "Amazon", "Android", "Browse", "ChatGPT", "Chrome", "Cloud", "Discord", "Email",
    "Facebook", "Google", "Hashtag", "Instagram", "LinkedIn", "Meme", "Netflix", "Online",
    "Patreon", "Pinterest", "Podcast", "Portal", "Reddit", "Roblox", "Router", "Safari",
    "Search", "Server", "Shopify", "Skype", "Snapchat", "Spotify", "Stream", "Substack",
    "Telegram", "Threads", "TikTok", "Tumblr", "Twitch", "Twitter", "WhatsApp", "YouTube"
  ],
  Movies: [
    "Aladdin", "Avatar", "Avengers", "Barbie", "Batman", "Beetlejuice", "Casablanca", "Coraline",
    "Deadpool", "Dracula", "Frozen", "Gladiator", "Godzilla", "Hamlet", "Inception", "Interstellar",
    "Jaws", "Joker", "Jumanji", "Matrix", "Minions", "Moana", "Psycho", "Ratatouille",
    "Rocky", "Saw", "Scarface", "Scream", "Shrek", "Skyfall", "Speed", "Superman",
    "Titanic", "Twilight", "Vertigo", "Whiplash", "Braveheart", "Cinderella", "Goodfellas", "Pinocchio"
  ],
  Sports: [
    "Archery", "Baseball", "Basketball", "Billiards", "Bowling", "Boxing", "Cricket", "Curling",
    "Cycling", "Diving", "Fencing", "Fishing", "Football", "Golf", "Handball", "Hiking",
    "Hockey", "Hunting", "Judo", "Karate", "Lacrosse", "Netball", "Polo", "Racing",
    "Rowing", "Rugby", "Running", "Sailing", "Skating", "Skiing", "Soccer", "Softball",
    "Squash", "Surfing", "Swimming", "Tennis", "Track", "Volleyball", "Walking", "Wrestling"
  ],
}
