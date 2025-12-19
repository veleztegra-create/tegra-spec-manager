const INK_PRESETS = {
    WATER: {
        temp: '320 °F',
        time: '1:40 min',
        blocker: {
            name: 'BLOCKER CHT',
            mesh1: '122/55',
            mesh2: '157/48',
            durometer: '70',
            strokes: '2',
            additives: 'N/A'
        },
        white: {
            name: 'AQUAFLEX WHITE',
            mesh1: '198/40',
            mesh2: '157/48',
            durometer: '70',
            strokes: '2',
            additives: 'N/A'
        },
        color: {
            mesh: '157/48',
            durometer: '70',
            strokes: '2',
            additives: '3 % cross-linker 500 · 1.5 % antitack'
        }
    },
    PLASTISOL: {
        temp: '320 °F',
        time: '0:45 min',
        blocker: {
            name: 'BLOCKER plastisol',
            mesh1: '110/64',
            mesh2: '156/64',
            durometer: '65',
            strokes: '1',
            additives: 'N/A'
        },
        white: {
            name: 'PLASTISOL WHITE',
            mesh1: '156/64',
            mesh2: '110/64',
            durometer: '65',
            strokes: '2',
            additives: 'N/A'
        },
        color: {
            mesh: '156/64',
            durometer: '65',
            strokes: '1',
            additives: '1 % catalyst'
        }
    },
    SILICONE: {
        temp: '320 °F',
        time: '1:00 min',
        blocker: {
            name: 'Bloquer Libra',
            mesh1: '110/64',
            mesh2: '157/48',
            durometer: '70',
            strokes: '2',
            additives: 'N/A'
        },
        white: {
            name: 'White Libra',
            mesh1: '122/55',
            mesh2: '157/48',
            durometer: '70',
            strokes: '2',
            additives: 'N/A'
        },
        color: {
            mesh: '157/48',
            durometer: '70',
            strokes: '2',
            additives: '3 % cat · 2 % ret'
        }
    }
};

const DEFAULT_NOISE_PIXELS = 15870446;
const ANALYSIS_DPI = 300;
