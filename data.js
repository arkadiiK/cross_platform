// Дані про планети 
const planets = [
  {
    id: 'mercury',
    name: 'Меркурій',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg',
    description: 'Найменша планета Сонячної системи та найближча до Сонця.',
    details: {
      temperature: 'Вдень до +430°C, вночі до -180°C',
      mass: '3.3011×10^23 кг',
      distance: '57.9 млн км від Сонця',
      discovery: 'Відома з давнини',
      atmosphere: 'Відсутня',
      satellites: 'Немає',
      missions: ['Mariner 10', 'MESSENGER', 'BepiColombo']
    }
  },
  {
    id: 'venus',
    name: 'Венера',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg',
    description: 'Друга планета від Сонця, відома своєю густою атмосферою.',
    details: {
      temperature: 'Середня близько 464°C',
      mass: '4.8675×10^24 кг',
      distance: '108.2 млн км від Сонця',
      discovery: 'Відома з давнини',
      atmosphere: 'Вуглекислий газ, азот',
      satellites: 'Немає',
      missions: ['Venera', 'Magellan', 'Venus Express', 'Akatsuki']
    }
  },
  {
    id: 'earth',
    name: 'Земля',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg',
    description: 'Наша рідна планета, єдина відома з життям.',
    details: {
      temperature: 'Середня близько 15°C',
      mass: '5.97237×10^24 кг',
      distance: '149.6 млн км від Сонця',
      discovery: 'Не застосовується',
      atmosphere: 'Азот, кисень',
      satellites: 'Місяць',
      missions: ['Apollo', 'Міжнародна космічна станція']
    }
  }

];