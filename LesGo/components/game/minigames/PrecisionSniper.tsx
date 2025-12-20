import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PrecisionSniperProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function PrecisionSniper({ visible, onClose, colors }: PrecisionSniperProps) {
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [gameState, setGameState] = useState<'intro' | 'running' | 'stopped'>('intro');
    const [resultMessage, setResultMessage] = useState<string>('');
    const startTimeRef = useRef<number>(0);
    const requestRef = useRef<number | undefined>(undefined);

    // Constants
    const TARGET = 5.00;
    const TOLERANCE = 0.05; // 4.95 to 5.05

    useEffect(() => {
        if (visible) {
            resetGame();
        } else {
            stopLoop();
        }
        return () => stopLoop();
    }, [visible]);

    const resetGame = () => {
        setGameState('intro');
        setCurrentTime(0);
        setResultMessage('');
        setIsRunning(false);
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

    const handleStop = () => {
        stopLoop();
        setIsRunning(false);
        setGameState('stopped');

        const diff = Math.abs(currentTime - TARGET);
        const isSuccess = diff <= TOLERANCE;

        if (isSuccess) {
            setResultMessage('¡IMPRESIONANTE!\n(🎯 DIANA 🎯)');
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
                    <Text style={[styles.title, { color: colors.text }]}>EL FRANCOTIRADOR</Text>

                    <Text style={[styles.targetText, { color: colors.lightOrange }]}>OBJETIVO: 5.00s</Text>

                    <View style={styles.counterContainer}>
                        <Text style={[styles.counter, { color: isRunning ? colors.pink : colors.text }]}>
                            {currentTime.toFixed(2)}
                        </Text>
                        <Text style={[styles.unit, { color: colors.text }]}>seg</Text>
                    </View>

                    {gameState === 'stopped' && (
                        <Text style={[
                            styles.result,
                            { color: Math.abs(currentTime - TARGET) <= TOLERANCE ? '#4CAF50' : '#F44336' }
                        ]}>
                            {resultMessage}
                        </Text>
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
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
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
    result: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
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
});
