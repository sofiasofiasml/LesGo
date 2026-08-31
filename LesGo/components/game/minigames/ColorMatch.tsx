import { Text } from '@/components/Themed';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface ColorMatchProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

type GameState = 'start' | 'playing' | 'won' | 'lost';

type Option = {
    id: string;
    label: string;
    hex: string;
};

const COLOR_OPTIONS: Option[] = [
    { id: 'pink', label: 'ROSA', hex: '#E91E8C' },
    { id: 'blue', label: 'AZUL', hex: '#2196F3' },
    { id: 'green', label: 'VERDE', hex: '#4CAF50' },
    { id: 'orange', label: 'NARANJA', hex: '#FF9800' },
];

const TARGET_ROUNDS = 7;
const TIME_LIMIT_SECONDS = 10;

type Target = {
    word: Option;
    ink: Option;
};

export default function ColorMatch({ visible, onClose, colors }: ColorMatchProps) {
    const { width, height } = useWindowDimensions();
    const isCompact = height < 760 || width < 370;
    const titleSize = isCompact ? 22 : 26;
    const statSize = isCompact ? 13 : 15;
    const targetLabelSize = isCompact ? 28 : 34;
    const colorButtonMinHeight = isCompact ? 72 : 86;
    const colorButtonLabelSize = isCompact ? 15 : 18;
    const resultSize = isCompact ? 22 : 28;

    const [gameState, setGameState] = useState<GameState>('start');
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
    const [score, setScore] = useState(0);
    const [target, setTarget] = useState<Target>({
        word: COLOR_OPTIONS[0],
        ink: COLOR_OPTIONS[1],
    });
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const progressLabel = useMemo(() => `${score}/${TARGET_ROUNDS}`, [score]);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const pickRandomTarget = () => {
        const wordIndex = Math.floor(Math.random() * COLOR_OPTIONS.length);
        let inkIndex = Math.floor(Math.random() * COLOR_OPTIONS.length);

        // Force Stroop conflict: text meaning and ink color are never the same.
        while (inkIndex === wordIndex) {
            inkIndex = Math.floor(Math.random() * COLOR_OPTIONS.length);
        }

        setTarget({
            word: COLOR_OPTIONS[wordIndex],
            ink: COLOR_OPTIONS[inkIndex],
        });
    };

    const resetGame = () => {
        clearTimer();
        setGameState('start');
        setTimeLeft(TIME_LIMIT_SECONDS);
        setScore(0);
        pickRandomTarget();
    };

    useEffect(() => {
        if (visible) {
            resetGame();
        } else {
            clearTimer();
        }

        return () => clearTimer();
    }, [visible]);

    const startGame = () => {
        setGameState('playing');
        clearTimer();

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearTimer();
                    setGameState('lost');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const onPickColor = (picked: Option) => {
        if (gameState === 'start') {
            startGame();
        }

        if (gameState !== 'start' && gameState !== 'playing') return;

        const isCorrect = picked.id === target.ink.id;
        if (!isCorrect) {
            clearTimer();
            setGameState('lost');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        setScore((prev) => {
            const next = prev + 1;
            if (next >= TARGET_ROUNDS) {
                clearTimer();
                setGameState('won');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                pickRandomTarget();
            }
            return next;
        });
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor: colors.modalBackground,
                            width: Math.min(width * 0.92, 460),
                            maxHeight: Math.min(height * 0.9, 620),
                            padding: isCompact ? 14 : 20,
                        }
                    ]}
                >
                    <Text style={[styles.title, { color: colors.text, fontSize: titleSize }]} numberOfLines={1} adjustsFontSizeToFit>
                        COLOR MATCH
                    </Text>

                    <View style={styles.statsRow}>
                        <Text style={[styles.stat, { color: colors.text, fontSize: statSize }]} numberOfLines={1} adjustsFontSizeToFit>
                            TIEMPO: {timeLeft}s
                        </Text>
                        <Text style={[styles.stat, { color: colors.text, fontSize: statSize }]} numberOfLines={1} adjustsFontSizeToFit>
                            RONDAS: {progressLabel}
                        </Text>
                    </View>

                    <View style={styles.targetWrap}>
                        <Text style={[styles.targetHint, { color: colors.text, fontSize: statSize }]}>Pulsa el color de la tinta (no la palabra):</Text>
                        <Text
                            style={[styles.targetText, { color: target.ink.hex, fontSize: targetLabelSize }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {target.word.label}
                        </Text>
                    </View>

                    <View style={styles.grid}>
                        {COLOR_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.colorButton, { backgroundColor: option.hex, minHeight: colorButtonMinHeight }]}
                                activeOpacity={0.85}
                                onPress={() => onPickColor(option)}
                            >
                                <Text style={[styles.colorButtonText, { fontSize: colorButtonLabelSize }]} numberOfLines={1} adjustsFontSizeToFit>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {(gameState === 'won' || gameState === 'lost') && (
                        <View style={styles.resultWrap}>
                            <Text
                                style={[
                                    styles.resultText,
                                    { color: gameState === 'won' ? '#4CD964' : '#FF3B30', fontSize: resultSize },
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {gameState === 'won' ? 'GANASTE' : 'PERDISTE'}
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.continueButton,
                                    { backgroundColor: gameState === 'won' ? colors.pink : colors.orange },
                                ]}
                                onPress={() => onClose(gameState === 'won')}
                            >
                                <Text style={styles.continueText}>CONTINUAR</Text>
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
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '92%',
        borderRadius: 18,
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    stat: {
        fontSize: 15,
        fontWeight: '700',
    },
    targetWrap: {
        alignItems: 'center',
        marginBottom: 16,
    },
    targetHint: {
        fontSize: 15,
        opacity: 0.85,
    },
    targetText: {
        fontSize: 34,
        fontWeight: '900',
        marginTop: 2,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    colorButton: {
        width: '48%',
        minHeight: 86,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    resultWrap: {
        marginTop: 18,
        alignItems: 'center',
    },
    resultText: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 12,
    },
    continueButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 24,
    },
    continueText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
