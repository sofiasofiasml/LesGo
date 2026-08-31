import { Text } from '@/components/Themed';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface MathSprintProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

type GameState = 'start' | 'playing' | 'won' | 'lost';

type Question = {
    left: number;
    right: number;
    answer: number;
};

const TARGET_CORRECT = 4;
const TIME_LIMIT_SECONDS = 14;

const buildQuestion = (): Question => {
    const left = Math.floor(Math.random() * 9) + 1;
    const right = Math.floor(Math.random() * 9) + 1;
    return {
        left,
        right,
        answer: left + right,
    };
};

const buildOptions = (correctAnswer: number): number[] => {
    const optionSet = new Set<number>([correctAnswer]);

    while (optionSet.size < 4) {
        const candidate = correctAnswer + (Math.floor(Math.random() * 9) - 4);
        if (candidate > 1) {
            optionSet.add(candidate);
        }
    }

    return Array.from(optionSet).sort(() => Math.random() - 0.5);
};

export default function MathSprint({ visible, onClose, colors }: MathSprintProps) {
    const [gameState, setGameState] = useState<GameState>('start');
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
    const [correctCount, setCorrectCount] = useState(0);
    const [question, setQuestion] = useState<Question>(buildQuestion());
    const [options, setOptions] = useState<number[]>(buildOptions(question.answer));

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const progressLabel = useMemo(() => `${correctCount}/${TARGET_CORRECT}`, [correctCount]);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const setupNextQuestion = () => {
        const nextQuestion = buildQuestion();
        setQuestion(nextQuestion);
        setOptions(buildOptions(nextQuestion.answer));
    };

    const resetGame = () => {
        clearTimer();
        setGameState('start');
        setTimeLeft(TIME_LIMIT_SECONDS);
        setCorrectCount(0);
        setupNextQuestion();
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

    const answerQuestion = (picked: number) => {
        if (gameState === 'start') {
            startGame();
        }

        if (gameState !== 'start' && gameState !== 'playing') return;

        const isCorrect = picked === question.answer;
        if (!isCorrect) {
            clearTimer();
            setGameState('lost');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        setCorrectCount((prev) => {
            const next = prev + 1;
            if (next >= TARGET_CORRECT) {
                clearTimer();
                setGameState('won');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                setupNextQuestion();
            }
            return next;
        });
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}> 
                    <Text style={[styles.title, { color: colors.text }]}>MATH SPRINT</Text>

                    <View style={styles.statsRow}>
                        <Text style={[styles.stat, { color: colors.text }]}>TIEMPO: {timeLeft}s</Text>
                        <Text style={[styles.stat, { color: colors.text }]}>ACIERTOS: {progressLabel}</Text>
                    </View>

                    <View style={[styles.questionCard, { backgroundColor: colors.cardBackground }]}> 
                        <Text style={[styles.questionText, { color: colors.text }]}>
                            {question.left} + {question.right} = ?
                        </Text>
                    </View>

                    <View style={styles.optionsGrid}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={`${question.left}-${question.right}-${option}`}
                                style={[styles.optionButton, { backgroundColor: colors.pink }]}
                                activeOpacity={0.85}
                                onPress={() => answerQuestion(option)}
                            >
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {(gameState === 'won' || gameState === 'lost') && (
                        <View style={styles.resultWrap}>
                            <Text
                                style={[
                                    styles.resultText,
                                    { color: gameState === 'won' ? '#4CD964' : '#FF3B30' },
                                ]}
                            >
                                {gameState === 'won' ? 'CEREBRITO' : 'K.O.'}
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
    questionCard: {
        borderRadius: 14,
        paddingVertical: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    questionText: {
        fontSize: 38,
        fontWeight: '900',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    optionButton: {
        width: '48%',
        minHeight: 78,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
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
