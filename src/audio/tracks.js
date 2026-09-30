// Original chiptune tracks for the OutRun mode radio (one token per 16th note).
// Notes like 'E5', '-' holds the previous note, '.' is a rest. Drums: k=kick, s=snare, h=hat.
export const TRACKS = [
  {
    name: 'SUNSET DRIVE',
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
  }
];
