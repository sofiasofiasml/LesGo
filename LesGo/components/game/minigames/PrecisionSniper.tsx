import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { getHighScores, saveScore, HighScoreEntry } from '@/utils/HighScoreManager';
import HighScoreModal from '@/components/game/HighScoreModal';

interface PrecisionSniperProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
    currentPlayer?: string;
}

export default function PrecisionSniper({ visible, onClose, colors, currentPlayer = 'Jugador' }: PrecisionSniperProps) {
    const GAME_ID = 'precision_sniper';
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [gameState, setGameState] = useState<'intro' | 'running' | 'stopped'>('intro');
    const [resultMessage, setResultMessage] = useState<string>('');
    const startTimeRef = useRef<number>(0);
    const requestRef = useRef<number | undefined>(undefined);

    // High Score State
    const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
    const [showHighScores, setShowHighScores] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);

    // Constants
    const TARGET = 5.00;
    const TOLERANCE = 0.05; // 4.95 to 5.05

    useEffect(() => {
        if (visible) {
            resetGame();
            loadScores();
        } else {
            stopLoop();
        }
        return () => stopLoop();
    }, [visible]);

    const loadScores = async () => {
        const scores = await getHighScores(GAME_ID);
        setHighScores(scores);
    };

    const resetGame = () => {
        setGameState('intro');
        setCurrentTime(0);
        setResultMessage('');
        setIsRunning(false);
        setIsNewRecord(false);
    };

    const runLoop = () => {
        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000;

        // Loop continuously 0->10
        const displayTime = elapsed % 10;

        setCurrentTime(displayTime);
        requestRef.current = requestAnimationFrame(runLoop);
    };

    const stopLoop = () => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = undefined;
        }
    };

    const handleStart = () => {
        setGameState('running');
        setIsRunning(true);
        startTimeRef.current = Date.now();
        runLoop();
    };

    const handleStop = async () => {
        stopLoop();
        setIsRunning(false);
        setGameState('stopped');

        const diff = Math.abs(currentTime - TARGET);
        const isSuccess = diff <= TOLERANCE;

        if (isSuccess) {
            setResultMessage('¡IMPRESIONANTE!\n(🎯 DIANA 🎯)');

            // Save High Score (Difference from 5.00s, lower is better)
            // We save the diff with precision
            const scoreToSave = parseFloat(diff.toFixed(3));
            const isRecord = await saveScore(GAME_ID, {
                playerName: currentPlayer,
                score: scoreToSave,
                date: new Date().toISOString()
            }, false); // False = Lower (diff) is better

            if (isRecord) {
                setIsNewRecord(true);
                loadScores();
            }

        } else {
            const status = currentTime < TARGET ? 'Demasiado pronto' : 'Te pasaste';
            setResultMessage(`¡FALLO!\n${status} (${diff.toFixed(3)}s)`);
        }
    };

    const handleClose = () => {
        const diff = Math.abs(currentTime - TARGET);
        onClose(diff <= TOLERANCE);
    };

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground, borderColor: colors.pink }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>EL FRANCOTIRADOR</Text>
                        <TouchableOpacity onPress={() => onClose(false)} style={styles.closeBtn}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => setShowHighScores(true)} style={styles.recordButton}>
                        <FontAwesome name="trophy" size={20} color={colors.gold} />
                        <Text style={[styles.recordButtonText, { color: colors.gold }]}> Récords</Text>
                    </TouchableOpacity>

                    <Text style={[styles.targetText, { color: colors.lightOrange }]}>OBJETIVO: 5.00s</Text>

                    <View style={styles.counterContainer}>
                        <Text style={[styles.counter, { color: isRunning ? colors.pink : colors.text }]}>
                            {currentTime.toFixed(2)}
                        </Text>
                        <Text style={[styles.unit, { color: colors.text }]}>seg</Text>
                    </View>

                    {gameState === 'stopped' && (
                        <View style={styles.resultContainer}>
                            {isNewRecord && (
                                <View style={styles.newRecordBadge}>
                                    <FontAwesome name="star" size={16} color="white" />
                                    <Text style={styles.newRecordText}> ¡NUEVO RÉCORD! </Text>
                                    <FontAwesome name="star" size={16} color="white" />
                                </View>
                            )}
                            <Text style={[
                                styles.result,
                                { color: Math.abs(currentTime - TARGET) <= TOLERANCE ? '#4CAF50' : '#F44336' }
                            ]}>
                                {resultMessage}
                            </Text>
                        </View>
                    )}

                    {gameState === 'intro' && (
                        <TouchableOpacity style={[styles.button, { backgroundColor: colors.pink }]} onPress={handleStart}>
                            <Text style={styles.buttonText}>INICIAR</Text>
                        </TouchableOpacity>
                    )}

                    {gameState === 'running' && (
                        <TouchableOpacity
                            style={[styles.bigButton, { backgroundColor: '#F44336' }]}
                            onPress={handleStop}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="target" size={60} color="white" />
                            <Text style={styles.bigButtonText}>¡DISPARAR!</Text>
                        </TouchableOpacity>
                    )}

                    {gameState === 'stopped' && (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.cardBackground }]}
                            onPress={handleClose}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>
                                {Math.abs(currentTime - TARGET) <= TOLERANCE ? 'COBRAR PREMIO' : 'ASUMIR DERROTA'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* HIGH SCORE MODAL */}
                <HighScoreModal
                    visible={showHighScores}
                    onClose={() => setShowHighScores(false)}
                    highScores={highScores}
                    gameName="Francotirador"
                    colors={colors}
                    isHigherBetter={false} // Diff from 5.00s (lower is better)
                    unit="s"
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        padding: 25,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        position: 'relative'
    },
    closeBtn: {
        position: 'absolute',
        right: 0,
        padding: 5
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        marginBottom: 10,
        alignSelf: 'center'
    },
    recordButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    targetText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30,
        letterSpacing: 1,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 30,
    },
    counter: {
        fontSize: 80,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    unit: {
        fontSize: 20,
        marginBottom: 15,
        marginLeft: 5,
        fontWeight: 'bold',
    },
    resultContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    result: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    button: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    bigButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        borderWidth: 4,
        borderColor: 'white',
    },
    bigButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 24,
        marginTop: 10,
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
