export interface Card {
    id: string;
    text: string;
    type: 'challenge' | 'question' | 'affirmation';
}

export const GAME_CARDS: Card[] = [
    {
        id: '1',
        text: '¿Alguna vez has hecho "U-Haul" después de la segunda cita? Si NO, bebe.',
        type: 'question',
    },
    {
        id: '2',
        text: 'Tu ex es ahora tu mejor amiga. Si NO, bebe.',
        type: 'question',
    },
    {
        id: '3',
        text: '¿Tienes un mosquetón (carabiner) en tus llaves ahora mismo? Si NO, bebe.',
        type: 'question',
    },
    {
        id: '4',
        text: 'Manda un mensaje a tu crush ahora mismo. Si NO lo haces, bebe.',
        type: 'challenge',
    },
    {
        id: '5',
        text: '¿Has visto The L Word entera más de una vez? Si NO, bebe.',
        type: 'question',
    },
    {
        id: '6',
        text: '¿Tienes más de 3 camisas de cuadros? Si NO, bebe.',
        type: 'question',
    },
    {
        id: '7',
        text: 'Baila "Padam Padam" o algo de Chappell Roan por 10 segundos. Si NO, bebe.',
        type: 'challenge',
    },
    {
        id: '8',
        text: '¿Has llorado por alguien que conociste hace menos de un mes? Si NO, bebe.',
        type: 'question',
    },
    {
        id: '9',
        text: '¿Tu carta astral es compatible con la de tu ex? Si NO sabes o es NO, bebe.',
        type: 'question',
    },
    {
        id: '10',
        text: 'Di 3 estereotipos lésbicos que cumples. Si NO puedes, bebe.',
        type: 'challenge',
    },
    {
        id: '11',
        text: '¿Has salido con alguien que tiene el mismo nombre que tú o tu ex? Si NO, ¡súbele! (No bebas, o sí, tú decides). Vale, si NO, bebe.',
        type: 'question',
    },
    {
        id: '12',
        text: 'Enséñale a la persona de la derecha tu última foto de la galería. Si NO, bebe.',
        type: 'challenge',
    },
    {
        id: '13',
        text: '¿Tienes gato/s? Si NO, bebe.',
        type: 'question',
    },
    {
        id: '14',
        text: '¿Alguna vez te has enamorado de una amiga hetero? Si NO, bebe (¡Mentirosa!).',
        type: 'question',
    },
    {
        id: '15',
        text: 'Imita a Shane McCutcheon entrando en una habitación. Si da vergüenza o dices NO, bebe.',
        type: 'challenge',
    },
];
