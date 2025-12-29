import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getHighScores, saveScore, HighScoreEntry } from '@/utils/HighScoreManager';
import HighScoreModal from '@/components/game/HighScoreModal';

const { width } = Dimensions.get('window');

interface ReflexDuelProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
    currentPlayer?: string;
}

export default function ReflexDuel({ visible, onClose, colors, currentPlayer = 'Jugador' }: ReflexDuelProps) {
    const GAME_ID = 'reflex_duel';
    const [gameState, setGameState] = useState<'start' | 'waiting' | 'bang' | 'won' | 'lost' | 'early'>('start');
    const [reactionTime, setReactionTime] = useState(0);

    // High Score State
    const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
    const [showHighScores, setShowHighScores] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);

    // Timer refs
    const waitTimerRef = useRef<any>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        if (visible) {
            resetGame();
            loadScores();
        }
    }, [visible]);

    const loadScores = async () => {
        const scores = await getHighScores(GAME_ID);
        setHighScores(scores);
    };

    const resetGame = () => {
        setGameState('start');
        setReactionTime(0);
        setIsNewRecord(false);
        clearTimers();
    };

    const clearTimers = () => {
        if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
    };

    const startGame = () => {
        setGameState('waiting');
        const randomDelay = Math.random() * 3000 + 2000; // 2-5 seconds

        waitTimerRef.current = setTimeout(() => {
            setGameState('bang');
            startTimeRef.current = Date.now();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, randomDelay);
    };

    const handleTap = async () => {
        if (gameState === 'start') {
            startGame();
            return;
        }

        if (gameState === 'waiting') {
            // FALSE START
            clearTimers();
            setGameState('early');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (gameState === 'bang') {
            // SUCCESS
            const endTime = Date.now();
            const time = endTime - startTimeRef.current;
            setReactionTime(time);

            if (time < 500) {
                setGameState('won');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Save High Score (Lower is better)
                const isRecord = await saveScore(GAME_ID, {
                    playerName: currentPlayer,
                    score: time,
                    date: new Date().toISOString()
                }, false);

                if (isRecord) {
                    setIsNewRecord(true);
                    loadScores();
                }

            } else {
                setGameState('lost'); // Too slow!
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
        }
    };

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setShowHighScores(true)} style={styles.recordButton}>
                            <FontAwesome name="trophy" size={20} color={colors.gold} />
                            <Text style={[styles.recordButtonText, { color: colors.gold }]}> Récords</Text>
                        </TouchableOpacity>

                        <Text style={[styles.title, { color: colors.text }]}>DUELO VAQUERO 🤠</Text>
                        <TouchableOpacity onPress={() => onClose(gameState === 'won')}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.gameArea,
                            {
                                backgroundColor:
                                    gameState === 'waiting' ? '#333' :
                                        gameState === 'bang' ? '#4CD964' :
                                            gameState === 'early' ? '#FF3B30' :
                                                gameState === 'lost' ? '#FF9500' :
                                                    colors.cardBackground
                            }
                        ]}
                        activeOpacity={1}
                        onPress={handleTap}
                    >
                        {gameState === 'start' && (
                            <Text style={styles.mainText}>TOCA PARA EMPEZAR</Text>
                        )}
                        {gameState === 'waiting' && (
                            <Text style={styles.mainText}>ESPERA... 🤫</Text>
                        )}
                        {gameState === 'bang' && (
                            <Text style={[styles.mainText, { fontSize: 60 }]}>¡BANG! 💥</Text>
                        )}

                        {/* RESULTS */}
                        {gameState === 'early' && (
                            <View style={styles.resultBox}>
                                <Text style={styles.resultTitle}>¡FALSA SALIDA!</Text>
                                <Text style={styles.resultDesc}>Demasiado ansioso, forastero. Bebe.</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
                                    <Text style={styles.btnText}>REINTENTAR</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {gameState === 'won' && (
                            <View style={styles.resultBox}>
                                {isNewRecord && (
                                    <View style={styles.newRecordBadge}>
                                        <FontAwesome name="star" size={16} color="white" />
                                        <Text style={styles.newRecordText}> ¡NUEVO RÉCORD! </Text>
                                        <FontAwesome name="star" size={16} color="white" />
                                    </View>
                                )}
                                <Text style={styles.resultTitle}>¡RÁPIDO!</Text>
                                <Text style={styles.timeText}>{reactionTime}ms</Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={() => onClose(true)}
                                >
                                    <Text style={styles.btnText}>ACEPTAR</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {gameState === 'lost' && (
                            <View style={styles.resultBox}>
                                <Text style={styles.resultTitle}>¡LENTO!</Text>
                                <Text style={styles.timeText}>{reactionTime}ms</Text>
                                <Text style={styles.resultDesc}>Has sido una tortuga. Bebe.</Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={() => onClose(false)}
                                >
                                    <Text style={styles.btnText}>ACEPTAR</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </TouchableOpacity>

                    {gameState === 'start' && (
                        <Text style={{ marginTop: 20, color: colors.text, textAlign: 'center' }}>
                            Espera a ver la pantalla VERDE y toca lo más rápido posible.
                        </Text>
                    )}
                </View>

                {/* HIGH SCORE MODAL */}
                <HighScoreModal
                    visible={showHighScores}
                    onClose={() => setShowHighScores(false)}
                    highScores={highScores}
                    gameName="Reflex Duel"
                    colors={colors}
                    isHigherBetter={false} // Lower Time (ms) is better
                />

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
        minHeight: 500,
        height: '70%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    recordButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    gameArea: {
        flex: 1,
        width: '100%',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    mainText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
    },
    resultBox: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        width: '80%'
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10
    },
    timeText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10
    },
    resultDesc: {
        color: 'white',
        marginBottom: 20,
        textAlign: 'center'
    },
    retryButton: {
        backgroundColor: 'white',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25
    },
    btnText: {
        fontWeight: 'bold',
        color: 'black'
    },
    newRecordBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 10
    },
    newRecordText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14
    }
});
