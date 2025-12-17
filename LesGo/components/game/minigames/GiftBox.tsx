import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, Easing, runOnJS } from 'react-native-reanimated';

interface GiftBoxProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function GiftBox({ visible, onClose, colors }: GiftBoxProps) {
    const [gameState, setGameState] = useState<'start' | 'opening' | 'won' | 'lost'>('start');

    // Animation shared values
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const shakeX = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetGame = () => {
        setGameState('start');
        scale.value = 1;
        rotation.value = 0;
        shakeX.value = 0;
    };

    const openBox = () => {
        if (gameState !== 'start') return;
        setGameState('opening');
        Haptics.selectionAsync();

        // Shake Animation
        shakeX.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );

        // Delayed Open
        setTimeout(() => {
            const isWin = Math.random() > 0.5;

            // Pop open
            scale.value = withSpring(1.2, {}, () => {
                // Determine result
                runOnJS(finalizeResult)(isWin);
            });

        }, 1000); // 1 sec of tension
    };

    const finalizeResult = (won: boolean) => {
        setGameState(won ? 'won' : 'lost');
        Haptics.notificationAsync(won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    };

    const boxStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { translateX: shakeX.value },
                { rotate: `${rotation.value}deg` }
            ]
        };
    });

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>CAJA SORPRESA 🎁</Text>
                        <TouchableOpacity onPress={() => onClose(gameState === 'won')}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ color: colors.text, marginBottom: 30, textAlign: 'center', fontSize: 16 }}>
                        50% Premio / 50% Castigo
                    </Text>

                    <View style={styles.gameArea}>
                        {(gameState === 'start' || gameState === 'opening') && (
                            <TouchableOpacity onPress={openBox} activeOpacity={0.9}>
                                <Animated.View style={[styles.box, boxStyle]}>
                                    <FontAwesome name="gift" size={120} color={colors.pink} />
                                    {gameState === 'opening' && (
                                        <Text style={styles.openingText}>...</Text>
                                    )}
                                </Animated.View>
                            </TouchableOpacity>
                        )}

                        {gameState === 'won' && (
                            <View style={styles.resultContainer}>
                                <FontAwesome name="diamond" size={100} color="#4CD964" />
                                <Text style={[styles.resultTitle, { color: '#4CD964' }]}>¡PREMIO!</Text>
                                <Text style={[styles.resultDesc, { color: colors.text }]}>
                                    Repartes 5 tragos a quien quieras.
                                </Text>
                            </View>
                        )}

                        {gameState === 'lost' && (
                            <View style={styles.resultContainer}>
                                <FontAwesome name="bomb" size={100} color="#FF3B30" />
                                <Text style={[styles.resultTitle, { color: '#FF3B30' }]}>¡BOMBA!</Text>
                                <Text style={[styles.resultDesc, { color: colors.text }]}>
                                    Te explota en la cara. Fondo blanco.
                                </Text>
                            </View>
                        )}
                    </View>

                    {(gameState === 'won' || gameState === 'lost') && (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: gameState === 'won' ? colors.pink : colors.orange }]}
                            onPress={() => onClose(gameState === 'won')}
                        >
                            <Text style={styles.buttonText}>CONTINUAR</Text>
                        </TouchableOpacity>
                    )}

                    {gameState === 'start' && (
                        <Text style={{ marginTop: 20, opacity: 0.6, color: colors.text }}>Toca la caja para abrirla</Text>
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
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: 250
    },
    box: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    openingText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10
    },
    resultContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    resultTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10
    },
    resultDesc: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20
    },
    button: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5,
        marginTop: 20
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    }
});
