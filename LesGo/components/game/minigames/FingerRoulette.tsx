import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, PanResponder } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface FingerRouletteProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

interface TouchPoint {
    id: string;
    x: number;
    y: number;
    color: string;
}

const FINGER_COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FFC107', '#FF5722'];

export default function FingerRoulette({ visible, onClose, colors }: FingerRouletteProps) {
    const [touches, setTouches] = useState<TouchPoint[]>([]);
    const touchesRef = useRef<TouchPoint[]>([]); // Synced ref for immediate access
    const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'choosing' | 'result'>('waiting');
    const gameStateRef = useRef<'waiting' | 'countdown' | 'choosing' | 'result'>('waiting'); // Ref to avoid stale closures in PanResponder

    // GUARD: Prevent double triggering (race between timer and manual close)
    const isClosingRef = useRef(false);

    const [message, setMessage] = useState('Poned un dedo en la pantalla');
    const [rouletteAnim, setRouletteAnim] = useState<string | null>(null);
    const [loserId, setLoserId] = useState<string | null>(null);

    // Use refs for logic that doesn't need immediate render updates or to avoid stale closures in timeouts
    const timerRef = useRef<any>(null);

    // Sync Ref with State on every render
    gameStateRef.current = gameState;

    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetGame = () => {
        setTouches([]);
        touchesRef.current = [];
        setGameState('waiting');
        gameStateRef.current = 'waiting';
        setMessage('Poned un dedo en la pantalla');
        setLoserId(null);
        setRouletteAnim(null);
        clearTimeout(timerRef.current);
        isClosingRef.current = false; // Reset lock
    };

    const safeClose = (success: boolean) => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        clearTimeout(timerRef.current);
        onClose(success);
    };

    // Since React Native Web / Expo Go standard View may handle touches differently,
    // we use onTouchStart/Move/End props on full screen view.

    const handleTouch = (event: any) => {
        const currentState = gameStateRef.current;
        if (currentState === 'result' || currentState === 'choosing') return;

        const activeTouches = event.nativeEvent.touches;
        const newTouches: TouchPoint[] = [];

        for (let i = 0; i < activeTouches.length; i++) {
            const t = activeTouches[i];
            const colorIndex = parseInt(t.identifier) % FINGER_COLORS.length;
            newTouches.push({
                id: t.identifier,
                x: t.pageX,
                y: t.pageY,
                color: FINGER_COLORS[Math.abs(colorIndex)] || colors.pink
            });
        }

        setTouches(newTouches);
        touchesRef.current = newTouches;

        // Logic
        if (currentState === 'waiting') {
            if (newTouches.length >= 1) {
                startCountdown();
            }
        } else if (currentState === 'countdown') {
            if (newTouches.length === 0) {
                cancelCountdown();
            }
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => handleTouch(evt),
            onPanResponderMove: (evt) => handleTouch(evt),
            onPanResponderRelease: (evt) => handleTouch(evt),
            onPanResponderTerminate: (evt) => handleTouch(evt),
            onPanResponderTerminationRequest: () => false, // Prevent simple steals
        })
    ).current;

    const startCountdown = () => {
        // Prevent double start
        if (gameStateRef.current === 'countdown') return; // Double safety

        setGameState('countdown');
        gameStateRef.current = 'countdown'; // Immediate Block

        setMessage('¡ENTRAD TODOS!\n5');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Clear any existing
        if (timerRef.current) clearInterval(timerRef.current);

        let count = 5;
        timerRef.current = setInterval(() => {
            count--;
            if (count > 0) {
                setMessage(`¡ENTRAD TODOS!\n${count}`);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
                clearInterval(timerRef.current);
                chooseLoser();
            }
        }, 1000);
    };

    const cancelCountdown = () => {
        clearInterval(timerRef.current);
        setGameState('waiting');
        gameStateRef.current = 'waiting'; // Immediate Release
        setMessage('¿DÓNDE VAIS?\nToque para empezar');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    };

    const chooseLoser = () => {
        setGameState('choosing');
        setMessage('¡SORTEANDO!');

        // Safety timeout in case of weird freeze
        setTimeout(() => {
            // check if still choosing after 5s?
        }, 5000);

        let cycles = 0;
        const maxCycles = 20; // 2 seconds approx

        const currentTouches = touchesRef.current; // Grab latest sync touches

        if (currentTouches.length < 2) {
            // Should not happen theoretically if countdown passed, but race condition protection
            setGameState('waiting');
            setMessage('Error: Faltan dedos');
            return;
        }

        timerRef.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * currentTouches.length);
            const selected = currentTouches[randomIndex];

            setRouletteAnim(selected.id); // Visual highlight
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            cycles++;
            if (cycles >= maxCycles) {
                clearInterval(timerRef.current);
                setLoserId(selected.id);
                setGameState('result');
                setMessage('¡TU PIERDES!');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

                // Auto-close after 5 seconds
                timerRef.current = setTimeout(() => {
                    safeClose(false);
                }, 5000);
            }
        }, 100);
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
                {/* 1. TOUCH LAYER (Bottom) - Captures fingers only */}
                <View
                    style={StyleSheet.absoluteFill}
                    {...panResponder.panHandlers}
                >
                    {touches.map(t => (
                        <View key={t.id} style={[
                            styles.finger,
                            {
                                left: t.x - 40,
                                top: t.y - 40,
                                borderColor: t.color,
                                backgroundColor: ((gameState === 'result' && loserId === t.id) || (gameState === 'choosing' && rouletteAnim === t.id)) ? t.color : 'transparent',
                                transform: [{ scale: ((gameState === 'result' && loserId === t.id) || (gameState === 'choosing' && rouletteAnim === t.id)) ? 1.5 : 1 }]
                            }
                        ]}>
                            <View style={[styles.fingerInner, { backgroundColor: t.color }]} />
                            {gameState === 'result' && loserId === t.id && (
                                <MaterialCommunityIcons name="skull" size={40} color="white" />
                            )}
                        </View>
                    ))}

                    {gameState === 'waiting' && touches.length === 0 && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="gesture-tap-hold" size={60} color={colors.text} style={{ opacity: 0.5 }} />
                        </View>
                    )}
                </View>

                {/* 2. UI LAYER (Top) - Allows clicks on buttons, passes touches elsewhere */}
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center' }]} pointerEvents="box-none">
                    <Text style={[styles.title, { color: colors.text, marginTop: 50 }]}>
                        RULETA DE DEDOS
                    </Text>

                    <TouchableOpacity
                        onPress={() => safeClose(false)}
                        style={{ position: 'absolute', top: 50, right: 30, zIndex: 10 }}
                    >
                        <FontAwesome name="close" size={30} color={colors.text} />
                    </TouchableOpacity>

                    <Text style={[styles.message, { color: colors.text }]}>
                        {message}
                    </Text>

                    {gameState === 'result' && (() => {
                        const loserTouch = touches.find(t => t.id === loserId);
                        const isLoserBottom = loserTouch ? loserTouch.y > (Dimensions.get('window').height / 2) : false;

                        return (
                            <View style={[
                                styles.resultModal,
                                {
                                    backgroundColor: colors.modalBackground,
                                    borderColor: colors.pink,
                                    // If loser is at bottom, show at top. If at top, show at bottom.
                                    top: isLoserBottom ? 120 : undefined,
                                    bottom: isLoserBottom ? undefined : 80,
                                }
                            ]}>
                                <Text style={[styles.resultText, { color: colors.text }]}>¡HAS PERDIDO!</Text>
                                <Text style={[styles.subText, { color: colors.text }]}>Te toca beber 2 tragos</Text>
                                <TouchableOpacity style={[styles.button, { backgroundColor: '#F44336' }]} onPress={() => safeClose(false)}>
                                    <Text style={styles.buttonText}>ACEPTAR</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })()}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        pointerEvents: 'none', // Allow touches through text
    },
    message: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        pointerEvents: 'none',
    },
    finger: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fingerInner: {
        width: 20,
        height: 20,
        borderRadius: 10,
        opacity: 0.8,
        position: 'absolute',
    },
    resultModal: {
        position: 'absolute',
        bottom: 50,
        width: '80%',
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        elevation: 10,
        backgroundColor: 'white' // Default
    },
    resultText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subText: {
        fontSize: 18,
        marginBottom: 20,
    },
    button: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    }
});
