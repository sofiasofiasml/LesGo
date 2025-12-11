import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Modal, useColorScheme, TextInput, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { GAME_CARDS, Card } from '@/constants/GameData';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fisher-Yates Shuffle Algorithm
const shuffleArray = (array: Card[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export default function GameScreen() {
    const [gameState, setGameState] = useState<'setup' | 'playing' | 'victory'>('setup');
    const [players, setPlayers] = useState<string[]>([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    const [deck, setDeck] = useState<Card[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [drinkMessage, setDrinkMessage] = useState('¡BEBE!'); // Initial default

    // Points system
    const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
    const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = backward
    const [doublePoints, setDoublePoints] = useState(false);
    const [skipNext, setSkipNext] = useState(false);
    const [showScoreboard, setShowScoreboard] = useState(false);

    // Player selection modal for steal/gift effects
    const [playerSelectionModal, setPlayerSelectionModal] = useState(false);
    const [selectionAction, setSelectionAction] = useState<'steal' | 'gift' | null>(null);
    const [winner, setWinner] = useState<string | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [currentRound, setCurrentRound] = useState(1);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const colorScheme = useColorScheme();

    const isDark = colorScheme === 'dark';
    const colors = {
        orange: '#FF6B35',
        lightOrange: '#FF9A56',
        white: '#FFFFFF',
        pink: '#E91E8C',
        darkPink: '#C2185B',
        purple: '#9C27B0',
        text: isDark ? '#fff' : '#1a1a1a',
        cardBackground: isDark ? '#2d1b2e' : '#fff',
        inputBackground: isDark ? '#3d2a3e' : '#f0f0f0',
        modalBackground: isDark ? '#1a0f1b' : '#ffffff',
        accentGradient: isDark ? 'rgba(233, 30, 140, 0.2)' : 'rgba(233, 30, 140, 0.1)',
    };

    // --- Setup Logic ---
    const addPlayer = async () => {
        if (newPlayerName.trim().length > 0) {
            const updatedPlayers = [...players, newPlayerName.trim()];
            setPlayers(updatedPlayers);
            setNewPlayerName('');
            // Save to AsyncStorage
            await savePlayersToStorage(updatedPlayers);
        }
    };

    const removePlayer = async (index: number) => {
        const updatedPlayers = players.filter((_, i) => i !== index);
        setPlayers(updatedPlayers);
        // Save to AsyncStorage
        await savePlayersToStorage(updatedPlayers);
    };

    // AsyncStorage functions
    const savePlayersToStorage = async (playersList: string[]) => {
        try {
            await AsyncStorage.setItem('lesgo_players', JSON.stringify(playersList));
        } catch (error) {
            console.error('Error saving players:', error);
        }
    };

    const loadPlayersFromStorage = async () => {
        try {
            const savedPlayers = await AsyncStorage.getItem('lesgo_players');
            if (savedPlayers) {
                setPlayers(JSON.parse(savedPlayers));
            }
        } catch (error) {
            console.error('Error loading players:', error);
        }
    };

    // Load players on component mount
    useEffect(() => {
        loadPlayersFromStorage();
    }, []);

    const startGame = () => {
        if (players.length > 0) {
            // Filter out special cards for first round
            const firstRoundCards = GAME_CARDS.filter(card => !card.specialEffect);
            setDeck(shuffleArray(firstRoundCards));
            setCurrentCardIndex(0);
            setCurrentPlayerIndex(0);
            setCurrentRound(1);
            // Initialize scores
            const initialScores: Record<string, number> = {};
            players.forEach(player => initialScores[player] = 0);
            setPlayerScores(initialScores);
            setDirection(1);
            setDoublePoints(false);
            setSkipNext(false);
            setWinner(null);
            setGameState('playing');
        }
    };

    const resetGame = () => {
        setShowExitConfirm(false);
        setGameState('setup');
        // Keep players list - don't clear it
        // setPlayers([]);
        setCurrentPlayerIndex(0);
        setPlayerScores({});
        setDirection(1);
        setDoublePoints(false);
        setSkipNext(false);
        setWinner(null);
        setCurrentRound(1);
    };

    const handleExitClick = () => {
        if (gameState === 'playing') {
            setShowExitConfirm(true);
        } else {
            resetGame();
        }
    };

    const continueGame = () => {
        setGameState('playing');
        setWinner(null);
    };

    // --- Game Logic ---
    // Ensure deck has cards, fallback to base list if empty (shouldn't happen after start)
    const activeDeck = deck.length > 0 ? deck : GAME_CARDS;
    const currentCard: Card = activeDeck[currentCardIndex % activeDeck.length];
    const currentPlayer = players[currentPlayerIndex];

    const nextTurn = () => {
        // Calculate next player index based on direction
        let nextIndex = currentPlayerIndex + direction;
        if (nextIndex >= players.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = players.length - 1;

        // Skip turn if skipNext is active
        if (skipNext) {
            setSkipNext(false);
            // Skip one more player
            nextIndex = nextIndex + direction;
            if (nextIndex >= players.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = players.length - 1;
        }

        setCurrentPlayerIndex(nextIndex);
        setCurrentCardIndex((prev) => (prev + 1) % activeDeck.length);

        // Check if we completed a full round (all players played)
        if (nextIndex === 0 && currentRound === 1) {
            // Start round 2 - now include special cards
            setCurrentRound(2);
            setDeck(shuffleArray(GAME_CARDS)); // Include all cards now
            setCurrentCardIndex(0);
        }
        // Reshuffle if we looped through the deck
        else if ((currentCardIndex + 1) % activeDeck.length === 0) {
            // Keep using all cards after round 2
            const cardsToUse = currentRound >= 2 ? GAME_CARDS : GAME_CARDS.filter(card => !card.specialEffect);
            setDeck(shuffleArray(cardsToUse));
        }

        // Reset double points after use
        if (doublePoints) {
            setDoublePoints(false);
        }
    };

    const addPoints = (player: string, points: number) => {
        setPlayerScores(prev => {
            const newScores = { ...prev };
            newScores[player] = Math.max(0, (newScores[player] || 0) + points);

            // Check for victory
            if (newScores[player] >= 100 && !winner) {
                setWinner(player);
                setGameState('victory');
            }

            return newScores;
        });
    };

    const handleSpecialEffect = (effect: string) => {
        switch (effect) {
            case 'double':
                setDoublePoints(true);
                break;
            case 'reverse':
                setDirection(prev => prev === 1 ? -1 : 1);
                break;
            case 'skip':
                setSkipNext(true);
                break;
            case 'steal':
                setSelectionAction('steal');
                setPlayerSelectionModal(true);
                return; // Don't proceed to nextTurn yet
        }
    };

    const handlePlayerSelection = (selectedPlayer: string) => {
        if (selectionAction === 'steal') {
            // Steal 10 points
            setPlayerScores(prev => {
                const newScores = { ...prev };
                const stolen = Math.min(10, newScores[selectedPlayer] || 0);
                newScores[selectedPlayer] = (newScores[selectedPlayer] || 0) - stolen;
                newScores[currentPlayer] = (newScores[currentPlayer] || 0) + stolen;
                return newScores;
            });
        }
        setPlayerSelectionModal(false);
        setSelectionAction(null);
        nextTurn();
    };

    const handleDrink = (customMessage?: string) => {
        setDrinkMessage(customMessage || '¡BEBE!');
        setModalVisible(true);
    };

    const closeDrinkModal = () => {
        setModalVisible(false);
        nextTurn();
    };

    const handleChoice = (choice: 'yes' | 'no') => {
        // Award points
        const basePoints = currentCard.points || 1;
        const finalPoints = doublePoints ? basePoints * 2 : basePoints;
        addPoints(currentPlayer, finalPoints);

        // Handle special effects
        if (currentCard.specialEffect) {
            handleSpecialEffect(currentCard.specialEffect);
            if (currentCard.specialEffect === 'steal') {
                return; // Wait for player selection
            }
        }

        if (currentCard.drinkTrigger === choice) {
            handleDrink(currentCard.drinkAction);
        } else {
            nextTurn();
        }
    };

    const handleContinue = () => {
        // Award points
        const basePoints = currentCard.points || 1;
        const finalPoints = doublePoints ? basePoints * 2 : basePoints;
        addPoints(currentPlayer, finalPoints);

        // Handle special effects
        if (currentCard.specialEffect) {
            handleSpecialEffect(currentCard.specialEffect);
            if (currentCard.specialEffect === 'steal') {
                return; // Wait for player selection
            }
        }

        // Handle drink trigger
        if (currentCard.drinkTrigger === 'always') {
            handleDrink(currentCard.drinkAction);
        } else {
            nextTurn();
        }
    };

    // Render logic based on mode
    const renderIcon = () => {
        switch (currentCard.type) {
            case 'question': return <FontAwesome name="question-circle" size={40} color={colors.lightOrange} />;
            case 'challenge': return <FontAwesome name="bolt" size={40} color={colors.pink} />;
            case 'rule': return <FontAwesome name="gavel" size={40} color="#9b59b6" />; // Purple for rules
            case 'viral': return <FontAwesome name="hashtag" size={40} color="#2ecc71" />; // Green for viral/status
            default: return <FontAwesome name="gamepad" size={40} color={colors.pink} />;
        }
    }

    // --- RENDER ---
    if (gameState === 'setup') {
        return (
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 }}>
                    <Text style={[styles.header, { color: colors.darkPink }]}>LesGo 🌈</Text>
                    <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.infoButtonTop}>
                        <FontAwesome name="info-circle" size={28} color={colors.darkPink} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.subheader, { color: colors.text }]}>Añadir Jugadoras</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                        placeholder="Nombre"
                        placeholderTextColor={isDark ? '#aaa' : '#666'}
                        value={newPlayerName}
                        onChangeText={setNewPlayerName}
                        onSubmitEditing={addPlayer}
                    />
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.pink }]} onPress={addPlayer}>
                        <FontAwesome name="plus" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.playerList} contentContainerStyle={{ gap: 10 }}>
                    {players.map((player, index) => (
                        <View key={index} style={[styles.playerItem, { backgroundColor: colors.cardBackground }]}>
                            <Text style={[styles.playerText, { color: colors.text }]}>{player}</Text>
                            <TouchableOpacity onPress={() => removePlayer(index)}>
                                <FontAwesome name="trash" size={20} color={colors.orange} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {players.length === 0 && (
                        <Text style={{ textAlign: 'center', opacity: 0.5, marginTop: 20 }}>Añade jugadoras para empezar</Text>
                    )}
                </ScrollView>
                <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: players.length > 0 ? colors.orange : '#ccc' }]}
                    onPress={startGame}
                    disabled={players.length === 0}
                >
                    <Text style={styles.startButtonText}>EMPEZAR JUEGO</Text>
                </TouchableOpacity>

                {/* Info Modal - Only in Setup Screen */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showInfoModal}
                    onRequestClose={() => setShowInfoModal(false)}
                >
                    <View style={styles.modalView}>
                        <View style={[styles.modalContent, { backgroundColor: colors.modalBackground, maxHeight: '80%' }]}>
                            <View style={[styles.modalHeader, { borderBottomColor: colors.purple }]}>
                                <FontAwesome name="heart" size={30} color={colors.pink} />
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Sobre el Juego</Text>
                            </View>
                            <ScrollView style={{ width: '100%', marginTop: 15 }} showsVerticalScrollIndicator={true}>
                                <Text style={[styles.infoText, { color: colors.text }]}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>LesGo - Yo Nunca (Versión Bollera)</Text>
                                </Text>

                                <Text style={[styles.infoText, { color: colors.text, marginTop: 15 }]}>
                                    Creado con 🌈 por <Text style={{ fontWeight: 'bold', color: colors.pink }}>Sofía Martínez López</Text>
                                </Text>

                                <Text style={[styles.infoSection, { color: colors.text }]}>Sobre el juego</Text>
                                <Text style={[styles.infoText, { color: colors.text }]}>
                                    Este es un juego de fiesta diseñado para divertirse entre amigas. Incluye preguntas, retos y mecánicas especiales inspiradas en la cultura lésbica y queer.
                                </Text>

                                <Text style={[styles.infoSection, { color: colors.text }]}>Disclaimer Legal</Text>
                                <Text style={[styles.infoText, { color: colors.text }]}>
                                    • Este juego NO promueve el consumo de alcohol.{'\n'}
                                    • Puedes jugarlo con cualquier tipo de bebida (refrescos, agua, zumos, etc.).{'\n'}
                                    • Si decides jugar con alcohol, hazlo de forma responsable.{'\n'}
                                    • No conduzcas si has bebido.{'\n'}
                                    • Respeta siempre los límites de cada persona.
                                </Text>

                                <Text style={[styles.infoSection, { color: colors.text }]}>Cómo jugar</Text>
                                <Text style={[styles.infoText, { color: colors.text }]}>
                                    1. Añade jugadoras (mínimo 2){'\n'}
                                    2. Las cartas especiales aparecen desde la ronda 2{'\n'}
                                    3. Primera en llegar a 100 puntos gana{'\n'}
                                    4. ¡Diviértete!
                                </Text>

                                <Text style={[styles.infoText, { color: colors.text, marginTop: 20, fontSize: 12, opacity: 0.6, textAlign: 'center' }]}>
                                    Versión 1.0 • 2024
                                </Text>
                            </ScrollView>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.pink, marginTop: 15 }]}
                                onPress={() => setShowInfoModal(false)}
                            >
                                <Text style={styles.buttonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    if (gameState === 'victory') {
        return (
            <VictoryScreen
                winner={winner}
                scores={playerScores}
                onContinue={continueGame}
                onReset={resetGame}
                colors={colors}
            />
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setShowScoreboard(true)} style={styles.scoreButton}>
                    <FontAwesome name="trophy" size={20} color={colors.darkPink} />
                    <Text style={{ color: colors.text, marginLeft: 5 }}>Puntos</Text>
                </TouchableOpacity>
                <View style={styles.turnInfo}>
                    <Text style={styles.turnLabel}>Turno de:</Text>
                    <Text style={[styles.turnPlayer, { color: colors.darkPink }]}>{currentPlayer}</Text>
                </View>
                <TouchableOpacity onPress={handleExitClick} style={styles.exitButtonTop}>
                    <FontAwesome name="times" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Special Effects Indicators */}
            {(doublePoints || skipNext || direction === -1) && (
                <View style={styles.effectsBar}>
                    {doublePoints && <Text style={styles.effectBadge}>🔥 DOBLE PUNTOS</Text>}
                    {skipNext && <Text style={styles.effectBadge}>⏭️ PRÓXIMO TURNO SALTADO</Text>}
                    {direction === -1 && <Text style={styles.effectBadge}>🔄 SENTIDO INVERTIDO</Text>}
                </View>
            )}

            {/* Current Player Score */}
            <View style={styles.currentScoreBar}>
                <View style={styles.currentScoreInfo}>
                    <Text style={[styles.currentScoreLabel, { color: colors.text }]}>Tu puntuación:</Text>
                    <Text style={[styles.currentScoreValue, { color: colors.darkPink }]}>
                        {playerScores[currentPlayer] || 0} pts
                    </Text>
                </View>
                <TouchableOpacity onPress={() => setShowScoreboard(true)} style={styles.viewAllButton}>
                    <FontAwesome name="list" size={16} color={colors.white} />
                    <Text style={{ color: colors.white, marginLeft: 5, fontSize: 12 }}>Ver todas</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.iconContainer}>
                    {renderIcon()}
                </View>
                <Text style={[styles.cardText, { color: colors.text }]}>{currentCard.text}</Text>
                <Text style={[styles.cardType, { color: colors.darkPink }]}>{currentCard.type.toUpperCase()}</Text>
            </View>

            <View style={styles.buttonContainer}>
                {currentCard.mode === 'binary' ? (
                    <>
                        {/* NO Logic */}
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.orange }]}
                            onPress={() => handleChoice('no')}
                        >
                            <Text style={styles.buttonText}>NO</Text>
                        </TouchableOpacity>

                        {/* YES Logic */}
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.pink }]}
                            onPress={() => handleChoice('yes')}
                        >
                            <Text style={styles.buttonText}>SÍ / HECHO</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    /* Statement / Rule Handling */
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.pink }]}
                        onPress={handleContinue}
                    >
                        <Text style={styles.buttonText}>
                            {currentCard.mode === 'rule' ? 'ACEPTO' : 'SIGUIENTE'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>



            {/* Drink Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeDrinkModal}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <Text style={styles.drinkText}>{drinkMessage}</Text>
                        <Text style={styles.victimText}>{currentPlayer}</Text>
                        <FontAwesome name="glass" size={80} color={colors.darkPink} />
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.orange }]}
                            onPress={closeDrinkModal}
                        >
                            <Text style={styles.buttonText}>¡He bebido!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* All Scores Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showScoreboard}
                onRequestClose={() => setShowScoreboard(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.pink }]}>
                            <FontAwesome name="trophy" size={30} color={colors.pink} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Puntuaciones</Text>
                        </View>
                        <ScrollView style={{ width: '100%', maxHeight: 400, marginTop: 10 }}>
                            {players
                                .map((player, index) => ({ player, score: playerScores[player] || 0, index }))
                                .sort((a, b) => b.score - a.score)
                                .map(({ player, score, index }, position) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.scoreRowModal,
                                            {
                                                backgroundColor: player === currentPlayer
                                                    ? colors.accentGradient
                                                    : 'transparent'
                                            }
                                        ]}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <Text style={{ fontSize: 20, width: 30 }}>
                                                {position === 0 ? '🥇' : position === 1 ? '🥈' : position === 2 ? '🥉' : '  '}
                                            </Text>
                                            <Text style={[styles.scorePlayerName, { color: colors.text, fontSize: 18 }]}>
                                                {player === currentPlayer ? '▶ ' : ''}{player}
                                            </Text>
                                        </View>
                                        <Text style={[styles.scorePoints, { color: colors.pink, fontSize: 20, fontWeight: 'bold' }]}>
                                            {score} pts
                                        </Text>
                                    </View>
                                ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.pink, marginTop: 20 }]}
                            onPress={() => setShowScoreboard(false)}
                        >
                            <Text style={styles.buttonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Exit Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showExitConfirm}
                onRequestClose={() => setShowExitConfirm(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
                        <FontAwesome name="exclamation-triangle" size={60} color={colors.orange} style={{ marginBottom: 20 }} />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>¿Estás segura?</Text>
                        <Text style={{ fontSize: 16, color: colors.text, textAlign: 'center', marginTop: 10, marginBottom: 30, opacity: 0.8 }}>
                            Vas a perder la partida y todos los puntos
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 15, width: '100%' }}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.pink, flex: 1 }]}
                                onPress={() => setShowExitConfirm(false)}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.orange, flex: 1 }]}
                                onPress={resetGame}
                            >
                                <Text style={styles.buttonText}>Salir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Player Selection Modal (for steal/gift) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={playerSelectionModal}
                onRequestClose={() => setPlayerSelectionModal(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.orange }]}>
                            <FontAwesome name="hand-paper-o" size={30} color={colors.orange} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Elige una jugadora</Text>
                        </View>
                        <ScrollView style={{ width: '100%', maxHeight: 300, marginTop: 10 }}>
                            {players.filter(p => p !== currentPlayer).map((player, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.playerSelectButton, { backgroundColor: colors.pink }]}
                                    onPress={() => handlePlayerSelection(player)}
                                >
                                    <Text style={styles.buttonText}>{player}</Text>
                                    <Text style={{ color: 'white', fontSize: 14, opacity: 0.9 }}>
                                        {playerScores[player] || 0} pts
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Victory Screen
function VictoryScreen({ winner, scores, onContinue, onReset, colors }: any) {
    return (
        <View style={styles.container}>
            <Text style={[styles.header, { color: colors.darkPink }]}>¡VICTORIA!</Text>
            <FontAwesome name="trophy" size={100} color={colors.orange} style={{ marginVertical: 30 }} />
            <Text style={[styles.winnerText, { color: colors.text }]}>{winner}</Text>
            <Text style={[styles.winnerSubtext, { color: colors.text }]}>ha ganado con {scores[winner]} puntos</Text>

            <View style={styles.finalScoreboard}>
                <Text style={[styles.scoreboardTitle, { color: colors.text }]}>Clasificación Final</Text>
                {Object.entries(scores)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .map(([player, score]: any, index) => (
                        <View key={index} style={styles.scoreRow}>
                            <Text style={[styles.scorePlayerName, { color: colors.text }]}>
                                {index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : ''}{player}
                            </Text>
                            <Text style={[styles.scorePoints, { color: colors.darkPink }]}>
                                {score} pts
                            </Text>
                        </View>
                    ))}
            </View>

            <TouchableOpacity
                style={[styles.startButton, { backgroundColor: colors.pink, marginTop: 30 }]}
                onPress={onContinue}
            >
                <Text style={styles.startButtonText}>CONTINUAR JUGANDO</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.resetButton, { marginTop: 20 }]}
                onPress={onReset}
            >
                <Text style={{ color: colors.darkPink }}>Terminar y Volver al Inicio</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 45,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    subheader: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        opacity: 0.8,
    },
    // Setup Styles
    inputContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
        gap: 10,
    },
    input: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
    },
    addButton: {
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
    },
    playerList: {
        width: '100%',
        flex: 1,
        marginBottom: 20,
    },
    playerItem: {
        padding: 20,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    playerText: {
        fontSize: 18,
        fontWeight: '600',
    },
    startButton: {
        width: '100%',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 5,
        marginBottom: 20,
    },
    startButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // Game UI
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 20,
    },
    turnInfo: {
        alignItems: 'center',
    },
    exitButtonTop: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    turnLabel: {
        fontSize: 16,
        opacity: 0.6,
    },
    turnPlayer: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    card: {
        width: '100%',
        flex: 1,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 30,
    },
    iconContainer: {
        marginBottom: 20,
    },
    cardText: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 20,
    },
    cardType: {
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 20,
        marginBottom: 20,
    },
    button: {
        flex: 1,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resetButton: {
        padding: 10,
    },
    // Modal Styles
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 50,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    drinkText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#D52D00', // Deep Orange
        marginBottom: 10,
        textAlign: 'center',
    },
    victimText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    modalButton: {
        marginTop: 40,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    // Points System Styles
    scoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    effectsBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 15,
        width: '100%',
    },
    effectBadge: {
        backgroundColor: '#FF9A56',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    scoreboard: {
        width: '100%',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        maxHeight: 200,
    },
    scoreboardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    scorePlayerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    scorePoints: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    playerSelectButton: {
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    winnerText: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    winnerSubtext: {
        fontSize: 20,
        marginBottom: 20,
    },
    finalScoreboard: {
        width: '100%',
        padding: 20,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    currentScoreBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 15,
        backgroundColor: 'rgba(211, 98, 164, 0.1)',
        borderRadius: 15,
        marginBottom: 15,
    },
    currentScoreInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    currentScoreLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    currentScoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E91E8C',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        paddingBottom: 15,
        borderBottomWidth: 2,
        width: '100%',
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    scoreRowModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginVertical: 4,
    },
    infoButtonTop: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    infoText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    infoSection: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
});
