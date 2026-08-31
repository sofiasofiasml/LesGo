import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface MemoryChallengeProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

const MAX_ROUNDS = 5;

const PAD_COLORS = {
    dark: {
        red: '#FF3B30',
        green: '#4CD964',
        blue: '#007AFF',
        yellow: '#FFCC00',
    },
    light: {
        red: '#E95A54',
        green: '#59B86B',
        blue: '#4C8FE8',
        yellow: '#E8B93A',
    },
};

const PAD_IDS = ['red', 'green', 'blue', 'yellow'] as const;
type PadId = (typeof PAD_IDS)[number];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function MemoryChallenge({ visible, onClose, colors }: MemoryChallengeProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [sequence, setSequence] = useState<PadId[]>([]);
    const [userSequence, setUserSequence] = useState<PadId[]>([]);
    const [gameState, setGameState] = useState<'start' | 'showing' | 'input' | 'won' | 'lost'>('start');
    const [round, setRound] = useState(1);

    const opacities = {
        red: useSharedValue(1),
        green: useSharedValue(1),
        blue: useSharedValue(1),
        yellow: useSharedValue(1),
    };

    const borderWidths = {
        red: useSharedValue(2),
        green: useSharedValue(2),
        blue: useSharedValue(2),
        yellow: useSharedValue(2),
    };

    const padColors = isDark ? PAD_COLORS.dark : PAD_COLORS.light;
    const boardBackground = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
    const boardBorder = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)';
    const padBorderColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.22)';

    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetPadStyles = () => {
        Object.values(opacities).forEach((value) => {
            value.value = 1;
        });
        Object.values(borderWidths).forEach((value) => {
            value.value = 2;
        });
    };

    const resetGame = () => {
        setSequence([]);
        setUserSequence([]);
        setRound(1);
        setGameState('start');
        resetPadStyles();
    };

    const pickRandomPad = (): PadId => {
        const index = Math.floor(Math.random() * PAD_IDS.length);
        return PAD_IDS[index];
    };

    const animatePadFeedback = async (padId: PadId, holdMs = 240) => {
        const opacity = opacities[padId];
        const border = borderWidths[padId];

        opacity.value = 0.16;
        border.value = withTiming(8, { duration: 80 });

        await new Promise((r) => setTimeout(r, holdMs));

        opacity.value = withTiming(1, { duration: 180 });
        border.value = withTiming(2, { duration: 180 });
    };

    const playSequence = async (seq: PadId[]) => {
        await new Promise((r) => setTimeout(r, 500));

        for (let i = 0; i < seq.length; i++) {
            const padId = seq[i];
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await animatePadFeedback(padId, 230);
            await new Promise((r) => setTimeout(r, 200));
        }

        setGameState('input');
    };

    const startGame = () => {
        const firstPad = pickRandomPad();
        const newSequence: PadId[] = [firstPad];

        setSequence(newSequence);
        setUserSequence([]);
        setRound(1);
        setGameState('showing');
        playSequence(newSequence);
    };

    const generateNextRound = () => {
        setSequence((prevSequence) => {
            const newPad = pickRandomPad();
            const newSequence = [...prevSequence, newPad];
            setUserSequence([]);
            setGameState('showing');
            playSequence(newSequence);
            return newSequence;
        });
    };

    const endGame = (won: boolean) => {
        setGameState(won ? 'won' : 'lost');
        Haptics.notificationAsync(
            won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
        );
    };

    const handleInput = (padId: PadId) => {
        if (gameState !== 'input') return;

        animatePadFeedback(padId, 260);
        Haptics.selectionAsync();

        const newUserSequence = [...userSequence, padId];
        setUserSequence(newUserSequence);

        const currentIndex = newUserSequence.length - 1;
        if (newUserSequence[currentIndex] !== sequence[currentIndex]) {
            endGame(false);
            return;
        }

        if (newUserSequence.length === sequence.length) {
            if (newUserSequence.length >= MAX_ROUNDS) {
                endGame(true);
            } else {
                setRound((r) => r + 1);
                setTimeout(() => generateNextRound(), 1000);
            }
        }
    };

    const redStyle = useAnimatedStyle(() => ({
        opacity: opacities.red.value,
        borderWidth: borderWidths.red.value,
    }));
    const greenStyle = useAnimatedStyle(() => ({
        opacity: opacities.green.value,
        borderWidth: borderWidths.green.value,
    }));
    const blueStyle = useAnimatedStyle(() => ({
        opacity: opacities.blue.value,
        borderWidth: borderWidths.blue.value,
    }));
    const yellowStyle = useAnimatedStyle(() => ({
        opacity: opacities.yellow.value,
        borderWidth: borderWidths.yellow.value,
    }));

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

                    <View style={[styles.gameBoard, { backgroundColor: boardBackground, borderColor: boardBorder }]}>
                        <View style={styles.row}>
                            <AnimatedTouchableOpacity
                                style={[
                                    styles.simonBtn,
                                    { backgroundColor: padColors.red, borderColor: padBorderColor },
                                    redStyle,
                                ]}
                                onPress={() => handleInput('red')}
                                activeOpacity={1}
                            />
                            <AnimatedTouchableOpacity
                                style={[
                                    styles.simonBtn,
                                    { backgroundColor: padColors.green, borderColor: padBorderColor },
                                    greenStyle,
                                ]}
                                onPress={() => handleInput('green')}
                                activeOpacity={1}
                            />
                        </View>

                        <View style={styles.row}>
                            <AnimatedTouchableOpacity
                                style={[
                                    styles.simonBtn,
                                    { backgroundColor: padColors.blue, borderColor: padBorderColor },
                                    blueStyle,
                                ]}
                                onPress={() => handleInput('blue')}
                                activeOpacity={1}
                            />
                            <AnimatedTouchableOpacity
                                style={[
                                    styles.simonBtn,
                                    { backgroundColor: padColors.yellow, borderColor: padBorderColor },
                                    yellowStyle,
                                ]}
                                onPress={() => handleInput('yellow')}
                                activeOpacity={1}
                            />
                        </View>

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

                    {(gameState === 'start' || gameState === 'won' || gameState === 'lost') && (
                        <View style={styles.menuOverlay}>
                            {gameState === 'start' && (
                                <>
                                    <Text style={[styles.introText, { color: colors.text }]}>Repite la secuencia de colores.</Text>
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
        minHeight: 500,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    gameBoard: {
        width: 300,
        height: 300,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
        borderRadius: 28,
        borderWidth: 1,
        padding: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 15,
    },
    simonBtn: {
        width: 130,
        height: 130,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    centerStatus: {
        position: 'absolute',
        top: '40%',
        left: '30%',
        right: '30%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
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
        padding: 20,
    },
    introText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
        color: 'white',
    },
    playButton: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    resultTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    resultDesc: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
        color: 'white',
    },
});
