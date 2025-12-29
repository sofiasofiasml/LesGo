import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

interface SmashOrPassProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function SmashOrPass({ visible, onClose, colors }: SmashOrPassProps) {
    // Content Pools (Can be expanded)
    const FEMALE_NAMES = [
        "Jessica Alba", "Scarlett Johansson", "Margot Robbie", "Zendaya", "Jennifer Aniston",
        "Megan Fox", "Rihanna", "Dua Lipa", "Ariana Grande", "Gal Gadot",
        "Ana de Armas", "Sydney Sweeney", "Emma Stone", "Blake Lively", "Beyoncé"
    ];
    // We could add Male names or Mixed based on settings, but for "SmashOrPass" usually implies one category or random. 
    // Let's stick to a generic mixed "Famosos/as" pool or just this one for simplicity unless we have player gender preference.
    // For now, using this list randomly.

    // Initial State
    const TOTAL_ROUNDS = 5;
    const [round, setRound] = useState(1);
    const [currentChamp, setCurrentChamp] = useState<string | null>(null);
    const [challenger, setChallenger] = useState<string | null>(null);
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
    const [usedNames, setUsedNames] = useState<string[]>([]);

    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetGame = () => {
        setRound(1);
        setGameState('intro');
        setUsedNames([]);
        setCurrentChamp(null);
        setChallenger(null);
    };

    const getRandomName = (exclude: string[]) => {
        const pool = FEMALE_NAMES.filter(n => !exclude.includes(n));
        const random = pool[Math.floor(Math.random() * pool.length)];
        return random;
    };

    const startGame = () => {
        const name1 = getRandomName([]);
        const name2 = getRandomName([name1]);
        setCurrentChamp(name1);
        setChallenger(name2);
        setUsedNames([name1, name2]);
        setRound(1);
        setGameState('playing');
    };

    const handleChoice = (choice: string) => {
        // Choice becomes the new champ (or stays champ)
        setCurrentChamp(choice); // Logic: Winner stays

        if (round < TOTAL_ROUNDS) {
            // Next Round
            const nextChallenger = getRandomName(usedNames);
            setChallenger(nextChallenger);
            setUsedNames(prev => [...prev, nextChallenger]);
            setRound(prev => prev + 1);
        } else {
            // End Game
            setGameState('result');
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground, borderColor: colors.pink }]}>

                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>TORNEO DE ELECCIÓN</Text>
                        <TouchableOpacity onPress={() => onClose(false)} style={styles.closeBtn}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {gameState === 'intro' && (
                        <View style={styles.centerContent}>
                            <MaterialCommunityIcons name="heart-multiple" size={80} color={colors.pink} />
                            <Text style={[styles.desc, { color: colors.text }]}>
                                Elige tu favorito en {TOTAL_ROUNDS} rondas.
                                {"\n"}El ganador se queda.
                            </Text>
                            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: colors.pink }]} onPress={startGame}>
                                <Text style={styles.btnText}>COMENZAR TORNEO</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {gameState === 'playing' && currentChamp && challenger && (
                        <View style={styles.gameContent}>
                            <Text style={[styles.roundText, { color: colors.purple }]}>RONDA {round} / {TOTAL_ROUNDS}</Text>

                            {/* Option 1 (Current Champ) */}
                            <TouchableOpacity style={[styles.choiceCard, { backgroundColor: colors.cardBackground }]} onPress={() => handleChoice(currentChamp)}>
                                <FontAwesome name="star" size={30} color={colors.gold} style={styles.champIcon} />
                                <Text style={[styles.choiceName, { color: colors.text }]}>{currentChamp}</Text>
                                {round > 1 && <Text style={[styles.statusText, { color: colors.gold }]}>REINANTE</Text>}
                            </TouchableOpacity>

                            <View style={styles.vsContainer}>
                                <Text style={[styles.vsText, { color: 'white' }]}>VS</Text>
                            </View>

                            {/* Option 2 (Challenger) */}
                            <TouchableOpacity style={[styles.choiceCard, { backgroundColor: colors.cardBackground }]} onPress={() => handleChoice(challenger)}>
                                <Text style={[styles.choiceName, { color: colors.text }]}>{challenger}</Text>
                                <Text style={[styles.statusText, { color: colors.pink }]}>ASPIRANTE</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {gameState === 'result' && (
                        <View style={styles.centerContent}>
                            <Text style={[styles.winnerText, { color: colors.gold }]}>¡TU ELECCIÓN IDEAL!</Text>
                            <View style={[styles.winnerCard, { borderColor: colors.gold }]}>
                                <MaterialCommunityIcons name="crown" size={60} color={colors.gold} />
                                <Text style={[styles.winnerName, { color: colors.text }]}>{currentChamp}</Text>
                            </View>
                            <Text style={[styles.resultDesc, { color: colors.text }]}>
                                ¡Cuéntale al grupo por qué es tu elección!
                            </Text>
                            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: colors.purple }]} onPress={() => onClose(true)}>
                                <Text style={styles.btnText}>TERMINAR</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        minHeight: 500,
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative'
    },
    closeBtn: {
        position: 'absolute',
        right: 0
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%'
    },
    desc: {
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 30,
        lineHeight: 26
    },
    mainBtn: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    },
    gameContent: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    roundText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30
    },
    choiceCard: {
        width: '100%',
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 3,
        marginBottom: 10
    },
    choiceName: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
        letterSpacing: 1
    },
    champIcon: {
        position: 'absolute',
        top: 10,
        right: 15
    },
    vsContainer: {
        backgroundColor: '#FF3B30',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        marginVertical: -15,
        borderWidth: 2,
        borderColor: 'white'
    },
    vsText: {
        fontWeight: 'bold',
        fontSize: 18
    },
    winnerText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30
    },
    winnerCard: {
        width: '100%',
        padding: 40,
        borderRadius: 20,
        borderWidth: 3,
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: 'rgba(255, 215, 0, 0.1)'
    },
    winnerName: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center'
    },
    resultDesc: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        opacity: 0.8
    }
});
