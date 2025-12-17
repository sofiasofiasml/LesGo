import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation, useDerivedValue, runOnJS } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const BAR_WIDTH = width * 0.8;
const CURSOR_SIZE = 20;

interface StopTheBusProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function StopTheBus({ visible, onClose, colors }: StopTheBusProps) {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
    const [resultDistance, setResultDistance] = useState(0);

    // 0 to 1
    const progress = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetGame = () => {
        setGameState('start');
        progress.value = 0;
        setResultDistance(0);
    };

    const startGame = () => {
        setGameState('playing');

        // Move Back and Forth
        progress.value = withRepeat(
            withTiming(1, { duration: 800, easing: Easing.linear }),
            -1, // Infinite
            true // Reverse
        );
    };

    const stop = () => {
        if (gameState !== 'playing') return;

        // Stop animation
        const currentPos = progress.value;
        cancelAnimation(progress);

        // Calculate result
        // Target is center (0.5). Zone width is approx 0.15 (0.425 - 0.575)
        const target = 0.5;
        const tolerance = 0.08; // +/- 8% is the "Green Zone"

        const dist = Math.abs(currentPos - target);
        setResultDistance(dist);

        if (dist <= tolerance) {
            endGame(true);
        } else {
            endGame(false);
        }
    };

    const endGame = (won: boolean) => {
        setGameState(won ? 'won' : 'lost');
        Haptics.notificationAsync(won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    };

    const cursorStyle = useAnimatedStyle(() => {
        return {
            left: progress.value * (BAR_WIDTH - CURSOR_SIZE)
        };
    });

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>PARADA EN SECO 🛑</Text>
                        <TouchableOpacity onPress={() => onClose(gameState === 'won')}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ color: colors.text, marginBottom: 30, textAlign: 'center' }}>
                        {gameState === 'start' ? 'Detén la barra en la zona VERDE.' :
                            gameState === 'playing' ? '¡AHORA!' :
                                gameState === 'won' ? '¡PERFECTO!' : '¡FAIL!'}
                    </Text>

                    {/* BAR CONTAINER */}
                    <View style={styles.barContainer}>
                        {/* Background Bar */}
                        <View style={styles.barBackground} />

                        {/* Target Zone */}
                        <View style={styles.targetZone} />

                        {/* Cursor */}
                        <Animated.View style={[styles.cursor, cursorStyle]} />
                    </View>

                    {/* CONTROLS */}
                    <View style={styles.controls}>
                        {gameState === 'start' && (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.purple }]}
                                onPress={startGame}
                            >
                                <Text style={styles.buttonText}>EMPEZAR</Text>
                            </TouchableOpacity>
                        )}

                        {gameState === 'playing' && (
                            <TouchableOpacity
                                style={[styles.stopButton]}
                                onPress={stop}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.stopButtonText}>STOP!</Text>
                            </TouchableOpacity>
                        )}

                        {(gameState === 'won' || gameState === 'lost') && (
                            <View style={{ alignItems: 'center' }}>
                                <Text style={[styles.resultText, { color: gameState === 'won' ? '#4CD964' : '#FF3B30' }]}>
                                    {gameState === 'won' ? '¡QUÉ PUNTERÍA!' : '¡TE PASASTE!'}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.orange, marginTop: 10 }]}
                                    onPress={() => onClose(gameState === 'won')}
                                >
                                    <Text style={styles.buttonText}>CONTINUAR</Text>
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
        width: '95%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        minHeight: 400
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
    barContainer: {
        width: BAR_WIDTH,
        height: 40,
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 50
    },
    barBackground: {
        width: '100%',
        height: 10,
        backgroundColor: '#333',
        borderRadius: 5
    },
    targetZone: {
        position: 'absolute',
        top: 10,
        left: '42%',
        width: '16%',
        height: 20,
        backgroundColor: '#4CD964', // Green
        borderRadius: 2,
        opacity: 0.6
    },
    cursor: {
        position: 'absolute',
        top: 0,
        width: CURSOR_SIZE,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#999'
    },
    controls: {
        alignItems: 'center',
        width: '100%'
    },
    button: {
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
    stopButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'white',
        elevation: 10
    },
    stopButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold'
    },
    resultText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15
    }
});
