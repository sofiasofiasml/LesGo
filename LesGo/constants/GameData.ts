export interface Card {
    id: string;
    text: string;
    type: 'challenge' | 'question' | 'rule' | 'viral';
    mode: 'binary' | 'statement' | 'rule'; // binary = Yes/No, statement = OK/Applies to me, rule = Accept
    drinkTrigger?: 'yes' | 'no' | 'always' | 'none';
    drinkAction?: string; // e.g. "Bebe 2 tragos"
    points?: number; // Points awarded for this card (default 1)
    specialEffect?: 'double' | 'reverse' | 'skip' | 'steal' | 'bonus' | 'gift' | 'bomb' | 'star' | 'roulette' | 'minigame_brick' | 'minigame_flappy' | 'minigame_roulette' | 'minigame_tapper' | 'minigame_memory' | 'minigame_reflex' | 'minigame_stop' | 'minigame_box'; // Special game mechanics
    category?: 'romantic' | 'spicy' | 'fun' | 'general';
    intensity?: 'soft' | 'medium' | 'spicy';
}

// POINT LOGIC:
// Soft = 1 point
// Medium = 2 points
// Spicy = 3 points
// Challenges = +1 bonus (2, 3, 4)

export const GAME_CARDS: Card[] = [
    // ========================================================================
    // 🔥 SPICY (Intimacy, Dating, Hookups)
    // ========================================================================
    {
        id: 's1',
        text: '¿Te has liado con alguien en un baño de un bar o discoteca?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 's2',
        text: 'Bebe si alguna vez has tenido un sueño erótico con una amiga de este grupo.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 's3',
        text: '¿Has estado con alguien mayor que tú (más de 10 años de diferencia)?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'medium',
        drinkAction: 'Bebe por Mommy Issues',
        points: 2
    },
    {
        id: 's4',
        text: 'Dinos qué es lo que más te pone de una chica. Si no contestas, bebes 3 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'medium',
        points: 3 // Challenge bonus
    },
    {
        id: 's5',
        text: '¿Has enviado desnudos esta semana?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },
    {
        id: 's6',
        text: 'Bebe si alguna vez te has liado con una hetero "solo por probar".',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 's7',
        text: '¿Alguna vez has fingido un orgasmo... con una mujer?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: '¡Farsante! Bebe 2 tragos',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 's8',
        text: 'Manda un mensaje picante a tu último match o a tu crush ahora mismo.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        specialEffect: 'double',
        points: 5 // Mega challenge
    },
    {
        id: 's9',
        text: '¿Te has liado con la ex de una amiga?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe por romper el Girl Code',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 's10',
        text: 'Bebe si tienes un "follamiga" ahora mismo.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },

    // ========================================================================
    // 💕 ROMANTIC (Exes, Crushes, Feelings)
    // ========================================================================
    {
        id: 'r1',
        text: '¿Te has mudado con alguien antes de los 3 meses de relación?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe, U-Haul Lesbian',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'r2',
        text: 'Bebe si sigues hablando con tu ex casi a diario.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'r3',
        text: '¿Te has enamorado alguna vez de tu mejor amiga heterosexual?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe por el canon',
        category: 'romantic',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'r4',
        text: 'Cuenta tu peor date o bebe 2 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'romantic',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'r5',
        text: 'Bebe si tienes alguna ex bloqueada en todas las redes sociales.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'r6',
        text: '¿Has escrito cartas de amor o poemas a una chica?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'romantic',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'r7',
        text: 'Si has llorado por alguien este mes, bebe un trago.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'r8',
        text: '¿Alguna vez has vuelto con una ex más de una vez?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'romantic',
        intensity: 'spicy',
        drinkAction: 'Bebe por no aprender',
        points: 3
    },
    {
        id: 'r9',
        text: 'Bebe si alguna vez te han dejado por "necesitar tiempo para encontrarse a sí misma".',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'r10',
        text: 'Describe a tu crush ideal en 3 palabras.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'romantic',
        intensity: 'soft',
        points: 2
    },

    // ========================================================================
    // 🎉 FUN (Stereotypes, Jokes, Culture)
    // ========================================================================
    {
        id: 'f1',
        text: 'Enseña ahora mismo una foto de tu gato haciendo algo ridículo o bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'f2',
        text: '¿Sabes quién es Shane McCutcheon? Si no lo sabes, bebe por falta de cultura.',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'no',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'f3',
        text: 'Bebe si llevas mosquetón, Vans o Doc Martens ahora mismo.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'f4',
        text: 'Imita a una bollera intentando ligar en un bar. Si te da vergüenza, bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'f5',
        text: 'Bebe si tienes las uñas cortas. (Ya sabemos por qué 😏).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'f6',
        text: '¿Has revisado la carta astral de alguien antes de la primera cita?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'fun',
        intensity: 'medium',
        drinkAction: 'Bebe, bruja',
        points: 2
    },
    {
        id: 'f7',
        text: 'Bebe si te has sentido identificada con alguna canción de Girl in Red.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'f8',
        text: '¿Alguna vez has jugado al fútbol, rugby o baloncesto federado?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'f9',
        text: 'Si eres vegetariana o vegana, reparte 2 tragos.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        specialEffect: 'gift',
        points: 1
    },
    {
        id: 'f10',
        text: 'Baila el estribillo de una canción de reggaeton sin música. Si te da vergüenza, bebe doble.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'spicy',
        points: 3
    },

    // ========================================================================
    // ⭐ GENERAL (Random, Debates, Group Physics)
    // ========================================================================
    {
        id: 'g1',
        text: 'Señala a la persona que crees que liga más. La más señalada bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        specialEffect: 'reverse',
        points: 2
    },
    {
        id: 'g2',
        text: 'Yo nunca he mentido en este juego.',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'general',
        intensity: 'medium',
        drinkAction: '¡Mentirosa!',
        points: 2
    },
    {
        id: 'g3',
        text: 'Durante esta ronda, prohibido decir la palabra "NO". Quien la diga, bebe.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'g4',
        text: 'Deja que el grupo envíe un emoji random a la última persona con la que hablaste en WhatsApp.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'g5',
        text: 'Intercambia una prenda de ropa con la persona de tu derecha.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'g6',
        text: 'Bebe si llevas algún tatuaje del que te arrepientes.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'general',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'g7',
        text: 'Haz un brindis por "las que ya no están" (tus ex). Todas beben.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'general',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'g8',
        text: 'Elige a alguien para hacer un pulso. La que pierda bebe 2 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'g9',
        text: 'Bebe si has usado Tinder, Bumble o Her en la última semana.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'general',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'g10',
        text: 'Ronda de verdad: Di un defecto tuyo o bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'g11',
        text: 'Tira una moneda. Si sale cara, bebes tú. Si sale cruz, eliges quién bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        specialEffect: 'skip',
        points: 2
    },
    {
        id: 'g12',
        text: 'Guerra de miradas con la persona de tu izquierda. La que parpadee primero bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'g13',
        text: 'Bebe si alguna vez has shippeado a dos amigas que no estaban juntas.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'general',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'g14',
        text: 'Yo nunca he stalkeado el Instagram de la nueva pareja de mi ex.',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'general',
        intensity: 'medium',
        drinkAction: 'Bebe, FBI',
        points: 2
    },
    {
        id: 'g15',
        text: 'Dinos tu signo del zodiaco. Si eres Escorpio o Géminis, bebes 2 tragos.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'general',
        intensity: 'medium',
        points: 2
    },
    // New additions for variety
    {
        id: 'n1',
        text: 'Si has visto la película "Carol" más de 3 veces, reparte 3 tragos.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        specialEffect: 'bonus',
        points: 2
    },
    {
        id: 'n2',
        text: 'Bebe si tu primer crush fue un dibujo animado (Shego, Mulán...).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'n3',
        text: '¿Quién es la más probable que acabe casada este año? La señalada bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'n4',
        text: 'Yo nunca he dicho "es complicado" cuando me preguntaron por mi situación sentimental.',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'n5',
        text: 'Bebe si tienes una playlist para llorar.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'soft',
        points: 1
    },
    // More new content
    {
        id: 'n6',
        text: '¿Te has liado con una compañera de trabajo?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'medium',
        drinkAction: 'Bebe por arriesgada',
        points: 2
    },
    {
        id: 'n7',
        text: 'Bebe si alguna vez has sido "la otra".',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'n8',
        text: 'Cuenta tu cita más incómoda o bebe 3 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'n9',
        text: '¿Quién del grupo es más probable que vuelva con su ex tóxica? Señalad a la de 3. La mayoría bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'n10',
        text: 'Bebe si has tenido sexo en un lugar público este año.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'n11',
        text: '¿Alguna vez has escrito una carta o canción para un crush y no se la diste?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'romantic',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'n12',
        text: 'Bebe si crees en las almas gemelas.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'n13',
        text: '¿Quién es la más romántica del grupo? Votad a la de 3. La elegida reparte 2 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'romantic',
        intensity: 'soft',
        specialEffect: 'gift',
        points: 2
    },
    {
        id: 'n14',
        text: '¿Has dejado de quedar con alguien por su signo del zodiaco?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe, prejuicios',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'n15',
        text: 'Si tienes una foto de tu pareja (o crush) de fondo de pantalla, reparte un trago.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'romantic',
        intensity: 'soft',
        specialEffect: 'gift',
        points: 1
    },
    {
        id: 'n16',
        text: 'Bebe si tienes un mosquetón en las llaves ahora mismo.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'n17',
        text: 'Haz tu mejor imitación de una "fuckboy" lesbiana. Si no, bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'n18',
        text: 'Bebe si tienes más de 3 camisas de cuadros en tu armario.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'n19',
        text: '¿Alguna vez has tenido una cita en IKEA o Leroy Merlin?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'fun',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'n20',
        text: 'Si sabes cambiar una rueda o usar un taladro, reparte 2 tragos.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        specialEffect: 'gift',
        points: 2
    },
    {
        id: 'n21',
        text: 'Todas las que lleven gafas beben (lo siento, ciegas).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'general',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'n22',
        text: 'La última persona en tocar el suelo bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'n23',
        text: 'Elige a una "compañera de bebida". Cada vez que tú bebas, ella bebe (dura 3 turnos).',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'n24',
        text: 'Yo nunca he hecho ghosting a alguien.',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'general',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'n25',
        text: 'Enséñanos la última foto de tu galería o bebe 2 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'n26',
        text: 'Bebe si te gustan los gatos más que las personas.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'n27',
        text: '¿Has tenido sexo con alguien y luego os habéis hecho amigas?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe, clásica',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'n28',
        text: 'Bebe si has visto todas las temporadas de "The L Word" (la original).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'general',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'n29',
        text: '¿Te irías a vivir a otro país por amor?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe, romántica empedernida',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'n30',
        text: 'Bebe si tienes "fotos eróticas" en tu móvil ahora mismo (tuyas o de otra persona).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    // --- FUN & ACTION OVERHAUL ADDITIONS ---
    {
        id: 'a1',
        text: 'Imita cómo anda tu ex. El grupo tiene que adivinar quién es (o qué tipo de persona es).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'a2',
        text: 'Haz 10 sentadillas mientras dices nombres de ligues pasados. Si te bloqueas, bebes.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'a3',
        text: 'Habla con acento argentino (o el que te salga) hasta tu próximo turno.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'a4',
        text: 'Declara tu amor a una silla (o a una planta) con la mayor pasión posible.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'a5',
        text: 'El suelo es lava: la última persona en subir los pies a una silla (o sofá) bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'a6',
        text: 'Todas las que lleven anillos beben. Si llevas más de 3, bebes doble.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'general',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'a7',
        text: 'Recrea con la persona de tu derecha tu pose sexual favorita (vestidas, por favor).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 4
    },
    // --- MORE ACTION & FUN (BATCH 2) ---
    {
        id: 'a9',
        text: 'Haz un pase de modelos por el pasillo. El grupo puntúa del 1 al 10. Si la media es menos de 7, bebes.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'a10',
        text: 'Torneo rápido de Piedra, Papel o Tijera con la persona de tu izquierda. La que pierda bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'a11',
        text: 'La última persona en tocar algo de color VERDE bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'a12',
        text: 'Haz tu mejor "cara de orgasmo" durante 5 segundos. Si te ríes, bebes.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'a13',
        text: 'Susurra algo picante al oído de la persona de tu derecha. Si se estremece o ríe, ella bebe. Si no, bebes tú.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'a14',
        text: 'Selfie grupal: Pon la cara más fea que puedas. La que salga "mejor" (menos fea) bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'a15',
        text: 'Intenta lamerte el codo. Si no puedes, bebe. (Spoiler: es casi imposible, así que bebe ya).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'a16',
        text: 'Si llevas pintalabios o uñas pintadas, reparte 2 tragos.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        specialEffect: 'gift',
        points: 2
    },
    {
        id: 'a17',
        text: 'Duelo de baile: Tienes 10 segundos para darlo todo. El grupo decide si apruebas o bebes.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'a18',
        text: 'Bebe si alguna vez has dicho "no soy celosa" y era mentira.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    // --- MIXED QUESTIONS (BATCH 3) ---
    {
        id: 'q1',
        text: '¿Alguna vez has revisado el móvil de tu pareja sin permiso?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe por tóxica',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'q2',
        text: 'Señala a la persona que mejor cocina. La elegida manda 2 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        specialEffect: 'gift',
        points: 2
    },
    {
        id: 'q3',
        text: 'Bebe si alguna vez te has tropezado en público y has fingido que no pasó nada.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'q4',
        text: '¿Cuál es el sitio más raro donde has hecho pis? Cuéntalo o bebe 2.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'q5',
        text: '¿Quién es más probable que acabe siendo la loca de los gatos? Señalad a la de 3.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'q6',
        text: 'Bebe si ahora mismo te gusta alguien que está en esta habitación.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'q7',
        text: 'Yo nunca he usado un DNI falso para entrar en una discoteca.',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'general',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'q8',
        text: 'Imita a tu emoji favorito con la cara. La que lo haga mejor manda 2 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'q9',
        text: 'Si pudieras acostarte con una famosa, ¿quién sería? Tienes 3 segundos para responder o bebes.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'q10',
        text: '¿Alguna vez has tonteado con alguien solo para conseguir copas gratis?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'q11',
        text: 'Bebe si has mandado una captura de pantalla a la persona equivocada (y era de ella).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'general',
        intensity: 'spicy',
        points: 3
    },
    // ========================================================================
    // 🎲 ROULETTE CARDS
    // ========================================================================
    {
        id: 'r1',
        text: '¡LA RULETA DECIDE! Giramos para ver quién se bebe este chupito.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        specialEffect: 'roulette',
        category: 'fun',
        intensity: 'medium',
        points: 5
    },
    {
        id: 'r2',
        text: '¡CAOS TOTAL! La ruleta elige quien manda una foto vergonzosa al grupo.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        specialEffect: 'roulette',
        category: 'spicy',
        intensity: 'spicy',
        points: 10
    },
    {
        id: 'r3',
        text: 'La ruleta elige a la "Esclava" del turno. Debe obedecer una orden del grupo.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        specialEffect: 'roulette',
        category: 'spicy',
        intensity: 'spicy',
        points: 5
    },
    {
        id: 'r4',
        text: '¡INTERCAMBIO! La ruleta decide con quién te cambias de ropa (o una prenda).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        specialEffect: 'roulette',
        category: 'fun',
        intensity: 'spicy',
        points: 5
    },
    {
        id: 'r5',
        text: 'La ruleta decide quién tiene que hacer 10 sentadillas ahora mismo.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        specialEffect: 'roulette',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    // Minigame Cards
    {
        id: 'mg1',
        text: '¡HORA DEL RECREO! 🕹️\nJuega al Arkanoid para salvarte.',
        type: 'challenge',
        mode: 'statement',
        category: 'fun',
        intensity: 'medium',
        specialEffect: 'minigame_brick'
    },
    {
        id: 'mg2',
        text: 'FLY OR DRINK 🍺\nDemuestra tu habilidad o bebe.',
        type: 'challenge',
        mode: 'statement',
        category: 'fun',
        intensity: 'medium',
        specialEffect: 'minigame_flappy'
    },
    {
        id: 'mg3',
        text: 'RETO GAMER 🎮\nSi superas la puntuación en Arkanoid, mandas 5 tragos.',
        type: 'challenge',
        mode: 'statement',
        category: 'fun',
        intensity: 'spicy',
        specialEffect: 'minigame_brick'
    },
    {
        id: 'mg4',
        text: '¡RULETA DE LA SUERTE! 🎰\nGira y descubre tu destino.',
        type: 'challenge',
        mode: 'statement',
        category: 'fun',
        intensity: 'medium',
        specialEffect: 'minigame_roulette'
    },
    {
        id: 'mg5',
        text: '¿TE SIENTES CON SUERTE? 🍀\nJuega a la ruleta para ganar (o perder) puntos.',
        type: 'challenge',
        mode: 'statement',
        category: 'spicy',
        intensity: 'spicy',
        specialEffect: 'minigame_roulette'
    },
    {
        id: 'mg6',
        text: 'MACHACA EL BOTÓN 👆\n30 toques en 5 segundos. ¿Podrás?',
        type: 'challenge',
        mode: 'statement',
        category: 'fun',
        intensity: 'medium',
        specialEffect: 'minigame_tapper'
    },
    {
        id: 'mg7',
        text: 'SIMON DICE 🧠\nConcentración máxima o bebes.',
        type: 'challenge',
        mode: 'statement',
        category: 'fun',
        intensity: 'medium',
        specialEffect: 'minigame_memory'
    },
    {
        id: 'mg8',
        text: 'DUELO VAQUERO 🤠\nEl más rápido del oeste se salva.',
        type: 'challenge',
        mode: 'statement',
        category: 'fun',
        intensity: 'spicy',
        specialEffect: 'minigame_reflex'
    },
    {
        id: 'mg9',
        text: 'PARADA EN SECO 🛑\nDetén el medidor en el momento exacto.',
        type: 'challenge',
        mode: 'statement',
        category: 'fun',
        intensity: 'medium',
        specialEffect: 'minigame_stop'
    },
    {
        id: 'mg10',
        text: 'CAJA SORPRESA 🎁\n¿Premio o castigo? Abre y descubre.',
        type: 'challenge',
        mode: 'statement',
        category: 'spicy',
        intensity: 'spicy',
        specialEffect: 'minigame_box'
    }
];
