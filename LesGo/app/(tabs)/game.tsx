import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Modal, useColorScheme, TextInput, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { GAME_CARDS, Card } from '@/constants/GameData';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function GameScreen() {
    const [gameState, setGameState] = useState<'setup' | 'playing'>('setup');
    const [players, setPlayers] = useState<string[]>([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const colorScheme = useColorScheme();

    const isDark = colorScheme === 'dark';
    // Lesbian Flag Colors
    const colors = {
        orange: '#D52D00',
        lightOrange: '#FF9A56',
        white: '#FFFFFF',
        pink: '#D362A4',
        darkPink: '#A30262',
        text: isDark ? '#fff' : '#000',
        cardBackground: isDark ? '#2a2a2a' : '#fff',
        inputBackground: isDark ? '#333' : '#f0f0f0',
    };

    // --- Setup Logic ---
    const addPlayer = () => {
        if (newPlayerName.trim().length > 0) {
            setPlayers([...players, newPlayerName.trim()]);
            setNewPlayerName('');
        }
    };

    const removePlayer = (index: number) => {
        const updatedPlayers = players.filter((_, i) => i !== index);
        setPlayers(updatedPlayers);
    };

    const startGame = () => {
        if (players.length > 0) {
            setGameState('playing');
            setCurrentPlayerIndex(0);
        }
    };

    const resetGame = () => {
        setGameState('setup');
        setPlayers([]);
        setCurrentPlayerIndex(0);
    };

    // --- Game Logic ---
    const currentCard: Card = GAME_CARDS[currentCardIndex % GAME_CARDS.length];
    const currentPlayer = players[currentPlayerIndex];

    const nextTurn = () => {
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
        setCurrentCardIndex((prev) => (prev + 1) % GAME_CARDS.length);
    };

    const handleNextCard = () => {
        nextTurn();
    };

    const handleDrink = () => {
        setModalVisible(true);
    };

    const closeDrinkModal = () => {
        setModalVisible(false);
        nextTurn();
    };

    if (gameState === 'setup') {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Jugadoras</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                        placeholder="Nombre de la jugadora"
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
                    <Text style={styles.startButtonText}>COMENZAR JUEGO</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.turnHeader}>
                <Text style={styles.turnLabel}>Turno de:</Text>
                <Text style={[styles.turnPlayer, { color: colors.darkPink }]}>{currentPlayer}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.iconContainer}>
                    {currentCard.type === 'question' ? (
                        <FontAwesome name="question-circle" size={40} color={colors.lightOrange} />
                    ) : (
                        <FontAwesome name="bolt" size={40} color={colors.pink} />
                    )}
                </View>
                <Text style={[styles.cardText, { color: colors.text }]}>{currentCard.text}</Text>
                <Text style={[styles.cardType, { color: colors.darkPink }]}>{currentCard.type.toUpperCase()}</Text>
            </View>

            <View style={styles.buttonContainer}>
                {/* NO Button -> Drink */}
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.orange }]} onPress={handleDrink}>
                    <Text style={styles.buttonText}>NO</Text>
                </TouchableOpacity>

                {/* SI / HECHO Button -> Safe */}
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.pink }]} onPress={handleNextCard}>
                    <Text style={styles.buttonText}>SI / HECHO</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
                <Text style={{ color: colors.darkPink }}>Terminar Juego</Text>
            </TouchableOpacity>

            {/* Drink Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeDrinkModal}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <Text style={styles.drinkText}>¡BEBE!</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
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
    turnHeader: {
        marginBottom: 20,
        alignItems: 'center',
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
});
