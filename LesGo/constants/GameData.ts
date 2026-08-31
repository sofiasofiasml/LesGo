export interface Card {
    id: string;
    text: string;
    type: 'challenge' | 'question' | 'rule' | 'viral';
    mode: 'binary' | 'statement' | 'rule'; // binary = Yes/No, statement = OK/Applies to me, rule = Accept
    responseMode?: 'single' | 'dual'; // single = one button (e.g. Seguir), dual = two buttons
    drinkTrigger?: 'yes' | 'no' | 'always' | 'none';
    drinkAction?: string; // e.g. "Bebe 2 tragos"
    points?: number; // Points awarded for this card (default 1)
    specialEffect?: 'double' | 'reverse' | 'skip' | 'steal' | 'bonus' | 'gift' | 'bomb' | 'star' | 'roulette' | 'minigame_brick' | 'minigame_flappy' | 'minigame_roulette' | 'minigame_tapper' | 'minigame_memory' | 'minigame_reflex' | 'minigame_stop' | 'minigame_box' | 'minigame_highlow' | 'minigame_potato' | 'minigame_sniper' | 'minigame_wire' | 'minigame_finger' | 'minigame_soccer' | 'minigame_tug' | 'minigame_balance' | 'minigame_pairs' | 'minigame_hippo' | 'minigame_color' | 'minigame_math'; // Special game mechanics
    category?: 'romantic' | 'spicy' | 'fun' | 'general';
    intensity?: 'soft' | 'medium' | 'spicy';
}

