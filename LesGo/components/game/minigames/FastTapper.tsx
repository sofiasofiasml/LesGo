import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface FastTapperProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function FastTapper({ visible, onClose, colors }: FastTapperProps) {
    const TARGET_TAPS = 30;
    const TIME_LIMIT = 5; // seconds

    const [taps, setTaps] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');

    const intervalRef = useRef<any>(null);
    const scale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetGame = () => {
        setTaps(0);
        setTimeLeft(TIME_LIMIT);
        setGameState('start');
        scale.value = 1;
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const startGame = () => {
        setGameState('playing');
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0.1) { // Float precision safety
                    endGame(false);
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);
    };

    const handleTap = () => {
        if (gameState === 'start') {
            startGame();
        }

        if (gameState === 'playing' || gameState === 'start') { // Allow first tap to count
            const newTaps = taps + 1;
            setTaps(newTaps);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Animate button
            scale.value = withSequence(
                withSpring(0.9, { damping: 10 }),
                withSpring(1)
            );

            if (newTaps >= TARGET_TAPS) {
                endGame(true);
            }
        }
    };

    const endGame = (won: boolean) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setGameState(won ? 'won' : 'lost');
        Haptics.notificationAsync(won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    };

    const animatedButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>¡MACHACA EL BOTÓN!</Text>
                        <TouchableOpacity onPress={() => onClose(gameState === 'won')}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={[styles.statLabel, { color: colors.text }]}>TIEMPO</Text>
                            <Text style={[styles.statValue, { color: timeLeft < 2 ? '#FF3B30' : colors.text }]}>
                                {Math.max(0, timeLeft).toFixed(1)}s
                            </Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statLabel, { color: colors.text }]}>TOQUES</Text>
                            <Text style={[styles.statValue, { color: colors.orange }]}>
                                {taps} / {TARGET_TAPS}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.gameArea}>
                        {gameState === 'start' && (
                            <Text style={[styles.instruction, { color: colors.text }]}>
                                Toca {TARGET_TAPS} veces en {TIME_LIMIT}s
                            </Text>
                        )}

                        {(gameState === 'start' || gameState === 'playing') && (
                            <Animated.View style={[{ transform: [{ scale: scale }] }]}>
                                <TouchableOpacity
                                    style={[styles.tapButton, { backgroundColor: colors.pink }]}
                                    activeOpacity={0.8}
                                    onPress={handleTap}
                                >
                                    <View style={styles.innerRing} />
                                    <Text style={styles.tapText}>TAP!</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {(gameState === 'won' || gameState === 'lost') && (
                            <View style={styles.resultContainer}>
                                <Text style={[styles.resultTitle, { color: gameState === 'won' ? '#4CD964' : '#FF3B30' }]}>
                                    {gameState === 'won' ? '¡LO LOGRASTE!' : '¡LENTO!'}
                                </Text>
                                <Text style={[styles.resultDesc, { color: colors.text }]}>
                                    {gameState === 'won'
                                        ? 'Tus dedos vuelan. Mandas 3 tragos.'
                                        : 'Te han faltado dedos. Bebe 2 tragos.'}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: colors.purple }]}
                                    onPress={() => onClose(gameState === 'won')}
                                >
                                    <Text style={styles.actionButtonText}>CONTINUAR</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
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
        minHeight: 450
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 30
    },
    statBox: {
        alignItems: 'center'
    },
    statLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        opacity: 0.7
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums']
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: 250
    },
    instruction: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center'
    },
    tapButton: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderWidth: 4,
        borderColor: 'white'
    },
    innerRing: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    tapText: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    resultContainer: {
        alignItems: 'center',
        padding: 20
    },
    resultTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10
    },
    resultDesc: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20
    },
    actionButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});
