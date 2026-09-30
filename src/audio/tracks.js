// Radio stations for the OutRun mode (one token per 16th note).
// Notes like 'E5', '-' holds the previous note, '.' is a rest. Drums: k=kick, s=snare, h=hat, x=scratch.
// Optional: guitar (distorted power chords on the given root), bpmEnd/bpmStep (tempo rises every loop).
// All tracks are original compositions or arrangements of public-domain classical pieces.
export const TRACKS = [
  {
    name: 'SUNSET DRIVE',
    genre: 'SYNTH POP',
    bpm: 132,
    lead: [
      'E5 - G5 - C6 - - - B5 - G5 - E5 - - -',
      'C5 - E5 - A5 - - - G5 - E5 - C5 - - -',
      'A4 - C5 - F5 - A5 - G5 - F5 - C5 - - -',
      'B4 - D5 - G5 - - - F5 - E5 - D5 - . .'
    ],
    bass: [
      'C2 . C3 . C2 . C3 . C2 . C3 . C2 . C3 .',
      'A1 . A2 . A1 . A2 . A1 . A2 . A1 . A2 .',
      'F1 . F2 . F1 . F2 . F1 . F2 . F1 . F2 .',
      'G1 . G2 . G1 . G2 . G1 . G2 . G1 . G2 .'
    ],
    drums: ['k . h . s . h . k . k . s . h h']
  },
  {
    name: 'OCEAN BREEZE',
    genre: 'LATIN FUSION',
    bpm: 120,
    lead: [
      'A5 - - C6 - - A5 - G5 - F5 - - - . .',
      'F5 - - A5 - - F5 - E5 - D5 - - - . .',
      'D5 - - F5 - - A#5 - A5 - F5 - D5 - . .',
      'E5 - G5 - C6 - - - A#5 - A5 - G5 - - -'
    ],
    bass: [
      'F2 . . F2 . . F3 . F2 . . F2 . . C3 .',
      'D2 . . D2 . . D3 . D2 . . D2 . . A2 .',
      'A#1 . . A#1 . . A#2 . A#1 . . A#1 . . F2 .',
      'C2 . . C2 . . C3 . C2 . . C2 . . G2 .'
    ],
    drums: ['k . . h s . h . k h . h s . h .']
  },
  {
    name: 'NEON NIGHTS',
    genre: 'SYNTHWAVE',
    bpm: 110,
    lead: [
      'A4 - - - E5 - - - D5 - C5 - B4 - C5 -',
      'A4 - - - - - - - F4 - A4 - C5 - A4 -',
      'G4 - - - C5 - - - E5 - D5 - C5 - D5 -',
      'B4 - - - - - - - D5 - - - B4 - G4 -'
    ],
    bass: [
      'A1 . A1 . A2 . A1 . A1 . A1 . A2 . A1 .',
      'F1 . F1 . F2 . F1 . F1 . F1 . F2 . F1 .',
      'C2 . C2 . C3 . C2 . C2 . C2 . C3 . C2 .',
      'G1 . G1 . G2 . G1 . G1 . G1 . G2 . G1 .'
    ],
    drums: ['k . h . s . h . k . h . s . h k']
  },
  {
    // original: 80s arena hard rock, palm-muted power-chord riff + big chorus
    name: 'THUNDER HIGHWAY',
    genre: 'HARD ROCK',
    bpm: 126,
    lead: [
      'E5 - - - . . G5 - A5 - - - . . . .',
      'B5 - - - A5 - G5 - E5 - - - . . . .',
      'C6 - - - B5 - A5 - G5 - - - A5 - - -',
      'F#5 - - - G5 - - - E5 - - - - - - -'
    ],
    guitar: [
      'E2 . E2 . E2 . G2 - A2 - . E2 . E2 D2 -',
      'E2 . E2 . E2 . G2 - A2 - . C3 - B2 - .',
      'A2 - - - A2 . A2 . G2 - - - G2 . G2 .',
      'D2 - - - D2 . D2 . E2 - - - - - . .'
    ],
    bass: [
      'E2 . E2 . E2 . G2 - A2 - . E2 . E2 D2 -',
      'E2 . E2 . E2 . G2 - A2 - . C3 - B2 - .',
      'A1 - - - A1 . A1 . G1 - - - G1 . G1 .',
      'D2 - - - D2 . D2 . E2 - - - - - . .'
    ],
    drums: [
      'k . h . s . h . k . h k s . h .',
      'k . h . s . h . k . h k s . h .',
      'k . h . s . h . k . h k s . h .',
      'k . h . s . h . k . s . s s s s'
    ]
  },
  {
    // original: funk metal, syncopated drop-D groove, stop hits and scratches
    name: 'IRON GROOVE',
    genre: 'FUNK METAL',
    bpm: 98,
    lead: [
      '. . . . . . . . . . . . . . . .',
      '. . . . . . . . . . . . . . . .',
      'A5 A5 . G5 . . F5 . . . D5 . . . . .',
      'D6 - C6 - A5 - . . D5 D5 . D5 . . . .'
    ],
    guitar: [
      'D2 . . D2 . . D2 . F2 . D2 . G2 - F2 .',
      'D2 . . D2 . . D2 . C3 - A#2 - A2 - F2 .',
      'D2 . . D2 . . D2 . F2 . D2 . G2 - F2 .',
      'D2 . . D2 . . . . D3 D3 . D3 . . . .'
    ],
    bass: [
      'D2 . . D2 . . D2 . F2 . D2 . G2 - F2 .',
      'D2 . . D2 . . D2 . C3 - A#2 - A2 - F2 .',
      'D2 . . D2 . . D2 . F2 . D2 . G2 - F2 .',
      'D2 . . D2 . . . . D3 D3 . D3 . . . .'
    ],
    drums: [
      'k . . k s . . k . . k . s . h h',
      'k . . k s . . k . . k . s . h h',
      'k . . k s . . k . . k . s . h h',
      'k . . k s . x x . . x . s x h h'
    ]
  },
  {
    // public domain: Grieg, In the Hall of the Mountain King (1875) - rock arrangement that speeds up every loop
    name: 'MOUNTAIN KING',
    genre: 'GRIEG ROCK',
    bpm: 108,
    bpmEnd: 200,
    bpmStep: 12,
    lead: [
      'B4 . C#5 . D5 . E5 . F#5 . D5 . F#5 - - -',
      'F5 . C#5 . F5 - - - E5 . C5 . E5 - - -',
      'B4 . C#5 . D5 . E5 . F#5 . D5 . F#5 . B5 .',
      'A5 . F#5 . D5 . F#5 . A5 - - - - - - -'
    ],
    guitar: [
      'B2 - . . B2 - . . B2 - . . B2 - . .',
      'C#3 - . . C#3 - . . C3 - . . C3 - . .',
      'B2 - . . B2 - . . B2 - . . B2 - . .',
      'D3 - . . D3 - . . F#2 - . . F#2 - . .'
    ],
    bass: [
      'B1 . . . F#2 . . . B1 . . . F#2 . . .',
      'C#2 . . . G#2 . . . C2 . . . G2 . . .',
      'B1 . . . F#2 . . . B1 . . . F#2 . . .',
      'D2 . . . A2 . . . F#2 . . . C#2 . . .'
    ],
    drums: ['k . h . s . h . k . h . s . h h']
  },
  {
    // public domain: J.S. Bach, Toccata in D minor BWV 565 - opening + hard rock section
    name: 'TOCCATA IN D',
    genre: 'BACH ROCK',
    bpm: 120,
    lead: [
      'A5 G5 A5 - - - - - - - - - . . . .',
      'G5 F5 E5 D5 C#5 - - - D5 - - - - - - -',
      'A4 G4 A4 - - - - - - - - - . . . .',
      'G4 F4 E4 D4 C#4 - - - D4 - - - - - - -',
      'D5 A4 D5 E5 F5 E5 D5 A4 D5 A4 D5 E5 F5 G5 F5 E5',
      'C#5 A4 C#5 D5 E5 D5 C#5 A4 C#5 A4 C#5 D5 E5 F5 E5 D5',
      'D5 A4 D5 E5 F5 E5 D5 A4 D5 A4 D5 E5 F5 G5 F5 E5',
      'E5 - - - C#5 - - - A4 - - - - - . .'
    ],
    guitar: [
      'D3 - - - - - - - . . . . . . . .',
      'A2 - - - - - - - D3 - - - - - - -',
      'D3 - - - - - - - . . . . . . . .',
      'A2 - - - - - - - D3 - - - - - - -',
      'D2 . D2 D2 . D2 D2 . D2 . D2 D2 . D2 D2 .',
      'A1 . A1 A1 . A1 A1 . A1 . A1 A1 . A1 A1 .',
      'D2 . D2 D2 . D2 D2 . D2 . D2 D2 . D2 D2 .',
      'A1 - - - A1 - - - A1 - - - A1 - . .'
    ],
    bass: [
      'D2 - - - - - - - . . . . . . . .',
      'A1 - - - - - - - D2 - - - - - - -',
      'D2 - - - - - - - . . . . . . . .',
      'A1 - - - - - - - D2 - - - - - - -',
      'D2 . D2 . D2 . D2 . D2 . D2 . D2 . D2 .',
      'A1 . A1 . A1 . A1 . A1 . A1 . A1 . A1 .',
      'D2 . D2 . D2 . D2 . D2 . D2 . D2 . D2 .',
      'A1 . A1 . A1 . A1 . A1 . A1 . A1 . A1 .'
    ],
    drums: [
      'k . . . . . . . . . . . . . . .',
      'k . . . . . . . k . . . s . s s',
      'k . . . . . . . . . . . . . . .',
      'k . . . . . . . k . . . s . s s',
      'k . h . s . h . k k h . s . h .',
      'k . h . s . h . k k h . s . h .',
      'k . h . s . h . k k h . s . h .',
      'k . h . s . h . k . s s s s s s'
    ]
  }
];