// POINT LOGIC:
// Soft = 1 point
// Medium = 2 points
// Spicy = 3 points
// Challenges = +1 bonus (2, 3, 4)
// Steal/Reverse/Skip = 2-3 points usually

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
        drinkAction: 'Bebe, por lesbiana intensa',
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
        text: '¿Sabes quién es Ana Legazpi? Si no lo sabes, bebe por falta de cultura.',
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
        text: 'Teléfono roto: inventa una palabra. Si llega al final, nadie bebe; si no, todas 1 trago.',
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
        text: 'Bebe si alguna vez has imaginado una relación entre dos amigas que no eran pareja.',
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
        responseMode: 'single',
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
        id: 'rl1',
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
        id: 'rl2',
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
        id: 'rl3',
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
        id: 'rl4',
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
        id: 'rl5',
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
    },
    {
        id: 'mg11',
        text: 'COLOR MATCH 🌈\nAcierta 5 colores antes de que acabe el tiempo.',
        type: 'challenge',
        mode: 'statement',
        category: 'fun',
        intensity: 'medium',
        specialEffect: 'minigame_color'
    },
    {
        id: 'mg12',
        text: 'MATH SPRINT 🧮\nResuelve sumas rápidas para salvarte.',
        type: 'challenge',
        mode: 'statement',
        category: 'general',
        intensity: 'medium',
        specialEffect: 'minigame_math'
    },
    {
        id: 'n36',
        text: '¡LADRONA! 🕵️‍♀️ Elige a una jugadora y róbale puntos.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        specialEffect: 'steal',
        points: 0
    },
    {
        id: 'n37',
        text: '🔃 CAMBIO DE SENTIDO. El orden de los turnos se invierte.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        specialEffect: 'reverse',
        points: 0
    },
    {
        id: 'n38',
        text: '🚫 SALTO DE TURNO. La siguiente persona se libra (o se fastidia).',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        specialEffect: 'skip',
        points: 0
    },
    {
        id: 'n39',
        text: '💸 IMPUESTOS. Robas puntos a la persona que va ganando (si no eres tú).',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'spicy',
        specialEffect: 'steal',
        points: 0
    },
    {
        id: 'n40',
        text: '¡UNO REVERSE! 🔄 El juego cambia de dirección.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        specialEffect: 'reverse',
        points: 0
    },
    // NEW SPICY
    {
        id: 'ns1',
        text: 'Bebe si alguna vez has tenido química brutal con alguien… y nunca pasó nada.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'ns2',
        text: 'Elige a alguien del grupo. Dile algo que te parezca sexy de ella o bebe 2 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'ns3',
        text: '¿Alguna vez te has enganchado más de la cuenta a alguien que solo quería algo casual?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        drinkAction: 'Bebe por intensa',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'ns4',
        text: 'Susurra al grupo tu red flag más grande. Si no quieres decirla, bebe 3.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 4
    },
    // NEW ROMANTIC
    {
        id: 'nr1',
        text: 'Bebe si alguna vez te ilusionaste demasiado rápido.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'nr2',
        text: 'Di algo bonito de la persona de tu izquierda. Si no te sale nada, bebes.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'romantic',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'nr3',
        text: '¿Alguna vez has pensado “esta podría ser” en una primera cita?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'nr4',
        text: 'Bebe si sigues teniendo una foto vieja que no deberías borrar.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    // NEW FUN
    {
        id: 'nf1',
        text: 'Ronda rápida: di una manía rara que tengas. La más absurda reparte 2 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        specialEffect: 'gift',
        points: 2
    },
    {
        id: 'nf2',
        text: 'Bebe si alguna vez has fingido que te gustaba una canción solo para ligar.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'fun',
        intensity: 'soft',
        points: 1
    },
    {
        id: 'nf3',
        text: 'Imita cómo reaccionas cuando te dicen “tenemos que hablar”.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    // NEW GENERAL
    {
        id: 'ng1',
        text: 'Elige una palabra prohibida hasta tu próximo turno. Quien la diga, bebe.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'ng2',
        text: 'La persona más sobria del grupo reparte 3 tragos. (Sí, lo sabemos).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        specialEffect: 'gift',
        points: 2
    },
    {
        id: 'ng3',
        text: 'Todas votan quién sería la peor ex. La elegida bebe 2 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'spicy',
        points: 3
    },
    // NEW DYNAMIC & FUNNY EXTRA
    {
        id: 'df1',
        text: 'Mímica: Tienes 10 segundos para imitar a un animal copulando. Si nadie lo adivina, bebes tú.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'df2',
        text: '🎶 LA CAJA DE MÚSICA. Tararea una canción (sin letra). La primera que la adivine reparte 2 tragos. Si nadie acierta, bebes tú.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'df3',
        text: 'CONCURSO DE PIROPOS CRINGE 🤢. Di el piropo más asqueroso o cutre a la persona de tu derecha. Si se ríe, bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'df4',
        text: 'Ronda de gemidos: Cada una debe hacer un gemido diferente. La que se ría o repita, bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'df5',
        text: 'NUEVA IDENTIDAD 🥸. Elige un nombre nuevo (ej. "La Patrona"). Quien no te llame así hasta tu próximo turno, bebe.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'df6',
        text: 'Debate serio: ¿La pizza con piña sí o no? La minoría bebe.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'df7',
        text: 'Si fueras un succionador de clítoris, ¿qué nombre de modelo tendrías? Dilo o bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'df8',
        text: '🤡 PROHIBIDO REÍR. Tienes 30 segundos para hacer reír al grupo (chistes, caras...). Cada persona que se ría bebe. Si nadie se ríe, bebes tú doble.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'df9',
        text: 'Coge el móvil de la persona de tu derecha y lee en voz alta su última nota o búsqueda de Google.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'df10',
        text: '🤖 MODO ROBOT. Debes hablar con tono monótono y sin emociones hasta tu próximo turno. Si fallas, shot.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'df11',
        text: 'YO NUNCA (DEDOS) 🖐️. Sacad 5 dedos. Di "Yo nunca...". Quien lo haya hecho baja un dedo. La primera en bajar todos bebe 3 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'df12',
        text: '¿Quién es más probable que acabe en la cárcel? Señalad a la de 3. La elegida bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    // CREATIVE CHAOS BATCH (Unique Interactions)
    {
        id: 'cc1',
        text: '🎨 PICTIONARY HUMANO. Dibuja algo con el dedo en la espalda de la persona de tu derecha. Si no lo adivina, ambas bebéis.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'cc2',
        text: '📖 CUENTO DE UNA PALABRA. Empezando por ti, cread una historia erótica diciendo una palabra cada una. La que se bloquee o repita, bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'cc3',
        text: '🗿 ESTATUAS. En cualquier momento de esta ronda, si te quedas congelada, todas deben imitarte. La última en hacerlo bebe.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        points: 3
    },
    {
        id: 'cc4',
        text: '👀 MEDUSA. A la de 3, todas miran abajo. A la de 4, mirad a alguien. Si cruzáis miradas, gritad "¡MEDUSA!" y bebed un trago.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'cc5',
        text: '💅 ESTILISTA BORRACHA. Peina o maquilla (mal) a la persona de tu izquierda. Debe dejarse o bebe 3 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'cc6',
        text: '🎤 KARAOKE MUDO. Actúa una canción famosa (sin sonido) durante 15s. Si nadie la saca, shot de castigo.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'cc7',
        text: '🤫 EL SECRETO. Susurra un secreto real a la persona de tu izquierda. Ella decide si es lo bastante bueno para salvarte o si bebes.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'cc8',
        text: '🧟 ZOMBIE WALK. Todas debéis andar como zombies hasta el próximo turno. Quien rompa el personaje, bebe.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'cc9',
        text: '📞 LLAMADA FALSA. Coge tu móvil y finge la conversación más dramática posible durante 1 minuto. Si te ríes, bebes.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'cc10',
        text: '🥒 DUELO DE GEMIDOS VEGANOS. Gemid nombres de verduras ("¡Ohhh sí, brócoli!"). La que se ría pierde.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'cc11',
        text: '🕵️‍♀️ ESPÍA. Elige una palabra común. Si alguien la dice antes de tu próximo turno, te bebes su bebida (o puntos).',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        specialEffect: 'steal',
        points: 4
    },
    {
        id: 'cc12',
        text: '🧙‍♀️ EL ORÁCULO. El grupo te hace una pregunta sobre tu futuro amoroso. Debes responder con absoluta sinceridad o beber 3 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'cc13',
        text: '🔄 CAMBIO DE ROL. Durante una ronda, tú eres ella (izquierda) y ella es tú. Imitad vuestra forma de hablar.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'cc14',
        text: '📸 PAPARAZZI. La primera persona que saque el móvil y haga una foto al grupo gana 2 puntos. Las demás beben por lentas.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'cc15',
        text: 'Di una confesión. Votemos y la minoría bebe',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'medium',
        points: 3
    },
    // CREATIVE CHAOS BATCH 2 (More Improv & Fun)
    {
        id: 'cc16',
        text: '🗣️ DOBLAJE. La persona de tu derecha mueve la boca sin sonido y tú debes ponerle una voz ridícula diciendo algo.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'cc17',
        text: '🤳 INFLUENCER. Haz una "story" o review de tu bebida como si te pagaran millones por ello. Véndenos la moto.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'cc18',
        text: '😈 ABOGADA DEL DIABLO. El grupo te da una opinión impopular (ej. "la pizza con piña es la mejor"). Tienes 1 min para defenderla a muerte.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'cc19',
        text: '🧠 TELEPATÍA. Elige a una compañera. A la de 3, decid una palabra aleatoria. Si decís la misma, repartís 4 tragos. Si no, bebéis vosotras.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'cc20',
        text: '🐌 CÁMARA LENTA. Todo lo que hagas (beber, moverte, hablar) debe ser exageradamente lento hasta tu próximo turno.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'cc21',
        text: '🙏 LA SECTA. Inventa un gesto o saludo secreto. A partir de ahora, todas deben hacerlo antes de beber. Quien se olvide, bebe doble.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'cc22',
        text: '🤫 ASMR. Todo lo que digas hasta tu próximo turno debe ser susurrando y haciendo ruiditos relajantes (o grimosos).',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'soft',
        points: 2
    },
    {
        id: 'cc23',
        text: '🚂 CONGA. Levántate e inicia una conga. Quien se una, se salva. Quien se quede sentada, bebe 3 tragos por aguafiestas.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'cc24',
        text: '👗 FASHION POLICE. Critica (con humor y cariño) el outfit de alguien del grupo. Si consigues que se ría, bebe ella. Si se ofende, bebes tú.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'cc25',
        text: '📰 TITULAR CLICKBAIT. Describe tu vida sexual actual con un titular de periódico sensacionalista.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'cc26',
        text: '🔮 LA VIDENTE. Lee la mano de la persona de tu izquierda e invéntate un futuro amoroso trágico y absurdo para ella.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'cc27',
        text: '🎭 SALIDA DRAMÁTICA. Si te levantas de la silla por cualquier razón, debes despedirte trágicamente como si fueras a la guerra.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'cc28',
        text: '🎤 RUEDA DE PRENSA. Eres una famosa en un escándalo. El grupo te hace 3 preguntas incómodas y debes responderlas.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'cc29',
        text: '🎤 EL MUSICAL. Todo lo que digas debe ser cantado (puedes inventar la melodía) hasta el próximo turno.',
        type: 'rule',
        mode: 'rule',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'cc30',
        text: '🧘‍♀️ GURÚ ESPIRITUAL. Inventa un mantra o frase "profunda" sin sentido. Todas deben repetirlo en coro con seriedad. La que se ría bebe.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    }
    ,
    // ========================================================================
    // 🔥 SPICY BATCH 3 (Sex, Questions, Lesbian Culture)
    // ========================================================================
    {
        id: 'sx1',
        text: '🐛 MANÍA SEXUAL. ¿Cuál es la manía más rara que tienes en la cama? (Si no la dices, bebe 2 tragos).',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'sx2',
        text: '🍓 FOOD PORN. ¿Alguna vez has usado comida en el sexo? ¿Qué fue? Si fue un desastre, cuéntalo.',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'spicy',
        points: 2
    },
    {
        id: 'sx3',
        text: '📈 BODY COUNT ANUAL. Bebe si te has liado con más de 5 personas este año (o más de 10 si eres muy fiestera).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'spicy',
        points: 2
    },
    {
        id: 'sx4',
        text: '💔 DOS AMORES. Bebe si ahora mismo te gustan dos personas a la vez (o estás indecisa entre dos).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'sx5',
        text: '🌊 DESCRIBE ORGASMO. Describe tu mejor orgasmo con todo lujo de detalles. Si te da vergüenza o te niegas, bebe 3 tragos.',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'sx6',
        text: '🧘 MÍMICA SEXUAL. Describe tu postura sexual favorita sin hablar, solo con gestos. Las demás deben adivinarla.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'sx7',
        text: '💦 SQUIRT TALK. ¿Alguna vez has hecho squirt o te lo han hecho? Cuenta la experiencia (o bebe si te da vergüenza).',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'sx8',
        text: '🌳 SITIO PÚBLICO. ¿El sitio más público y arriesgado donde lo has hecho? (Cuanto más loco, más puntos).',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'sx9',
        text: '🤫 JUGUETES OCULTOS. ¿Tienes algún juguete sexual que escondas como si fuera un tesoro? ¿Cuál es?',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'spicy',
        points: 2
    },
    {
        id: 'sx10',
        text: '👙 LENCERÍA VS COMODIDAD. ¿Qué prefieres: lencería sexy incómoda o bragas de abuela cómodas? Bebe si llevas las segundas ahora.',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'fun',
        intensity: 'medium',
        points: 1
    },
    {
        id: 'sx11',
        text: '🔊 GEMIDOS. Imita el ruido que hace tu pareja (o tú) cuando se corre. Si no lo haces, 3 tragos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'sx12',
        text: '⚡ AQUÍ TE PILLO. ¿Te gustan los "aquí te pillo, aquí te mato" o necesitas mil horas de preparación romántica?',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'romantic',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'sx13',
        text: '💭 FANTASÍA INCONFESABLE. Confiesa una fantasía sexual que te dé vergüenza admitir (o bebe 3 tragos si no te atreves).',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'sx14',
        text: '🍷 SEXO PRIMERA CITA. ¿Sexo en la primera cita? ¿A favor o en contra? Debate serio de 1 minuto.',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 1
    },
    {
        id: 'sx15',
        text: '👑 DOMINANTE O SUMISA. ¿Qué rol prefieres en la cama? Explica por qué te pone. (Si no contestas, 2 tragos).',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 2
    },
    {
        id: 'sx16',
        text: '👉 CRUSH COMÚN. A la de 3, señalad a la persona del grupo con la que tendríais un trío. Si coincidís, chupito de celebración.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'sx17',
        text: '🔄 LESBIAN DRAMA. Bebe si alguna vez has vuelto con tu ex más de 3 veces (tóxica).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'spicy',
        points: 2
    },
    {
        id: 'sx18',
        text: '�️‍♀️ HISTORIAL WEB. Desbloquea tu móvil y deja que la persona de tu derecha vea tu historial de navegación (o bebe 4 tragos).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'sx19',
        text: '📱 TINDER TERROR. Cuenta tu peor cita de Tinder/Bumble. Si todas coinciden en que es horrible, mandas 3 tragos.',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'sx20',
        text: '💍 MATRIMONIO. Bebe si ya tienes planeada tu boda ideal (aunque no tengas pareja actualmente).',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'romantic',
        intensity: 'soft',
        points: 1
    }
    ,
    // ========================================================================
    // ⚡ HIGH VOLTAGE BATCH 4 (Extreme Questions, Dirty Talk, Action)
    // ========================================================================
    {
        id: 'hv1',
        text: '👉 CRUSH DIRECTO. Señala a la persona de este grupo con la que tendrías sexo AHORA MISMO. (Si no señalas, te acabas la copa).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 5
    },
    {
        id: 'hv2',
        text: '👂 DIRTY TALK. Susúrrale algo extremadamente sucio al oído a la persona de tu izquierda. Si se pone roja, ganas 3 puntos.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'hv3',
        text: '🪑 POSTURA SILLA. Demuestra tu postura sexual favorita usando solo una silla (con ropa, por favor... o no).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'hv4',
        text: '👅 TRAGAR O ESCUPIR. ¿Eres de tragar o de escupir? Responde rápido y sin pensar. (Bebe si dudas).',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 2
    },
    {
        id: 'hv5',
        text: '🍑 ANAL. ¿A favor, en contra o "solo si me lo piden"? Debate serio de 1 minuto.',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 2
    },
    {
        id: 'hv6',
        text: '🧸 TOYS. ¿Cuál es tu juguete sexual favorito y cómo lo usas? (Detalles, queremos detalles).',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'hv7',
        text: '🤐 SIN MANOS. Intenta quitarle una prenda de ropa a la persona de tu derecha usando solo la boca. (Si fallas, bebe).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'hv8',
        text: '🔥STRIPTEASE. Haz un baile sexy de 10 segundos. Si el grupo aplaude, repartes 3 tragos. Si hay silencio, bebes tú.',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'hv9',
        text: '💋 BESO DE 3. Elige a dos personas para daros un beso de tres (pico o con lengua, vosotras decidís).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'romantic',
        intensity: 'spicy',
        points: 5
    },
    {
        id: 'hv10',
        text: '👙 ROPA INTERIOR. Dinos de qué color es tu ropa interior ahora mismo. (Si no llevas, ganas 5 puntos directos).',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    }
    ,
    // ========================================================================
    // 🔥 SPICY BATCH 2 (Kinks, Taboos, Exhibitionism)
    // ========================================================================
    {
        id: 'sx21',
        text: '⛓️ KINKS. ¿Te gusta atar, que te aten o ninguna? (Si no respondes, bebe 3 tragos).',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'sx22',
        text: '👋 AZOTES. ¿Te gustan los azotes? ¿Suaves o que dejen marca? Sincérate.',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'spicy',
        points: 2
    },
    {
        id: 'sx23',
        text: '🏖️ EXHIBICIONISMO. ¿Sex on the beach? ¿En un coche? Cuenta tu experiencia más "pública".',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'sx24',
        text: '🍎 TABÚ PROFESOR. Bebe si alguna vez te has liado (o has tenido ganas muy fuertes) con una profesora o jefa.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'spicy',
        points: 2
    },
    {
        id: 'sx25',
        text: '🕶️ SENSORY. Bebe si te pone que te venden los ojos y no saber qué te van a hacer.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'sx26',
        text: '😈 ROL. ¿Te pondría fingir que sois desconocidas en un bar? Bebe si lo has hecho.',
        type: 'viral',
        mode: 'statement',
        drinkTrigger: 'always',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'sx27',
        text: '🔼 TRÍOs. Si pudieras hacer un trío con dos famosas, ¿quiénes serían?',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'sx28',
        text: '📉 GATILLAZO. Cuenta una vez que "no funcionó" o que parasteis por algo muy incómodo. (Risas aseguradas).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'fun',
        intensity: 'medium',
        points: 3
    },
    {
        id: 'sx29',
        text: '📹 SEXTAPE. ¿Te grabarías haciéndolo? ¿Lo has hecho? (Bebe si tienes un vídeo guardado ahora mismo).',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'spicy',
        points: 4
    },
    {
        id: 'sx30',
        text: '🚿 DUCHA. ¿Sexo en la ducha: sobrevalorado o fantasía? Debate de 30 segundos.',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 1
    },
    {
        id: 'sx31',
        text: '💋 DISFRAZ SEXY. ¿Qué disfraz te pondría a mil ver en tu pareja? (Enfermera, policía, catwoman...).',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'sx32',
        text: '🤫 SILENCIO. ¿Eres de las que grita como loca o de las que aguanta el gemido? Haz una demostración (o bebe).',
        type: 'challenge',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    },
    {
        id: 'sx33',
        text: '🦶 PIES. ¿Te ponen los pies? (No juzgamos... mucho). Bebe si sí.',
        type: 'question',
        mode: 'binary',
        drinkTrigger: 'yes',
        category: 'spicy',
        intensity: 'medium',
        points: 2
    },
    {
        id: 'sx34',
        text: '🩸 REGLA. ¿Sexo con la regla: sí o no? ¡Manchar las sábanas es de guerreras!',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'general',
        intensity: 'medium',
        points: 1
    },
    {
        id: 'sx35',
        text: '🔞 LUGAR PROHIBIDO. Confiesa el sitio donde te encantaría hacerlo pero te pueden detener.',
        type: 'question',
        mode: 'statement',
        drinkTrigger: 'none',
        category: 'spicy',
        intensity: 'spicy',
        points: 3
    }
];
