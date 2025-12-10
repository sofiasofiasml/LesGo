export interface Card {
    id: string;
    text: string;
    type: 'challenge' | 'question' | 'rule' | 'viral';
    mode: 'binary' | 'statement' | 'rule'; // binary = Yes/No, statement = OK/Applies to me, rule = Accept
    drinkTrigger?: 'yes' | 'no' | 'always' | 'none';
    drinkAction?: string; // e.g. "Bebe 2 tragos"
}

export const GAME_CARDS: Card[] = [
    // --- CLICHÉS & PREGUNTAS (Binary: Yes/No) ---
    {
        id: 'c1',
        text: '¿Te has enamorado alguna vez de tu mejor amiga?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe por intensa',
    },
    {
        id: 'c2',
        text: '¿Te has liado con una profesora?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
    },
    {
        id: 'c3',
        text: '¿Sigues hablando con tu ex casi a diario?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe y bloqueala',
    },
    {
        id: 'c4',
        text: '¿Tienes algún tatuaje que te hiciste por una novia?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
    },
    {
        id: 'c5',
        text: '¿Has llorado en una discoteca este año?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
    },
    {
        id: 'c6',
        text: '¿Te has mudado con alguien antes de los 3 meses?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe un fondo',
    },
    {
        id: 'c7',
        text: '¿Alguna vez has salido con alguien que se llamaba igual que tú?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
    },
    {
        id: 'c8',
        text: '¿Has tenido una cita en IKEA?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
    },
    {
        id: 'c9',
        text: '¿Tienes gatos?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'no',
        drinkAction: 'Si NO tienes gatos, bebe. ¡Raro!',
    },
    {
        id: 'c10',
        text: '¿Has revisado el horóscopo de tu crush para ver la compatibilidad?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
    },
    {
        id: 'c11',
        text: '¿Has escrito una carta de amor a mano en el último año?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
    },
    {
        id: 'c12',
        text: '¿Has estado en una relación a distancia con alguien de otro continente?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
    },

    // --- REGLAS & ESTADOS (Statement: Applies to me / Everyone check) ---
    {
        id: 'r1',
        text: 'Bebe un trago por cada anillo que lleves puesto ahora mismo.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
    },
    {
        id: 'r2',
        text: 'Si tienes los ojos azules o verdes, bebe.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
    },
    {
        id: 'r3',
        text: 'Si llevas puesto algo de cuadros (camisa, pantalones...), bebe.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
    },
    {
        id: 'r4',
        text: 'La persona con el pelo más corto del grupo manda beber a quien quiera.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
    },
    {
        id: 'r5',
        text: 'Quien tenga más ex-novias en el grupo, bebe 2 tragos.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
    },

    // --- RETOS Y JUEGOS TEMPORALES (Rule: Accepts challenge) ---
    {
        id: 'g1',
        text: 'Durante esta ronda, NO puedes decir "Sí" ni "No". Si lo dices, bebes.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
    },
    {
        id: 'g2',
        text: 'Habla con acento extranjero hasta que te vuelva a tocar el turno. Si se te olvida, bebe.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
    },
    {
        id: 'g3',
        text: 'Debes beberle la copa a alguien del local (o del grupo) los sorbos que te digan.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'always',
    },
    {
        id: 'g4',
        text: 'Enséñale a la persona de tu derecha la última foto de tu galería o bebe todo tu vaso.',
        type: 'challenge',
        mode: 'binary',
        drinkTrigger: 'no', // Choice: Show photo (Yes/Safe) or Drink (No)
        drinkAction: '¡A beber el vaso entero!',
    },
    {
        id: 'g5',
        text: 'Manda un mensaje a tu crush o ex ahora mismo. Si no te atreves, bebe.',
        type: 'challenge',
        mode: 'binary',
        drinkTrigger: 'no',
        drinkAction: 'Bebe por cobarde',
    },
];
