import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface TugOfWarProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function TugOfWar({ visible, onClose, colors }: TugOfWarProps) {
    const [progress, setProgress] = useState(50); // 0 = Player Top Wins, 100 = Player Bottom Wins
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won_top' | 'won_bottom' | 'timeout'>('start');
    const [timeLeft, setTimeLeft] = useState(15);

    // Animation shared value for the rope indicator
    const indicatorPos = useSharedValue(0);

    const intervalRef = useRef<any>(null);

    useEffect(() => {
        if (visible) {
            resetGame();
        }
        return () => clearInterval(intervalRef.current);
    }, [visible]);

    const resetGame = () => {
        setProgress(50);
        setGameState('start');
        setTimeLeft(15);
        indicatorPos.value = 0;
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const startGame = () => {
        if (gameState !== 'start') return;
        setGameState('playing');
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame('timeout');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleTap = (player: 'top' | 'bottom') => {
        if (gameState === 'start') {
            startGame();
        }

        if (gameState === 'playing' || gameState === 'start') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Adjust progress
            // Top player pushes DOWN (towards 100? No, usually pull towards self).
            // Let's say Top pulls towards 0, Bottom pulls towards 100.
            // visual: 0 (Top wins), 100 (Bottom wins).

            let change = 4; // Difficulty factor
            if (player === 'top') {
                change = -change;
            } else {
                change = change;
            }

            setProgress((prev) => {
                const newVal = prev + change;
                if (newVal <= 0) {
                    endGame('won_top');
                    return 0;
                }
                if (newVal >= 100) {
                    endGame('won_bottom');
                    return 100;
                }
                return newVal;
            });
        }
    };

    const endGame = (result: 'won_top' | 'won_bottom' | 'timeout') => {
        clearInterval(intervalRef.current);
        setGameState(result);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    // Derived values for styling
    // Map progress 0-100 to vertical position? 
    // Let center be 0. 0-> -Height/2, 100-> +Height/2
    // Simplified: Just use a bar height or position.

    const topHeight = `${100 - progress}%`;
    const bottomHeight = `${progress}%`;

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                {/* Game Container */}
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>

                    {/* Header / Info (Rotated for top player maybe?) */}
                    {gameState === 'start' && (
                        <View style={styles.startOverlay}>
                            <Text style={[styles.startText, { color: colors.text }]}>¡TAP RAPIDO!</Text>
                            <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.pink }]} onPress={startGame}>
                                <Text style={styles.startButtonText}>GO!</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Arena */}
                    <View style={styles.arena}>
                        {/* Top Player Zone */}
                        <TouchableOpacity
                            style={[styles.playerZone, { backgroundColor: '#FF3B30', height: topHeight as any }]}
                            activeOpacity={0.8}
                            onPress={() => handleTap('top')}
                        >
                            <View style={styles.playerLabelContainer}>
                                <Text style={styles.playerLabel}>ROJO</Text>
                                {gameState === 'won_top' && <Text style={styles.winLabel}>🏆 WINNER</Text>}
                            </View>
                        </TouchableOpacity>

                        {/* Center Line / Rope Indicator */}
                        <View style={styles.centerLine}>
                            <View style={styles.ropeKnot} />
                        </View>

                        {/* Bottom Player Zone */}
                        <TouchableOpacity
                            style={[styles.playerZone, { backgroundColor: '#007AFF', height: bottomHeight as any }]}
                            activeOpacity={0.8}
                            onPress={() => handleTap('bottom')}
                        >
                            <View style={styles.playerLabelContainer}>
                                <Text style={styles.playerLabel}>AZUL</Text>
                                {gameState === 'won_bottom' && <Text style={styles.winLabel}>🏆 WINNER</Text>}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Timer */}
                    <View style={styles.timerBadge}>
                        <Text style={styles.timerText}>{timeLeft}s</Text>
                    </View>

                    {/* Exit / Result Controls */}
                    {(gameState === 'won_top' || gameState === 'won_bottom' || gameState === 'timeout') && (
                        <View style={styles.resultOverlay}>
                            <Text style={styles.resultTitle}>
                                {gameState === 'timeout' ? '¡EMPATE!' : (gameState === 'won_top' ? '¡ROJO GANA!' : '¡AZUL GANA!')}
                            </Text>
                            <Text style={styles.resultSubtitle}>
                                {gameState === 'timeout' ? 'Ambos beben.' : 'El perdedor bebe 2 tragos.'}
                            </Text>
                            <TouchableOpacity
                                style={[styles.closeButton, { backgroundColor: colors.purple }]}
                                onPress={() => onClose(true)}
                            >
                                <Text style={styles.closeButtonText}>CONTINUAR</Text>
                            </TouchableOpacity>
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
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    arena: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
    },
    playerZone: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    playerLabelContainer: {
        alignItems: 'center',
        transform: [{ rotate: '0deg' }] // Could rotate top logic if needed
    },
    playerLabel: {
        fontSize: 40,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: 2
    },
    winLabel: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 10,
        textShadowColor: 'black',
        textShadowRadius: 10
    },
    centerLine: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'white',
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    ropeKnot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'white',
        borderWidth: 4,
        borderColor: '#333'
    },
    startOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    startText: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white',
        textShadowColor: 'black',
        textShadowRadius: 10
    },
    startButton: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 10
    },
    startButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold'
    },
    timerBadge: {
        position: 'absolute',
        right: 20,
        top: '50%',
        marginTop: -20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 20,
        zIndex: 15
    },
    timerText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    resultOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 30
    },
    resultTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'center'
    },
    resultSubtitle: {
        fontSize: 20,
        color: 'white',
        marginBottom: 30,
        textAlign: 'center'
    },
    closeButton: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30
    },
    closeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
