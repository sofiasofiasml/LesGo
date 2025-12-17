import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface MemoryChallengeProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

const COLORS = [
    { id: 'red', color: '#FF3B30', sound: 'high' },
    { id: 'green', color: '#4CD964', sound: 'low' },
    { id: 'blue', color: '#007AFF', sound: 'mid' },
    { id: 'yellow', color: '#FFCC00', sound: 'mid-high' }
];

export default function MemoryChallenge({ visible, onClose, colors }: MemoryChallengeProps) {
    const [sequence, setSequence] = useState<string[]>([]);
    const [userSequence, setUserSequence] = useState<string[]>([]);
    const [gameState, setGameState] = useState<'start' | 'showing' | 'input' | 'won' | 'lost'>('start');
    const [round, setRound] = useState(1);

    // Animation refs for buttons
    const opacities = {
        red: useSharedValue(1),
        green: useSharedValue(1),
        blue: useSharedValue(1),
        yellow: useSharedValue(1)
    };

    const MAX_ROUNDS = 5;

    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetGame = () => {
        setSequence([]);
        setUserSequence([]);
        setRound(1);
        setGameState('start');
    };

    const startGame = () => {
        generateNextRound([]);
    };

    const generateNextRound = (currentSeq: string[]) => {
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)].id;
        const newSeq = [...currentSeq, randomColor];
        setSequence(newSeq);
        setUserSequence([]);
        setGameState('showing');
        playSequence(newSeq);
    };

    const playSequence = async (seq: string[]) => {
        // Wait a bit before starting
        await new Promise(r => setTimeout(r, 500));

        for (let i = 0; i < seq.length; i++) {
            const colorId = seq[i];
            await flashColor(colorId);
            await new Promise(r => setTimeout(r, 300)); // Gap between flashes
        }

        setGameState('input');
    };

    const flashColor = async (colorId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Highlight logic
        const opacity = opacities[colorId as keyof typeof opacities];
        opacity.value = 0.4;
        setTimeout(() => {
            opacity.value = 1;
        }, 300);

        await new Promise(r => setTimeout(r, 300));
    };

    const handleInput = (colorId: string) => {
        if (gameState !== 'input') return;

        // Visual feedback
        const opacity = opacities[colorId as keyof typeof opacities];
        opacity.value = 0.4;
        setTimeout(() => { opacity.value = 1; }, 150);
        Haptics.selectionAsync();

        const newUserSeq = [...userSequence, colorId];
        setUserSequence(newUserSeq);

        // Check validity
        const currentIndex = newUserSeq.length - 1;
        if (newUserSeq[currentIndex] !== sequence[currentIndex]) {
            // Wrong input
            endGame(false);
            return;
        }

        // Check if round complete
        if (newUserSeq.length === sequence.length) {
            if (newUserSeq.length >= MAX_ROUNDS) {
                // Game Won
                endGame(true);
            } else {
                // Next Round
                setRound(r => r + 1);
                setGameState('showing');
                setTimeout(() => generateNextRound(sequence), 1000);
            }
        }
    };

    const endGame = (won: boolean) => {
        setGameState(won ? 'won' : 'lost');
        Haptics.notificationAsync(won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    };

    // Animated styles defined at component level
    const redStyle = useAnimatedStyle(() => ({ opacity: opacities.red.value }));
    const greenStyle = useAnimatedStyle(() => ({ opacity: opacities.green.value }));
    const blueStyle = useAnimatedStyle(() => ({ opacity: opacities.blue.value }));
    const yellowStyle = useAnimatedStyle(() => ({ opacity: opacities.yellow.value }));

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>SIMON DICE 🧠</Text>
                        <TouchableOpacity onPress={() => onClose(gameState === 'won')}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ color: colors.orange, fontSize: 18, marginBottom: 20, fontWeight: 'bold' }}>
                        Ronda {round} / {MAX_ROUNDS}
                    </Text>

                    <View style={styles.gameBoard}>
                        <View style={styles.row}>
                            <AnimatedTouchableOpacity
                                style={[styles.simonBtn, { backgroundColor: '#FF3B30' }, redStyle]}
                                onPress={() => handleInput('red')}
                                activeOpacity={1}
                            />
                            <AnimatedTouchableOpacity
                                style={[styles.simonBtn, { backgroundColor: '#4CD964' }, greenStyle]}
                                onPress={() => handleInput('green')}
                                activeOpacity={1}
                            />
                        </View>
                        <View style={styles.row}>
                            <AnimatedTouchableOpacity
                                style={[styles.simonBtn, { backgroundColor: '#007AFF' }, blueStyle]}
                                onPress={() => handleInput('blue')}
                                activeOpacity={1}
                            />
                            <AnimatedTouchableOpacity
                                style={[styles.simonBtn, { backgroundColor: '#FFCC00' }, yellowStyle]}
                                onPress={() => handleInput('yellow')}
                                activeOpacity={1}
                            />
                        </View>

                        {/* Status Overlay */}
                        {gameState === 'showing' && (
                            <View style={styles.centerStatus}>
                                <Text style={styles.statusText}>👀 MIRA</Text>
                            </View>
                        )}
                        {gameState === 'input' && (
                            <View style={styles.centerStatus}>
                                <Text style={styles.statusText}>👉 REPITE</Text>
                            </View>
                        )}
                    </View>

                    {/* Start / Result Overlay */}
                    {(gameState === 'start' || gameState === 'won' || gameState === 'lost') && (
                        <View style={styles.menuOverlay}>
                            {gameState === 'start' && (
                                <>
                                    <Text style={[styles.introText, { color: colors.text }]}>
                                        Repite la secuencia de colores.
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.playButton, { backgroundColor: colors.purple }]}
                                        onPress={startGame}
                                    >
                                        <Text style={styles.buttonText}>EMPEZAR</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                            {(gameState === 'won' || gameState === 'lost') && (
                                <>
                                    <Text style={[styles.resultTitle, { color: gameState === 'won' ? '#4CD964' : '#FF3B30' }]}>
                                        {gameState === 'won' ? '¡MEMORIA DE ELEFANTE!' : '¡OUCH!'}
                                    </Text>
                                    <Text style={[styles.resultDesc, { color: colors.text }]}>
                                        {gameState === 'won' ? 'Repartes 5 tragos.' : 'Te toca beber.'}
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.playButton, { backgroundColor: colors.orange }]}
                                        onPress={() => onClose(gameState === 'won')}
                                    >
                                        <Text style={styles.buttonText}>CONTINUAR</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}

                </View>
            </View>
        </View>
    );
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        minHeight: 500
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    gameBoard: {
        width: 300,
        height: 300,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15
    },
    row: {
        flexDirection: 'row',
        gap: 15
    },
    simonBtn: {
        width: 130,
        height: 130,
        borderRadius: 20,
        elevation: 5
    },
    centerStatus: {
        position: 'absolute',
        top: '40%',
        left: '30%',
        right: '30%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 20,
        alignItems: 'center'
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold'
    },
    menuOverlay: {
        position: 'absolute',
        top: 60,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        padding: 20
    },
    introText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
        color: 'white'
    },
    playButton: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    },
    resultTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    resultDesc: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
        color: 'white'
    }
});
