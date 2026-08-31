import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 50;
const ZONE_SIZE = 200;
const ZONE_RADIUS = ZONE_SIZE / 2;
const BALL_RADIUS = BALL_SIZE / 2;

// Motion tuning for stronger phone movement detection
const SENSOR_INTERVAL_MS = 16;
const BASE_SENSITIVITY = 58;
const INPUT_DEADZONE = 0.015;
const INPUT_BOOST = 1.9;

interface BalanceChallengeProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function BalanceChallenge({ visible, onClose, colors }: BalanceChallengeProps) {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
    const [timeLeft, setTimeLeft] = useState(10);
    const [data, setData] = useState({ x: 0, y: 0, z: 0 });
    const subscription = useRef<any>(null);
    const intervalRef = useRef<any>(null);

    // Animated values for smooth ball movement
    const ballX = useSharedValue(0);
    const ballY = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            resetGame();
        } else {
            stopSensors();
        }
        return () => {
            stopSensors();
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [visible]);

    const stopSensors = () => {
        subscription.current && subscription.current.remove();
        subscription.current = null;
    };

    const resetGame = () => {
        setGameState('start');
        setTimeLeft(10);
        ballX.value = 0;
        ballY.value = 0;
        setData({ x: 0, y: 0, z: 0 });
    };

    const startGame = () => {
        setGameState('playing');
        Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
        subscription.current = Accelerometer.addListener(accelerometerData => {
            setData(accelerometerData);
            updateBallPosition(accelerometerData);
        });

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const normalizeTilt = (value: number) => {
        const absValue = Math.abs(value);
        if (absValue <= INPUT_DEADZONE) return 0;

        const normalized = (absValue - INPUT_DEADZONE) / (1 - INPUT_DEADZONE);
        const boosted = Math.pow(normalized, 0.85) * INPUT_BOOST;
        return Math.sign(value) * boosted;
    };

    const updateBallPosition = ({ x, y }: { x: number, y: number }) => {
        const responsiveX = normalizeTilt(x);
        const responsiveY = normalizeTilt(y);

        let newX = ballX.value - (responsiveX * BASE_SENSITIVITY);
        let newY = ballY.value + (responsiveY * BASE_SENSITIVITY);

        // Clamping relative to Center (0,0)
        // Arena is limited? Let's say screen width.
        const LIMIT = width / 2 - BALL_RADIUS;

        if (newX > LIMIT) newX = LIMIT;
        if (newX < -LIMIT) newX = -LIMIT;
        if (newY > LIMIT) newY = LIMIT;
        if (newY < -LIMIT) newY = -LIMIT;

        ballX.value = newX;
        ballY.value = newY;

        checkCollision(newX, newY);
    };

    const checkCollision = (x: number, y: number) => {
        // Distance from center
        const distance = Math.sqrt(x * x + y * y);

        // Allowed Zone Radius vs Ball Position
        // If Ball Center distance > Zone Radius - Ball Radius, it touches edge?
        // Let's be lenient. If Distance > Zone Radius, text failed.

        if (distance > (ZONE_RADIUS)) {
            endGame(false);
        }
    };

    const endGame = (won: boolean) => {
        stopSensors();
        if (intervalRef.current) clearInterval(intervalRef.current);
        setGameState(won ? 'won' : 'lost');
        if (won) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const ballStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: ballX.value },
                { translateY: ballY.value }
            ]
        };
    });

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>

                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {gameState === 'playing' ? '¡MANTÉN EL EQUILIBRIO!' : 'EL EQUILIBRISTA'}
                        </Text>
                        <TouchableOpacity onPress={() => onClose(gameState === 'won')}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Game Layout */}
                    <View style={styles.gameArea}>
                        {/* Safe Zone */}
                        <View style={[styles.zone, { borderColor: colors.text, width: ZONE_SIZE, height: ZONE_SIZE, borderRadius: ZONE_RADIUS }]}>
                            <View style={[styles.innerZone, { backgroundColor: colors.accentGradient }]} />
                        </View>

                        {/* Ball */}
                        <Animated.View style={[styles.ball, { backgroundColor: colors.pink, width: BALL_SIZE, height: BALL_SIZE, borderRadius: BALL_RADIUS }, ballStyle]}>
                            <View style={styles.ballReflection} />
                        </Animated.View>
                    </View>

                    {/* Footer Info */}
                    <View style={styles.footer}>
                        {gameState === 'start' && (
                            <TouchableOpacity style={[styles.button, { backgroundColor: colors.purple }]} onPress={startGame}>
                                <Text style={styles.buttonText}>EMPEZAR</Text>
                            </TouchableOpacity>
                        )}

                        {gameState === 'playing' && (
                            <Text style={[styles.timer, { color: colors.text }]}>{timeLeft}s</Text>
                        )}

                        {(gameState === 'won' || gameState === 'lost') && (
                            <View style={styles.resultContainer}>
                                <Text style={[styles.resultTitle, { color: gameState === 'won' ? '#4CD964' : '#FF3B30' }]}>
                                    {gameState === 'won' ? '¡PULSO DE ACERO!' : '¡SE CAYÓ!'}
                                </Text>
                                <Text style={[styles.resultDesc, { color: colors.text }]}>
                                    {gameState === 'won' ? 'Repartes 3 tragos.' : 'Bebes 2 tragos.'}
                                </Text>
                                <TouchableOpacity style={[styles.button, { backgroundColor: colors.purple }]} onPress={() => onClose(gameState === 'won')}>
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
        width: '90%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        minHeight: 500
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold'
    },
    gameArea: {
        width: 300,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative'
    },
    zone: {
        borderWidth: 4,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute'
    },
    innerZone: {
        width: '100%',
        height: '100%',
        borderRadius: 999,
        opacity: 0.5
    },
    ball: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10
    },
    ballReflection: {
        width: 10,
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 5,
        position: 'absolute',
        top: 10,
        left: 10
    },
    footer: {
        width: '100%',
        alignItems: 'center',
        minHeight: 100,
        justifyContent: 'center'
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
    timer: {
        fontSize: 48,
        fontWeight: 'bold'
    },
    resultContainer: {
        alignItems: 'center'
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10
    },
    resultDesc: {
        fontSize: 16,
        marginBottom: 20
    }
});
